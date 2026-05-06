const QRCode = require("qrcode");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const data = sanitize(req.query?.data || "", 500);
  if (!data || !/^https?:\/\//.test(data)) {
    return res.status(400).json({ error: "Invalid QR data" });
  }

  try {
    const dataUrl = await QRCode.toDataURL(data, {
      errorCorrectionLevel: "M",
      margin: 1,
      scale: 6,
      color: {
        dark: "#111317",
        light: "#f8f4e8",
      },
    });
    return res.status(200).json({ dataUrl });
  } catch {
    return res.status(200).json({ dataUrl: "" });
  }
};

function sanitize(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}
