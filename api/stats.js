const { hasRedis, redisPipeline } = require("./_lib/upstash");

const CITY_POOL = ["上海", "北京", "深圳", "杭州", "广州", "成都", "武汉", "南京"];

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const day = new Date().toISOString().slice(0, 10);
    const seed = hash(day);
    const baseline = {
      tests: 320 + (seed % 620),
      average: 39 + (seed % 23),
      activeCity: CITY_POOL[seed % CITY_POOL.length],
      saves: 26 + (seed % 80),
      reservations: 8 + (seed % 32),
    };

    if (!hasRedis()) {
      return res.status(200).json({ source: "baseline", ...baseline, real: emptyReal() });
    }

    const data = await redisPipeline([
      ["HGET", `huozheme:counters:${day}`, "complete_test"],
      ["HGET", `huozheme:counters:${day}`, "save_poster"],
      ["HGET", `huozheme:counters:${day}`, "reserve_premium"],
      ["HGETALL", `huozheme:theme:${day}`],
      ["LRANGE", `huozheme:events:${day}`, "0", "199"],
    ]);

    const realTests = toNumber(data?.[0]?.result);
    const realSaves = toNumber(data?.[1]?.result);
    const realReservations = toNumber(data?.[2]?.result);
    const recentEvents = parseEvents(data?.[4]?.result);
    const realAverage = calculateAverage(recentEvents);
    const activeCity = findActiveCity(recentEvents) || baseline.activeCity;

    return res.status(200).json({
      source: "redis",
      tests: baseline.tests + realTests,
      average: realAverage || baseline.average,
      activeCity,
      saves: baseline.saves + realSaves,
      reservations: baseline.reservations + realReservations,
      real: {
        tests: realTests,
        saves: realSaves,
        reservations: realReservations,
        sampledEvents: recentEvents.length,
      },
    });
  } catch {
    const day = new Date().toISOString().slice(0, 10);
    const seed = hash(day);
    return res.status(200).json({
      source: "fallback",
      tests: 320 + (seed % 620),
      average: 39 + (seed % 23),
      activeCity: CITY_POOL[seed % CITY_POOL.length],
      saves: 26 + (seed % 80),
      reservations: 8 + (seed % 32),
      real: emptyReal(),
    });
  }
};

function parseEvents(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      try {
        return JSON.parse(item);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function calculateAverage(events) {
  const scores = events.map((event) => Number(event.score)).filter(Number.isFinite);
  if (!scores.length) return 0;
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}

function findActiveCity(events) {
  const counts = new Map();
  events.forEach((event) => {
    if (!event.city) return;
    counts.set(event.city, (counts.get(event.city) || 0) + 1);
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "";
}

function emptyReal() {
  return { tests: 0, saves: 0, reservations: 0, sampledEvents: 0 };
}

function toNumber(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

function hash(input) {
  let value = 0;
  for (let index = 0; index < input.length; index += 1) {
    value = (value << 5) - value + input.charCodeAt(index);
    value |= 0;
  }
  return Math.abs(value);
}
