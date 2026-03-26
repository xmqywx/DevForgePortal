const { WebSocketServer, WebSocket } = require("ws");
const http = require("http");

const WS_PORT = 3105;
const HTTP_PORT = 3106; // Internal API for Next.js to trigger broadcasts

// WebSocket server
const wss = new WebSocketServer({ port: WS_PORT });
const clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);
  console.log(`[WS] Client connected (${clients.size} total)`);
  ws.on("close", () => { clients.delete(ws); console.log(`[WS] Client disconnected (${clients.size})`); });
  ws.on("error", () => clients.delete(ws));
});

function broadcast(event) {
  const msg = JSON.stringify(event);
  let sent = 0;
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
      sent++;
    }
  }
  return sent;
}

// Internal HTTP server — Next.js API routes POST here to trigger broadcasts
const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/broadcast") {
    let body = "";
    req.on("data", (chunk) => body += chunk);
    req.on("end", () => {
      try {
        const event = JSON.parse(body);
        const sent = broadcast(event);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, sent }));
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(HTTP_PORT, "127.0.0.1", () => {
  console.log(`[WS] WebSocket on port ${WS_PORT}`);
  console.log(`[WS] Broadcast API on port ${HTTP_PORT} (internal)`);
});
