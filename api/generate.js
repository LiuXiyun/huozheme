const { getJson, hasRedis, pushEvent, setJson } = require("./_lib/upstash");

const SYSTEM_PROMPT = `你是《活着么》的结果文案引擎。生成中文黑色幽默内容，但必须像朋友聊天一样短、顺口、好懂、真诚。禁止使用“人格、诊断、观察率、状态位置、系统检测、模型、样本、回流、传播、完整版、关系图”等内部词；不要复杂复合名词，不要 AI 腔，不要主动劝分享。优先说“今日电量、今天最耗你、先做一件小事”。可以用日常物件比喻，比如充电宝、小风扇、插线板、保温杯。不要恐吓、不要医疗判断、不要自伤暗示、不要承诺准确性。只输出 JSON。`;

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
            task: "基于用户今日测试结果，生成一组适合结果卡展示、读起来顺口的人话文案。",
            requiredShape: {
              title: "不超过10字的状态标题，像一句人话",
              roast: "25-45字吐槽，具体、短句、不绕",
              advice: "20-38字今日建议，只给一个可做的小动作",
              cause: "4-8字今天最耗用户的事",
              revive: "4-10字用户可以先做的小事",
              premiumPeek: "28-45字隐藏内容预览，说明谁懂用户、谁能帮用户回血，必须具体好懂",
              shareLines: {
                soft: ["3条轻吐槽结果短句，每条22-38字"],
                sharp: ["3条真实一点的结果短句，每条22-38字"],
                black: ["3条黑色幽默结果短句，每条22-38字"],
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
