const { hasRedis, redisPipeline } = require("./_lib/upstash");

const CITY_POOL = [
  "北京",
  "天津",
  "石家庄",
  "唐山",
  "保定",
  "邯郸",
  "廊坊",
  "秦皇岛",
  "沧州",
  "邢台",
  "太原",
  "呼和浩特",
  "包头",
  "鄂尔多斯",
  "沈阳",
  "大连",
  "长春",
  "哈尔滨",
  "鞍山",
  "吉林",
  "大庆",
  "上海",
  "南京",
  "苏州",
  "杭州",
  "宁波",
  "无锡",
  "常州",
  "南通",
  "徐州",
  "扬州",
  "镇江",
  "泰州",
  "盐城",
  "连云港",
  "宿迁",
  "淮安",
  "嘉兴",
  "绍兴",
  "温州",
  "金华",
  "台州",
  "湖州",
  "丽水",
  "合肥",
  "芜湖",
  "马鞍山",
  "滁州",
  "安庆",
  "福州",
  "厦门",
  "泉州",
  "漳州",
  "莆田",
  "济南",
  "青岛",
  "烟台",
  "潍坊",
  "临沂",
  "济宁",
  "淄博",
  "威海",
  "泰安",
  "武汉",
  "郑州",
  "长沙",
  "南昌",
  "洛阳",
  "新乡",
  "商丘",
  "许昌",
  "南阳",
  "襄阳",
  "宜昌",
  "荆州",
  "株洲",
  "岳阳",
  "衡阳",
  "常德",
  "九江",
  "赣州",
  "上饶",
  "宜春",
  "广州",
  "深圳",
  "佛山",
  "东莞",
  "珠海",
  "中山",
  "惠州",
  "汕头",
  "江门",
  "湛江",
  "肇庆",
  "南宁",
  "桂林",
  "柳州",
  "海口",
  "三亚",
  "重庆",
  "成都",
  "昆明",
  "贵阳",
  "绵阳",
  "南充",
  "宜宾",
  "遵义",
  "曲靖",
  "大理",
  "泸州",
  "德阳",
  "乐山",
  "西安",
  "兰州",
  "银川",
  "西宁",
  "乌鲁木齐",
  "咸阳",
  "宝鸡",
  "榆林",
  "渭南",
  "天水",
];

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
