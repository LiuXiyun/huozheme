const { hasRedis, pushEvent } = require("./_lib/upstash");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body || {};
    await pushEvent({
      type: sanitize(body.type, 40),
      theme: sanitize(body.theme, 40),
      city: sanitize(body.city, 40),
      score: Number.isFinite(Number(body.score)) ? Number(body.score) : undefined,
      template: sanitize(body.template, 40),
      tone: sanitize(body.tone, 40),
      clientTime: sanitize(body.clientTime, 40),
    });
    return res.status(200).json({ ok: true, persisted: hasRedis() });
  } catch {
    return res.status(200).json({ ok: true, persisted: false });
  }
};

function sanitize(value, maxLength) {
  if (value === undefined || value === null) return undefined;
  return String(value).slice(0, maxLength);
}
