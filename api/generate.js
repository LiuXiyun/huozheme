const { getJson, hasRedis, pushEvent, setJson } = require("./_lib/upstash");

const SYSTEM_PROMPT = `你是《活着么》的结果文案引擎。生成中文黑色幽默内容，但必须像正常朋友聊天一样顺口、好懂、有画面感。少用“系统、样本、引擎、回流、诊断、精神存活”等产品术语；可以说“今日电量、状态、类型、朋友匹配”。不要恐吓、不要医疗诊断、不要自伤暗示、不要承诺心理评估准确性。只输出 JSON。`;

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body || {};
    const baseResult = body.baseResult || {};
    const profile = body.profile || {};
    const answers = Array.isArray(body.answers) ? body.answers : [];
    const identity = normalizeIdentity(body.identity || {});
    const tier = baseResult.tier || "mid";
    const answerFingerprint = buildAnswerFingerprint(answers, baseResult.answerSignature);
    const dateKey = new Date().toISOString().slice(0, 10);
    const cacheKey = [
      "huozheme:ai",
      dateKey,
      profile.themeId || "unknown",
      profile.city || "unknown",
      tier,
      Math.floor(Number(baseResult.score || 50) / 10) * 10,
      answerFingerprint,
    ].join(":");

    const cached = await getJson(cacheKey);
    if (cached) {
      await safeEvent({ type: "ai_cache_hit", theme: profile.themeId, score: baseResult.score });
      return res.status(200).json({ source: "cache", result: cached, persisted: hasRedis() });
    }

    if (!process.env.DEEPSEEK_API_KEY) {
      await safeEvent({ type: "ai_skipped", theme: profile.themeId, score: baseResult.score });
      return res.status(200).json({ source: "fallback", result: null, persisted: hasRedis() });
    }

    const aiResult = await callDeepSeek({ profile, answers, baseResult, identity });
    await setJson(cacheKey, aiResult, 60 * 60 * 20);
    await safeEvent({ type: "ai_generated", theme: profile.themeId, score: baseResult.score });
    return res.status(200).json({ source: "deepseek", result: aiResult, persisted: hasRedis() });
  } catch (error) {
    return res.status(200).json({ source: "fallback", result: null, error: "generation_failed" });
  }
};

async function callDeepSeek({ profile, answers, baseResult, identity }) {
  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL || "deepseek-v4-flash",
      temperature: 1.05,
      max_tokens: 900,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: JSON.stringify({
            task: "基于用户今日测试结果和状态类型代码，生成一组适合截图传播、读起来顺口的娱乐化结果文案。",
            requiredShape: {
              title: "不超过12字的状态标题",
              roast: "35-55字毒舌吐槽",
              advice: "25-45字今日建议",
              cause: "4-8字今天最耗用户的事",
              revive: "4-10字用户可以先做的小事",
              premiumPeek: "35-55字完整版关系预览，必须让用户看懂价值",
              shareLines: {
                soft: ["3条轻吐槽分享句，每条30-45字"],
                sharp: ["3条真实一点的分享句，每条30-45字"],
                black: ["3条黑色幽默分享句，每条30-45字"],
              },
            },
            profile,
            answers,
            baseResult,
            identity,
            answerFingerprint,
          }),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek ${response.status}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content || "{}";
  return normalizeAiResult(JSON.parse(content));
}

function normalizeAiResult(value) {
  return {
    title: limit(value.title, 16),
    roast: limit(value.roast, 80),
    advice: limit(value.advice, 70),
    cause: limit(value.cause, 14),
    revive: limit(value.revive, 16),
    premiumPeek: limit(value.premiumPeek, 80),
    shareLines: {
      soft: normalizeLines(value.shareLines?.soft),
      sharp: normalizeLines(value.shareLines?.sharp),
      black: normalizeLines(value.shareLines?.black),
    },
  };
}

function normalizeIdentity(value) {
  return {
    typeCode: limit(value.typeCode, 12),
    typeName: limit(value.typeName, 40),
    variant: limit(value.variant, 30),
    axes: Array.isArray(value.axes)
      ? value.axes
          .map((axis) => ({
            key: limit(axis.key, 20),
            letter: limit(axis.letter, 2),
            choice: limit(axis.choice, 20),
          }))
          .slice(0, 7)
      : [],
  };
}

function normalizeLines(lines) {
  if (!Array.isArray(lines)) return [];
  return lines.map((line) => limit(line, 70)).filter(Boolean).slice(0, 3);
}

function limit(text, maxLength) {
  return String(text || "").trim().slice(0, maxLength);
}

function buildAnswerFingerprint(answers, fallback = "") {
  const text =
    fallback ||
    answers
      .map((answer) => `${answer.question || ""}:${answer.value || 0}:${answer.label || ""}`)
      .join("|");
  return hash(text).toString(36).slice(0, 8);
}

function hash(input) {
  let value = 0;
  const text = String(input || "");
  for (let index = 0; index < text.length; index += 1) {
    value = (value << 5) - value + text.charCodeAt(index);
    value |= 0;
  }
  return Math.abs(value);
}

async function safeEvent(event) {
  try {
    await pushEvent(event);
  } catch {
    // Analytics must never break result generation.
  }
}
