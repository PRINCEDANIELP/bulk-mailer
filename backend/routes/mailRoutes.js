const express = require("express");
const multer = require("multer");
const EmailLog = require("../models/EmailLog");
const requireAuth = require("../middleware/auth");
const { buildRecipientList } = require("../utils/parseRecipients");
const { sendBulkMail } = require("../utils/mailer");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/mail/send  (multipart/form-data: subject, body, recipients, file)
router.post("/send", requireAuth, upload.single("file"), async (req, res) => {
  const { subject, body, recipients: manualText } = req.body;

  if (!subject || !body) {
    return res.status(400).json({ message: "Subject and email body are required." });
  }

  const { valid, invalid } = buildRecipientList({
    manualText,
    fileBuffer: req.file ? req.file.buffer : null,
  });

  if (valid.length === 0) {
    return res.status(400).json({
      message: "No valid recipient email addresses were found in your text or file.",
      invalid,
    });
  }

  try {
    const { mode, successRecipients, failedRecipients, previewUrls } = await sendBulkMail({
      subject,
      body,
      recipients: valid,
    });

    let status = "failed";
    if (successRecipients.length === valid.length) status = "success";
    else if (successRecipients.length > 0) status = "partial";

    const log = await EmailLog.create({
      subject,
      body,
      recipients: valid,
      successCount: successRecipients.length,
      failCount: failedRecipients.length,
      failedRecipients,
      status,
    });

    let message = "";
    if (mode === "ethereal") {
      message = `⚠️ [TEST MODE]: Simulated delivery to ${successRecipients.length} address(es) via Ethereal sandbox. Real emails were NOT sent because sender credentials (EMAIL_USER / EMAIL_PASS) are not yet configured in server/.env.`;
    } else if (status === "success") {
      message = `✅ Real email successfully delivered to all ${successRecipients.length} recipient(s)!`;
    } else if (status === "partial") {
      message = `Delivered to ${successRecipients.length} of ${valid.length} recipient(s). ${failedRecipients.length} failed.`;
    } else {
      message = "Sending failed for every recipient. Check your sender credentials in server/.env.";
    }

    res.status(status === "failed" ? 502 : 200).json({
      message,
      isTestMode: mode === "ethereal",
      deliveryMode: mode,
      totalRecipients: valid.length,
      recipients: valid,
      log,
      skippedInvalidAddresses: invalid,
      previewUrls: previewUrls || [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unexpected error while sending mail." });
  }
});

// GET /api/mail/history
router.get("/history", requireAuth, async (req, res) => {
  try {
    const logs = await EmailLog.find().sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load email history." });
  }
});

module.exports = router;
