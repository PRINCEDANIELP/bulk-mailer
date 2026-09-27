const nodemailer = require("nodemailer");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Detects which transport mode to use based on environment variables:
 *
 *  1. RESEND_API_KEY is set          → Resend HTTP API (production)
 *  2. EMAIL_HOST is set              → Brevo / custom SMTP host
 *  3. Gmail credentials present      → Gmail SMTP with App Password
 *  4. Fallback                       → Ethereal auto test account (sandbox for dev)
 */
async function buildTransporter() {
  const fromName = process.env.EMAIL_FROM_NAME || "Bulk Mailer";
  const emailUser = (process.env.EMAIL_USER || "").trim();
  const emailPass = (process.env.EMAIL_PASS || "").replace(/\s+/g, "");

  // --- 1. Resend API ---
  if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes("re_your")) {
    return { mode: "resend", fromName };
  }

  // --- 2. Brevo / custom SMTP host ---
  if (
    process.env.EMAIL_HOST &&
    process.env.EMAIL_HOST.trim() &&
    emailUser &&
    !emailUser.includes("your_brevo") &&
    emailPass &&
    !emailPass.includes("your_brevo")
  ) {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST.trim(),
      port: parseInt(process.env.EMAIL_PORT || "587", 10),
      secure: process.env.EMAIL_PORT === "465",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
    return {
      mode: "smtp",
      transporter,
      from: `"${fromName}" <${emailUser}>`,
      replyTo: emailUser,
    };
  }

  // --- 3. Gmail (handles both EMAIL_SERVICE=gmail or any @gmail.com address) ---
  const isGmail =
    (process.env.EMAIL_SERVICE === "gmail" || emailUser.toLowerCase().endsWith("@gmail.com")) &&
    emailUser &&
    !emailUser.includes("your_") &&
    emailPass &&
    !emailPass.includes("your_");

  if (isGmail) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: emailUser, pass: emailPass },
    });
    return {
      mode: "smtp",
      transporter,
      from: `"${fromName}" <${emailUser}>`,
      replyTo: emailUser,
    };
  }

  // --- 4. Ethereal fallback test account ---
  const testAccount = await nodemailer.createTestAccount();
  console.log("\n📬 No real sender credentials configured in server/.env — running in Ethereal test sandbox");
  console.log(`   User: ${testAccount.user}\n`);

  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
  return {
    mode: "ethereal",
    transporter,
    from: `"Bulk Mailer Test" <${testAccount.user}>`,
    replyTo: testAccount.user,
  };
}

async function sendBulkMail({ subject, body, recipients }) {
  const config = await buildTransporter();
  const successRecipients = [];
  const failedRecipients = [];
  const previewUrls = [];

  // Plain text fallback (essential for high deliverability so Gmail does not treat as spam)
  const plainText = body
    .replace(/<br\s*[\/]?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]*>/g, "")
    .trim();

  // ── Resend API path ──
  if (config.mode === "resend") {
    const { Resend } = require("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromDomain = process.env.RESEND_FROM || `${config.fromName} <onboarding@resend.dev>`;

    for (let i = 0; i < recipients.length; i++) {
      const to = recipients[i];
      if (i > 0) await sleep(500);
      try {
        await resend.emails.send({
          from: fromDomain,
          to,
          subject,
          text: plainText || body,
          html: body,
        });
        successRecipients.push(to);
        console.log(`✅ Sent to ${to} via Resend`);
      } catch (err) {
        console.error(`❌ Resend failed for ${to}:`, err.message);
        failedRecipients.push(to);
      }
    }
    return { mode: "resend", successRecipients, failedRecipients, previewUrls };
  }

  // ── SMTP (Gmail / Brevo) or Ethereal sandbox path ──
  for (let i = 0; i < recipients.length; i++) {
    const to = recipients[i];
    // Gentle throttle to avoid spam filters and Google rate-limits
    if (i > 0 && config.mode === "smtp") {
      await sleep(800);
    }

    try {
      const info = await config.transporter.sendMail({
        from: config.from,
        to,
        replyTo: config.replyTo,
        subject,
        text: plainText || body,
        html: body,
      });

      successRecipients.push(to);

      if (config.mode === "ethereal") {
        const url = nodemailer.getTestMessageUrl(info);
        previewUrls.push({ to, url });
        console.log(`ℹ️ [Test Sandbox] Mail to ${to} preview: ${url}`);
      } else {
        console.log(`✅ Real email delivered to ${to} (MessageId: ${info.messageId})`);
      }
    } catch (err) {
      console.error(`❌ Failed to send to ${to}:`, err.message);
      failedRecipients.push(to);
    }
  }

  return {
    mode: config.mode,
    successRecipients,
    failedRecipients,
    previewUrls,
  };
}

module.exports = { sendBulkMail };
