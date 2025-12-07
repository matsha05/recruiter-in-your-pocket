// Lightweight smoke test that exercises health/ready handlers without binding a port.
const assert = require("assert");
const http = require("http");
const { Duplex } = require("stream");

process.env.USE_MOCK_OPENAI = "1";
const app = require("../app");

function makeSocket() {
  const socket = new Duplex({
    read() { },
    write(chunk, encoding, callback) {
      callback();
    }
  });
  socket.remoteAddress = "127.0.0.1";
  return socket;
}

function request(app, method, url) {
  return new Promise((resolve, reject) => {
    const socket = makeSocket();
    const req = new http.IncomingMessage(socket);
    req.method = method;
    req.url = url;
    req.originalUrl = url;
    req.headers = { host: "localhost" };

    const res = new http.ServerResponse(req);
    const chunks = [];

    const end = res.end;
    res.write = function (chunk) {
      if (chunk) chunks.push(Buffer.from(chunk));
      return true;
    };
    res.end = function (chunk, encoding, cb) {
      if (chunk) chunks.push(Buffer.from(chunk, encoding));
      end.call(res, chunk, encoding, cb);
    };

    res.on("finish", () => {
      const body = Buffer.concat(chunks).toString("utf8");
      resolve({ status: res.statusCode, body });
    });

    res.on("error", reject);
    app.handle(req, res, (err) => {
      if (err) reject(err);
    });
  });
}

async function run() {
  const health = await request(app, "GET", "/health");
  assert.strictEqual(health.status, 200);
  assert.strictEqual(JSON.parse(health.body).ok, true);

  const ready = await request(app, "GET", "/ready");
  assert.strictEqual(ready.status, 200, `Ready failed: ${ready.body}`);
  assert.strictEqual(JSON.parse(ready.body).ok, true);

  console.log("Smoke endpoints passed.");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
