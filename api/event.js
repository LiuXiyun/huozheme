const { hasRedis, pushEvent } = require("./_lib/upstash");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body || {};
    await pushEvent({
      type: sanitize(body.type, 40),
      sessionId: sanitize(body.sessionId, 80),
      shareId: sanitize(body.shareId, 80),
      entryShareId: sanitize(body.entryShareId, 80),
      theme: sanitize(body.theme, 40),
      city: sanitize(body.city, 40),
      score: Number.isFinite(Number(body.score)) ? Number(body.score) : undefined,
      scoreBucket: Number.isFinite(Number(body.scoreBucket)) ? Number(body.scoreBucket) : undefined,
      template: sanitize(body.template, 40),
      tone: sanitize(body.tone, 40),
      source: sanitize(body.source, 80),
      action: sanitize(body.action, 120),
      question: sanitize(body.question, 80),
      answer: sanitize(body.answer, 120),
      elapsedMs: Number.isFinite(Number(body.elapsedMs)) ? Number(body.elapsedMs) : undefined,
      referrer: sanitize(body.referrer, 240),
      path: sanitize(body.path, 120),
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
