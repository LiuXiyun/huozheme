const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { URL } = require("node:url");

const rootDir = __dirname;

loadEnv(".env");
loadEnv(".env.local");

const port = Number(process.env.PORT || 4173);

const apiRoutes = {
  "/api/event": require("./api/event"),
  "/api/generate": require("./api/generate"),
  "/api/questions": require("./api/questions"),
  "/api/qr": require("./api/qr"),
  "/api/stats": require("./api/stats"),
};

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    if (apiRoutes[url.pathname]) {
      if (req.method === "OPTIONS") {
        sendCors(res, 204);
        return;
      }
      await handleApi(req, res, url, apiRoutes[url.pathname]);
      return;
    }
    serveStatic(url.pathname, res);
  } catch {
    sendText(res, 500, "Internal Server Error");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`huozheme server listening on http://127.0.0.1:${port}`);
});

async function handleApi(req, res, url, handler) {
  req.query = Object.fromEntries(url.searchParams.entries());
  req.body = await readJsonBody(req);
  const apiRes = createApiResponse(res);
  await handler(req, apiRes);
}

function createApiResponse(res) {
  return {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      const body = JSON.stringify(payload);
      res.writeHead(this.statusCode, {
        "Content-Type": "application/json; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
        ...corsHeaders(),
      });
      res.end(body);
    },
  };
}

function sendCors(res, status) {
  res.writeHead(status, corsHeaders());
  res.end();
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function serveStatic(requestPath, res) {
  const normalizedPath = decodeURIComponent(requestPath.split("?")[0]);
  const relativePath = normalizedPath === "/" ? "index.html" : normalizedPath.replace(/^\/+/, "");
  const filePath = path.resolve(rootDir, relativePath);

  if (!filePath.startsWith(rootDir) || filePath.includes(`${path.sep}.`)) {
    sendText(res, 403, "Forbidden");
    return;
  }

  fs.stat(filePath, (error, stats) => {
    if (!error && stats.isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, {
        "Content-Type": mimeTypes[ext] || "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
      });
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    // Keep shared links and clean URLs inside the H5 instead of returning a 404.
    const indexPath = path.join(rootDir, "index.html");
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    });
    fs.createReadStream(indexPath).pipe(res);
  });
}

function readJsonBody(req) {
  return new Promise((resolve) => {
    if (!["POST", "PUT", "PATCH"].includes(req.method)) {
      resolve({});
      return;
    }

    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) req.destroy();
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
    req.on("error", () => resolve({}));
  });
}

function sendText(res, status, text) {
  res.writeHead(status, {
    "Content-Type": "text/plain; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
  });
  res.end(text);
}

function loadEnv(filename) {
  const filePath = path.join(rootDir, filename);
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) return;
    const [, key, rawValue] = match;
    if (process.env[key]) return;
    process.env[key] = rawValue.replace(/^['"]|['"]$/g, "");
  });
}
