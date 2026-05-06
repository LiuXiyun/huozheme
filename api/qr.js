const QRCode = require("qrcode");

const THIRD_PARTY_QR_ENDPOINT = "https://api.qrserver.com/v1/create-qr-code/";

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const data = sanitize(req.query?.data || "", 500);
  if (!data || !/^https?:\/\//.test(data)) {
    return res.status(400).json({ error: "Invalid QR data" });
  }

  try {
    const thirdParty = await fetchThirdPartyQr(data);
    if (thirdParty) {
      return res.status(200).json({ dataUrl: thirdParty, source: "qrserver" });
    }
    const fallback = await buildLocalQr(data);
    return res.status(200).json({ dataUrl: fallback, source: "local" });
  } catch {
    try {
      const fallback = await buildLocalQr(data);
      return res.status(200).json({ dataUrl: fallback, source: "local" });
    } catch {
      return res.status(200).json({ dataUrl: "", source: "none" });
    }
  }
};

async function fetchThirdPartyQr(data) {
  const url = new URL(THIRD_PARTY_QR_ENDPOINT);
  url.searchParams.set("data", data);
  url.searchParams.set("size", "220x220");
  url.searchParams.set("format", "png");
  url.searchParams.set("ecc", "M");
  url.searchParams.set("qzone", "1");
  url.searchParams.set("color", "111317");
  url.searchParams.set("bgcolor", "f8f4e8");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2200);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "huozheme-qr-proxy/1.0",
      },
    });
    if (!response.ok) return "";
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("image/")) return "";
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    return `data:${contentType.split(";")[0]};base64,${base64}`;
  } finally {
    clearTimeout(timer);
  }
}

function buildLocalQr(data) {
  return QRCode.toDataURL(data, {
    errorCorrectionLevel: "M",
    margin: 1,
    scale: 6,
    color: {
      dark: "#111317",
      light: "#f8f4e8",
    },
  });
}

function sanitize(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}
