import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";

export default function SendMail() {
  const { token } = useAuth();

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [recipientsText, setRecipientsText] = useState("");
  const [file, setFile] = useState(null);

  const [sending, setSending] = useState(false);
  const [banner, setBanner] = useState(null); // { type: 'success'|'error', text }
  const [previewUrls, setPreviewUrls] = useState([]);
  const [deliveryInfo, setDeliveryInfo] = useState(null);

  function handleFileChange(e) {
    setFile(e.target.files?.[0] || null);
  }

  function resetForm() {
    setSubject("");
    setBody("");
    setRecipientsText("");
    setFile(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBanner(null);
    setPreviewUrls([]);
    setDeliveryInfo(null);

    if (!subject.trim() || !body.trim()) {
      setBanner({ type: "error", text: "Please fill in both the subject and the email body." });
      return;
    }
    if (!recipientsText.trim() && !file) {
      setBanner({
        type: "error",
        text: "Add at least one recipient — type addresses or choose a file (.xlsx, .xls, .csv).",
      });
      return;
    }

    const formData = new FormData();
    formData.append("subject", subject);
    formData.append("body", body);
    formData.append("recipients", recipientsText);
    if (file) formData.append("file", file);

    setSending(true);
    try {
      const data = await api.sendMail(token, formData);
      setDeliveryInfo(data);
      setBanner({
        type: data.isTestMode ? "error" : "success",
        text: data.message,
      });
      if (data.previewUrls && data.previewUrls.length > 0) {
        setPreviewUrls(data.previewUrls);
      }
      resetForm();
    } catch (err) {
      setBanner({ type: "error", text: err.message || "Sending failed." });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="main-panel">
      <h2>Send bulk mail</h2>
      <p className="lede">
        Upload your Excel (.xlsx, .xls) or CSV sheet, or type recipient addresses directly.
        All addresses are automatically extracted, deduplicated, and validated.
      </p>

      {banner && <div className={`banner ${banner.type}`}>{banner.text}</div>}

      {deliveryInfo?.isTestMode && previewUrls.length > 0 && (
        <div className="banner error" style={{ marginTop: 8 }}>
          <strong>⚠️ Running in Test Sandbox Mode (Simulated):</strong>
          <p style={{ margin: "6px 0 10px 0", fontSize: "0.9rem" }}>
            Real emails were <strong>NOT</strong> delivered to recipient inboxes because your real Gmail credentials are not configured in <code>server/.env</code>.
            Add your <code>EMAIL_USER</code> and 16-character <code>EMAIL_PASS</code> to send real emails to all recipients!
          </p>
          <ul style={{ marginTop: 8, paddingLeft: 20 }}>
            {previewUrls.map(({ to, url }) => (
              <li key={to} style={{ marginTop: 4 }}>
                {to} →{" "}
                <a href={url} target="_blank" rel="noreferrer" style={{ color: "inherit", fontWeight: 600 }}>
                  Preview test email in browser ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form className="card" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="subject">Subject</label>
          <input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Important Announcement"
          />
        </div>

        <div className="field">
          <label htmlFor="body">Email body</label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your message here..."
            style={{ minHeight: 160, fontFamily: "var(--font-body)" }}
          />
        </div>

        <div className="recipients-row">
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="recipients">Recipient emails (Optional if using Excel)</label>
            <textarea
              id="recipients"
              value={recipientsText}
              onChange={(e) => setRecipientsText(e.target.value)}
              placeholder={"one@example.com\ntwo@example.com, three@example.com"}
            />
          </div>

          <div className="field" style={{ marginBottom: 0 }}>
            <label>Upload Excel / CSV File</label>
            <div className="file-drop">
              <input
                id="file"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
              />
              <label htmlFor="file">Choose Excel File</label>
              <div className="file-name">
                {file ? file.name : "No file chosen — .xlsx, .xls or .csv"}
              </div>
            </div>
            <small style={{ color: "var(--muted)", marginTop: 4, display: "block" }}>
              Extracts every email ID across all columns, rows, and sheets automatically.
            </small>
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <button className="btn-primary" style={{ width: "auto", padding: "12px 28px" }} disabled={sending}>
            {sending ? "Sending..." : "Send bulk mail"}
          </button>
        </div>
      </form>
    </div>
  );
}
