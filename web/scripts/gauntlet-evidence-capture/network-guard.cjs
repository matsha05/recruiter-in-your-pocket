"use strict";

if (process.env.RIYP_GAUNTLET_NETWORK_GUARD === "1") {
  const childProcess = require("node:child_process");
  const dgram = require("node:dgram");
  const dns = require("node:dns");
  const http = require("node:http");
  const https = require("node:https");
  const net = require("node:net");
  const workerThreads = require("node:worker_threads");

  const guardRequire = `--require=${JSON.stringify(__filename)}`;

  function isLoopback(hostname) {
    const value = String(hostname || "").replace(/^\[|\]$/g, "").toLowerCase();
    return value === "127.0.0.1" || value === "::1";
  }

  function rejectHost(hostname) {
    if (!isLoopback(hostname)) {
      throw new Error(`Gauntlet network guard blocked non-loopback host: ${String(hostname)}`);
    }
  }

  function rejectConnectionHooks(value) {
    if (!value || typeof value !== "object") return;
    if (Object.prototype.hasOwnProperty.call(value, "lookup") && value.lookup !== undefined) {
      throw new Error("Gauntlet network guard blocked a custom DNS lookup");
    }
    if (Object.prototype.hasOwnProperty.call(value, "createConnection")
      && value.createConnection !== undefined) {
      throw new Error("Gauntlet network guard blocked a custom connection factory");
    }
  }

  function requestHost(args) {
    const first = args[0];
    rejectConnectionHooks(first);
    rejectConnectionHooks(args[1]);
    if (typeof first === "string" || first instanceof URL) return new URL(first).hostname;
    if (first && typeof first === "object") return first.hostname || first.host || "";
    return "";
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
    if (Array.isArray(first)) return socketHost(first);
    if (first && typeof first === "object") {
      rejectConnectionHooks(first);
      if (first.path) return null;
      return first.host || first.hostname || "";
    }
    if (typeof first === "string" && !/^\d+$/.test(first)) return null;
    return typeof args[1] === "string" ? args[1] : "";
  }

  const originalSocketConnect = net.Socket.prototype.connect;
  net.Socket.prototype.connect = function guardedSocketConnect(...args) {
    const host = socketHost(args);
    if (host !== null) rejectHost(host);
    return originalSocketConnect.apply(this, args);
  };

  const blockedDns = function blockedDns() {
    throw new Error("Gauntlet network guard blocked DNS resolution");
  };
  for (const method of [
    "getDefaultResultOrder",
    "getServers",
    "lookup",
    "lookupService",
    "resolve",
    "resolve4",
    "resolve6",
    "resolveAny",
    "resolveCaa",
    "resolveCname",
    "resolveMx",
    "resolveNaptr",
    "resolveNs",
    "resolvePtr",
    "resolveSoa",
    "resolveSrv",
    "resolveTxt",
    "reverse",
    "setDefaultResultOrder",
    "setServers",
  ]) {
    if (typeof dns[method] === "function") dns[method] = blockedDns;
    if (dns.promises && typeof dns.promises[method] === "function") dns.promises[method] = blockedDns;
  }
  for (const Resolver of [dns.Resolver, dns.promises && dns.promises.Resolver]) {
    if (!Resolver || !Resolver.prototype) continue;
    for (const method of Object.getOwnPropertyNames(Resolver.prototype)) {
      if (method !== "constructor" && typeof Resolver.prototype[method] === "function") {
        Resolver.prototype[method] = blockedDns;
      }
    }
  }

  dgram.createSocket = function guardedDgramCreateSocket() {
    throw new Error("Gauntlet network guard blocked UDP/dgram access");
  };

  if (typeof globalThis.fetch === "function") {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = function guardedFetch(input, init) {
      if (init && typeof init === "object" && init.dispatcher !== undefined) {
        throw new Error("Gauntlet network guard blocked a custom fetch dispatcher");
      }
      const raw = typeof input === "string" || input instanceof URL ? input : input.url;
      rejectHost(new URL(raw).hostname);
      return originalFetch(input, init);
    };
  }

  function forcedChildOptions(options) {
    const supplied = options && typeof options === "object" ? options : {};
    if (supplied.shell) {
      throw new Error("Gauntlet network guard blocked a shell-mediated child command");
    }
    const suppliedEnvironment = supplied.env && typeof supplied.env === "object"
      ? supplied.env
      : process.env;
    const existingNodeOptions = typeof suppliedEnvironment.NODE_OPTIONS === "string"
      ? suppliedEnvironment.NODE_OPTIONS.trim()
      : "";
    const nodeOptions = existingNodeOptions.includes(guardRequire)
      ? existingNodeOptions
      : [existingNodeOptions, guardRequire].filter(Boolean).join(" ");
    return {
      ...supplied,
      env: {
        ...suppliedEnvironment,
        NODE_OPTIONS: nodeOptions,
        RIYP_GAUNTLET_NETWORK_GUARD: "1",
      },
    };
  }

  function forcedChildEnvPairs(envPairs) {
    const supplied = Array.isArray(envPairs) ? envPairs : [];
    let existingNodeOptions = "";
    const preserved = [];
    for (const pair of supplied) {
      if (typeof pair !== "string") continue;
      const separator = pair.indexOf("=");
      const key = separator === -1 ? pair : pair.slice(0, separator);
      const value = separator === -1 ? "" : pair.slice(separator + 1);
      if (key === "NODE_OPTIONS") {
        existingNodeOptions = value.trim();
        continue;
      }
      if (key === "RIYP_GAUNTLET_NETWORK_GUARD") continue;
      preserved.push(pair);
    }
    const nodeOptions = existingNodeOptions.includes(guardRequire)
      ? existingNodeOptions
      : [existingNodeOptions, guardRequire].filter(Boolean).join(" ");
    return [
      ...preserved,
      `NODE_OPTIONS=${nodeOptions}`,
      "RIYP_GAUNTLET_NETWORK_GUARD=1",
    ];
  }

  function assertNodeChild(command) {
    if (command !== process.execPath) {
      throw new Error(`Gauntlet network guard blocked non-Node child command: ${String(command)}`);
    }
  }

  const originalChildProcessSpawn = childProcess.ChildProcess.prototype.spawn;
  childProcess.ChildProcess.prototype.spawn = function guardedChildProcessPrototypeSpawn(options) {
    const normalized = options && typeof options === "object" ? options : {};
    assertNodeChild(normalized.file);
    return originalChildProcessSpawn.call(this, {
      ...normalized,
      envPairs: forcedChildEnvPairs(normalized.envPairs),
    });
  };

  const originalSpawn = childProcess.spawn;
  childProcess.spawn = function guardedSpawn(command, args, options) {
    assertNodeChild(command);
    if (Array.isArray(args)) return originalSpawn.call(this, command, args, forcedChildOptions(options));
    return originalSpawn.call(this, command, forcedChildOptions(args));
  };

  const originalSpawnSync = childProcess.spawnSync;
  childProcess.spawnSync = function guardedSpawnSync(command, args, options) {
    assertNodeChild(command);
    if (Array.isArray(args)) return originalSpawnSync.call(this, command, args, forcedChildOptions(options));
    return originalSpawnSync.call(this, command, forcedChildOptions(args));
  };

  childProcess.exec = function guardedExec(command) {
    throw new Error(`Gauntlet network guard blocked shell child command: ${String(command)}`);
  };

  childProcess.execSync = function guardedExecSync(command) {
    throw new Error(`Gauntlet network guard blocked shell child command: ${String(command)}`);
  };

  const originalExecFile = childProcess.execFile;
  childProcess.execFile = function guardedExecFile(file, args, options, callback) {
    assertNodeChild(file);
    if (Array.isArray(args)) {
      if (typeof options === "function") {
        return originalExecFile.call(this, file, args, forcedChildOptions(), options);
      }
      return originalExecFile.call(this, file, args, forcedChildOptions(options), callback);
    }
    if (typeof args === "function") return originalExecFile.call(this, file, forcedChildOptions(), args);
    return originalExecFile.call(this, file, forcedChildOptions(args), options);
  };

  const originalExecFileSync = childProcess.execFileSync;
  childProcess.execFileSync = function guardedExecFileSync(file, args, options) {
    assertNodeChild(file);
    if (Array.isArray(args)) return originalExecFileSync.call(this, file, args, forcedChildOptions(options));
    return originalExecFileSync.call(this, file, forcedChildOptions(args));
  };

  const originalFork = childProcess.fork;
  childProcess.fork = function guardedFork(modulePath, args, options) {
    if (Array.isArray(args)) return originalFork.call(this, modulePath, args, forcedChildOptions(options));
    return originalFork.call(this, modulePath, [], forcedChildOptions(args));
  };

  const OriginalWorker = workerThreads.Worker;
  workerThreads.Worker = class GuardedWorker extends OriginalWorker {
    constructor(filename, options) {
      const supplied = options && typeof options === "object" ? options : {};
      const forced = forcedChildOptions(supplied);
      const execArgv = Array.isArray(supplied.execArgv) ? [...supplied.execArgv] : [...process.execArgv];
      const hasGuard = execArgv.some((entry, index) => entry === guardRequire
        || (entry === "--require" && execArgv[index + 1] === __filename));
      if (!hasGuard) execArgv.push("--require", __filename);
      super(filename, { ...forced, execArgv });
    }
  };
}
