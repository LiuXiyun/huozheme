const hasRedis = () => Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

async function redisCommand(command) {
  if (!hasRedis()) return null;
  const url = process.env.UPSTASH_REDIS_REST_URL.replace(/\/$/, "");
  const response = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([command]),
  });

  if (!response.ok) {
    throw new Error(`Upstash ${response.status}`);
  }

  const data = await response.json();
  return data?.[0]?.result;
}

async function redisPipeline(commands) {
  if (!hasRedis()) return null;
  const url = process.env.UPSTASH_REDIS_REST_URL.replace(/\/$/, "");
  const response = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
  });

  if (!response.ok) {
    throw new Error(`Upstash ${response.status}`);
  }

  return response.json();
}

async function getJson(key) {
  const value = await redisCommand(["GET", key]);
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

async function setJson(key, value, ttlSeconds) {
  const payload = JSON.stringify(value);
  if (ttlSeconds) {
    return redisCommand(["SET", key, payload, "EX", ttlSeconds]);
  }
  return redisCommand(["SET", key, payload]);
}

async function pushEvent(event) {
  const day = new Date().toISOString().slice(0, 10);
  const payload = JSON.stringify({ ...event, serverTime: new Date().toISOString() });
  await redisCommand(["LPUSH", `huozheme:events:${day}`, payload]);
  await redisCommand(["LTRIM", `huozheme:events:${day}`, "0", "4999"]);
  await redisCommand(["HINCRBY", `huozheme:counters:${day}`, event.type || "unknown", "1"]);
  if (event.theme) {
    await redisCommand(["HINCRBY", `huozheme:theme:${day}`, event.theme, "1"]);
  }
}

module.exports = {
  getJson,
  hasRedis,
  pushEvent,
  redisPipeline,
  setJson,
};
