"use strict";

if (process.env.RIYP_GAUNTLET_NETWORK_GUARD === "1") {
  const http = require("node:http");
  const https = require("node:https");
  const net = require("node:net");
  const tls = require("node:tls");

  function isLoopback(hostname) {
    const value = String(hostname || "localhost").replace(/^\[|\]$/g, "").toLowerCase();
    return value === "localhost" || value === "::1" || value.startsWith("127.");
  }

  function rejectHost(hostname) {
    if (!isLoopback(hostname)) {
      throw new Error(`Gauntlet network guard blocked non-loopback host: ${String(hostname)}`);
    }
  }

  function requestHost(args) {
    const first = args[0];
    if (typeof first === "string" || first instanceof URL) return new URL(first).hostname;
    if (first && typeof first === "object") return first.hostname || first.host || "localhost";
    return "localhost";
  }

  for (const requestModule of [http, https]) {
    const originalRequest = requestModule.request;
    requestModule.request = function guardedRequest(...args) {
      rejectHost(requestHost(args));
      return originalRequest.apply(this, args);
    };
    requestModule.get = function guardedGet(...args) {
      const request = requestModule.request(...args);
      request.end();
      return request;
    };
  }

  function socketHost(args) {
    const first = args[0];
    if (typeof first === "string" && !/^\d+$/.test(first)) return null;
    if (first && typeof first === "object") {
      if (first.path) return null;
      return first.host || first.hostname || "localhost";
    }
    return typeof args[1] === "string" ? args[1] : "localhost";
  }

  const originalNetConnect = net.connect;
  net.connect = function guardedNetConnect(...args) {
    const host = socketHost(args);
    if (host) rejectHost(host);
    return originalNetConnect.apply(this, args);
  };
  net.createConnection = net.connect;

  const originalTlsConnect = tls.connect;
  tls.connect = function guardedTlsConnect(...args) {
    const host = socketHost(args);
    if (host) rejectHost(host);
    return originalTlsConnect.apply(this, args);
  };

  if (typeof globalThis.fetch === "function") {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = function guardedFetch(input, init) {
      const raw = typeof input === "string" || input instanceof URL ? input : input.url;
      rejectHost(new URL(raw).hostname);
      return originalFetch(input, init);
    };
  }
}
