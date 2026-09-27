const mongoose = require("mongoose");

const emailLogSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    body: { type: String, required: true },
    recipients: [{ type: String, required: true }],
    successCount: { type: Number, default: 0 },
    failCount: { type: Number, default: 0 },
    failedRecipients: [{ type: String }],
    status: {
      type: String,
      enum: ["success", "partial", "failed"],
      default: "failed",
    },
    sentBy: { type: String, default: "admin" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmailLog", emailLogSchema);
