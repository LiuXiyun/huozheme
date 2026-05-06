const { getJson, hasRedis, pushEvent, setJson } = require("./_lib/upstash");

const THEME_CONTEXT = {
  worker: "打工人：会议、通勤、老板消息、工资、绩效、加班、周报、工位情绪",
  student: "大学生：早八、ddl、考试、舍友、食堂、小组作业、生活费、未来焦虑",
  solo: "独居人：外卖、房间、深夜、家务、沉默、社交掉线、生活自理",
  freelance: "自由职业：客户、报价、收款、自律、改稿、现金流、边界感、项目机会",
};

const SYSTEM_PROMPT = `你是《活着么》的题库生成器。生成中文娱乐问卷题，不要医疗诊断、不要恐吓、不要自伤内容、不要收集隐私。只输出 JSON。`;

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const theme = sanitizeTheme(req.query?.theme || "worker");
    const city = sanitizeText(req.query?.city || "全国", 20);
    const dateKey = new Date().toISOString().slice(0, 10);
    const cacheKey = `huozheme:questions:${dateKey}:${theme}:${city}`;

    const cached = await getJson(cacheKey);
    if (cached?.questions?.length) {
      await safeEvent({ type: "question_cache_hit", theme });
      return res.status(200).json({ source: "cache", questions: cached.questions, persisted: hasRedis() });
    }

    if (!process.env.DEEPSEEK_API_KEY) {
      await safeEvent({ type: "question_skipped", theme });
      return res.status(200).json({ source: "fallback", questions: [], persisted: hasRedis() });
    }

    const questions = await callDeepSeek({ theme, city });
    await setJson(cacheKey, { questions }, 60 * 60 * 20);
    await safeEvent({ type: "question_generated", theme });
    return res.status(200).json({ source: "deepseek", questions, persisted: hasRedis() });
  } catch {
    return res.status(200).json({ source: "fallback", questions: [], error: "question_generation_failed" });
  }
};

async function callDeepSeek({ theme, city }) {
  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL || "deepseek-v4-flash",
      temperature: 0.95,
      max_tokens: 3500,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: JSON.stringify({
            task: "为《活着么》生成每日题库池。题目要短、好笑、有代入感，每题4个选项，分值从高能量到低能量分布。value 必须是数字，不要字符串。",
            themeContext: THEME_CONTEXT[theme],
            city,
            requiredShape: {
              questions: [
                {
                  id: "英文小写短id",
                  dimension: "2-5字维度名",
                  title: "不超过18字的问题",
                  options: [
                    { label: "不超过16字选项", value: 15 },
                    { label: "不超过16字选项", value: 5 },
                    { label: "不超过16字选项", value: -10 },
                    { label: "不超过16字选项", value: -18 },
                  ],
                },
              ],
            },
            count: 12,
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
  return normalizeQuestions(JSON.parse(content).questions);
}

function normalizeQuestions(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((question, index) => ({
      id: sanitizeId(question.id || `ai_${index}`),
      dimension: sanitizeText(question.dimension, 8),
      title: sanitizeText(question.title, 24),
      options: normalizeOptions(question.options),
    }))
    .filter((question) => question.dimension && question.title && question.options.length === 4)
    .slice(0, 12);
}

function normalizeOptions(options) {
  if (!Array.isArray(options)) return [];
  return options
    .map((option) => ({
      label: sanitizeText(option.label, 22),
      value: clamp(Number(option.value), -24, 18),
    }))
    .filter((option) => option.label && Number.isFinite(option.value))
    .slice(0, 4);
}

function sanitizeTheme(value) {
  return Object.prototype.hasOwnProperty.call(THEME_CONTEXT, value) ? value : "worker";
}

function sanitizeId(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .slice(0, 24);
}

function sanitizeText(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function clamp(value, min, max) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(min, Math.min(max, Math.round(value)));
}

async function safeEvent(event) {
  try {
    await pushEvent(event);
  } catch {
    // Question generation should not fail because analytics failed.
  }
}
