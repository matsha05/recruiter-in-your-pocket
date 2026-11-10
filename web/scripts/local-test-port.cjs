/** Shared by Playwright, its local server, and the release-check runner. */
function localTestPort(value) {
  const input = String(value ?? "").trim();
  if (!input) return 3100;
  const port = Number(input);
  if (!/^\d+$/.test(input) || !Number.isInteger(port) || port < 1024 || port > 65535) {
    throw new Error("RIYP_LOCAL_TEST_PORT must be an integer from 1024 to 65535.");
  }
  return port;
}

module.exports = { localTestPort };
