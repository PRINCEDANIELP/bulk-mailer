const XLSX = require("xlsx");

const EMAIL_MATCH_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const STRICT_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Pull every plausible email address out of a block of free text.
 */
function extractFromText(text = "") {
  if (!text) return [];
  const matches = String(text).match(EMAIL_MATCH_REGEX);
  return matches || [];
}

/**
 * Read an uploaded Excel/CSV file (buffer from multer memory storage) and
 * extract every email address across all sheets, columns, rows, and hyperlinks.
 */
function extractFromSpreadsheet(fileBuffer) {
  if (!fileBuffer) return [];
  try {
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    const found = [];

    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      if (!sheet) return;

      // 1. Scan cell objects directly (includes hyperlinks, raw & formatted text)
      for (const key in sheet) {
        if (key.startsWith("!")) continue;
        const cell = sheet[key];
        if (!cell) continue;

        if (cell.w) {
          const matches = String(cell.w).match(EMAIL_MATCH_REGEX);
          if (matches) found.push(...matches);
        }
        if (cell.v != null && String(cell.v) !== String(cell.w)) {
          const matches = String(cell.v).match(EMAIL_MATCH_REGEX);
          if (matches) found.push(...matches);
        }
        if (cell.l && cell.l.Target) {
          const matches = String(cell.l.Target).match(EMAIL_MATCH_REGEX);
          if (matches) found.push(...matches);
        }
      }

      // 2. Also scan via sheet_to_json as backup for formulas & complex sheets
      try {
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: "" });
        rows.forEach((row) => {
          if (Array.isArray(row)) {
            row.forEach((cellVal) => {
              if (cellVal != null) {
                const matches = String(cellVal).match(EMAIL_MATCH_REGEX);
                if (matches) found.push(...matches);
              }
            });
          }
        });
      } catch (e) {
        // ignore fallback errors
      }
    });

    return found;
  } catch (err) {
    console.error("Spreadsheet parse error:", err);
    return [];
  }
}

/**
 * Combine manually typed recipients + spreadsheet upload, validate,
 * deduplicate (case-insensitively), and split into valid / invalid lists.
 */
function buildRecipientList({ manualText, fileBuffer }) {
  const raw = [
    ...extractFromText(manualText),
    ...(fileBuffer ? extractFromSpreadsheet(fileBuffer) : []),
  ];

  const seen = new Set();
  const valid = [];
  const invalid = [];

  raw.forEach((address) => {
    const clean = String(address).trim().toLowerCase();
    if (!STRICT_EMAIL_REGEX.test(clean)) {
      if (clean) invalid.push(clean);
      return;
    }
    if (!seen.has(clean)) {
      seen.add(clean);
      valid.push(clean);
    }
  });

  return { valid, invalid };
}

module.exports = {
  buildRecipientList,
  extractFromSpreadsheet,
  extractFromText,
  EMAIL_REGEX: STRICT_EMAIL_REGEX,
};
