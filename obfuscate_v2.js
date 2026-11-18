"use strict";
/* WSFuscate V8.2.44: nonlinear CFG predicates, requested hardened profiles, and active-op micro-handler pruning. */
/* WSFuscate V8.2.44 nonlinear CFG, lane-banked active handlers, compact micro-op runtime, Luau-compatibility and VM-stability server-only engine.
   VM coroutine API exposure (allowCoroutine) is independent from the internal VM call scheduler
   (vmCoroutineScheduler). The latter is opt-in so straight-line code never depends on coroutine APIs.
   This runtime guard prevents accidental
   browser execution/bundling; it is not a cryptographic distribution boundary. */
const __WSF_NODE_SERVER_RUNTIME =
  typeof process === "object" && process !== null &&
  process.release && process.release.name === "node" &&
  process.versions && typeof process.versions.node === "string" &&
  typeof Buffer === "function" && typeof module === "object" &&
  module !== null && typeof module.require === "function";
if (!__WSF_NODE_SERVER_RUNTIME) {
  throw new Error("WSFuscate V8.2.44 is server-only. Use the authenticated server API; do not bundle this engine in a client.");
}
// Use Node's built-in CSPRNG directly. The generated Luau still contains its
// own decoding material, so these bytes diversify builds; they are not client secrets.
// Capture the module loader and process object before any request-specific code runs.
// These references remain private to this CommonJS module; they are not exported or
// installed on globalThis. This is accidental-monkey-patch detection, not a sandbox.
const __WSF_PROCESS = process;
const __WSF_MODULE_REQUIRE_RAW = module.require;
const __WSF_MODULE_REQUIRE = __WSF_MODULE_REQUIRE_RAW.bind(module);
const __WSF_NODE_CRYPTO = __WSF_MODULE_REQUIRE("node:crypto");
const __WSF_NODE_BUFFER = __WSF_MODULE_REQUIRE("node:buffer").Buffer;
const __WSF_NODE_UTIL_TYPES = __WSF_MODULE_REQUIRE("node:util").types;
const __WSF_PROCESS_GET_BUILTIN_MODULE = typeof __WSF_PROCESS.getBuiltinModule === "function" ? __WSF_PROCESS.getBuiltinModule : null;
const __WSF_NODE_IS_PROXY = __WSF_NODE_UTIL_TYPES && __WSF_NODE_UTIL_TYPES.isProxy;
const __WSF_NODE_IS_PROMISE = __WSF_NODE_UTIL_TYPES && __WSF_NODE_UTIL_TYPES.isPromise;
const __WSF_RANDOM_BYTES_RAW = __WSF_NODE_CRYPTO && __WSF_NODE_CRYPTO.randomBytes;
const __WSF_RANDOM_BYTES = typeof __WSF_RANDOM_BYTES_RAW === "function"
  ? __WSF_RANDOM_BYTES_RAW.bind(__WSF_NODE_CRYPTO)
  : null;
const __WSF_BUFFER_BYTE_LENGTH = __WSF_NODE_BUFFER.byteLength;
const __WSF_BUFFER_FROM = __WSF_NODE_BUFFER.from;
const __WSF_BUFFER_ALLOC = __WSF_NODE_BUFFER.alloc;
const __WSF_BUFFER_IS_BUFFER = __WSF_NODE_BUFFER.isBuffer;
const __WSF_BUFFER_READ_UINT32_LE = __WSF_NODE_BUFFER.prototype.readUInt32LE;
const __WSF_BUFFER_FILL = __WSF_NODE_BUFFER.prototype.fill;
const __WSF_BUFFER_TO_STRING = __WSF_NODE_BUFFER.prototype.toString;
const __WSF_TEXT_ENCODER_CTOR = globalThis.TextEncoder;
const __WSF_TEXT_DECODER_CTOR = globalThis.TextDecoder;
const __WSF_TEXT_ENCODER_METHOD = __WSF_TEXT_ENCODER_CTOR && __WSF_TEXT_ENCODER_CTOR.prototype.encode;
const __WSF_TEXT_DECODER_METHOD = __WSF_TEXT_DECODER_CTOR && __WSF_TEXT_DECODER_CTOR.prototype.decode;
const __WSF_PROMISE_CTOR = Promise;
const __WSF_PROMISE_RESOLVE = __WSF_PROMISE_CTOR.resolve;
// Capture inspection intrinsics before request handlers receive user-controlled objects.
// This protects against later accidental monkey-patching, not a process compromised before import.
const __WSF_OBJECT_PROTOTYPE = Object.prototype;
const __WSF_OBJECT_CREATE = Object.create;
const __WSF_OBJECT_GET_PROTOTYPE_OF = Object.getPrototypeOf;
const __WSF_OBJECT_GET_OWN_PROPERTY_DESCRIPTOR = Object.getOwnPropertyDescriptor;
const __WSF_REFLECT_OWN_KEYS = Reflect.ownKeys;
const __WSF_REFLECT_APPLY = Reflect.apply;
const __WSF_OBJECT_HAS_OWN = Object.prototype.hasOwnProperty;
const __WSF_HAS_OWN = (value, key) => __WSF_REFLECT_APPLY(__WSF_OBJECT_HAS_OWN, value, [key]);
const __WSF_PRIVATE_DIAGNOSTICS = [];
const __WSF_PRIVATE_DIAGNOSTIC_LIMIT = 64;
const __WSF_INTEGRITY_ERROR_SET = new WeakSet();
// Numeric identifiers are used at failure sites; readable labels are resolved only
// by this server-private sink when a trusted operator requests diagnostics.
const __WSF_DIAGNOSTIC_LABELS = Object.freeze({
  0x0101: "crypto_intrinsic_changed",
  0x0102: "buffer_intrinsic_changed",
  0x0103: "reflection_intrinsic_changed",
  0x0104: "non_canonical_node_module",
  0x0105: "builtin_registry_changed",
  0x0106: "builtin_registry_mismatch",
  0x0107: "probe_input_invalid",
  0x0108: "intrinsic_behavior_probe_failed",
  0x0109: "integrity_probe_exception",
  0x010A: "probe_shuffle_entropy_failed",
  0x010B: "probe_shuffle_buffer_invalid",
  0x010C: "probe_shuffle_buffer_wipe_failed",
  0x010D: "probe_buffer_wipe_failed",
  0x010E: "integrity_interval_entropy_invalid",
  0x010F: "integrity_interval_entropy_failed",
  0x0110: "integrity_interval_buffer_wipe_failed",
  0x0111: "csprng_source_failed",
  0x0112: "csprng_buffer_invalid",
  0x0113: "rng_pool_wipe_failed",
  0x0114: "rng_word_wipe_failed",
  0x0115: "rng_release_wipe_failed"
});
function __wqA(reasonCode) {
  const code = Number.isInteger(reasonCode) ? reasonCode : 0;
  const record = Object.freeze({
    at: Date.now(),
    code,
    reason: __WSF_DIAGNOSTIC_LABELS[code] || "integrity_failure"
  });
  if (__WSF_PRIVATE_DIAGNOSTICS.length >= __WSF_PRIVATE_DIAGNOSTIC_LIMIT) __WSF_PRIVATE_DIAGNOSTICS.shift();
  __WSF_PRIVATE_DIAGNOSTICS.push(record);
}
function __wqB(reasonCode) {
  __wqA(reasonCode);
  const error = new Error("WSF engine validation failed.");
  __WSF_INTEGRITY_ERROR_SET.add(error);
  return error;
}
// Trusted server diagnostics only. Never expose this accessor through a client/API response.
function getInternalDiagnostics() {
  return __WSF_PRIVATE_DIAGNOSTICS.map(item => ({ at: item.at, reason: item.reason }));
}
function clearInternalDiagnostics() {
  __WSF_PRIVATE_DIAGNOSTICS.length = 0;
}

if (!__WSF_NODE_CRYPTO || typeof __WSF_RANDOM_BYTES !== "function" ||
    globalThis.Buffer !== __WSF_NODE_BUFFER || Buffer !== __WSF_NODE_BUFFER ||
    typeof __WSF_NODE_IS_PROXY !== "function" || typeof __WSF_NODE_IS_PROMISE !== "function") {
  throw new Error("WSFuscate requires the supported Node.js runtime and built-in capabilities.");
}
// Capability checks are kept inside a module-private closure. The individual
// probes are anonymous and have no exported names; __wqC is the sole local entry.
const __wqC = (() => {
  const probes = [
    () => {
      if (!__WSF_NODE_CRYPTO || typeof __WSF_RANDOM_BYTES_RAW !== "function" ||
          __WSF_NODE_CRYPTO.randomBytes !== __WSF_RANDOM_BYTES_RAW ||
          typeof __WSF_RANDOM_BYTES !== "function") {
        throw __wqB(0x0101);
      }
    },
    () => {
      if (globalThis.Buffer !== __WSF_NODE_BUFFER || Buffer !== __WSF_NODE_BUFFER ||
          __WSF_NODE_BUFFER.byteLength !== __WSF_BUFFER_BYTE_LENGTH ||
          __WSF_NODE_BUFFER.from !== __WSF_BUFFER_FROM ||
          __WSF_NODE_BUFFER.alloc !== __WSF_BUFFER_ALLOC ||
          __WSF_NODE_BUFFER.isBuffer !== __WSF_BUFFER_IS_BUFFER ||
          __WSF_NODE_BUFFER.prototype.readUInt32LE !== __WSF_BUFFER_READ_UINT32_LE ||
          __WSF_NODE_BUFFER.prototype.fill !== __WSF_BUFFER_FILL ||
          __WSF_NODE_BUFFER.prototype.toString !== __WSF_BUFFER_TO_STRING) {
        throw __wqB(0x0102);
      }
    },
    () => {
      if (Object.prototype !== __WSF_OBJECT_PROTOTYPE ||
          Object.create !== __WSF_OBJECT_CREATE ||
          Object.getPrototypeOf !== __WSF_OBJECT_GET_PROTOTYPE_OF ||
          Object.getOwnPropertyDescriptor !== __WSF_OBJECT_GET_OWN_PROPERTY_DESCRIPTOR ||
          Reflect.ownKeys !== __WSF_REFLECT_OWN_KEYS ||
          Reflect.apply !== __WSF_REFLECT_APPLY ||
          Object.prototype.hasOwnProperty !== __WSF_OBJECT_HAS_OWN ||
          __WSF_NODE_UTIL_TYPES.isProxy !== __WSF_NODE_IS_PROXY ||
          __WSF_NODE_UTIL_TYPES.isPromise !== __WSF_NODE_IS_PROMISE ||
          (__WSF_TEXT_ENCODER_CTOR && (globalThis.TextEncoder !== __WSF_TEXT_ENCODER_CTOR || __WSF_TEXT_ENCODER_CTOR.prototype.encode !== __WSF_TEXT_ENCODER_METHOD)) ||
          (__WSF_TEXT_DECODER_CTOR && (globalThis.TextDecoder !== __WSF_TEXT_DECODER_CTOR || __WSF_TEXT_DECODER_CTOR.prototype.decode !== __WSF_TEXT_DECODER_METHOD)) ||
          globalThis.Promise !== __WSF_PROMISE_CTOR || Promise !== __WSF_PROMISE_CTOR ||
          __WSF_PROMISE_CTOR.resolve !== __WSF_PROMISE_RESOLVE ||
          module.require !== __WSF_MODULE_REQUIRE_RAW || globalThis.process !== __WSF_PROCESS) {
        throw __wqB(0x0103);
      }
    },
    () => {
      const requiredCrypto = __WSF_MODULE_REQUIRE("node:crypto");
      const requiredBuffer = __WSF_MODULE_REQUIRE("node:buffer");
      const requiredUtil = __WSF_MODULE_REQUIRE("node:util");
      if (requiredCrypto !== __WSF_NODE_CRYPTO || !requiredBuffer || requiredBuffer.Buffer !== __WSF_NODE_BUFFER ||
          !requiredUtil || requiredUtil.types !== __WSF_NODE_UTIL_TYPES ||
          requiredUtil.types.isProxy !== __WSF_NODE_IS_PROXY || requiredUtil.types.isPromise !== __WSF_NODE_IS_PROMISE ||
          requiredCrypto.randomBytes !== __WSF_RANDOM_BYTES_RAW) {
        throw __wqB(0x0104);
      }
      if (__WSF_PROCESS_GET_BUILTIN_MODULE) {
        if (__WSF_PROCESS.getBuiltinModule !== __WSF_PROCESS_GET_BUILTIN_MODULE) {
          throw __wqB(0x0105);
        }
        const canonicalCrypto = __WSF_REFLECT_APPLY(__WSF_PROCESS_GET_BUILTIN_MODULE, __WSF_PROCESS, ["node:crypto"]);
        const canonicalBuffer = __WSF_REFLECT_APPLY(__WSF_PROCESS_GET_BUILTIN_MODULE, __WSF_PROCESS, ["node:buffer"]);
        const canonicalUtil = __WSF_REFLECT_APPLY(__WSF_PROCESS_GET_BUILTIN_MODULE, __WSF_PROCESS, ["node:util"]);
        if (canonicalCrypto !== requiredCrypto || !canonicalBuffer || canonicalBuffer.Buffer !== requiredBuffer.Buffer ||
            !canonicalUtil || canonicalUtil.types !== requiredUtil.types) {
          throw __wqB(0x0106);
        }
      }
    },
    () => {
      // Fresh unpredictable input; expected output is derived locally from it.
      // All temporary buffers are wiped in finally, including on failed probes.
      let probeInput = null;
      let sample = null;
      let entropyProbeA = null;
      let entropyProbeB = null;
      let sampleOk = false;
      let entropyProbeOk = false;
      let typeProbeOrder = 0;
      try {
        probeInput = __WSF_REFLECT_APPLY(__WSF_RANDOM_BYTES_RAW, __WSF_NODE_CRYPTO, [16]);
        if (!__WSF_BUFFER_IS_BUFFER(probeInput) || probeInput.length !== 16) throw __wqB(0x0107);
        sample = __WSF_REFLECT_APPLY(__WSF_BUFFER_FROM, __WSF_NODE_BUFFER, [probeInput]);
        const expectedWord = (probeInput[0] | (probeInput[1] << 8) | (probeInput[2] << 16) | (probeInput[3] << 24)) >>> 0;
        sampleOk = __WSF_BUFFER_IS_BUFFER(sample) && sample.length === probeInput.length &&
          __WSF_REFLECT_APPLY(__WSF_BUFFER_READ_UINT32_LE, sample, [0]) === expectedWord;
        if (sampleOk) {
          for (let i = 0; i < probeInput.length; i++) {
            if (sample[i] !== probeInput[i]) { sampleOk = false; break; }
          }
        }
        if (sampleOk) {
          __WSF_REFLECT_APPLY(__WSF_BUFFER_FILL, sample, [0]);
          for (let i = 0; i < sample.length; i++) {
            if (sample[i] !== 0) { sampleOk = false; break; }
          }
        }
        entropyProbeA = __WSF_REFLECT_APPLY(__WSF_RANDOM_BYTES_RAW, __WSF_NODE_CRYPTO, [19]);
        entropyProbeB = __WSF_REFLECT_APPLY(__WSF_RANDOM_BYTES_RAW, __WSF_NODE_CRYPTO, [19]);
        entropyProbeOk = __WSF_BUFFER_IS_BUFFER(entropyProbeA) && __WSF_BUFFER_IS_BUFFER(entropyProbeB) &&
          entropyProbeA.length === 19 && entropyProbeB.length === 19 && entropyProbeA !== entropyProbeB;
        if (entropyProbeOk) {
          let distinctBytes = false;
          for (let i = 0; i < 19; i++) if (entropyProbeA[i] !== entropyProbeB[i]) { distinctBytes = true; break; }
          entropyProbeOk = distinctBytes;
        }
        typeProbeOrder = probeInput[4] & 1;
      } finally {
        let cleanupOk = true;
        if (sample) cleanupOk = __wsWipeBuffer(sample) && cleanupOk;
        if (probeInput) cleanupOk = __wsWipeBuffer(probeInput) && cleanupOk;
        if (entropyProbeA) cleanupOk = __wsWipeBuffer(entropyProbeA) && cleanupOk;
        if (entropyProbeB) cleanupOk = __wsWipeBuffer(entropyProbeB) && cleanupOk;
        if (!cleanupOk) throw __wqB(0x010D);
      }
      const plainA = typeProbeOrder ? {} : __WSF_OBJECT_CREATE(null);
      const plainB = typeProbeOrder ? __WSF_OBJECT_CREATE(null) : {};
      const proxyA = new Proxy(plainA, {});
      const proxyB = new Proxy(plainB, {});
      const emptyPromise = __WSF_REFLECT_APPLY(__WSF_PROMISE_RESOLVE, __WSF_PROMISE_CTOR, [undefined]);
      const typeProbeOk = __WSF_REFLECT_APPLY(__WSF_NODE_IS_PROXY, __WSF_NODE_UTIL_TYPES, [plainA]) === false &&
        __WSF_REFLECT_APPLY(__WSF_NODE_IS_PROXY, __WSF_NODE_UTIL_TYPES, [plainB]) === false &&
        __WSF_REFLECT_APPLY(__WSF_NODE_IS_PROXY, __WSF_NODE_UTIL_TYPES, [proxyA]) === true &&
        __WSF_REFLECT_APPLY(__WSF_NODE_IS_PROXY, __WSF_NODE_UTIL_TYPES, [proxyB]) === true &&
        __WSF_REFLECT_APPLY(__WSF_NODE_IS_PROMISE, __WSF_NODE_UTIL_TYPES, [plainA]) === false &&
        __WSF_REFLECT_APPLY(__WSF_NODE_IS_PROMISE, __WSF_NODE_UTIL_TYPES, [emptyPromise]) === true;
      if (!sampleOk || !typeProbeOk || !entropyProbeOk) throw __wqB(0x0108);
    }
  ];
  const shuffle = order => {
    let randomBytes = null;
    let cursor = 0;
    const randomIndex = upperExclusive => {
      const acceptedBelow = Math.floor(256 / upperExclusive) * upperExclusive;
      for (;;) {
        if (!randomBytes || cursor >= randomBytes.length) {
          if (randomBytes && !__wsWipeBuffer(randomBytes)) throw __wqB(0x010C);
          let fresh;
          try { fresh = __WSF_RANDOM_BYTES(16); }
          catch (_) { throw __wqB(0x010A); }
          if (!__WSF_BUFFER_IS_BUFFER(fresh) || fresh.length !== 16) {
            if (__WSF_BUFFER_IS_BUFFER(fresh) && !__wsWipeBuffer(fresh)) throw __wqB(0x010C);
            throw __wqB(0x010B);
          }
          randomBytes = fresh;
          cursor = 0;
        }
        const value = randomBytes[cursor++];
        // Rejection sampling avoids modulo bias when choosing the next slot.
        if (value < acceptedBelow) return value % upperExclusive;
      }
    };
    try {
      for (let i = order.length - 1; i > 0; i--) {
        const j = randomIndex(i + 1);
        [order[i], order[j]] = [order[j], order[i]];
      }
    } finally {
      if (randomBytes && !__wsWipeBuffer(randomBytes)) throw __wqB(0x010C);
    }
  };
  return () => {
    try {
      const order = probes.slice();
      shuffle(order);
      for (let i = 0; i < order.length; i++) order[i]();
    } catch (error) {
      if (error && __WSF_INTEGRITY_ERROR_SET.has(error)) throw error;
      throw __wqB(0x0109);
    }
  };
})();
// Import-time baseline. Additional checks run at build entry, RNG refill, and
// bounded intervals while entropy is consumed. This does not secure a compromised host.
__wqC();
/* WSFuscate V8.2.44 server-only: VM cleanup, bounded execution, active-op dispatch pruning, capability minimization, and safe fallback policy. */
const performance = globalThis.performance || { now: () => Date.now() };
let __wsLastInterproceduralGraph = null;
let __wsLastHardeningProfile = null;
function __wsEl() {
  const style = new Proxy(Object.create(null), {
    get(t, k) {
      if (k === "setProperty" || k === "removeProperty") return function () {};
      if (k === "getPropertyValue") return function () { return ""; };
      return Object.prototype.hasOwnProperty.call(t, k) ? t[k] : "";
    },
    set(t, k, v) { t[k] = v; return true; }
  });
  const o = {
    value: "", checked: true, textContent: "", innerHTML: "", hidden: true, className: "",
    style, focus() {}, select() {}, setSelectionRange() {},
    addEventListener() {}, appendChild() { return null; }, replaceChildren() {}, click() {},
    getAttribute() { return null; }, setAttribute() {}, querySelector() { return null; },
    querySelectorAll() { return []; }, files: null, dispatchEvent() { return true; },
    scrollTop: 0, scrollLeft: 0, parentElement: null, children: [], content: null,
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    remove() {}, insertBefore() { return null; }, cloneNode() { return __wsEl(); }
  };
  o.parentElement = o;
  o.content = o;
  return o;
}
const document = Object.freeze({
  // Minimal inert adapter for the bundled diagnostics UI in server-only mode.
  // It is not exposed as a browser environment and never mutates host globals.
  getElementById() { return __wsEl(); },
  createElement() { return __wsEl(); },
  querySelector() { return null; },
  querySelectorAll() { return []; },
  addEventListener() {},
  body: __wsEl(),
  documentElement: __wsEl()
});
// Keep compatibility fallbacks private to this module. Importing the engine must
// not mutate process-wide DOM constructors or text-encoding globals.
const TextEncoder = globalThis.TextEncoder || class {
  encode(value) { return Buffer.from(String(value), "utf8"); }
};
const TextDecoder = globalThis.TextDecoder || class {
  decode(value) { return Buffer.from(value).toString("utf8"); }
};
const fetch = globalThis.fetch || (async () => { throw new Error("fetch unavailable"); });


/* ========== LEXER ========== */
/* FIX #11: continue is contextual in Luau, not a reserved KW for lexer */
const KW = new Set("and break const do else elseif end false for function if in local nil not or repeat return then true until while".split(" "));
/* Longest operators precede their prefixes. */
const OPS = "... ..= //= <<= >>= &= |= == ~= <= >= += -= *= /= %= ^= .. // << >> :: -> + - * / % ^ # < > = ( ) { } [ ] ; : , . & | ~ ? @".split(" ");
const NUM_ = /0[xX][\da-fA-F_]+|0[bB][01_]+|(?:\d[\d_]*(?:\.(?!\.)[\d_]*)?|\.\d[\d_]*)(?:[eE][+-]?\d+)?/y;

/* BUGFIX: decode Lua string escapes into real characters at lex time. Previously the
   raw "\n" text (backslash + n) was kept, and the emitter then re-escaped it, turning
   "a\nb" into the literal text a\nb in the output. */
const LUA_SIMPLE_ESC = Object.freeze({ n: "\n", t: "\t", r: "\r", a: "\x07", b: "\b", f: "\f", v: "\v", "\\": "\\", '"': '"', "'": "'", "`": "`", "\n": "\n" });
function __wsDecodeSimpleEscape(s, i, c) {
  return { ch: Object.prototype.hasOwnProperty.call(LUA_SIMPLE_ESC, c) ? LUA_SIMPLE_ESC[c] : c, next: i + 1 };
}
function __wsDecodeHexEscape(s, i) {
  const hex = s.slice(i + 1, i + 3);
  if (!/^[0-9a-fA-F]{2}$/.test(hex)) throw new SyntaxError("Invalid Luau string escape.");
  return { ch: String.fromCharCode(parseInt(hex, 16)), next: i + 3 };
}
function __wsDecodeUnicodeEscape(s, i) {
  if (s[i + 1] !== "{") throw new SyntaxError("Invalid Luau string escape.");
  const close = s.indexOf("}", i + 2);
  if (close < 0) throw new SyntaxError("Invalid Luau string escape.");
  const digits = s.slice(i + 2, close);
  if (!/^[0-9a-fA-F]+$/.test(digits)) throw new SyntaxError("Invalid Luau string escape.");
  const codePoint = parseInt(digits, 16);
  if (!Number.isInteger(codePoint) || codePoint < 0 || codePoint > 0x10FFFF || (codePoint >= 0xD800 && codePoint <= 0xDFFF))
    throw new SyntaxError("Invalid Luau string escape.");
  return { ch: String.fromCodePoint(codePoint), next: close + 1 };
}
function __wsDecodeDecimalEscape(s, i) {
  const match = /^\d{1,3}/.exec(s.slice(i, i + 3));
  const byte = match ? parseInt(match[0], 10) : 0;
  if (!match || byte > 255) throw new SyntaxError("Invalid Luau string escape.");
  return { ch: String.fromCharCode(byte), next: i + match[0].length };
}
function __wsDecodeWhitespaceEscape(s, i) {
  let j = i + 1;
  while (j < s.length && /\s/.test(s[j])) j++;
  return { ch: "", next: j };
}
function decodeLuaEscape(s, i) {
  const c = s[i];
  if (c === "x") return __wsDecodeHexEscape(s, i);
  if (c === "u") return __wsDecodeUnicodeEscape(s, i);
  if (c === "z") return __wsDecodeWhitespaceEscape(s, i);
  if (c !== undefined && /\d/.test(c)) return __wsDecodeDecimalEscape(s, i);
  return __wsDecodeSimpleEscape(s, i, c === undefined ? "" : c);
}

function lex(s) {
  let i = 0, l = 1, ls = 0;
  const T = [];
  const E = m => {
    const error = new SyntaxError("Invalid Luau source.");
    error.code = "WSF_PARSE_ERROR";
    error.diagnostic = String(m || "Lexical error");
    error.line = l;
    error.col = i - ls + 1;
    error.m = error.diagnostic;
    error.l = error.line;
    error.c = error.col;
    throw error;
  };
  for (;;) {
    while (i < s.length && /\s/.test(s[i])) {
      if (s[i] === "\n") { l++; ls = i + 1; }
      i++;
    }
    if (i >= s.length) break;
    const c = s[i], L = l, C = i - ls + 1;
    const add = (t, v, startPos, rawLen) => T.push({ t, v, l: L, c: C, pos: startPos !== undefined ? startPos : i, len: rawLen !== undefined ? rawLen : (v ? String(v).length : 0) });
    let m;
    if (c === "-" && s[i + 1] === "-") {
      /* BUGFIX: long comments --[[ ]] and --[==[ ]==] were treated as line comments,
         so their bodies leaked into the token stream and broke parsing when
         "Strip comments" was off. */
      const lm = /^--\[(=*)\[/.exec(s.slice(i, i + 80));
      if (lm) {
        const close = "]" + lm[1] + "]";
        const e = s.indexOf(close, i + lm[0].length);
        const end = e < 0 ? s.length : e + close.length;
        for (let k = i; k < end; k++) if (s[k] === "\n") { l++; ls = k + 1; }
        i = end;
        continue;
      }
      const e = s.indexOf("\n", i);
      i = e < 0 ? s.length : e;
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      m = /\w+/y; m.lastIndex = i;
      const start = i;
      const w = m.exec(s)[0];
      i += w.length;
      add(KW.has(w) ? "kw" : "id", w, start, w.length);
      continue;
    }
    if (/\d/.test(c) || (c === "." && /\d/.test(s[i + 1]))) {
      NUM_.lastIndex = i;
      const start = i;
      m = NUM_.exec(s);
      const raw = m[0];
      add("num", raw.replace(/_/g, ""), start, raw.length);
      i += raw.length;
      continue;
    }
    if (c === '"' || c === "'") {
      const start = i;
      let o = ""; i++;
      for (;;) {
        const d = s[i];
        if (d === undefined || d === "\n") E("unterminated string");
        i++;
        if (d === c) break;
        if (d === "\\") {
          try { const r = decodeLuaEscape(s, i); o += r.ch; i = r.next; }
          catch (error) { E(error && error.message ? error.message : "invalid string escape"); }
        }
        else o += d;
      }
      add("str", o, start, i - start);
      continue;
    }
    if (c === "`") {
      const start = i;
      i++;
      let o = "";
      for (;;) {
        if (i >= s.length) E("unterminated interpolated string");
        const d = s[i++];
        if (d === "`") break;
        /* v8.1-41: an escaped backtick (\`) must not end the literal. */
        if (d === "\\" && i < s.length) { o += d + s[i++]; continue; }
        o += d;
      }
      add("str", o, start, i - start);
      continue;
    }
    if (c === "[") {
      /* BUGFIX: long strings [[...]] / [==[...]==] were not tokenized at all. */
      const lm2 = /^\[(=*)\[/.exec(s.slice(i, i + 80));
      if (lm2) {
        const close = "]" + lm2[1] + "]";
        const bodyStart = i + lm2[0].length;
        const e2 = s.indexOf(close, bodyStart);
        if (e2 < 0) E("unterminated long string");
        let body = s.slice(bodyStart, e2);
        if (body[0] === "\n") body = body.slice(1);
        const end2 = e2 + close.length;
        const startPos = i;
        for (let k = i; k < end2; k++) if (s[k] === "\n") { l++; ls = k + 1; }
        add("str", body, startPos, end2 - startPos);
        i = end2;
        continue;
      }
    }
    const o = OPS.find(op => s.startsWith(op, i));
    if (!o) E("unexpected '" + c + "'");
    const start = i;
    i += o.length;
    add("op", o, start, o.length);
  }
  T.push({ t: "eof", v: "", l, c: i - ls + 1, pos: i, len: 0 });
  return { T };
}

// Drop token-held plaintext and source spans as soon as a transform has copied
// the required values into its AST/output. JavaScript strings are immutable, so
// this releases references; it cannot guarantee physical zeroization of strings.
function __wsReleaseTokens(tokens) {
  if (!Array.isArray(tokens)) return;
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (!token || typeof token !== "object") continue;
    token.v = "";
    token.t = "";
    token.l = 0;
    token.c = 0;
    token.pos = 0;
    token.len = 0;
  }
  tokens.length = 0;
}

/* Rewrites every long string token as an ordinary quoted literal so later passes
   (renaming, string encoding, line collapsing) never see raw newlines or quotes inside it. */
/* v8.1-41: comment removal that skips string literals. The old regex removed everything
   from any "--" to end of line, so "a--b" inside a quoted string was cut in half. */
function stripComments(src) {
  let out = "", i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    if (c === '"' || c === "'" || c === "`") {
      let j = i + 1;
      while (j < n && src[j] !== c && src[j] !== "\n") j += src[j] === "\\" ? 2 : 1;
      out += src.slice(i, Math.min(j + 1, n));
      i = j + 1;
      continue;
    }
    if (c === "-" && src[i + 1] === "-") {
      // Luau compilation directives are meaningful only at the beginning of the file.
      // Do not preserve directive-looking comments in later blocks as if they were active.
      const atFileStart = /^(?:\uFEFF)?[ \t\r]*$/.test(src.slice(0, i));
      const directive = atFileStart ? /^--!(?:strict|nonstrict|nocheck)\b[^\n]*/.exec(src.slice(i)) : null;
      if (directive) { out += directive[0]; i += directive[0].length; continue; }
      const lm = /^--\[(=*)\[/.exec(src.slice(i, i + 80));
      if (lm) {
        const close = "]" + lm[1] + "]";
        const e = src.indexOf(close, i + lm[0].length);
        i = e < 0 ? n : e + close.length;
        continue;
      }
      const e = src.indexOf("\n", i);
      i = e < 0 ? n : e;
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

function compactLuaSingleLine(src) {
  // Lexically safe minifier. Literal bytes are preserved; whitespace survives only
  // where removing it would merge identifiers, numbers, comments, or Luau operators.
  let out = "", pendingSpace = false, i = 0;
  const isWord = c => !!c && /[A-Za-z0-9_]/.test(c);
  const multiOps = new Set(["...", "..", "..=", "//", "//=", "<<", ">>", "::", "->", "==", "~=", "<=", ">=", "+=", "-=", "*=", "/=", "%=", "^=", "&=", "|=", "<<=", ">>="]);
  const needsSeparator = (a, b) => {
    if (!a || !b) return false;
    if (isWord(a) && isWord(b)) return true;
    if ((/[0-9]/.test(a) && b === ".") || (a === "." && /[0-9]/.test(b))) return true;
    if (a === "-" && b === "-") return true;
    if (multiOps.has(a + b)) return true;
    return false;
  };
  while (i < src.length) {
    const c = src[i];
    if (c === "\"" || c === "'" || c === "`") {
      if (pendingSpace && needsSeparator(out[out.length - 1], c)) out += " ";
      pendingSpace = false;
      const q = c, begin = i++;
      while (i < src.length) {
        if (src[i] === "\\") { i += 2; continue; }
        if (src[i] === q) { i++; break; }
        i++;
      }
      out += src.slice(begin, Math.min(i, src.length));
      continue;
    }
    if (/\s/.test(c)) { pendingSpace = true; i++; continue; }
    if (pendingSpace && needsSeparator(out[out.length - 1], c)) out += " ";
    pendingSpace = false;
    out += c;
    i++;
  }
  return out.trim();
}
function normalizeLongStrings(src) {
  let T;
  try { T = lex(src).T; } catch (_) { return src; }
  let out = "", cursor = 0, changed = false;
  try {
    for (const t of T) {
      if (t.t === "str" && src[t.pos] === "[") {
        out += src.slice(cursor, t.pos) + luaStrLit(t.v);
        cursor = t.pos + t.len;
        changed = true;
      }
    }
    return changed ? out + src.slice(cursor) : src;
  } finally {
    __wsReleaseTokens(T);
  }
}

/* v8.1-40 (P0): backtick strings with {expr} interpolation (Luau).
   Converts `Hello {name}` into ("Hello " .. tostring(name)) at the source-text level,
   before renaming, so the inner expression is renamed like any other code.
   Brace matching skips quoted strings; `\{` and other escapes are decoded. */
function __wsSkipQuotedText(raw, start, quote) {
  let i = start + 1;
  while (i < raw.length) {
    const c = raw[i++];
    if (c === "\\") { i++; continue; }
    if (c === quote) return i;
  }
  return raw.length;
}
function __wsSkipLongBracket(raw, start) {
  const open = /^\[(=*)\[/.exec(raw.slice(start, start + 80));
  if (!open) return -1;
  const close = "]" + open[1] + "]";
  const end = raw.indexOf(close, start + open[0].length);
  return end < 0 ? raw.length : end + close.length;
}
function __wsFindInterpolationEnd(raw, start) {
  let depth = 1, i = start;
  while (i < raw.length) {
    const c = raw[i];
    if (c === "-" && raw[i + 1] === "-") {
      const longComment = /^--\[(=*)\[/.exec(raw.slice(i, i + 82));
      if (longComment) {
        const close = "]" + longComment[1] + "]";
        const end = raw.indexOf(close, i + longComment[0].length);
        i = end < 0 ? raw.length : end + close.length;
      } else {
        const end = raw.indexOf("\n", i + 2);
        i = end < 0 ? raw.length : end + 1;
      }
      continue;
    }
    if (c === "\"" || c === "'") { i = __wsSkipQuotedText(raw, i, c); continue; }
    if (c === "`") {
      // Nested template text is treated as an opaque string while finding the
      // outer interpolation delimiter; escaped backticks do not terminate it.
      i = __wsSkipQuotedText(raw, i, "`");
      continue;
    }
    if (c === "[") {
      const end = __wsSkipLongBracket(raw, i);
      if (end >= 0) { i = end; continue; }
    }
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return i;
    }
    i++;
  }
  return -1;
}

function buildInterpolation(raw) {
  const parts = [];
  let buf = "";
  let i = 0;
  while (i < raw.length) {
    const c = raw[i];
    if (c === "\\") {
      const r = decodeLuaEscape(raw, i + 1);
      buf += r.ch;
      i = r.next;
      continue;
    }
    if (c === "{") {
      const j = __wsFindInterpolationEnd(raw, i + 1);
      if (j >= 0) {
        if (buf.length) parts.push({ s: buf });
        buf = "";
        parts.push({ e: raw.slice(i + 1, j) });
        i = j + 1;
        continue;
      }
    }
    buf += c;
    i++;
  }
  if (buf.length) parts.push({ s: buf });
  if (!parts.some(p => p.e !== undefined)) return luaStrLit(buf);
  const pieces = parts.map(p => p.e !== undefined ? "tostring(" + p.e + ")" : luaStrLit(p.s));
  return "(" + pieces.join(" .. ") + ")";
}

function convertInterpolatedStrings(src) {
  let T;
  try { T = lex(src).T; } catch (_) { return { code: src, changed: false }; }
  let out = "", cursor = 0, changed = false;
  try {
    for (const t of T) {
      if (t.t === "str" && src[t.pos] === "`") {
        const raw = src.slice(t.pos + 1, t.pos + t.len - 1);
        out += src.slice(cursor, t.pos) + buildInterpolation(raw);
        cursor = t.pos + t.len;
        changed = true;
      }
    }
    return { code: changed ? out + src.slice(cursor) : src, changed };
  } finally {
    __wsReleaseTokens(T);
  }
}

/* ========== FULL AST PARSER (Stage 4 style) ========== */
function parseProgram(T) {
  let p = 0;
  const cur = () => T[p];
  const peek = (n = 1) => T[Math.min(p + n, T.length - 1)];
  const atEnd = () => cur().t === "eof";
  function err(m) {
    const tk = cur();
    const e = new SyntaxError("Invalid Luau source.");
    e.code = "WSF_PARSE_ERROR";
    e.diagnostic = String(m) + " near '" + (tk.v || tk.t) + "'";
    e.line = tk.l; e.col = tk.c;
    throw e;
  }
  const isKw = v => cur().t === "kw" && cur().v === v;
  const isOp = v => cur().t === "op" && cur().v === v;
  const acceptKw = v => isKw(v) && (p++, true);
  const acceptOp = v => isOp(v) && (p++, true);
  const expectKw = v => { if (!acceptKw(v)) err("expected '" + v + "'"); };
  const expectOp = v => { if (!acceptOp(v)) err("expected '" + v + "'"); };
  function expectName() {
    if (cur().t !== "id") err("expected identifier");
    const v = cur().v; p++; return v;
  }
  function blockEndKw() {
    return cur().t === "kw" && ["end", "else", "elseif", "until"].includes(cur().v);
  }

  function parseBlock() {
    const stmts = [];
    while (!atEnd() && !blockEndKw()) {
      if (acceptOp(";")) continue;
      if (isKw("return")) { stmts.push(parseReturn()); break; }
      stmts.push(parseStatement());
    }
    return { type: "Block", body: stmts };
  }

  function parseReturn() {
    const line = cur().l; p++;
    const exprs = [];
    if (!blockEndKw() && !atEnd() && !isOp(";")) {
      exprs.push(parseExpr());
      while (acceptOp(",")) exprs.push(parseExpr());
    }
    acceptOp(";");
    return { type: "Return", args: exprs, line };
  }

  /* Consume a Luau generic parameter list, including nested constraints and >> closers.
     Generic declarations are erased later, but parsing their boundaries must be exact. */
  function skipGenericParameterList() {
    if (!acceptOp("<")) return false;
    let depth = 1, paren = 0, brace = 0, bracket = 0;
    while (!atEnd() && depth > 0) {
      const t = cur();
      if (t.t === "op") {
        if (t.v === "<") depth++;
        else if (t.v === ">") depth--;
        else if (t.v === ">>") depth = Math.max(0, depth - 2);
        else if (t.v === "(") paren++;
        else if (t.v === ")") paren = Math.max(0, paren - 1);
        else if (t.v === "{") brace++;
        else if (t.v === "}") brace = Math.max(0, brace - 1);
        else if (t.v === "[") bracket++;
        else if (t.v === "]") bracket = Math.max(0, bracket - 1);
      }
      p++;
    }
    if (depth > 0) err("unterminated generic parameter list");
    return true;
  }

  /* Luau type skipper: keep nested containers/generics balanced so annotations,
     aliases, function types, optional/union/intersection types and casts cannot
     consume the following expression. Types are erased by this AST-to-VM pipeline. */
  function parseTypeExpr(mode = "annotation") {
    let paren = 0, bracket = 0, brace = 0, angle = 0;
    let previous = cur();
    const top = () => paren === 0 && bracket === 0 && brace === 0 && angle === 0;
    const statementStarts = new Set(["do", "then", "end", "else", "elseif", "until", "local", "function", "return", "if", "while", "for", "repeat", "break", "continue"]);
    const expressionOps = new Set(["+", "-", "*", "/", "//", "%", "^", "..", "==", "~=", "<=", ">=", "<", ">", "and", "or"]);
    for (;;) {
      const t = cur();
      if (t.t === "eof") return;
      if (top()) {
        if (t.t === "op" && [",", ";", "=", ")", "]", "}"].includes(t.v)) return;
        if (t.t === "kw" && statementStarts.has(t.v)) return;
        // `type`/`export type` are contextual identifiers in the lexer. Stop an
        // alias before the next declaration rather than swallowing its `=` token.
        if (mode === "alias" && t.t === "id" &&
            ((t.v === "type" && peek(1).t === "id") ||
             (t.v === "export" && peek(1).t === "id" && peek(1).v === "type"))) return;
        if (mode === "cast" && t.t === "op" && expressionOps.has(t.v)) return;
        // A return annotation ends at the first statement-like token on a later line.
        // Newline boundaries are only used for unmistakable call/assignment starts;
        // multiline union/intersection types remain consumable.
        if (mode === "return" && t.l > previous.l && t.t === "id" &&
            (peek(1).v === "(" || peek(1).v === "=" || peek(1).v === ".")) return;
      }
      if (t.t === "op") {
        if (t.v === "(") paren++;
        else if (t.v === ")") { if (paren === 0) return; paren--; }
        else if (t.v === "[") bracket++;
        else if (t.v === "]") { if (bracket === 0) return; bracket--; }
        else if (t.v === "{") brace++;
        else if (t.v === "}") { if (brace === 0) return; brace--; }
        else if (t.v === "<") angle++;
        else if (t.v === ">") { if (angle > 0) angle--; else if (mode === "cast") return; }
        else if (t.v === ">>" && angle > 0) angle = Math.max(0, angle - 2);
      }
      previous = t;
      p++;
    }
  }

  function parseNameWithAttrib() {
    const name = expectName();
    if (acceptOp("<")) { expectName(); expectOp(">"); }
    if (acceptOp(":")) parseTypeExpr("annotation");
    return name;
  }

  /* Luau attributes are compile-time annotations. Consume their balanced payloads
     without feeding them into the runtime AST. Supports @native, @deprecated(...),
     @[attribute, attribute(...)] and the parenthesized/table/string payload forms. */
  function skipAttributePayload(open) {
    const closeFor = { "(": ")", "[": "]", "{": "}" };
    const firstClose = closeFor[open];
    if (!firstClose || !acceptOp(open)) err("expected attribute payload");
    const stack = [firstClose];
    while (!atEnd() && stack.length) {
      const t = cur();
      if (t.t === "op") {
        if (closeFor[t.v]) stack.push(closeFor[t.v]);
        else if ([")", "]", "}"].includes(t.v)) {
          if (stack[stack.length - 1] !== t.v) err("mismatched attribute payload delimiter");
          stack.pop();
        }
      }
      p++;
    }
    if (stack.length) err("unterminated attribute payload");
  }
  function skipAttributes() {
    let seen = false;
    while (acceptOp("@")) {
      seen = true;
      if (cur().t === "id") p++;
      else if (isOp("[")) skipAttributePayload("[");
      else err("expected attribute name");
      if (isOp("(") || isOp("{")) skipAttributePayload(cur().v);
      else if (cur().t === "str") p++;
    }
    return seen;
  }

  function parseStatement() {
    const line = cur().l;
    if (isOp("@")) {
      skipAttributes();
      return parseStatement();
    }
    if (acceptKw("break")) return { type: "Break", line };
    /* FIX #11: continue as contextual keyword (identifier form) */
    if (cur().t === "id" && cur().v === "continue") { p++; return { type: "Continue", line }; }
    if (acceptKw("do")) {
      const b = parseBlock(); expectKw("end");
      return { type: "Do", body: b, line };
    }
    if (acceptKw("while")) {
      const cond = parseExpr(); expectKw("do");
      const b = parseBlock(); expectKw("end");
      return { type: "While", cond, body: b, line };
    }
    if (acceptKw("repeat")) {
      const b = parseBlock(); expectKw("until");
      const cond = parseExpr();
      return { type: "Repeat", body: b, cond, line };
    }
    if (acceptKw("if")) {
      const clauses = [];
      const cond = parseExpr(); expectKw("then");
      const b = parseBlock();
      clauses.push({ cond, body: b });
      while (acceptKw("elseif")) {
        const c2 = parseExpr(); expectKw("then");
        const b2 = parseBlock();
        clauses.push({ cond: c2, body: b2 });
      }
      let elseBody = null;
      if (acceptKw("else")) elseBody = parseBlock();
      expectKw("end");
      return { type: "If", clauses, elseBody, line };
    }
    if (acceptKw("for")) {
      const n1 = expectName();
      if (acceptOp("=")) {
        const start = parseExpr(); expectOp(",");
        const stop = parseExpr();
        let step = null;
        if (acceptOp(",")) step = parseExpr();
        expectKw("do");
        const b = parseBlock(); expectKw("end");
        return { type: "NumericFor", var: n1, start, stop, step, body: b, line };
      } else {
        const names = [n1];
        while (acceptOp(",")) names.push(expectName());
        expectKw("in");
        const exprs = [parseExpr()];
        while (acceptOp(",")) exprs.push(parseExpr());
        expectKw("do");
        const b = parseBlock(); expectKw("end");
        return { type: "GenericFor", names, exprs, body: b, line };
      }
    }
    if (acceptKw("function")) {
      let base = { type: "Name", name: expectName(), line };
      let isMethod = false;
      for (;;) {
        if (acceptOp(".")) {
          base = { type: "Index", obj: base, key: { type: "Str", value: expectName() }, computed: false, line };
          continue;
        }
        if (acceptOp(":")) {
          base = { type: "Index", obj: base, key: { type: "Str", value: expectName() }, computed: false, line };
          isMethod = true;
          break;
        }
        break;
      }
      const fn = parseFunctionBody(isMethod, line);
      return { type: "Assign", targets: [base], exprs: [fn], line };
    }
    if (acceptKw("const")) {
      if (acceptKw("function")) {
        const name = expectName();
        const fn = parseFunctionBody(false, line);
        return { type: "LocalFunction", name, func: fn, line, isConst: true };
      }
      const names = [parseNameWithAttrib()];
      while (acceptOp(",")) names.push(parseNameWithAttrib());
      expectOp("=");
      const exprs = [parseExpr()];
      while (acceptOp(",")) exprs.push(parseExpr());
      return { type: "Local", names, exprs, line, isConst: true };
    }
    if (acceptKw("local")) {
      if (isOp("@")) skipAttributes();
      if (acceptKw("function")) {
        const name = expectName();
        const fn = parseFunctionBody(false, line);
        return { type: "LocalFunction", name, func: fn, line };
      }
      const names = [parseNameWithAttrib()];
      while (acceptOp(",")) names.push(parseNameWithAttrib());
      let exprs = [];
      if (acceptOp("=")) {
        exprs.push(parseExpr());
        while (acceptOp(",")) exprs.push(parseExpr());
      }
      return { type: "Local", names, exprs, line };
    }
    if ((cur().t === "id" && cur().v === "type" && peek(1).v === "function") ||
        (cur().t === "id" && cur().v === "export" && peek(1).v === "type" && peek(2).v === "function")) {
      if (cur().v === "export") p++;
      p++; // type
      p++; // function
      expectName();
      parseFunctionBody(false, line);
      return { type: "TypeAlias", line, typeFunction: true };
    }
    if ((cur().t === "id" && cur().v === "type" && peek(1).t === "id") ||
        (cur().t === "id" && cur().v === "export" && peek(1).t === "id" && peek(1).v === "type" && peek(2).t === "id")) {
      if (cur().t === "id" && cur().v === "export") p++;
      p++;
      expectName();
      skipGenericParameterList();
      expectOp("=");
      parseTypeExpr("alias");
      return { type: "TypeAlias", line };
    }
    const first = parseSuffixedExpr();
    if (isOp("=") || isOp(",")) {
      const targets = [first];
      while (acceptOp(",")) targets.push(parseSuffixedExpr());
      expectOp("=");
      const exprs = [parseExpr()];
      while (acceptOp(",")) exprs.push(parseExpr());
      return { type: "Assign", targets, exprs, line };
    }
    if (cur().t === "op" && ["+=", "-=", "*=", "/=", "//=", "%=", "^=", "..="].includes(cur().v)) {
      const op = cur().v.slice(0, -1); p++;
      const rhs = parseExpr();
      return { type: "Assign", targets: [first], exprs: [{ type: "BinOp", op, l: first, r: rhs }], line };
    }
    if (first.type !== "Call") err("syntax error (expression statement must be a call)");
    return { type: "CallStat", call: first, line };
  }

  function parseFunctionBody(isMethod, line) {
    skipGenericParameterList();
    expectOp("(");
    const params = [];
    let vararg = false;
    if (isMethod) params.push("self");
    if (!isOp(")")) {
      for (;;) {
        if (acceptOp("...")) {
          vararg = true;
          if (acceptOp(":")) parseTypeExpr("annotation");
          break;
        }
        params.push(parseNameWithAttrib());
        if (!acceptOp(",")) break;
      }
    }
    expectOp(")");
    if (acceptOp(":")) parseTypeExpr("return");
    const body = parseBlock();
    expectKw("end");
    return { type: "Function", params, vararg, body, line };
  }

  const BINPREC = {
    "or": [1, 1], "and": [2, 2],
    "<": [3, 3], ">": [3, 3], "<=": [3, 3], ">=": [3, 3], "~=": [3, 3], "==": [3, 3],
    "|": [4, 4], "~": [5, 5], "&": [6, 6], "<<": [7, 7], ">>": [7, 7], "..": [9, 8],
    "+": [10, 10], "-": [10, 10],
    "*": [11, 11], "/": [11, 11], "//": [11, 11], "%": [11, 11],
    "^": [14, 13]
  };
  const UNARY_PREC = 12;

  function parseExpr(limit = 0) {
    let left;
    if (isKw("not")) { p++; left = { type: "UnOp", op: "not", e: parseExpr(UNARY_PREC) }; }
    else if (isOp("-")) { p++; left = { type: "UnOp", op: "-", e: parseExpr(UNARY_PREC) }; }
    else if (isOp("#")) { p++; left = { type: "UnOp", op: "#", e: parseExpr(UNARY_PREC) }; }
    else if (isOp("~")) { p++; left = { type: "UnOp", op: "~", e: parseExpr(UNARY_PREC) }; }
    else left = parseSimpleExpr();
    for (;;) {
      let opTok = null;
      if (cur().t === "op" && BINPREC[cur().v]) opTok = cur().v;
      else if (cur().t === "kw" && (cur().v === "and" || cur().v === "or")) opTok = cur().v;
      if (!opTok) break;
      const [lp, rp] = BINPREC[opTok];
      if (lp <= limit) break;
      p++;
      const right = parseExpr(rp);
      left = { type: "BinOp", op: opTok, l: left, r: right };
    }
    return left;
  }

  function parseSimpleExpr() {
    const t = cur();
    if (t.t === "num") { p++; return { type: "Num", value: t.v }; }
    if (t.t === "str") { p++; return { type: "Str", value: t.v }; }
    if (isKw("nil")) { p++; return { type: "Nil" }; }
    if (isKw("true")) { p++; return { type: "True" }; }
    if (isKw("false")) { p++; return { type: "False" }; }
    if (acceptOp("...")) return { type: "Vararg" };
    if (isOp("@")) {
      skipAttributes();
      if (!acceptKw("function")) err("attributes can only precede a function expression");
      return parseFunctionBody(false, t.l);
    }
    if (isKw("function")) { p++; return parseFunctionBody(false, t.l); }
    /* UPGRADE #3: Luau if-expression (if c then a else b) */
    if (isKw("if")) {
      p++;
      const branches = [];
      let cond = parseExpr();
      expectKw("then");
      let yes = parseExpr();
      branches.push({ cond, yes });
      while (acceptKw("elseif")) {
        cond = parseExpr();
        expectKw("then");
        yes = parseExpr();
        branches.push({ cond, yes });
      }
      expectKw("else");
      let no = parseExpr();
      for (let i = branches.length - 1; i >= 0; i--) {
        no = { type: "IfExpr", cond: branches[i].cond, yes: branches[i].yes, no };
      }
      return no;
    }
    if (isOp("{")) return parseTableExpr();
    return parseSuffixedExpr();
  }

  function parsePrimaryExpr() {
    if (acceptOp("(")) {
      const e = parseExpr(); expectOp(")");
      return { type: "Paren", e };
    }
    if (cur().t === "id") {
      const n = cur().v; p++;
      return { type: "Name", name: n };
    }
    err("unexpected symbol");
  }

  function parseSuffixedExpr() {
    let e = parsePrimaryExpr();
    for (;;) {
      if (acceptOp(".")) {
        const k = expectName();
        e = { type: "Index", obj: e, key: { type: "Str", value: k }, computed: false };
        continue;
      }
      if (acceptOp("[")) {
        const k = parseExpr(); expectOp("]");
        e = { type: "Index", obj: e, key: k, computed: true };
        continue;
      }
      if (acceptOp(":")) {
        const m = expectName();
        const args = parseArgs();
        e = { type: "Call", fn: e, method: m, args };
        continue;
      }
      if (isOp("(") || isOp("{") || cur().t === "str") {
        const args = parseArgs();
        e = { type: "Call", fn: e, method: null, args };
        continue;
      }
      if (acceptOp("::")) { parseTypeExpr("cast"); continue; }
      break;
    }
    return e;
  }

  function parseArgs() {
    if (cur().t === "str") {
      const v = cur().v; p++;
      return [{ type: "Str", value: v }];
    }
    if (isOp("{")) return [parseTableExpr()];
    expectOp("(");
    const args = [];
    if (!isOp(")")) {
      args.push(parseExpr());
      while (acceptOp(",")) args.push(parseExpr());
    }
    expectOp(")");
    return args;
  }

  function parseTableExpr() {
    expectOp("{");
    const fields = [];
    while (!isOp("}")) {
      if (isOp("[")) {
        p++;
        const k = parseExpr(); expectOp("]"); expectOp("=");
        const v = parseExpr();
        fields.push({ key: k, value: v });
      } else if (cur().t === "id" && peek(1).t === "op" && peek(1).v === "=") {
        const k = cur().v; p += 2;
        const v = parseExpr();
        fields.push({ key: { type: "Str", value: k }, value: v });
      } else {
        const v = parseExpr();
        fields.push({ key: null, value: v });
      }
      if (!acceptOp(",") && !acceptOp(";")) break;
    }
    expectOp("}");
    return { type: "Table", fields };
  }

  const block = parseBlock();
  if (!atEnd()) err("unexpected token '" + (cur().v || cur().t) + "'");
  return block;
}

/* ========== PRETTY-PRINTER (AST → source) ========== */
/* FIX #10: compact flag managed only via emitProgram entry */
let _emitCompact = false;

function emitExpr(e) {
  return emitExprInner(e, 0);
}
const EMIT_PREC = {
  "or": 1, "and": 2,
  "<": 3, ">": 3, "<=": 3, ">=": 3, "~=": 3, "==": 3,
  "|": 4, "&": 5, "..": 9,
  "+": 10, "-": 10,
  "*": 11, "/": 11, "//": 11, "%": 11,
  "^": 14
};
const EMIT_UNARY_PREC = 12;

/* BUGFIX: JSON.stringify emits \u00XX for control characters, which is not a valid
   Luau escape. Emit Lua-style escapes instead. */
function luaStrLit(v) {
  let out = '"';
  for (const ch of String(v)) {
    const c = ch.codePointAt(0);
    if (ch === '"') out += '\\"';
    else if (ch === "\\") out += "\\\\";
    else if (ch === "\n") out += "\\n";
    else if (ch === "\r") out += "\\r";
    else if (c < 32 || c === 127) out += "\\" + String(c).padStart(3, "0");
    else out += ch;
  }
  return out + '"';
}

function emitExprInner(e, parentPrec) {
  if (!e) return "";
  let out = "";
  let myPrec = 99;
  switch (e.type) {
    case "Nil": return "nil";
    case "True": return "true";
    case "False": return "false";
    case "Num": return String(e.value);
    case "Str": return luaStrLit(e.value);
    case "Vararg": return "...";
    case "Name": return e.name;
    case "Paren": return "(" + emitExprInner(e.e, 0) + ")";
    case "UnOp": {
      /* BUGFIX: "- -x" was emitted as "--x", which Luau reads as a comment. */
      const innerSrc = emitExprInner(e.e, EMIT_UNARY_PREC);
      out = e.op + (e.op === "not" || innerSrc.startsWith("-") ? " " : "") + innerSrc;
      myPrec = EMIT_UNARY_PREC;
      break;
    }
    case "BinOp": {
      const p = EMIT_PREC[e.op] || 0;
      const rightAssoc = e.op === ".." || e.op === "^";
      out = emitExprInner(e.l, rightAssoc ? p + 0.1 : p) + " " + e.op + " " +
            emitExprInner(e.r, rightAssoc ? p : p + 0.1);
      myPrec = p;
      break;
    }
    case "Index":
      if (e.computed) return emitExprInner(e.obj, 99) + "[" + emitExprInner(e.key, 0) + "]";
      return emitExprInner(e.obj, 99) + "." + e.key.value;
    case "Call": {
      const base = e.method
        ? emitExprInner(e.fn, 99) + ":" + e.method
        : emitExprInner(e.fn, 99);
      if (e.args.length === 1 && e.args[0].type === "Str") return base + "(" + emitExprInner(e.args[0], 0) + ")";
      if (e.args.length === 1 && e.args[0].type === "Table") return base + "(" + emitExprInner(e.args[0], 0) + ")";
      return base + "(" + e.args.map(a => emitExprInner(a, 0)).join(",") + ")";
    }
    case "Table": {
      const parts = e.fields.map(f => {
        if (f.key === null) return emitExprInner(f.value, 0);
        if (f.key.type === "Str" && /^[A-Za-z_]\w*$/.test(f.key.value))
          return f.key.value + "=" + emitExprInner(f.value, 0);
        return "[" + emitExprInner(f.key, 0) + "]=" + emitExprInner(f.value, 0);
      });
      return "{" + parts.join(",") + "}";
    }
    case "IfExpr":
      return "(if " + emitExprInner(e.cond, 0) + " then " + emitExprInner(e.yes, 0) + " else " + emitExprInner(e.no, 0) + ")";
    case "Function": {
      /* BUGFIX (v8.1-32): a function used as a callee or index target
         (e.g. the and/or IIFE `(function() ... end)()`) must be parenthesized,
         otherwise it emits `function() ... end()` which is a syntax error. */
      const fsrc = "function(" + e.params.join(",") + (e.vararg ? (e.params.length ? ",..." : "...") : "") + ")" +
        emitBlock(e.body, 0) + "end";
      return parentPrec >= 99 ? "(" + fsrc + ")" : fsrc;
    }
    default: return "/*?" + e.type + "*/";
  }
  return myPrec < parentPrec ? "(" + out + ")" : out;
}


function emitBlock(block, indent) {
  return (block.body || []).map(s => emitStat(s, indent)).join(_emitCompact ? " " : "");
}

function emitStat(s, indent) {
  const nl = _emitCompact ? " " : "\n";
  const pad = _emitCompact ? "" : "  ".repeat(indent);
  switch (s.type) {
    case "Local": {
      let t = pad + "local " + s.names.join(",");
      if (s.exprs && s.exprs.length) t += "=" + s.exprs.map(e => emitExprInner(e, 0)).join(",");
      return t + (_emitCompact ? " " : "\n");
    }
    case "Assign":
      return pad + s.targets.map(e => emitExprInner(e, 0)).join(",") + "=" + s.exprs.map(e => emitExprInner(e, 0)).join(",") + (_emitCompact ? " " : "\n");
    case "CallStat":
      return pad + emitExprInner(s.call, 0) + (_emitCompact ? " " : "\n");
    case "Do":
      return pad + "do " + emitBlock(s.body, indent + 1) + pad + "end" + (_emitCompact ? " " : "\n");
    case "While":
      return pad + "while " + emitExprInner(s.cond, 0) + " do " + emitBlock(s.body, indent + 1) + pad + "end" + (_emitCompact ? " " : "\n");
    case "Repeat":
      return pad + "repeat " + emitBlock(s.body, indent + 1) + pad + "until " + emitExprInner(s.cond, 0) + (_emitCompact ? " " : "\n");
    case "If": {
      let t = pad + "if " + emitExprInner(s.clauses[0].cond, 0) + " then " + emitBlock(s.clauses[0].body, indent + 1);
      for (let i = 1; i < s.clauses.length; i++) {
        t += pad + "elseif " + emitExprInner(s.clauses[i].cond, 0) + " then " + emitBlock(s.clauses[i].body, indent + 1);
      }
      if (s.elseBody) t += pad + "else " + emitBlock(s.elseBody, indent + 1);
      return t + pad + "end" + (_emitCompact ? " " : "\n");
    }
    case "NumericFor": {
      let t = pad + "for " + s.var + "=" + emitExprInner(s.start, 0) + "," + emitExprInner(s.stop, 0);
      if (s.step) t += "," + emitExprInner(s.step, 0);
      return t + " do " + emitBlock(s.body, indent + 1) + pad + "end" + (_emitCompact ? " " : "\n");
    }
    case "GenericFor":
      return pad + "for " + s.names.join(",") + " in " + s.exprs.map(e => emitExprInner(e, 0)).join(",") + " do " +
        emitBlock(s.body, indent + 1) + pad + "end" + (_emitCompact ? " " : "\n");
    case "LocalFunction":
      return pad + "local function " + s.name + "(" + s.func.params.join(",") +
        (s.func.vararg ? (s.func.params.length ? ",..." : "...") : "") + ")" +
        emitBlock(s.func.body, indent + 1) + pad + "end" + (_emitCompact ? " " : "\n");
    case "Break": return pad + "break" + (_emitCompact ? " " : "\n");
    case "Continue": return pad + "continue" + (_emitCompact ? " " : "\n");
    case "Return":
      return pad + "return" + (s.args.length ? " " + s.args.map(e => emitExprInner(e, 0)).join(",") : "") + (_emitCompact ? " " : "\n");
    case "TypeAlias": return "";
    default: return "";
  }
}

/* FIX #10: save/restore compact flag so callers cannot leak state */
function emitProgram(ast, compact) {
  const prev = _emitCompact;
  _emitCompact = compact === undefined ? false : !!compact;
  try {
    return emitBlock(ast, 0);
  } finally {
    _emitCompact = prev;
  }
}


/* ========== KEYWORD HIDING (and/or/elseif exposure reduction) ==========
 * True reserved words (end, local, function, while, if, then, ...) cannot be
 * renamed in Luau source. We reduce their surface patterns by:
 *   1) Rewriting `and` / `or` BinOps into short-circuit if-expressions or IIFEs (no and/or tokens)
 *   2) Nesting elseif chains as else + if (eliminates `elseif` token)
 *   3) CFF state machines further scramble if/while; Bytecode VM removes them
 */
function __wsHasCurrentScopeVararg(node) {
  if (!node || typeof node !== "object") return false;
  if (node.type === "Vararg") return true;
  // A nested function owns its own vararg scope; do not treat its `...` as
  // belonging to the surrounding expression being lowered.
  if (node.type === "Function") return false;
  if (Array.isArray(node)) return node.some(__wsHasCurrentScopeVararg);
  for (const value of Object.values(node)) {
    if (value && typeof value === "object" && __wsHasCurrentScopeVararg(value)) return true;
  }
  return false;
}

function rewriteExprKeywords(e, level) {
  if (!e) return e;
  switch (e.type) {
    case "BinOp": {
      const l = rewriteExprKeywords(e.l, level);
      const r = rewriteExprKeywords(e.r, level);
      if (level >= 2 && (e.op === "and" || e.op === "or")) {
        // A source-level IIFE cannot legally reference the enclosing function's
        // varargs. Keep that specific expression native rather than emitting
        // invalid Luau. Nested functions have independent vararg scopes.
        if (__wsHasCurrentScopeVararg(l) || __wsHasCurrentScopeVararg(r)) return { ...e, l, r };
        // Always capture the left operand once. Repeating even a bare global name
        // in an if-expression can change semantics when the environment uses
        // metatable-backed lookup with side effects.
        const tmp = freshKeywordTempName();
        const shapeCount = level >= 3 ? 3 : 2;
        const iifeShape = secureRandomFloat() * shapeCount | 0;
        const resultName = iifeShape === 2 ? freshKeywordTempName() : null;
        // Parentheses force the right operand to one value. A bare `return f()`
        // inside the generated IIFE could otherwise leak multiple return values.
        const rightSingle = { type: "Paren", e: r };
        const truthyValue = e.op === "and" ? rightSingle : { type: "Name", name: tmp };
        const falseValue = e.op === "and" ? { type: "Name", name: tmp } : rightSingle;
        let body;
        if (iifeShape === 1) {
          body = [
            { type: "Local", names: [tmp], exprs: [l] },
            {
              type: "If",
              clauses: [{
                cond: { type: "Name", name: tmp },
                body: { type: "Block", body: [{ type: "Return", args: [truthyValue] }] }
              }],
              elseBody: { type: "Block", body: [{ type: "Return", args: [falseValue] }] }
            }
          ];
        } else if (iifeShape === 2) {
          body = [
            { type: "Local", names: [tmp], exprs: [l] },
            { type: "Local", names: [resultName], exprs: [] },
            {
              type: "If",
              clauses: [{
                cond: { type: "Name", name: tmp },
                body: { type: "Block", body: [{ type: "Assign", targets: [{ type: "Name", name: resultName }], exprs: [truthyValue] }] }
              }],
              elseBody: { type: "Block", body: [{ type: "Assign", targets: [{ type: "Name", name: resultName }], exprs: [falseValue] }] }
            },
            { type: "Return", args: [{ type: "Name", name: resultName }] }
          ];
        } else {
          body = [
            { type: "Local", names: [tmp], exprs: [l] },
            {
              type: "If",
              clauses: [{
                cond: e.op === "and"
                  ? { type: "UnOp", op: "not", e: { type: "Name", name: tmp } }
                  : { type: "Name", name: tmp },
                body: { type: "Block", body: [{ type: "Return", args: [{ type: "Name", name: tmp }] }] }
              }],
              elseBody: null
            },
            { type: "Return", args: [rightSingle] }
          ];
        }
        return {
          type: "Paren",
          e: {
            type: "Call",
            fn: {
              type: "Function",
              params: [],
              vararg: false,
              body: { type: "Block", body },
              line: 0,
              _kwIIFE: true
            },
            method: null,
            args: []
          }
        };
      }
      return { ...e, l, r };
    }
    case "UnOp":
      return { ...e, e: rewriteExprKeywords(e.e, level) };
    case "Paren":
      return { ...e, e: rewriteExprKeywords(e.e, level) };
    case "Index":
      return {
        ...e,
        obj: rewriteExprKeywords(e.obj, level),
        key: rewriteExprKeywords(e.key, level)
      };
    case "Call":
      return {
        ...e,
        fn: rewriteExprKeywords(e.fn, level),
        args: (e.args || []).map(a => rewriteExprKeywords(a, level))
      };
    case "Table":
      return {
        ...e,
        fields: (e.fields || []).map(f => ({
          key: f.key ? rewriteExprKeywords(f.key, level) : null,
          value: rewriteExprKeywords(f.value, level)
        }))
      };
    case "IfExpr":
      return {
        ...e,
        cond: rewriteExprKeywords(e.cond, level),
        yes: rewriteExprKeywords(e.yes, level),
        no: rewriteExprKeywords(e.no, level)
      };
    case "Function":
      return { ...e, body: rewriteBlockKeywords(e.body, level) };
    default:
      return e;
  }
}

function rewriteStatKeywords(s, level) {
  if (!s) return s;
  switch (s.type) {
    case "Local":
      return { ...s, exprs: (s.exprs || []).map(e => rewriteExprKeywords(e, level)) };
    case "Assign":
      return {
        ...s,
        targets: (s.targets || []).map(e => rewriteExprKeywords(e, level)),
        exprs: (s.exprs || []).map(e => rewriteExprKeywords(e, level))
      };
    case "CallStat":
      return { ...s, call: rewriteExprKeywords(s.call, level) };
    case "Do":
      return { ...s, body: rewriteBlockKeywords(s.body, level) };
    case "While":
      return {
        ...s,
        cond: rewriteExprKeywords(s.cond, level),
        body: rewriteBlockKeywords(s.body, level)
      };
    case "Repeat":
      return {
        ...s,
        cond: rewriteExprKeywords(s.cond, level),
        body: rewriteBlockKeywords(s.body, level)
      };
    case "If": {
      const clauses = s.clauses.map(cl => ({
        cond: rewriteExprKeywords(cl.cond, level),
        body: rewriteBlockKeywords(cl.body, level)
      }));
      let elseBody = s.elseBody ? rewriteBlockKeywords(s.elseBody, level) : null;
      if (level >= 2 && clauses.length > 1) {
        let nested = elseBody;
        for (let i = clauses.length - 1; i >= 1; i--) {
          nested = {
            type: "Block",
            body: [{ type: "If", clauses: [clauses[i]], elseBody: nested }]
          };
        }
        return { type: "If", clauses: [clauses[0]], elseBody: nested, line: s.line };
      }
      return { type: "If", clauses, elseBody, line: s.line };
    }
    case "NumericFor":
      return {
        ...s,
        start: rewriteExprKeywords(s.start, level),
        stop: rewriteExprKeywords(s.stop, level),
        step: s.step ? rewriteExprKeywords(s.step, level) : null,
        body: rewriteBlockKeywords(s.body, level)
      };
    case "GenericFor":
      return {
        ...s,
        exprs: (s.exprs || []).map(e => rewriteExprKeywords(e, level)),
        body: rewriteBlockKeywords(s.body, level)
      };
    case "LocalFunction":
      return {
        ...s,
        func: { ...s.func, body: rewriteBlockKeywords(s.func.body, level) }
      };
    case "Return":
      return { ...s, args: (s.args || []).map(e => rewriteExprKeywords(e, level)) };
    default:
      return s;
  }
}

function rewriteBlockKeywords(block, level) {
  if (!block || !block.body) return { type: "Block", body: [] };
  return { type: "Block", body: block.body.map(s => rewriteStatKeywords(s, level)) };
}

// Parser line/column metadata is useful for diagnostics but is not consumed by
// the source emitter. Drop it only after parsing and transformations have finished.
function stripAstSourceLocations(node, seen = new Set()) {
  if (!node || typeof node !== "object" || seen.has(node)) return node;
  seen.add(node);
  if (Array.isArray(node)) {
    for (const value of node) stripAstSourceLocations(value, seen);
    return node;
  }
  delete node.line;
  delete node.col;
  delete node.column;
  for (const value of Object.values(node)) stripAstSourceLocations(value, seen);
  return node;
}

function hideKeywordsAST(source, level) {
  if (level < 2) return { code: source, changed: 0 };
  _kwGeneratedNames = new Set();
  let T = null;
  try {
    T = lex(source).T;
    _cffReservedNames = new Set(T.filter(token => token && token.t === "id").map(token => token.v));
    const ast = parseProgram(T);
    __wsReleaseTokens(T);
    T = null;
    const body = rewriteBlockKeywords(ast, level);
    const transformed = stripAstSourceLocations({ type: "Block", body: body.body });
    let code = emitProgram(transformed, true);
    code = code.replace(/[ \t]+/g, " ").replace(/\s*\n\s*/g, "\n").trim();
    return { code, changed: 1 };
  } catch (e) {
    return { code: source, changed: 0, error: e.message || String(e) };
  } finally {
    if (T) __wsReleaseTokens(T);
  }
}

/* ========== AST-BASED CONTROL FLOW FLATTENING (v5.1 aggressive) ========== */
/*
  Converts safe If / While into a state-machine dispatcher:

    do
      local _s = <entry>
      while _s < 9000 do
        local _n = _s
        if _n == S1 then
          ... body ...
          _s = NEXT
        elseif _n == S2 then
          ...
        else
          _s = 9000  -- exit
        end
      end
    end

  State IDs are shuffled per region; V8.2.20 adds a separately keyed shadow token.
  Level >= 4 nests safe branch bodies as subordinate state machines.
*/

let _cffSeq = 0;
let _cffPrefix = null;
let _cffReservedNames = null;
let _kwGeneratedNames = new Set();

function freshKeywordTempName() {
  const first = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const rest = first + "0123456789_";
  for (let attempt = 0; attempt < 96; attempt++) {
    const length = 6 + (secureRandomFloat() * 12 | 0);
    let candidate = first[secureRandomFloat() * first.length | 0];
    for (let i = 1; i < length; i++) candidate += rest[secureRandomFloat() * rest.length | 0];
    if (LUA_RESERVED.has(candidate)) continue;
    if (_cffReservedNames && _cffReservedNames.has(candidate)) continue;
    if (_kwGeneratedNames.has(candidate)) continue;
    _kwGeneratedNames.add(candidate);
    if (_cffReservedNames) _cffReservedNames.add(candidate);
    return candidate;
  }
  throw new Error("Unable to allocate a collision-free keyword temporary identifier");
}
function freshStateName() {
  if (!_cffPrefix) {
    const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    // Keep generated identifiers short, but reject any prefix already present in
    // user code. The former 15–22 character random prefix inflated every CFF edge.
    for (let attempt = 0; attempt < 32; attempt++) {
      const candidate = "_" + Array.from({length: 6}, () => alphabet[secureRandomFloat() * alphabet.length | 0]).join("") + "_";
      if (!_cffReservedNames || ![..._cffReservedNames].some(name => name.startsWith(candidate))) {
        _cffPrefix = candidate;
        break;
      }
    }
    if (!_cffPrefix) throw new Error("Unable to allocate a collision-free CFF identifier prefix");
  }
  _cffSeq++;
  return _cffPrefix + _cffSeq.toString(36);
}

/* Each region receives an independently sampled exit sentinel. Live state IDs
   are 1..8999; exit sentinels span 10000..65535 and remain exactly representable. */
function freshExitId() {
  return 10000 + (secureRandomFloat() * 55536 | 0);
}

/* Split only at existing statement boundaries. The sizes vary per build, but the
   original order is preserved: this is layout diversification, not instruction reordering. */
function partitionOrderedStatements(stmts, minParts = 2, maxParts = 5) {
  if (!Array.isArray(stmts) || stmts.length < 2) return Array.isArray(stmts) && stmts.length ? [stmts.slice()] : [];
  const upper = Math.min(stmts.length, Math.max(minParts, maxParts));
  const lower = Math.min(upper, Math.max(2, minParts));
  const count = lower + (secureRandomFloat() * (upper - lower + 1) | 0);
  const chunks = [];
  let cursor = 0;
  for (let part = 0; part < count; part++) {
    const partsLeft = count - part;
    const remaining = stmts.length - cursor;
    if (partsLeft === 1) {
      chunks.push(stmts.slice(cursor));
      break;
    }
    const ideal = Math.ceil(remaining / partsLeft);
    const spread = Math.max(1, Math.floor(ideal / 2));
    const minSize = Math.max(1, ideal - spread);
    const maxSize = Math.min(remaining - (partsLeft - 1), ideal + spread);
    const size = minSize + (secureRandomFloat() * (maxSize - minSize + 1) | 0);
    chunks.push(stmts.slice(cursor, cursor + size));
    cursor += size;
  }
  return chunks.filter(chunk => chunk.length > 0);
}

// All generated state IDs are below 9000 and each region's exit token is >=10000.
// Either predicate is therefore true for every live state and false only at exit.
function freshStateLoopCondition(stateName, exitId) {
  const choice = secureRandomFloat();
  if (choice < 0.34) return bin("<", nameRef(stateName), numLit(exitId));
  if (choice < 0.67) return bin("~=", nameRef(stateName), numLit(exitId));
  // encodeCffStateMachines rewrites the inner equality into a paired-token check;
  // the outer `not` preserves the loop's active-until-exit semantics.
  return { type: "UnOp", op: "not", e: bin("==", nameRef(stateName), numLit(exitId)) };
}

function blockHasJump(block) {
  if (!block || !block.body) return false;
  for (const s of block.body) {
    if (s.type === "Return" || s.type === "Break" || s.type === "Continue") return true;
    if (s.type === "If") {
      for (const cl of s.clauses) if (blockHasJump(cl.body)) return true;
      if (s.elseBody && blockHasJump(s.elseBody)) return true;
    }
    if (s.type === "While" || s.type === "Repeat" || s.type === "Do" ||
        s.type === "NumericFor" || s.type === "GenericFor") {
      if (blockHasJump(s.body)) return true;
    }
    if (s.type === "LocalFunction" && blockHasJump(s.func.body)) return true;
  }
  return false;
}

function isSafeIf(node) {
  if (node.type !== "If") return false;
  // allow up to 3 clauses + else
  if (node.clauses.length > 3) return false;
  for (const cl of node.clauses) if (blockHasJump(cl.body)) return false;
  if (node.elseBody && blockHasJump(node.elseBody)) return false;
  return true;
}

function blockHasReturn(block) {
  if (!block || !Array.isArray(block.body)) return false;
  for (const s of block.body) {
    if (s.type === "Return") return true;
    if (s.type === "If") {
      for (const cl of (s.clauses || [])) if (blockHasReturn(cl.body)) return true;
      if (s.elseBody && blockHasReturn(s.elseBody)) return true;
    } else if (["Do", "While", "Repeat", "NumericFor", "GenericFor"].includes(s.type)) {
      if (blockHasReturn(s.body)) return true;
    } else if (s.type === "LocalFunction" && s.func && blockHasReturn(s.func.body)) {
      // A return in a nested function belongs to that function, not this block.
      continue;
    } else if (s.type === "Assign") {
      // Function expressions introduce their own return scope.
      continue;
    }
  }
  return false;
}

// Only inspect loop-control statements belonging to the current loop. Nested loops
// and nested functions retain their own break/continue targets.
function hasCurrentLoopControl(block) {
  if (!block || !Array.isArray(block.body)) return false;
  for (const s of block.body) {
    if (s.type === "Break" || s.type === "Continue") return true;
    if (s.type === "If") {
      for (const cl of (s.clauses || [])) if (hasCurrentLoopControl(cl.body)) return true;
      if (s.elseBody && hasCurrentLoopControl(s.elseBody)) return true;
    } else if (s.type === "Do") {
      if (hasCurrentLoopControl(s.body)) return true;
    }
    // Intentionally do not descend into nested loops or function bodies.
  }
  return false;
}

function rewriteLoopControlForCff(block, stateName, breakState, continueState) {
  if (!block || !Array.isArray(block.body)) return { type: "Block", body: [] };
  const out = [];
  for (const s of block.body) {
    if (s.type === "Break") {
      out.push(assignName(stateName, numLit(breakState)), { type: "Break", line: s.line });
    } else if (s.type === "Continue") {
      out.push(assignName(stateName, numLit(continueState)), { type: "Continue", line: s.line });
    } else if (s.type === "If") {
      const clauses = (s.clauses || []).map(cl => ({ ...cl, body: rewriteLoopControlForCff(cl.body, stateName, breakState, continueState) }));
      const elseBody = s.elseBody ? rewriteLoopControlForCff(s.elseBody, stateName, breakState, continueState) : null;
      const copy = { ...s, clauses, elseBody };
      // A transformed break must target the generated dispatcher loop, not an
      // additional CFF loop nested around this conditional.
      if (hasCurrentLoopControl({ body: [s] })) copy._preserveCff = true;
      out.push(copy);
    } else if (s.type === "Do") {
      out.push({ ...s, body: rewriteLoopControlForCff(s.body, stateName, breakState, continueState) });
    } else {
      // Nested While/Repeat/For and function bodies are deliberately untouched.
      out.push(s);
    }
  }
  return { type: "Block", body: out };
}

function isSafeWhile(node) {
  return node.type === "While" && !blockHasReturn(node.body);
}
function isSafeRepeat(node) {
  if (!node || node.type !== "Repeat" || !node.body || blockHasReturn(node.body)) return false;
  // Direct locals are visible in `until`, so retain those loops in native form.
  return !(node.body.body || []).some(s => s.type === "Local" || s.type === "LocalFunction");
}

function numLit(n) {
  return { type: "Num", value: String(n) };
}
function nameRef(n) {
  return { type: "Name", name: n };
}
function bin(op, l, r) {
  return { type: "BinOp", op, l, r };
}
function assignName(name, expr) {
  return {
    type: "Assign",
    targets: [nameRef(name)],
    exprs: [expr]
  };
}
/** Build a single if/elseif/else chain matching state id -> body */
/* Security hardening: never silently downgrade to Math.random(). This is build-time
   obfuscation randomness, not a substitute for server-side protection. */
let __wsSeededRandom = null;
let __wsSeededKeyRandom = null;
let __wsDeterministicKeyOptIn = false;

// Layout and key choices use separate stream state and independent requests to
// Node's CSPRNG (not independent entropy providers). Small chunks limit pre-generated future material; consumed words
// and replaced buffers are wiped using captured Buffer intrinsics. This is best-
// effort process-memory hygiene, not a guarantee against privileged memory dumps.
const __WSF_RNG_CHUNK_BYTES = 256;
function __wsWipeBuffer(buffer, start = 0, end) {
  if (!__WSF_BUFFER_IS_BUFFER(buffer)) return false;
  const stop = end === undefined ? buffer.length : end;
  if (!Number.isInteger(start) || !Number.isInteger(stop) || start < 0 || stop < start || stop > buffer.length) return false;
  try {
    __WSF_REFLECT_APPLY(__WSF_BUFFER_FILL, buffer, [0, start, stop]);
    for (let i = start; i < stop; i++) if (buffer[i] !== 0) return false;
    return true;
  } catch (_) {
    return false;
  }
}
function __wsChooseIntegrityInterval() {
  let seedBytes = null;
  try {
    seedBytes = __WSF_RANDOM_BYTES(4);
    if (!__WSF_BUFFER_IS_BUFFER(seedBytes) || seedBytes.length !== 4) {
      throw __wqB(0x010E);
    }
    // Uniformly select one interval in [65, 130] without modulo bias.
    const range = 66;
    const acceptanceLimit = Math.floor(0x100000000 / range) * range;
    let word;
    do {
      word = __WSF_REFLECT_APPLY(__WSF_BUFFER_READ_UINT32_LE, seedBytes, [0]);
      if (word >= acceptanceLimit) {
        if (!__wsWipeBuffer(seedBytes)) throw __wqB(0x0110);
        seedBytes = __WSF_RANDOM_BYTES(4);
        if (!__WSF_BUFFER_IS_BUFFER(seedBytes) || seedBytes.length !== 4) {
          if (!__WSF_BUFFER_IS_BUFFER(seedBytes)) seedBytes = null;
          throw __wqB(0x010E);
        }
      }
    } while (word >= acceptanceLimit);
    return 65 + (word % range);
  } catch (error) {
    if (error && __WSF_INTEGRITY_ERROR_SET.has(error)) throw error;
    throw __wqB(0x010F);
  } finally {
    if (seedBytes && __WSF_BUFFER_IS_BUFFER(seedBytes) && !__wsWipeBuffer(seedBytes)) throw __wqB(0x0110);
  }
}
function __wsCreateCryptoFloatSource() {
  let pool = __WSF_REFLECT_APPLY(__WSF_BUFFER_ALLOC, __WSF_NODE_BUFFER, [0]);
  let offset = 0;
  let drawsSinceIntegrityCheck = 0;
  let nextIntegrityCheckAt = __wsChooseIntegrityInterval();
  const nextCryptoFloat = function () {
    if (offset + 4 > pool.length) {
      if (!__wsWipeBuffer(pool)) throw __wqB(0x0113);
      offset = 0;
      let fresh;
      try { fresh = __WSF_RANDOM_BYTES(__WSF_RNG_CHUNK_BYTES); }
      catch (_) { throw __wqB(0x0111); }
      if (!__WSF_BUFFER_IS_BUFFER(fresh) || fresh.length !== __WSF_RNG_CHUNK_BYTES) {
        if (__WSF_BUFFER_IS_BUFFER(fresh) && !__wsWipeBuffer(fresh)) throw __wqB(0x0113);
        pool = __WSF_REFLECT_APPLY(__WSF_BUFFER_ALLOC, __WSF_NODE_BUFFER, [0]);
        throw __wqB(0x0112);
      }
      pool = fresh;
    }
    const at = offset;
    const value = __WSF_REFLECT_APPLY(__WSF_BUFFER_READ_UINT32_LE, pool, [at]);
    // Clear each consumed 32-bit word immediately after copying it to a scalar.
    if (!__wsWipeBuffer(pool, at, at + 4)) throw __wqB(0x0114);
    offset += 4;
    drawsSinceIntegrityCheck++;
    if (drawsSinceIntegrityCheck >= nextIntegrityCheckAt) {
      __wqC();
      drawsSinceIntegrityCheck = 0;
      nextIntegrityCheckAt = __wsChooseIntegrityInterval();
    }
    return value / 0x100000000;
  };
  nextCryptoFloat.wipe = function () {
    if (!__wsWipeBuffer(pool)) throw __wqB(0x0115);
    pool = __WSF_REFLECT_APPLY(__WSF_BUFFER_ALLOC, __WSF_NODE_BUFFER, [0]);
    offset = 0;
    drawsSinceIntegrityCheck = 0;
    // Preserve the previously randomized threshold across explicit buffer wipes.
  };
  return nextCryptoFloat;
}
const __wsLayoutCryptoFloat = __wsCreateCryptoFloatSource();
const __wsKeyCryptoFloat = __wsCreateCryptoFloatSource();
const __wsVmCryptoFloat = __wsCreateCryptoFloatSource();
function __wsWipeRandomSources() {
  __wsLayoutCryptoFloat.wipe();
  __wsKeyCryptoFloat.wipe();
  __wsVmCryptoFloat.wipe();
}
function __wsCryptoRandomFloat() {
  return __wsLayoutCryptoFloat();
}
function secureRandomFloat() {
  // Layout/placement stream: seedable only for explicit reproducible debug builds.
  if (__wsSeededRandom) return __wsSeededRandom();
  return __wsLayoutCryptoFloat();
}
function secureKeyFloat() {
  // Production key-layout choices consume a separate CSPRNG stream. Deterministic
  // keys require the explicit allowDeterministic opt-in and are never production-safe.
  if (__wsDeterministicKeyOptIn && __wsSeededKeyRandom) return __wsSeededKeyRandom();
  return __wsKeyCryptoFloat();
}

/* FIX #8: single If with elseif chain (forward), not reverse-nested elseBody */
function buildStateDispatch(stName, entries, exitId, level = 1) {
  if (!entries.length) return [];
  const shuffled = entries.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = secureRandomFloat() * (i + 1) | 0;
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  // Avoid easily recognizable, statically-false junk predicates. Meaningful
  // state equality is checked against two independently encoded registers by
  // encodeCffStateMachines after the complete AST has been constructed.
  const makeClause = e => ({
    cond: bin("==", nameRef(stName), numLit(e.id)),
    body: { type: "Block", body: e.stmts }
  });
  if (secureRandomFloat() < 0.5) {
    const clauses = shuffled.map(makeClause);
    return [{
      type: "If",
      clauses,
      elseBody: { type: "Block", body: [assignName(stName, numLit(exitId))] }
    }];
  }
  // A nested else-if tree is semantically equivalent but has a different AST
  // shape. Each branch remains a block and preserves the original state body.
  const nestedAt = index => {
    const current = shuffled[index];
    return {
      type: "If",
      clauses: [makeClause(current)],
      elseBody: index + 1 < shuffled.length
        ? { type: "Block", body: [nestedAt(index + 1)] }
        : { type: "Block", body: [assignName(stName, numLit(exitId))] }
    };
  };
  return [nestedAt(0)];
}

function scrambleIds(count, level) {
  // v8.1-49: independent, non-sequential IDs for every CFF state.
  // Exit sentinels are >=10000, so state IDs stay in 1..8999.
  const ids = [], used = new Set();
  while (ids.length < count) {
    let id;
    // Seeded builds must route every build-time choice through the same PRNG.
    // Unseeded builds retain cryptographic randomness for state IDs.
    id = (secureRandomFloat() * 8999 | 0) + 1;
    if (!used.has(id)) { used.add(id); ids.push(id); }
  }
  return ids;
}

function alwaysFalseCond(id, styleIndex) {
  // Every style must evaluate to false at runtime (else branch → nextId).
  // bit32 variants keep the predicate dependent on runtime bit operations rather
  // than only numeric literals; they are still ordinary, reversible predicates.
  const bitCall = (member, args) => ({
    type: "Call",
    fn: { type: "Index", obj: nameRef("bit32"), key: { type: "Str", value: member }, computed: false },
    args
  });
  const styles = [
    () => bin("~=", bin("*", numLit(id), numLit(id)), numLit(id * id)),           // x*x ~= x*x
    () => bin("~=", bin("*", numLit(id), numLit(0)), numLit(0)),                  // 0 ~= 0
    () => bin("==", bin("%", bin("*", numLit(id), numLit(2)), numLit(2)), numLit(1)), // even % 2 == 1
    () => bin(">", numLit(id), numLit(id)),                                        // x > x
    () => bin("<", bin("+", numLit(id), numLit(1)), numLit(id)),                   // x+1 < x
    // Modular identities add variety without timing, environment, or debug APIs.
    // State IDs are small positive integers, so these expressions stay exact.
    () => bin("~=", bin("%", bin("+", numLit(id), numLit(17)), numLit(17)), bin("%", numLit(id), numLit(17))),
    () => bin("~=", bin("%", bin("*", numLit(id), numLit(3)), numLit(7)), bin("%", bin("*", bin("%", numLit(id), numLit(7)), numLit(3)), numLit(7))),
    () => bin("~=", bin("-", numLit(id), numLit(id)), numLit(0)),
    () => bin("~=", bin("*", numLit(id), numLit(0)), numLit(0)),
    () => bin("~=", bin("%", bin("*", numLit(id), numLit(4)), numLit(4)), numLit(0)),
    () => bin("~=", bin("%", bin("+", numLit(id), numLit(5)), numLit(5)), bin("%", numLit(id), numLit(5))),
    () => bin("~=", bin("+", numLit(id), numLit(id)), bin("*", numLit(id), numLit(2))),
    () => bin("~=", bitCall("bxor", [numLit(id), numLit(id)]), numLit(0)),
    () => bin("~=", bitCall("band", [numLit(id), numLit(0xFFFFFFFF)]), numLit(id)),
    () => bin("~=", bitCall("band", [bitCall("bxor", [numLit(id), numLit(0xFFFFFFFF)]), numLit(0xFFFFFFFF)]), bitCall("bnot", [numLit(id)])),
    () => bin("==", bitCall("band", [numLit(id), numLit(1)]), numLit(2)),
  ];
  // styleIndex given -> deterministic style (used by tests); otherwise random as before.
  const idx = styleIndex === undefined
    ? (secureRandomFloat() * styles.length | 0)
    : ((styleIndex % styles.length) + styles.length) % styles.length;
  return styles[idx]();
}


/* UPGRADE #2: multi-layered CFF — wrap statement list in an inner state machine */
function nestAsSubMachine(stmts, level) {
  // Randomized per-region threshold (3..9) is a build-time choice, not runtime probing.
  const nestThreshold = 3 + (secureRandomFloat() * 7 | 0);
  if (!Array.isArray(stmts) || stmts.length < nestThreshold || level < 4) return stmts;
  // A direct local declaration can be referenced by a later statement. Moving those
  // statements into separate dispatcher branches would change lexical scope, so keep
  // such regions in their original block layout.
  if (stmts.some(statement => statement && (statement.type === "Local" || statement.type === "LocalFunction"))) return stmts;
  const st = freshStateName();
  const exitId = freshExitId();
  const maxParts = Math.min(4, Math.max(2, Math.floor(stmts.length / 2)));
  const chunks = partitionOrderedStatements(stmts, 2, maxParts);
  if (chunks.length < 2) return stmts;
  const ids = scrambleIds(chunks.length, level);
  const entries = chunks.map((chunk, i) => {
    const next = i + 1 < chunks.length ? ids[i + 1] : exitId;
    return {
      id: ids[i],
      stmts: [...chunk, assignName(st, numLit(next))]
    };
  });
  const dispatch = buildStateDispatch(st, entries, exitId, level);
  return [{
    type: "Do",
    body: {
      type: "Block",
      body: [
        { type: "Local", names: [st], exprs: [numLit(ids[0])] },
        {
          type: "While",
          cond: freshStateLoopCondition(st, exitId),
          body: { type: "Block", body: dispatch }
        }
      ]
    }
  }];
}

/* FIX #7: two-pass id assign; FIX #9: do not double-count inner.changed */
function flattenIfToStates(s, level, changedRef) {
  const st = freshStateName();
  const nClauses = s.clauses.length;
  const hasElse = !!s.elseBody;
  const realCount = nClauses + (hasElse ? 1 : 0);
  const total = realCount;
  // FIX #7: assign all ids first
  const ids = scrambleIds(total, level);
  const exitId = freshExitId();
  const clauseIds = ids.slice(0, nClauses);
  const elseId = hasElse ? ids[nClauses] : null;

  const entries = [];
  for (let i = 0; i < nClauses; i++) {
    const myId = clauseIds[i];
    // FIX #7: next fail uses next clause id / else id / exit
    const nextFailId = (i + 1 < nClauses)
      ? clauseIds[i + 1]
      : (hasElse ? elseId : exitId);
    const inner = flattenBlock(s.clauses[i].body, level);
    // FIX #9: inner.changed not added here (flattenBlock parent accumulates when recursing containers)
    /* UPGRADE #2: nest branch body as sub-state-machine at level>=4 */
    const yesBody = level >= 4
      ? nestAsSubMachine([...inner.body, assignName(st, numLit(exitId))], level)
      : [...inner.body, assignName(st, numLit(exitId))];
    entries.push({
      id: myId,
      stmts: [{
        type: "If",
        clauses: [{
          cond: s.clauses[i].cond,
          body: { type: "Block", body: yesBody }
        }],
        elseBody: {
          type: "Block",
          body: [assignName(st, numLit(nextFailId))]
        }
      }]
    });
  }
  if (hasElse) {
    const inner = flattenBlock(s.elseBody, level);
    const elseStmts = level >= 4
      ? nestAsSubMachine([...inner.body, assignName(st, numLit(exitId))], level)
      : [...inner.body, assignName(st, numLit(exitId))];
    entries.push({ id: elseId, stmts: elseStmts });
  }
  const entryId = clauseIds[0];
  const dispatch = buildStateDispatch(st, entries, exitId, level);
  return {
    type: "Do",
    body: {
      type: "Block",
      body: [
        { type: "Local", names: [st], exprs: [numLit(entryId)] },
        {
          type: "While",
          cond: freshStateLoopCondition(st, exitId),
          body: { type: "Block", body: dispatch }
        }
      ]
    }
  };
}

function flattenWhileToStates(s, level, changedRef) {
  const st = freshStateName();
  const ids = scrambleIds(1, level);
  const bodyId = ids[0];
  const exitId = freshExitId();

  const loopBody = hasCurrentLoopControl(s.body)
    ? rewriteLoopControlForCff(s.body, st, exitId, bodyId)
    : s.body;
  const inner = flattenBlock(loopBody, level);
  /* FIX #9: skip inner.changed double-count */

  const entries = [{
    id: bodyId,
    stmts: [{
      type: "If",
      clauses: [{
        cond: s.cond,
        body: {
          type: "Block",
          body: (level >= 4
            ? nestAsSubMachine([...inner.body, assignName(st, numLit(bodyId))], level)
            : [...inner.body, assignName(st, numLit(bodyId))])
        }
      }],
      elseBody: {
        type: "Block",
        body: [assignName(st, numLit(exitId))]
      }
    }]
  }];

  const dispatch = buildStateDispatch(st, entries, exitId, level);

  return {
    type: "Do",
    body: {
      type: "Block",
      body: [
        { type: "Local", names: [st], exprs: [numLit(bodyId)] },
        {
          type: "While",
          cond: freshStateLoopCondition(st, exitId),
          body: { type: "Block", body: dispatch }
        }
      ]
    }
  };
}

/* Lower a safe `repeat ... until cond` into an explicit CFG cycle. The body runs
   at least once; the condition is evaluated after each body execution. Cases with
   direct locals or loop-control jumps are intentionally retained as native Repeat. */
function flattenRepeatToStates(s, level, changedRef) {
  const state = freshStateName();
  const ids = scrambleIds(2, level);
  const bodyId = ids[0], condId = ids[1];
  const exitId = freshExitId();
  const loopBody = hasCurrentLoopControl(s.body)
    ? rewriteLoopControlForCff(s.body, state, exitId, condId)
    : s.body;
  const inner = flattenBlock(loopBody, level);
  const bodyStmts = [...inner.body, assignName(state, numLit(condId))];
  const condStmts = [{
    type: "If",
    clauses: [{ cond: s.cond, body: { type: "Block", body: [assignName(state, numLit(exitId))] } }],
    elseBody: { type: "Block", body: [assignName(state, numLit(bodyId))] }
  }];
  const entries = [
    { id: bodyId, stmts: bodyStmts },
    { id: condId, stmts: condStmts }
  ];
  const dispatch = buildStateDispatch(state, entries, exitId, level);
  return { type: "Do", body: { type: "Block", body: [
    { type: "Local", names: [state], exprs: [numLit(bodyId)] },
    { type: "While", cond: freshStateLoopCondition(state, exitId), body: { type: "Block", body: dispatch } }
  ]}};
}

function containsKwIIFE(node) {
  if (!node) return false;
  if (node._kwIIFE) return true;
  if (node.type === "Paren") return containsKwIIFE(node.e);
  if (node.type === "Call") return containsKwIIFE(node.fn);
  if (node.type === "Local" && (node.exprs || []).some(containsKwIIFE)) return true;
  if (node.type === "Assign" && (node.exprs || []).some(containsKwIIFE)) return true;
  if (node.type === "CallStat") return containsKwIIFE(node.call);
  if (node.type === "Return" && (node.args || []).some(containsKwIIFE)) return true;
  return false;
}

/* Conservative IR/CFG lowering. Branches and eligible while/repeat loops are lowered
   to explicit state graphs; straight-line side-effecting runs are split into basic
   blocks. Declarations and loop-control transfers stay structured where lowering
   would otherwise alter lexical scope or break/continue targets. */
function isIRLinearStatement(s) {
  return !!s && (s.type === "Assign" || s.type === "CallStat");
}

function lowerLinearIRBlocks(stmts, level) {
  if (level < 3 || !Array.isArray(stmts) || stmts.length < 4) return { body: stmts || [], changed: 0 };
  const out = [];
  let changed = 0;
  for (let i = 0; i < stmts.length;) {
    if (!isIRLinearStatement(stmts[i])) { out.push(stmts[i++]); continue; }
    let end = i;
    while (end < stmts.length && isIRLinearStatement(stmts[end])) end++;
    const run = stmts.slice(i, end);
    // Trigger threshold varies 4..7; statements stay in original order and are
    // split only at assignment/call statement boundaries (never through expressions).
    const minRunLength = 4 + (secureRandomFloat() * 4 | 0);
    if (run.length < minRunLength) { out.push(...run); i = end; continue; }
    const maxParts = Math.min(6, Math.max(2, Math.floor(run.length / 2)));
    const chunks = partitionOrderedStatements(run, 2, maxParts);
    if (chunks.length < 2) { out.push(...run); i = end; continue; }
    const state = freshStateName();
    const exitId = freshExitId();
    const ids = scrambleIds(chunks.length, level);
    const entries = chunks.map((chunk, k) => ({
      id: ids[k],
      stmts: [...chunk, assignName(state, numLit(k + 1 < ids.length ? ids[k + 1] : exitId))]
    }));
    const dispatch = buildStateDispatch(state, entries, exitId, level);
    out.push({ type: "Do", body: { type: "Block", body: [
      { type: "Local", names: [state], exprs: [numLit(ids[0])] },
      { type: "While", cond: freshStateLoopCondition(state, exitId), body: { type: "Block", body: dispatch } }
    ]}});
    changed++;
    i = end;
  }
  return { body: out, changed };
}

function flattenBlock(block, level) {
  if (!block || !block.body) return { body: [], changed: 0 };
  const out = [];
  const changedRef = { n: 0 };

  for (const s of block.body) {
    // Keyword-hide IIFEs (and/or) — never CFF inside them
    if (containsKwIIFE(s)) { out.push(s); continue; }
    // recurse into function bodies
    if (s.type === "LocalFunction") {
      if (s.func && s.func._kwIIFE) { out.push(s); continue; }
      const inner = flattenBlock(s.func.body, level);
      out.push({
        ...s,
        func: { ...s.func, body: { type: "Block", body: inner.body } }
      });
      changedRef.n += inner.changed;
      continue;
    }
    if (s.type === "Local" && Array.isArray(s.exprs) && s.exprs.some(e => e && e.type === "Function")) {
      const exprs = s.exprs.map(fn => {
        if (!fn || fn.type !== "Function" || fn._kwIIFE) return fn;
        const inner = flattenBlock(fn.body, level);
        changedRef.n += inner.changed;
        return { ...fn, body: { type: "Block", body: inner.body } };
      });
      out.push({ ...s, exprs });
      continue;
    }
    if (s.type === "Assign" && s.exprs.length === 1 && s.exprs[0].type === "Function") {
      const fn = s.exprs[0];
      if (fn._kwIIFE) { out.push(s); continue; } // keyword-hide IIFE: do not CFF inside
      const inner = flattenBlock(fn.body, level);
      out.push({
        ...s,
        exprs: [{ ...fn, body: { type: "Block", body: inner.body } }]
      });
      changedRef.n += inner.changed;
      continue;
    }

    if (s.type === "If" && s._preserveCff) { out.push(s); continue; }
    if (level >= 1 && isSafeIf(s)) {
      out.push(flattenIfToStates(s, level, changedRef));
      changedRef.n++;
      continue;
    }

    if (level >= 2 && isSafeWhile(s)) {
      out.push(flattenWhileToStates(s, level, changedRef));
      changedRef.n++;
      continue;
    }
    if (level >= 3 && isSafeRepeat(s)) {
      out.push(flattenRepeatToStates(s, level, changedRef));
      changedRef.n++;
      continue;
    }

    // recurse without flattening container
    if (s.type === "Do") {
      const inner = flattenBlock(s.body, level);
      out.push({ ...s, body: { type: "Block", body: inner.body } });
      changedRef.n += inner.changed;
      continue;
    }
    if (s.type === "While") {
      const inner = flattenBlock(s.body, level);
      out.push({ ...s, body: { type: "Block", body: inner.body } });
      changedRef.n += inner.changed;
      continue;
    }
    if (s.type === "If") {
      const newClauses = s.clauses.map(cl => {
        const inner = flattenBlock(cl.body, level);
        changedRef.n += inner.changed;
        return { ...cl, body: { type: "Block", body: inner.body } };
      });
      let elseBody = s.elseBody;
      if (elseBody) {
        const inner = flattenBlock(elseBody, level);
        changedRef.n += inner.changed;
        elseBody = { type: "Block", body: inner.body };
      }
      out.push({ ...s, clauses: newClauses, elseBody });
      continue;
    }
    if (s.type === "NumericFor" || s.type === "GenericFor" || s.type === "Repeat") {
      const inner = flattenBlock(s.body, level);
      out.push({ ...s, body: { type: "Block", body: inner.body } });
      changedRef.n += inner.changed;
      continue;
    }

    out.push(s);
  }
  // Lower safe straight-line IR runs after structural CFF. Only assignments and
  // call-statements are eligible; declarations and nested control-flow stay intact.
  const ir = lowerLinearIRBlocks(out, level);
  return { body: ir.body, changed: changedRef.n + ir.changed };
}

/* Each generated CFF region receives two independent 32-bit Feistel tokens.
   The primary and shadow registers are updated together and every dispatcher
   edge checks both. The transform is build-time diversification, not encryption;
   larger tokens increase mapping effort but do not make client output confidential. */
function cffFeistel32(value, keys) {
  const rounds = Array.isArray(keys) ? keys.length : 0;
  if (!Number.isInteger(rounds) || rounds < 8 || rounds > 16) {
    throw new Error("Invalid CFF state-key schedule.");
  }
  // Two 16-bit halves give a 32-bit token domain. This is a keyed build-time
  // permutation for analyst friction; it is not used as encryption or as a secret.
  let left = (Number(value) >>> 16) & 0xffff;
  let right = Number(value) & 0xffff;
  for (let round = 0; round < rounds; round++) {
    const k0 = keys[round] & 0xffff;
    const k1 = keys[(round + 3) % rounds] & 0xffff;
    const k2 = keys[(round + 5) % rounds] & 0xffff;
    const k3 = keys[(round + 7) % rounds] & 0xffff;
    let x = (right + k0 + Math.imul(round + 1, 0x9e37)) & 0xffff;
    x ^= (x << ((round % 7) + 3)) & 0xffff;
    x = Math.imul((x + k1) & 0xffff, (k2 | 1) & 0xffff) & 0xffff;
    x ^= x >>> ((round % 5) + 3);
    x = Math.imul((x ^ k3) & 0xffff, 0x9e37) & 0xffff;
    x ^= x >>> 7;
    x &= 0xffff;
    const next = (left ^ x) & 0xffff;
    left = right;
    right = next;
  }
  return (left * 0x10000 + right) >>> 0;
}

function encodeCffStateMachines(ast) {
  if (!_cffPrefix || !ast) return ast;
  const stateNames = new Set();
  const stateValuesByName = new Map();
  const addValue = (name, value) => {
    if (typeof name !== "string" || !name.startsWith(_cffPrefix)) return;
    const n = Number(value);
    if (!Number.isInteger(n) || n < 0 || n > 65535) return;
    stateNames.add(name);
    let values = stateValuesByName.get(name);
    if (!values) stateValuesByName.set(name, values = new Set());
    values.add(n);
  };
  function collect(n) {
    if (!n || typeof n !== "object") return;
    if (n.type === "Local" && Array.isArray(n.names)) {
      for (let i = 0; i < n.names.length; i++) {
        const init = (n.exprs || [])[i];
        if (init && init.type === "Num") addValue(n.names[i], init.value);
      }
    }
    if (n.type === "Assign" && Array.isArray(n.targets) && Array.isArray(n.exprs)) {
      for (let i = 0; i < n.targets.length; i++) {
        const target = n.targets[i], value = n.exprs[i];
        if (target && target.type === "Name" && value && value.type === "Num") addValue(target.name, value.value);
      }
    }
    for (const value of Object.values(n)) {
      if (Array.isArray(value)) value.forEach(collect);
      else if (value && typeof value === "object") collect(value);
    }
  }
  collect(ast);
  if (!stateNames.size) return ast;

  const primaryKeys = new Map();
  const shadowKeys = new Map();
  const shadowNames = new Map();
  for (const name of stateNames) {
    // Each primary/shadow state gets an independent 8..16-round 32-bit schedule.
    // Crucially, key bytes use the dedicated key CSPRNG stream, not the layout stream.
    const primaryRounds = 8 + (secureKeyFloat() * 9 | 0);
    const shadowRounds = 8 + (secureKeyFloat() * 9 | 0);
    primaryKeys.set(name, Array.from({ length: primaryRounds }, () => (secureKeyFloat() * 0x10000) | 0));
    shadowKeys.set(name, Array.from({ length: shadowRounds }, () => (secureKeyFloat() * 0x10000) | 0));
    // The prefix allocator excludes all user identifiers beginning with _cffPrefix.
    // A suffix containing an underscore cannot collide with another generated state ID.
    shadowNames.set(name, name + "_q");
  }
  const encodePrimary = (name, value) => cffFeistel32(value, primaryKeys.get(name));
  const encodeShadow = (name, value) => cffFeistel32(value, shadowKeys.get(name));
  const isState = node => !!node && node.type === "Name" && stateNames.has(node.name);
  const num = value => ({ type: "Num", value: String(value) });
  const ref = name => ({ type: "Name", name });
  const combine = (op, left, right) => ({ type: "BinOp", op, l: left, r: right });

  const map = node => {
    if (!node || typeof node !== "object") return node;
    if (Array.isArray(node)) return node.map(map);

    if (node.type === "Local") {
      const originalNames = (node.names || []).slice();
      const originalExprs = (node.exprs || []).slice();
      const names = [];
      const exprs = [];
      for (let i = 0; i < originalNames.length; i++) {
        const name = originalNames[i];
        const rawExpr = originalExprs[i];
        names.push(name);
        if (stateNames.has(name)) {
          if (!rawExpr || rawExpr.type !== "Num") throw new Error("CFF state initializer is not a numeric literal");
          const value = Number(rawExpr.value);
          exprs.push(num(encodePrimary(name, value)));
          names.push(shadowNames.get(name));
          exprs.push(num(encodeShadow(name, value)));
        } else if (i < originalExprs.length) {
          exprs.push(map(rawExpr));
        }
      }
      const out = { ...node, names, exprs };
      for (const [key, value] of Object.entries(out)) {
        if (key !== "names" && key !== "exprs") out[key] = Array.isArray(value) ? value.map(map) : (value && typeof value === "object" ? map(value) : value);
      }
      return out;
    }

    if (node.type === "Assign") {
      const originalTargets = (node.targets || []).slice();
      const originalExprs = (node.exprs || []).slice();
      const targets = [];
      const exprs = [];
      for (let i = 0; i < originalTargets.length; i++) {
        const target = originalTargets[i];
        const value = originalExprs[i];
        if (isState(target)) {
          if (!value || value.type !== "Num") throw new Error("CFF state transition is not a numeric literal");
          const stateName = target.name;
          const rawValue = Number(value.value);
          targets.push({ ...target });
          exprs.push(num(encodePrimary(stateName, rawValue)));
          targets.push(ref(shadowNames.get(stateName)));
          exprs.push(num(encodeShadow(stateName, rawValue)));
        } else {
          targets.push(map(target));
          if (i < originalExprs.length) exprs.push(map(value));
        }
      }
      const out = { ...node, targets, exprs };
      for (const [key, value] of Object.entries(out)) {
        if (key !== "targets" && key !== "exprs") out[key] = Array.isArray(value) ? value.map(map) : (value && typeof value === "object" ? map(value) : value);
      }
      return out;
    }

    const out = {};
    for (const [key, value] of Object.entries(node)) {
      out[key] = Array.isArray(value) ? value.map(map) : (value && typeof value === "object" ? map(value) : value);
    }

    // Dispatcher equality requires both independently keyed state registers.
    // The loop remains active until both registers carry their exit tokens.
    if (out.type === "BinOp" && isState(node.l) && node.r && node.r.type === "Num") {
      const stateName = node.l.name;
      const rawValue = Number(node.r.value);
      const values = stateValuesByName.get(stateName);
      if (values && values.has(rawValue)) {
        const primary = ref(stateName);
        const shadow = ref(shadowNames.get(stateName));
        const primaryValue = num(encodePrimary(stateName, rawValue));
        const shadowValue = num(encodeShadow(stateName, rawValue));
        if (node.op === "==") {
          return combine("and", combine("==", primary, primaryValue), combine("==", shadow, shadowValue));
        }
        if ((node.op === "<" || node.op === "~=") && rawValue >= 10000) {
          return combine("or", combine("~=", primary, primaryValue), combine("~=", shadow, shadowValue));
        }
      }
    }
    return out;
  };
  return map(ast);
}

function flattenControlFlowAST(source, level) {
  _cffSeq = 0;
  _cffPrefix = null;
  let T = null;
  try {
    T = lex(source).T;
    // Reserve every source identifier before allocating generated CFF names.
    // Without this set, a rare six-letter prefix collision could shadow user locals.
    _cffReservedNames = new Set(T.filter(token => token && token.t === "id").map(token => token.v));
    const ast = parseProgram(T);
    __wsReleaseTokens(T);
    T = null;
    const result = flattenBlock(ast, level);
    const transformed = encodeCffStateMachines({ type: "Block", body: result.body });
    stripAstSourceLocations(transformed);
    // compact=true → state machines as dense one-liners
    let code = emitProgram(transformed, true);
    // tidy double spaces
    code = code.replace(/[ \t]+/g, " ").replace(/\s*\n\s*/g, "\n").trim();
    if (result.changed > 0) {
      code = "--[CFF applied: " + result.changed + " region(s)]\n" + code;
    }
    return { code, changed: result.changed };
  } catch (e) {
    return { code: source, changed: 0, error: e.message || String(e) };
  } finally {
    if (T) __wsReleaseTokens(T);
    _cffReservedNames = null;
  }
}

/* ========== OBFUSCATOR PIPELINE ========== */
let id_map = new Map();
let v_counter = 0;

/* BUGFIX: identifiers generated for renaming must never be Luau keywords or contextual words. */
const LUA_RESERVED = new Set([...KW, "continue", "goto", "type", "export", "typeof", "self", "_G", "_ENV"]);
function genId() {
  const a = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  // harder names: mix letters + underscores, avoid single short ids sometimes
  const styles = [
    () => {
      const b = [];
      let m = v_counter++;
      do { b.unshift(a[m % a.length]); m = Math.floor(m / a.length); } while (m);
      return b.join("") + (secureRandomFloat() < 0.4 ? "_" + (secureRandomFloat() * 99 | 0) : "");
    },
    () => "_" + (v_counter++).toString(36) + (secureRandomFloat() * 1e4 | 0).toString(36),
    () => {
      let s = "";
      const n = 3 + (secureRandomFloat() * 4 | 0);
      for (let i = 0; i < n; i++) s += a[secureRandomFloat() * a.length | 0];
      return s + (v_counter++);
    }
  ];
  for (let t = 0; t < 8; t++) {
    const cand = styles[secureRandomFloat() * styles.length | 0]();
    if (!LUA_RESERVED.has(cand)) return cand;
  }
  let fallback;
  do { fallback = "_r" + (v_counter++).toString(36); } while (LUA_RESERVED.has(fallback));
  return fallback;
}

/* FIX #1 #2: levelHint declared before any encStr* use (avoid TDZ) */
let levelHint = 3;
let strictStringMasking = true;
let forceRuntimeXor = true;

/* ---- string codecs (picked randomly per string) ---- */
function bytesOf(s) {
  // Preserve Luau string bytes by encoding JavaScript text as UTF-8 first.
  return Array.from(new TextEncoder().encode(String(s)));
}

function luaSplitPayloadLiteral(value, minChunk = 9, maxChunk = 17) {
  const text = String(value);
  if (text.length <= maxChunk) return JSON.stringify(text);
  const chunks = [];
  let at = 0;
  while (at < text.length) {
    const remaining = text.length - at;
    const span = Math.min(remaining, minChunk + (secureRandomFloat() * (maxChunk - minChunk + 1) | 0));
    chunks.push(JSON.stringify(text.slice(at, at + span)));
    at += span;
  }
  return chunks.join("..");
}

function encStrHex(s) {
  const h = bytesOf(s).map(c => c.toString(16).padStart(2, "0"));
  if (!h.length) return '""';
  return '"' + "\\x" + h.join("\\x") + '"';
}

function encStrChar(s) {
  const parts = bytesOf(s);
  if (parts.length === 0) return '""';
  if (parts.length === 1) return "string.char(" + parts[0] + ")";
  const chunks = [];
  for (let i = 0; i < parts.length; i += 12) chunks.push("string.char(" + parts.slice(i, i + 12).join(",") + ")");
  return chunks.join("..");
}

function encStrDecimal(s) { return encStrChar(s); }

/* Compact feedback literal codec. Short literals use the same independent
   per-literal xorshift/ciphertext-feedback stream as long literals, but a small
   Luau-native decoder avoids hex parsing and a large generic fallback wrapper. */
function encStrCompactMasked(s) {
  const x = makeXorPayload(s);
  if (!x.bytes.length) return '""';
  return `(function(e,s)local o={};local p=0;for i=1,#e do s=bit32.bxor(s,bit32.lshift(s,13));s=bit32.bxor(s,bit32.rshift(s,17));s=bit32.bxor(s,bit32.lshift(s,5));local c=e[i];local k=bit32.bxor(bit32.rshift(s,24),p,(i*29)%256);o[i]=string.char(bit32.bxor(c,k));p=c end;local r=table.concat(o);for i=1,#o do o[i]=nil end;return r end)({${x.bytes.join(',')}},${x.seed})`;
}

/* V8.2.20: per-literal xorshift32 stream with ciphertext feedback.
   This is build-random obfuscation, not a cryptographic cipher. Every literal
   receives an independent non-zero seed; each byte also depends on the prior
   ciphertext byte and its position, preventing one global byte mask. */
function makeXorPayload(s) {
  const bytes = bytesOf(s);
  let seed = (secureRandomFloat() * 0x100000000) >>> 0;
  if (seed === 0) seed = 0x6d2b79f5;
  let state = seed >>> 0;
  let previousCipher = 0;
  const enc = [];
  for (let i = 0; i < bytes.length; i++) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    const streamByte = ((state >>> 24) ^ previousCipher ^ (((i + 1) * 29) & 255)) & 255;
    const cipher = (bytes[i] ^ streamByte) & 255;
    enc.push(cipher);
    previousCipher = cipher;
  }
  return { payload: enc.map(b => b.toString(16).padStart(2, "0")).join(""), bytes: enc, seed };
}
function luaXorDecodeExpr(payloadExpr, seed) {
  // The runtime recurrence mirrors the build-time xorshift32 byte stream.
  // bit32 is native in Luau; arithmetic fallbacks preserve ordinary Lua compatibility.
  return "(function(p,s) " +
    "local bx=(bit32 and bit32.bxor)or function(a,b)local r=0 local m=1 for i=0,31 do local aa=a%2 local bb=b%2 if aa~=bb then r=r+m end a=(a-aa)/2 b=(b-bb)/2 m=m*2 end return r end; " +
    "local ls=(bit32 and bit32.lshift)or function(a,n)return (a*2^n)%4294967296 end; " +
    "local rs=(bit32 and bit32.rshift)or function(a,n)return math.floor(a/2^n) end; " +
    "local hx='0123456789abcdef' local function n(c)local q=string.find(hx,string.lower(c),1,true);return q and q-1 or 0 end; " +
    "local ch=string['c'..'har'];local o={};local prev=0;local j=0;for i=1,#p,2 do j=j+1; " +
    "local b=n(p:sub(i,i))*16+n(p:sub(i+1,i+1));s=bx(s,ls(s,13))%4294967296;s=bx(s,rs(s,17));s=bx(s,ls(s,5))%4294967296; " +
    "local k=bx(bx(rs(s,24),prev),(j*29)%256);o[j]=ch(bx(b,k));prev=b end;local r=table.concat(o);for i=1,#o do o[i]=nil end;return r end)(" + payloadExpr + "," + seed + ")";
}
function encStrXorStream(s) {
  if (!bytesOf(s).length) return '""';
  const x = makeXorPayload(s);
  return luaXorDecodeExpr(luaSplitPayloadLiteral(x.payload), x.seed);
}

// P0: shuffled substitution over the hexadecimal alphabet. A fresh inverse map
// is embedded per string, defeating fixed-alphabet signatures without libraries.
function makeSubstitutionPayload(hex) {
  const src = "0123456789abcdef";
  const dst = src.split("");
  for (let i = dst.length - 1; i > 0; i--) { const j = secureRandomFloat() * (i + 1) | 0; [dst[i], dst[j]] = [dst[j], dst[i]]; }
  const map = Object.fromEntries(src.split("").map((c, i) => [c, dst[i]]));
  return { payload: hex.split("").map(c => map[c]).join(""), alphabet: dst.join("") };
}
function luaSubstitutionDecodeExpr(payloadExpr, alphabet) {
  return "(function(p)local a=" + JSON.stringify(alphabet) + " local t={}for i=1,#a do t[a:sub(i,i)]=('0123456789abcdef'):sub(i,i)end local o={}for i=1,#p do o[i]=t[p:sub(i,i)]or p:sub(i,i)end local r=table.concat(o);for i=1,#o do o[i]=nil end;return r end)(" + payloadExpr + ")";
}
function encStrSubstitution(s) {
  const bytes = bytesOf(s), hex = bytes.map(b => b.toString(16).padStart(2, "0")).join("");
  if (!hex) return '""';
  const sub = makeSubstitutionPayload(hex);
  // Map the shuffled alphabet directly to nibble values and assemble bytes without tonumber(...,16).
  return "(function(h)local a=" + JSON.stringify(sub.alphabet) + " local t={} for i=1,#a do t[a:sub(i,i)]=i-1 end " +
    "local ch=string['c'..'har'];local o={}for i=1,#h,2 do local x=t[h:sub(i,i)]or 0;local y=t[h:sub(i+1,i+1)]or 0;o[#o+1]=ch(x*16+y)end local r=table.concat(o);for i=1,#o do o[i]=nil end;return r end)(" + luaSplitPayloadLiteral(sub.payload) + ")";
}

// Runtime decoder chain: per-string randomized XOR stream plus shuffled hex substitution.
// No Base64/Base85 representation is used.
function encStrChain(s, depth = 2) {
  if (!bytesOf(s).length) return '""';
  // Fragment at Unicode code-point boundaries. Each fragment gets independent
  // stream/substitution keys, then the runtime synthesizes the original string.
  // This avoids corrupting UTF-8 continuation bytes while preventing one decoder
  // invocation from exposing the complete literal at once.
  const chars = Array.from(String(s));
  const fragments = [];
  let at = 0;
  while (at < chars.length) {
    const span = 2 + (secureRandomFloat() * (depth >= 3 ? 5 : 7) | 0);
    const part = chars.slice(at, at + span).join("");
    const x = makeXorPayload(part);
    const sub = makeSubstitutionPayload(x.payload);
    const substituted = luaSubstitutionDecodeExpr(luaSplitPayloadLiteral(sub.payload), sub.alphabet);
    fragments.push(luaXorDecodeExpr(substituted, x.seed));
    at += span;
  }
  if (fragments.length === 1) return fragments[0];
  const assignments = fragments.map((expression, index) => ({ slot: index + 1, expression }));
  for (let i = assignments.length - 1; i > 0; i--) {
    const j = secureRandomFloat() * (i + 1) | 0;
    [assignments[i], assignments[j]] = [assignments[j], assignments[i]];
  }
  const writes = assignments.map(item => `p[${item.slot}]=${item.expression};`).join("");
  return `(function()local p={};${writes}local r=table.concat(p);for i=1,#p do p[i]=nil end;return r end)()`;
}
function encStrSingle(s) {
  if (s.length === 0) return '""';
  if (s.length === 1) return encStrChar(s);
  if (levelHint >= 3) return encStrChain(s, levelHint >= 5 ? 3 : 2);
  const strong = [encStrChar, encStrXorStream, encStrSubstitution];
  if (s.length >= 4 && secureRandomFloat() < 0.2) strong.push(encStrHex);
  if (levelHint >= 4 && secureRandomFloat() < 0.65) return encStrXorStream(s);
  return strong[secureRandomFloat() * strong.length | 0](s);
}
function encStr(s) {
  const byteLength = bytesOf(s).length;
  if (byteLength === 0) return '""';
  // Decoder architecture is selected independently per literal. Short strings
  // keep the compact path most of the time; stronger profiles mix compact,
  // feedback-XOR, substitution, and fragmented chained decoding.
  if (byteLength <= 24) {
    if (strictStringMasking && levelHint >= 4 && secureRandomFloat() < 0.22) return encStrXorStream(s);
    return encStrCompactMasked(s);
  }
  if (forceRuntimeXor && !strictStringMasking && levelHint >= 1) return encStrXorStream(s);
  if (strictStringMasking && levelHint >= 2) {
    const route = secureRandomFloat();
    if (route < 0.58) return encStrChain(s, levelHint >= 5 && secureRandomFloat() < 0.35 ? 3 : 2);
    if (route < 0.82) return encStrXorStream(s);
    return encStrSubstitution(s);
  }
  if (levelHint < 3) return encStrXorStream(s);
  return encStrSingle(s);
}

/* V8.2.18: pool repeated source literals before string encoding. Each repeated
   value is decoded once into a local constant table; use only candidates whose
   estimated encoded-byte savings exceed both the references and table header. */
function poolRepeatedSourceStrings(source, { stringEncoding = true } = {}) {
  let tokenized = null;
  let identifierTokenized = null;
  try {
  tokenized = lex(source);
  const tokens = tokenized.T.filter(t => t.t === "str" && t.v.length > 0);
  if (tokens.length < 2) return { code: source, count: 0, name: null };
  const groups = new Map();
  for (const token of tokens) {
    const key = token.v;
    let entry = groups.get(key);
    if (!entry) {
      entry = { value: key, tokens: [], raw: source.slice(token.pos, token.pos + token.len), byteLength: bytesOf(key).length };
      groups.set(key, entry);
    }
    entry.tokens.push(token);
  }
  identifierTokenized = tokens.length ? lex(source) : null;
  const used = new Set(identifierTokenized ? identifierTokenized.T.filter(t => t.t === "id").map(t => t.v) : []);
  if (identifierTokenized) { __wsReleaseTokens(identifierTokenized.T); identifierTokenized = null; }
  let poolName;
  do { poolName = "_p" + (secureRandomFloat() * 0x7fffffff | 0).toString(36).slice(0, 5); } while (used.has(poolName));
  const refLenFor = index => poolName.length + String(index).length + 2; // name + [index]
  const candidates = [];
  for (const item of groups.values()) {
    const count = item.tokens.length;
    if (count < 2) continue;
    const rawLen = item.raw.length;
    // Conservative size model: compact string decoder for <=24 bytes, fragment
    // decoder for longer values. The final post-pass still decides whether any
    // additional pooling is worthwhile.
    const encodedLen = !stringEncoding ? rawLen : item.byteLength <= 24
      ? 205 + item.byteLength * 3
      : 240 + item.byteLength * 34;
    const referenceLen = refLenFor(candidates.length + 1);
    const net = (count - 1) * encodedLen - count * referenceLen - rawLen;
    if (net > 0) candidates.push({ ...item, net });
  }
  if (!candidates.length) return { code: source, count: 0, name: null };
  candidates.sort((a, b) => b.net - a.net);
  const selected = [];
  let totalNet = 0;
  for (const item of candidates) {
    const idx = selected.length + 1;
    const refLen = refLenFor(idx);
    const encodedLen = !stringEncoding ? item.raw.length : item.byteLength <= 24
      ? 205 + item.byteLength * 3
      : 240 + item.byteLength * 34;
    const net = (item.tokens.length - 1) * encodedLen - item.tokens.length * refLen - item.raw.length;
    if (net > 0) { selected.push(item); totalNet += net; }
  }
  const headerCost = ("local " + poolName + "={};").length + 1;
  if (!selected.length || totalNet <= headerCost) return { code: source, count: 0, name: null };
  const replacementByPos = new Map();
  const tokenByPos = new Map(tokens.map(token => [token.pos, token]));
  selected.forEach((item, index) => {
    for (const token of item.tokens) replacementByPos.set(token.pos, poolName + "[" + (index + 1) + "]");
  });
  let body = "", cursor = 0;
  const edits = [...replacementByPos.entries()].sort((a, b) => a[0] - b[0]);
  for (const [pos, replacement] of edits) {
    const token = tokenByPos.get(pos);
    if (!token) continue;
    body += source.slice(cursor, pos) + replacement;
    cursor = pos + token.len;
  }
  body += source.slice(cursor);
  const values = selected.map(item => item.raw).join(",");
  const declaration = "local " + poolName + "={" + values + "};\n";
  const directive = /^([\t ]*--!(?:strict|nonstrict|nocheck)\b[^\r\n]*(?:\r?\n|$))/.exec(body);
  if (directive) {
    return { code: directive[1] + declaration + body.slice(directive[1].length), count: selected.length, name: poolName };
  }
  return { code: declaration + body, count: selected.length, name: poolName };
  } finally {
    if (identifierTokenized) __wsReleaseTokens(identifierTokenized.T);
    if (tokenized) __wsReleaseTokens(tokenized.T);
  }
}

/* V8.2.18: disguise a bounded sample of user-source integer literals using
   exact integer identities. Operates on lexer token spans (never string/comment
   contents) and avoids floating-point, oversized, and precision-sensitive values. */
function disguiseSourceIntegerLiterals(source, level, enabled = true) {
  if (!enabled || level < 3) return { code: source, count: 0 };
  const T = lex(source).T;
  try {
    const edits = [];
    const rate = level >= 5 ? 0.28 : level >= 4 ? 0.20 : 0.12;
    for (const token of T) {
      if (token.t !== "num") continue;
      const raw = source.slice(token.pos, token.pos + token.len).replace(/_/g, "");
      if (!/^(?:\d+|0[xX][\da-fA-F]+|0[bB][01]+)$/.test(raw)) continue;
      const value = Number(raw);
      if (!Number.isSafeInteger(value) || value < 12 || value > 1000000) continue;
      if (secureRandomFloat() >= rate) continue;
      const multiplier = 2 + (secureRandomFloat() * 6 | 0);
      const offset = 3 + (secureRandomFloat() * 23 | 0);
      const shifted = value + offset;
      const correction = offset * multiplier;
      edits.push({ pos: token.pos, end: token.pos + token.len,
        replacement: "((" + shifted + "*" + multiplier + "-" + correction + ")/" + multiplier + ")" });
    }
    if (!edits.length) return { code: source, count: 0 };
    let out = "", cursor = 0;
    for (const edit of edits) {
      out += source.slice(cursor, edit.pos) + edit.replacement;
      cursor = edit.end;
    }
    out += source.slice(cursor);
    return { code: out, count: edits.length };
  } finally {
    __wsReleaseTokens(T);
  }
}

/* ---- junk / opaque predicates ---- */
/* v8: bounded, deterministic opaque identities only. No error floods, coroutine traps,
   debug hooks, unbounded loops, or environment-sensitive predicates are injected. */

function encNum(n) {
  // opaque number forms
  const v = Number(n);
  if (!Number.isFinite(v) || String(n).includes("e") || String(n).includes("x")) return String(n);
  const styles = [
    () => String(v),
    () => `(${v}+0)`,
    () => `(${v}*1)`,
    () => `(${v}+(${v}-${v}))`,
    () => `(${Math.floor(v)}+(${v}-Math.floor(${v})||0))`,
  ];
  if (Number.isInteger(v) && Math.abs(v) < 1e7) {
    styles.push(() => `(${v + 7}-7)`);
    styles.push(() => `(${v ^ 0})`);
    if (v >= 0) styles.push(() => `(#("${"x".repeat(Math.min(v, 20))}")${v > 20 ? "+" + (v - 20) : ""})`);
  }
  return styles[secureRandomFloat() * styles.length | 0]();
}

/* Bounded semantic-no-op snippets. Keep each build small and predictable. */
function junkSnippet(level) {
  const n = secureRandomFloat() * 1000000 | 0;
  const m = secureRandomFloat() * 1000000 | 0;
  const v = "_j" + (secureRandomFloat() * 0x7fffffff | 0).toString(36);
  const styles = [
    () => `do local ${v}=${n}; local _=${v}+0 end;`,
    () => `do local ${v}=(${n}+(${m}-${m})); local _=${v}*1 end;`,
    () => `do local ${v}=(${n}*0+${m % 97}); local _=(${v}==${m % 97}) end;`,
    () => `do local ${v}=(${n}%2); local _=((${v}==0) or (${v}==1)) end;`,
    () => `do local ${v}=(${n}+7-7); local _=(${v}==${n}) end;`,
    // The condition is contradictory for an integer remainder, so the body is
    // operationally dead while the guard itself is evaluated at runtime.
    () => `do local ${v}=${n};if (${v}%2==0 and ${v}%2==1) then local _=${m};${v}=${v}+_ end end;`,
    () => `do local ${v}=(${n}%3);if (${v}<0 and ${v}>=0) then ${v}=${m} end end;`
  ];
  return styles[secureRandomFloat() * styles.length | 0]();
}

function junkBlock(level) {
  const lines = [];
  const count = Math.floor(Math.min(3, level >= 5 ? 3 : level >= 3 ? 2 : 1) / 2);
  for (let i = 0; i < count; i++) lines.push(junkSnippet(level));
  return lines.join("");
}

/* FIX #4: cap loop size */
function noiseFunction(level) {
  const name = "__n" + (secureRandomFloat() * 1e4 | 0);
  const loops = Math.min(15 + level * 5, 40);
  return `local function ${name}()local t={}for i=1,${loops} do t[i]=math.random()*(${secureRandomFloat()*100|0})end local s=0 for i=1,#t do s=s+t[i]*0 end return s end ${name}();`;
}

/* ========== BYTECODE VIRTUALIZATION (emit Luau numeric VM) ========== */
const VM_OP_LIST = [
  "LOADNIL","LOADBOOL","LOADK","MOVE","GETGLOBAL","SETGLOBAL","GETUPVAL","SETUPVAL",
  "NEWTABLE","GETTABLE","SETTABLE","CALL","RETURN","VARARG","CLOSURE","JMP","JMPIF","JMPIFNOT",
  "UNM","NOT","LEN","ADD","SUB","MUL","DIV","MOD","POW","IDIV","CONCAT",
  "FORPREP","FORLOOP","TFORLOOP","CMPEQ","CMPNE","CMPLT","CMPLE","CMPGT","CMPGE","BOR","BAND",
  "FUSED_MOVE_ADD","FUSED_MOVE_SUB","FUSED_MOVE_MUL","FUSED_MOVE_DIV",
  /* Semantic order must match the concrete H[n] handler bodies below. */
  "MATHCLAMP","MATHFLOOR","MATHCEIL","MATHABS","MATHSQRT","MATHMIN","MATHMAX",
  "FUSED_GETTABLE_ADD_SETTABLE","BXOR","SHL","SHR","BNOT","FUSED_GETGLOBAL_CALL","FUSED_GLOBAL_MEMBER_CALL","FUSED_GLOBAL_MEMBER_LOOKUP","STATEPRED","NOP"
];
const VM_OPERAND_SCHEMAS = Object.freeze({"LOADNIL": ["a", "b"], "LOADBOOL": ["a", "b"], "LOADK": ["a", "bx"], "MOVE": ["a", "b"], "GETGLOBAL": ["a", "bx"], "SETGLOBAL": ["a", "bx"], "GETUPVAL": ["a", "b"], "SETUPVAL": ["a", "b"], "NEWTABLE": ["a", "b", "c"], "GETTABLE": ["a", "b", "c"], "SETTABLE": ["a", "b", "c"], "CALL": ["a", "b", "c"], "RETURN": ["a", "b"], "VARARG": ["a", "b"], "CLOSURE": ["a", "bx"], "JMP": ["sbx"], "JMPIF": ["a", "sbx"], "JMPIFNOT": ["a", "sbx"], "UNM": ["a", "b"], "NOT": ["a", "b"], "LEN": ["a", "b"], "ADD": ["a", "b", "c"], "SUB": ["a", "b", "c"], "MUL": ["a", "b", "c"], "DIV": ["a", "b", "c"], "MOD": ["a", "b", "c"], "POW": ["a", "b", "c"], "IDIV": ["a", "b", "c"], "CONCAT": ["a", "b", "c"], "FORPREP": ["a", "sbx"], "FORLOOP": ["a", "sbx"], "TFORLOOP": ["a", "c", "sbx"], "CMPEQ": ["a", "b", "c"], "CMPNE": ["a", "b", "c"], "CMPLT": ["a", "b", "c"], "CMPLE": ["a", "b", "c"], "CMPGT": ["a", "b", "c"], "CMPGE": ["a", "b", "c"], "BOR": ["a", "b", "c"], "BAND": ["a", "b", "c"], "FUSED_MOVE_ADD": ["a", "b", "c"], "FUSED_MOVE_SUB": ["a", "b", "c"], "FUSED_MOVE_MUL": ["a", "b", "c"], "FUSED_MOVE_DIV": ["a", "b", "c"], "MATHCLAMP": ["a", "b", "c", "bx"], "MATHFLOOR": ["a", "b"], "MATHCEIL": ["a", "b"], "MATHABS": ["a", "b"], "MATHSQRT": ["a", "b"], "MATHMIN": ["a", "b", "c"], "MATHMAX": ["a", "b", "c"], "FUSED_GETTABLE_ADD_SETTABLE": ["a", "b", "c", "bx"], "BXOR": ["a", "b", "c"], "SHL": ["a", "b", "c"], "SHR": ["a", "b", "c"], "BNOT": ["a", "b"], "FUSED_GETGLOBAL_CALL": ["a", "b", "c", "bx"], "FUSED_GLOBAL_MEMBER_CALL": ["a", "b", "c", "bx", "sbx"], "FUSED_GLOBAL_MEMBER_LOOKUP": ["a", "bx", "sbx"], "STATEPRED": ["a"], "NOP": []});
const VM_REGISTER_OPERANDS = Object.freeze({
  LOADNIL:["a","b"], LOADBOOL:["a"], LOADK:["a"], MOVE:["a","b"],
  GETGLOBAL:["a"], SETGLOBAL:["a"], GETUPVAL:["a"], SETUPVAL:["a"],
  NEWTABLE:["a"], GETTABLE:["a","b","c"], SETTABLE:["a","b","c"],
  CALL:["a"], RETURN:["a"], VARARG:["a"], CLOSURE:["a"],
  JMP:[], JMPIF:["a"], JMPIFNOT:["a"], UNM:["a","b"], NOT:["a","b"], LEN:["a","b"],
  ADD:["a","b","c"], SUB:["a","b","c"], MUL:["a","b","c"], DIV:["a","b","c"],
  MOD:["a","b","c"], POW:["a","b","c"], IDIV:["a","b","c"], CONCAT:["a","b","c"],
  FORPREP:["a"], FORLOOP:["a"], TFORLOOP:["a"],
  CMPEQ:["a","b","c"], CMPNE:["a","b","c"], CMPLT:["a","b","c"], CMPLE:["a","b","c"],
  CMPGT:["a","b","c"], CMPGE:["a","b","c"], BOR:["a","b","c"], BAND:["a","b","c"],
  FUSED_MOVE_ADD:["a","b","c"], FUSED_MOVE_SUB:["a","b","c"],
  FUSED_MOVE_MUL:["a","b","c"], FUSED_MOVE_DIV:["a","b","c"],
  MATHCLAMP:["a","b","c","bx"], MATHFLOOR:["a","b"], MATHCEIL:["a","b"],
  MATHABS:["a","b"], MATHSQRT:["a","b"], MATHMIN:["a","b","c"], MATHMAX:["a","b","c"],
  FUSED_GETTABLE_ADD_SETTABLE:["a","b","c","bx"], BXOR:["a","b","c"],
  SHL:["a","b","c"], SHR:["a","b","c"], BNOT:["a","b"],
  FUSED_GETGLOBAL_CALL:["a"], FUSED_GLOBAL_MEMBER_CALL:["a"], FUSED_GLOBAL_MEMBER_LOOKUP:["a"],
  STATEPRED:["a"], NOP:[]
});
const VM_OP_INDEX = new Map(VM_OP_LIST.map((n, i) => [n, i + 1])); // refreshed for each synchronous build; 0 = halt
function refreshVmOpIndex() {
  VM_OP_INDEX.clear();
  for (let i = 0; i < VM_OP_LIST.length; i++) VM_OP_INDEX.set(VM_OP_LIST[i], i + 1);
}
function shuffleVmSemanticOrderForBuild() {
  // Shuffle semantic iteration order as well as the already-random sparse IDs,
  // handler slots, operand layouts and closure pool. The public build is fully
  // synchronous, so the temporary module-local permutation cannot interleave
  // with another request in this Node event loop.
  for (let i = VM_OP_LIST.length - 1; i > 0; i--) {
    const j = Math.floor(secureKeyFloat() * (i + 1));
    [VM_OP_LIST[i], VM_OP_LIST[j]] = [VM_OP_LIST[j], VM_OP_LIST[i]];
  }
  refreshVmOpIndex();
}

/* Validate the complete ISA contract before emitting a runtime VM. This catches
   build-time namespace/handler drift before it surfaces as a runtime PC error. */
function validateVmIsaMaps(opMap, innerOpMap, handlerMap, profile = "balanced") {
  const fail = message => { throw new Error("VM ISA validation failed: " + message); };
  if (!(opMap instanceof Map) || !(innerOpMap instanceof Map) || !(handlerMap instanceof Map))
    fail("opcode maps must be Map instances");
  if (!Array.isArray(VM_OP_LIST) || VM_OP_LIST.length < 1 || VM_OP_LIST.length > 250)
    fail("opcode count is outside the supported 1..250 range");
  const checkDomain = (map, label, min, max) => {
    if (map.size !== VM_OP_LIST.length) fail(label + " count mismatch");
    const seen = new Set();
    for (const name of VM_OP_LIST) {
      if (!map.has(name)) fail(label + " missing opcode " + name);
      const id = map.get(name);
      if (!Number.isInteger(id) || id < min || id > max) fail(label + " invalid ID for " + name + ": " + id);
      if (seen.has(id)) fail(label + " duplicate ID " + id);
      seen.add(id);
    }
  };
  checkDomain(opMap, "root ISA", 1, 0xFFFFFFFF);
  checkDomain(innerOpMap, "nested ISA", 1, 0xFFFFFFFF);
  checkDomain(handlerMap, "handler map", 1, 250);
  if (profile === "compact" && opMap !== innerOpMap)
    fail("compact profile must share its single ISA map");
  if (profile !== "compact" && opMap === innerOpMap)
    fail("nested profile unexpectedly reused the root ISA map");
  return true;
}

/* Validate the schema as a complete contract, not as a best-effort fallback.
   A missing schema silently treated as [] can desynchronize every subsequent PC. */
function validateVmOperandSchemas() {
  const fail = message => { throw new Error("VM operand schema validation failed: " + message); };
  const allowed = new Set(["a", "b", "c", "bx", "sbx"]);
  const names = new Set(VM_OP_LIST);
  for (const name of VM_OP_LIST) {
    if (!Object.prototype.hasOwnProperty.call(VM_OPERAND_SCHEMAS, name)) fail("missing schema for " + name);
    const schema = VM_OPERAND_SCHEMAS[name];
    if (!Array.isArray(schema)) fail("schema is not an array for " + name);
    if (new Set(schema).size !== schema.length) fail("duplicate operand in " + name);
    for (const field of schema) if (!allowed.has(field)) fail("unsupported operand " + field + " in " + name);
    const registerFields = VM_REGISTER_OPERANDS[name];
    if (!Array.isArray(registerFields) || new Set(registerFields).size !== registerFields.length)
      fail("missing or duplicate register operand declaration for " + name);
    for (const field of registerFields) if (!schema.includes(field))
      fail("register operand " + field + " is absent from schema " + name);
  }
  for (const name of Object.keys(VM_OPERAND_SCHEMAS)) if (!names.has(name)) fail("schema references unknown opcode " + name);
  for (const name of Object.keys(VM_REGISTER_OPERANDS)) if (!names.has(name)) fail("register map references unknown opcode " + name);
  return true;
}

/* Validate serialized word offsets against the original logical instruction list.
   This catches bad widths, opcode/handler drift, malformed branch targets, and
   sentinel placement before any output is emitted to the user. */
function validateSerializedVmProto(proto, serialized, opMap, profileLabel = "prototype") {
  const fail = message => { throw new Error("VM serialized prototype validation failed (" + profileLabel + "): " + message); };
  const logical = proto.code || [];
  const map = serialized.instructionMap;
  const words = serialized.code;
  if (!Array.isArray(map) || map.length !== logical.length + 1) fail("instruction map length mismatch");
  if (!Array.isArray(words) || !words.length) fail("empty word stream");
  const inverse = new Map([...opMap.entries()].map(([name, id]) => [id, name]));
  let previousOffset = 0;
  for (let i = 0; i < map.length; i++) {
    const offset = map[i];
    if (!Number.isInteger(offset) || offset < 1 || offset > words.length) fail("invalid instruction offset at PC " + (i + 1));
    if (offset <= previousOffset) fail("instruction offsets are not strictly increasing at PC " + (i + 1));
    previousOffset = offset;
  }
  for (let pc = 0; pc < logical.length; pc++) {
    const ins = logical[pc];
    const offset = map[pc];
    const encoded = words[offset - 1];
    const id = (Number(encoded) - Number(serialized.opShift) - Number(serialized.opShift2)) >>> 0;
    const semantic = inverse.get(id);
    if (semantic !== ins.op) fail("opcode mismatch at PC " + (pc + 1) + ": expected " + ins.op + ", got " + (semantic || "unknown"));
    const schema = VM_OPERAND_SCHEMAS[semantic];
    if (!schema) fail("missing schema for " + semantic);
    const nextOffset = map[pc + 1];
    if (offset + schema.length >= nextOffset) fail("operand span overlaps next instruction at PC " + (pc + 1));
    const order = serialized.operandOrderBySemantic && serialized.operandOrderBySemantic[semantic];
    if (!Array.isArray(order) || order.length !== schema.length || new Set(order).size !== schema.length || order.some(field => !schema.includes(field))) fail("invalid per-prototype operand order for " + semantic);
    for (let oi=0;oi<order.length;oi++) {
      const field = order[oi];
      const value = words[offset + oi];
      if (typeof value !== "number" || !Number.isFinite(value)) fail("non-numeric operand " + field + " at PC " + (pc + 1));
    }
    if (["JMP", "JMPIF", "JMPIFNOT", "FORPREP", "FORLOOP", "TFORLOOP"].includes(semantic)) {
      const sbx = Number(ins.sbx ?? 0);
      if (!Number.isInteger(sbx)) fail("non-integer branch offset at PC " + (pc + 1));
      const target = pc + 2 + sbx; // runtime increments PC before applying the relative offset
      if (target < 1 || target > logical.length + 1) fail("branch target out of range at PC " + (pc + 1) + " -> " + target);
    }
  }
  const sentinelOffset = map[map.length - 1];
  const sentinelId = (Number(words[sentinelOffset - 1]) - Number(serialized.opShift) - Number(serialized.opShift2)) >>> 0;
  if (inverse.get(sentinelId) !== "RETURN") fail("logical end sentinel is not RETURN");
  for (let i = 0; i < (proto.protos || []).length; i++) {
    const childOpMap = serialized.protos[i]._validationOpMap;
    if (!(childOpMap instanceof Map)) fail("missing internal opcode map for child " + i);
    validateSerializedVmProto(proto.protos[i], serialized.protos[i], childOpMap, profileLabel + ".child" + i);
  }
  return true;
}

function makeVmOpcodeMap(profile = "balanced") {
  // V8.2: sparse unsigned 32-bit IDs. This is a larger representation domain,
  // not encryption: the client runtime still needs a resolver for every ID.
  const count = VM_OP_LIST.length;
  if (count < 1 || count > 0xFFFFFFFF) throw new Error("Unsupported VM ISA size");
  const pool = new Set();
  while (pool.size < count) {
    const id = (secureKeyFloat() * 0x100000000) >>> 0;
    if (id !== 0) pool.add(id);
  }
  const ids = Array.from(pool);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = secureKeyFloat() * (i + 1) | 0;
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return new Map(VM_OP_LIST.map((name, i) => [name, ids[i]]));
}

function deriveOpcodeBlobSeed(p, mapKeyA, mapKeyB) {
  // Exact 32-bit bitwise mixing mirrored by the Luau decoder.
  let state = (p.regMul ^ p.regAdd ^ p.regXor ^ p.opShift ^ p.opShift2 ^ p.chainSeed ^
    (mapKeyA << 16) ^ mapKeyB ^ (p.opcodeSalt || 0)) >>> 0;
  const values = [
    p.wordProfile.a,p.wordProfile.b,p.wordProfile.c,p.wordProfile.d,p.wordProfile.e,
    p.wordProfile.f,p.wordProfile.g,p.wordProfile.ca,p.wordProfile.cb,p.wordProfile.cc,
    p.wordProfile.cd,p.wordProfile.ce,p.wordProfile.cf,p.wordProfile.cg,p.wordProfile.ch,
    p.wordProfile.ci,p.wordProfile.cj,p.wordProfile.ck,
    p.constProfile.ka,p.constProfile.kb,p.constProfile.kc,p.constProfile.kd,
    p.constProfile.ke,p.constProfile.kf,p.constProfile.kg
  ];
  for (const v of values) {
    const n = Number(v) >>> 0;
    state = (state ^ n ^ (n << 7) ^ (n >>> 3)) >>> 0;
    state = (state ^ (state << 13)) >>> 0;
    state = (state ^ (state >>> 17)) >>> 0;
    state = (state ^ (state << 5)) >>> 0;
  }
  return state || 0x6D2B79F5;
}

function encodeOpcodeRecords(p, opcodeDecode, mapKeyA, mapKeyB) {
  const entries = Object.entries(opcodeDecode).map(([id, slot]) => [Number(id), Number(slot)])
    .sort((a,b) => a[0]-b[0]);
  const raw = [];
  let previousCheck = deriveOpcodeBlobSeed(p, mapKeyA, mapKeyB) & 255;
  for (let record = 0; record < entries.length; record++) {
    const [id, slot] = entries[record];
    if (!Number.isInteger(id) || id < 1 || id > 0xFFFFFFFF || !Number.isInteger(slot) || slot < 1 || slot > 250)
      throw new Error("Invalid sparse 32-bit opcode record");
    const b0 = id & 255;
    const b1 = (id >>> 8) & 255;
    const b2 = (id >>> 16) & 255;
    const b3 = Math.floor(id / 0x1000000) & 255;
    const check = (b0*3 + b1*5 + b2*7 + b3*11 + slot*13 + (record+1)*17 + previousCheck*19) & 255;
    raw.push(b0,b1,b2,b3,slot,check);
    previousCheck = check;
  }
  let state = deriveOpcodeBlobSeed(p, mapKeyA, mapKeyB);
  let previousCipher = state & 255;
  const encoded = raw.map((value, index) => {
    state = (state ^ (state << 13)) >>> 0;
    state = (state ^ (state >>> 17)) >>> 0;
    state = (state ^ (state << 5)) >>> 0;
    const mask = (state >>> ((index % 4) * 8)) & 255;
    const cipher = (value ^ mask ^ previousCipher) & 255;
    previousCipher = cipher;
    return cipher;
  });
  return encoded;
}

function vmWordMask(mask, index, xp = null, previousWord = 0) {
  // Build-specific XOR/mixing polynomial. Every coefficient is serialized into
  // the decoder, so each build gets a distinct byte mask while JS/Luau agree.
  // The runtime also folds the previous decoded word into this mask; the build
  // encoder must use the exact same term or the first opcode is corrupted.
  const x = xp || { a:73, b:19, c:11, d:7, e:5, f:3, g:17, ck:67 };
  const prev = Number(previousWord) >>> 0;
  const feedback = (((prev ^ (prev >>> 13)) >>> 0) * x.ck) % 256;
  return (mask + Math.imul(index, x.a) + ((index * index * x.b) % 256) +
    ((Math.floor(index / x.d) * x.c) % 256) + ((index % x.e) * x.f) +
    (((index ^ (index >>> 2)) * x.g) % 256) + feedback) & 255;
}

/* Chained word stream: each word mask depends on the previous *decoded* word,
   its physical index, a per-prototype seed, and per-build coefficients. The
   byte-level arithmetic is mirrored in Luau to avoid JS/Luau 32-bit overflow
   differences. This is a diversification layer, not cryptographic encryption. */
function vmChainWordMask(mask, index, previousWord, seed, xp = null) {
  const x = xp || { ca:17, cb:29, cc:37, cd:41, ce:43, cf:47, cg:53, ch:59, ci:7, cj:61, ck:67 };
  const u = Number(previousWord) >>> 0;
  const pb = [u & 255, (u >>> 8) & 255, (u >>> 16) & 255, (u >>> 24) & 255];
  const keyByte = pos => (mask + index * x.ca + ((index * index * x.cb) % 256) +
    seed * x.cc + pb[0] * x.cd + pb[1] * x.ce + pb[2] * x.cf + pb[3] * x.cg +
    pos * x.ch + ((index % x.ci) * x.cj) + (((pb[pos % 4] ^ pb[(pos + 2) % 4]) * x.ck) % 256)) & 255;
  return (keyByte(1) | (keyByte(2) << 8) | (keyByte(3) << 16) | (keyByte(4) << 24)) >>> 0;
}

function vmGcdPositive(a, b) {
  a = Math.abs(Math.trunc(a)); b = Math.abs(Math.trunc(b));
  while (b) { const t = a % b; a = b; b = t; }
  return a;
}
function vmModInversePositive(a, m) {
  if (m <= 1) return 1;
  let t = 0, nt = 1, r = m, nr = ((a % m) + m) % m;
  while (nr !== 0) {
    const q = Math.floor(r / nr);
    [t, nt] = [nt, t - q * nt];
    [r, nr] = [nr, r - q * nr];
  }
  if (r !== 1) throw new Error("VM state multiplier is not invertible");
  return ((t % m) + m) % m;
}
function makeVmStatePermutation(stateCount) {
  const modulus = Math.max(1, Math.floor(Number(stateCount) || 1));
  if (modulus === 1) return { mul: 1, add: 0, inv: 1, modulus };
  let mul = 1;
  for (let attempt = 0; attempt < 96; attempt++) {
    const candidate = 1 + (secureRandomFloat() * (modulus - 1) | 0);
    if (candidate > 1 && vmGcdPositive(candidate, modulus) === 1) { mul = candidate; break; }
  }
  const add = Math.floor(secureRandomFloat() * modulus) % modulus;
  const inv = vmModInversePositive(mul, modulus);
  if ((mul * inv) % modulus !== 1 % modulus) throw new Error("VM state permutation inverse validation failed");
  return { mul, add, inv, modulus };
}

function serializeProtoNumeric(proto, opMap, layout, shift = 0, innerOpMap = opMap, nested = false, innerLayout = layout, xorProfile = null, handlerMap = null, profile = "balanced", shift2 = 0) {
  const selectedOpMap = opMap;
  // Every prototype gets independent opcode rotations. Select a combined shift
  // that cannot encode any live opcode as the reserved zero/HALT value.
  let localShift = profile === "compact" ? (Number(shift) >>> 0) : (secureKeyFloat() * 0x100000000) >>> 0;
  let localShift2 = profile === "compact" ? (Number(shift2) >>> 0) : (secureKeyFloat() * 0x100000000) >>> 0;
  const forbiddenShiftSums = new Set(Array.from(selectedOpMap.values(), id => (-id) >>> 0));
  const combinedShift = () => (localShift + localShift2) >>> 0;
  let shiftAttempts = 0;
  while (forbiddenShiftSums.has(combinedShift()) && shiftAttempts++ < 128) {
    localShift = profile === "compact" ? (Number(shift) >>> 0) : (secureKeyFloat() * 0x100000000) >>> 0;
    localShift2 = profile === "compact" ? (Number(shift2) >>> 0) : (secureKeyFloat() * 0x100000000) >>> 0;
  }
  if (forbiddenShiftSums.has(combinedShift())) {
    // Zero rotation is a valid fallback because every randomized ID is nonzero.
    localShift = 0;
    localShift2 = 0;
  }
  const opcodeSalt = (secureKeyFloat() * 0x100000000) >>> 0;
  const physicalHandlers = handlerMap || new Map(VM_OP_LIST.map((name, i) => [name, i + 1]));
  // Independent decoder polynomials per prototype. The coefficients remain
  // present in the client payload, but sibling prototypes no longer share one
  // reusable global decoding parameter set.
  const wordProfile = {
    a:1+(secureKeyFloat()*250|0), b:1+(secureKeyFloat()*250|0),
    c:1+(secureKeyFloat()*250|0), d:2+(secureKeyFloat()*13|0),
    e:2+(secureKeyFloat()*13|0), f:1+(secureKeyFloat()*250|0),
    g:1+(secureKeyFloat()*250|0),
    ca:1+(secureKeyFloat()*250|0), cb:1+(secureKeyFloat()*250|0),
    cc:1+(secureKeyFloat()*250|0), cd:1+(secureKeyFloat()*250|0),
    ce:1+(secureKeyFloat()*250|0), cf:1+(secureKeyFloat()*250|0),
    cg:1+(secureKeyFloat()*250|0), ch:1+(secureKeyFloat()*250|0),
    ci:2+(secureKeyFloat()*13|0), cj:1+(secureKeyFloat()*250|0),
    ck:1+(secureKeyFloat()*250|0)
  };
  const constProfile = {
    ka:1+(secureKeyFloat()*250|0), kb:1+(secureKeyFloat()*250|0),
    kc:1+(secureKeyFloat()*250|0), kd:1+(secureKeyFloat()*250|0),
    ke:2+(secureKeyFloat()*13|0), kf:1+(secureKeyFloat()*250|0),
    kg:1+(secureKeyFloat()*250|0)
  };
  const consts = [];
  const constMap = new Map();
  const addK = (c) => {
    const key = (c.type || typeof c) + ":" + String(c.val !== undefined ? c.val : c);
    if (constMap.has(key)) return constMap.get(key);
    const idx = consts.length;
    consts.push(c.type === "num" ? +c.val : c.type === "bool" ? !!c.val : String(c.val));
    constMap.set(key, idx);
    return idx;
  };
  const kRemap = new Map();
  (proto.consts || []).forEach((c, i) => kRemap.set(i, addK(c)));
  // Polymorphic constant layout: shuffle the deduplicated constant pool per
  // prototype, then rewrite every old constant index before instruction emission.
  // Values and bytecode semantics are unchanged; only the physical key positions vary.
  if (consts.length > 1) {
    const order = Array.from({ length: consts.length }, (_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(secureRandomFloat() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    const oldToNew = new Array(order.length);
    const shuffled = order.map((oldIndex, newIndex) => {
      oldToNew[oldIndex] = newIndex;
      return consts[oldIndex];
    });
    for (const [oldIndex, priorIndex] of kRemap) kRemap.set(oldIndex, oldToNew[priorIndex]);
    consts.splice(0, consts.length, ...shuffled);
  }
  const code = [];
  const instructionMap = [];
  const operandOrder = Object.create(null);
  const operandOrderBySemantic = Object.create(null);
  const operandFieldId = { a:1, b:2, c:3, bx:4, sbx:5 };
  const operandSchemaOrder = new Map();
  // Odd multiplier makes the affine transform invertible modulo 2^32.
  // The three values are already stored in the prototype metadata block.
  const regMul = ((((secureRandomFloat() * 0x100000000) >>> 0) | 1) >>> 0);
  const regAdd = (secureRandomFloat() * 0x100000000) >>> 0;
  const regXor = (secureRandomFloat() * 0x100000000) >>> 0;
  const regBase = 1 + (regXor % 65521);
  const encodeOperand = (value, wordIndex, fieldId) => {
    const plain = Number(value) >>> 0;
    const positionMix = (Math.imul(wordIndex >>> 0, 0x9E3779B9) + Math.imul(fieldId >>> 0, 0x85EBCA6B)) >>> 0;
    const affine = (Math.imul(plain, regMul) + regAdd + positionMix) >>> 0;
    return (affine ^ regXor) >>> 0;
  };
  for (const semantic of VM_OP_LIST) {
    const baseSchema = (VM_OPERAND_SCHEMAS[semantic] || []).slice();
    if (profile !== "compact") for (let si=baseSchema.length-1;si>0;si--) { const sj=secureRandomFloat()*(si+1)|0; [baseSchema[si],baseSchema[sj]]=[baseSchema[sj],baseSchema[si]]; }
    operandSchemaOrder.set(semantic, baseSchema);
    operandOrder[physicalHandlers.get(semantic)] = baseSchema.map(field => operandFieldId[field]);
    operandOrderBySemantic[semantic] = baseSchema.slice();
  }
  // Every prototype receives its own ISA mapping. Each instruction stores its
  // opcode followed only by that opcode's declared operands; instructionMap maps
  // logical instruction PCs to physical word offsets after variable-width packing.
  const protos = (proto.protos || []).map(child => serializeProtoNumeric(child, makeVmOpcodeMap(profile), layout, shift, innerOpMap, true, innerLayout, xorProfile, physicalHandlers, profile, shift2));
  for (const ins of proto.code || []) {
    instructionMap.push(code.length + 1);
    let b = ins.b ?? 0, c = ins.c ?? 0, bx = ins.bx ?? 0, sbx = ins.sbx ?? 0;
    if (ins.bkey) b = 100000 + (kRemap.get(ins.b) ?? ins.b ?? 0);
    if (ins.ckey) c = 100000 + (kRemap.get(ins.c) ?? ins.c ?? 0);
    if (ins.op === "LOADK" || ins.op === "GETGLOBAL" || ins.op === "SETGLOBAL" || ins.op === "FUSED_GLOBAL_MEMBER_CALL" || ins.op === "FUSED_GLOBAL_MEMBER_LOOKUP") {
      bx = kRemap.has(ins.bx) ? kRemap.get(ins.bx) : (ins.bx ?? 0);
    }
    if (ins.op === "FUSED_GLOBAL_MEMBER_CALL" || ins.op === "FUSED_GLOBAL_MEMBER_LOOKUP") sbx = kRemap.has(ins.sbx) ? kRemap.get(ins.sbx) : (ins.sbx ?? 0);
    if (ins.op === "CLOSURE") bx = ins.bx ?? 0;
    if (!selectedOpMap.has(ins.op)) throw new Error("Unknown opcode in per-prototype VM serialization: " + ins.op);
    const schema = VM_OPERAND_SCHEMAS[ins.op];
    if (!Array.isArray(schema)) throw new Error("Missing variable-width operand schema for " + ins.op);
    const shuffledSchema = operandSchemaOrder.get(ins.op);
    if (!Array.isArray(shuffledSchema) || shuffledSchema.length !== schema.length) throw new Error("Invalid per-prototype operand schema order for " + ins.op);
    code.push((selectedOpMap.get(ins.op) + localShift + localShift2) >>> 0);
    const values = {a:ins.a ?? 0,b,c,bx,sbx};
    const registerFields = VM_REGISTER_OPERANDS[ins.op];
    if (!Array.isArray(registerFields)) throw new Error("Missing register operand contract for " + ins.op);
    for (const field of registerFields) {
      // GETTABLE.c and SETTABLE.b may contain 100000+constant-index sentinels.
      if (ins.op === "GETTABLE" && field === "c" && ins.ckey) continue;
      if (ins.op === "SETTABLE" && field === "b" && ins.bkey) continue;
      values[field] = Number(values[field]) + regBase;
    }
    for (const field of shuffledSchema) code.push(encodeOperand(values[field], code.length + 1, operandFieldId[field]));
  }
  // Method C: unreachable decoy words after the final RETURN, then HALT (op=0).
  // Layout is already applied above; each instruction is 6 consecutive words.
  // Decoys are never executed (RETURN ends the proto) but break the 0,0,0,... signature.
  const decoyCount = profile === "hardened" ? Math.floor((4 + (secureRandomFloat() * 9 | 0)) / 2) : Math.floor((2 + (secureRandomFloat() * 7 | 0)) / 2);
  // Randomized unreachable decoy blocks after the compiler-emitted terminator.
  // Block lengths and insertion offsets differ per build; these are data-only
  // words and never introduce malformed branches or intentional runtime loops.
  const deadTail = [];
  for (let di = 0; di < decoyCount; di++) {
    const blockWords = 6 * (profile === "hardened" ? 2 + (secureRandomFloat() * 3 | 0) : 1 + (secureRandomFloat() * 3 | 0));
    for (let f = 0; f < blockWords; f++) {
      deadTail.push(1 + (secureRandomFloat() * 65534 | 0));
    }
    if (secureRandomFloat() < 0.65) deadTail.push(1 + (secureRandomFloat() * 250 | 0));
  }
  // Scatter block-sized slices within the unreachable tail using build-time random offsets.
  const scattered = [];
  while (deadTail.length) {
    const take = Math.min(deadTail.length, 1 + (secureRandomFloat() * 12 | 0));
    const chunk = deadTail.splice(0, take);
    const at = scattered.length ? (secureRandomFloat() * (scattered.length + 1) | 0) : 0;
    scattered.splice(at, 0, ...chunk);
  }
  code.push(...scattered);
  // Branches that target the logical end land on a real RETURN sentinel. Decoy
  // words are not in instructionMap, so they cannot be decoded as instructions.
  instructionMap.push(code.length + 1);
  code.push((selectedOpMap.get("RETURN") + localShift + localShift2) >>> 0);
  const sentinelValues = { a:regBase, b:1, c:0, bx:0, sbx:0 };
  const sentinelOrder = operandSchemaOrder.get("RETURN");
  if (!Array.isArray(sentinelOrder) || sentinelOrder.length !== 2) throw new Error("Invalid RETURN sentinel operand order");
  for (const field of sentinelOrder) code.push(encodeOperand(sentinelValues[field], code.length + 1, operandFieldId[field]));
  const flowState = makeVmStatePermutation(instructionMap.length);
  const opcodeDecode = {};
  // Each prototype's encoded opcode IDs resolve directly to independently shuffled
  // physical handler slots, not to a shared semantic opcode namespace.
  for (const [name, randomizedId] of selectedOpMap.entries()) {
    const slot = physicalHandlers.get(name);
    if (!Number.isInteger(slot) || slot < 1 || slot > 250) throw new Error("Missing physical handler for " + name);
    // The instruction stream stores opcode IDs AFTER both per-prototype shifts.
    // Runtime indexes P.o with that decoded, shifted value, so the decode vector
    // must be keyed by the same encoded ID (not the unshifted randomized ID).
    const encodedId = (randomizedId + localShift + localShift2) >>> 0;
    if (encodedId === 0) throw new Error("Reserved zero opcode produced for " + name);
    if (opcodeDecode[encodedId] !== undefined) throw new Error("Duplicate encoded opcode ID " + encodedId);
    opcodeDecode[encodedId] = slot;
  }
  // Per-prototype operand codec coefficients. The odd 32-bit multiplier is invertible
  // modulo 2^32; the add/XOR terms and position/field mix are reversed by the VM.
  // These client-side values are reversible obfuscation material, not secrets.
  const chainSeed = 1 + (secureRandomFloat() * 65520 | 0);
  return { nparams: proto.numparams || 0, maxstack: Math.max(2, proto.maxstack || 2), consts, code, instructionMap, nested: nested ? 1 : 0, opcodeDecode,
    regMul, regAdd, regXor, opShift: localShift, opShift2: localShift2, chainSeed, opcodeSalt, operandOrder, operandOrderBySemantic,
    flowStateMul: flowState.mul, flowStateAdd: flowState.add, flowStateInv: flowState.inv,
    upvals: (proto.upvals || []).map(u => [u.inStack ? 1 : 0, u.idx]), protos,
    wordProfile, constProfile, constVariant:(secureRandomFloat()*6|0),
    // Internal-only validation metadata; emitVmProtoNumeric serializes only its allowlisted fields.
    _validationOpMap: new Map(selectedOpMap), operandOrderBySemantic };
}

/* Emit runtime strings as build-random arithmetic byte expressions. This is a
   readability barrier, not cryptographic secrecy; the decoded value exists only
   on the branch that needs it. */
function luaHiddenString(value) {
  // VM structural diagnostics are rewritten to build-local failure endpoints.
  // The scheduler does not translate tokens; ordinary user-facing errors remain descriptive.
  if (String(value).startsWith("WSF_DIAG_")) return "__WSATFailIntegrity()";
  const bytes = Array.from(new TextEncoder().encode(String(value)));
  const terms = bytes.map(b => {
    const offset = 1 + (secureRandomFloat() * 254 | 0);
    const encoded = (b + offset) & 255;
    return `((${encoded}+256-${offset})%256)`;
  });
  return `string.char(${terms.join(",")})`;
}
function luaEscapedString(value) {
  const bytes = Array.from(new TextEncoder().encode(String(value)));
  return '"' + bytes.map(b => "\\" + String(b).padStart(3, "0")).join("") + '"';
}

/* Remove diagnostic breadcrumbs from release VM output without touching user
   exceptions. The scanner is string/comment aware and replaces the complete
   error call, including dynamically concatenated PC/register details. */
function __wsHideGeneratedVmDiagnostics(lua, keepDiagnostics = false) {
  if (keepDiagnostics || typeof lua !== "string") return lua;
  const genericError = `__WSAT_error(${luaHiddenString("VM execution failed")},0)`;
  const diagnostic = /WSF_(?:DIAG|VM|INTEGRITY)_|MATH(?:CLAMP|FLOOR|CEIL|ABS|SQRT|MIN|MAX)\s+expects|Invalid\s+(?:constant|operand|bytecode|instruction|sparse|VM|prototype|frame|dispatch)|Runtime contract|Unsupported external coroutine/i;
  const skipQuoted = (source, at) => {
    const quote = source[at]; let i = at + 1;
    while (i < source.length) {
      if (source[i] === "\\") { i += 2; continue; }
      if (source[i] === quote) return i + 1;
      i++;
    }
    return source.length;
  };
  const scanCall = (source, open) => {
    let paren = 1, brace = 0, bracket = 0, comma = -1, i = open + 1;
    while (i < source.length) {
      const ch = source[i];
      if (ch === "\"" || ch === "'" || ch === "`") { i = skipQuoted(source, i); continue; }
      if (ch === "-" && source[i + 1] === "-") {
        if (source[i + 2] === "[") {
          const m = /^--\[(=*)\[/.exec(source.slice(i));
          if (m) { const close = "]" + m[1] + "]"; const end = source.indexOf(close, i + m[0].length); i = end < 0 ? source.length : end + close.length; continue; }
        }
        const end = source.indexOf("\n", i + 2); i = end < 0 ? source.length : end + 1; continue;
      }
      if (ch === "(") paren++;
      else if (ch === ")") {
        paren--;
        if (paren === 0) return { end: i + 1, first: source.slice(open + 1, comma < 0 ? i : comma) };
      } else if (ch === "{") brace++;
      else if (ch === "}") brace = Math.max(0, brace - 1);
      else if (ch === "[") bracket++;
      else if (ch === "]") bracket = Math.max(0, bracket - 1);
      else if (ch === "," && paren === 1 && brace === 0 && bracket === 0 && comma < 0) comma = i;
      i++;
    }
    return null;
  };
  let out = "", cursor = 0, i = 0;
  while (i < lua.length) {
    const ch = lua[i];
    if (ch === "\"" || ch === "'" || ch === "`") { i = skipQuoted(lua, i); continue; }
    if (ch === "-" && lua[i + 1] === "-") {
      if (lua[i + 2] === "[") {
        const m = /^--\[(=*)\[/.exec(lua.slice(i));
        if (m) { const close = "]" + m[1] + "]"; const end = lua.indexOf(close, i + m[0].length); i = end < 0 ? lua.length : end + close.length; continue; }
      }
      const end = lua.indexOf("\n", i + 2); i = end < 0 ? lua.length : end + 1; continue;
    }
    if (/[A-Za-z_]/.test(ch)) {
      const start = i++; while (i < lua.length && /[A-Za-z0-9_]/.test(lua[i])) i++;
      const ident = lua.slice(start, i);
      if (ident === "error" || ident === "__WSAT_error") {
        let open = i; while (open < lua.length && /\s/.test(lua[open])) open++;
        if (lua[open] === "(") {
          const call = scanCall(lua, open);
          if (call && diagnostic.test(call.first)) {
            out += lua.slice(cursor, start) + genericError;
            cursor = call.end; i = call.end;
          }
        }
      }
      continue;
    }
    i++;
  }
  return out + lua.slice(cursor);
}

function luaBufferExpr(bytes) {
  if (!bytes || !bytes.length) return 'buffer.fromstring("")';
  const hex = Array.from(bytes, b => (Number(b) & 255).toString(16).padStart(2, "0")).join("");
  const decoded = `(function(h)local o={} for i=1,#h,2 do o[#o+1]=string.char(tonumber(h:sub(i,i+1),16)) end return table.concat(o) end)(${JSON.stringify(hex)})`;
  return "buffer.fromstring(" + decoded + ")";
}

/* INTEGRITY (upgrade 7): a running digest over the payload. The Lua walker in
   integrityWalkerLua() folds exactly the same values in exactly the same order, so
   a build-time digest can be recomputed at runtime. Modulus is prime and below 2^31,
   so every intermediate product stays exact in both Lua and Luau numbers. */
const INTEGRITY_MOD = 2147483629;
// Twelve build-time variants share one exactly mirrored bounded-integer recurrence.
// The selected multiplier/addend are emitted into the runtime walker, so this is an
// active metamorphic integrity check rather than decorative family-name metadata.
const METAMORPHIC_INTEGRITY_FAMILIES = Object.freeze([
  { name: "fnv", multiplier: 17, addend: 1 },
  { name: "xor_shift", multiplier: 19, addend: 3 },
  { name: "matrix", multiplier: 23, addend: 5 },
  { name: "fib", multiplier: 29, addend: 7 },
  { name: "poly", multiplier: 31, addend: 11 },
  { name: "crc", multiplier: 37, addend: 13 },
  { name: "block8", multiplier: 41, addend: 17 },
  { name: "rotate", multiplier: 43, addend: 19 },
  { name: "caesar", multiplier: 13, addend: 23 },
  { name: "dual", multiplier: 7, addend: 29 },
  { name: "newton", multiplier: 11, addend: 31 },
  { name: "rgb", multiplier: 5, addend: 37 }
]);
function chooseMetamorphicIntegrityProfile() {
  const f = METAMORPHIC_INTEGRITY_FAMILIES[Math.floor(secureRandomFloat() * METAMORPHIC_INTEGRITY_FAMILIES.length)];
  return Object.freeze({ name: f.name, multiplier: f.multiplier, addend: f.addend });
}
function makeDigest(profile = chooseMetamorphicIntegrityProfile(), profile2 = null) {
  // Two independent bounded recurrences cover the same serialized payload.
  // This detects more accidental/single-path corruption, but is not cryptographic.
  if (!profile2 || (profile2.multiplier === profile.multiplier && profile2.addend === profile.addend)) {
    do { profile2 = chooseMetamorphicIntegrityProfile(); }
    while (profile2.multiplier === profile.multiplier && profile2.addend === profile.addend);
  }
  let acc = 0, acc2 = 0;
  const mul = profile.multiplier, add = profile.addend;
  const mul2 = profile2.multiplier, add2 = profile2.addend;
  const pm = v => {
    const n = Number(v);
    if (!Number.isFinite(n) || !Number.isSafeInteger(Math.floor(n))) {
      throw new Error("Integrity digest received a non-finite or unsafe numeric value");
    }
    return ((Math.floor(n) % INTEGRITY_MOD) + INTEGRITY_MOD) % INTEGRITY_MOD;
  };
  return {
    profile, profile2,
    add(v) { const n = pm(v); acc = (acc * mul + n + (acc % 251) * (n % 251) + add) % INTEGRITY_MOD; acc2 = (acc2 * mul2 + n + (acc2 % 251) * (n % 251) + add2) % INTEGRITY_MOD; },
    byte(b) { const n = b & 255; acc = (acc * mul + n + (acc % 251) * n + add) % INTEGRITY_MOD; acc2 = (acc2 * mul2 + n + (acc2 % 251) * n + add2) % INTEGRITY_MOD; },
    value() { return acc; },
    value2() { return acc2; }
  };
}

function emitNumericConstExpr(value) {
  if (!Number.isFinite(value)) throw new Error("VM cannot serialize a non-finite numeric constant");
  const offset = 100000 + (secureRandomFloat() * 800000 | 0);
  if (Number.isSafeInteger(value) && Math.abs(value) <= 1000000000) {
    return "((" + String(value + offset) + ")-" + String(offset) + ")";
  }
  if (Math.abs(value) <= 10000) {
    const scales = [10,100,1000,10000,100000,1000000,10000000,100000000];
    for (let j = scales.length - 1; j >= 0; j--) {
      const scale = scales[j], scaled = Math.round(value * scale);
      if (Number.isSafeInteger(scaled) && scaled / scale === value) {
        return "(((" + String(scaled + offset) + ")-" + String(offset) + ")/" + String(scale) + ")";
      }
    }
  }
  return String(value);
}

function emitConstTable(consts, mask, dig, nested = false, nestedKeyMask = 0xA7, xorProfile = null) {
  return "{" + consts.map((c, idx) => {
    // Typed, length-delimited records prevent ambiguous concatenations in the
    // integrity stream. This is corruption/tamper detection, not a secret MAC.
    if (typeof c === "number") { dig.add(11); dig.add(1); dig.add(c); return emitNumericConstExpr(c); }
    if (typeof c === "boolean") { dig.add(12); dig.add(1); dig.add(c ? 1 : 2); return c ? "true" : "false"; }
    // String constants are stored as per-byte masked integers, not readable literals.
    const bytes = Array.from(new TextEncoder().encode(String(c)));
    // A different per-constant seed changes the byte mask for each emitted build.
    const seed = (secureRandomFloat() * 251 | 0) + 1;
    // Independent second-chain key: runtime reverses this layer before the
    // per-constant nonlinear byte mask. This is layered obfuscation, not crypto.
    const chain = (secureRandomFloat() * 251 | 0) + 1;
    // Fragment strings into independently seeded/ chained pieces. The physical
    // fragment order is shuffled; __o preserves only the destination byte offset.
    // This is a static-analysis barrier, not encryption.
    const fragCount = bytes.length >= 24 ? (2 + (secureRandomFloat() * 3 | 0)) : 2;
    const cuts = [0];
    for (let f = 1; f < fragCount; f++) cuts.push(Math.floor(bytes.length * f / fragCount));
    cuts.push(bytes.length);
    const frags = [];
    dig.add(13); dig.add(bytes.length); dig.add(fragCount);
    const xp = xorProfile || { ka:31, kb:13, kc:17, kd:7, ke:5, kf:11, kg:7 };
    for (let fi = 0; fi < fragCount; fi++) {
      const off = cuts[fi], part = bytes.slice(cuts[fi], cuts[fi + 1]);
      const seed = (secureRandomFloat() * 251 | 0) + 1;
      const chain = (secureRandomFloat() * 251 | 0) + 1;
      let previousCipher = (seed ^ chain ^ off ^ idx) & 255;
      let streamState = (Math.imul(seed, 2654435761) ^ Math.imul(chain, 2246822519) ^
        Math.imul(off + 1, 3266489917) ^ Math.imul(idx + 1, 668265263) ^ Math.imul(mask, 374761393)) >>> 0;
      if (streamState === 0) streamState = 1839767927;
      const enc = part.map((b, j) => {
        const pos = off + j + 1;
        const key = (mask + idx * xp.ka + idx * idx * xp.kb + pos * xp.kc +
          ((pos * pos * xp.kd) % 256) + ((pos % xp.ke) * xp.kf) + seed * xp.kg +
          (((pos ^ (pos >>> 1)) * xp.ka) % 256)) & 255;
        const chainKey = (pos * 37 + chain * 13 + Math.floor(pos / 3) * 17 + (pos * pos * 7) % 256) & 255;
        streamState ^= streamState << 13;
        streamState ^= streamState >>> 17;
        streamState ^= streamState << 5;
        streamState >>>= 0;
        const streamByte = streamState >>> 24;
        const cipher = (b ^ key ^ chainKey ^ previousCipher ^ streamByte ^ (nested ? nestedKeyMask : 0)) & 255;
        previousCipher = cipher;
        return cipher;
      });
      frags.push({ off, enc, seed, chain, lua: "{__e=" + luaBufferExpr(enc) + ",__s=" + seed + ",__n=" + enc.length + ",__q=" + chain + ",__o=" + off + "}" });
    }
    for (let fi = frags.length - 1; fi > 0; fi--) { const j = secureRandomFloat() * (fi + 1) | 0; [frags[fi], frags[j]] = [frags[j], frags[fi]]; }
    for (const f of frags) { for (const b of f.enc) dig.byte(b); dig.add(f.seed); dig.add(f.enc.length); dig.add(f.chain); dig.add(f.off); }
    return "{__f={" + frags.map(f => f.lua).join(",") + "},__n=" + bytes.length + "}";
  }).join(",") + "}";
}

function emitProtoTable(p, mask, fields, dig, nestedPayloadMask = 0xA7A7A7A7, nestedKeyMask = 0xA7, xorProfile = null) {
  // Serialization is an explicit allowlist below; internal _validationOpMap is never read/emitted.
  const serializedKeys = ["v","n","m","k","kt","kb","c","im","imk","u","p","o","o2","meta","oo","wp","cp"];
  if (serializedKeys.includes("_validationOpMap")) throw new Error("Internal validation metadata cannot be serialized");
  dig.add(501); // PROTO_BEGIN
  dig.add(p.nested ? 1 : 0); dig.add(p.nparams); dig.add(p.maxstack);
  dig.add(p.regMul); dig.add(p.regAdd); dig.add(p.regXor); dig.add(p.opShift); dig.add(p.opShift2); dig.add(p.chainSeed); dig.add(p.constVariant);
  // Each prototype receives an independent odd coefficient for its constant-index tree.
  const constTreeMultiplier = (((Math.floor(secureRandomFloat() * 0x100000000) >>> 0) | 1) >>> 0);
  p.constTreeMultiplier = constTreeMultiplier;
  dig.add(constTreeMultiplier);
  dig.add(p.flowStateMul); dig.add(p.flowStateAdd); dig.add(p.flowStateInv);
  const wp = p.wordProfile || xorProfile;
  const cp = p.constProfile || xorProfile;
  const wordValues = [wp.a,wp.b,wp.c,wp.d,wp.e,wp.f,wp.g,wp.ca,wp.cb,wp.cc,wp.cd,wp.ce,wp.cf,wp.cg,wp.ch,wp.ci,wp.cj,wp.ck];
  const constValues = [cp.ka,cp.kb,cp.kc,cp.kd,cp.ke,cp.kf,cp.kg];
  dig.add(511); dig.add(wordValues.length); for (const v of wordValues) dig.add(v);
  dig.add(512); dig.add(constValues.length); for (const v of constValues) dig.add(v);
  dig.add(502); dig.add((p.consts || []).length); // CONSTANTS_BEGIN + count
  // Per-prototype opcode-map masking: emitted values are not direct handler slots.
  // This raises static extraction cost; it is obfuscation, not cryptographic secrecy.
  const mapKeyA = 1 + (secureRandomFloat() * 249 | 0);
  const mapKeyB = 1 + (secureRandomFloat() * 249 | 0);
  // V7.3 sparse records are generated here so the build-time digest folds
  // exactly the serialized bytes in the same order as the Luau integrity walker.
  const opcodeBlobBytes = encodeOpcodeRecords(p, p.opcodeDecode || {}, mapKeyA, mapKeyB);
  // V8.2: split each six-byte sparse opcode record stream into two independently emitted shares.
  // The runtime recombines them only at the byte-read site; this is a layout
  // diversification barrier, not encryption or a secret-key boundary.
  const opcodeShareB = opcodeBlobBytes.map(() => (secureRandomFloat()*256)|0);
  const opcodeShareA = opcodeBlobBytes.map((v,i) => (v ^ opcodeShareB[i]) & 255);
  dig.add(503); dig.add(opcodeShareA.length);
  for (let oi=0; oi<opcodeShareA.length; oi++) { dig.add(oi); dig.add(opcodeShareA[oi]); }
  dig.add(513); dig.add(opcodeShareB.length);
  for (let oi=0; oi<opcodeShareB.length; oi++) { dig.add(oi); dig.add(opcodeShareB[oi]); }
  dig.add(mapKeyA); dig.add(mapKeyB); dig.add(p.opcodeSalt);
  // Bind each physically permuted metadata group boundary exactly once.
  dig.add(514); dig.add(5);
  dig.add(1); dig.add(3);
  dig.add(2); dig.add(6);
  dig.add(3); dig.add(1);
  dig.add(4); dig.add(1);
  dig.add(5); dig.add(4);
  // V6: fixed-width operand metadata. Each physical handler owns six bytes:
  // [operand-count, operand-1, ... operand-5]. Zero-filled slots are invalid
  // opcodes and remain zero. This removes the directly readable Lua table map.
  // Sparse two-part layout: 251-byte slot->row index followed by compact
  // six-byte rows. This preserves O(1) runtime lookup without paying for
  // 251 * 6 bytes in every prototype.
  const operandOrderBytes = new Array(251).fill(0);
  const operandOrderRows = Object.entries(p.operandOrder || {}).sort((a,b)=>Number(a[0])-Number(b[0]));
  const operandOrderData = [];
  for (let rowIndex = 0; rowIndex < operandOrderRows.length; rowIndex++) {
    const [slotText, order] = operandOrderRows[rowIndex];
    const slot = Number(slotText);
    if (!Number.isInteger(slot) || slot < 1 || slot > 250 || !Array.isArray(order) || order.length > 5) {
      throw new Error("Invalid packed operand map row: " + slotText);
    }
    if (operandOrderBytes[slot] !== 0) throw new Error("Duplicate physical operand slot: " + slot);
    operandOrderBytes[slot] = rowIndex + 1;
    const row = new Array(6).fill(0);
    row[0] = order.length;
    for (let oi = 0; oi < order.length; oi++) {
      const fieldId = Number(order[oi]);
      if (!Number.isInteger(fieldId) || fieldId < 1 || fieldId > 5) throw new Error("Invalid operand field id");
      row[oi + 1] = fieldId;
    }
    operandOrderData.push(...row);
  }
  operandOrderBytes.push(...operandOrderData);
  dig.add(504); dig.add(operandOrderBytes.length);
  for (let oi = 0; oi < operandOrderBytes.length; oi++) { dig.add(oi); dig.add(operandOrderBytes[oi]); }
  const operandOrderLua = '"' + operandOrderBytes.map(v => "\\" + String(v).padStart(3, "0")).join("") + '"';
  // Physical constant storage is shuffled independently from the logical indexes
  // referenced by bytecode. A per-prototype tree routes logical indexes to physical
  // slots; strings are decoded through rotating independent decoder pairs at each use site.
  const logicalConsts = p.consts || [];
  const constOrder = Array.from({length:logicalConsts.length},(_,i)=>i);
  for (let i=constOrder.length-1;i>0;i--) { const j=secureRandomFloat()*(i+1)|0; [constOrder[i],constOrder[j]]=[constOrder[j],constOrder[i]]; }
  const logicalToPhysical = new Array(constOrder.length);
  const physicalConsts = constOrder.map((logical, physical)=>{ logicalToPhysical[logical]=physical; return logicalConsts[logical]; });
  const constArr = emitConstTable(physicalConsts, mask, dig, !!p.nested, nestedKeyMask, cp);
  const constBucketSize = 4 + (secureRandomFloat()*9|0);
  const constTreeRows = [];
  const constTreeSeed = (p.chainSeed ^ p.regMul ^ (p.regAdd << 1) ^ (p.regXor >>> 1) ^ (p.opShift << 2) ^ p.opShift2) >>> 0;
  const constTreeRowCount = Math.ceil(logicalToPhysical.length/constBucketSize);
  dig.add(505); dig.add(constBucketSize); dig.add(constTreeRowCount); // CONSTANT_INDEX + dimensions
  for (let i=0,bi=0;i<logicalToPhysical.length;i+=constBucketSize,bi++) {
    const row=logicalToPhysical.slice(i,i+constBucketSize);
    dig.add(bi);
    const encodedRow = row.map((physical, j) => {
      const logicalIndex = i + j + 1;
      const mask = (constTreeSeed ^ Math.imul(logicalIndex, constTreeMultiplier)) >>> 0;
      const encoded = (physical ^ mask) >>> 0;
      dig.add(j); dig.add(encoded);
      return encoded;
    });
    constTreeRows.push("{"+encodedRow.map(v=>emitNumericConstExpr(v)).join(",")+"}");
  }
  const constTree = "{"+constTreeRows.join(",")+"}";
  const encodedBytes = [];
  let previousDecodedWord = p.chainSeed | 0;
  p.code.forEach((v, i) => {
    const decodedWord = Number(v) | 0;
    let w = (decodedWord ^ vmWordMask(mask, i + 1, wp, previousDecodedWord)) >>> 0;
    w = (w ^ vmChainWordMask(mask, i + 1, previousDecodedWord, p.chainSeed, wp)) >>> 0;
    if (p.nested) w = (w ^ nestedPayloadMask) >>> 0;
    encodedBytes.push(w & 255, (w >>> 8) & 255, (w >>> 16) & 255, (w >>> 24) & 255);
    previousDecodedWord = decodedWord;
  });
  dig.add(506); dig.add(encodedBytes.length); // BYTECODE + byte count
  for (const b of encodedBytes) dig.byte(b);
  const encodedCode = luaBufferExpr(encodedBytes);
  const instructionMap = p.instructionMap || [];
  const instructionMapSeed = (Math.floor(secureRandomFloat()*4294967295)>>>0) || 0x6D2B79F5;
  let instructionMapState = instructionMapSeed >>> 0;
  let instructionMapPreviousCipher = instructionMapSeed & 255;
  let instructionMapPreviousOffset = 0;
  const instructionMapBytes = [];
  for (let mi=0; mi<instructionMap.length; mi++) {
    const offset = Number(instructionMap[mi]);
    const delta = offset - instructionMapPreviousOffset;
    if (!Number.isInteger(delta) || delta <= 0 || delta > 0xFFFFFFFF) throw new Error("Invalid instruction-map delta");
    instructionMapPreviousOffset = offset;
    for (let bi=0; bi<4; bi++) {
      instructionMapState = (instructionMapState ^ (instructionMapState << 13)) >>> 0;
      instructionMapState = (instructionMapState ^ (instructionMapState >>> 17)) >>> 0;
      instructionMapState = (instructionMapState ^ (instructionMapState << 5)) >>> 0;
      const maskByte = (instructionMapState >>> ((bi & 3)*8)) & 255;
      const plainByte = (delta >>> (bi*8)) & 255;
      const cipherByte = (plainByte ^ maskByte ^ instructionMapPreviousCipher) & 255;
      instructionMapBytes.push(cipherByte);
      instructionMapPreviousCipher = cipherByte;
    }
  }
  const instructionMapLua = '"' + instructionMapBytes.map(v=>"\\"+String(v).padStart(3,"0")).join("") + '"';
  dig.add(507); dig.add(instructionMapBytes.length);
  // Instruction-map bytes are folded as indexed scalar values by integrityWalkerLua().
  // Use add(), not byte(): byte() omits the modulo-251 normalization applied by the Lua scalar walker.
  // This keeps build-time and runtime digest recurrences identical for byte values 251..255.
  for (const b of instructionMapBytes) dig.add(b);
  dig.add(instructionMapSeed);
  const upvals = p.upvals || [];
  dig.add(508); dig.add(upvals.length);
  for (const u of upvals) { dig.add(u[0]); dig.add(u[1]); }
  const upArr = "{" + upvals.map(u => "{" + u[0] + "," + u[1] + "}").join(",") + "}";
  dig.add(509); dig.add((p.protos || []).length);
  const protoArr = p.protos.map(q => emitProtoTable(q, mask, fields, dig, nestedPayloadMask, nestedKeyMask, xorProfile)).join(",");
  dig.add(510); // PROTO_END
  // Store the per-prototype decode vector as a byte string instead of a Lua
  // numeric table. This is a representation change, not encryption: the VM
  // still validates every byte and the payload digest covers the exact bytes.
  // V8.2 sparse opcode records: each row contains a 32-bit encoded ID, slot, and check byte.
  // physical handler slot. No 251-entry direct-index vector is emitted.
  
  // V6: coefficients are encoded as fixed-width byte strings rather than
  // exposed as numeric Lua arrays. The decoder still necessarily contains the
  // transforms; this reduces direct metadata extraction, not runtime recoverability.
  const toProfileBytes = values => '"' + values.map(v => "\\" + String(v).padStart(3, "0")).join("") + '"';
  const wordProfileLua = toProfileBytes(wordValues);
  const constProfileLua = toProfileBytes(constValues);
  const opcodeShareALua = '"' + opcodeShareA.map(v=>"\\"+String(v).padStart(3,"0")).join("") + '"';
  const opcodeShareBLua = '"' + opcodeShareB.map(v=>"\\"+String(v).padStart(3,"0")).join("") + '"';
  const logicalMetaGroups=[[mapKeyA,mapKeyB,p.opcodeSalt],[p.regMul,p.regAdd,p.regXor,p.opShift,p.opShift2,p.chainSeed],[p.constVariant],[instructionMapSeed],[constTreeMultiplier,p.flowStateMul,p.flowStateAdd,p.flowStateInv]];
  const physicalMetaGroups=new Array(5);
  for(let logicalGroup=0;logicalGroup<5;logicalGroup++){
    const groupValues=logicalMetaGroups[logicalGroup];
    const physicalGroup=new Array(groupValues.length);
    for(let logicalIndex=0;logicalIndex<groupValues.length;logicalIndex++){
      const physicalIndex=fields.metaLayout.itemSlots[logicalGroup][logicalIndex]-1;
      physicalGroup[physicalIndex]=groupValues[logicalIndex];
    }
    physicalMetaGroups[fields.metaLayout.groupSlots[logicalGroup]-1]=physicalGroup;
  }
  // Pack each physically permuted metadata group as four-byte little-endian
  // records. Values stay bounded to uint32; runtime readers materialize a group
  // only when first accessed and cache it per prototype.
  const metaLua='{'+physicalMetaGroups.map(group=>{
    const bytes=[];
    for(const raw of group){
      const value=Number(raw)>>>0;
      bytes.push(value&255,(value>>>8)&255,(value>>>16)&255,(value>>>24)&255);
    }
    return JSON.stringify(Buffer.from(bytes).toString('base64').replace(/=+$/,''));
  }).join(',')+'}';
  return `{${fields.v}=${p.nested ? 1 : 0},${fields.n}=${p.nparams},${fields.m}=${p.maxstack},${fields.k}=${constArr},${fields.kt}=${constTree},${fields.kb}=${constBucketSize},${fields.c}=${encodedCode},${fields.im}=${instructionMapLua},${fields.u}=${upArr},${fields.p}={${protoArr}},${fields.o}=${opcodeShareALua},${fields.o2}=${opcodeShareBLua},${fields.meta}=${metaLua},${fields.oo}=${operandOrderLua},${fields.wp}=${wordProfileLua},${fields.cp}=${constProfileLua}}`;
}

function prototypeMetadataAccessorLua(fields) {
  const groupSlots=fields.metaLayout.groupSlots;
  const itemSlots=fields.metaLayout.itemSlots;
  const makeMetaLocal=()=>"_"+secureRandomFloat().toString(36).slice(2,7)+String(100+(secureRandomFloat()*900|0));
  const metaReaderNames=[makeMetaLocal(),makeMetaLocal(),makeMetaLocal()];
  const metaGroupReaderNames=[makeMetaLocal(),makeMetaLocal(),makeMetaLocal()];
  const metaRouteSalt=1+(secureKeyFloat()*65520|0);
  const metaRouteMul=17+(secureKeyFloat()*31|0);
  const metaFeedbackName=makeMetaLocal();
  const metaCacheName=makeMetaLocal();
  const metaLengths=[3,6,1,1,4];
  const metadataFailExpr=`error(${luaEscapedString("Invalid VM metadata access")},0)`;
  const groupReader=`local ${metaCacheName}Alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";local ${metaCacheName}Find=string.find;local ${metaCacheName}Sub=string.sub;local ${metaCacheName}Floor=math.floor;local function ${fields.metaReadName}Decode(p,g) local gi=${fields.metaGroupName}[g];if not gi then ${metadataFailExpr} end;local byProto=${metaCacheName}[p];if not byProto then byProto={};${metaCacheName}[p]=byProto end;local cached=byProto[g];if cached then return cached end;local root=p.${fields.meta};local packed=root and root[gi];local lens={${metaLengths.join(',')}};local n=lens[g];if type(packed)~="string" or #packed~=math.ceil(n*4*8/6) then ${metadataFailExpr} end;local bytes={};local acc,bits=0,0;for z=1,#packed do local v=${metaCacheName}Find(${metaCacheName}Alphabet,${metaCacheName}Sub(packed,z,z),1,true);if not v then ${metadataFailExpr} end;acc=acc*64+(v-1);bits=bits+6;if bits>=8 then bits=bits-8;local div=2^bits;bytes[#bytes+1]=${metaCacheName}Floor(acc/div)%256;acc=acc%div end end;if #bytes~=n*4 then ${metadataFailExpr} end;local out={};for j=1,n do local q=(j-1)*4;local a,b,c,d=bytes[q+1],bytes[q+2],bytes[q+3],bytes[q+4];out[j]=a+b*256+c*65536+d*16777216 end;byProto[g]=out;return out end;`;
  return `local ${fields.metaGroupName}={${groupSlots.join(',')}};local ${fields.metaReadName}Index={${itemSlots.map(row=>'{'+row.join(',')+'}').join(',')}};local ${metaCacheName}=setmetatable({},{__mode="k"});${groupReader}local ${metaReaderNames[0]}=function(p,g,i)local row=${fields.metaReadName}Index[g];local ii=row and row[i];local group=ii and ${fields.metaReadName}Decode(p,g);if not group or not ii then ${metadataFailExpr} end;return group[ii] end;local ${metaReaderNames[1]}=function(p,g,i)local group=${fields.metaReadName}Decode(p,g);local ii=${fields.metaReadName}Index[g] and ${fields.metaReadName}Index[g][i];if not ii then ${metadataFailExpr} end;local value=group[ii];return value end;local ${metaReaderNames[2]}=function(p,g,i)local gi=${fields.metaGroupName}[g];local ii=${fields.metaReadName}Index[g] and ${fields.metaReadName}Index[g][i];local group=gi and ii and ${fields.metaReadName}Decode(p,g);if not group then ${metadataFailExpr} end;return group[ii] end;local ${metaGroupReaderNames[0]}=function(p,g)return ${fields.metaReadName}Decode(p,g) end;local ${metaGroupReaderNames[1]}=function(p,g)local group=${fields.metaReadName}Decode(p,g);return group end;local ${metaGroupReaderNames[2]}=function(p,g)local gi=${fields.metaGroupName}[g];if not gi then ${metadataFailExpr} end;return ${fields.metaReadName}Decode(p,g) end;local ${metaFeedbackName}=${metaRouteSalt};local function ${fields.metaReadName}(p,g,i)${metaFeedbackName}=(${metaFeedbackName}*${metaRouteMul}+g*37+i*19+${metaRouteSalt})%65521;local route=(${metaFeedbackName}+g*i+${metaRouteSalt})%3;if route==0 then return ${metaReaderNames[0]}(p,g,i) elseif route==1 then return ${metaReaderNames[1]}(p,g,i) else return ${metaReaderNames[2]}(p,g,i) end end;local function ${fields.metaReadName}Group(p,g)${metaFeedbackName}=(${metaFeedbackName}*${metaRouteMul}+g*43+${metaRouteSalt})%65521;local route=(${metaFeedbackName}+g+${metaRouteSalt})%3;if route==0 then return ${metaGroupReaderNames[0]}(p,g) elseif route==1 then return ${metaGroupReaderNames[1]}(p,g) else return ${metaGroupReaderNames[2]}(p,g) end end;`;
}

/* INTEGRITY (upgrade 7): Lua walker that recomputes the digest over the payload at
   runtime. It mirrors emitProtoTable + makeDigest exactly. Returns the walker
   function name so the caller can compare against the stored digest. */
function integrityWalkerLua(fields, wn, profile = { multiplier: 31, addend: 1 }, profile2 = { multiplier: 37, addend: 13 }) {
  const emitWalker = (name, profileForWalker) => {
    const W = String(INTEGRITY_MOD);
    const mul = String(profileForWalker.multiplier);
    const add = String(profileForWalker.addend);
    return `
local ${name.fi}=function(acc,v)local n=math.floor(v)%${W};return (acc*${mul}+n+(acc%251)*(n%251)+${add})%${W} end
local ${name.fb}=function(acc,buf)for j=0,buffer.len(buf)-1 do local n=buffer.readu8(buf,j);acc=(acc*${mul}+n+(acc%251)*n+${add})%${W} end return acc end
local ${name.fp};${name.fp}=function(p,acc)
acc=${name.fi}(acc,501) acc=${name.fi}(acc,p.${fields.v}) acc=${name.fi}(acc,p.${fields.n}) acc=${name.fi}(acc,p.${fields.m})
acc=${name.fi}(acc,${fields.metaReadName}(p,2,1)) acc=${name.fi}(acc,${fields.metaReadName}(p,2,2)) acc=${name.fi}(acc,${fields.metaReadName}(p,2,3)) acc=${name.fi}(acc,${fields.metaReadName}(p,2,4)) acc=${name.fi}(acc,${fields.metaReadName}(p,2,5)) acc=${name.fi}(acc,${fields.metaReadName}(p,2,6)) acc=${name.fi}(acc,${fields.metaReadName}(p,3,1)) acc=${name.fi}(acc,${fields.metaReadName}(p,5,1)) acc=${name.fi}(acc,${fields.metaReadName}(p,5,2)) acc=${name.fi}(acc,${fields.metaReadName}(p,5,3)) acc=${name.fi}(acc,${fields.metaReadName}(p,5,4))
local wp=p.${fields.wp};acc=${name.fi}(acc,511);acc=${name.fi}(acc,#wp);for i=1,#wp do acc=${name.fi}(acc,string.byte(wp,i)) end
local cp=p.${fields.cp};acc=${name.fi}(acc,512);acc=${name.fi}(acc,#cp);for i=1,#cp do acc=${name.fi}(acc,string.byte(cp,i)) end
local ks=p.${fields.k};acc=${name.fi}(acc,502);acc=${name.fi}(acc,#ks)
local om=p.${fields.o};acc=${name.fi}(acc,503);acc=${name.fi}(acc,#om);for i=1,#om do acc=${name.fi}(acc,i-1) acc=${name.fi}(acc,string.byte(om,i)) end
local om2=p.${fields.o2};acc=${name.fi}(acc,513);acc=${name.fi}(acc,#om2);for i=1,#om2 do acc=${name.fi}(acc,i-1) acc=${name.fi}(acc,string.byte(om2,i)) end
acc=${name.fi}(acc,${fields.metaReadName}(p,1,1)) acc=${name.fi}(acc,${fields.metaReadName}(p,1,2)) acc=${name.fi}(acc,${fields.metaReadName}(p,1,3))
acc=${name.fi}(acc,514);acc=${name.fi}(acc,5);for gi=1,5 do acc=${name.fi}(acc,gi);acc=${name.fi}(acc,#${fields.metaReadName}Group(p,gi)) end
local oo=p.${fields.oo};acc=${name.fi}(acc,504);acc=${name.fi}(acc,#oo);for oi=1,#oo do acc=${name.fi}(acc,oi-1);acc=${name.fi}(acc,string.byte(oo,oi)) end
for i=1,#ks do local v=ks[i]
if type(v)=="table" and v.__f then
acc=${name.fi}(acc,13);acc=${name.fi}(acc,v.__n);acc=${name.fi}(acc,#v.__f)
for fi=1,#v.__f do local f=v.__f[fi];acc=${name.fb}(acc,f.__e) acc=${name.fi}(acc,f.__s) acc=${name.fi}(acc,f.__n) acc=${name.fi}(acc,f.__q) acc=${name.fi}(acc,f.__o) end
elseif type(v)=="table" then acc=${name.fi}(acc,13);acc=${name.fi}(acc,v.__n);acc=${name.fi}(acc,1);acc=${name.fb}(acc,v.__e);acc=${name.fi}(acc,v.__s);acc=${name.fi}(acc,v.__n);acc=${name.fi}(acc,v.__q)
elseif type(v)=="boolean" then acc=${name.fi}(acc,12);acc=${name.fi}(acc,1);acc=${name.fi}(acc,v and 1 or 2)
else acc=${name.fi}(acc,11);acc=${name.fi}(acc,1);acc=${name.fi}(acc,v) end
end
acc=${name.fi}(acc,505);acc=${name.fi}(acc,p.${fields.kb}) acc=${name.fi}(acc,#p.${fields.kt})
local kt=p.${fields.kt};for bi=1,#kt do acc=${name.fi}(acc,bi-1);for j=1,#kt[bi] do acc=${name.fi}(acc,j-1);acc=${name.fi}(acc,kt[bi][j]) end end
acc=${name.fi}(acc,506);acc=${name.fi}(acc,buffer.len(p.${fields.c}));acc=${name.fb}(acc,p.${fields.c})
local im=p.${fields.im};acc=${name.fi}(acc,507);acc=${name.fi}(acc,#im);for i=1,#im do acc=${name.fi}(acc,string.byte(im,i)) end;acc=${name.fi}(acc,${fields.metaReadName}(p,4,1))
local us=p.${fields.u};acc=${name.fi}(acc,508);acc=${name.fi}(acc,#us)
for i=1,#us do acc=${name.fi}(acc,us[i][1]) acc=${name.fi}(acc,us[i][2]) end
local ps=p.${fields.p};acc=${name.fi}(acc,509);acc=${name.fi}(acc,#ps)
for i=1,#ps do acc=${name.fp}(ps[i],acc) end
acc=${name.fi}(acc,510)
return acc
end;`;
  };
  const secondName = { fi: wn.fi + "2", fb: wn.fb + "2", fp: wn.fp + "2" };
  const metaAccessor=prototypeMetadataAccessorLua(fields);
  return metaAccessor + emitWalker(wn, profile) + emitWalker(secondName, profile2);
}

/* Build a per-output binary decision tree from randomized opcode IDs. */
function buildVmDispatchTree(opMap, names, handlerMap = opMap) {
  const entries = [{ id: 0, target: `${names.H}[0]` }];
  for (const [name, id] of opMap.entries()) {
    // Opcode IDs and physical handler locations are independently randomized.
    // The serialized ID selects this tree; handlerMap selects a different table slot.
    const handlerId = handlerMap.get(name);
    if (!Number.isInteger(handlerId) || handlerId < 1 || handlerId > 250) {
      throw new Error("Invalid VM handler slot for " + name);
    }
    const shard = Math.floor((handlerId - 1) / 50) + 1;
    const slot = ((handlerId - 1) % 50) + 1;
    entries.push({ id, target: `${names.H}[${shard}][${slot}]` });
  }
  entries.sort((a, b) => a.id - b.id);
  const emit = arr => {
    if (arr.length === 1) {
      const id = arr[0].id;
      const test = [
        `${names.__dispatchOp}==${id}`,
        `(${names.__dispatchOp}-${id})==0`,
        `(${names.__dispatchOp}+${251-id})%251==0`
      ][Math.floor(secureRandomFloat() * 3)];
      return `if ${test} then ${arr[0].target}(${names.a},${names.b},${names.c},${names.bx},${names.sbx}) else error("WSF_DIAG_OPCODE_DISPATCH",0) end`;
    }
    // Choose a build-specific split point as well as a build-specific pivot.
    // The previous midpoint split left a repeatable tree shape for a given
    // opcode ordering; randomized splits vary the decision-tree topology.
    const mid = 1 + Math.floor(secureRandomFloat() * (arr.length - 1));
    const left = arr.slice(0, mid), right = arr.slice(mid);
    /* Random pivot and equivalent predicate variants diversify each build's tree. */
    const lo = left[left.length - 1].id, hi = right[0].id;
    const pivot = lo + Math.floor(secureRandomFloat() * (hi - lo));
    const condIsLeft = secureRandomFloat() < 0.5;
    // FIX: keep predicate direction and branch direction consistent.
    // Swapping branches without negating the predicate sent valid opcodes
    // into the wrong subtree, eventually raising "invalid opcode".
    const cond = condIsLeft
      ? [`${names.__dispatchOp}<=${pivot}`, `(${names.__dispatchOp}-${pivot})<=0`][Math.floor(secureRandomFloat() * 2)]
      : `${names.__dispatchOp}>${pivot}`;
    const trueBranch = condIsLeft ? left : right;
    const falseBranch = condIsLeft ? right : left;
    return `if ${cond} then ${emit(trueBranch)} else ${emit(falseBranch)} end`;
  };
  return `do ${emit(entries)} end`;
}

/* VM: randomized opcode IDs and decision-tree topology, opaque loop predicate, fused superinstructions,
   non-linear position-dependent word masking, previous-decoded-word chained bytecode stream, per-constant non-linear byte encoding, lazy string decoding,
   affine virtual registers, and an explicit operand/call stack. Higher CFF levels add opaque predicates to
   shuffled state dispatch. The Luraph schema-30 scaffold is structural inspiration only; unverified opcode
   semantics and operand formats are not copied. */
let __wsTimingNoiseBuild = false;
function buildLuauVmEngine(mask, opMap, innerOpMap, handlerMap, fields, names, layout, innerLayout, maskExpr, vrMul, vrAdd, vrXor, opShift, nestedPayloadMask = 0xA7A7A7A7, nestedKeyMask = 0xA7, xorProfile = null, integrityFn = null, instructionBudget = 1000000, opShift2 = 0, runtimeBinding = false, maskBase = 1, runtimeEnvExpectedKey = 0, integrityPolicy = "strict", antiHookMode = "balanced", runtimeSize = "compact", maxCallDepth = 512, useCoroutineScheduler = false, vmDebug = false, activeVmOps = null) {
  // Per-build names prevent emitted VM internals from exposing stable, searchable
  // identifiers. This is obfuscation only, not a guarantee against reverse engineering.
  const __vmLocalNames = new Set();
  const makeVmLocal = () => {
    const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let name;
    do { name = "_" + Array.from({length:5}, () => alphabet[secureRandomFloat() * 52 | 0]).join(""); }
    while (__vmLocalNames.has(name));
    __vmLocalNames.add(name);
    return name;
  };
  const integrityInterval = 13 + (secureRandomFloat() * 12 | 0); // build-time cadence: 13..24 VM instructions
  // Each validation class receives several build-random endpoints. Their
  // control-flow shapes differ, but all terminate locally and preserve fail-closed
  // behavior; no failure token is sent to the coroutine scheduler.
  const activeSemanticSet = activeVmOps instanceof Set ? new Set(activeVmOps) : new Set(VM_OP_LIST);
  for (const semantic of activeSemanticSet) if (!VM_OP_LIST.includes(semantic)) throw new Error("Unknown active VM opcode: " + semantic);
  const inactiveMicroPair = [29,0];
  const semanticMicroSpec = semantic => activeSemanticSet.has(semantic) ? microSpec[semantic] : inactiveMicroPair;
  const failureText = "VM validation failed";
  const failureHandlerPools = Object.fromEntries(["Integrity", "Structure", "Dispatch", "Probe"].map(kind => [
    kind, Array.from({length: 3}, () => makeVmLocal())
  ]));
  const failureHandlerDecl = Object.values(failureHandlerPools).flat().map((fnName, index) => {
    const mask = 1 + (secureKeyFloat() * 254 | 0);
    const messageExpr = `__WSAT_string.char(${Array.from(failureText, ch => `__WSAT_bxor(${ch.charCodeAt(0) ^ mask},${mask})`).join(",")})`;
    const variant = secureRandomFloat() * 5 | 0;
    const noiseA = 1 + (secureKeyFloat() * 251 | 0);
    const noiseB = 1 + (secureKeyFloat() * 251 | 0);
    const noise = `local __n=(${noiseA}*${noiseB}+${index+1})%65521;if __n<0 then __n=__n+65521 end;`;
    if (variant === 0) return `local function ${fnName}() ${noise}__WSAT_error(${messageExpr},0) end`;
    if (variant === 1) return `local function ${fnName}() ${noise}local __raise=__WSAT_error;local __msg=${messageExpr};__raise(__msg,0);__raise=nil;__msg=nil end`;
    if (variant === 2) return `local function ${fnName}() ${noise}return __WSAT_error(${messageExpr},0) end`;
    if (variant === 3) return `local function ${fnName}() ${noise}local __invoke=function(v)return __WSAT_error(v,0) end;local __r=__invoke(${messageExpr});__invoke=nil;return __r end`;
    return `local function ${fnName}() ${noise}local __ok,__reason=__WSAT_pcall(function() __WSAT_error(${messageExpr},0) end);if not __ok then return __WSAT_error(__reason,0) end;return false end`;
  }).join("\n");
  const failureInvokeName = () => makeVmLocal();
  const constAccessName = makeVmLocal();
  // Scalar-only one-entry cache: primitive locals avoid per-access cache-record
  // allocations and keep decoded strings/tables out of the cache entirely.
  const constAccessCacheName = makeVmLocal();
  const constAccessCacheSiteName = makeVmLocal();
  const constAccessCacheValueName = makeVmLocal();
  const constAccessCacheExpiryName = makeVmLocal();
  const constAccessCacheValidName = makeVmLocal();
  const constAccessEpochName = makeVmLocal();
  const hotGuardName = makeVmLocal();
  const hotGuardStateName = makeVmLocal();
  const hotGuardSeed = 1 + (secureKeyFloat() * 65520 | 0);
  const hotGuardMul = 17 + (secureKeyFloat() * 97 | 0);
  const hotGuardPcMul = 3 + (secureKeyFloat() * 43 | 0);
  const hotGuardStackMul = 5 + (secureKeyFloat() * 47 | 0);
  const hotGuardStride = 7 + (secureKeyFloat() * 19 | 0);
  const constantCacheLifetime = runtimeSize === "full" ? 1 + (secureKeyFloat() * 2 | 0) : 2 + (secureKeyFloat() * 3 | 0);
  const compactChecks = antiHookMode === "off" && runtimeSize !== "full";
  const envKeyName = makeVmLocal();
  const envProbeNames = Array.from({length: 15}, () => makeVmLocal());
  const envKeyCode = runtimeBinding ? (() => {
    const [ok,a,b,c,d,e,f,g,h,i,j,k,l,m,n] = envProbeNames;
    const acc = makeVmLocal();
    const fold = [
      `${acc}=(${acc}*31+#${a})%65521`,
      `${acc}=(${acc}*31+tonumber(${b}))%65521`,
      `${acc}=(${acc}*31+${c})%65521`,
      `${acc}=(${acc}*31+${d})%65521`,
      `${acc}=(${acc}*31+string.byte(${e},1)+string.byte(${e},2))%65521`,
      `${acc}=(${acc}*31+${f})%65521`,
      `${acc}=(${acc}*31+#${g})%65521`,
      `${acc}=(${acc}*31+#${h})%65521`,
      `${acc}=(${acc}*31+#${i})%65521`,
      `${acc}=(${acc}*31+#${j})%65521`,
      `${acc}=(${acc}*31+#${k})%65521`,
      `${acc}=(${acc}*31+#${l})%65521`,
      `${acc}=(${acc}*31+#${m})%65521`,
      `${acc}=(${acc}*31+#${n})%65521`
    ].join(";");
    return `local ${envKeyName}=(function() local ${ok},${a},${b},${c},${d},${e},${f},${g},${h},${i},${j},${k},${l},${m},${n}=pcall(function() return type(1),tostring(1),math.floor(1.5),string.byte("WSF",1),string.char(87,83),__bit.bxor(5,3),type(buffer.create),type(buffer.len),type(buffer.tostring),type(buffer.fill),type(buffer.readu8),type(buffer.writeu8),type(table.pack),type(table.unpack) end); if not ${ok} or ${a}~="number" or ${b}~="1" or ${c}~=1 or ${d}~=87 or ${e}~="WS" or ${f}~=6 or ${g}~="function" or ${h}~="function" or ${i}~="function" or ${j}~="function" or ${k}~="function" or ${l}~="function" or ${m}~="function" or ${n}~="function" then error(${luaHiddenString("Runtime contract mismatch")},0) end; local ${acc}=0;${fold};return ${acc} end)(); if ${envKeyName}~=${runtimeEnvExpectedKey} then error(${luaHiddenString("Runtime contract key mismatch")},0) end;`;
  })() : "";
  const runtimeMaskExpr = runtimeBinding ? `bit32.bxor(${maskBase},${envKeyName}%256)` : maskExpr;
  const frameSerialName = makeVmLocal();
  const schedulerActiveName = makeVmLocal();
  const encodedOpName = makeVmLocal();
  const maskedOpName = makeVmLocal();
  const precheckName = makeVmLocal();
  const chainKeyName = makeVmLocal();
  const chainValueName = makeVmLocal();
  const previousWordName = makeVmLocal();
  const nextWordName = makeVmLocal();
  const decodedCacheName = makeVmLocal();
  const decodedCacheIndexName = makeVmLocal();
  const opcodeResolverName = makeVmLocal();
  const constDecoderNameA = makeVmLocal();
  const constDecoderNameB = makeVmLocal();
  const constDecoderNameC = makeVmLocal();
  const constDecoderRouteName = makeVmLocal();
  const constDecoderBankName = makeVmLocal();
  const constDecoderBankSealName = makeVmLocal();
  const constDecoderSealAName = makeVmLocal();
  const constDecoderSealBName = makeVmLocal();
  const constDecoderSealCName = makeVmLocal();
  const constDecodeEpochName = makeVmLocal();
  const constDispatcherNames = [makeVmLocal(), makeVmLocal(), makeVmLocal()];
  const constTreeSeedName = makeVmLocal();
  const constChainStateName = makeVmLocal();
  const wordCountName = makeVmLocal();
  const instructionMapReaderName = makeVmLocal();
  const fetchStageName = makeVmLocal();
  const dispatchStageName = makeVmLocal();
  const dispatchOpcodeParam = makeVmLocal();
  // The instruction word is normalized as an unsigned 32-bit opcode ID before the sparse resolver.
  const operandRowsBySlot = new Map(VM_OP_LIST.map(semantic => ({ semantic, slot: handlerMap.get(semantic) }))
    .sort((a, b) => a.slot - b.slot).map((item, index) => [item.slot, index + 1]));
  const operandDecode = VM_OP_LIST.map((semantic, index) => {
    const slot = handlerMap.get(semantic);
    const rowIndex = operandRowsBySlot.get(slot);
    const schema = VM_OPERAND_SCHEMAS[semantic] || [];
    const operandBase = 251 + (rowIndex - 1) * 6 + 1;
    const operandLookup = slot + 1;
    const reads = schema.length ? `local __ooRow=__WSAT_byte(P.${fields.oo},${operandLookup});if __ooRow~=${rowIndex} then error("Invalid operand map index",0) end;local __ooBase=${operandBase};local __ooCount=__WSAT_byte(P.${fields.oo},__ooBase);if __ooCount~=${schema.length} then error("Invalid operand order",0) end;for __oi=1,__ooCount do local __wordIndex=__oprd;local __ov=D(__wordIndex);__oprd=__oprd+1;local __of=__WSAT_byte(P.${fields.oo},__ooBase+__oi);if __of<1 or __of>5 then error("Invalid operand field",0) end;local __uov=__ov;if __uov<0 then __uov=__uov+4294967296 end;__uov=bit32.bxor(__uov,__opXor);local __omix=(__WSMul32(__wordIndex,2654435769)+__WSMul32(__of,2246822507))%4294967296;__uov=(__uov-__opAdd-__omix)%4294967296;__ov=__WSMul32(__uov,__opInv);if __ov>2147483647 then __ov=__ov-4294967296 end;if __of==1 then a=__ov elseif __of==2 then b=__ov elseif __of==3 then c=__ov elseif __of==4 then bx=__ov elseif __of==5 then sbx=__ov else error("Invalid operand field",0) end end` : `if __WSAT_byte(P.${fields.oo},${operandLookup})~=${rowIndex} then error("Invalid operand map index",0) end`;
    return (index ? "elseif" : "if") + ` op==${slot} then ${reads || "do end"} `;
  }).join("") + "end";
  const dispatchMultiplier = 1 + (secureKeyFloat() * 250 | 0);
  let dispatchInverse = 1;
  while ((dispatchMultiplier * dispatchInverse) % 251 !== 1) dispatchInverse++;
  const dispatchLastMul = 1 + (secureKeyFloat() * 250 | 0);
  const dispatchStackMul = 1 + (secureKeyFloat() * 250 | 0);
  const flowPcMul = 1 + (secureKeyFloat() * 250 | 0);
  const flowLastMul = 1 + (secureKeyFloat() * 250 | 0);
  const flowStackMul = 1 + (secureKeyFloat() * 250 | 0);
  const constChainForms = [
    `(pos*37+${constChainStateName}*13+__WSAT_floor(pos/3)*17+(pos*pos*7)%256)%256`,
    `((pos*37)%256+(${constChainStateName}*13)%256+(__WSAT_floor(pos/3)*17)%256+((pos%256)*(pos%256)*7)%256)%256`,
    `(pos*37+${constChainStateName}*13+__WSAT_floor(pos/3)*17+((pos%256)*(pos%256)*7))%256`
  ];
  const constQForms = [
    `(__XM+physical*__WSAT_byte(__constProfile,1)+physical*physical*__WSAT_byte(__constProfile,2)+pos*__WSAT_byte(__constProfile,3)+(pos*pos*__WSAT_byte(__constProfile,4))%256+((pos%__WSAT_byte(__constProfile,5))*__WSAT_byte(__constProfile,6))+seed*__WSAT_byte(__constProfile,7)+((__WSAT_bxor(pos,bit32.rshift(pos,1))*__WSAT_byte(__constProfile,1))%256))%256`,
    `(__XM+seed*__WSAT_byte(__constProfile,7)+((pos%__WSAT_byte(__constProfile,5))*__WSAT_byte(__constProfile,6))+physical*__WSAT_byte(__constProfile,1)+(physical*physical*__WSAT_byte(__constProfile,2))%256+pos*__WSAT_byte(__constProfile,3)+(pos*pos*__WSAT_byte(__constProfile,4))%256+((__WSAT_bxor(pos,bit32.rshift(pos,1))*__WSAT_byte(__constProfile,1))%256))%256`,
    `(__XM+(physical*__WSAT_byte(__constProfile,1))%256+(physical*physical*__WSAT_byte(__constProfile,2))%256+(pos*__WSAT_byte(__constProfile,3))%256+(pos*pos*__WSAT_byte(__constProfile,4))%256+((pos%__WSAT_byte(__constProfile,5))*__WSAT_byte(__constProfile,6))%256+(seed*__WSAT_byte(__constProfile,7))%256+((__WSAT_bxor(pos,bit32.rshift(pos,1))*__WSAT_byte(__constProfile,1))%256))%256`
  ];
  const buildConstDecoder = (decoderName, variant) => `local function ${decoderName}(i)
${integrityFn ? " __WSIntegrityAssert();" : ""}
 if __WSAT_type(i)~="number" or i%1~=0 or i<0 or i>=#P.${fields.k} then __WSAT_error(${luaHiddenString("WSF_DIAG_CONSTANT_BOUNDS")},0) end
 local bucket=P.${fields.kt}[__WSAT_floor(i/P.${fields.kb})+1];if __WSAT_type(bucket)~="table" then __WSAT_error("Invalid constant bucket",0) end
 local __logical=i+1;local __treeMask=bit32.bxor(${constTreeSeedName},__WSMul32(__logical,${fields.metaReadName}(P,5,1)))
 local physical=bit32.bxor(bucket[(i%P.${fields.kb})+1],__treeMask)
 if __WSAT_type(physical)~="number" or physical%1~=0 or physical<0 or physical>=#P.${fields.k} then __WSAT_error("Invalid constant tree index",0) end
 local v=P.${fields.k}[physical+1]
 if __WSAT_type(v)=="table" and v.__f then
  local n=v.__n or 0;local out=__WSAT_buf_create(n)
  for fi=1,#v.__f do
   local f=v.__f[fi];local seed=f.__s or 0;local ${constChainStateName}=f.__q or 0;local off=f.__o or 0;local previousCipher=bit32.band(bit32.bxor(seed,${constChainStateName},off,physical),255)
   local streamState=bit32.bxor(__WSMul32(seed,2654435761),__WSMul32(${constChainStateName},2246822519),__WSMul32(off+1,3266489917),__WSMul32(physical+1,668265263),__WSMul32(__XM,374761393));if streamState==0 then streamState=1839767927 end
   for j=1,f.__n do
    local pos=off+j;local cipher=__WSAT_buf_readu8(f.__e,j-1)
    local chainKey=${constChainForms[variant]}
    local q=${constQForms[variant]}
    streamState=bit32.bxor(streamState,bit32.lshift(streamState,13));streamState=bit32.bxor(streamState,bit32.rshift(streamState,17));streamState=bit32.bxor(streamState,bit32.lshift(streamState,5));local streamByte=bit32.rshift(streamState,24)
    local z=__WSAT_bxor(cipher,chainKey,q,previousCipher,streamByte);previousCipher=cipher
    if P.${fields.v}==1 then z=__WSAT_bxor(z,${nestedKeyMask}) end
    __WSAT_buf_writeu8(out,pos-1,z)
   end
  end
  local decoded=__WSAT_buf_tostring(out);__WSAT_buf_fill(out,0,0,n);out=nil;return decoded
 end
 if __WSAT_type(v)=="table" and v.__e then
  local seed=v.__s or 0;local ${constChainStateName}=v.__q or 0;local n=v.__n or __WSAT_buf_len(v.__e);local out=__WSAT_buf_create(n);local previousCipher=bit32.band(bit32.bxor(seed,${constChainStateName},physical),255)
  for j=1,n do
   local pos=j;local cipher=__WSAT_buf_readu8(v.__e,j-1)
   local chainKey=${constChainForms[variant]}
   local q=${constQForms[variant]}
   local z=__WSAT_bxor(cipher,chainKey,q,previousCipher);previousCipher=cipher
   if P.${fields.v}==1 then z=__WSAT_bxor(z,${nestedKeyMask}) end
   __WSAT_buf_writeu8(out,j-1,z)
  end
  local decoded=__WSAT_buf_tostring(out);__WSAT_buf_fill(out,0,0,n);out=nil;return decoded
 end
 if __WSAT_type(v)=="table" then __WSAT_error("Invalid constant record",0) end
 return v
end`;
  const compactConstRouteSalt = 1 + (secureKeyFloat() * 65521 | 0);
  const constDecoderBlock = compactChecks ? [
    `local ${constTreeSeedName}=bit32.bxor(${fields.metaReadName}(P,2,6),${fields.metaReadName}(P,2,1),bit32.lshift(${fields.metaReadName}(P,2,2),1),bit32.rshift(${fields.metaReadName}(P,2,3),1),bit32.lshift(${fields.metaReadName}(P,2,4),2),${fields.metaReadName}(P,2,5))`,
    buildConstDecoder(constDecoderNameA, 0),
    buildConstDecoder(constDecoderNameB, 1),
    `local ${constDecodeEpochName}=0;local function ${constDecoderRouteName}(i) ${constDecodeEpochName}=${constDecodeEpochName}+1;local route=(i*17+${constDecodeEpochName}*29+${compactConstRouteSalt}+${fields.metaReadName}(P,3,1)*13)%2;local value;if route==0 then value=${constDecoderNameA}(i) else value=${constDecoderNameB}(i) end;${integrityFn ? `if ${constDecodeEpochName}%11==0 then local check;if route==0 then check=${constDecoderNameB}(i) else check=${constDecoderNameA}(i) end;if not __WSAT_rawequal(value,check) then __WSATFailIntegrity() end end;` : ""}return value end`
  ].join("\n") : [
    `local ${constTreeSeedName}=bit32.bxor(${fields.metaReadName}(P,2,6),${fields.metaReadName}(P,2,1),bit32.lshift(${fields.metaReadName}(P,2,2),1),bit32.rshift(${fields.metaReadName}(P,2,3),1),bit32.lshift(${fields.metaReadName}(P,2,4),2),${fields.metaReadName}(P,2,5))`,
    buildConstDecoder(constDecoderNameA, 0),
    buildConstDecoder(constDecoderNameB, 1),
    buildConstDecoder(constDecoderNameC, 2),
    `local __decoderPermutations={{1,2,3},{1,3,2},{2,1,3},{2,3,1},{3,1,2},{3,2,1}};local __decoderRaw={${constDecoderNameA},${constDecoderNameB},${constDecoderNameC}};local __decoderOrder=__decoderPermutations[(${fields.metaReadName}(P,3,1)%6)+1];local ${constDecoderBankName}={__decoderRaw[__decoderOrder[1]],__decoderRaw[__decoderOrder[2]],__decoderRaw[__decoderOrder[3]]};local ${constDecoderSealAName}=${constDecoderBankName}[1];local ${constDecoderSealBName}=${constDecoderBankName}[2];local ${constDecoderSealCName}=${constDecoderBankName}[3];local ${constDecoderBankSealName}=${constDecoderBankName};local ${constDecodeEpochName}=0;__WSATRegisterCoreTable(${constDecoderBankName})`,
    `local ${constDispatcherNames[0]}=function(i)local a=${constDecoderBankName}[1](i);local b=${constDecoderBankName}[2](i);if not __WSAT_rawequal(a,b) then __WSATFailIntegrity() end;return a end`,
    `local ${constDispatcherNames[1]}=function(i)local a=${constDecoderBankName}[2](i);local b=${constDecoderBankName}[3](i);if not __WSAT_rawequal(a,b) then __WSATFailIntegrity() end;return a end`,
    `local ${constDispatcherNames[2]}=function(i)local a=${constDecoderBankName}[3](i);local b=${constDecoderBankName}[1](i);if not __WSAT_rawequal(a,b) then __WSATFailIntegrity() end;return a end`,
    `local __constDispatchSealA=${constDispatcherNames[0]};local __constDispatchSealB=${constDispatcherNames[1]};local __constDispatchSealC=${constDispatcherNames[2]};local __constRouteSalt=${1 + (secureKeyFloat()*65521|0)};local function __constDispatchRoute(i,lane)local r=(i*17+lane*29+__constRouteSalt)%3;if r==0 then return ${constDispatcherNames[0]}(i) elseif r==1 then return ${constDispatcherNames[1]}(i) else return ${constDispatcherNames[2]}(i) end end`,
    `if __WSAT_freeze then __WSAT_pcall(__WSAT_freeze,${constDecoderBankName}) end`
  ].join("\n");
  // Constant accesses have three distinct modes: direct decode, a tiny scalar-only
  // cache, and a deferred decoder closure. Call-site salts diversify route selection.
  const constAccessRuntime = compactChecks ? `local ${constAccessCacheName},${constAccessCacheSiteName},${constAccessCacheValueName},${constAccessCacheExpiryName},${constAccessCacheValidName}=-1,-1,nil,0,false;local ${constAccessEpochName}=0;local function ${constAccessName}(i,site)
 ${constAccessEpochName}=${constAccessEpochName}+1;if ${constAccessCacheValidName} and ${constAccessCacheExpiryName}<${constAccessEpochName} then ${constAccessCacheValueName}=nil;${constAccessCacheValidName}=false end;local route=(i*17+site*31+${constAccessEpochName}*13+${fields.metaReadName}(P,3,1)*19+${compactConstRouteSalt})%3
 if route==1 and ${constAccessCacheValidName} and ${constAccessCacheName}==i and ${constAccessCacheSiteName}==site and ${constAccessCacheExpiryName}>=${constAccessEpochName} then return ${constAccessCacheValueName} end
 local value;if route==0 then value=${constDecoderNameA}(i) elseif route==1 then local decode=${constDecoderNameB};value=decode(i);decode=nil else local thunk=function() return ${constDecoderNameA}(i) end;value=thunk();thunk=nil end
 local kind=__WSAT_type(value);if kind=="number" or kind=="boolean" then ${constAccessCacheName}=i;${constAccessCacheSiteName}=site;${constAccessCacheValueName}=value;${constAccessCacheExpiryName}=${constAccessEpochName}+${constantCacheLifetime};${constAccessCacheValidName}=true else ${constAccessCacheValueName}=nil;${constAccessCacheValidName}=false end;return value
end` : `local ${constAccessCacheName},${constAccessCacheSiteName},${constAccessCacheValueName},${constAccessCacheExpiryName},${constAccessCacheValidName}=-1,-1,nil,0,false;local ${constAccessEpochName}=0;local function ${constAccessName}(i,site)
 ${constDecodeEpochName}=${constDecodeEpochName}+1;${constAccessEpochName}=${constAccessEpochName}+1;if ${constAccessCacheValidName} and ${constAccessCacheExpiryName}<${constAccessEpochName} then ${constAccessCacheValueName}=nil;${constAccessCacheValidName}=false end
 if ${constAccessEpochName}%${13+(secureRandomFloat()*11|0)}==0 then if not __WSAT_rawequal(${constDecoderBankName},${constDecoderBankSealName}) or not __WSAT_rawequal(${constDecoderBankName}[1],${constDecoderSealAName}) or not __WSAT_rawequal(${constDecoderBankName}[2],${constDecoderSealBName}) or not __WSAT_rawequal(${constDecoderBankName}[3],${constDecoderSealCName}) or not __WSAT_rawequal(${constDispatcherNames[0]},__constDispatchSealA) or not __WSAT_rawequal(${constDispatcherNames[1]},__constDispatchSealB) or not __WSAT_rawequal(${constDispatcherNames[2]},__constDispatchSealC) then __WSATFailIntegrity() end end
 local route=(i*17+site*31+${constAccessEpochName}*13+${fields.metaReadName}(P,3,1)*19+${compactConstRouteSalt})%3
 if route==1 and ${constAccessCacheValidName} and ${constAccessCacheName}==i and ${constAccessCacheSiteName}==site and ${constAccessCacheExpiryName}>=${constAccessEpochName} then return ${constAccessCacheValueName} end
 local value;if route==0 then value=${constDecoderBankName}[1](i) elseif route==1 then local decode=${constDecoderBankName}[2];value=decode(i);decode=nil else local thunk=function() return ${constDecoderBankName}[3](i) end;value=thunk();thunk=nil end
 if ${constAccessEpochName}%${17+(secureRandomFloat()*13|0)}==0 then local a=${constDispatcherNames[0]}(i);local b=${constDispatcherNames[1]}(i);local c=${constDispatcherNames[2]}(i);if not __WSAT_rawequal(a,b) or not __WSAT_rawequal(a,c) or not __WSAT_rawequal(a,value) then __WSATFailIntegrity() end end
 local kind=__WSAT_type(value);if kind=="number" or kind=="boolean" then ${constAccessCacheName}=i;${constAccessCacheSiteName}=site;${constAccessCacheValueName}=value;${constAccessCacheExpiryName}=${constAccessEpochName}+${constantCacheLifetime};${constAccessCacheValidName}=true else ${constAccessCacheValueName}=nil;${constAccessCacheValidName}=false end;return value
end`;
  const constResolveInline = (indexExpr) => `${constAccessName}(${indexExpr},${1+(secureKeyFloat()*65520|0)})`;
  const antiHookProbeKey = "p" + Array.from({length:12}, () => "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(secureRandomFloat()*36)]).join("");
  const runtimeProbePool = [
    'local captured=41;local closure=function(delta) captured=captured+delta;return captured end;if closure(1)~=42 or closure(2)~=44 then __WSATFailProbe() end;closure=nil;captured=nil',
    'local proxy={};local mt2={__index=function(_,k) if k=="probeValue" then return 73 end end,__newindex=function(t,k,v) __WSAT_rawset(t,k,v+1) end};__WSAT_setmetatable(proxy,mt2);if proxy.probeValue~=73 or __WSAT_rawget(proxy,"probeValue")~=nil then __WSATFailProbe() end;proxy.x=8;if __WSAT_rawget(proxy,"x")~=9 then __WSATFailProbe() end;__WSAT_setmetatable(proxy,nil)',
    'local fn=function(v)return v*3+2 end;local ok,value=__WSAT_pcall(fn,13);if not ok or value~=41 then __WSATFailProbe() end;fn=nil',
    'local capturedTable={value=19};local reader=function() return capturedTable.value end;if reader()~=19 then __WSATFailProbe() end;capturedTable.value=23;if reader()~=23 then __WSATFailProbe() end;reader=nil;capturedTable=nil'
  ];
  for(let i=runtimeProbePool.length-1;i>0;i--){const j=secureRandomFloat()*(i+1)|0;[runtimeProbePool[i],runtimeProbePool[j]]=[runtimeProbePool[j],runtimeProbePool[i]];}
  const selectedRuntimeProbes=runtimeProbePool.slice(0,2+(secureRandomFloat()*3|0));
  const antiHookGuardLua = antiHookMode === "off" ? "return true" : [
    'if __WSAT_type(__WSAT_rawget)~="function" or __WSAT_type(__WSAT_rawset)~="function" or __WSAT_type(__WSAT_getmetatable)~="function" then __WSATFailIntegrity() end',
    ...(antiHookMode === "strict" ? [
      'if (debug~=nil)~=__WSAT_debugPresentAtBootstrap or debug~=__WSAT_debug or xpcall~=__WSAT_xpcall or getfenv~=__WSAT_getfenv or setfenv~=__WSAT_setfenv or hookfunction~=nil or hookmetamethod~=nil or newcclosure~=nil or clonefunction~=nil or restorefunction~=nil or getgenv~=nil or getrenv~=nil or getgc~=nil or getreg~=nil or getconnections~=nil or getloadedmodules~=nil or getnilinstances~=nil or getinstances~=nil or checkcaller~=nil or isexecutorclosure~=nil then __WSATFailIntegrity() end',
      'if __WSAT_debug and __WSAT_type(__WSAT_debug)=="table" then local denied={"getupvalue","setupvalue","getregistry","getlocal","setlocal","sethook","gethook","getinfo","upvalueid","upvaluejoin"};for i=1,#denied do local fn=__WSAT_rawget(__WSAT_debug,denied[i]);if fn~=nil then __WSATFailIntegrity() end end end'
    ] : []),
    `local probe={};local key="${antiHookProbeKey}";__WSAT_rawset(probe,key,0x5A);if __WSAT_rawget(probe,key)~=0x5A or __WSAT_getmetatable(probe)~=nil then __WSATFailProbe() end;local mt={};__WSAT_setmetatable(probe,mt);if __WSAT_getmetatable(probe)~=mt then __WSATFailProbe() end;__WSAT_setmetatable(probe,nil);probe[key]=nil`,
    'local currentThread;if __WSAT_coroutineRunning then currentThread=__WSAT_coroutineRunning() end;if currentThread==nil then currentThread=__WSATMainThreadToken end;if expectedThread==nil or not __WSAT_rawequal(currentThread,expectedThread) or not __WSAT_rawequal(__WSATMainThreadToken,__WSATMainThreadTokenSeal) then __WSATFailProbe() end',
    'if __WSATCoreTableNext<1 then __WSATFailProbe() end;for ri=1,__WSATCoreTableNext do local t=__WSAT_rawget(__WSATCoreTableRegistry,ri);if __WSAT_type(t)~="table" or __WSAT_getmetatable(t)~=nil then __WSATFailProbe() end end',
    ...selectedRuntimeProbes,
    'return true'
  ].join("\n").replaceAll("__WSATFailIntegrity()", "__WSATFailProbe()");
  const hotGuardLua = `local ${hotGuardStateName}=${hotGuardSeed};local function ${hotGuardName}(proto,frame,pc,sp) ${hotGuardStateName}=(${hotGuardStateName}*${hotGuardMul}+pc*${hotGuardPcMul}+sp*${hotGuardStackMul}+frame.id*11)%65521;if frame.proto~=proto or frame.state~="running" or pc<1 or sp<0 then __WSATFailStructure() end;local gate=(${hotGuardStateName}+pc*7+sp*13+frame.depth*17)%${hotGuardStride};if gate==0 then local top=__WSFrameStack[__WSFrameCount];if top~=frame or frame.depth~=__WSFrameCount then __WSATFailStructure() end end end`;
  let engine = `
${envKeyCode}
local __XM=${runtimeMaskExpr}
local function __mbaAdd(x,y)
 if type(x)=="number" and type(y)=="number" and x>=0 and y>=0 and x<=65535 and y<=65535 and x%1==0 and y%1==0 then
  local z=bit32.bxor(x,y);local c=bit32.band(x,y)
  return z+c+c
 end
 return x+y
end
local function __mbaTruthy(v) return (not not v)==true end
local __WSV
local __rootIntegrity=nil;local __integrityTick=0
-- Runtime consistency telemetry (not a cryptographic anti-tamper boundary).
-- The primary and shadow rings are kept separately so accidental single-ring
-- corruption can be detected; an attacker controlling this VM can still alter both.
local __WSIntegrityRing={0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0};local __WSIntegrityShadowRing={0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0}
-- Seed the rolling checks with the exact folds of the thirty-two zeroed slots.
-- Leaving the old 0/1 placeholders here made the very first assertion fail
-- before the VM executed its first instruction (WSF_DIAG_INTEGRITY_DATA_PATH).
local __WSIntegrityCursor=1;local __WSIntegrityFold=48880;local __WSIntegrityAlt=50789
local __WSIntegrityShadowFold=14989;local __WSIntegrityShadowAlt=36489
local __WSAT_type,__WSAT_tostring,__WSAT_error,__WSAT_pcall,__WSAT_rawequal=type,tostring,error,pcall,rawequal
local __WSAT_table=table;local __WSAT_freeze=table and table.freeze
local __WSAT_math,__WSAT_floor,__WSAT_ceil,__WSAT_abs,__WSAT_sqrt,__WSAT_min,__WSAT_max,__WSAT_string,__WSAT_byte=math,math and math.floor,math and math.ceil,math and math.abs,math and math.sqrt,math and math.min,math and math.max,string,string and string.byte
local __WSAT_bit32=__bit
local __WSAT_bxor=__bit and __bit.bxor
${failureHandlerDecl}
local function __WSMul32(a,b)
 local al=a%65536;local ah=__WSAT_floor(a/65536)%65536
 local bl=b%65536;local bh=__WSAT_floor(b/65536)%65536
 local lowProduct=al*bl
 local lo=lowProduct%65536
 local carry=__WSAT_floor(lowProduct/65536)
 local mid=(ah*bl+al*bh+carry)%65536
 return (lo+mid*65536)%4294967296
end
local __WSAT_rawget,__WSAT_rawset=rawget,rawset
local __WSAT_getmetatable,__WSAT_setmetatable=getmetatable,setmetatable
local __WSAT_coroutine=coroutine
local __WSAT_coroutineRunning=__WSAT_coroutine and __WSAT_coroutine.running
local __WSAT_coroutineCreate=__WSAT_coroutine and __WSAT_coroutine.create
local __WSAT_coroutineResume=__WSAT_coroutine and __WSAT_coroutine.resume
local __WSAT_coroutineStatus=__WSAT_coroutine and __WSAT_coroutine.status
local __WSAT_coroutineYield=__WSAT_coroutine and __WSAT_coroutine.yield
local __WSATMainThreadToken=function() end;local __WSATMainThreadTokenSeal=__WSATMainThreadToken
local __WSAT_pairs=pairs
local __WSAT_next=next
local __WSAT_task=task
local __WSAT_taskSpawn=task and task.spawn
local __WSAT_debug=debug
local __WSAT_debugPresentAtBootstrap=(debug~=nil)
local __WSAT_xpcall=xpcall
local __WSAT_getfenv,__WSAT_setfenv=getfenv,setfenv
local __WSATCoreTableRegistry={}
local __WSATCoreTableNext=0
local function __WSATRegisterCoreTable(value)
 if __WSAT_type(value)~="table" then __WSATFailIntegrity() end
 __WSATCoreTableNext=__WSATCoreTableNext+1
 __WSATCoreTableRegistry[__WSATCoreTableNext]=value
end
-- The first reflection guard can run before decoder/dispatch tables are built.
-- Register the already-created integrity rings now so the initial guard has a
-- real baseline instead of falsely rejecting a valid first invocation.
__WSATRegisterCoreTable(__WSIntegrityRing)
__WSATRegisterCoreTable(__WSIntegrityShadowRing)
local function __WSATReflectionGuard(expectedThread)
 ${antiHookGuardLua}
end
-- Capture the buffer API once. Critical decoding paths use these locals instead
-- of repeatedly resolving mutable global table fields.
local __WSAT_buffer=__buf
local __WSAT_buf_create=__buf and __buf.create
local __WSAT_buf_len=__buf and __buf.len
local __WSAT_buf_readu8=__buf and __buf.readu8
local __WSAT_buf_writeu8=__buf and __buf.writeu8
local __WSAT_buf_readu32=__buf and __buf.readu32
local __WSAT_buf_tostring=__buf and __buf.tostring
local __WSAT_buf_fill=__buf and __buf.fill
local function __WSATCheck(expectedThread)
 if __WSATReflectionGuard then __WSATReflectionGuard(expectedThread) end
 -- Check captured primitives and exercise a tiny buffer round-trip.
 -- This detects selected API breakage/replacement; it is not proof against
 -- an attacker who can rewrite this VM or its captured upvalues.
 local ok,a,b,c,d,e,f,g,h=__WSAT_pcall(function()
  local probe=__WSAT_buf_create(1)
  __WSAT_buf_writeu8(probe,0,65)
  local byteValue=__WSAT_buf_readu8(probe,0)
  local byteLength=__WSAT_buf_len(probe)
  local textValue=__WSAT_buf_tostring(probe)
  __WSAT_buf_fill(probe,0,0,1)
  local clearedValue=__WSAT_buf_readu8(probe,0)
  return __WSAT_type(1),__WSAT_tostring(1),__WSAT_floor(1.5),__WSAT_byte("A",1),__WSAT_bxor(5,3),byteValue,byteLength,textValue..":"..clearedValue
 end)
 if not ok or a~="number" or b~="1" or c~=1 or d~=65 or e~=6 or f~=65 or g~=1 or h~="A:0" then
  __WSAT_error("WSF_DIAG_RUNTIME_SANITY",0)
 end
 -- Validate the exact little-endian instruction fetch primitive before decoding bytecode.
 local u32ok,u32value=__WSAT_pcall(function()
  local probe=__WSAT_buf_create(4)
  __WSAT_buf_writeu8(probe,0,1);__WSAT_buf_writeu8(probe,1,2);__WSAT_buf_writeu8(probe,2,3);__WSAT_buf_writeu8(probe,3,4)
  local value=__WSAT_buf_readu32(probe,0)
  __WSAT_buf_fill(probe,0,0,4)
  return value,__WSAT_buf_len(probe)
 end)
 if not u32ok or u32value~=67305985 then __WSAT_error("WSF_DIAG_BUFFER_READU32",0) end
 local sentinel=${luaHiddenString("WSF_PCALL_ERROR_SENTINEL")};local threw,reason=__WSAT_pcall(function() __WSAT_error(sentinel,0) end)
 if threw or reason~=sentinel then __WSATFailIntegrity() end
 local xok,xvalue=__WSAT_xpcall(function() return 73 end,function(e) return e end)
 if not xok or xvalue~=73 then __WSATFailIntegrity() end
 -- Captured primitives remain usable if globals are replaced after bootstrap;
 -- detect replacement and fail closed rather than silently trusting the new globals.
 if type~=__WSAT_type or tostring~=__WSAT_tostring or pcall~=__WSAT_pcall or xpcall~=__WSAT_xpcall or error~=__WSAT_error or rawequal~=__WSAT_rawequal
  or getfenv~=__WSAT_getfenv or setfenv~=__WSAT_setfenv or rawget~=__WSAT_rawget or rawset~=__WSAT_rawset or getmetatable~=__WSAT_getmetatable or setmetatable~=__WSAT_setmetatable
  or (coroutine and coroutine.running)~=(__WSAT_coroutine and __WSAT_coroutine.running)
  or task~=__WSAT_task or (task and task.spawn)~=__WSAT_taskSpawn or pairs~=__WSAT_pairs or next~=__WSAT_next
  or math.floor~=__WSAT_floor or math.ceil~=__WSAT_ceil or math.abs~=__WSAT_abs or math.sqrt~=__WSAT_sqrt or math.min~=__WSAT_min or math.max~=__WSAT_max or string.byte~=__WSAT_byte
  or __buf.create~=__WSAT_buf_create or __buf.len~=__WSAT_buf_len
  or __buf.readu8~=__WSAT_buf_readu8 or __buf.readu32~=__WSAT_buf_readu32 or __buf.writeu8~=__WSAT_buf_writeu8
  or __buf.tostring~=__WSAT_buf_tostring or __buf.fill~=__WSAT_buf_fill then
  __WSAT_error("WSF_DIAG_RUNTIME_API_REPLACED",0)
 end
end
-- Integrity failures call the captured error primitive directly; no shared failure callback.
-- MV_PRECHECK: deterministic runtime sanity checks. The emitted identifier is
-- randomized per build; this checks runtime primitives and VM prototype shape,
-- not the presence of debuggers or external tools.
local ${instructionMapReaderName}_states={}
local function ${instructionMapReaderName}(proto,index)
 local blob=proto.${fields.im};local count=__WSAT_floor(#blob/4)
 if __WSAT_type(index)~="number" or index%1~=0 or index<1 or index>count then __WSATFailIntegrity() end
 local st=${instructionMapReaderName}_states[proto]
 if not st then st={next=0,total=0,state=${fields.metaReadName}(proto,4,1),prev=bit32.band(${fields.metaReadName}(proto,4,1),255),cache={},ids={}};${instructionMapReaderName}_states[proto]=st end
 local cacheSlot=((index-1)%8)+1
 if st.ids[cacheSlot]==index then return st.cache[cacheSlot] end
 if index<=st.next then st.next=0;st.total=0;st.state=${fields.metaReadName}(proto,4,1);st.prev=bit32.band(${fields.metaReadName}(proto,4,1),255);st.cache={};st.ids={} end
 while st.next<index do
  local entry=st.next+1;local delta=0
  for bi=0,3 do st.state=bit32.bxor(st.state,bit32.lshift(st.state,13));st.state=bit32.bxor(st.state,bit32.rshift(st.state,17));st.state=bit32.bxor(st.state,bit32.lshift(st.state,5));local cipher=__WSAT_byte(blob,(entry-1)*4+bi+1);local maskByte=bit32.band(bit32.rshift(st.state,bi*8),255);local plain=bit32.bxor(cipher,maskByte,st.prev);st.prev=cipher;delta=delta+plain*(256^bi) end
  st.total=st.total+delta;st.next=entry;local slot=((entry-1)%8)+1;st.cache[slot]=st.total;st.ids[slot]=entry
 end
 return st.cache[cacheSlot]
end
local function ${precheckName}(proto,frame,expectedThread)
 __WSATCheck(expectedThread)
 if __WSAT_type(proto)~="table" or __WSAT_type(proto.${fields.o})~="string" or __WSAT_type(proto.${fields.o2})~="string" or __WSAT_type(proto.${fields.k})~="table" or __WSAT_type(proto.${fields.kt})~="table" or __WSAT_type(proto.${fields.kb})~="number" or __WSAT_type(proto.${fields.im})~="string" or (#proto.${fields.im}%4)~=0 or __WSAT_type(proto.${fields.meta})~="table" or #proto.${fields.meta}~=5 or __WSAT_type(${fields.metaReadName}Group(proto,1))~="table" or #${fields.metaReadName}Group(proto,1)~=3 or __WSAT_type(${fields.metaReadName}Group(proto,2))~="table" or #${fields.metaReadName}Group(proto,2)~=6 or __WSAT_type(${fields.metaReadName}Group(proto,3))~="table" or #${fields.metaReadName}Group(proto,3)~=1 or __WSAT_type(${fields.metaReadName}Group(proto,4))~="table" or #${fields.metaReadName}Group(proto,4)~=1 or __WSAT_type(${fields.metaReadName}Group(proto,5))~="table" or #${fields.metaReadName}Group(proto,5)~=4 or __WSAT_type(proto.${fields.p})~="table" or __WSAT_type(proto.${fields.oo})~="string" then
  __WSAT_error("WSF_DIAG_PROTO_SHAPE",0)
 end
 for __mg=1,5 do local __metaGroup=${fields.metaReadName}Group(proto,__mg);for __mi=1,#__metaGroup do local __mv=__metaGroup[__mi];if __WSAT_type(__mv)~="number" or __mv%1~=0 then __WSATFailIntegrity() end end end
 local __operandMul=${fields.metaReadName}(proto,2,1);if __operandMul<1 or __operandMul>4294967295 or __operandMul%2~=1 then __WSATFailIntegrity() end
 local __treeMul=${fields.metaReadName}(proto,5,1);if __treeMul<1 or __treeMul>4294967295 or __treeMul%2~=1 then __WSAT_error("WSF_DIAG_CONSTANT_INDEX",0) end
 local __flowMod=#proto.${fields.im}/4;local __flowMul=${fields.metaReadName}(proto,5,2);local __flowAdd=${fields.metaReadName}(proto,5,3);local __flowInv=${fields.metaReadName}(proto,5,4);if __flowMod<1 or __flowMul<1 or __flowAdd<0 or __flowAdd>=__flowMod or __flowInv<1 or (__flowMod==1 and (__flowMul~=1 or __flowInv~=1)) or (__flowMod>1 and (__flowMul>=__flowMod or __flowInv>=__flowMod or (__flowMul*__flowInv)%__flowMod~=1)) then __WSAT_error("WSF_DIAG_FLOW_STATE",0) end
 if #proto.${fields.o}~=${VM_OP_LIST.length*6} or #proto.${fields.o2}~=${VM_OP_LIST.length*6} or __WSAT_type(${fields.metaReadName}(proto,3,1))~="number" or ${fields.metaReadName}(proto,3,1)%1~=0 or ${fields.metaReadName}(proto,3,1)<0 or ${fields.metaReadName}(proto,3,1)>5 or proto.${fields.kb}<1 or proto.${fields.kb}>64 or proto.${fields.kb}%1~=0
  or __WSAT_type(proto.${fields.m})~="number" or proto.${fields.m}%1~=0 or proto.${fields.m}<2
  or __WSAT_type(proto.${fields.n})~="number" or proto.${fields.n}%1~=0 or proto.${fields.n}<0
  or __WSAT_type(proto.${fields.wp})~="string" or #proto.${fields.wp}~=18
  or __WSAT_type(proto.${fields.cp})~="string" or #proto.${fields.cp}~=7
  or #proto.${fields.oo}~=(251+${VM_OP_LIST.length}*6) then
  __WSAT_error("WSF_DIAG_PROTO_LAYOUT",0)
 end
 for __pi=1,#proto.${fields.wp} do local __pv=__WSAT_byte(proto.${fields.wp},__pi);if __WSAT_type(__pv)~="number" or __pv<1 or __pv>250 then __WSAT_error("WSF_DIAG_KEY_PROFILE",0) end end
 for __pi=1,#proto.${fields.cp} do local __pv=__WSAT_byte(proto.${fields.cp},__pi);if __WSAT_type(__pv)~="number" or __pv<1 or __pv>250 then __WSAT_error("WSF_DIAG_KEY_PROFILE",0) end end
 local __operandRowCount=${VM_OP_LIST.length};local __operandSeen={}
 for __slot=1,250 do local __row=__WSAT_byte(proto.${fields.oo},__slot+1);if __row<0 or __row>__operandRowCount then __WSAT_error("WSF_DIAG_OPERAND_MAP",0) end;if __row>0 then if __operandSeen[__row] then __WSAT_error("WSF_DIAG_OPERAND_MAP",0) end;__operandSeen[__row]=true end end
 for __row=1,__operandRowCount do if not __operandSeen[__row] then __WSAT_error("WSF_DIAG_OPERAND_MAP",0) end;local __base=251+(__row-1)*6+1;local __count=__WSAT_byte(proto.${fields.oo},__base);if __count>5 then __WSAT_error("WSF_DIAG_OPERAND_MAP",0) end;for __ri=1,__count do local __pos=__WSAT_byte(proto.${fields.oo},__base+__ri);if __pos<1 or __pos>5 then __WSAT_error("WSF_DIAG_OPERAND_MAP",0) end end;for __ri=__count+1,5 do if __WSAT_byte(proto.${fields.oo},__base+__ri)~=0 then __WSAT_error("WSF_DIAG_OPERAND_MAP",0) end end end
 local __seed=bit32.bxor(${fields.metaReadName}(proto,2,1),${fields.metaReadName}(proto,2,2),${fields.metaReadName}(proto,2,3),${fields.metaReadName}(proto,2,4),${fields.metaReadName}(proto,2,5),${fields.metaReadName}(proto,2,6),bit32.lshift(${fields.metaReadName}(proto,1,1),16),${fields.metaReadName}(proto,1,2),${fields.metaReadName}(proto,1,3))
 for __si=1,#proto.${fields.wp} do local __v=__WSAT_byte(proto.${fields.wp},__si);__seed=bit32.bxor(__seed,__v,bit32.lshift(__v,7),bit32.rshift(__v,3));__seed=bit32.bxor(__seed,bit32.lshift(__seed,13));__seed=bit32.bxor(__seed,bit32.rshift(__seed,17));__seed=bit32.bxor(__seed,bit32.lshift(__seed,5)) end
 for __si=1,#proto.${fields.cp} do local __v=__WSAT_byte(proto.${fields.cp},__si);__seed=bit32.bxor(__seed,__v,bit32.lshift(__v,7),bit32.rshift(__v,3));__seed=bit32.bxor(__seed,bit32.lshift(__seed,13));__seed=bit32.bxor(__seed,bit32.rshift(__seed,17));__seed=bit32.bxor(__seed,bit32.lshift(__seed,5)) end
 if __seed==0 then __seed=0x6D2B79F5 end
 local __prev=bit32.band(__seed,255);local __b0,__b1,__b2,__b3,__slot=0,0,0,0,0;local __seen={};local __record=0;local __prevCheck=bit32.band(__seed,255)
 for __oi=1,#proto.${fields.o} do __seed=bit32.bxor(__seed,bit32.lshift(__seed,13));__seed=bit32.bxor(__seed,bit32.rshift(__seed,17));__seed=bit32.bxor(__seed,bit32.lshift(__seed,5));local __cipher=bit32.bxor(__WSAT_byte(proto.${fields.o},__oi),__WSAT_byte(proto.${fields.o2},__oi));local __mask=bit32.band(bit32.rshift(__seed,((__oi-1)%4)*8),255);local __plain=bit32.bxor(__cipher,__mask,__prev);__prev=__cipher;local __col=(__oi-1)%6;if __col==0 then __b0=__plain elseif __col==1 then __b1=__plain elseif __col==2 then __b2=__plain elseif __col==3 then __b3=__plain elseif __col==4 then __slot=__plain else __record=__record+1;local __id=__b0+__b1*256+__b2*65536+__b3*16777216;local __want=(__b0*3+__b1*5+__b2*7+__b3*11+__slot*13+__record*17+__prevCheck*19)%256;if __plain~=__want or __id<1 or __id>4294967295 or __slot<1 or __slot>250 or __seen[__id] then __WSAT_error("WSF_DIAG_OPCODE_MAP",0) end;__seen[__id]=true;__prevCheck=__plain end end
 local __constCount=#proto.${fields.k};local __expectedBuckets=math.ceil(__constCount/proto.${fields.kb})
 if #proto.${fields.kt}~=(__expectedBuckets) then __WSAT_error("WSF_DIAG_CONSTANT_INDEX",0) end
 local __constSeen={}
 local __treeSeed=bit32.bxor(${fields.metaReadName}(proto,2,6),${fields.metaReadName}(proto,2,1),bit32.lshift(${fields.metaReadName}(proto,2,2),1),bit32.rshift(${fields.metaReadName}(proto,2,3),1),bit32.lshift(${fields.metaReadName}(proto,2,4),2),${fields.metaReadName}(proto,2,5))
 for __bi=1,#proto.${fields.kt} do local __row=proto.${fields.kt}[__bi];local __want=math.min(proto.${fields.kb},__constCount-(__bi-1)*proto.${fields.kb});if __WSAT_type(__row)~="table" or #__row~=__want then __WSAT_error("WSF_DIAG_CONSTANT_INDEX",0) end;for __ci=1,#__row do local __logical=(__bi-1)*proto.${fields.kb}+__ci;local __mask=bit32.bxor(__treeSeed,__WSMul32(__logical,__treeMul));local __physical=bit32.bxor(__row[__ci],__mask);if __WSAT_type(__physical)~="number" or __physical%1~=0 or __physical<0 or __physical>=__constCount or __constSeen[__physical] then __WSAT_error("WSF_DIAG_CONSTANT_INDEX",0) end;__constSeen[__physical]=true end end
 local __byteCount=__WSAT_buf_len(proto.${fields.c});local __mapCount=#proto.${fields.im}/4;local __wordCount=__byteCount/4;if __byteCount%4~=0 or (#proto.${fields.im}%4)~=0 or __mapCount<1 or __mapCount>__wordCount then __WSAT_error("WSF_DIAG_BYTECODE_LENGTH",0) end;local __lastOffset=0
 for __mi=1,(#proto.${fields.im}/4) do local __offset=${instructionMapReaderName}(proto,__mi);if __WSAT_type(__offset)~="number" or __offset%1~=0 or __offset<=__lastOffset or __offset<1 or __offset>__byteCount/4 then __WSAT_error("WSF_DIAG_INSTRUCTION_MAP",0) end;__lastOffset=__offset end
 if frame and (frame.proto~=proto or frame.state~="running" or frame.depth<1) then
  __WSAT_error("WSF_DIAG_FRAME_STATE",0)
 end
end
local __WSFrameStack,__WSCallStack={},{};local __WSFrameCount,__WSCallCount,__WSGlobalSteps=0,0,0
local function __WSRuntimeErrorHandler(err)
 local message=__WSAT_tostring(err)
 local dbg=debug
 if __WSAT_type(dbg)=="table" then
  local trace=dbg.traceback
  if __WSAT_type(trace)=="function" then
   local ok,value=__WSAT_pcall(trace,message,2)
   if ok and __WSAT_type(value)=="string" then message=value end
  end
 end
 ${vmDebug ? `local active=__WSFrameStack[__WSFrameCount];if __WSAT_type(active)=="table" and __WSAT_type(active.pc)=="number" then message=message.." [WSF_VM_PC="..__WSAT_tostring(active.pc)..", depth="..__WSAT_tostring(__WSFrameCount).."]" end` : ""}
 return message
end
local __WSClosureMeta=setmetatable({},{__mode="k"})
local function __WSUVCell(reg,encoded,key)
 return {
  get=function() local idx=bit32.bxor(encoded,key); local value=reg[idx]; idx=nil; return value end,
  set=function(value) local idx=bit32.bxor(encoded,key); reg[idx]=value; idx=nil; value=nil end
 }
end
local __WSPendingCall,__WSCurrentEntry=nil,nil
local __WSDirectCallProto=nil
local __WSFrameSerial=0
local __WSSchedulerActive=false
local __WSDirectCallDepth=0
local __WSCallRequest={}
local function __WSCleanupExecutionState()
 __WSSchedulerActive=false;__WSDirectCallProto=nil;__WSPendingCall=nil;__WSCurrentEntry=nil;__WSDirectCallDepth=0
 for i=__WSCallCount,1,-1 do
  local call=__WSCallStack[i]
  if __WSAT_type(call)=="table" then call.state="aborted";call.args=nil end
  __WSCallStack[i]=nil
 end
 for i=__WSFrameCount,1,-1 do
  local frame=__WSFrameStack[i]
  if __WSAT_type(frame)=="table" then frame.state="aborted";frame.args=nil;frame.returnValues=nil end
  __WSFrameStack[i]=nil
 end
 __WSCallCount=0;__WSFrameCount=0;__WSGlobalSteps=0
end
local function __WSRollbackDirectFailure(frameBase,callBase,failedCall,priorEntry)
 for i=__WSCallCount,callBase+1,-1 do
  local call=__WSCallStack[i]
  if __WSAT_type(call)=="table" then call.state="aborted";call.args=nil end
  __WSCallStack[i]=nil
 end
 for i=__WSFrameCount,frameBase+1,-1 do
  local frame=__WSFrameStack[i]
  if __WSAT_type(frame)=="table" then frame.state="aborted";frame.args=nil;frame.returnValues=nil end
  __WSFrameStack[i]=nil
 end
 local targetCallCount=callBase
 if failedCall and targetCallCount>0 and __WSCallStack[targetCallCount]==failedCall then
  failedCall.state="aborted";failedCall.args=nil;__WSCallStack[targetCallCount]=nil;targetCallCount=targetCallCount-1
 end
 __WSCallCount=targetCallCount;__WSFrameCount=frameBase
 __WSPendingCall=nil;__WSDirectCallProto=nil;__WSCurrentEntry=priorEntry
end
local function __WSFrameStackValid(expected,owner)
 local n=__WSFrameCount
 local parentId=0
 local previousId=0
 local keyCount=0
 if expected and (expected.depth~=n or __WSFrameStack[n]~=expected) then return false end
 for key in __WSAT_next,__WSFrameStack do
  if __WSAT_type(key)~="number" or key%1~=0 or key<1 or key>n then return false end
  keyCount=keyCount+1
 end
 if keyCount~=n then return false end
 for i=1,n do
  local frame=__WSFrameStack[i]
  if __WSAT_type(frame)~="table" or frame.depth~=i
   or __WSAT_type(frame.id)~="number" or frame.id%1~=0 or frame.id<=previousId
   or frame.parentId~=parentId
   or __WSAT_type(frame.transition)~="number" or frame.transition%1~=0 or frame.transition<1
   or (frame.state~="running" and frame.state~="return")
   or frame.owner==nil then return false end
  previousId=frame.id;parentId=frame.id
 end
 if expected and owner and expected.owner~=owner then return false end
 return true
end
local function __WSCallStackValid()
 local n=__WSCallCount
 if __WSAT_type(n)~="number" or n%1~=0 or n<0 or n>__WSFrameCount then return false end
 local keyCount=0
 for key in __WSAT_next,__WSCallStack do
  if __WSAT_type(key)~="number" or key%1~=0 or key<1 or key>n then return false end
  keyCount=keyCount+1
 end
 if keyCount~=n then return false end
 for i=1,n do
  local call=__WSCallStack[i]
  if __WSAT_type(call)~="table" or call.state~="calling"
   or __WSAT_type(call.callerProto)~="table"
   or __WSAT_type(call.returnPC)~="number" or call.returnPC%1~=0 or call.returnPC<0
   or __WSAT_type(call.dest)~="number" or call.dest%1~=0 or call.dest<0
   or __WSAT_type(call.expectedResults)~="number" or call.expectedResults%1~=0 or call.expectedResults<0
   or __WSAT_type(call.argCount)~="number" or call.argCount%1~=0 or call.argCount<0
   or __WSAT_type(call.args)~="table" then return false end
 end
 return true
end
local function __WSN(P,U,...)
 local frameBase,callBase=__WSFrameCount,__WSCallCount
 local priorEntry=__WSCurrentEntry
 local call=__WSPendingCall;__WSPendingCall=nil
 local packed=table.pack(...)
 local frame={proto=P,upvalues=U,args=packed,depth=__WSFrameCount+1,returnAddress=call and call.returnPC or 0,returnDest=call and call.dest or 0,callState="enter",callSite=call,transition=1}
 if __WSSchedulerActive and call and __WSDirectCallProto==P then
  __WSDirectCallProto=nil
  return __WSAT_coroutineYield({tag=__WSCallRequest,frame=frame})
 end
 local outerDirect=(not __WSSchedulerActive and __WSDirectCallDepth==0)
 if outerDirect then __WSGlobalSteps=0 end
 __WSDirectCallDepth=__WSDirectCallDepth+1
 __WSCurrentEntry=frame
 local result=table.pack(__WSAT_xpcall(function()
  return __WSV(frame.proto,frame.upvalues,table.unpack(frame.args,1,frame.args.n))
 end,__WSRuntimeErrorHandler))
 __WSDirectCallDepth=math.max(0,__WSDirectCallDepth-1)
 __WSCurrentEntry=priorEntry
 if not result[1] then
  if __WSSchedulerActive then
   -- The scheduler owns cleanup for coroutine-backed execution.
   error(result[2],0)
  elseif outerDirect then
   __WSCleanupExecutionState()
  else
   -- Roll back only the failed nested invocation and preserve the caller budget.
   __WSRollbackDirectFailure(frameBase,callBase,call,priorEntry)
  end
  error(result[2],0)
 end
 local out={n=result.n-1}
 for i=2,result.n do out[i-1]=result[i] end
 frame.transition=frame.transition+1;frame.callState="returned";frame.returnCount=out.n;frame.args=nil
 return table.unpack(out,1,out.n)
end
__WSV=function(P,__uv,...)
local __entryMeta=__WSCurrentEntry;__WSCurrentEntry=nil
__WSFrameSerial=__WSFrameSerial+1
local __parentFrame=__WSFrameStack[__WSFrameCount]
local __frameRecord={id=__WSFrameSerial,proto=P,pc=1,state="running",returnAddress=__entryMeta and __entryMeta.returnAddress or 0,returnDest=__entryMeta and __entryMeta.returnDest or 0,depth=__WSFrameCount+1,parentId=__parentFrame and __parentFrame.id or 0,transition=__entryMeta and __entryMeta.transition or 1}
if __frameRecord.depth>${maxCallDepth} then __WSAT_error("WSF_VM_CALL_DEPTH_LIMIT",0) end
local __frameCoroutine=__WSAT_coroutineRunning and __WSAT_coroutineRunning() or __WSATMainThreadToken
if __frameCoroutine==nil then __WSATFailIntegrity() end
__frameRecord.owner=__frameCoroutine
__WSFrameCount=__WSFrameCount+1;__WSFrameStack[__WSFrameCount]=__frameRecord
local function __WSIntegrityAssert()
 if __WSAT_type(__WSIntegrityRing)~="table" or __WSAT_type(__WSIntegrityShadowRing)~="table"
  or __WSAT_type(__WSIntegrityCursor)~="number" or __WSIntegrityCursor%1~=0
  or __WSIntegrityCursor<1 or __WSIntegrityCursor>32
  or __WSAT_type(__WSIntegrityFold)~="number" or __WSAT_type(__WSIntegrityAlt)~="number"
  or __WSAT_type(__WSIntegrityShadowFold)~="number" or __WSAT_type(__WSIntegrityShadowAlt)~="number"
  or __WSIntegrityFold%1~=0 or __WSIntegrityAlt%1~=0
  or __WSIntegrityShadowFold%1~=0 or __WSIntegrityShadowAlt%1~=0 then
  ${integrityPolicy === "strict" ? '__WSATFailIntegrity()' : `__WSAT_error(${luaHiddenString("WSF_DIAG_INTEGRITY_STATE")},0)`}
 end
 local f,a,s,t=0,1,0,1
 for i=1,32 do
  local x,y=__WSIntegrityRing[i],__WSIntegrityShadowRing[i]
  if __WSAT_type(x)~="number" or __WSAT_type(y)~="number" or x%1~=0 or y%1~=0
   or x<0 or x>=65521 or y<0 or y>=65521 then
   ${integrityPolicy === "strict" ? '__WSATFailIntegrity()' : `__WSAT_error(${luaHiddenString("WSF_DIAG_INTEGRITY_SLOT")},0)`}
  end
  f=(f*31+x+i*7)%65521
  a=(a*17+__WSIntegrityRing[33-i]+i*13)%65521
  s=(s*37+y+i*19)%65521
  t=(t*23+__WSIntegrityShadowRing[33-i]+i*31)%65521
 end
 if f~=__WSIntegrityFold or a~=__WSIntegrityAlt or s~=__WSIntegrityShadowFold or t~=__WSIntegrityShadowAlt then
  ${integrityPolicy === "strict" ? '__WSATFailIntegrity()' : `__WSAT_error(${luaHiddenString("WSF_DIAG_INTEGRITY_DATA_PATH")},0)`}
 end
end
local __vmGuardEpoch=0;local __vmGuardNext=5+(${fields.metaReadName}(P,3,1)%9);local __vmGuardState=${fields.metaReadName}(P,2,6)%65521
local function __WSVMGuard(opcode,position,stackDepth)
 __vmGuardEpoch=__vmGuardEpoch+1;__vmGuardState=(__vmGuardState*37+(opcode or 0)*17+(position or 0)*13+(stackDepth or 0)*7+__vmGuardEpoch)%65521
 local lane=(__vmGuardState+__vmGuardEpoch+(opcode or 0))%5
 ${integrityFn ? `
 if __vmGuardEpoch>=__vmGuardNext then __WSIntegrityAssert();__vmGuardNext=__vmGuardEpoch+7+(__vmGuardState%17)
 elseif lane==0 then __WSIntegrityAssert()
 elseif lane==1 then __WSATCheck(__frameCoroutine)
 elseif lane==2 then if not __WSFrameStackValid(__frameRecord,__frameCoroutine) or not __WSCallStackValid() or __frameRecord.proto~=P then __WSATFailStructure() end
 elseif lane==3 then if not __WSFrameStackValid(__frameRecord,__frameCoroutine) or not __WSCallStackValid() then __WSATFailStructure() end
 elseif __WSAT_type(__vmGuardState)~="number" or __vmGuardState<0 or __vmGuardState>=65521 then __WSATFailIntegrity() end
 ` : `
 if lane==2 then
  if not __WSFrameStackValid(__frameRecord,__frameCoroutine) or not __WSCallStackValid() or __frameRecord.proto~=P then __WSATFailStructure() end
 elseif lane==3 then
  if not __WSFrameStackValid(__frameRecord,__frameCoroutine) or not __WSCallStackValid() then __WSATFailStructure() end
 elseif __WSAT_type(__vmGuardState)~="number" or __vmGuardState<0 or __vmGuardState>=65521 then
  __WSATFailStructure()
 end
 `}
end
if not __rootIntegrity then __rootIntegrity=P end
${integrityFn ? `${precheckName}(P,__frameRecord,__frameCoroutine);if not __WSFrameStackValid(__frameRecord,__frameCoroutine) or not __WSCallStackValid() or __frameRecord.proto~=P then error("WSF_DIAG_FRAME_STACK_ENTRY",0) end` : ""}
local __opMul=${fields.metaReadName}(P,2,1);local __opAdd=${fields.metaReadName}(P,2,2);local __opXor=${fields.metaReadName}(P,2,3);if __opMul<1 or __opMul>4294967295 or __opMul%2~=1 then __WSATFailStructure() end;local __opInv=__opMul;for __opRound=1,5 do __opInv=__WSMul32(__opInv,(2-__WSMul32(__opMul,__opInv))%4294967296) end;local __regBase=1+(__opXor%65521);local R={};local U,pc,g,done,res,__pcToken=__uv or {},0,__vmenv,false,{},0
local S,sp,__fsp={},0,0;local __stackSalt=${(secureKeyFloat()*65520|0)}
local function __push(v) sp=sp+1;__fsp=(sp*37+__stackSalt)%65521;S[sp]={value=v,tag=bit32.bxor(sp,__stackSalt)} end
local function __pop() local cell=S[sp];S[sp]=nil;sp=sp-1;__fsp=(sp*37+__stackSalt)%65521;return cell and cell.value end
local args={...}
local __NP=P.${fields.n}
local __top=__regBase+__NP
for i=1,__NP do R[__regBase+i-1]=args[i] end
local ${decodedCacheName},${decodedCacheIndexName}={},{}
local ${nextWordName}=0
local ${previousWordName}=${fields.metaReadName}(P,2,6) or 0
local ${decodedCacheName}ount=__WSAT_floor(__WSAT_buf_len(P.${fields.c})/4)
local __wordProfile=P.${fields.wp};local __constProfile=P.${fields.cp}
local function ${chainKeyName}(i,previous,seed)
 local p0=bit32.band(previous,255);local p1=bit32.band(bit32.rshift(previous,8),255);local p2=bit32.band(bit32.rshift(previous,16),255);local p3=bit32.band(bit32.rshift(previous,24),255)
 local k0=(${maskExpr}+i*__WSAT_byte(__wordProfile,8)+(i*i*__WSAT_byte(__wordProfile,9))%256+seed*__WSAT_byte(__wordProfile,10)+p0*__WSAT_byte(__wordProfile,11)+p1*__WSAT_byte(__wordProfile,12)+p2*__WSAT_byte(__wordProfile,13)+p3*__WSAT_byte(__wordProfile,14)+1*__WSAT_byte(__wordProfile,15)+(i%__WSAT_byte(__wordProfile,16))*__WSAT_byte(__wordProfile,17)+((bit32.bxor(p1,p3)*__WSAT_byte(__wordProfile,18))%256))%256
 local k1=(${maskExpr}+i*__WSAT_byte(__wordProfile,8)+(i*i*__WSAT_byte(__wordProfile,9))%256+seed*__WSAT_byte(__wordProfile,10)+p0*__WSAT_byte(__wordProfile,11)+p1*__WSAT_byte(__wordProfile,12)+p2*__WSAT_byte(__wordProfile,13)+p3*__WSAT_byte(__wordProfile,14)+2*__WSAT_byte(__wordProfile,15)+(i%__WSAT_byte(__wordProfile,16))*__WSAT_byte(__wordProfile,17)+((bit32.bxor(p2,p0)*__WSAT_byte(__wordProfile,18))%256))%256
 local k2=(${maskExpr}+i*__WSAT_byte(__wordProfile,8)+(i*i*__WSAT_byte(__wordProfile,9))%256+seed*__WSAT_byte(__wordProfile,10)+p0*__WSAT_byte(__wordProfile,11)+p1*__WSAT_byte(__wordProfile,12)+p2*__WSAT_byte(__wordProfile,13)+p3*__WSAT_byte(__wordProfile,14)+3*__WSAT_byte(__wordProfile,15)+(i%__WSAT_byte(__wordProfile,16))*__WSAT_byte(__wordProfile,17)+((bit32.bxor(p3,p1)*__WSAT_byte(__wordProfile,18))%256))%256
 local k3=(${maskExpr}+i*__WSAT_byte(__wordProfile,8)+(i*i*__WSAT_byte(__wordProfile,9))%256+seed*__WSAT_byte(__wordProfile,10)+p0*__WSAT_byte(__wordProfile,11)+p1*__WSAT_byte(__wordProfile,12)+p2*__WSAT_byte(__wordProfile,13)+p3*__WSAT_byte(__wordProfile,14)+4*__WSAT_byte(__wordProfile,15)+(i%__WSAT_byte(__wordProfile,16))*__WSAT_byte(__wordProfile,17)+((bit32.bxor(p0,p2)*__WSAT_byte(__wordProfile,18))%256))%256
 return bit32.bor(k0,bit32.lshift(k1,8),bit32.lshift(k2,16),bit32.lshift(k3,24))
end
local function D(i)
 if __WSAT_type(i)~="number" or i%1~=0 or i<1 or i>${decodedCacheName}ount then __WSAT_error("Invalid bytecode word index",0) end
 local __cacheSlot=((i-1)%8)+1
 if ${decodedCacheIndexName}[__cacheSlot]==i then return ${decodedCacheName}[__cacheSlot] end
 if i<=${nextWordName} then
  for __ci=1,8 do ${decodedCacheName}[__ci]=nil;${decodedCacheIndexName}[__ci]=nil end
  ${nextWordName}=0;${previousWordName}=${fields.metaReadName}(P,2,6) or 0
 end
 while ${nextWordName}<i do
  local j=${nextWordName}+1
  local raw=__WSAT_buf_readu32(P.${fields.c},(j-1)*4)
  if P.${fields.v}==1 then raw=__WSAT_bxor(raw,${nestedPayloadMask}) end
  local ${chainValueName}=${chainKeyName}(j,${previousWordName},${fields.metaReadName}(P,2,6) or 0)
  local q=(__XM+j*__WSAT_byte(__wordProfile,1)+(j*j*__WSAT_byte(__wordProfile,2))%256+(__WSAT_floor(j/__WSAT_byte(__wordProfile,4))*__WSAT_byte(__wordProfile,3))%256+(j%__WSAT_byte(__wordProfile,5))*__WSAT_byte(__wordProfile,6)+((__WSAT_bxor(j,bit32.rshift(j,2))*__WSAT_byte(__wordProfile,7))%256)+((__WSAT_bxor(${previousWordName},bit32.rshift(${previousWordName},13))*__WSAT_byte(__wordProfile,18))%256))%256
  local x=__WSAT_bxor(__WSAT_bxor(raw,${chainValueName}),q)
  local decoded=x;if decoded>2147483647 then decoded=decoded-4294967296 end
  local __slot=((j-1)%8)+1;${decodedCacheName}[__slot]=decoded;${decodedCacheIndexName}[__slot]=j;${previousWordName}=decoded;${nextWordName}=j
 end
 __cacheSlot=((i-1)%8)+1
 if ${decodedCacheIndexName}[__cacheSlot]~=i then __WSAT_error("WSF_DIAG_WORD_CACHE",0) end
 return ${decodedCacheName}[__cacheSlot]
end
${constDecoderBlock}
${constAccessRuntime}
local H={{},{},{},{},{}};local IH={{},{},{},{},{}}
H[0]=function()done=true end
H[1]=function(a,b)for i=a,b do R[i]=nil end end
H[2]=function(a,b)R[a]=(b~=0)end
H[3]=function(a,b,c,bx)R[a]=${constResolveInline("bx")}end
H[4]=function(a,b)R[a]=R[b]end
H[5]=function(a,b,c,bx)R[a]=g[${constResolveInline("bx")}]end
H[6]=function(a,b,c,bx)g[${constResolveInline("bx")}]=R[a]end
H[7]=function(a,b)local u=U[b+1];if u and u.get then R[a]=u.get() end end
H[8]=function(a,b)local u=U[b+1];if u and u.set then u.set(R[a]) end end
H[9]=function(a)R[a]={}end
H[10]=function(a,b,c) local t=R[b];local k=(c>=100000 and ${constResolveInline("c-100000")}or R[c]);R[a]=t[k] end
H[11]=function(a,b,c) local t=R[a];local k=(b>=100000 and ${constResolveInline("b-100000")}or R[b]);t[k]=R[c] end
H[12]=function(a,b,c)
local fn=R[a]
if fn==nil then error("WSF_DIAG_NIL_CALL: pc="..tostring(pc)..", reg="..tostring(a),0) end
if type(fn)~="function" then error("WSF_DIAG_REGISTER_NOT_CALLABLE: pc="..tostring(pc)..", reg="..tostring(a)..", type="..type(fn),0) end
local meta=__WSClosureMeta[fn]
local n=(b==0 and (__top-a-1) or b-1)
if n<0 then n=0 end
local ar=table.create(n)
for i=1,n do ar[i]=R[a+i] end
local callRec=nil
if meta then
 callRec={callerProto=P,returnPC=pc,dest=a,expectedResults=c,argCount=n,state="calling",args={}}
 for ci=1,n do callRec.args[ci]=ar[ci] end
 __WSCallCount=__WSCallCount+1;__WSCallStack[__WSCallCount]=callRec
 __WSPendingCall=callRec
end
if meta then __WSDirectCallProto=meta.proto end
local ret;if meta and __WSSchedulerActive then ret=table.pack(__WSAT_coroutineYield({tag=__WSCallRequest,frame={proto=meta.proto,upvalues=meta.upvalues,args=table.pack(table.unpack(ar,1,n)),returnPC=pc,dest=a,expectedResults=c}})) else ret=table.pack(fn(table.unpack(ar,1,n))) end
__WSDirectCallProto=nil
if callRec then
 callRec.state="returned";callRec.returnCount=ret.n
 for ci=1,(callRec.argCount or 0) do callRec.args[ci]=nil end
 callRec.args=nil
 __WSCallStack[__WSCallCount]=nil;__WSCallCount=__WSCallCount-1
end
for i=1,n do ar[i]=nil end
ar=nil
local want=(c==0 and ret.n or c-1)
if want<0 then want=0 end
for i=1,want do R[a+i-1]=ret[i] end
for i=want+1,math.max(n,1) do if i>1 then R[a+i-1]=nil end end
__top=a+want
end
H[13]=function(a,b)
local n=(b==0 and (__top-a) or b-1);if n<0 then n=0 end
res={};for i=1,n do res[i]=R[a+i-1] end;res.n=n
__frameRecord.state="return";__frameRecord.returnValues=res;__frameRecord.returnCount=n
done=true
end
H[14]=function(a,b)
local n=(b==0 and (#args-__NP) or b-1);if n<0 then n=0 end
for i=1,n do R[a+i-1]=args[__NP+i] end
__top=a+n
end
H[15]=function(a,b,c,bx)
local child=P.${fields.p}[bx+1];local cuv=child.${fields.u};local up={}
for i=1,#cuv do local e=cuv[i];if e[1]==1 then local ri=e[2]+__regBase;local uk=(__stackSalt+pc*37+ri*13)%65521;up[i]=__WSUVCell(R,bit32.bxor(ri,uk),uk)else up[i]=U[e[2]+1] end end
local closure=function(...)return __WSN(child,up,...)end
__WSClosureMeta[closure]={proto=child,upvalues=up}
R[a]=closure
end
H[16]=function(a,b,c,bx,sbx)pc=pc+sbx end
H[17]=function(a,b,c,bx,sbx)pc=pc+(__mbaTruthy(R[a]) and sbx or 0)end
H[18]=function(a,b,c,bx,sbx)pc=pc+((not __mbaTruthy(R[a])) and sbx or 0)end
H[19]=function(a,b)R[a]=-R[b]end
H[20]=function(a,b)R[a]=not R[b]end
H[21]=function(a,b)R[a]=#R[b]end
H[22]=function(a,b,c)R[a]=__mbaAdd(R[b],R[c])end
H[23]=function(a,b,c)R[a]=R[b]-R[c]end
H[24]=function(a,b,c)R[a]=R[b]*R[c]end
H[25]=function(a,b,c)R[a]=R[b]/R[c]end
H[26]=function(a,b,c)R[a]=R[b]%R[c]end
H[27]=function(a,b,c)R[a]=R[b]^R[c]end
H[28]=function(a,b,c)R[a]=__idiv(R[b],R[c])end
H[29]=function(a,b,c)R[a]=tostring(R[b])..tostring(R[c])end
H[30]=function(a,b,c,bx,sbx)R[a]=R[a]-R[a+2];pc=pc+sbx end
H[31]=function(a,b,c,bx,sbx)R[a]=R[a]+R[a+2];local lim=R[a+1];local st=R[a+2];if(st>0 and R[a]<=lim)or(st<=0 and R[a]>=lim)then R[a+3]=R[a];pc=pc+sbx end end
H[32]=function(a,b,c) local f=R[a];if f==nil then error("WSF_DIAG_NIL_ITERATOR: pc="..tostring(pc)..", reg="..tostring(a),0) end;if type(f)~="function" then error("WSF_DIAG_INVALID_ITERATOR: pc="..tostring(pc)..", reg="..tostring(a)..", type="..type(f),0) end;local r=table.pack(f(R[a+1],R[a+2]));for i=1,c do R[a+2+i]=r[i] end if R[a+3]~=nil then R[a+2]=R[a+3] end end
H[33]=function(a,b,c)R[a]=R[b]==R[c]end
H[34]=function(a,b,c)R[a]=R[b]~=R[c]end
H[35]=function(a,b,c)R[a]=R[b]<R[c]end
H[36]=function(a,b,c)R[a]=R[b]<=R[c]end
H[37]=function(a,b,c)R[a]=R[b]>R[c]end
H[38]=function(a,b,c)R[a]=R[b]>=R[c]end
H[39]=function(a,b,c)R[a]=bit32.bor(R[b],R[c])end
H[40]=function(a,b,c)R[a]=bit32.band(R[b],R[c])end
H[41]=function(a,b,c)R[a]=__mbaAdd(R[b],R[c])end
H[42]=function(a,b,c)R[a]=R[b]-R[c]end
H[43]=function(a,b,c)R[a]=R[b]*R[c]end
H[44]=function(a,b,c)R[a]=R[b]/R[c]end
H[45]=function(a,b,c,bx) local x=R[b];local lo=R[c];local hi=R[bx]; if type(x)~="number" or type(lo)~="number" or type(hi)~="number" then error(${luaHiddenString("MATHCLAMP expects numeric operands")},0) end; if x<lo then x=lo elseif x>hi then x=hi end; R[a]=x end
H[46]=function(a,b) if type(R[b])~="number" then error(${luaHiddenString("MATHFLOOR expects number")},0) end R[a]=math.floor(R[b]) end
H[47]=function(a,b) if type(R[b])~="number" then error(${luaHiddenString("MATHCEIL expects number")},0) end R[a]=math.ceil(R[b]) end
H[48]=function(a,b) if type(R[b])~="number" then error(${luaHiddenString("MATHABS expects number")},0) end R[a]=math.abs(R[b]) end
H[49]=function(a,b) if type(R[b])~="number" then error(${luaHiddenString("MATHSQRT expects number")},0) end R[a]=math.sqrt(R[b]) end
H[50]=function(a,b,c) if type(R[b])~="number" or type(R[c])~="number" then error(${luaHiddenString("MATHMIN expects numbers")},0) end R[a]=math.min(R[b],R[c]) end
H[51]=function(a,b,c) if type(R[b])~="number" or type(R[c])~="number" then error(${luaHiddenString("MATHMAX expects numbers")},0) end R[a]=math.max(R[b],R[c]) end
H[52]=function(a,b,c,bx) local t=R[a];local k=R[b];local old=t[k];local rhs=(c==bx and old or R[c]);t[k]=old+rhs end
H[53]=function(a,b,c) R[a]=bit32.bxor(R[b],R[c]) end
H[54]=function(a,b,c) R[a]=bit32.lshift(R[b],R[c]) end
H[55]=function(a,b,c) R[a]=bit32.rshift(R[b],R[c]) end
H[56]=function(a,b) R[a]=bit32.bnot(R[b]) end
H[57]=function(a,b,c,bx)
local globalName=${constResolveInline("bx")};R[a]=g[globalName]
local fn=R[a]
if fn==nil then error("WSF_DIAG_MISSING_GLOBAL_CALL: "..tostring(globalName),0) end
if type(fn)~="function" then error("WSF_DIAG_GLOBAL_NOT_CALLABLE: "..tostring(globalName)..", type="..type(fn),0) end
local meta=__WSClosureMeta[fn]
local n=(b==0 and (__top-a-1) or b-1)
if n<0 then n=0 end
local ar=table.create(n)
for i=1,n do ar[i]=R[a+i] end
local callRec=nil
if meta then
 callRec={callerProto=P,returnPC=pc,dest=a,expectedResults=c,argCount=n,state="calling",args={}}
 for ci=1,n do callRec.args[ci]=ar[ci] end
 __WSCallCount=__WSCallCount+1;__WSCallStack[__WSCallCount]=callRec
 __WSPendingCall=callRec
end
if meta then __WSDirectCallProto=meta.proto end
local ret;if meta and __WSSchedulerActive then ret=table.pack(__WSAT_coroutineYield({tag=__WSCallRequest,frame={proto=meta.proto,upvalues=meta.upvalues,args=table.pack(table.unpack(ar,1,n)),returnPC=pc,dest=a,expectedResults=c}})) else ret=table.pack(fn(table.unpack(ar,1,n))) end
__WSDirectCallProto=nil
if callRec then
 callRec.state="returned";callRec.returnCount=ret.n
 for ci=1,(callRec.argCount or 0) do callRec.args[ci]=nil end
 callRec.args=nil
 __WSCallStack[__WSCallCount]=nil;__WSCallCount=__WSCallCount-1
end
for i=1,n do ar[i]=nil end
ar=nil
local want=(c==0 and ret.n or c-1)
if want<0 then want=0 end
for i=1,want do R[a+i-1]=ret[i] end
for i=want+1,math.max(n,1) do if i>1 then R[a+i-1]=nil end end
__top=a+want
end
H[58]=function(a,b,c,bx,sbx)
local globalName=${constResolveInline("bx")};local memberName=${constResolveInline("sbx")}
local obj=g[globalName]
if obj==nil then error("WSF_DIAG_MISSING_GLOBAL_MEMBER: "..tostring(globalName).."."..tostring(memberName).." (global missing)",0) end
local fn=obj[memberName]
if fn==nil then error("WSF_DIAG_MISSING_GLOBAL_MEMBER: "..tostring(globalName).."."..tostring(memberName),0) end
if type(fn)~="function" then error("WSF_DIAG_MEMBER_NOT_CALLABLE: "..tostring(globalName).."."..tostring(memberName)..", type="..type(fn),0) end
R[a]=fn
local meta=__WSClosureMeta[fn]
local n=(b==0 and (__top-a-1) or b-1)
if n<0 then n=0 end
local ar=table.create(n)
for i=1,n do ar[i]=R[a+i] end
local callRec=nil
if meta then
 callRec={callerProto=P,returnPC=pc,dest=a,expectedResults=c,argCount=n,state="calling",args={}}
 for ci=1,n do callRec.args[ci]=ar[ci] end
 __WSCallCount=__WSCallCount+1;__WSCallStack[__WSCallCount]=callRec
 __WSPendingCall=callRec
end
if meta then __WSDirectCallProto=meta.proto end
local ret=table.pack(fn(table.unpack(ar,1,n)))
__WSDirectCallProto=nil
if callRec then
 callRec.state="returned";callRec.returnCount=ret.n
 for ci=1,(callRec.argCount or 0) do callRec.args[ci]=nil end
 callRec.args=nil
 __WSCallStack[__WSCallCount]=nil;__WSCallCount=__WSCallCount-1
end
for i=1,n do ar[i]=nil end
ar=nil
local want=(c==0 and ret.n or c-1)
if want<0 then want=0 end
for i=1,want do R[a+i-1]=ret[i] end
for i=want+1,math.max(n,1) do if i>1 then R[a+i-1]=nil end end
__top=a+want
end
H[59]=function(a,b,c,bx,sbx)
 local globalName=${constResolveInline("bx")};local memberName=${constResolveInline("sbx")}
 local obj=g[globalName]
 if obj==nil then error("WSF_DIAG_MISSING_GLOBAL_MEMBER: "..tostring(globalName).."."..tostring(memberName).." (global missing)",0) end
 R[a]=obj[memberName]
end
H[60]=function(a)R[a]=((pc*37+sp*19+__fsp*13+__stackSalt+__frameRecord.id*7+__pcToken*29)%2==0)end
H[61]=function() end
local __opcodeSeed=bit32.bxor(${fields.metaReadName}(P,2,1),${fields.metaReadName}(P,2,2),${fields.metaReadName}(P,2,3),${fields.metaReadName}(P,2,4),${fields.metaReadName}(P,2,5),${fields.metaReadName}(P,2,6),bit32.lshift(${fields.metaReadName}(P,1,1),16),${fields.metaReadName}(P,1,2),${fields.metaReadName}(P,1,3))
for __si=1,#P.${fields.wp} do local __v=__WSAT_byte(P.${fields.wp},__si);__opcodeSeed=bit32.bxor(__opcodeSeed,__v,bit32.lshift(__v,7),bit32.rshift(__v,3));__opcodeSeed=bit32.bxor(__opcodeSeed,bit32.lshift(__opcodeSeed,13));__opcodeSeed=bit32.bxor(__opcodeSeed,bit32.rshift(__opcodeSeed,17));__opcodeSeed=bit32.bxor(__opcodeSeed,bit32.lshift(__opcodeSeed,5)) end
for __si=1,#P.${fields.cp} do local __v=__WSAT_byte(P.${fields.cp},__si);__opcodeSeed=bit32.bxor(__opcodeSeed,__v,bit32.lshift(__v,7),bit32.rshift(__v,3));__opcodeSeed=bit32.bxor(__opcodeSeed,bit32.lshift(__opcodeSeed,13));__opcodeSeed=bit32.bxor(__opcodeSeed,bit32.rshift(__opcodeSeed,17));__opcodeSeed=bit32.bxor(__opcodeSeed,bit32.lshift(__opcodeSeed,5)) end
if __opcodeSeed==0 then __opcodeSeed=0x6D2B79F5 end
local __opcodeCacheIds,__opcodeCacheSlots={},{};local __opcodeCacheCursor=1
local function ${opcodeResolverName}(wanted)
 wanted=wanted%4294967296
 for __ci=1,8 do if __opcodeCacheIds[__ci]==wanted then return __opcodeCacheSlots[__ci] end end
 local __state=__opcodeSeed;local __previous=bit32.band(__state,255);local __b0,__b1,__b2,__b3,__slot=0,0,0,0,0;local __found=nil;local __record=0;local __prevCheck=bit32.band(__state,255)
 for __oi=1,#P.${fields.o} do __state=bit32.bxor(__state,bit32.lshift(__state,13));__state=bit32.bxor(__state,bit32.rshift(__state,17));__state=bit32.bxor(__state,bit32.lshift(__state,5));local __cipher=bit32.bxor(__WSAT_byte(P.${fields.o},__oi),__WSAT_byte(P.${fields.o2},__oi));local __mask=bit32.band(bit32.rshift(__state,((__oi-1)%4)*8),255);local __plain=bit32.bxor(__cipher,__mask,__previous);__previous=__cipher;local __col=(__oi-1)%6;if __col==0 then __b0=__plain elseif __col==1 then __b1=__plain elseif __col==2 then __b2=__plain elseif __col==3 then __b3=__plain elseif __col==4 then __slot=__plain else __record=__record+1;local __id=__b0+__b1*256+__b2*65536+__b3*16777216;local __want=(__b0*3+__b1*5+__b2*7+__b3*11+__slot*13+__record*17+__prevCheck*19)%256;if __plain~=__want then __WSAT_error("WSF_DIAG_OPCODE_RECORD",0) end;if __id==wanted then __found=__slot end;__prevCheck=__plain end end
 if __found~=nil then __opcodeCacheIds[__opcodeCacheCursor]=wanted;__opcodeCacheSlots[__opcodeCacheCursor]=__found;__opcodeCacheCursor=__opcodeCacheCursor%8+1 end
 return __found
end
${hotGuardLua}
local __lastOp=0;local __dfstate=${(secureKeyFloat()*65520|0)+1}
local __loopSalt=${Math.floor(secureKeyFloat() * 250) + 1}
local __steps=0;local __maxSteps=${instructionBudget}
local __pcMod=#P.${fields.im}/4;local __pcMul=${fields.metaReadName}(P,5,2);local __pcAdd=${fields.metaReadName}(P,5,3);local __pcInv=${fields.metaReadName}(P,5,4);__pcAdd=(__pcAdd+(__wsRuntimeSalt%__pcMod))%__pcMod;__pcToken=(__pcAdd%__pcMod)+1
local function __pcEncode(__logical)return (((__logical-1)*__pcMul+__pcAdd)%__pcMod)+1 end
local function __pcDecode(__token)return (((((__token-1-__pcAdd)%__pcMod+__pcMod)%__pcMod)*__pcInv)%__pcMod)+1 end
while not done and (((pc*pc+__lastOp*17+sp*31+__loopSalt+__pcToken*(__loopSalt%17+1))%251)>=0) do
if __pcToken<1 or __pcToken>__pcMod or __pcToken%1~=0 then error("WSF_DIAG_FLOW_STATE",0) end;pc=__pcDecode(__pcToken)
__steps=__steps+1;__WSGlobalSteps=__WSGlobalSteps+1
if __WSGlobalSteps>__maxSteps then error(${luaHiddenString("WSF_DIAG_STEP_LIMIT_HIDDEN")},0) end
local __wordCount=math.floor(__buf.len(P.${fields.c})/4)
if pc<1 or pc>(#P.${fields.im}/4) then error(${luaHiddenString("WSF_DIAG_PC_RANGE_HIDDEN")},0) end
__frameRecord.pc=pc;__frameRecord.state="running"
${hotGuardName}(P,__frameRecord,pc,sp)
${integrityFn ? `if __steps%${integrityInterval}==0 then __WSATCheck(__frameCoroutine);if __WSFrameStack[__WSFrameCount]~=__frameRecord or __frameRecord.proto~=P or __frameRecord.depth~=__WSFrameCount or __frameRecord.state~="running" then error("WSF_DIAG_CONSTANT_INDEX",0) end end` : ""}
local op,a,b,c,bx,sbx=${fetchStageName}(pc)
pc=pc+1
local __flowState=(pc*pc*${flowPcMul}+__lastOp*__lastOp*${flowLastMul}+(sp%251)*${flowStackMul})%251
local __dispatchState=(op*${dispatchMultiplier}+__lastOp*${dispatchLastMul}+(sp%251)*${dispatchStackMul}+__flowState)%251
local __dispatchOp=((((__dispatchState-__lastOp*${dispatchLastMul}-(sp%251)*${dispatchStackMul}-__flowState)%251)+251)%251*${dispatchInverse})%251
__lastOp=op
${integrityFn ? "__WSVMGuard(__dispatchOp,pc,sp);" : ""}
${dispatchStageName}(__dispatchOp,a,b,c,bx,sbx)
__dfstate=(__dfstate+pc*17+op*31+__fsp+__frameRecord.id*7)%65521
for __di=1,${12 + (secureRandomFloat()*13|0)} do __dfstate=(__dfstate*17+__di*__lastOp+pc+__fsp)%65521 end
local __opaqueMix=bit32.bxor(__dfstate,__pcToken);local __opaqueLeft=bit32.band(__opaqueMix,bit32.bnot(__opaqueMix));if __opaqueLeft~=0 then __WSATFailIntegrity() end
__push(__dfstate);__dfstate=(__pop()+__dfstate)%65521
local __wsRingValue=(__dfstate+pc*13+op*19+__frameRecord.depth*23)%65521
-- Shadow ledger uses a deliberately different recurrence. It is consistency
-- telemetry, not a cryptographic barrier against an attacker who can edit this VM.
local __wsShadowValue=(__dfstate*7+pc*29+op*11+__frameRecord.depth*37+__fsp*3)%65521
__WSIntegrityRing[__WSIntegrityCursor]=__wsRingValue
__WSIntegrityShadowRing[__WSIntegrityCursor]=__wsShadowValue
__WSIntegrityFold=0;__WSIntegrityAlt=1;__WSIntegrityShadowFold=0;__WSIntegrityShadowAlt=1
for __di=1,32 do
 __WSIntegrityFold=(__WSIntegrityFold*31+__WSIntegrityRing[__di]+__di*7)%65521
 __WSIntegrityAlt=(__WSIntegrityAlt*17+__WSIntegrityRing[33-__di]+__di*13)%65521
 __WSIntegrityShadowFold=(__WSIntegrityShadowFold*37+__WSIntegrityShadowRing[__di]+__di*19)%65521
 __WSIntegrityShadowAlt=(__WSIntegrityShadowAlt*23+__WSIntegrityShadowRing[33-__di]+__di*31)%65521
end
__WSIntegrityCursor=__WSIntegrityCursor%32+1
${__wsTimingNoiseBuild ? 'if op%3==0 then local __tn=0;for __tj=1,7 do __tn=(__tn+__tj*__lastOp+pc)%65521 end;if __tn<0 then error("WSF_DIAG_STEP_LIMIT",0) end end' : ""}
${integrityFn ? `__integrityTick=__integrityTick+1;if __integrityTick%${integrityInterval}==0 then if ${integrityFn}(__rootIntegrity,0)~=(__rootIntegrity.${fields.s} or -1) or ${integrityFn}2(__rootIntegrity,0)~=(__rootIntegrity.${fields.s2} or -1) then ${integrityPolicy === "strict" ? '__WSATFailIntegrity()' : `__WSAT_error(${luaHiddenString("WSF_DIAG_INTEGRITY_HASH")},0)`} end;local __rf=0;local __ra=1;local __sf=0;local __sa=1;for __ri=1,32 do __rf=(__rf*31+__WSIntegrityRing[__ri]+__ri*7)%65521;__ra=(__ra*17+__WSIntegrityRing[33-__ri]+__ri*13)%65521;__sf=(__sf*37+__WSIntegrityShadowRing[__ri]+__ri*19)%65521;__sa=(__sa*23+__WSIntegrityShadowRing[33-__ri]+__ri*31)%65521 end;if __rf~=__WSIntegrityFold or __ra~=__WSIntegrityAlt or __sf~=__WSIntegrityShadowFold or __sa~=__WSIntegrityShadowAlt then ${integrityPolicy === "strict" ? '__WSATFailIntegrity()' : `__WSAT_error(${luaHiddenString("WSF_DIAG_VM_HIDDEN_FAILURE")},0)`} end end` : ""}
__pcToken=__pcEncode(pc);pc=0
end
${integrityFn ? `__WSATCheck(__frameCoroutine);if __WSFrameStack[__WSFrameCount]~=__frameRecord or __frameRecord.proto~=P or __frameRecord.depth~=__WSFrameCount then __WSAT_error("WSF_DIAG_PC_RANGE",0) end;if ${integrityFn}(__rootIntegrity,0)~=(__rootIntegrity.${fields.s} or -1) or ${integrityFn}2(__rootIntegrity,0)~=(__rootIntegrity.${fields.s2} or -1) then ${integrityPolicy === "strict" ? '__WSATFailIntegrity()' : `__WSAT_error(${luaHiddenString("WSF_DIAG_FINAL_INTEGRITY")},0)`} end` : ""}
local __returnValues=(__WSAT_type(res)=="table" and res) or {n=0}
local __returnCount=__returnValues.n
if __WSAT_type(__returnCount)~="number" or __returnCount%1~=0 or __returnCount<0 then __returnCount=#__returnValues end
if __returnCount>16384 then __WSAT_error("WSF_VM_RETURN_ARITY_INVALID",0) end
__frameRecord.transition=__frameRecord.transition+1;__frameRecord.state="returned";__frameRecord.returnCount=__returnCount
if __WSFrameCount~=(__frameRecord.depth) or __WSFrameStack[__frameRecord.depth]~=__frameRecord then __WSATFailStructure() end
__WSFrameStack[__frameRecord.depth]=nil;__WSFrameCount=__WSFrameCount-1
return table.unpack(__returnValues,1,__returnCount)
end;
local function __WSRun(__rootProto,__rootUpvalues,...)
 if __WSSchedulerActive then error("WSF_VM_REENTRANT_RUN",0) end
 __WSGlobalSteps=0
 local __rootArgs=table.pack(...)
 -- Some executor runtimes expose a partial/missing coroutine library. In that
 -- case use the VM's existing direct-call path instead of calling nil methods.
 local __coCreate=__WSAT_coroutineCreate
 local __coResume=__WSAT_coroutineResume
 local __coStatus=__WSAT_coroutineStatus
 local __coYield=__WSAT_coroutineYield
 -- User coroutine API exposure is independent from this internal scheduler.
 -- Keep direct VM calls as the default; only use the coroutine scheduler when its
 -- dedicated vmCoroutineScheduler option was explicitly enabled at build time.
 -- A partial host coroutine API always falls back to the direct-call path.
 if ${useCoroutineScheduler ? "false" : "true"} or
  __WSAT_type(__coCreate)~="function" or __WSAT_type(__coResume)~="function"
  or __WSAT_type(__coStatus)~="function" or __WSAT_type(__coYield)~="function" then
  local __direct=table.pack(__WSAT_xpcall(function()
   return __WSV(__rootProto,__rootUpvalues,table.unpack(__rootArgs,1,__rootArgs.n))
  end,__WSRuntimeErrorHandler))
  if not __direct[1] then
   local __failure=__direct[2]
   __WSCleanupExecutionState()
   error(__failure,0)
  end
  if __WSFrameCount~=0 or __WSCallCount~=0 or __WSPendingCall~=nil or __WSCurrentEntry~=nil then
   __WSCleanupExecutionState()
   error("WSF_VM_DIRECT_STACK_NOT_EMPTY",0)
  end
  local __out={n=__direct.n-1}
  for __i=2,__direct.n do __out[__i-1]=__direct[__i] end
  __WSCleanupExecutionState()
  return table.unpack(__out,1,__out.n)
 end
 __WSSchedulerActive=true
 local __run=table.pack(__WSAT_pcall(function()
  if __WSAT_type(__coCreate)~="function" or __WSAT_type(__coResume)~="function"
   or __WSAT_type(__coStatus)~="function" then
   error("WSF_VM_COROUTINE_ALIAS_INVALID",0)
  end
  local __rootCo=__coCreate(function() return __WSV(__rootProto,__rootUpvalues,table.unpack(__rootArgs,1,__rootArgs.n)) end)
  if __WSAT_type(__rootCo)~="thread" then error("WSF_VM_COROUTINE_CREATE_INVALID",0) end
  local __frames={{co=__rootCo}}
  while #__frames>0 do
   local __top=__frames[#__frames]
   local __resume=__top.resumePack
   __top.resumePack=nil
   local __res
   if __resume then __res=table.pack(__coResume(__top.co,table.unpack(__resume,1,__resume.n)))
   else __res=table.pack(__coResume(__top.co)) end
   if not __res[1] then error(__res[2],0) end
   local __statusOk,__statusValue=__WSAT_pcall(__coStatus,__top.co)
   if not __statusOk then error("WSF_VM_COROUTINE_STATUS_FAILED:"..__WSAT_tostring(__statusValue),0) end
   if __statusValue=="dead" then
    local __out={n=__res.n-1}
    for __i=2,__res.n do __out[__i-1]=__res[__i] end
    __frames[#__frames]=nil
    if #__frames==0 then
     if __WSFrameCount~=0 or __WSCallCount~=0 or __WSPendingCall~=nil or __WSCurrentEntry~=nil then
      error("WSF_VM_STACK_NOT_EMPTY",0)
     end
     return table.pack(table.unpack(__out,1,__out.n))
    end
    __frames[#__frames].resumePack=__out
   else
    local __yielded=__res[2]
    if __WSAT_type(__yielded)=="table" and __yielded.tag==__WSCallRequest then
     local __req=__yielded
     if __WSAT_type(__req.frame)~="table" or __WSAT_type(__req.frame.args)~="table"
      or __WSAT_type(__req.frame.proto)~="table" then error("WSF_VM_CALL_REQUEST_INVALID",0) end
     __WSDirectCallProto=nil
     local __child=__coCreate(function()
      __WSCurrentEntry=__req.frame
      return __WSV(__req.frame.proto,__req.frame.upvalues,table.unpack(__req.frame.args,1,__req.frame.args.n))
     end)
     if __WSAT_type(__child)~="thread" then error("WSF_VM_COROUTINE_CHILD_CREATE_INVALID",0) end
     __frames[#__frames+1]={co=__child,callFrame=__req.frame}
    else
     error("Unsupported external coroutine yield in shared VM dispatcher",0)
    end
   end
  end
  return table.pack()
 end))
 if not __run[1] then
  local __failure=__run[2]
  __WSCleanupExecutionState()
  error(__failure,0)
 end
 if __WSFrameCount~=0 or __WSCallCount~=0 or __WSPendingCall~=nil or __WSCurrentEntry~=nil then
  __WSCleanupExecutionState()
  error("WSF_VM_STACK_NOT_EMPTY",0)
 end
 __WSCleanupExecutionState()
 local __result=__run[2]
 if __WSAT_type(__result)~="table" or __WSAT_type(__result.n)~="number" or __result.n<0 or __result.n%1~=0 then
  error("WSF_VM_RESULT_INVALID",0)
 end
 return table.unpack(__result,1,__result.n)
end
`;
  // V8.2.1 restored closure-banked dispatcher (V8.1 proven lowering).
  // Each lowered micro-operation is emitted as an independently shuffled closure.
  // Two feedback-coded manifests map dispatch tags -> bank/slot at runtime.
  // This restores V8.1's indirect bank layout and removes V8.2's linear kind==N
  // branch chain. It is reverse-engineering friction only: closure bodies and
  // runtime manifests remain observable to a sufficiently capable client analyst.
  const original = new Map(VM_OP_LIST.map((name, i) => [i + 1, name]));
  const handlerBlockStart = engine.indexOf('H[0]=function');
  const handlerBlockEnd = engine.indexOf('local __lastOp=', handlerBlockStart);
  // The original interval contains both the opcode decoder and per-frame guard.
  // The compact/full micro-dispatch replacement removes this entire interval,
  // but still calls opcodeResolverName and hotGuardName in the execution loop.
  // Preserve the post-handler helper segment separately, then restore it after
  // the replacement runtime in the same lexical scope.
  const opcodeHelperStart = engine.indexOf('local __opcodeSeed=', handlerBlockStart);
  const opcodeHelperEnd = engine.indexOf('local __lastOp=', opcodeHelperStart);
  const opcodeHelperBlock = opcodeHelperStart >= 0 && opcodeHelperEnd > opcodeHelperStart
    ? engine.slice(opcodeHelperStart, opcodeHelperEnd)
    : '';
  if (handlerBlockStart < 0 || handlerBlockEnd < 0 || !opcodeHelperBlock) {
    throw new Error('Unable to locate VM handler declarations for closure-banked lowering');
  }
  const handlerSource = engine.slice(handlerBlockStart, handlerBlockEnd);
  const handlerStarts = [];
  const handlerStartRe = /(?:^|\n)(H\[\d+\](?:\[\d+\])?=function)/g;
  let handlerMatch;
  while ((handlerMatch = handlerStartRe.exec(handlerSource)) !== null) {
    handlerStarts.push(handlerMatch.index + (handlerMatch[0].startsWith('\n') ? 1 : 0));
  }
  if (handlerStarts.length !== VM_OP_LIST.length + 1) {
    throw new Error('Source VM handler parse count mismatch before closure-banked lowering: ' + handlerStarts.length);
  }

  const microSpec = {
    LOADNIL:[2,0], LOADBOOL:[3,0], LOADK:[4,0], MOVE:[5,0],
    GETGLOBAL:[6,0], SETGLOBAL:[7,0], GETUPVAL:[8,0], SETUPVAL:[9,0],
    NEWTABLE:[10,0], GETTABLE:[11,0], SETTABLE:[12,0], CALL:[13,0],
    RETURN:[14,0], VARARG:[15,0], CLOSURE:[16,0], JMP:[17,0],
    JMPIF:[18,0], JMPIFNOT:[19,0], UNM:[20,1], NOT:[20,2], LEN:[20,3],
    ADD:[21,1], SUB:[21,2], MUL:[21,3], DIV:[21,4], MOD:[21,5], POW:[21,6],
    IDIV:[21,7], CONCAT:[21,8], FORPREP:[22,0], FORLOOP:[23,0], TFORLOOP:[24,0],
    CMPEQ:[21,9], CMPNE:[21,10], CMPLT:[21,11], CMPLE:[21,12], CMPGT:[21,13],
    CMPGE:[21,14], BOR:[21,15], BAND:[21,16],
    FUSED_MOVE_ADD:[21,1], FUSED_MOVE_SUB:[21,2], FUSED_MOVE_MUL:[21,3],
    FUSED_MOVE_DIV:[21,4], MATHCLAMP:[25,1], MATHFLOOR:[25,2], MATHCEIL:[25,3],
    MATHABS:[25,4], MATHSQRT:[25,5], MATHMIN:[25,6], MATHMAX:[25,7],
    FUSED_GETTABLE_ADD_SETTABLE:[26,0], BXOR:[21,17], SHL:[21,18], SHR:[21,19],
    BNOT:[20,4], FUSED_GETGLOBAL_CALL:[13,1], FUSED_GLOBAL_MEMBER_CALL:[13,2],
    FUSED_GLOBAL_MEMBER_LOOKUP:[13,3], STATEPRED:[28,0], NOP:[27,0]
  };
  for (const semantic of VM_OP_LIST) {
    const spec = microSpec[semantic];
    if (!Array.isArray(spec) || spec.length !== 2 || !spec.every(Number.isInteger)) {
      throw new Error('Missing or malformed micro-op lowering for ' + semantic);
    }
  }

  const microCallName = makeVmLocal();
  const microLookupName = makeVmLocal();
  const microManifestNameA = makeVmLocal();
  const microManifestNameB = makeVmLocal();
  const microProgramPoolName = makeVmLocal();
  const microExecName = makeVmLocal();
  const microManifestSeed = (Math.floor(secureKeyFloat()*4294967295)>>>0) || 0x9E3779B9;
  const handlerBodies = new Map([
    ['1:0', 'done=true'],
    ['2:0', 'for i=a,b do R[i]=nil end'],
    ['3:0', 'R[a]=(b~=0)'],
    ['4:0', `R[a]=${constResolveInline("bx")}`],
    ['5:0', 'R[a]=R[b]'],
    ['6:0', `R[a]=g[${constResolveInline("bx")}]`],
    ['7:0', `g[${constResolveInline("bx")}]=R[a]`],
    ['8:0', 'local u=U[b+1];if u and u.get then R[a]=u.get() end'],
    ['9:0', 'local u=U[b+1];if u and u.set then u.set(R[a]) end'],
    ['10:0', 'R[a]={}'],
    ['11:0', `local t=R[b];local k=(c>=100000 and ${constResolveInline("c-100000")} or R[c]);R[a]=t[k]`],
    ['12:0', `local t=R[a];local k=(b>=100000 and ${constResolveInline("b-100000")} or R[b]);t[k]=R[c]`],
    ['13:0', `${microCallName}(0,a,b,c,bx,sbx)`],
    ['13:1', `${microCallName}(1,a,b,c,bx,sbx)`],
    ['13:2', `${microCallName}(2,a,b,c,bx,sbx)`],
    ['13:3', `${microCallName}(3,a,b,c,bx,sbx)`],
    ['14:0', 'local n=(b==0 and (__top-a) or b-1);if n<0 then n=0 end;res={};for i=1,n do res[i]=R[a+i-1] end;res.n=n;__frameRecord.state="return";__frameRecord.returnValues=res;__frameRecord.returnCount=n;done=true'],
    ['15:0', 'local n=(b==0 and (#args-__NP) or b-1);if n<0 then n=0 end;for i=1,n do R[a+i-1]=args[__NP+i] end;__top=a+n'],
    ['16:0', `local child=P.${fields.p}[bx+1];local cuv=child.${fields.u};local up={};for i=1,#cuv do local e=cuv[i];if e[1]==1 then local ri=e[2]+__regBase;local uk=(__stackSalt+pc*37+ri*13)%65521;up[i]=__WSUVCell(R,bit32.bxor(ri,uk),uk) else up[i]=U[e[2]+1] end end;local closure=function(...)return __WSN(child,up,...)end;__WSClosureMeta[closure]={proto=child,upvalues=up};R[a]=closure`],
    ['17:0', 'pc=pc+sbx'],
    ['18:0', 'pc=pc+(__mbaTruthy(R[a]) and sbx or 0)'],
    ['19:0', 'pc=pc+((not __mbaTruthy(R[a])) and sbx or 0)'],
    ['20:1', 'R[a]=-R[b]'],
    ['20:2', 'R[a]=not R[b]'],
    ['20:3', 'R[a]=#R[b]'],
    ['20:4', 'R[a]=bit32.bnot(R[b])'],
    ['21:1', 'R[a]=__mbaAdd(R[b],R[c])'],
    ['21:2', 'R[a]=R[b]-R[c]'],
    ['21:3', 'R[a]=R[b]*R[c]'],
    ['21:4', 'R[a]=R[b]/R[c]'],
    ['21:5', 'R[a]=R[b]%R[c]'],
    ['21:6', 'R[a]=R[b]^R[c]'],
    ['21:7', 'R[a]=__idiv(R[b],R[c])'],
    ['21:8', 'R[a]=__WSAT_tostring(R[b])..__WSAT_tostring(R[c])'],
    ['21:9', 'R[a]=R[b]==R[c]'],
    ['21:10', 'R[a]=R[b]~=R[c]'],
    ['21:11', 'R[a]=R[b]<R[c]'],
    ['21:12', 'R[a]=R[b]<=R[c]'],
    ['21:13', 'R[a]=R[b]>R[c]'],
    ['21:14', 'R[a]=R[b]>=R[c]'],
    ['21:15', 'R[a]=bit32.bor(R[b],R[c])'],
    ['21:16', 'R[a]=bit32.band(R[b],R[c])'],
    ['21:17', 'R[a]=bit32.bxor(R[b],R[c])'],
    ['21:18', 'R[a]=bit32.lshift(R[b],R[c])'],
    ['21:19', 'R[a]=bit32.rshift(R[b],R[c])'],
    ['22:0', 'R[a]=R[a]-R[a+2];pc=pc+sbx'],
    ['23:0', 'R[a]=R[a]+R[a+2];local lim=R[a+1];local st=R[a+2];if(st>0 and R[a]<=lim)or(st<=0 and R[a]>=lim)then R[a+3]=R[a];pc=pc+sbx end'],
    ['24:0', 'local f=R[a];if f==nil then __WSAT_error("WSF_DIAG_NIL_ITERATOR: pc="..tostring(pc)..", reg="..tostring(a),0) end;if __WSAT_type(f)~="function" then __WSAT_error("WSF_DIAG_INVALID_ITERATOR: pc="..tostring(pc)..", reg="..tostring(a)..", type="..__WSAT_type(f),0) end;local rr=table.pack(f(R[a+1],R[a+2]));for i=1,c do R[a+2+i]=rr[i] end;if R[a+3]~=nil then R[a+2]=R[a+3] end'],
    ['25:1', 'local x=R[b];local lo=R[c];local hi=R[bx];if __WSAT_type(x)~="number" or __WSAT_type(lo)~="number" or __WSAT_type(hi)~="number" then __WSAT_error("MATHCLAMP expects numeric operands",0) end;if x<lo then x=lo elseif x>hi then x=hi end;R[a]=x'],
    ['25:2', 'local x=R[b];if __WSAT_type(x)~="number" then __WSAT_error("MATHFLOOR expects number",0) end;R[a]=__WSAT_floor(x)'],
    ['25:3', 'local x=R[b];if __WSAT_type(x)~="number" then __WSAT_error("MATHCEIL expects number",0) end;R[a]=__WSAT_ceil(x)'],
    ['25:4', 'local x=R[b];if __WSAT_type(x)~="number" then __WSAT_error("MATHABS expects number",0) end;R[a]=__WSAT_abs(x)'],
    ['25:5', 'local x=R[b];if __WSAT_type(x)~="number" then __WSAT_error("MATHSQRT expects number",0) end;R[a]=__WSAT_sqrt(x)'],
    ['25:6', 'local x=R[b];if __WSAT_type(x)~="number" or __WSAT_type(R[c])~="number" then __WSAT_error("MATHMIN expects numbers",0) end;R[a]=__WSAT_min(x,R[c])'],
    ['25:7', 'local x=R[b];if __WSAT_type(x)~="number" or __WSAT_type(R[c])~="number" then __WSAT_error("MATHMAX expects numbers",0) end;R[a]=__WSAT_max(x,R[c])'],
    ['26:0', 'local t=R[a];local k=R[b];local old=t[k];local rhs=(c==bx and old or R[c]);t[k]=old+rhs'],
    ['28:0', 'local x=pc%251;local y=sp%251;local z=__fsp%251;local w=__frameRecord.id%251;local t=__pcToken%251;local q=(x*x*7+y*y*11+z*x*13+w*t*17+(__stackSalt%251)*19+(x*y%251)*23)%251;local r=(q*q+x*y*29+t*t*31+z*w*37)%251;R[a]=(r<126)'],
    ['27:0', 'do end'],
    ['29:0', '__WSATFailDispatch()']
  ]);

  const slotSemantics = new Map([[0, '__HALT__']]);
  for (const semantic of VM_OP_LIST) {
    const slot = handlerMap.get(semantic);
    if (!Number.isInteger(slot) || slot < 1 || slot > 250 || slotSemantics.has(slot)) {
      throw new Error('Invalid VM closure-dispatch slot for ' + semantic);
    }
    slotSemantics.set(slot, semantic);
  }
  if (slotSemantics.size !== VM_OP_LIST.length + 1) throw new Error('VM closure-dispatch handler set is incomplete');

  const uniquePairs = new Map();
  uniquePairs.set('1:0', { op:1, sub:0, label:'__HALT__' });
  for (const semantic of VM_OP_LIST) {
    const [op, sub] = semanticMicroSpec(semantic);
    const key = `${op}:${sub}`;
    if (!uniquePairs.has(key)) uniquePairs.set(key, { op, sub, label:semantic });
  }
  for (const key of uniquePairs.keys()) {
    if (!handlerBodies.has(key)) throw new Error('No dedicated closure body exists for micro-operation ' + key);
  }
  const handlerList = Array.from(uniquePairs.entries()).map(([key, value]) => ({ key, ...value }));
  // Shuffle physical closure placements independently from semantic opcode order.
  for (let i = handlerList.length - 1; i > 0; i--) {
    const j = secureRandomFloat() * (i + 1) | 0;
    [handlerList[i], handlerList[j]] = [handlerList[j], handlerList[i]];
  }
  // V8.1: semantic closures remain independently shuffled,
  // positional closure pool. The runtime manifest maps ordinal -> pool index;
  // no numeric token is adjacent to a semantic body and no `if kind == N`
  // decision chain is emitted. The pool and mapping remain client-visible and
  // reversible, but straightforward kind-to-body regex extraction is removed.
  const programOrder = handlerList.slice();
  for (let i = programOrder.length - 1; i > 0; i--) {
    const j = secureRandomFloat() * (i + 1) | 0;
    [programOrder[i], programOrder[j]] = [programOrder[j], programOrder[i]];
  }
  for (let hi = 0; hi < handlerList.length; hi++) handlerList[hi].microOrdinal = hi + 1;
  for (let fi = 0; fi < programOrder.length; fi++) programOrder[fi].programIndex = fi + 1;
  // Each logical micro-operation is represented as a randomized numeric mini-VM
  // instruction. The emitted pool is data, not a table of Lua closures.
  const usedMicroCodes = new Set();
  for (const h of handlerList) {
    let code;
    do { code = 1 + (secureKeyFloat() * 0xFFFFFF | 0); } while (usedMicroCodes.has(code));
    usedMicroCodes.add(code);
    h.microCode = code;
  }

  // Four-byte record: ordinal:u16 + randomized factory-pool index:u16.
  // The encrypted mapping is not a cryptographic secret; it simply separates
  // the numeric dispatch identity from the closure body position.
  const microManifestPlain = [];
  for (const h of handlerList) microManifestPlain.push(
    h.microOrdinal & 255, (h.microOrdinal >>> 8) & 255,
    h.programIndex & 255, (h.programIndex >>> 8) & 255
  );
  let microState = microManifestSeed >>> 0, microPrev = microState & 255;
  const microManifestCipher = microManifestPlain.map((value, index) => {
    microState = (microState ^ (microState << 13)) >>> 0;
    microState = (microState ^ (microState >>> 17)) >>> 0;
    microState = (microState ^ (microState << 5)) >>> 0;
    const mask = (microState >>> ((index % 4) * 8)) & 255;
    const cipher = (value ^ mask ^ microPrev) & 255;
    microPrev = cipher;
    return cipher;
  });
  const microManifestShareB = microManifestCipher.map(() => (secureKeyFloat() * 256) | 0);
  const microManifestShareA = microManifestCipher.map((value, index) => (value ^ microManifestShareB[index]) & 255);
  const microManifestLiteralA = '"' + microManifestShareA.map(v => '\\' + String(v).padStart(3, '0')).join('') + '"';
  const microManifestLiteralB = '"' + microManifestShareB.map(v => '\\' + String(v).padStart(3, '0')).join('') + '"';
  const bankCount = 4;
  const bankNames = Array.from({ length: bankCount }, () => makeVmLocal());
  const dispatchName = makeVmLocal();
  const dispatchBlobName = makeVmLocal();
  const dispatchBlobNameB = makeVmLocal();
  const tagFnName = makeVmLocal();
  const bankArrayName = makeVmLocal();
  const bankSlots = Array.from({ length: bankCount }, () => 0);
  const pairPlacement = new Map();
  for (let i = 0; i < handlerList.length; i++) {
    const targetBank = i % bankCount;
    const bank = (targetBank + (secureRandomFloat() * bankCount | 0)) % bankCount;
    const slot = ++bankSlots[bank];
    if (slot > 255) throw new Error('VM handler bank slot overflow');
    handlerList[i].bank = bank + 1;
    handlerList[i].bankSlot = slot;
    pairPlacement.set(handlerList[i].key, { bank:bank + 1, slot });
  }

  const dispatchKeys = Array.from({ length: 16 }, () => secureKeyFloat() * 4096 | 0);
  const dispatchKeyBytes = [];
  for (const key of dispatchKeys) dispatchKeyBytes.push((key >>> 8) & 15, key & 255);
  // V7.4: feedback-coded key bytes replace the directly invertible affine codec.
  // The seed remains in client output, so this is obfuscation, not secrecy.
  const dispatchKeyCodecSeed = (Math.floor(secureKeyFloat() * 4294967295) >>> 0) || 0xA341316C;
  let dispatchKeyCodecState = dispatchKeyCodecSeed >>> 0;
  let previousDispatchKeyCipher = dispatchKeyCodecState & 255;
  const encodedDispatchKeyBytes = dispatchKeyBytes.map((value, index) => {
    dispatchKeyCodecState = (dispatchKeyCodecState ^ (dispatchKeyCodecState << 13)) >>> 0;
    dispatchKeyCodecState = (dispatchKeyCodecState ^ (dispatchKeyCodecState >>> 17)) >>> 0;
    dispatchKeyCodecState = (dispatchKeyCodecState ^ (dispatchKeyCodecState << 5)) >>> 0;
    const mask = (dispatchKeyCodecState >>> ((index % 4) * 8)) & 255;
    const cipher = (value ^ mask ^ previousDispatchKeyCipher) & 255;
    previousDispatchKeyCipher = cipher;
    return cipher;
  });
  const dispatchKeyBlob = '"' + encodedDispatchKeyBytes.map(value => "\\" + String(value).padStart(3, "0")).join("") + '"';
  const permuteDispatchTag = value => {
    let left = (Math.floor(value / 4096) & 4095), right = (value & 4095);
    for (let r = 0; r < dispatchKeys.length; r++) {
      const q = r + 1, k = dispatchKeys[r];
      const f = (right * right * 3 + right * k + q * 97 + k * k * 5) % 4096;
      const next = (left + f) % 4096;
      left = right; right = next;
    }
    return left * 4096 + right;
  };

  const bankDecls = bankNames.map(name => `local ${name}={}`).join('\n');
  // V8.1: bank-slot -> ordinal links are no longer emitted as source-level
  // assignments. A second independently seeded feedback manifest creates the
  // generic bank closures only after the ordinal/pool manifest has been decoded.
  const bankManifestSeed = (Math.floor(secureKeyFloat()*4294967295)>>>0) || 0xB5297A4D;
  const bankRotationSeed = (Math.floor(secureKeyFloat()*4294967295)>>>0) || 0x68E31DA4;
  const bankManifestPlain = [];
  for (const h of handlerList) bankManifestPlain.push(
    h.microOrdinal & 255, (h.microOrdinal >>> 8) & 255, h.bank & 255, h.bankSlot & 255
  );
  let bankState = bankManifestSeed >>> 0, bankPrev = bankState & 255;
  const bankManifestCipher = bankManifestPlain.map((value,index)=>{
    bankState=(bankState^(bankState<<13))>>>0;
    bankState=(bankState^(bankState>>>17))>>>0;
    bankState=(bankState^(bankState<<5))>>>0;
    const mask=(bankState>>>((index%4)*8))&255;
    const cipher=(value^mask^bankPrev)&255;bankPrev=cipher;return cipher;
  });
  const bankManifestShareB=bankManifestCipher.map(()=>secureKeyFloat()*256|0);
  const bankManifestShareA=bankManifestCipher.map((v,i)=>(v^bankManifestShareB[i])&255);
  const bankManifestLiteralA='"'+bankManifestShareA.map(v=>'\\'+String(v).padStart(3,'0')).join('')+'"';
  const bankManifestLiteralB='"'+bankManifestShareB.map(v=>'\\'+String(v).padStart(3,'0')).join('')+'"';
  const bankExpectedCounts=bankSlots.slice();
  // V8.2.6: micro-operations are serialized as numeric mini-VM instruction IDs.
  // No per-operation Lua functions or factory closures are emitted into the pool.
  const microProgramPoolDecl = `local ${microProgramPoolName}={${programOrder.map(h => h.microCode).join(',')}}`;
  const microCaseOrder = handlerList.slice();
  for (let i = microCaseOrder.length - 1; i > 0; i--) {
    const j = secureRandomFloat() * (i + 1) | 0;
    [microCaseOrder[i], microCaseOrder[j]] = [microCaseOrder[j], microCaseOrder[i]];
  }
  const compactHandlerFnsName=makeVmLocal(), compactHandlerLookupName=makeVmLocal(), compactHandlerIdentityName=makeVmLocal(), compactHandlerHashBankName=makeVmLocal();
  const compactHandlerManifestAName=makeVmLocal(), compactHandlerManifestBName=makeVmLocal();
  const compactHandlerManifestSeed=(Math.floor(secureKeyFloat()*4294967295)>>>0)||0xA341316C;
  const compactHandlerLanes=Array.from({length:3},()=>{let mul=0;do{mul=3+(secureKeyFloat()*249|0);if((mul&1)===0)mul++;}while(mul>251);return {mul,add:(secureKeyFloat()*0x1000000|0),keys:Array.from({length:4},()=>1+(secureKeyFloat()*4094|0))};});
  const compactHandlerHashFns=compactHandlerLanes.map(lane=>{
    const rounds=lane.keys.map((key,index)=>`local n=(r*r*3+r*${key}+${index+1}*97+${key}*${key}*5)%4096;l,r=r,(l+n)%4096`).join(';');
    return `function(v)local l=math.floor(v/4096)%4096;local r=v%4096;${rounds};local p=l*4096+r;return (p*${lane.mul}+${lane.add})%16777216 end`;
  });
  const compactHandlerOrders=Array.from({length:3},()=>{const order=handlerList.slice();for(let i=order.length-1;i>0;i--){const j=secureRandomFloat()*(i+1)|0;[order[i],order[j]]=[order[j],order[i]];}return order;});
  const compactHandlerIndex=compactHandlerOrders.map(order=>new Map(order.map((h,i)=>[h.microCode,i+1])));
  const compactHandlerPlain=[];
  for(const h of handlerList){
    compactHandlerPlain.push(h.microCode&255,(h.microCode>>>8)&255,(h.microCode>>>16)&255);
    for(let lane=0;lane<3;lane++){const fnIndex=compactHandlerIndex[lane].get(h.microCode);if(!fnIndex||fnIndex>255)throw new Error('Compact handler table index overflow');compactHandlerPlain.push(fnIndex&255);}
  }
  let compactHandlerState=compactHandlerManifestSeed>>>0,compactHandlerPrev=compactHandlerState&255;
  const compactHandlerCipher=compactHandlerPlain.map((value,index)=>{compactHandlerState=(compactHandlerState^(compactHandlerState<<13))>>>0;compactHandlerState=(compactHandlerState^(compactHandlerState>>>17))>>>0;compactHandlerState=(compactHandlerState^(compactHandlerState<<5))>>>0;const mask=(compactHandlerState>>>((index%4)*8))&255;const cipher=(value^mask^compactHandlerPrev)&255;compactHandlerPrev=cipher;return cipher;});
  const compactHandlerShareB=compactHandlerCipher.map(()=>secureKeyFloat()*256|0);
  const compactHandlerShareA=compactHandlerCipher.map((v,i)=>(v^compactHandlerShareB[i])&255);
  const compactHandlerLuaA='"'+compactHandlerShareA.map(v=>'\\'+String(v).padStart(3,'0')).join('')+'"';
  const compactHandlerLuaB='"'+compactHandlerShareB.map(v=>'\\'+String(v).padStart(3,'0')).join('')+'"';
  let compactHandlerPlainSeal=0x4B1D2A37;
  for(let i=0;i<compactHandlerPlain.length;i++)compactHandlerPlainSeal=(Math.imul(compactHandlerPlainSeal,33)+compactHandlerPlain[i]+(i+1)*7)>>>0;
  const compactHandlerCheckBase=13+(secureKeyFloat()*13|0);
  const compactHandlerCheckSpan=17+(secureKeyFloat()*17|0);
  const compactHandlerCheckSalt=1+(secureKeyFloat()*65520|0);
  const compactHandlerFunctionBodiesByLane=compactHandlerOrders.map((order,lane)=>order.map(h=>{
    const body=handlerBodies.get(h.key);if(typeof body!=='string')throw new Error('Missing mini-VM instruction body for '+h.key);
    const noiseName=makeVmLocal();
    const entryNoise=lane===0?'':lane===1?`local ${noiseName}=(a*3+b*5+c*7+bx*11+sbx*13)%65521;if ${noiseName}<0 then ${noiseName}=${noiseName}+65521 end;`:`local ${noiseName}=(a+b+c+bx+sbx)%251;if ${noiseName}==252 then ${noiseName}=0 end;`;
    return `function(a,b,c,bx,sbx) ${entryNoise}${body} end`;
  }).join(','));
  const compactHandlerPoolsLua=compactHandlerFunctionBodiesByLane.map(bodies=>`{${bodies}}`).join(',');
  const compactHandlerRuntime=`local ${compactHandlerFnsName}={${compactHandlerPoolsLua}}
local ${compactHandlerManifestAName}=${compactHandlerLuaA};local ${compactHandlerManifestBName}=${compactHandlerLuaB}
if #${compactHandlerManifestAName}~=${compactHandlerCipher.length} or #${compactHandlerManifestBName}~=${compactHandlerCipher.length} or #${compactHandlerManifestAName}%6~=0 then __WSATFailIntegrity() end
local ${compactHandlerLookupName}={{},{},{}};local ${compactHandlerIdentityName}={{},{},{}};local ${compactHandlerHashBankName}={${compactHandlerHashFns.join(',')}}
local __chState=${compactHandlerManifestSeed};local __chPrev=bit32.band(__chState,255);local __chSeal=1260202551
for __chi=1,#${compactHandlerManifestAName},6 do local __v1,__v2,__v3,__f1,__f2,__f3=0,0,0,0,0,0;for __chj=0,5 do __chState=bit32.bxor(__chState,bit32.lshift(__chState,13));__chState=bit32.bxor(__chState,bit32.rshift(__chState,17));__chState=bit32.bxor(__chState,bit32.lshift(__chState,5));local __chCipher=bit32.bxor(__WSAT_byte(${compactHandlerManifestAName},__chi+__chj),__WSAT_byte(${compactHandlerManifestBName},__chi+__chj));local __chMask=bit32.band(bit32.rshift(__chState,((__chi+__chj-1)%4)*8),255);local __chPlain=bit32.bxor(__chCipher,__chMask,__chPrev);__chPrev=__chCipher;__chSeal=(__chSeal*33+__chPlain+(__chi+__chj)*7)%4294967296;if __chj==0 then __v1=__chPlain elseif __chj==1 then __v2=__chPlain elseif __chj==2 then __v3=__chPlain elseif __chj==3 then __f1=__chPlain elseif __chj==4 then __f2=__chPlain else __f3=__chPlain end end;local __chCode=__v1+__v2*256+__v3*65536;local __chFns={__f1,__f2,__f3};if __chCode<1 or __chCode>16777215 then __WSATFailIntegrity() end;for __chl=1,3 do local __spec=${compactHandlerLookupName}[__chl];local __hash=${compactHandlerHashBankName}[__chl](__chCode);local __chFn=__chFns[__chl];if __chFn<1 or __chFn>#${compactHandlerFnsName}[__chl] or __spec[__hash]~=nil or ${compactHandlerIdentityName}[__chl][__chFn]~=nil then __WSATFailIntegrity() end;__spec[__hash]=__chFn;${compactHandlerIdentityName}[__chl][__chFn]=__chCode end end
if __chSeal~=${compactHandlerPlainSeal} then __WSATFailIntegrity() end
local __chTick=0;local __chNextCheck=${compactHandlerCheckBase};local __chCheckState=${compactHandlerCheckSalt};local __chDrift=0
local function ${microExecName}(code,a,b,c,bx,sbx,route)
 if __WSAT_type(route)~='number' or route%1~=0 or route<0 or route>2 then __WSATFailIntegrity() end
 local lane=route+1;local hash=${compactHandlerHashBankName}[lane];local index=${compactHandlerLookupName}[lane][hash(code)]
 __chTick=__chTick+1;__chCheckState=(__chCheckState*37+code*17+route*29+__chTick*13)%65521
 local __chGate=(__chCheckState+code+route*7)%11
 if __chTick>=__chNextCheck or __chGate==0 then
  local i1=${compactHandlerLookupName}[1][${compactHandlerHashBankName}[1](code)];local i2=${compactHandlerLookupName}[2][${compactHandlerHashBankName}[2](code)];local i3=${compactHandlerLookupName}[3][${compactHandlerHashBankName}[3](code)]
  local v1=i1~=nil and ${compactHandlerIdentityName}[1][i1]==code
  local v2=i2~=nil and ${compactHandlerIdentityName}[2][i2]==code
  local v3=i3~=nil and ${compactHandlerIdentityName}[3][i3]==code
  if not v1 or not v2 or not v3 then __chDrift=__chDrift+1;if __chDrift>=${2+(secureRandomFloat()*3|0)} then __WSATFailDispatch() end;__WSATFailDispatch() else __chDrift=__WSAT_max(0,__chDrift-1);index=({i1,i2,i3})[lane] end
  __chNextCheck=__chTick+${compactHandlerCheckBase}+(__chCheckState%${compactHandlerCheckSpan})
 end
 local fn=${compactHandlerFnsName}[lane] and ${compactHandlerFnsName}[lane][index]
 if __WSAT_type(fn)~='function' then __WSATFailDispatch() end
 return fn(a,b,c,bx,sbx)
end
if __WSAT_freeze then for __chl=1,3 do __WSAT_pcall(__WSAT_freeze,${compactHandlerFnsName}[__chl]);__WSAT_pcall(__WSAT_freeze,${compactHandlerLookupName}[__chl]);__WSAT_pcall(__WSAT_freeze,${compactHandlerIdentityName}[__chl]) end;__WSAT_pcall(__WSAT_freeze,${compactHandlerFnsName});__WSAT_pcall(__WSAT_freeze,${compactHandlerLookupName});__WSAT_pcall(__WSAT_freeze,${compactHandlerHashBankName}) end`;
  const microInterpreterDecl = compactHandlerRuntime;
  const emittedMicroPrograms = programOrder.length;
  if (emittedMicroPrograms !== handlerList.length || handlerList.length !== uniquePairs.size || usedMicroCodes.size !== handlerList.length) {
    throw new Error('Mini-VM program lowering count mismatch: ' + emittedMicroPrograms + '/' + handlerList.length);
  }
  const rawDispatchBytes = [];
  const dispatchTags = new Set();
  let recordNo = 0;
  for (const [physicalSlot, semantic] of slotSemantics) {
    const spec = semanticMicroSpec(semantic);
    const pair = semantic === '__HALT__' ? '1:0' : `${spec[0]}:${spec[1]}`;
    const location = pairPlacement.get(pair);
    if (!location) throw new Error('Missing closure bank placement for ' + semantic);
    const tag = permuteDispatchTag(physicalSlot);
    if (dispatchTags.has(tag)) throw new Error('24-bit VM dispatch tag collision');
    dispatchTags.add(tag);
    recordNo++;
    const hi = (tag >>> 16) & 255, mid = (tag >>> 8) & 255, lo = tag & 255;
    const bank = location.bank, slot = location.slot;
    const previousCheck = recordNo === 1 ? (dispatchKeys[0] & 255) : rawDispatchBytes[rawDispatchBytes.length - 1];
    const check = (hi * 3 + mid * 5 + lo * 7 + bank * 11 + slot * 13 + recordNo * 17 +
      ((hi * mid + lo * bank + slot * recordNo) % 251) + previousCheck * 19) % 256;
    rawDispatchBytes.push(hi, mid, lo, bank, slot, check);
  }
  if (recordNo !== VM_OP_LIST.length + 1) throw new Error('V8.2.6 dispatch manifest size mismatch');
  // Nonlinear feedback codec: each manifest byte depends on two Feistel keys,
  // its position, and the previous ciphertext byte (not a single affine inverse).
  let previousDispatchCipher = dispatchKeys[15] & 255;
  const encodedDispatchBytes = rawDispatchBytes.map((value, index) => {
    const pos = index + 1;
    const k1 = dispatchKeys[index % 16];
    const k2 = dispatchKeys[(index + 7) % 16];
    const mask = (k1 + pos * 17 + previousDispatchCipher * 3 + (k2 ^ (pos * 29))) & 255;
    const cipher = (value ^ mask) & 255;
    previousDispatchCipher = cipher;
    return cipher;
  });
  const dispatchShareB = encodedDispatchBytes.map(() => (secureRandomFloat()*256)|0);
  const dispatchShareA = encodedDispatchBytes.map((value,index)=>(value^dispatchShareB[index])&255);
  const dispatchBlobA = '"' + dispatchShareA.map(value => '\\' + String(value).padStart(3, '0')).join('') + '"';
  const dispatchBlobB = '"' + dispatchShareB.map(value => '\\' + String(value).padStart(3, '0')).join('') + '"';

  const runtimeSaltSeed = (Math.floor(secureKeyFloat() * 0xFFFFFFFF) >>> 0) || 0xA341316C;
  const runtimeSaltLua = `local __wsRuntimeSalt=${runtimeSaltSeed};local __wsRunOs=g and g.os;if __WSAT_type(__wsRunOs)=="table" and __WSAT_type(__wsRunOs.clock)=="function" then local __wsClockOk,__wsClockValue=__WSAT_pcall(__wsRunOs.clock);if __wsClockOk and __WSAT_type(__wsClockValue)=="number" then __wsRuntimeSalt=bit32.bxor(__wsRuntimeSalt,(__WSAT_floor((__wsClockValue%4294.967296)*1000000)%4294967296)) end end;__wsRuntimeSalt=bit32.bxor(__wsRuntimeSalt,(__frameRecord.id*2654435761)%4294967296,(__frameRecord.depth*2246822519)%4294967296,(__WSAT_type(P.${fields.n})=="number" and P.${fields.n} or 0),${fields.metaReadName}(P,2,6));`;
  const fullMicroRuntime = `
local ${microCallName}
${microProgramPoolDecl}
local ${microLookupName}={}
${microInterpreterDecl}
local ${microManifestNameA}=${microManifestLiteralA};local ${microManifestNameB}=${microManifestLiteralB}
if #${microManifestNameA}~=${microManifestCipher.length} or #${microManifestNameB}~=${microManifestCipher.length} or #${microManifestNameA}%4~=0 then __WSATFailIntegrity() end
local __microState=${microManifestSeed};local __microPrev=bit32.band(__microState,255);local __microPlain={}
for i=1,#${microManifestNameA} do __microState=bit32.bxor(__microState,bit32.lshift(__microState,13));__microState=bit32.bxor(__microState,bit32.rshift(__microState,17));__microState=bit32.bxor(__microState,bit32.lshift(__microState,5));local shareA=__WSAT_byte(${microManifestNameA},i);local shareB=__WSAT_byte(${microManifestNameB},i);local cipher=bit32.bxor(shareA,shareB);local mask=bit32.band(bit32.rshift(__microState,((i-1)%4)*8),255);__microPlain[i]=bit32.bxor(cipher,mask,__microPrev);__microPrev=cipher end
local __microSeenOrdinal, __microSeenPool={},{}
for i=1,#__microPlain,4 do
 local ordinal=__microPlain[i]+__microPlain[i+1]*256
 local poolIndex=__microPlain[i+2]+__microPlain[i+3]*256
 local miniCode=${microProgramPoolName}[poolIndex]
 if ordinal<1 or ordinal>${handlerList.length} or poolIndex<1 or poolIndex>${handlerList.length} or __microSeenOrdinal[ordinal] or __microSeenPool[poolIndex] or __WSAT_type(miniCode)~="number" or miniCode%1~=0 then __WSATFailIntegrity() end
 __microSeenOrdinal[ordinal]=true;__microSeenPool[poolIndex]=true;${microLookupName}[ordinal]=poolIndex
end
for i=1,${handlerList.length} do if __WSAT_type(${microLookupName}[i])~="number" or ${microLookupName}[i]<1 or ${microLookupName}[i]>${handlerList.length} or not __microSeenPool[i] then __WSATFailIntegrity() end end
for i=1,#__microPlain do __microPlain[i]=nil end
__microPlain=nil;__microSeenOrdinal=nil;__microSeenPool=nil
${bankDecls}
local ${bankArrayName}={${bankNames.join(',')}}
local __bankMapA=${bankManifestLiteralA};local __bankMapB=${bankManifestLiteralB}
local ${tagFnName}KeyBlob=${dispatchKeyBlob}
local ${tagFnName}Keys={}
if #${tagFnName}KeyBlob~=32 then __WSAT_error("WSF_DIAG_DISPATCH_KEY_SIZE",0) end
local __tagCodecState=${dispatchKeyCodecSeed};local __tagCodecPrev=bit32.band(__tagCodecState,255)
for i=1,32 do __tagCodecState=bit32.bxor(__tagCodecState,bit32.lshift(__tagCodecState,13));__tagCodecState=bit32.bxor(__tagCodecState,bit32.rshift(__tagCodecState,17));__tagCodecState=bit32.bxor(__tagCodecState,bit32.lshift(__tagCodecState,5));local e=__WSAT_byte(${tagFnName}KeyBlob,i);local mask=bit32.band(bit32.rshift(__tagCodecState,((i-1)%4)*8),255);local d=bit32.bxor(e,mask,__tagCodecPrev);__tagCodecPrev=e;if i%2==1 then ${tagFnName}Keys[(i+1)/2]=d*256 else ${tagFnName}Keys[i/2]=${tagFnName}Keys[i/2]+d end end
local function ${tagFnName}(v)
 local l=math.floor(v/4096)%4096;local r=v%4096
 for q=1,16 do local k=${tagFnName}Keys[q];local f=(r*r*3+r*k+q*97+k*k*5)%4096;l,r=r,(l+f)%4096 end
 return l*4096+r
end
local ${dispatchBlobName}=${dispatchBlobA};local ${dispatchBlobNameB}=${dispatchBlobB}
local ${dispatchName}={}
local __wsCanonicalBanks={${bankNames.join(',')}}
local __wsDispatchRotation=__wsRuntimeSalt%2147483647
local __wsDispatchEpoch=__wsRuntimeSalt%4093
local __wsRotationSeed=bit32.bxor(${bankRotationSeed},__wsRuntimeSalt)
local __wsBankPermutation={1,2,3,4}
local __wsRotationInterval=${21+(Math.floor(secureRandomFloat()*17))}
local __bankExpected={${bankExpectedCounts.join(',')}}
if #${dispatchBlobName}~=${encodedDispatchBytes.length} or #${dispatchBlobNameB}~=${encodedDispatchBytes.length} or #${dispatchBlobName}%6~=0 then __WSAT_error("WSF_DIAG_DISPATCH_MANIFEST_SIZE",0) end
if #__bankMapA~=${bankManifestCipher.length} or #__bankMapB~=${bankManifestCipher.length} or #__bankMapA%4~=0 then __WSAT_error("WSF_DIAG_BANK_MANIFEST_SIZE",0) end
local function __wsBuildDispatch(rotation)
 -- Rebuild logical banks from the encrypted bank manifest. Each epoch derives
 -- a fresh four-bank permutation instead of cycling through four fixed rotations.
 local bankPermutation={1,2,3,4}
 local shuffleState=bit32.bxor(__wsRotationSeed,rotation,${bankManifestSeed})
 for pi=${bankCount},2,-1 do
  shuffleState=bit32.bxor(shuffleState,bit32.lshift(shuffleState,13));shuffleState=bit32.bxor(shuffleState,bit32.rshift(shuffleState,17));shuffleState=bit32.bxor(shuffleState,bit32.lshift(shuffleState,5))
  local pj=(shuffleState%pi)+1;bankPermutation[pi],bankPermutation[pj]=bankPermutation[pj],bankPermutation[pi]
 end
 for bi=1,${bankCount} do local bank=__wsCanonicalBanks[bi];for k=1,__bankExpected[bi] do bank[k]=nil end end
 local bankState=${bankManifestSeed};local bankPrev=bit32.band(bankState,255)
 local o0,o1,bankId,slot=0,0,0,0
 local bankSeenOrdinal,bankSeenSlot={},{}
 local bankRecords=0
 for i=1,#__bankMapA do
  bankState=bit32.bxor(bankState,bit32.lshift(bankState,13));bankState=bit32.bxor(bankState,bit32.rshift(bankState,17));bankState=bit32.bxor(bankState,bit32.lshift(bankState,5))
  local cipher=bit32.bxor(__WSAT_byte(__bankMapA,i),__WSAT_byte(__bankMapB,i))
  local mask=bit32.band(bit32.rshift(bankState,((i-1)%4)*8),255)
  local plain=bit32.bxor(cipher,mask,bankPrev);bankPrev=cipher
  local col=(i-1)%4
  if col==0 then o0=plain elseif col==1 then o1=plain elseif col==2 then bankId=plain else
   slot=plain;bankRecords=bankRecords+1
   local ordinal=o0+o1*256;local key=bankId..":"..slot
   local bank=__wsCanonicalBanks[bankId];local poolIndex=${microLookupName}[ordinal]
   if ordinal<1 or ordinal>${handlerList.length} or bank==nil or slot<1 or slot>(__bankExpected[bankId] or 0) or bankSeenOrdinal[ordinal] or bankSeenSlot[key] or __WSAT_type(poolIndex)~="number" or poolIndex<1 or poolIndex>${handlerList.length} then __WSAT_error("WSF_DIAG_BANK_MANIFEST",0) end
   bankSeenOrdinal[ordinal]=true;bankSeenSlot[key]=true;bank[slot]=poolIndex
  end
 end
 if bankRecords~=${handlerList.length} then __WSAT_error("WSF_DIAG_BANK_MANIFEST",0) end
 for ordinal=1,${handlerList.length} do if not bankSeenOrdinal[ordinal] then __WSAT_error("WSF_DIAG_BANK_MANIFEST",0) end end
 for bi=1,${bankCount} do for si=1,__bankExpected[bi] do local __poolIndex=__wsCanonicalBanks[bi][si];if __WSAT_type(__poolIndex)~="number" or __poolIndex%1~=0 or __poolIndex<1 or __poolIndex>${handlerList.length} then __WSAT_error("WSF_DIAG_BANK_MANIFEST",0) end end end
 for logical=1,${bankCount} do local active=bankPermutation[logical];${bankArrayName}[active]=__wsCanonicalBanks[logical] end
 __wsBankPermutation=bankPermutation

 -- Decode dispatch ciphertext into a fresh map. No decoded manifest array is
 -- retained between rotations.
 local nextDispatch={}
 local previous=${tagFnName}Keys[16]%256
 local previousCheck=${tagFnName}Keys[1]%256
 local b0,b1,b2,bId,sId=0,0,0,0,0
 local seenTags={};local records=0
 for i=1,#${dispatchBlobName} do
  local cipher=bit32.bxor(__WSAT_byte(${dispatchBlobName},i),__WSAT_byte(${dispatchBlobNameB},i))
  local k1=${tagFnName}Keys[((i-1)%16)+1];local k2=${tagFnName}Keys[((i+6)%16)+1]
  local mask=(k1+i*17+previous*3+bit32.bxor(k2,i*29))%256
  local plain=bit32.bxor(cipher,mask);previous=cipher
  local col=(i-1)%6
  if col==0 then b0=plain elseif col==1 then b1=plain elseif col==2 then b2=plain elseif col==3 then bId=plain elseif col==4 then sId=plain else
   records=records+1
   local check=plain;local tag=b0*65536+b1*256+b2
   local want=(b0*3+b1*5+b2*7+bId*11+sId*13+records*17+((b0*b1+b2*bId+sId*records)%251)+previousCheck*19)%256
   if check~=want or bId<1 or bId>${bankCount} or sId<1 or sId>(__bankExpected[bId] or 0) or seenTags[tag] then __WSAT_error("WSF_DIAG_DISPATCH_MANIFEST",0) end
   local activeBank=bankPermutation[bId]
   local bank=${bankArrayName}[activeBank];local poolIndex=bank and bank[sId]
   if __WSAT_type(poolIndex)~="number" or poolIndex%1~=0 or poolIndex<1 or poolIndex>${handlerList.length} then __WSAT_error("WSF_DIAG_INVALID_VM_HANDLER",0) end
   seenTags[tag]=true;nextDispatch[tag]=activeBank*256+sId;previousCheck=check
  end
 end
 if records~=${VM_OP_LIST.length+1} then __WSAT_error("WSF_DIAG_DISPATCH_MANIFEST",0) end
 ${dispatchName}=nextDispatch
end
local function __wsRotateDispatch()
 __wsDispatchRotation=__wsDispatchRotation+1
 if __wsDispatchRotation>=2147483647 then __wsDispatchRotation=1 end
 local cadenceState=bit32.bxor(__wsRotationSeed,__wsDispatchRotation,${bankManifestSeed})
 cadenceState=bit32.bxor(cadenceState,bit32.lshift(cadenceState,13));cadenceState=bit32.bxor(cadenceState,bit32.rshift(cadenceState,17));cadenceState=bit32.bxor(cadenceState,bit32.lshift(cadenceState,5))
 __wsRotationInterval=21+(cadenceState%47)
 __wsBuildDispatch(__wsDispatchRotation)
end
__wsBuildDispatch(__wsDispatchRotation)
__WSATRegisterCoreTable(${microLookupName});__WSATRegisterCoreTable(${bankArrayName})
for i=1,${bankCount} do __WSATRegisterCoreTable(__wsCanonicalBanks[i]) end
-- Only the immutable ordinal lookup is frozen. The bank pointer array and
-- dispatch snapshot are intentionally replaceable during bounded rotation.
if __WSAT_freeze then __WSAT_pcall(__WSAT_freeze,${microLookupName}) end
${microCallName}=function(callMode,a,b,c,bx,sbx)
 local fn,globalName,memberName
 if callMode==1 then
  globalName=${constResolveInline("bx")};fn=g[globalName]
  if fn==nil then __WSAT_error("WSF_DIAG_MISSING_GLOBAL_CALL: "..__WSAT_tostring(globalName),0) end
  if __WSAT_type(fn)~="function" then __WSAT_error("WSF_DIAG_GLOBAL_NOT_CALLABLE: "..__WSAT_tostring(globalName)..", type="..__WSAT_type(fn),0) end
 elseif callMode==2 or callMode==3 then
  globalName=${constResolveInline("bx")};memberName=${constResolveInline("sbx")};local obj=g[globalName]
  if obj==nil then __WSAT_error("WSF_DIAG_MISSING_GLOBAL_MEMBER: "..__WSAT_tostring(globalName).."."..__WSAT_tostring(memberName).." (global missing)",0) end
  if callMode==3 then R[a]=obj[memberName];return end
  fn=obj[memberName]
  if fn==nil then __WSAT_error("WSF_DIAG_MISSING_GLOBAL_MEMBER: "..__WSAT_tostring(globalName).."."..__WSAT_tostring(memberName),0) end
  if __WSAT_type(fn)~="function" then __WSAT_error("WSF_DIAG_MEMBER_NOT_CALLABLE: "..__WSAT_tostring(globalName).."."..__WSAT_tostring(memberName)..", type="..__WSAT_type(fn),0) end
 else fn=R[a] end
 if fn==nil then __WSAT_error("WSF_DIAG_NIL_CALL: pc="..__WSAT_tostring(pc)..", reg="..__WSAT_tostring(a),0) end
 if __WSAT_type(fn)~="function" then __WSAT_error("WSF_DIAG_REGISTER_NOT_CALLABLE: pc="..__WSAT_tostring(pc)..", reg="..__WSAT_tostring(a)..", type="..__WSAT_type(fn),0) end
 local n=(b==0 and (__top-a-1) or b-1);if n<0 then n=0 end
 local ar=table.create(n);for i=1,n do ar[i]=R[a+i] end
 local meta=__WSClosureMeta[fn];local callRec=nil
 if meta then
  callRec={callerProto=P,returnPC=pc,dest=a,expectedResults=c,argCount=n,state="calling",args={}}
  for ci=1,n do callRec.args[ci]=ar[ci] end
  __WSCallCount=__WSCallCount+1;__WSCallStack[__WSCallCount]=callRec;__WSPendingCall=callRec
 end
 if meta then __WSDirectCallProto=meta.proto end
 local ret
 if callMode~=2 and meta and __WSSchedulerActive then
  ret=table.pack(__WSAT_coroutineYield({tag=__WSCallRequest,frame={proto=meta.proto,upvalues=meta.upvalues,args=table.pack(table.unpack(ar,1,n)),returnPC=pc,dest=a,expectedResults=c}}))
 else ret=table.pack(fn(table.unpack(ar,1,n))) end
 __WSDirectCallProto=nil
 if callRec then callRec.state="returned";callRec.returnCount=ret.n;for ci=1,(callRec.argCount or 0) do callRec.args[ci]=nil end;callRec.args=nil;__WSCallStack[__WSCallCount]=nil;__WSCallCount=__WSCallCount-1 end
 for i=1,n do ar[i]=nil end;ar=nil
 local want=(c==0 and ret.n or c-1);if want<0 then want=0 end
 for i=1,want do R[a+i-1]=ret[i] end
 for i=want+1,math.max(n,1) do if i>1 then R[a+i-1]=nil end end
 __top=a+want
end
`;
  // Compact V8.2.14 dispatch separates the physical slot, masked pool index,
  // split-seed mini-op decode, and a per-instruction feedback-selected nonlinear
  // handler lane. Every layer remains client-observable and reversible.
  const compactDispatchSeed = (Math.floor(secureKeyFloat() * 4294967295) >>> 0) || 0x6D2B79F5;
  const compactIndexMask = (Math.floor(secureKeyFloat() * 4294967295) >>> 0) || 0xB5297A4D;
  // V8.2.44: the compact dispatcher no longer indexes one canonical
  // physical-slot table. It carries three independently permuted lookup lanes.
  // A state-derived route chooses the lane before the opcode slot is resolved.
  // Each lane uses a bijection over the prime-sized 0..250 domain, so every
  // live slot remains reachable exactly once without a linear search.
  const compactDispatchLanes = Array.from({ length: 3 }, () => ({
    mul: 1 + (secureKeyFloat() * 250 | 0),
    add: secureKeyFloat() * 251 | 0
  }));
  const compactDispatchMaps = compactDispatchLanes.map(() => new Map());
  const compactDispatchRowsByLane = compactDispatchLanes.map(() => []);
  for (const [physicalSlot, semantic] of slotSemantics) {
    const spec = semanticMicroSpec(semantic);
    const pair = semantic === '__HALT__' ? '1:0' : `${spec[0]}:${spec[1]}`;
    const h = handlerList.find(item => item.key === pair);
    if (!h || !Number.isInteger(h.programIndex) || h.programIndex < 1 || h.programIndex > programOrder.length) {
      throw new Error('Missing compact dispatch pool entry for ' + semantic);
    }
    const encodedIndex = (h.programIndex ^ compactIndexMask) >>> 0;
    for (let lane = 0; lane < compactDispatchLanes.length; lane++) {
      const transform = compactDispatchLanes[lane];
      const permutedSlot = (physicalSlot * transform.mul + transform.add) % 251;
      if (compactDispatchMaps[lane].has(permutedSlot)) {
        throw new Error('Compact dispatch lane permutation collision');
      }
      compactDispatchMaps[lane].set(permutedSlot, encodedIndex);
      compactDispatchRowsByLane[lane].push(`[${permutedSlot}]=${encodedIndex}`);
    }
  }
  const compactDispatchTablesLua = compactDispatchRowsByLane.map(rows => `{${rows.join(',')}}`).join(',');
  const compactDispatchMulLua = compactDispatchLanes.map(lane => lane.mul).join(',');
  const compactDispatchAddLua = compactDispatchLanes.map(lane => lane.add).join(',');
  const compactPoolValues = programOrder.map(h => ((h.microCode ^ compactDispatchSeed) >>> 0));
  const compactPoolName = microProgramPoolName;
  const compactExecAdapterName = makeVmLocal();
  const compactReadSlotName=makeVmLocal(),compactDecodeIndexName=makeVmLocal(),compactReadPoolName=makeVmLocal();
  const compactDispatchTablesName=makeVmLocal(),compactDispatchMulName=makeVmLocal(),compactDispatchAddName=makeVmLocal();
  const compactDecodeLoName=makeVmLocal(),compactDecodeHiName=makeVmLocal(),compactVerifyName=makeVmLocal();
  const compactFeedbackA = 17 + (secureKeyFloat() * 239 | 0);
  const compactFeedbackB = 17 + (secureKeyFloat() * 239 | 0);
  const compactFeedbackC = 17 + (secureKeyFloat() * 239 | 0);
  const compactFeedbackD = 17 + (secureKeyFloat() * 239 | 0);
  const compactFeedbackStateName=makeVmLocal(),compactFeedbackFnName=makeVmLocal();
  const compactFeedbackStateSeed=(Math.floor(secureKeyFloat()*4294967295)>>>0)||0x9E3779B9;
  const compactFeedbackStateMul=17+(secureKeyFloat()*239|0),compactFeedbackCross=3+(secureKeyFloat()*61|0);
  const compactFeedbackShiftA=5+(secureKeyFloat()*9|0),compactFeedbackShiftB=7+(secureKeyFloat()*11|0),compactFeedbackShiftC=3+(secureKeyFloat()*7|0);
  const compactFeedbackSlotMul=17+(secureKeyFloat()*239|0),compactFeedbackSalt=(Math.floor(secureKeyFloat()*4294967295)>>>0);
  const compactRouteStepMul=7+(secureKeyFloat()*241|0),compactRoutePcMul=11+(secureKeyFloat()*233|0);
  const compactRouteLastMul=13+(secureKeyFloat()*229|0),compactRouteStackMul=17+(secureKeyFloat()*223|0);
  const compactRouteSalt=(Math.floor(secureKeyFloat()*65521)>>>0),compactRouteShiftA=5+(secureKeyFloat()*9|0),compactRouteShiftB=7+(secureKeyFloat()*11|0);
  const compactSeedBytes=[compactDispatchSeed&255,(compactDispatchSeed>>>8)&255,(compactDispatchSeed>>>16)&255,(compactDispatchSeed>>>24)&255];
  const compactIndexBytes=[compactIndexMask&255,(compactIndexMask>>>8)&255,(compactIndexMask>>>16)&255,(compactIndexMask>>>24)&255];
  const compactSealSeed=(Math.floor(secureKeyFloat()*4294967295)>>>0)||0x243F6A88;
  let compactSeal=compactSealSeed>>>0;
  for(let lane=0;lane<3;lane++)for(let slot=0;slot<=250;slot++){
    const transform=compactDispatchLanes[lane];
    const key=(slot*transform.mul+transform.add)%251;
    const value=compactDispatchMaps[lane].get(key) ?? 0;
    compactSeal=(Math.imul(compactSeal,33)+value+(slot+1)*17+(lane+1)*31)>>>0;
  }
  for(let i=0;i<compactPoolValues.length;i++)compactSeal=(Math.imul(compactSeal,33)+compactPoolValues[i]+(i+1)*19)>>>0;
  const compactSealBytes=[compactSeal&255,(compactSeal>>>8)&255,(compactSeal>>>16)&255,(compactSeal>>>24)&255];
  const compactSeal2Seed=(Math.floor(secureKeyFloat()*4294967295)>>>0)||0xB7E15162;
  let compactSeal2=compactSeal2Seed>>>0;
  for(let lane=2;lane>=0;lane--)for(let slot=250;slot>=0;slot--){
    const transform=compactDispatchLanes[lane];
    const key=(slot*transform.mul+transform.add)%251;
    const value=compactDispatchMaps[lane].get(key) ?? 0;
    compactSeal2=(Math.imul(compactSeal2,65599)+value+(251-slot)*23+(lane+1)*29)>>>0;
  }
  for(let i=compactPoolValues.length-1;i>=0;i--)compactSeal2=(Math.imul(compactSeal2,65599)+compactPoolValues[i]+(i+1)*29)>>>0;
  const compactSeal2Bytes=[compactSeal2&255,(compactSeal2>>>8)&255,(compactSeal2>>>16)&255,(compactSeal2>>>24)&255];
  const compactCheckInterval=41+(secureKeyFloat()*43|0);
  const compactCallStart = fullMicroRuntime.indexOf(`${microCallName}=function(callMode`);
  const compactCallEnd = fullMicroRuntime.lastIndexOf('\nend\n');
  if (compactCallStart < 0 || compactCallEnd < compactCallStart) throw new Error('Unable to isolate VM call bridge for compact dispatch');
  const compactCallRuntime = fullMicroRuntime.slice(compactCallStart, compactCallEnd + 4) + '\n';
  const compactMicroRuntime = `local ${microCallName}
${microInterpreterDecl}
local ${compactPoolName}={${compactPoolValues.join(',')}}
local ${compactDispatchTablesName}={${compactDispatchTablesLua}}
local ${compactDispatchMulName}={${compactDispatchMulLua}};local ${compactDispatchAddName}={${compactDispatchAddLua}}
local __wsSeedParts={${compactSeedBytes.join(',')}};local __wsIndexParts={${compactIndexBytes.join(',')}};local __wsSealParts={${compactSealBytes.join(',')}};local __wsSeal2Parts={${compactSeal2Bytes.join(',')}}
local __wsDispatchSealSeed=${compactSealSeed};local __wsDispatchExpected=__wsSealParts[1]+__wsSealParts[2]*256+__wsSealParts[3]*65536+__wsSealParts[4]*16777216;local __wsDispatchSeal2Seed=${compactSeal2Seed};local __wsDispatchExpected2=__wsSeal2Parts[1]+__wsSeal2Parts[2]*256+__wsSeal2Parts[3]*65536+__wsSeal2Parts[4]*16777216
local function ${compactVerifyName}()
 local acc=__wsDispatchSealSeed;local acc2=__wsDispatchSeal2Seed;local totalCount=0;local poolCount=0
 for lane=1,3 do
  local map=${compactDispatchTablesName}[lane];local count=0;local mul=${compactDispatchMulName}[lane];local add=${compactDispatchAddName}[lane]
  if __WSAT_type(map)~='table' or __WSAT_type(mul)~='number' or mul%1~=0 or mul<1 or mul>250 or __WSAT_type(add)~='number' or add%1~=0 or add<0 or add>250 then return false end
  for k in __WSAT_next,map do if __WSAT_type(k)~='number' or k%1~=0 or k<0 or k>250 then return false end;count=count+1 end
  if count~=${slotSemantics.size} then return false end;totalCount=totalCount+count
  for slot=0,250 do local key=(slot*mul+add)%251;local v=map[key] or 0;if __WSAT_type(v)~='number' or v%1~=0 then return false end;acc=(acc*33+v+(slot+1)*17+lane*31)%4294967296 end
 end
 if totalCount~=${slotSemantics.size * 3} then return false end
 for k in __WSAT_next,${compactPoolName} do if __WSAT_type(k)~='number' or k%1~=0 or k<1 or k>${compactPoolValues.length} then return false end;poolCount=poolCount+1 end
 if poolCount~=${compactPoolValues.length} then return false end
 for i=1,${compactPoolValues.length} do local v=${compactPoolName}[i];if __WSAT_type(v)~='number' or v%1~=0 then return false end;acc=(acc*33+v+i*19)%4294967296 end
 for lane=3,1,-1 do
  local map=${compactDispatchTablesName}[lane];local mul=${compactDispatchMulName}[lane];local add=${compactDispatchAddName}[lane]
  for slot=250,0,-1 do local key=(slot*mul+add)%251;local v=map[key] or 0;acc2=(acc2*65599+v+(251-slot)*23+lane*29)%4294967296 end
 end
 for i=${compactPoolValues.length},1,-1 do local v=${compactPoolName}[i];acc2=(acc2*65599+v+i*29)%4294967296 end
 return acc==__wsDispatchExpected and acc2==__wsDispatchExpected2
end
if not ${compactVerifyName}() then __WSATFailIntegrity() end
if __WSAT_freeze then for lane=1,3 do __WSAT_pcall(__WSAT_freeze,${compactDispatchTablesName}[lane]) end;__WSAT_pcall(__WSAT_freeze,${compactDispatchTablesName});__WSAT_pcall(__WSAT_freeze,${compactPoolName}) end
local function ${compactReadSlotName}(lane,slot)if lane<1 or lane>3 or slot<0 or slot>250 or slot%1~=0 then __WSATFailDispatch() end;local key=(slot*${compactDispatchMulName}[lane]+${compactDispatchAddName}[lane])%251;return ${compactDispatchTablesName}[lane][key] end
local function ${compactDecodeIndexName}(encoded)return bit32.bxor(bit32.bxor(encoded,__wsIndexParts[1]+__wsIndexParts[2]*256),__wsIndexParts[3]*65536+__wsIndexParts[4]*16777216) end
local function ${compactReadPoolName}(index)return ${compactPoolName}[index] end
local function ${compactDecodeLoName}(word)return bit32.bxor(word,__wsSeedParts[1]+__wsSeedParts[2]*256) end
local function ${compactDecodeHiName}(word)return bit32.bxor(word,__wsSeedParts[3]*65536+__wsSeedParts[4]*16777216) end
local __wsDispatchTick=0;local __wsNextSeal=${compactCheckInterval};local ${compactFeedbackStateName}=${compactFeedbackStateSeed}
local function ${compactFeedbackFnName}(p,last,stack,slot)local q=(${compactFeedbackStateName}*${compactFeedbackStateMul}+p*${compactFeedbackA}+last*${compactFeedbackB}+stack*${compactFeedbackC}+slot*${compactFeedbackD})%4294967296;${compactFeedbackStateName}=q;local mix=bit32.bxor(q,bit32.lshift(q,${compactFeedbackShiftA}));mix=bit32.bxor(mix,bit32.rshift(mix,${compactFeedbackShiftB}));mix=bit32.bxor(mix,bit32.lshift(mix,${compactFeedbackShiftC}));return bit32.bxor(mix,slot*${compactFeedbackSlotMul},(p%251)*(stack%251)*${compactFeedbackCross},${compactFeedbackSalt}) end
local function ${compactExecAdapterName}(encoded,a,b,c,bx,sbx,feedback,slot,route)if route<0 or route>2 or __WSAT_type(feedback)~='number' or feedback%1~=0 or __WSAT_type(slot)~='number' or slot%1~=0 or slot<0 or slot>250 then __WSATFailDispatch() end;local stage=${compactDecodeLoName}(encoded);local code=${compactDecodeHiName}(stage);return ${microExecName}(code,a,b,c,bx,sbx,route) end
${compactCallRuntime}`;
  const microRuntime = runtimeSize === "full" ? (runtimeSaltLua + fullMicroRuntime) : (runtimeSaltLua + compactMicroRuntime.replaceAll("__WSATFailIntegrity()", "__WSATFailDispatch()"));
  // Restore the opcode decoder/cache and frame guard removed with the old H[]
  // handlers. Both helpers are still referenced by the VM loop; omitting either
  // produces a runtime nil-function call at the first instruction.
  engine = engine.slice(0, handlerBlockStart) + microRuntime + "\n" + opcodeHelperBlock + engine.slice(handlerBlockEnd);
  // Compact mode omits identity-seal scaffolding; full mode retains it. These catch
  // simple rebinding, but not in-place hookfunction patching that preserves identity.
  const coreSealBlock = runtimeSize === "full" ? `local __wsCoreSealWord=D
local __wsCoreSealMap=${instructionMapReaderName}
local __wsCoreSealOpcode=${opcodeResolverName}
local __wsCoreSealMini=${microExecName}
local __wsCoreSealTag=${tagFnName}
local __wsCoreSealBuild=__wsBuildDispatch
local __wsCoreSealRotate=__wsRotateDispatch
` : "";
  if (coreSealBlock) engine = engine.replace('local __lastOp=0;', coreSealBlock + 'local __lastOp=0;');
  const sealCheck = runtimeSize === "full" ? `if not __WSAT_rawequal(D,__wsCoreSealWord)
  or not __WSAT_rawequal(${instructionMapReaderName},__wsCoreSealMap)
  or not __WSAT_rawequal(${opcodeResolverName},__wsCoreSealOpcode)
  or not __WSAT_rawequal(${microExecName},__wsCoreSealMini)
  or not __WSAT_rawequal(${tagFnName},__wsCoreSealTag)
  or not __WSAT_rawequal(__wsBuildDispatch,__wsCoreSealBuild)
  or not __WSAT_rawequal(__wsRotateDispatch,__wsCoreSealRotate) then
  __WSATFailIntegrity()
 end;` : "";
  const periodicNeedle = `if __steps%${integrityInterval}==0 then __WSATCheck(__frameCoroutine);`;
  if (sealCheck) engine = engine.replace(periodicNeedle, `if __steps%${integrityInterval}==0 then ${sealCheck} __WSATCheck(__frameCoroutine);`);

  const fullDispatchCall = `__wsDispatchEpoch=__wsDispatchEpoch+1
if __wsDispatchEpoch%__wsRotationInterval==0 then __wsRotateDispatch() end
local __wsDispatchTag=${tagFnName}(__dispatchOp)
local __wsDispatchCode=${dispatchName}[__wsDispatchTag]
if __WSAT_type(__wsDispatchCode)~="number" then __WSAT_error("WSF_DIAG_INVALID_VM_HANDLER",0) end
local __wsBankId=__WSAT_floor(__wsDispatchCode/256)
local __wsBankSlot=__wsDispatchCode%256
local __wsBank=${bankArrayName}[__wsBankId]
local __wsPoolIndex=__wsBank and __wsBank[__wsBankSlot]
local __wsMiniCode=${microProgramPoolName}[__wsPoolIndex]
if __WSAT_type(__wsMiniCode)~="number" or __wsMiniCode%1~=0 then __WSAT_error("WSF_DIAG_INVALID_VM_HANDLER",0) end
local __wsRoute=(__dispatchOp+__steps*13+__wsDispatchRotation)%3
if __wsRoute==0 then
 ${microExecName}(__wsMiniCode,a,b,c,bx,sbx,__wsRoute)
elseif __wsRoute==1 then
 local __wsRun=${microExecName};__wsRun(__wsMiniCode,a,b,c,bx,sbx,__wsRoute);__wsRun=nil
else
 (${microExecName})(__wsMiniCode,a,b,c,bx,sbx,__wsRoute)
end
__wsMiniCode=nil;__wsPoolIndex=nil;__wsBank=nil;__wsDispatchCode=nil;__wsDispatchTag=nil`;
  const compactDispatchCall = `__wsDispatchTick=__wsDispatchTick+1;local __wsFeedback=${compactFeedbackFnName}(pc,__lastOp,sp,__dispatchOp);local __wsProbeMix=bit32.bxor(__wsFeedback,bit32.lshift(__wsFeedback,${compactRouteShiftA}));__wsProbeMix=bit32.bxor(__wsProbeMix,bit32.rshift(__wsProbeMix,${compactRouteShiftB}));local __wsProbeGate=(__wsProbeMix+__wsDispatchTick*${compactRouteStepMul}+pc*${compactRoutePcMul}+sp*${compactRouteStackMul}+${compactRouteSalt}+(__wsRuntimeSalt%251))%13;if __wsDispatchTick>=__wsNextSeal or __wsProbeGate==0 then if not ${compactVerifyName}() then __WSATFailDispatch() end;__wsNextSeal=__wsDispatchTick+${compactCheckInterval}+((__wsProbeMix+__lastOp*${compactRouteLastMul})%${compactCheckInterval}) end;local __wsRoute=(__wsProbeMix+__wsDispatchTick*${compactRouteStepMul}+pc*${compactRoutePcMul}+__lastOp*${compactRouteLastMul}+sp*${compactRouteStackMul}+${compactRouteSalt}+(__wsRuntimeSalt%251))%3;local __wsLane=__wsRoute+1;local __wsSlotValue=${compactReadSlotName}(__wsLane,__dispatchOp);if __WSAT_type(__wsSlotValue)~="number" or __wsSlotValue%1~=0 then __WSATFailDispatch() end;local __wsPoolIndex=${compactDecodeIndexName}(__wsSlotValue);if __wsPoolIndex<1 or __wsPoolIndex>#${compactPoolName} then __WSATFailDispatch() end;local __wsEncoded=${compactReadPoolName}(__wsPoolIndex);if __WSAT_type(__wsEncoded)~="number" or __wsEncoded%1~=0 then __WSATFailDispatch() end;${compactExecAdapterName}(__wsEncoded,a,b,c,bx,sbx,__wsFeedback,__dispatchOp,__wsRoute);__wsPoolIndex=nil;__wsEncoded=nil;__wsSlotValue=nil;__wsProbeMix=nil;__wsRoute=nil;__wsLane=nil`;
  const selectedDispatchCall = runtimeSize === "full" ? fullDispatchCall : compactDispatchCall;
  const dispatchStageBody = selectedDispatchCall.replaceAll("__dispatchOp", dispatchOpcodeParam);
  const dispatchStageDefinition = `local function ${dispatchStageName}(${dispatchOpcodeParam},a,b,c,bx,sbx)\n${dispatchStageBody}\nend\n`;
  const fetchStageDefinition = `local function ${fetchStageName}(__logicalPc) local __wordpc=${instructionMapReaderName}(P,__logicalPc);if type(__wordpc)~="number" or __wordpc<1 or __wordpc>${decodedCacheName}ount then error("Invalid instruction map",0) end;local ${encodedOpName}=D(__wordpc);if ${encodedOpName}<0 then ${encodedOpName}=${encodedOpName}+4294967296 end;local __decodedOpcode=${opcodeResolverName}(${encodedOpName});if type(__decodedOpcode)~="number" or __decodedOpcode<1 or __decodedOpcode>250 then error("Invalid sparse opcode record",0) end;local a,b,c,bx,sbx=0,0,0,0,0;local __oprd=__wordpc+1;local op=__decodedOpcode;${operandDecode};return op,a,b,c,bx,sbx end\n`;
  engine = engine.replace("while not done and", fetchStageDefinition + dispatchStageDefinition + "while not done and");
  engine = engine.replace(/\$\{fields\.([nmkcpuvos])\}/g, (_, key) => fields[key]);
  engine = engine.replace(/\$\{layout\[(\d+)\]\}/g, (_, index) => String(layout[Number(index)]));
  // Rename VM internals per output. This is paired with randomized data-field names below;
  // it is intended to remove stable signatures, not to claim that reverse engineering is impossible.
  const identifierRenames = new Map(Object.entries(names));
  // Rename identifier tokens only. The previous global regex also rewrote words
  // inside quoted diagnostics (for example the "op" inside "micro-op"), which
  // silently corrupted error messages in generated Luau artifacts.
  engine = engine.replace(/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|--\[\[[\s\S]*?\]\]|--[^\r\n]*|[A-Za-z_][A-Za-z0-9_]*)/g, token => {
    if (token.startsWith('"') || token.startsWith("'") || token.startsWith("--")) return token;
    return identifierRenames.get(token) || token;
  });
  // Replace categorized failure markers with build-distributed local endpoints.
  // The coroutine scheduler only forwards ordinary errors and never translates
  // private token objects.
  engine = engine.replace(/(?:__WSAT_)?error\(__WSATFailIntegrity\(\),0\)/g, "__WSATFailIntegrity()");
  engine = engine.replace(/(?:__WSAT_)?error\("WSF_DIAG_(?:PROTO|OPERAND|BYTECODE|INSTRUCTION|CONSTANT_INDEX|CONSTANT_BOUNDS|KEY_PROFILE|FRAME_STATE|PC_RANGE)[^"\n]*?",0\)/g, "__WSATFailStructure()");
  engine = engine.replace(/(?:__WSAT_)?error\("WSF_DIAG_(?:DISPATCH|BANK|INVALID_VM_HANDLER|OPCODE_MAP|OPCODE_RECORD)[^"\n]*?",0\)/g, "__WSATFailDispatch()");
  engine = engine.replace(/(?:__WSAT_)?error\("WSF_DIAG_[^"\n]*?",0\)/g, "__WSATFailIntegrity()");
  const internalGuardErrors = [
    "Invalid operand map index", "Invalid operand order", "Invalid operand field",
    "Invalid constant bucket", "Invalid constant tree index", "Invalid constant record",
    "Invalid bytecode word index", "Invalid instruction map", "Invalid sparse opcode record"
  ];
  for (const message of internalGuardErrors) {
    engine = engine.replaceAll(`error("${message}",0)`, "__WSATFailIntegrity()");
    engine = engine.replaceAll(`__WSAT_error("${message}",0)`, "__WSATFailIntegrity()");
  }
  // Spread each category over three distinct local error endpoints. A coprime
  // stride gives balanced use while the build-random start/stride changes the
  // call-site assignment between outputs.
  for (const [kind, marker] of [
    ["Integrity", "__WSATFailIntegrity()"],
    ["Structure", "__WSATFailStructure()"],
    ["Dispatch", "__WSATFailDispatch()"],
    ["Probe", "__WSATFailProbe()"]
  ]) {
    const handlers = failureHandlerPools[kind];
    const start = secureRandomFloat() * handlers.length | 0;
    const stride = (secureRandomFloat() < 0.5 ? 1 : 2);
    let site = 0;
    engine = engine.replaceAll(marker, () => {
      const handler = handlers[(start + site * stride) % handlers.length];
      // Emit only parser-straightforward statement forms. The former randomized
      // parenthesized-call/table-call variants were unnecessary and made malformed
      // statement boundaries harder to diagnose in generated Luau.
      site++;
      if ((site + start) % 2 === 0) return `${handler}()`;
      const invoke = failureInvokeName();
      return `do local ${invoke}=${handler};${invoke}() end`;
    });
  }
  engine = __wsHideGeneratedVmDiagnostics(engine, vmDebug === true);
  if (integrityPolicy === "strict") {
    // Hide runtime error text without changing its fail-closed behavior. Simple
    // literal errors and diagnostic prefixes become build-random byte expressions.
    engine = engine.replace(/((?:__WSAT_)?error)\("((?:\\.|[^"\\])*)",0\)/g,
      (_, fn, message) => `${fn}(${luaEscapedString(message)},0)`);
    engine = engine.replace(/"(WSF_DIAG_[^"]*)"/g, (_, message) => luaEscapedString(message));
    engine = engine.replace(/(?:__WSAT_)?error\("WSF_INTEGRITY_FAILED",0\)/g, "__WSATFailIntegrity()");
  }
  engine = engine.replace("__DISPATCH_TREE_CALL__", buildVmDispatchTree(opMap, names, handlerMap));
  // Repair a known malformed guard boundary emitted by older failure-call
  // substitution paths: `then _randomName local _invoke=...` is not Luau.
  // The bare identifier has no valid statement position here; restore the
  // intended block opener before the local invocation statement.
  engine = engine.replace(/\bthen\s+_[A-Za-z][A-Za-z0-9_]*\s+(?=local\s+_[A-Za-z][A-Za-z0-9_]*\s*=)/g, "then do ");
  if (/\bthen\s+_[A-Za-z][A-Za-z0-9_]*\s+local\s+_[A-Za-z][A-Za-z0-9_]*\s*=/.test(engine)) {
    throw new Error("VM emitter retained malformed then/local guard syntax");
  }
  if (/\(function\(__f\)return __f\(\) end\)\(/.test(engine) || /\(\{\[\d+\]=/.test(engine)) {
    throw new Error("VM emitter retained a noncanonical failure-call shape");
  }
  /* BUGFIX: drop comment-only template lines BEFORE collapsing to one line. Otherwise a
     "--" comment swallowed all the code after it, and the VM output was unusable. */
  engine = engine.replaceAll("__WSFrameSerial", frameSerialName).replaceAll("__WSSchedulerActive", schedulerActiveName);
  if (!integrityFn) {
    // The VM still keeps structural bounds/shape validation, but it does not emit
    // the unused rolling ledgers or per-frame ledger assertions in reduced mode.
    const a = engine.indexOf('local function __WSIntegrityAssert()');
    const b = engine.indexOf('if not __rootIntegrity then', a);
    if (a >= 0 && b > a) engine = engine.slice(0, a) + engine.slice(b);
    // The compact micro-runtime may rename the local ledger values before this cleanup.
    // Anchor on the stable ledger write instead of a temporary local identifier.
    const rs = engine.indexOf('__WSIntegrityRing[__WSIntegrityCursor]=');
    const reMarker = '__WSIntegrityCursor=__WSIntegrityCursor%32+1';
    const re = engine.indexOf(reMarker, rs);
    if (rs >= 0 && re > rs) {
      const end = engine.indexOf('\n', re);
      engine = engine.slice(0, rs) + engine.slice(end >= 0 ? end + 1 : re + reMarker.length);
    }
    const stateStart = engine.indexOf('-- Runtime consistency telemetry');
    const stateEnd = engine.indexOf('local __WSAT_type', stateStart);
    if (stateStart >= 0 && stateEnd > stateStart) engine = engine.slice(0, stateStart) + engine.slice(stateEnd);
    // No integrity/anti-hook features are active in this profile, so omit their
    // otherwise unreachable helper closures, thread sentinels, and snapshots.
    const registryStart = engine.indexOf('local __WSATCoreTableRegistry={}');
    const bufferMarker = engine.indexOf('-- Capture the buffer API once.', registryStart);
    if (registryStart >= 0 && bufferMarker > registryStart) {
      // Reduced-integrity builds remove the reflection registry and its checks,
      // but decoder/dispatch setup still emits registration calls. Keep a local
      // no-op registrar so those optional diagnostics cannot become a nil call.
      // Insert before portableVmChunk mangles __WSAT names so declaration and
      // call sites receive the same randomized identifier.
      engine = engine.slice(0, registryStart) +
        'local function __WSATRegisterCoreTable(value) return value end\n' +
        engine.slice(bufferMarker);
    }
    const checkStart = engine.indexOf('local function __WSATCheck(expectedThread)');
    const checkMarker = engine.indexOf('-- Integrity failures call the captured error primitive directly.', checkStart);
    if (checkStart >= 0 && checkMarker > checkStart) engine = engine.slice(0, checkStart) + engine.slice(checkMarker);
    engine = engine.replace(/local __WSAT_task=task\nlocal __WSAT_taskSpawn=task and __WSAT_task\.spawn\nlocal __WSAT_debug=debug\nlocal __WSAT_debugPresentAtBootstrap=\(debug~=nil\)\nlocal __WSAT_xpcall=xpcall\nlocal __WSAT_getfenv,__WSAT_setfenv=getfenv,setfenv\n/g, 'local __WSAT_xpcall=xpcall\n');
    // Retain coroutine identity/API captures: VM frame ownership and scheduler fallback use them.\n    engine = engine.replace('local __WSAT_rawget,__WSAT_rawset=rawget,rawset\n', '');
    engine = engine.replace('local __WSAT_getmetatable,__WSAT_setmetatable=getmetatable,setmetatable\n', 'local __WSAT_setmetatable=setmetatable\n');
    engine = engine.replace('local __WSAT_table=table;local __WSAT_freeze=table and table.freeze\n', '');
    engine = engine.replace('local __WSAT_buffer=__buf\n', '');
    // Keep frame-owner initialization and its nil guard in reduced-integrity builds.
    engine = engine.replace('local __rootIntegrity=nil;local __integrityTick=0\n', '');
    engine = engine.replace('if not __rootIntegrity then __rootIntegrity=P end\n', '');
  }
  const noComments = engine.split("\n").filter(l => !l.trim().startsWith("--")).join("\n");
  // Never flatten VM source with a raw whitespace regex: it can merge tokens and
  // can turn an inline `--` comment into a comment that consumes the rest of the VM.
  // Use the same string/comment-aware lexical compactor as the final output stage.
  return compactLuaSingleLine(stripComments(noComments));
}

// Larger inert padding for VM output. Every block is locally scoped and only
// computes disposable values; it does not touch globals, VM state, or user data.
// Construct and validate a basic-block CFG from the compiler bytecode. Branch
// offsets are retained exactly; this pass does not reorder instructions or alter
// Lua/Luau lexical semantics. Leaders are entry, branch targets, and fallthroughs.
function validateVmCFG(proto, profile = "balanced", depth = 0) {
  if (!proto || !Array.isArray(proto.code) || depth > 128) throw new Error("Invalid VM CFG prototype");
  const code = proto.code, n = code.length, leaders = new Set(n ? [0] : []);
  const branchOps = new Set(["JMP", "JMPIF", "JMPIFNOT", "FORPREP", "FORLOOP", "TFORLOOP"]);
  const terminalOps = new Set(["RETURN"]);
  for (let i = 0; i < n; i++) {
    const ins = code[i];
    if (!ins || typeof ins.op !== "string") throw new Error("Malformed VM CFG instruction " + i);
    if (branchOps.has(ins.op)) {
      const off = Number(ins.sbx || 0);
      if (!Number.isInteger(off)) throw new Error("Invalid CFG branch offset at " + i);
      const target = i + 1 + off;
      if (target < 0 || target > n) throw new Error("CFG branch target out of range at " + i);
      if (target < n) leaders.add(target);
      if (i + 1 < n) leaders.add(i + 1);
    } else if (terminalOps.has(ins.op) && i + 1 < n) leaders.add(i + 1);
  }
  const starts = [...leaders].sort((a,b) => a-b), blocks = [];
  for (let j = 0; j < starts.length; j++) {
    const start = starts[j], end = (starts[j+1] ?? n) - 1;
    if (end < start) continue;
    const last = code[end], succ = [];
    if (branchOps.has(last.op)) {
      const target = end + 1 + Number(last.sbx || 0);
      if (target < n) succ.push(target);
      if (["JMPIF", "JMPIFNOT", "FORPREP", "FORLOOP", "TFORLOOP"].includes(last.op) && end + 1 < n) succ.push(end + 1);
    } else if (!terminalOps.has(last.op) && end + 1 < n) succ.push(end + 1);
    blocks.push({ id: blocks.length, start, end, successors: [...new Set(succ)] });
  }
  // The graph is retained as build-time metadata for validation/diagnostics only.
  // Hardened mode requires every successor to land on a known basic-block leader.
  if (profile === "hardened") {
    const leaderSet = new Set(starts);
    for (const b of blocks) for (const target of b.successors) {
      if (!leaderSet.has(target)) throw new Error("CFG successor is not a basic-block leader: " + target);
    }
  }
  proto._cfg = blocks;
  for (const child of (proto.protos || [])) validateVmCFG(child, profile, depth + 1);
  return proto;
}

// Semantic operand validation catches malformed compiler output before serialization.
function validateVmProtoOperands(proto, depth = 0) {
  if (!proto || typeof proto !== "object" || depth > 128) throw new Error("Invalid VM prototype while validating operands");
  const code = proto.code || [], consts = proto.consts || [], protos = proto.protos || [], upvals = proto.upvals || [];
  const maxstack = Number(proto.maxstack);
  if (!Number.isInteger(maxstack) || maxstack < 1 || maxstack > 65535) throw new Error("Invalid VM maxstack: " + proto.maxstack);
  const reg = (v, label, pc) => { if (!Number.isInteger(v) || v < 0 || v >= maxstack) throw new Error("VM register " + label + " out of range at instruction " + pc + ": " + v); };
  const range = (start, end, label, pc) => { reg(start, label, pc); reg(end, label, pc); if (end < start) throw new Error("Invalid register range " + label + " at instruction " + pc); };
  const constant = (v, label, pc) => { if (!Number.isInteger(v) || v < 0 || v >= consts.length) throw new Error("VM constant " + label + " out of range at instruction " + pc + ": " + v); };
  for (let pc = 0; pc < code.length; pc++) {
    const i = code[pc], a = i.a ?? 0, b = i.b ?? 0, c = i.c ?? 0, bx = i.bx ?? 0, sbx = i.sbx ?? 0;
    switch (i.op) {
      case "LOADNIL": range(a, b, "a..b", pc); break;
      case "LOADBOOL": case "NEWTABLE": case "VARARG": reg(a, "a", pc); if (i.op === "VARARG" && b > 1) reg(a + b - 2, "vararg end", pc); break;
      case "STATEPRED": reg(a, "a", pc); break;
      case "NOP": break;
      case "LOADK": reg(a, "a", pc); constant(bx, "bx", pc); break;
      case "MOVE": reg(a, "a", pc); reg(b, "b", pc); break;
      case "GETGLOBAL": case "SETGLOBAL": reg(a, "a", pc); constant(bx, "bx", pc); break;
      case "GETUPVAL": case "SETUPVAL": reg(a, "a", pc); if (!Number.isInteger(b) || b < 0 || b >= upvals.length) throw new Error("VM upvalue index out of range at instruction " + pc + ": " + b); break;
      case "GETTABLE": reg(a, "a", pc); reg(b, "b", pc); if (i.ckey) constant(c, "c", pc); else reg(c, "c", pc); break;
      case "SETTABLE": reg(a, "a", pc); if (i.bkey) constant(b, "b", pc); else reg(b, "b", pc); reg(c, "c", pc); break;
      case "CALL": reg(a, "a", pc); if (b > 0) reg(a + b - 1, "call args end", pc); if (c > 1) reg(a + c - 2, "call results end", pc); break;
      case "RETURN": reg(a, "a", pc); if (b > 1) reg(a + b - 2, "return end", pc); break;
      case "CLOSURE": reg(a, "a", pc); if (!Number.isInteger(bx) || bx < 0 || bx >= protos.length) throw new Error("VM child prototype index out of range at instruction " + pc + ": " + bx); break;
      case "JMP": break;
      case "JMPIF": case "JMPIFNOT": reg(a, "a", pc); break;
      case "UNM": case "NOT": case "LEN": case "BNOT": reg(a, "a", pc); reg(b, "b", pc); break;
      case "FORPREP": case "FORLOOP": range(a, a + 3, "for registers", pc); break;
      case "TFORLOOP": range(a, a + 2 + Math.max(1, c), "generic-for registers", pc); break;
      case "MATHCLAMP": reg(a, "a", pc); reg(b, "b", pc); reg(c, "c", pc); reg(bx, "bx", pc); break;
      case "MATHFLOOR": case "MATHCEIL": case "MATHABS": case "MATHSQRT": reg(a, "a", pc); reg(b, "b", pc); break;
      case "MATHMIN": case "MATHMAX": case "BOR": case "BAND": case "BXOR": case "SHL": case "SHR":
      case "ADD": case "SUB": case "MUL": case "DIV": case "MOD": case "POW": case "IDIV": case "CONCAT":
      case "CMPEQ": case "CMPNE": case "CMPLT": case "CMPLE": case "CMPGT": case "CMPGE":
      case "FUSED_MOVE_ADD": case "FUSED_MOVE_SUB": case "FUSED_MOVE_MUL": case "FUSED_MOVE_DIV":
        reg(a, "a", pc); reg(b, "b", pc); reg(c, "c", pc); break;
      case "FUSED_GETTABLE_ADD_SETTABLE": reg(a, "a", pc); reg(b, "b", pc); reg(c, "c", pc); reg(bx, "bx", pc); break;
      case "FUSED_GETGLOBAL_CALL": constant(bx, "bx", pc); reg(a, "a", pc); if (b > 0) reg(a + b - 1, "call args end", pc); if (c > 1) reg(a + c - 2, "call results end", pc); break;
      case "FUSED_GLOBAL_MEMBER_CALL": constant(bx, "global constant", pc); constant(sbx, "member constant", pc); reg(a, "a", pc); if (b > 0) reg(a + b - 1, "call args end", pc); if (c > 1) reg(a + c - 2, "call results end", pc); break;
      case "FUSED_GLOBAL_MEMBER_LOOKUP": constant(bx, "global constant", pc); constant(sbx, "member constant", pc); reg(a, "a", pc); break;
      default: throw new Error("VM operand validation does not recognize opcode " + i.op);
    }
  }
  for (const child of protos) {
    for (const u of child.upvals || []) {
      const inStack = Array.isArray(u) ? u[0] === 1 : !!u.inStack;
      const idx = Number(Array.isArray(u) ? u[1] : u.idx);
      const limit = inStack ? maxstack : upvals.length;
      if (!Number.isInteger(idx) || idx < 0 || idx >= limit) throw new Error("Invalid child upvalue descriptor: " + idx);
    }
    validateVmProtoOperands(child, depth + 1);
  }
  return proto;
}

/* Repair compiler maxstack under-reporting before semantic operand validation.
   The bytecode emitter can legally address a destination register that was not
   included in fs.maxstack (notably when compileExprInto receives an explicit
   destination register). Recompute the required frame size from opcode operands;
   do not rewrite instruction operands or alter register allocation. */
function repairVmProtoMaxstack(proto, depth = 0) {
  if (!proto || typeof proto !== "object" || depth > 128) {
    throw new Error("Invalid VM prototype while repairing maxstack");
  }
  const code = Array.isArray(proto.code) ? proto.code : [];
  let highest = Math.max(-1, Number.isInteger(proto.numparams) ? proto.numparams - 1 : -1);
  const use = value => {
    if (!Number.isInteger(value) || value < 0 || value > 65534) {
      throw new Error("Invalid register operand while repairing maxstack: " + value);
    }
    if (value > highest) highest = value;
  };
  const span = (start, end) => { use(start); use(end); };
  for (const ins of code) {
    if (!ins || typeof ins.op !== "string") continue;
    const a = ins.a ?? 0, b = ins.b ?? 0, c = ins.c ?? 0, bx = ins.bx ?? 0;
    switch (ins.op) {
      case "LOADNIL": span(a, b); break;
      case "LOADBOOL": case "NEWTABLE": case "VARARG": use(a); if (ins.op === "VARARG" && b > 1) use(a + b - 2); break;
      case "STATEPRED": use(a); break;
      case "NOP": break;
      case "LOADK": case "GETGLOBAL": case "SETGLOBAL": case "GETUPVAL": case "SETUPVAL":
      case "CLOSURE": case "JMPIF": case "JMPIFNOT": use(a); break;
      case "MOVE": use(a); use(b); break;
      case "GETTABLE": use(a); use(b); if (!ins.ckey) use(c); break;
      case "SETTABLE": use(a); if (!ins.bkey) use(b); use(c); break;
      case "CALL":
        use(a); if (b > 0) use(a + b - 1); if (c > 1) use(a + c - 2); break;
      case "RETURN": use(a); if (b > 1) use(a + b - 2); break;
      case "FORPREP": case "FORLOOP": span(a, a + 3); break;
      case "TFORLOOP": span(a, a + 2 + Math.max(1, c)); break;
      case "UNM": case "NOT": case "LEN": case "BNOT":
      case "MATHFLOOR": case "MATHCEIL": case "MATHABS": case "MATHSQRT":
        use(a); use(b); break;
      case "MATHCLAMP": use(a); use(b); use(c); use(bx); break;
      case "MATHMIN": case "MATHMAX": case "BOR": case "BAND": case "BXOR": case "SHL": case "SHR":
      case "ADD": case "SUB": case "MUL": case "DIV": case "MOD": case "POW": case "IDIV": case "CONCAT":
      case "CMPEQ": case "CMPNE": case "CMPLT": case "CMPLE": case "CMPGT": case "CMPGE":
      case "FUSED_MOVE_ADD": case "FUSED_MOVE_SUB": case "FUSED_MOVE_MUL": case "FUSED_MOVE_DIV":
        use(a); use(b); use(c); break;
      case "FUSED_GETTABLE_ADD_SETTABLE": use(a); use(b); use(c); use(bx); break;
      case "FUSED_GETGLOBAL_CALL": use(a); if (b > 0) use(a + b - 1); if (c > 1) use(a + c - 2); break;
      case "FUSED_GLOBAL_MEMBER_CALL": use(a); if (b > 0) use(a + b - 1); if (c > 1) use(a + c - 2); break;
      case "FUSED_GLOBAL_MEMBER_LOOKUP": use(a); break;
      case "JMP": break;
      default: break;
    }
  }
  // Captured parent locals also occupy slots in this prototype's frame.
  for (const child of (proto.protos || [])) {
    for (const u of (child && child.upvals) || []) {
      const inStack = Array.isArray(u) ? u[0] === 1 : !!u.inStack;
      if (inStack) use(Number(Array.isArray(u) ? u[1] : u.idx));
    }
  }
  const required = Math.max(1, highest + 1);
  const declared = Number(proto.maxstack);
  proto.maxstack = Math.max(Number.isInteger(declared) && declared > 0 ? declared : 1, required);
  if (proto.maxstack > 65535) throw new Error("VM maxstack exceeds supported limit: " + proto.maxstack);
  for (const child of (proto.protos || [])) repairVmProtoMaxstack(child, depth + 1);
  return proto;
}

// Lightweight build-time IR gate. This is intentionally conservative: it keeps
// the compiler's instruction semantics and control-flow offsets intact, checks
// opcode/operand shape, and clones the proto tree before optimization so preview
// and debug paths are not mutated as a side effect of an obfuscation build.
function prepareVmIR(root, profile = "balanced") {
  const allowed = new Set(VM_OP_LIST.filter(op => !op.startsWith("FUSED_")));
  function cloneProto(p, depth) {
    if (!p || typeof p !== "object" || depth > 128) throw new Error("Invalid bytecode IR prototype tree");
    const code = (p.code || []).map((ins, index) => {
      if (!ins || typeof ins.op !== "string" || !allowed.has(ins.op)) {
        throw new Error("Invalid bytecode IR instruction at " + index + ": " + (ins && ins.op));
      }
      const out = { ...ins };
      for (const k of ["a","b","c","bx","sbx"]) {
        if (out[k] !== undefined && (!Number.isFinite(Number(out[k])) || !Number.isInteger(Number(out[k])))) {
          throw new Error("Invalid bytecode IR operand " + k + " at " + index);
        }
      }
      return out;
    });
    const q = { ...p, code, consts: (p.consts || []).map(c => c && typeof c === "object" ? { ...c } : c),
      upvals: (p.upvals || []).map(u => Array.isArray(u) ? u.slice() : u),
      protos: (p.protos || []).map(child => cloneProto(child, depth + 1)) };
    return q;
  }
  const ir = cloneProto(root, 0);
  // Correct under-reported frame sizes before operand-range validation.
  repairVmProtoMaxstack(ir);
  shufflePureVmOperands(ir, profile);
  const opcodeHotspots = profileVmOpcodeHotspots(ir);
  ir._opcodeHotspots = opcodeHotspots;
  validateVmProtoOperands(ir);
  validateVmCFG(ir, profile);
  // Profile-aware superinstruction scheduling: the same semantics-preserving
  // fuser receives a build-local ordering hint so hardened builds prioritize
  // multi-operation patterns, balanced builds prioritize call/global patterns,
  // and compact builds avoid fusion when the output overhead would dominate.
  ir._fusionProfile = profile;
  ir._opcodeHotspots = opcodeHotspots;
  const optimized = fuseSafeSuperinstructions(ir);
  delete optimized._fusionProfile;
  delete optimized._opcodeHotspots;
  applyIRControlFlowObfuscation(optimized, profile);
  // V8.2.18 state-machine pass: all non-compact profiles permute basic blocks.
  // Every relative edge is relocated and revalidated before serialization.
  // Balanced uses a lighter randomized layout; hardened applies the same CFG
  // transform after additional dead-edge splitting and full integrity checks.
  if (profile !== "compact") permuteVmBasicBlocks(optimized);
  validateVmProtoOperands(optimized);
  validateVmCFG(optimized, profile);
  return optimized;
}

/* Reorder CFG basic blocks while preserving the exact control-flow graph.
   Branches are relocated to block entries; conditional branches receive an
   explicit jump for their original fallthrough edge. FORPREP and JMP are
   unconditional transfers; FORLOOP/TFORLOOP and JMPIF* are conditional. */
function permuteVmBasicBlocks(proto, depth = 0) {
  if (!proto || depth > 128 || !Array.isArray(proto.code)) return proto;
  for (const child of proto.protos || []) permuteVmBasicBlocks(child, depth + 1);
  const code = proto.code;
  if (code.length < 6) return proto;
  const unconditional = new Set(["JMP", "FORPREP"]);
  const conditional = new Set(["JMPIF", "JMPIFNOT", "FORLOOP", "TFORLOOP"]);
  const branchOps = new Set([...unconditional, ...conditional]);
  const leaders = new Set([0]);
  for (let i = 0; i < code.length; i++) {
    const ins = code[i];
    if (branchOps.has(ins.op)) {
      const target = i + 1 + Number(ins.sbx || 0);
      if (target >= 0 && target < code.length) leaders.add(target);
      if (i + 1 < code.length) leaders.add(i + 1);
    } else if (ins.op === "RETURN" && i + 1 < code.length) {
      leaders.add(i + 1);
    }
  }
  const starts = [...leaders].sort((a, b) => a - b);
  const blocks = starts.map((start, i) => ({
    start,
    end: i + 1 < starts.length ? starts[i + 1] : code.length,
    instructions: code.slice(start, i + 1 < starts.length ? starts[i + 1] : code.length)
  }));
  if (blocks.length < 3) return proto;
  const byStart = new Map(blocks.map(b => [b.start, b]));
  // Keep the entry block first. Randomize only the remaining blocks.
  const order = blocks.slice(1);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(secureRandomFloat() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const arranged = [blocks[0], ...order];
  const outputStart = new Map();
  let cursor = 0;
  for (const block of arranged) {
    outputStart.set(block.start, cursor);
    const last = block.instructions[block.instructions.length - 1];
    const needsFallthrough = block.end < code.length &&
      !unconditional.has(last.op) && last.op !== "RETURN";
    cursor += block.instructions.length + (needsFallthrough ? 1 : 0);
  }
  const out = [];
  for (const block of arranged) {
    const blockOutStart = out.length;
    const copied = block.instructions.map(ins => ({ ...ins }));
    const last = copied[copied.length - 1];
    const lastOldIndex = block.end - 1;
    for (let k = 0; k < copied.length; k++) {
      const oldIndex = block.start + k;
      const ins = copied[k];
      if (!branchOps.has(ins.op)) continue;
      const oldTarget = oldIndex + 1 + Number(ins.sbx || 0);
      let newTarget;
      if (oldTarget === code.length) newTarget = cursor;
      else {
        const targetBlock = byStart.get(oldTarget);
        if (!targetBlock) throw new Error("VM block permutation: branch target is not a basic-block leader at " + oldIndex);
        newTarget = outputStart.get(targetBlock.start);
      }
      const newIndex = blockOutStart + k;
      ins.sbx = newTarget - (newIndex + 1);
    }
    out.push(...copied);
    if (block.end < code.length && !unconditional.has(last.op) && last.op !== "RETURN") {
      const fallthrough = outputStart.get(block.end);
      if (!Number.isInteger(fallthrough)) throw new Error("VM block permutation: missing fallthrough block");
      out.push({ op: "JMP", a: 0, b: 0, c: 0, bx: 0, sbx: fallthrough - (out.length + 1), _blockFallthrough: true });
    }
  }
  if (out.length > 65535) throw new Error("VM block permutation exceeds the supported instruction limit");
  proto.code = out;
  return proto;
}

// Add per-basic-block opaque state routes. Each guard computes a predicate from
// live VM frame/stack/token state. Both outcomes jump to the same original block,
// but travel through different valid bytecode paths. A dedicated temporary register
// is reserved above the compiler's frame range so user values are never clobbered.
function injectOpaqueStateRoutes(proto, profile = "balanced") {
  if (!proto || !Array.isArray(proto.code) || proto.code.length < 4 || profile === "compact") return proto;
  const code = proto.code;
  const branchOps = new Set(["JMP", "JMPIF", "JMPIFNOT", "FORPREP", "FORLOOP", "TFORLOOP"]);
  const leaders = new Set([0]);
  for (let i = 0; i < code.length; i++) {
    const ins = code[i];
    if (branchOps.has(ins.op) && !ins._irNoop) {
      const target = i + 1 + Number(ins.sbx || 0);
      if (target >= 0 && target < code.length) leaders.add(target);
      if (i + 1 < code.length) leaders.add(i + 1);
    } else if (ins.op === "RETURN" && i + 1 < code.length) {
      leaders.add(i + 1);
    }
  }
  if (!leaders.size || proto.maxstack >= 65535) return proto;
  const selected = new Set();
  const maxGuards = Math.max(0, Math.floor((65535 - code.length) / 5));
  for (const leader of [...leaders].sort((a,b)=>a-b)) {
    if (selected.size >= maxGuards) break;
    if (leader === 0 || profile === "hardened" || secureRandomFloat() < 0.7) selected.add(leader);
  }
  if (!selected.size) return proto;

  const tempReg = proto.maxstack;
  const oldToNew = new Array(code.length);
  const leaderEntryNew = new Array(code.length);
  const out = [];
  for (let i = 0; i < code.length; i++) {
    if (selected.has(i)) {
      const guardStart = out.length;
      leaderEntryNew[i] = guardStart;
      const branchOp = secureRandomFloat() < 0.5 ? "JMPIF" : "JMPIFNOT";
      out.push({ op: "STATEPRED", a: tempReg, b: 0, c: 0, bx: 0, sbx: 0, _opaqueGuard: true });
      out.push({ op: branchOp, a: tempReg, b: 0, c: 0, bx: 0, sbx: 1, _opaqueGuard: true });
      out.push({ op: "JMP", a: 0, b: 0, c: 0, bx: 0, sbx: 2, _opaqueGuard: true });
      out.push({ op: "NOP", a: 0, b: 0, c: 0, bx: 0, sbx: 0, _opaqueGuard: true });
      out.push({ op: "JMP", a: 0, b: 0, c: 0, bx: 0, sbx: 0, _opaqueGuard: true });
      // Branch destinations are set below after all original positions are mapped.
      out[guardStart + 2].sbx = 2;
      out[guardStart + 4].sbx = 0;
    }
    oldToNew[i] = out.length;
    out.push({ ...code[i] });
  }
  for (let i = 0; i < code.length; i++) {
    const ins = code[i];
    if (!branchOps.has(ins.op)) continue;
    const oldTarget = i + 1 + Number(ins.sbx || 0);
    const newIndex = oldToNew[i];
    const newTarget = oldTarget === code.length
      ? out.length
      : (leaderEntryNew[oldTarget] ?? oldToNew[oldTarget]);
    if (!Number.isInteger(newTarget)) throw new Error("Opaque state-route target mapping failed at " + i);
    out[newIndex].sbx = newTarget - (newIndex + 1);
  }
  // Every injected guard's conditional takes the NOP route; the other path takes
  // a direct JMP. Both reconverge at the first original instruction of the block.
  proto.maxstack = tempReg + 1;
  if (out.length > 65535) throw new Error("Opaque state-route expansion exceeds the VM instruction limit");
  proto.code = out;
  return proto;
}

// IR-level CFG obfuscation: split basic-block entries with semantic no-op JMPs,
// rewrite branch offsets to the new leaders, and append unreachable valid decoy blocks.
// No source AST is rewritten here; only the VM IR is changed.
function applyIRControlFlowObfuscation(proto, profile = "balanced", depth = 0) {
  if (!proto || depth > 128 || !Array.isArray(proto.code)) return proto;
  for (const child of (proto.protos || [])) applyIRControlFlowObfuscation(child, profile, depth + 1);
  const code = proto.code;
  if (profile === "compact" || code.length < 4) return proto;
  const branchOps = new Set(["JMP", "JMPIF", "JMPIFNOT", "FORPREP", "FORLOOP", "TFORLOOP"]);
  const leaders = new Set(code.length ? [0] : []);
  const targetsEnd = new Set();
  for (let i = 0; i < code.length; i++) {
    const ins = code[i];
    if (branchOps.has(ins.op)) {
      const target = i + 1 + Number(ins.sbx || 0);
      if (target >= 0 && target < code.length) leaders.add(target);
      if (target === code.length) targetsEnd.add(target);
      if (i + 1 < code.length) leaders.add(i + 1);
    } else if (ins.op === "RETURN" && i + 1 < code.length) leaders.add(i + 1);
  }
  const oldToNew = new Array(code.length), leaderEntry = new Array(code.length), out = [];
  for (let i = 0; i < code.length; i++) {
    if (i !== 0 && leaders.has(i)) {
      leaderEntry[i] = out.length;
      out.push({ op: "JMP", a: 0, b: 0, c: 0, bx: 0, sbx: 0, _irNoop: true });
    }
    if (leaderEntry[i] === undefined) leaderEntry[i] = out.length;
    oldToNew[i] = out.length;
    out.push({ ...code[i] });
  }
  for (let i = 0; i < code.length; i++) {
    const ins = code[i];
    if (!branchOps.has(ins.op)) continue;
    const newIndex = oldToNew[i];
    const oldTarget = i + 1 + Number(ins.sbx || 0);
    const newTarget = oldTarget === code.length ? out.length : (leaderEntry[oldTarget] ?? oldToNew[oldTarget]);
    out[newIndex].sbx = newTarget - (newIndex + 1);
  }
  // Decoy blocks are appended only when no original branch targets the end sentinel.
  // Existing terminal RETURN keeps them unreachable during normal execution.
  if (!targetsEnd.size && code.length && code.some(ins => ins.op === "RETURN") && secureRandomFloat() < 0.5) {
    const seed = (secureKeyFloat() * 60000 | 0);
    out.push({ op: "LOADBOOL", a: seed % Math.max(1, proto.maxstack || 2), b: seed % 2, c: 0, bx: 0, sbx: 0, _irDead: true });
    out.push({ op: "JMP", a: 0, b: 0, c: 0, bx: 0, sbx: 1, _irDead: true });
    out.push({ op: "LOADNIL", a: 0, b: 0, c: 0, bx: 0, sbx: 0, _irDead: true });
    out.push({ op: "RETURN", a: 0, b: 1, c: 0, bx: 0, sbx: 0, _irDead: true });
  }
  proto.code = out;
  if (profile !== "compact") injectOpaqueStateRoutes(proto, profile);
  return proto;
}

// Fuse safe straight-line arithmetic and table-update patterns into dedicated VM superinstructions.
// We deliberately skip protos with control-flow instructions so branch offsets stay intact.
function profileVmOpcodeHotspots(proto) {
  const counts = Object.create(null);
  const visit = p => {
    if (!p || typeof p !== "object") return;
    for (const ins of p.code || []) if (ins && typeof ins.op === "string") counts[ins.op] = (counts[ins.op] || 0) + 1;
    for (const child of p.protos || []) visit(child);
  };
  visit(proto);
  return counts;
}

function shufflePureVmOperands(proto, profile = "balanced") {
  if (!proto || !Array.isArray(proto.code)) return proto;
  const eligible = new Set(["ADD","MUL","CMPEQ","CMPNE","BAND","BOR","BXOR"]);
  // Compact mode avoids extra entropy work on tiny blocks; other profiles shuffle
  // only operands of commutative register operations (no calls, globals, or tables).
  if (!(profile === "compact" && proto.code.length < 8)) {
    for (const ins of proto.code) {
      if (!ins || !eligible.has(ins.op)) continue;
      if (secureRandomFloat() < (profile === "hardened" ? 0.8 : 0.45)) {
        const t = ins.b; ins.b = ins.c; ins.c = t;
      }
    }
  }
  for (const child of proto.protos || []) shufflePureVmOperands(child, profile);
  return proto;
}

function fuseSafeSuperinstructions(proto) {
  const fusionProfile = proto && proto._fusionProfile || "hardened";
  if (fusionProfile === "compact" && (proto.code || []).length < 12) {
    for (const child of (proto.protos || [])) fuseSafeSuperinstructions(child);
    return proto;
  }
  const branchOps = new Set(["JMP","JMPIF","JMPIFNOT","FORPREP","FORLOOP","TFORLOOP"]);
  const fused = { ADD:"FUSED_MOVE_ADD", SUB:"FUSED_MOVE_SUB", MUL:"FUSED_MOVE_MUL", DIV:"FUSED_MOVE_DIV" };
  const hot = proto && proto._opcodeHotspots || Object.create(null);
  const fusionAllowed = fusionProfile === "hardened"
    ? new Set(["ADD","SUB","MUL","DIV","GETTABLE","GETGLOBAL","CALL"])
    : fusionProfile === "compact"
      ? new Set(["ADD","SUB"])
      : new Set(["ADD","SUB","MUL","DIV","GETTABLE","GETGLOBAL","CALL"]);
  // In balanced mode, only fuse arithmetic families that occur repeatedly;
  // hardened mode retains broad fusion to diversify dispatch, compact minimizes code size.
  if (fusionProfile === "balanced") {
    for (const op of ["ADD","SUB","MUL","DIV"]) if ((hot[op] || 0) < 2) fusionAllowed.delete(op);
  }
  const out = [];
  const code = proto.code || [];
  const branchTargets = new Set();
  for (let bi=0; bi<code.length; bi++) if (branchOps.has(code[bi].op)) {
    const target=bi+1+Number(code[bi].sbx || 0);
    if (target>=0 && target<=code.length) branchTargets.add(target);
  }
  const oldToNew = new Array(code.length);
  const originAtNew = [];
  const canFuse = (i,count) => { for(let k=1;k<=count;k++) if(branchTargets.has(i+k)) return false; return true; };
  for (let i = 0; i < code.length; i++) {
    oldToNew[i] = out.length;
    originAtNew[out.length] = i;
    const first = code[i], second = code[i + 1], third = code[i + 2];
    // Roblox-heavy global member call: GETGLOBAL A, global; GETTABLE A, A, "new"/"wait"; CALL A.
    // The allowlist is deliberately narrow; execution still performs ordinary runtime lookup
    // and calls the resolved function with the original argument/result convention.
    const globalName = first && first.op === "GETGLOBAL" && proto.consts && proto.consts[first.bx] && proto.consts[first.bx].type === "str"
      ? proto.consts[first.bx].val : null;
    const memberName = second && second.op === "GETTABLE" && second.ckey && proto.consts && proto.consts[second.c] && proto.consts[second.c].type === "str"
      ? proto.consts[second.c].val : null;
    const robloxMemberPairs = new Set(["Instance.new", "Vector3.new", "Vector2.new", "CFrame.new", "Color3.new", "UDim2.new", "UDim.new", "TweenInfo.new", "BrickColor.new", "task.wait", "task.spawn", "task.defer"]);
    if (first && second && first.op === "GETGLOBAL" && second.op === "GETTABLE" && canFuse(i,1) &&
        first.a === second.a && second.a === second.b && second.ckey &&
        Number.isInteger(first.bx) && Number.isInteger(second.c) && globalName && memberName &&
        robloxMemberPairs.has(globalName + "." + memberName) &&
        !(third && third.op === "CALL" && third.a === second.a)) {
      out.push({ op:"FUSED_GLOBAL_MEMBER_LOOKUP", a:first.a ?? 0, b:0, c:0, bx:first.bx, sbx:second.c });
      i++;
    } else if (first && second && third && first.op === "GETGLOBAL" && second.op === "GETTABLE" && third.op === "CALL" && canFuse(i,2) &&
        first.a === second.a && second.a === second.b && second.a === third.a && second.ckey &&
        Number.isInteger(first.bx) && Number.isInteger(second.c) && globalName && memberName &&
        robloxMemberPairs.has(globalName + "." + memberName)) {
      out.push({ op:"FUSED_GLOBAL_MEMBER_CALL", a:first.a ?? 0, b:third.b ?? 0, c:third.c ?? 0, bx:first.bx, sbx:second.c });
      i += 2;
    } else if (false && first && second && first.op === "GETGLOBAL" && second.op === "CALL" && canFuse(i,1) &&
        (first.a ?? 0) === (second.a ?? 0) && Number.isInteger(first.bx) &&
        !new Set(["getgenv", "getfenv", "setfenv", "getrenv", "sethiddenproperty", "gethiddenproperty", "addcmd", "notify"]).has(globalName)) {
      // Disabled since V8.2.29: fused GETGLOBAL+CALL was producing a nil callee
      // for simple global calls (including print) in Roblox Luau. Keep the
      // canonical GETGLOBAL then CALL pair so the ordinary register path runs.
      out.push({ op:"FUSED_GETGLOBAL_CALL", a:first.a ?? 0, b:second.b ?? 0, c:second.c ?? 0, bx:first.bx, sbx:0 });
      i++;
    // Three-instruction table update: t[k] = t[k] + rhs.
    // Restrict fusion to register operands and non-aliasing table/key/temp registers.
    // The fused handler performs the same read, addition, and write in source order.
    } else if (first && second && third && first.op === "GETTABLE" && second.op === "ADD" && third.op === "SETTABLE" && canFuse(i,2) &&
    // Fuse only when CALL consumes the exact destination written by GETGLOBAL.
    // This is a semantics-preserving fast path; branch-bearing prototypes are skipped above.
        !first.bkey && !first.ckey && !third.bkey &&
        (first.a ?? 0) === (second.a ?? 0) && (second.a ?? 0) === (second.b ?? 0) &&
        (first.a ?? 0) === (third.c ?? 0) && (first.b ?? 0) === (third.a ?? 0) &&
        (first.c ?? 0) === (third.b ?? 0) &&
        (first.a ?? 0) !== (first.b ?? 0) && (first.a ?? 0) !== (first.c ?? 0)) {
      out.push({ op:"FUSED_GETTABLE_ADD_SETTABLE", a:first.b ?? 0, b:first.c ?? 0, c:second.c ?? 0, bx:first.a ?? 0, sbx:0 });
      i += 2;
    } else if (first && second && first.op === "MOVE" && fused[second.op] && fusionAllowed.has(second.op) && canFuse(i,1) &&
        (first.a ?? 0) === (second.b ?? 0) && (second.a ?? 0) === (first.a ?? 0) &&
        (second.c ?? 0) !== (first.a ?? 0)) {
      out.push({ op:fused[second.op], a:second.a ?? 0, b:first.b ?? 0, c:second.c ?? 0, bx:0, sbx:0 });
      i++;
    } else out.push(first);
  }
  // Branch targets may only land on instruction starts, never on a fused-away interior.
  // Recalculate relative offsets after fusion so loops/conditionals keep their semantics.
  for (let ni=0; ni<out.length; ni++) {
    const ins=out[ni];
    if (!branchOps.has(ins.op)) continue;
    const oi=originAtNew[ni];
    const oldTarget=oi+1+Number(code[oi].sbx || 0);
    const newTarget=oldTarget===code.length ? out.length : oldToNew[oldTarget];
    if (newTarget===undefined) throw new Error("VM fusion lost a branch target");
    ins.sbx=newTarget-(ni+1);
  }
  proto.code = out;
  for (const child of (proto.protos || [])) {
    child._fusionProfile = fusionProfile;
    child._opcodeHotspots = profileVmOpcodeHotspots(child);
    fuseSafeSuperinstructions(child);
    delete child._fusionProfile;
    delete child._opcodeHotspots;
  }
  return proto;
}

/* BUGFIX v8.1-33 (VM runtime portability): the emitted engine used table.unpack / table.pack,
   buffer.* and bit32.* directly. On runtimes missing any of these (e.g. Lua 5.1 has no
   table.unpack, only the global `unpack`) the call fails with "attempt to call a nil value".
   Every emitted VM chunk now starts with a header that binds these names once, using the
   native library when present and a pure-Lua fallback otherwise. */
const VM_PORTABLE_HEADER = [
  /* BUGFIX v8.1-36: globals for the VM come from the same env capture as source mode.
     Previously the engine read bare `_G`, which is empty or missing on executors that expose
     globals through getgenv(). */
  'local __vmenv;',
  '-- VM capabilities are bound by buildVmPortableHeader from a fixed allowlist.',
  'if type(__vmenv)~="table" then __vmenv={} end if __vmenv.print==nil and type(print)=="function" then __vmenv.print=print end',
  'local __fallbackUnpack;__fallbackUnpack=function(t,i,j) i=i or 1; j=j or t.n or #t; if i>j then return end; return t[i],__fallbackUnpack(t,i+1,j) end;local __unpack=(type(table.unpack)=="function" and table.unpack) or (type(unpack)=="function" and unpack) or __fallbackUnpack',
  'local __pack=(type(table.pack)=="function" and table.pack) or function(...) local n=select("#",...);local t={...};t.n=n;return t end',
  'local __create=(type(table.create)=="function" and table.create) or function() return {} end',
  'local __buf=(type(buffer)=="table" and type(buffer.readu32)=="function" and type(buffer.readu8)=="function" and type(buffer.writeu8)=="function" and type(buffer.fromstring)=="function" and type(buffer.tostring)=="function" and type(buffer.create)=="function" and type(buffer.len)=="function" and type(buffer.fill)=="function") and buffer or (function() local B={}',
  '  function B.create(n) local b={n=n} for i=0,n-1 do b[i]=0 end return b end',
  '  function B.fromstring(s) local b={n=#s} for i=1,#s do b[i-1]=string.byte(s,i) end return b end',
  '  function B.len(b) return b.n end',
  '  function B.readu8(b,i) return b[i] end',
  '  function B.writeu8(b,i,v) b[i]=v%256 end',
  '  function B.fill(b,v,i,n) for j=i,i+n-1 do b[j]=v%256 end end',
  '  function B.readu32(b,i) return b[i]+b[i+1]*256+b[i+2]*65536+b[i+3]*16777216 end',
  '  function B.tostring(b) local t={} for i=0,b.n-1 do t[#t+1]=string.char(b[i]) end return table.concat(t) end',
  '  return B end)()',
  'local __bit=(type(bit32)=="table" and type(bit32.bxor)=="function" and type(bit32.band)=="function" and type(bit32.bor)=="function" and type(bit32.lshift)=="function" and type(bit32.rshift)=="function" and type(bit32.bnot)=="function") and bit32 or ((type(bit)=="table" and type(bit.bxor)=="function" and type(bit.band)=="function" and type(bit.bor)=="function" and type(bit.lshift)=="function" and type(bit.rshift)=="function" and type(bit.bnot)=="function") and bit or (function()',
  '  local function op(a,b,k) local r,m=0,1 a=(a or 0)%4294967296 b=(b or 0)%4294967296 for _=1,32 do local x,y=a%2,b%2 local z',
  '    if k==1 then z=(x~=y) and 1 or 0 elseif k==2 then z=((x+y)>0) and 1 or 0 else z=((x+y)==2) and 1 or 0 end',
  '    r=r+z*m a=(a-x)/2 b=(b-y)/2 m=m*2 end return r end',
  '  local function fold(kind,...) local n=select("#",...);if n==0 then return 0 end;local r=(select(1,...) or 0)%4294967296;for i=2,n do r=op(r,select(i,...),kind) end;return r end;local kx,ko=1,2;local ka=3;return {bxor=function(...) return fold(kx,...) end,bor=function(...) return fold(ko,...) end,band=function(...) return fold(ka,...) end,bnot=function(a) return 4294967295-((a or 0)%4294967296) end,lshift=function(a,b) return (((a or 0)%4294967296)*2^((b or 0)%32))%4294967296 end,rshift=function(a,b) return math.floor(((a or 0)%4294967296)/2^((b or 0)%32)) end} end)())',
  'local __idiv=function(a,b) return math.floor(a/b) end',
  ''
].join("\n");

/* Per-output mangling for VM-private scheduler symbols.
   This is identifier obfuscation only, not a cryptographic security boundary. */
function mangleVmPrivateIdentifiers(source) {
  const map = new Map();
  const used = new Set();
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const makeName = () => {
    let n;
    do { n = "_" + Array.from({length:4}, () => alphabet[secureRandomFloat() * alphabet.length | 0]).join(""); }
    while (used.has(n));
    used.add(n);
    return n;
  };
  // Keep strings and comments byte-for-byte; only Lua identifier tokens are rewritten.
  return source.replace(/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|--\[\[[\s\S]*?\]\]|--[^\r\n]*|[A-Za-z_][A-Za-z0-9_]*)/g, token => {
    if (token.startsWith("\"") || token.startsWith("'") || token.startsWith("--")) return token;
    const randomizedPortableNames = new Set(["__vmenv", "__buf", "__bit", "__unpack", "__pack", "__create", "__fallbackUnpack", "__idiv", "__WSBufferView"]);
    if (!randomizedPortableNames.has(token) && !token.startsWith("__WS")) return token;
    if (!map.has(token)) map.set(token, makeName());
    return map.get(token);
  });
}

/* Randomize the portable bit-operation fallback's local names per build. This prevents
   obvious helper signatures such as `return op(a,b,3)` from being copied verbatim into
   every artifact. It is obfuscation only: the algorithm remains recoverable at runtime. */
function manglePortableBitFallback(header) {
  const start = header.indexOf('local function op(a,b,k)');
  if (start < 0) return header;
  const endMarker = 'end)())';
  const endAt = header.indexOf(endMarker, start);
  if (endAt < 0) return header;
  const end = endAt + endMarker.length;
  let segment = header.slice(start, end);
  const names = ['op','a','b','k','r','m','x','y','z','kx','ko','ka','mode'];
  const map = new Map(names.map(name => {
    let generated = '_0x';
    for (let i = 0; i < 7; i++) generated += '0123456789abcdef'[secureRandomFloat() * 16 | 0];
    return [name, generated];
  }));
  segment = segment.replace(/\b[A-Za-z_][A-Za-z0-9_]*\b/g, token => map.get(token) || token);
  return header.slice(0, start) + segment + header.slice(end);
}

function buildVmPortableHeader(vmEnvironment = "roblox", portableFallbacks = false, allowRequire = false, allowCoroutine = false) {
  // Every mode uses an explicit capability table. No ambient environment scan,
  // debug library, dynamic source loader, or executor environment API is exposed.
  // The standard buffer library remains available for Luau compatibility; it is
  // a language capability, not a security boundary or a secrecy mechanism.
  const core = [
    "pcall", "xpcall", "type", "typeof", "tostring", "tonumber", "assert", "error",
    "select", "pairs", "ipairs", "next", "rawequal", "rawget", "rawset",
    "setmetatable", "getmetatable", "print", "warn", "math", "string", "table",
    "bit32", "buffer", "unpack", "loadstring"
  ];
  const roblox = [
    "os", "task", "game", "workspace", "script", "Enum", "Instance", "Vector2",
    "Vector3", "CFrame", "Color3", "UDim", "UDim2", "Ray", "RaycastParams",
    "BrickColor", "NumberRange", "NumberSequence", "ColorSequence", "Region3",
    "Random", "DateTime", "Axes", "Faces", "PhysicalProperties",
    "wait", "spawn", "delay", "tick", "time"
  ];
  const extended = [
    ...roblox, "utf8", "Vector2int16", "Vector3int16", "TweenInfo", "PathWaypoint",
    "OverlapParams", "CatalogSearchParams", "DockWidgetPluginGuiInfo"
  ];
  const selected = vmEnvironment === "strict"
    ? core
    : (vmEnvironment === "extended" ? [...core, ...extended] : [...core, ...roblox]);
  if (allowRequire === true && vmEnvironment !== "strict") selected.push("require");
  if (allowCoroutine === true && vmEnvironment !== "strict") selected.push("coroutine");
  const unique = [...new Set(selected)];
  const bindings = unique.map(name => name === "os"
    ? 'os=(function(o) if type(o)~="table" then return nil end local t={} local v=o.clock;if type(v)=="function" then t.clock=v end return t end)(os)'
    : `${name}=${name}`).join(",");
  const portableHelpers = VM_PORTABLE_HEADER.split("\n").slice(3).join("\n");
  // Roblox/Luau supplies native buffer and bit32. The default reduced profile
  // binds them directly and emits no fallback implementation or buffer proxy.
  const nativeHelpers = [
    'local __fallbackUnpack;__fallbackUnpack=function(t,i,j) i=i or 1; j=j or t.n or #t; if i>j then return end; return t[i],__fallbackUnpack(t,i+1,j) end;local __unpack=(type(table.unpack)=="function" and table.unpack) or (type(unpack)=="function" and unpack) or __fallbackUnpack',
    'local __pack=(type(table.pack)=="function" and table.pack) or function(...) local n=select("#",...);local t={...};t.n=n;return t end',
    'local __create=(type(table.create)=="function" and table.create) or function() return {} end',
    'local __buf=buffer',
    'local __bit=bit32',
    'local __idiv=function(a,b)return math.floor(a/b) end'
  ].join("\n");
  const helpers = portableFallbacks ? portableHelpers : nativeHelpers;
  const fallbackBindings = portableFallbacks
    ? '\n__vmenv.buffer=__buf;__vmenv.bit32=__bit'
    : "";
  const header = `local __vmenv={${bindings}};\n${helpers}${fallbackBindings}`;
  return portableFallbacks ? manglePortableBitFallback(header) : header;
}

function portableVmChunk(body, options = {}) {
  const rewritten = body
    .replace(/\bbuffer\./g, "__buf.")
    .replace(/\bbit32\./g, "__bit.")
    .replace(/\btable\.unpack\(/g, "__unpack(")
    .replace(/\btable\.pack\(/g, "__pack(")
    .replace(/\btable\.create\(/g, "__create(");
  const hardenedHeader = buildVmPortableHeader(options.vmEnvironment || "roblox", options.portableFallbacks === true, options.allowRequire === true, options.allowCoroutine === true);
  return mangleVmPrivateIdentifiers(hardenedHeader + "\n" + rewritten);
}

/* BUGFIX v8.1-34 (compatibility): an integrity mismatch used to `return` silently at the top
   of the VM chunk, so the program exited with no output on runtimes whose buffer/number
   semantics differ. A mismatch is now reported via warn() and execution continues.
   opts.integrity === false (VM Debug) omits the walker and the check entirely. */
function analyzeInterproceduralVmGraph(root) {
  const nodes = [], edges = [], seen = new Set();
  function visit(proto, path) {
    if (!proto || seen.has(proto)) return;
    seen.add(proto);
    const id = nodes.length;
    nodes.push({ id, path, instructionCount: Array.isArray(proto.code) ? proto.code.length : 0 });
    const children = Array.isArray(proto.protos) ? proto.protos : [];
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (!child) continue;
      const childId = nodes.length;
      visit(child, path + ".p" + i);
      const resolved = nodes.find(n => n.path === path + ".p" + i);
      if (resolved) edges.push({ from: id, to: resolved.id, kind: "closure-prototype", closureIndex: i });
    }
  }
  visit(root, "root");
  return { nodes, edges, mode: "prototype-call-graph-with-frame-aware-runtime", fullyMerged: false };
}

function emitVirtualizedLuau(src, opts) {
  // Compatibility fix: local payload digest checks are opt-in. The digest is
  // computed in Node and recomputed in Luau; runtime differences can otherwise
  // reject an unmodified payload before the VM starts. Structural VM validation
  // remains enabled regardless of this option.
  const integrity = !(opts && opts.integrity === false);
  const requestedProfile = ["compact", "balanced", "hardened"].includes(opts && opts.profile) ? opts.profile : "balanced";
  // Tiny straight-line programs use compact lowering unless the caller explicitly
  // requests the hardened profile. Explicit hardened requests retain state-route
  // injection and CFG permutation even for short inputs; other profiles avoid
  // extra control-flow overhead when a program has only 1-8 straight-line ops.
  const rawProto = compileToBytecode(src);
  const countInstructions = p => (p.code || []).length + (p.protos || []).reduce((n, child) => n + countInstructions(child), 0);
  const hasControlFlow = p => (p.code || []).some(ins => ["JMP", "JMPIF", "JMPIFNOT", "FORPREP", "FORLOOP", "TFORLOOP"].includes(ins.op)) || (p.protos || []).some(hasControlFlow);
  const simpleStraightLine = countInstructions(rawProto) <= 8 && !(rawProto.protos || []).length && !hasControlFlow(rawProto);
  const profile = simpleStraightLine && requestedProfile !== "hardened" ? "compact" : requestedProfile;
  // Build-time IR preparation validates basic-block boundaries and successor edges.
  // The optimizer remains conservative and never reorders instructions across branches.
  const proto = prepareVmIR(rawProto, profile);
  const interproceduralGraph = analyzeInterproceduralVmGraph(proto);
  // The graph is build-time metadata for diagnostics; it never changes bytecode order.
  if (opts && opts.vmDebug) {
    __wsLastInterproceduralGraph = interproceduralGraph;
    __wsLastHardeningProfile = { profile, instructionCount:(function count(p){return (p.code||[]).length+(p.protos||[]).reduce((n,c)=>n+count(c),0)})(proto), features:["randomized-opcode-map","nested-isa","lane-separated-handler-banks","split-fetch-and-dispatch-stages","active-op-microhandler-pruning","fail-closed-inactive-opcodes","nonlinear-state-predicates","lazy-constant-decoding","fragmented-runtime-strings","nonlinear-register-feistel","cfg-edge-obfuscation","superinstruction-fusion","typed-length-delimited-payload-digest","circular-execution-integrity-ring","bounded-call-depth","exception-safe-frame-cleanup","roblox-whitelisted-vm-environment"] };
  }
  const runtimeBinding = !!(opts && opts.runtimeBinding);
  const maskBase = (secureKeyFloat() * 255 | 0) + 1;
  // This stable Luau primitive-contract fingerprint is a compatibility gate, not a secret.
  const runtimeEnvExpectedKey = [6,1,1,87,170,6,8,8,8,8,8,8,8,8].reduce((z,v) => (z * 31 + v) % 65521, 0);
  // Encoded words/constants use the effective mask; the VM recomputes it from the
  // runtime contract before any payload is decoded. Disabling the option preserves legacy masking.
  const mask = runtimeBinding ? (maskBase ^ (runtimeEnvExpectedKey & 255)) : maskBase;
  // Independent per-build XOR polynomial for instruction words and string constants.
  const xorProfile = {
    a: 1 + (secureKeyFloat() * 250 | 0), b: 1 + (secureKeyFloat() * 250 | 0),
    c: 1 + (secureKeyFloat() * 250 | 0), d: 2 + (secureKeyFloat() * 13 | 0),
    e: 2 + (secureKeyFloat() * 13 | 0), f: 1 + (secureKeyFloat() * 250 | 0),
    g: 1 + (secureKeyFloat() * 250 | 0),
    ka: 1 + (secureKeyFloat() * 250 | 0), kb: 1 + (secureKeyFloat() * 250 | 0),
    kc: 1 + (secureKeyFloat() * 250 | 0), kd: 1 + (secureKeyFloat() * 250 | 0),
    ke: 2 + (secureKeyFloat() * 13 | 0), kf: 1 + (secureKeyFloat() * 250 | 0),
    kg: 1 + (secureKeyFloat() * 250 | 0),
    ca: 1 + (secureKeyFloat() * 250 | 0), cb: 1 + (secureKeyFloat() * 250 | 0),
    cc: 1 + (secureKeyFloat() * 250 | 0), cd: 1 + (secureKeyFloat() * 250 | 0),
    ce: 1 + (secureKeyFloat() * 250 | 0), cf: 1 + (secureKeyFloat() * 250 | 0),
    cg: 1 + (secureKeyFloat() * 250 | 0), ch: 1 + (secureKeyFloat() * 250 | 0),
    ci: 2 + (secureKeyFloat() * 13 | 0), cj: 1 + (secureKeyFloat() * 250 | 0),
    ck: 1 + (secureKeyFloat() * 250 | 0)
  };
  // Add a bounded number of unreachable, valid decoy prototypes. Scale the count
  // with actual live bytecode rather than adding 16–32 decoys to every tiny script.
  // Decoy prototypes are analysis noise only and are never referenced by CLOSURE.
  if (profile !== "compact") {
    const countLive = p => (p.code || []).length + (p.protos || []).reduce((n, child) => n + countLive(child), 0);
    const liveInstructionCount = Math.max(1, countLive(proto));
    const deadCount = profile === "hardened"
      ? Math.max(1, Math.floor(Math.min(12, Math.max(1, Math.ceil(liveInstructionCount / 18))) / 2))
      : Math.max(1, Math.floor(Math.min(5, Math.max(1, Math.ceil(liveInstructionCount / 24))) / 2));
    for (let di = 0; di < deadCount; di++) {
      const decoyConsts = [];
      const constCount = profile === "hardened"
        ? Math.max(1, Math.floor((2 + (secureRandomFloat() * 4 | 0)) / 2))
        : Math.max(1, Math.floor((1 + (secureRandomFloat() * 3 | 0)) / 2));
      for (let ci = 0; ci < constCount; ci++) {
        const nonce = ((secureRandomFloat() * 0xFFFFFFFF) >>> 0).toString(16);
        decoyConsts.push({ type: "str", val: "_d" + di.toString(36) + "_" + ci.toString(36) + "_" + nonce });
      }
      // Decoy prototypes now contain a variable-length stream of genuine,
      // semantically inert NOP instructions followed by RETURN. They travel
      // through the exact same per-prototype ISA, operand-layout, key and
      // payload encoders as reachable bytecode; no special "fake opcode"
      // decoder path is introduced.
      const decoyCode = [];
      const nopCount = profile === "hardened"
        ? Math.max(1, Math.floor((5 + (secureRandomFloat() * 8 | 0)) / 2))
        : Math.max(1, Math.floor((2 + (secureRandomFloat() * 5 | 0)) / 2));
      for (let ni = 0; ni < nopCount; ni++) {
        decoyCode.push({ op: "NOP", a: 0, b: 0, c: 0, bx: 0, sbx: 0 });
      }
      decoyCode.push({ op: "RETURN", a: 0, b: 1, c: 0, bx: 0, sbx: 0 });
      proto.protos.push({ numparams: 0, maxstack: 2, consts: decoyConsts,
        code: decoyCode, protos: [], upvals: [] });
    }
  }
  // Only actual semantics present in the finalized IR need full micro-handler bodies.
  // All other opcode IDs remain in the randomized ISA and fail closed through one shared
  // terminal handler. This retains dispatch validation while avoiding three duplicated
  // copies of dozens of handlers that this program can never execute.
  const activeVmOps = new Set();
  const collectActiveVmOps = p => {
    if (!p || typeof p !== "object") return;
    for (const ins of p.code || []) {
      if (!ins || typeof ins.op !== "string" || !VM_OP_LIST.includes(ins.op)) throw new Error("Unknown opcode in active VM operation scan");
      activeVmOps.add(ins.op);
    }
    for (const child of p.protos || []) collectActiveVmOps(child);
  };
  collectActiveVmOps(proto);
  if (!activeVmOps.has("RETURN")) activeVmOps.add("RETURN");
  validateVmOperandSchemas();
  const opMap = makeVmOpcodeMap(profile);
  const layout = [0,1,2,3,4,5];
  if (profile !== "compact") for (let i=layout.length-1;i>0;i--) { const j=secureRandomFloat()*(i+1)|0; [layout[i],layout[j]]=[layout[j],layout[i]]; }
  const fieldName = () => "_" + (secureRandomFloat().toString(36).slice(2,5)) + (secureRandomFloat()*900+100|0);
  const fields = {n:fieldName(),m:fieldName(),k:fieldName(),kt:fieldName(),kb:fieldName(),c:fieldName(),im:fieldName(),p:fieldName(),u:fieldName(),s:fieldName(),s2:fieldName(),v:fieldName(),o:fieldName(),o2:fieldName(),oo:fieldName(),wp:fieldName(),cp:fieldName(),meta:fieldName()};
  fields.metaReadName = fieldName();
  fields.metaGroupName = fieldName();
  const metaGroupSlots=[1,2,3,4,5];
  for(let i=metaGroupSlots.length-1;i>0;i--){const j=secureRandomFloat()*(i+1)|0;[metaGroupSlots[i],metaGroupSlots[j]]=[metaGroupSlots[j],metaGroupSlots[i]];}
  const metaItemSlots=[[1,2,3],[1,2,3,4,5,6],[1],[1],[1,2,3,4]];
  for(const row of metaItemSlots){for(let i=row.length-1;i>0;i--){const j=secureRandomFloat()*(i+1)|0;[row[i],row[j]]=[row[j],row[i]];}}
  fields.metaLayout={groupSlots:metaGroupSlots,itemSlots:metaItemSlots};
  const names = {};
  for (const id of ["__WSV","__WSN","__WSCallStackValid","__mbaAdd","__mbaTruthy","__XM","R","U","pc","g","done","res","S","sp","__push","__pop","args","__NP","__top","D","K","H","IH","__VR","__vrmul","__vradd","__vrxor","__regkey","__regBase","__opMul","__opAdd","__opXor","__opInv","__opRound","__operandMul","__wordIndex","__ov","__of","__uov","__omix","__opaqueLeft","__opaqueRight","__fsp","__stackSalt","__dfstate","__di","__slot","__lastOp","__dispatchState","__dispatchOp","__execHandler","op","a","b","c","bx","sbx"]) names[id] = fieldName();
  // V8.2.6: randomize every lower-case __ws* identifier used in generated VM templates.
  for (const match of buildLuauVmEngine.toString().matchAll(/\b__ws[A-Za-z0-9_]*\b/g)) {
    const id = match[0];
    if (!names[id]) names[id] = fieldName();
  }
  const opShift = profile === "compact" ? 1 : 1 + (secureRandomFloat() * 249 | 0);
  const opShift2 = profile === "compact" ? 0 : 1 + (secureRandomFloat() * 249 | 0);
  const innerOpMap = profile === "compact" ? opMap : makeVmOpcodeMap(profile);
  // Physical handler placement is independent from both opcode namespaces.
  // This changes the handler table topology on every build without changing semantics.
  const handlerPool = Array.from({ length: 250 }, (_, i) => i + 1);
  for (let i = handlerPool.length - 1; i > 0; i--) {
    const j = Math.floor(secureRandomFloat() * (i + 1));
    [handlerPool[i], handlerPool[j]] = [handlerPool[j], handlerPool[i]];
  }
  // Physical handler slots remain independent from semantic opcode IDs.
  // serializeProtoNumeric now keys each prototype's decode vector by the exact
  // shifted opcode stored in the instruction stream, so this independent layout
  // is safe and the runtime resolves encoded opcode -> physical handler slot.
  const handlerMap = new Map(VM_OP_LIST.map((name, i) => [name, handlerPool[i]]));
  // Fail at build time if opcode IDs, nested IDs, or physical handler slots drift.
  validateVmIsaMaps(opMap, innerOpMap, handlerMap, profile);
  // Opcode IDs, handler slots, constant indices, and unreachable decoy-tail
  // positions are independently randomized at build time. Randomization is a
  // reverse-engineering cost, not a cryptographic guarantee.
  // A genuinely independent nested ISA layout: field order is randomized
  // separately from the root ISA on every build. The runtime reads each field
  // through the corresponding layout index, so serialized operands stay aligned.
  const innerLayout = [0,1,2,3,4,5];
  if (profile !== "compact") for (let i=innerLayout.length-1;i>0;i--) { const j=secureRandomFloat()*(i+1)|0; [innerLayout[i],innerLayout[j]]=[innerLayout[j],innerLayout[i]]; }
  /* Independent second-layer masks for nested constants and instruction payload. */
  const nestedKeyMask = 1 + (secureKeyFloat() * 254 | 0);
  let nestedPayloadMask = (secureKeyFloat() * 0xFFFFFFFF) >>> 0;
  if (nestedPayloadMask === 0) nestedPayloadMask = 0x6D2B79F5;
  const ser = serializeProtoNumeric(proto, opMap, layout, opShift, innerOpMap, false, innerLayout, xorProfile, handlerMap, profile, opShift2);
  validateSerializedVmProto(proto, ser, opMap, "root");
  // Split the per-output byte mask across unrelated-looking arithmetic terms.
  // This obscures a fixed literal but is not cryptographic protection.
  const ka = 3 + ((secureKeyFloat() * 240) | 0);
  const kb = 5 + ((secureKeyFloat() * 230) | 0);
  const kc = 7 + ((secureKeyFloat() * 220) | 0);
  const kd = (((mask - (ka * kb) - kc) % 256) + 256) % 256;
  const maskExpr = `(((${ka}*${kb})+${kc}+${kd})%256)`;
  // The VM now uses a prototype-local base offset for logical registers, preserving
  // adjacent argument/result ranges while keeping R a plain raw table. The legacy
  // call parameters remain for compatibility with the existing builder signature.
  const vrMul = 1 + (secureKeyFloat() * 65519 | 0);
  const vrAdd = secureKeyFloat() * 65521 | 0;
  const vrXor = secureKeyFloat() * 65535 | 0;
  const wn = { fi: fieldName(), fb: fieldName(), fp: fieldName() };
  // Safe loop budget can be tuned by callers. Clamp it to a reasonable range
  // so accidental settings cannot disable the guard or make it trivially tiny.
  const requestedBudget = Number(opts && opts.maxInstructions);
  const instructionBudget = Number.isFinite(requestedBudget)
    ? Math.max(1000, Math.min(100000000, Math.floor(requestedBudget)))
    : 1000000;
  let engine;
  __wsTimingNoiseBuild = !!(opts && opts.timingNoise);
  try { engine = buildLuauVmEngine(mask, opMap, innerOpMap, handlerMap, fields, names, layout, innerLayout, maskExpr, vrMul, vrAdd, vrXor, opShift, nestedPayloadMask, nestedKeyMask, xorProfile, integrity ? wn.fp : null, instructionBudget, opShift2, runtimeBinding, maskBase, runtimeEnvExpectedKey, opts && opts.integrityPolicy === "diagnostic" ? "diagnostic" : "strict", opts && opts.antiHookMode || "balanced", opts && opts.runtimeSize === "full" ? "full" : "compact", opts && Number.isInteger(opts.maxCallDepth) ? opts.maxCallDepth : 512, opts && opts.vmCoroutineScheduler === true, opts && opts.vmDebug === true, activeVmOps); }
  finally { __wsTimingNoiseBuild = false; }
  const digest = integrity
    ? makeDigest(chooseMetamorphicIntegrityProfile(), chooseMetamorphicIntegrityProfile())
    : { add() {}, byte() {}, value() { return 0; }, value2() { return 0; }, profile: null, profile2: null };
  const payloadBody = emitProtoTable(ser, mask, fields, digest, nestedPayloadMask, nestedKeyMask, xorProfile);
  const pRoot = fieldName();
  const payload = integrity
    ? payloadBody.slice(0, -1) + "," + fields.s + "=" + digest.value() + "," + fields.s2 + "=" + digest.value2() + "}"
    : payloadBody;
  if (!integrity) {
    return portableVmChunk(prototypeMetadataAccessorLua(fields) + engine +
      " local " + pRoot + "=" + payload +
      " return __WSRun(" + pRoot + ",{})", opts || {});
  }
  // Fail closed on integrity mismatch without kicking users or installing debugger
  // hooks/watchdogs. The payload digest is computed at build time and rechecked by
  // integrityWalkerLua() using the same bounded-integer arithmetic at runtime.
  // Keep the failure explicit and deterministic so legitimate runtime issues can be
  // diagnosed; do not disguise tamper failures as unrelated Lua crashes.
  const tamperAction =
    " local __wsActualA=" + wn.fp + "(" + pRoot + ",0);local __wsActualB=" + wn.fp + "2(" + pRoot + ",0);" +
    " local __wsExpectedA=" + pRoot + "." + fields.s + ";local __wsExpectedB=" + pRoot + "." + fields.s2 + ";" +
    " if __wsActualA~=__wsExpectedA or __wsActualB~=__wsExpectedB then " +
    " error(" + luaHiddenString("WSF_INTEGRITY_MISMATCH") + "..':A='..tostring(__wsActualA)..'/'..tostring(__wsExpectedA)..';B='..tostring(__wsActualB)..'/'..tostring(__wsExpectedB),0) end";
  return portableVmChunk(integrityWalkerLua(fields, wn, digest.profile, digest.profile2) + engine +
    " local " + pRoot + "=" + payload + tamperAction +
    " return __WSRun(" + pRoot + ",{})", opts || {});
}


/* ========== KEYWORD / GLOBAL HIDING (v8.1-21) ========== */
const GLOBAL_ALIAS = {
  print: "p", warn: "w", error: "e", tostring: "t", tonumber: "n",
  pcall: "pc", xpcall: "xpc", pairs: "pa", ipairs: "ip", next: "nx",
  select: "s", type: "ty", typeof: "tyo", require: "rq", assert: "a",
  rawget: "rg", rawset: "rs", setmetatable: "sm", getmetatable: "gm",
  unpack: "u", game: "g", workspace: "ws", script: "sc"
};

function chunkStringExpr(s) {
  const chars = Array.from(String(s));
  if (!chars.length) return '""';
  if (chars.length === 1) return JSON.stringify(chars[0]);
  const chunks = [];
  let i = 0;
  while (i < chars.length) {
    const n = 1; // v8.1-48: per-character fragments increase encoded output size without adding dead code.
    chunks.push(JSON.stringify(chars.slice(i, i + n).join("")));
    i += n;
  }
  return "(" + chunks.join("..") + ")";
}

/* PATCH v8.1-32 (enhancement, suggested by v8.1-31 review): at level>=4 the
   short->real global-alias map is no longer a readable Lua table literal at
   all (even a chunk-assembled one like `p=("p".."rint")` still has "print"
   spelled out across the chunks, grep-able by concatenating strings). Instead
   the whole "p=print,w=warn,..." map is XOR-encoded with a per-build random
   key, embedded as a \ddd-escaped byte string, and reconstructed only at
   runtime inside the IIFE. A static read of the source sees only encoded
   bytes; the real names exist only transiently in the running VM. Env
   capture (__env) and the overall _G_ proxy shape are unchanged from <4. */
function buildGlobalProxyHeader(level) {
  // Bind only the globals that applyGlobalAlias can rewrite. Do not enumerate or
  // merge _G/getgenv/getfenv/shared environments: that creates an unnecessary
  // capability-expansion path and makes executor-only APIs reachable indirectly.
  // Direct references preserve normal Luau/Roblox resolution for the supported
  // aliases while keeping the proxy's backing table finite and auditable.
  const allowed = Object.keys(GLOBAL_ALIAS);
  const envCapture = "local __env={" +
    allowed.map(name => name + "=" + name).join(",") +
    "};";

  if (level < 4) {
    const entries = [];
    for (const [real, short] of Object.entries(GLOBAL_ALIAS)) {
      entries.push(short + "=" + chunkStringExpr(real));
    }
    // Closure-hidden map (M not a free top-level local name)
    return envCapture + "local _G_=(function()local M={" +
      entries.join(",") +
      "};if not setmetatable then local T={} for k,v in pairs(M) do T[k]=__env[v] end return T end return setmetatable({},{__index=function(_,k)return __env[M[k] or k]end})end)();";
  }

  // level >= 4: runtime XOR-decoded map — "short=real,short=real,..." bytes,
  // never present as plaintext or as concatenated string chunks anywhere in
  // the emitted source.
  const mapStr = Object.entries(GLOBAL_ALIAS).map(([real, short]) => short + "=" + real).join(",");
  const bytes = Array.from(new TextEncoder().encode(mapStr)); // ASCII-only: short codes, '=', ','
  const key = 1 + (secureRandomFloat() * 254 | 0);
  const encEscaped = bytes.map(b => "\\" + String(b ^ key).padStart(3, "0")).join("");
  return envCapture + "local _G_=(function()local e=\"" + encEscaped + "\";local k=" + key +
    ";local bx=(bit32 and bit32.bxor)or(function(a,b)local r=0 local m=1 for i=0,7 do local aa=a%2 local bb=b%2 if aa~=bb then r=r+m end a=(a-aa)/2 b=(b-bb)/2 m=m*2 end return r end);" +
    "local d={}for i=1,#e do d[i]=string.char(bx(e:byte(i),k))end;local s=table.concat(d);" +
    "local M={}for kv in s:gmatch('[^,]+')do local kk,vv=kv:match('([^=]+)=([^=]+)');if kk and vv then M[kk]=vv end end;" +
    "if not setmetatable then local T={} for k,v in pairs(M) do T[k]=__env[v] end return T end return setmetatable({},{__index=function(_,k2)return __env[M[k2] or k2]end})end)();";
}


function applyGlobalAlias(src) {
  // Single-pass scope-aware rewrite. Tokens need pos/len from lex().
  let T;
  try { T = lex(src).T; } catch (_) { return src; }

  try {
  const stack = [new Set()];
  const push = () => stack.push(new Set());
  const pop = () => { if (stack.length > 1) stack.pop(); };
  const isLocal = (name) => stack.some(s => s.has(name));
  const addLocal = (name) => { if (name) stack[stack.length - 1].add(name); };

  // Collect function params after "(" until ")", skip type annotations
  function collectParams(startIdx) {
    let j = startIdx;
    while (j < T.length && !(T[j].t === "op" && T[j].v === "(")) j++;
    if (!(T[j] && T[j].t === "op" && T[j].v === "(")) return j;
    j++;
    while (j < T.length && !(T[j].t === "op" && T[j].v === ")")) {
      if (T[j].t === "op" && T[j].v === "...") { j++; continue; }
      if (T[j].t === "id") {
        addLocal(T[j].v);
        j++;
        // skip `: Type`
        if (T[j] && T[j].t === "op" && T[j].v === ":") {
          j++;
          let depth = 0;
          while (j < T.length) {
            const tj = T[j];
            if (tj.t === "op" && "([{".includes(tj.v)) depth++;
            else if (tj.t === "op" && ")]}".includes(tj.v)) {
              if (depth === 0 && tj.v === ")") break;
              depth = Math.max(0, depth - 1);
            } else if (depth === 0 && tj.t === "op" && (tj.v === "," || tj.v === ")")) break;
            j++;
          }
        }
        if (T[j] && T[j].t === "op" && T[j].v === ",") { j++; continue; }
        continue;
      }
      j++;
    }
    return j;
  }

  // until-condition stays in body scope: defer pop until after cond expression
  /* v8.1-45: one entry per open until-condition. A single flag was overwritten when a
     repeat appeared inside another until-condition (e.g. in an IIFE), so the outer
     repeat's scope was never popped and later code kept its locals. */
  const pendingUntil = [];
  /* PATCH v8.1-31 (bug 3 from v8.1-30 review): a stmtKw like `function`, `end`,
     `local`, or `return` can legitimately appear INSIDE the until-condition
     itself when the condition contains an IIFE, e.g.
       until (function() local print = fake; return print end)()
     Previously the pendingUntilPop check fired on that inner `function` token
     and popped the repeat-body scope early, so `print` inside the IIFE no
     longer resolved against the repeat body's `local print` and got rewritten
     to `_G_.p` instead. We now track paren depth from the moment `until` is
     seen and only treat a stmtKw/`;`/eof as ending the condition when depth
     is back to 0 — i.e. we are not nested inside a parenthesized sub-expression
     (which covers IIFE calls `(function() ... end)()` since the whole thing is
     wrapped in balanced parens). Depth tracking shares the same counter across
     any parens met along the way (including a nested function's own `(params)`
     parens); since those are always balanced, depth still correctly returns to
     0 exactly when the until-condition itself ends. */
  const stmtKw = new Set(["end", "else", "elseif", "until", "local", "function", "if", "while", "for", "repeat", "return", "do", "break"]);

  const parts = [];
  let cursor = 0;

  for (let i = 0; i < T.length; i++) {
    const t = T[i];

    // Finish deferred until-pop when we leave the condition
    if (pendingUntil.length) {
      const top = pendingUntil[pendingUntil.length - 1];
      if (t.t === "op" && t.v === "(") top.depth++;
      else if (t.t === "op" && t.v === ")") top.depth = Math.max(0, top.depth - 1);
      /* BUGFIX: a stmt keyword right after an operator (or and/or/not) continues the
         condition, e.g. `until x == function() ... end`. Such a `function` at depth 0
         ended the until-condition early, so names inside it lost the repeat-body scope
         and were wrongly rewritten to _G_.* */
      const prevU = T[i - 1];
      const continuesExpr = !!prevU && ((prevU.t === "op" && ![")", "]", "}"].includes(prevU.v)) || (prevU.t === "kw" && (prevU.v === "and" || prevU.v === "or" || prevU.v === "not")));
      /* BUGFIX: an identifier directly after a completed expression (`until (c)` then
         `print(...)`) starts the next statement, so the until-scope must end there too.
         Before, such a statement kept the repeat-body scope and went unaliased. */
      const prevEnds = !!prevU && ((prevU.t !== "op" && prevU.t !== "kw") || (prevU.t === "op" && [")", "]", "}"].includes(prevU.v)) || (prevU.t === "kw" && (prevU.v === "end" || prevU.v === "nil" || prevU.v === "true" || prevU.v === "false")));
      const newStmtId = t.t === "id" && prevEnds;
      if (top.depth === 0 && !continuesExpr && (newStmtId || t.t === "eof" || (t.t === "kw" && stmtKw.has(t.v) && t.v !== "and" && t.v !== "or" && t.v !== "not") || (t.t === "op" && t.v === ";"))) {
        pop();
        pendingUntil.pop();
      }
    }

    if (t.t === "kw") {
      if (t.v === "for") {
        push();
        let j = i + 1;
        while (T[j] && T[j].t === "id") {
          addLocal(T[j].v);
          j++;
          if (T[j] && T[j].t === "op" && T[j].v === ",") { j++; continue; }
          break;
        }
      } else if (t.v === "function") {
        const prev = T[i - 1];
        const isLocalFn = prev && prev.t === "kw" && prev.v === "local";
        let j = i + 1;
        // optional name / method chain
        if (T[j] && T[j].t === "id") {
          /* PATCH v8.1-30 (bug 1/8 from review): a bare "function name(...)" — local
             or global — introduces/shadows `name` in the enclosing scope for the
             rest of this block, same as a `local` declaration would. Previously only
             `local function` registered the name, so `function print(s) ... end`
             left `print` eligible for GLOBAL_ALIAS rewriting and later `print(...)`
             calls were rewritten to `_G_.p(...)` (the original print), silently
             discarding the user's override. We must NOT do this for a dotted/method
             name (`function obj.fn()` / `function obj:fn()`): there `obj` is being
             *indexed*, not redefined, so registering it as local would wrongly stop
             later rewriting of `obj` when `obj` happens to be a GLOBAL_ALIAS name
             (e.g. `function game.foo() ... game.Bar ... end`). */
          const isDotted = T[j + 1] && T[j + 1].t === "op" && (T[j + 1].v === "." || T[j + 1].v === ":");
          if (!isDotted) addLocal(T[j].v);
          j++;
          while (T[j] && T[j].t === "op" && (T[j].v === "." || T[j].v === ":")) {
            j++;
            if (T[j] && T[j].t === "id") j++;
          }
        }
        // Every function token owns a matching `end` scope, even when the parameter
        // list is malformed. The parser rejects malformed source later; keeping this
        // pass structurally balanced prevents that `end` from popping an outer scope.
        push();
        if (T[j] && T[j].t === "op" && T[j].v === "(") collectParams(j);
      } else if (t.v === "do" || t.v === "while" || t.v === "repeat" || t.v === "if") {
        push();
      } else if (t.v === "end") {
        pop();
      } else if (t.v === "until") {
        // keep body scope for until-condition; pop later
        pendingUntil.push({ depth: 0 });
      } else if (t.v === "else" || t.v === "elseif") {
        pop();
        push();
      } else if (t.v === "local" || t.v === "const") {
        let j = i + 1;
        if (T[j] && T[j].t === "kw" && T[j].v === "function") {
          // local function name handled when we see function
        } else {
          while (j < T.length && T[j].t === "id") {
            addLocal(T[j].v);
            j++;
            if (T[j] && T[j].t === "op" && T[j].v === ":") {
              j++;
              let depth = 0;
              while (j < T.length) {
                const tj = T[j];
                if (tj.t === "op" && "([{".includes(tj.v)) depth++;
                else if (tj.t === "op" && ")]}".includes(tj.v)) depth = Math.max(0, depth - 1);
                else if (depth === 0 && tj.t === "op" && (tj.v === "," || tj.v === "=")) break;
                else if (depth === 0 && (tj.t === "kw" || (tj.t === "op" && tj.v === ";"))) break;
                j++;
              }
            }
            if (T[j] && T[j].t === "op" && T[j].v === ",") { j++; continue; }
            break;
          }
        }
      }
    }

    // Rewrite global id (not member access, not local)
    if (t.t === "id" && GLOBAL_ALIAS[t.v] && !isLocal(t.v) && t.pos !== undefined) {
      const prev = T[i - 1];
      if (!(prev && prev.t === "op" && prev.v === ".")) {
        parts.push(src.slice(cursor, t.pos));
        parts.push("_G_." + GLOBAL_ALIAS[t.v]);
        cursor = t.pos + (t.len || t.v.length);
      }
    }
  }
  while (pendingUntil.length) { pendingUntil.pop(); pop(); }
  parts.push(src.slice(cursor));
  const rewritten = parts.join("");
  return rewritten;
  } finally {
    __wsReleaseTokens(T);
  }
}


/* Deterministic debug builds are isolated to the synchronous build scope. They use
   separate reproducible layout, key, and VM streams; production builds use fresh
   Node CSPRNG streams and discard their buffers at the end of each build. */
/* Deterministic debug builds use an explicit PRNG only through the engine's
   secureRandomFloat/secureKeyFloat adapters. Global Math.random is never patched,
   avoiding process-wide mutable state and accidental cross-request interference. */
function withSeed(seed, fn, allowDeterministicKeys = false) {
  if (typeof fn !== "function") throw new TypeError("withSeed expects a function");
  if (fn.constructor && fn.constructor.name === "AsyncFunction") {
    throw new Error("withSeed does not accept async callbacks; pass an explicit RNG to async work.");
  }
  const hasSeed = seed !== undefined && seed !== null && seed !== "";
  const priorSeededRandom = __wsSeededRandom;
  const priorKeyRandom = __wsSeededKeyRandom;
  const priorKeyOptIn = __wsDeterministicKeyOptIn;
  const priorVmRng = VM_RNG;
  if (hasSeed) {
    const seedText = String(seed);
    __wsSeededRandom = makeRng("WSF_LAYOUT:" + seedText);
    __wsSeededKeyRandom = makeRng("WSF_KEYS:" + seedText);
    __wsDeterministicKeyOptIn = allowDeterministicKeys === true;
    VM_RNG = makeRng("WSF_VM:" + seedText);
  } else {
    __wsSeededRandom = null;
    __wsSeededKeyRandom = null;
    __wsDeterministicKeyOptIn = false;
    VM_RNG = __wsVmCryptoFloat;
  }
  try {
    __wsInitializeVmLayout();
    const result = fn();
    // The only callback passed here is the module's own synchronous build closure.
    // Use Node's intrinsic Promise classifier rather than reading result.then: that
    // avoids executing a user-defined getter or Proxy trap during RNG cleanup.
    if (__WSF_NODE_IS_PROMISE(result)) {
      throw new Error("withSeed callback must be fully synchronous; Promise results are unsupported.");
    }
    return result;
  } finally {
    if (VM_RNG && typeof VM_RNG.wipe === "function") VM_RNG.wipe();
    __wsWipeRandomSources();
    __wsResetVmLayout();
    __wsSeededRandom = priorSeededRandom;
    __wsSeededKeyRandom = priorKeyRandom;
    __wsDeterministicKeyOptIn = priorKeyOptIn;
    VM_RNG = priorVmRng;
  }
}

function obf(src, opts) {
  const hasSeed = !!(opts && opts.seed !== undefined && opts.seed !== null && opts.seed !== "");
  if (hasSeed && !(opts && opts.allowDeterministic === true)) {
    throw new Error("Deterministic builds are debug-only. Set allowDeterministic:true to explicitly permit predictable output; never use that output as a production protection build.");
  }
  return withSeed(opts && opts.seed, () => obfImpl(src, opts), !!(opts && opts.allowDeterministic === true));
}

/* v15.5: rename recognizable VM implementation identifiers without touching string literals.
   This is a presentation hardening layer, not cryptographic secrecy; payload bytes remain recoverable. */
function __wsScrubVmMarkerIdentifiers(source) {
  const rename = new Map([
    ["op", "_q7"], ["opv", "_r4"], ["key", "_m8"], ["opcoded", "_t3"],
    ["opcode", "_p6"], ["opcodes", "_p9"], ["opcodeDecode", "_n2"],
    ["opMap", "_h5"], ["payload", "_x8"], ["payloadBody", "_z4"],
    ["payloadDigest", "_c7"], ["payloadAlphabet", "_b3"]
  ]);
  let out = "", i = 0, n = String(source || "").length;
  source = String(source || "");
  while (i < n) {
    const c = source[i], next = source[i + 1];
    // Preserve quoted strings byte-for-byte: they may contain encoded runtime data.
    if (c === "'" || c === '"' || c === '`') {
      const q = c, start = i++;
      while (i < n) { if (source[i] === "\\") { i += 2; continue; } if (source[i++] === q) break; }
      out += source.slice(start, i); continue;
    }
    // Strip comments from generated VM wrapper; retain line breaks for diagnostics.
    if (c === "-" && next === "-") {
      const lm = /^--\[(=*)\[/.exec(source.slice(i, i + 80));
      if (lm) { const close = "]" + lm[1] + "]", end = source.indexOf(close, i + lm[0].length); const stop = end < 0 ? n : end + close.length; out += source.slice(i, stop).replace(/[^\n]/g, ""); i = stop; }
      else { const end = source.indexOf("\n", i); const stop = end < 0 ? n : end; out += source.slice(i, stop).replace(/[^\n]/g, ""); i = stop; }
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      const start = i++; while (i < n && /[A-Za-z0-9_]/.test(source[i])) i++;
      const token = source.slice(start, i); out += rename.get(token) || token; continue;
    }
    out += c; i++;
  }
  return out;
}

/* Scope-aware token renaming (roadmap P0-1).
   It rewrites only identifier tokens, never text inside strings/comments/member keys.
   This is a conservative token-scope resolver rather than a complete Luau type checker;
   ambiguous syntax causes that identifier to remain unchanged instead of guessing. */
function renameLocalsScopeAware(source, tokens, isSkipped, makeName) {
  const T = tokens.filter(t => t.t !== "eof");
  const root = { id: 0, parent: null, start: 0, end: T.length, bindings: new Map(), children: [] };
  let nextScope = 1;
  const scopes = [root], scopeAt = new Array(T.length), decl = new Map(), deferredFor = [];
  const newScope = (parent, start) => {
    const x = { id: nextScope++, parent, start, end: T.length, bindings: new Map(), children: [] };
    parent.children.push(x); return x;
  };
  const stack = [{kind:"root", scope:root}];
  const current = () => stack[stack.length-1].scope;
  const isKw = (i,v) => T[i] && T[i].t === "kw" && T[i].v === v;
  const isOp = (i,v) => T[i] && T[i].t === "op" && T[i].v === v;
  const addBinding = (name, tokenIndex, scope, visibleFrom, visibleTo=T.length) => {
    if (!name || !scope) return;
    const b = {name, tokenIndex, scope, visibleFrom, visibleTo, key:name+"\u0000scope"+scope.id+"\u0000decl"+tokenIndex, replacement:null};
    if (!scope.bindings.has(name)) scope.bindings.set(name, []);
    scope.bindings.get(name).push(b); decl.set(tokenIndex,b); return b;
  };
  // Precompute simple block scopes. if branches, do/while/for, repeat, and functions are isolated.
  for (let i=0;i<T.length;i++) {
    scopeAt[i] = current();
    if (isKw(i,"function")) {
      let lp=i+1; while(lp<T.length && !isOp(lp,"(")) lp++;
      if (lp<T.length) {
        let d=1, rp=lp+1; for(;rp<T.length && d;rp++){if(isOp(rp,"("))d++; else if(isOp(rp,")"))d--;}
        const close=rp-1, fs=newScope(current(),close+1);
        // parameters are declarations in the function scope
        for(let j=lp+1;j<close;j++) if(T[j].t==="id" && (j===lp+1 || isOp(j-1,","))) addBinding(T[j].v,j,fs,close+1);
        // a method has implicit self
        if(isOp(lp+1,")")===false && false) {}
        stack.push({kind:"function",scope:fs});
        for(let j=i+1;j<=close;j++) scopeAt[j]=current().parent || current();
        i=close; continue;
      }
    }
    if (isKw(i,"do") || isKw(i,"then") || isKw(i,"repeat")) {
      const kind=isKw(i,"do")?"do":isKw(i,"then")?"branch":"repeat";
      const sc=newScope(current(),i+1); stack.push({kind,scope:sc});
      if(kind==="do") {
        // for-loop variables declared between `for` and this `do` belong to loop body.
        for(const f of deferredFor.splice(0)) for(const ix of f.indices) addBinding(T[ix].v,ix,sc,i+1);
      }
    } else if (isKw(i,"else") || isKw(i,"elseif")) {
      if(stack.length>1 && stack[stack.length-1].kind==="branch") { const old=stack.pop(); old.scope.end=i; }
      if(isKw(i,"else")) { const sc=newScope(current(),i+1); stack.push({kind:"branch",scope:sc}); }
    } else if (isKw(i,"for")) {
      let j=i+1, ids=[]; while(T[j]&&T[j].t==="id"){ids.push(j);j++;if(isOp(j,","))j++;else break;}
      deferredFor.push({indices:ids});
    } else if (isKw(i,"end")) {
      if(stack.length>1){const x=stack.pop();x.scope.end=i;}
    } else if (isKw(i,"until")) {
      // repeat locals remain visible in the until expression; close after the condition below.
      const top=stack[stack.length-1]; if(top&&top.kind==="repeat") { top.scope.end=i; }
    }
    scopeAt[i] = current();
  }
  // Rebuild scope association with a forward stack pass (above pass creates boundaries).
  // Declarations: local names, local functions, global function names, loop vars, parameters.
  for(let i=0;i<T.length;i++) {
    if(isKw(i,"local")) {
      if(isKw(i+1,"function") && T[i+2] && T[i+2].t==="id") {
        const sc=scopeAt[i]||root; addBinding(T[i+2].v,i+2,sc,i+2); continue;
      }
      let j=i+1, names=[]; while(T[j]&&T[j].t==="id"){names.push(j);j++;if(isOp(j,","))j++;else break;}
      if(!names.length) continue;
      // The initializer sees the outer binding (local x = x). Estimate statement end conservatively.
      let end=j, depth=0;
      if(isOp(j,"=")) {
        end=j+1;
        for(;end<T.length;end++) {
          const t=T[end]; if(t.t==="op"&&"([{ ".includes(t.v))depth++; else if(t.t==="op"&&")]}".includes(t.v)){if(depth===0)break;depth--;}
          const prev = T[end-1];
          const lineBoundary = end > j + 1 && prev && t.l > prev.l &&
            (prev.t === "id" || prev.t === "num" || prev.t === "str" || (prev.t === "op" && [")", "]", "}"].includes(prev.v)) || (prev.t === "kw" && ["true", "false", "nil"].includes(prev.v))) &&
            !(t.t === "op" && [".", ":", ",", "=", "+", "-", "*", "/", "//", "%", "^", "..", "and", "or", "(", "[", "{"].includes(t.v));
          const beginsNextStatement = end > j + 1 && t.t === "kw" && ["local","return","if","while","for","function","do","repeat","break"].some(k => isKw(end,k));
          if (depth === 0 && (isOp(end,";") || beginsNextStatement || lineBoundary)) break;
        }
      }
      const sc=scopeAt[i]||root; for(const ix of names) addBinding(T[ix].v,ix,sc,Math.min(T.length,end+1));
    }
  }
  // Resolve each identifier to the nearest visible declaration. Fields/table keys are excluded.
  const replacements=[];
  for(let i=0;i<T.length;i++) {
    const t=T[i]; if(t.t!=="id" || decl.has(i)) continue;
    const prev=T[i-1], next=T[i+1];
    if(prev&&prev.t==="op"&&(prev.v==="."||prev.v===":")) continue;
    if(next&&next.t==="op"&&next.v==="=" && i>0) {
      // table key only when an enclosing table brace is still open; handled by caller field exclusions.
    }
    let sc=scopeAt[i]||root, found=null;
    while(sc) {
      const arr=sc.bindings.get(t.v);
      if(arr) for(let k=arr.length-1;k>=0;k--) {const b=arr[k];if(i>=b.visibleFrom&&i<b.visibleTo){found=b;break;}}
      if(found)break; sc=sc.parent;
    }
    if(found) {
      if(!found.replacement) found.replacement=makeName(found.key);
      replacements.push({start:t.pos,end:t.pos+t.len,text:found.replacement});
    }
  }
  // Declarations are rewritten with their own binding names.
  for(const [ix,b] of decl) if(b) {
    if(!b.replacement) b.replacement=makeName(b.key);
    replacements.push({start:T[ix].pos,end:T[ix].pos+T[ix].len,text:b.replacement});
  }
  replacements.sort((a,b)=>b.start-a.start);
  let out=source; let last=source.length+1;
  for(const r of replacements) { if(r.end>last) continue; out=out.slice(0,r.start)+r.text+out.slice(r.end); last=r.start; }
  return {code:out, renamed:replacements.length};
}

// Whole-output VC85 packaging for VM mode, based on base85-main/src/vc85.php.
// Mode 2 alphabet: ASCII85 characters with quote/backslash replacements ("=>v, '=>w, \=>x).
// The literal key `~ = (#158#):10` is itself encoded with the ordinary VC85 alphabet;
// its decimal seed (158) rotates the alphabet for the complete VM payload.
const __WS_VC85_ALPHABET = (() => {
  let a = "";
  for (let i = 0; i < 85; i++) {
    const c = String.fromCharCode(33 + i);
    a += c === '"' ? "v" : c === "'" ? "w" : c === "\\" ? "x" : c;
  }
  return a;
})();
const __WS_VC85_KEY_TEXT = "~ = (#158#):10";
function __wsEncode85Bytes(bytes, alphabet) {
  const originalLength = bytes.length;
  while (bytes.length % 4) bytes.push(0);
  let out = "";
  for (let i = 0; i < bytes.length; i += 4) {
    let value = bytes[i] * 16777216 + bytes[i + 1] * 65536 + bytes[i + 2] * 256 + bytes[i + 3];
    const digits = new Array(5);
    for (let j = 4; j >= 0; j--) {
      digits[j] = alphabet[value % 85];
      value = Math.floor(value / 85);
    }
    out += digits.join("");
  }
  const useful = originalLength ? Math.ceil(originalLength / 4) * 5 - ((4 - (originalLength % 4)) % 4) : 0;
  return { payload: out.slice(0, useful), length: originalLength };
}
function __wsEncodeVC85(text, alphabet) {
  return __wsEncode85Bytes(Array.from(new TextEncoder().encode(text)), alphabet);
}
function __wsRotateVC85Alphabet(alphabet, seed) {
  const n = ((seed % alphabet.length) + alphabet.length) % alphabet.length;
  return alphabet.slice(n) + alphabet.slice(0, n);
}
function __wsWrapWholeVmBase85(vmSource) {
  const keyEncoded = __wsEncodeVC85(__WS_VC85_KEY_TEXT, __WS_VC85_ALPHABET);
  const payloadAlphabet = __wsRotateVC85Alphabet(__WS_VC85_ALPHABET, 158);
  const enc = __wsEncodeVC85(vmSource, payloadAlphabet);
  // Build-time rolling digest detects accidental truncation/corruption; it is not a cryptographic signature.
  const digestMod = 2147483629;
  let payloadDigest = 0;
  for (const b of new TextEncoder().encode(vmSource)) payloadDigest = (payloadDigest * 31 + b + 1) % digestMod;
  // Bootstrap diagnostics are Base85-encoded. The tiny message decoder must remain in the bootstrap,
  // because errors can occur before the VM payload has been decoded/compiled.
  const msg = (value) => {
    const encoded = __wsEncodeVC85(value, __WS_VC85_ALPHABET);
    return "msg('" + encoded.payload + "'," + encoded.length + ")";
  };
  return "-- VM payload encoded with key-derived VC85; bootstrap diagnostics are VC85 encoded; requires loadstring/load, bit32, buffer\n" +
    "local sa='" + __WS_VC85_ALPHABET + "';" +
    "local function msg(p,n) local r={};for i=1,#sa do r[string.sub(sa,i,i)]=i-1 end;local o={};for i=1,#p,5 do local v=0;local c=math.min(5,#p-i+1);for j=0,4 do local ch=string.sub(p,i+j,i+j);if ch=='' then ch=string.sub(sa,85,85) end;v=v*85+(r[ch] or 0) end;local z=string.char(math.floor(v/16777216)%256,math.floor(v/65536)%256,math.floor(v/256)%256,v%256);local take=c==5 and 4 or c-1;if take>0 then o[#o+1]=string.sub(z,1,take) end end;return string.sub(table.concat(o),1,n) end;" +
    "if type(bit32)~='table' or type(bit32.bxor)~='function' then error(" + msg("WSFuscate runtime requirement missing: bit32") + ",0) end;if type(buffer)~='table' or type(buffer.fromstring)~='function' or type(buffer.len)~='function' then error(" + msg("WSFuscate runtime requirement missing: buffer library") + ",0) end;if type(table.pack)~='function' or type(table.unpack)~='function' then error(" + msg("WSFuscate runtime requirement missing: table.pack/table.unpack") + ",0) end;" +
    "local function dec(p,a,n) if #a~=85 then error(" + msg("Payload decoder: alphabet length is not 85") + ",0) end;local r={};for i=1,#a do local ch=string.sub(a,i,i);if r[ch]~=nil then error(" + msg("Payload decoder: duplicate alphabet character") + ",0) end;r[ch]=i-1 end;local o={};local oi=0;if #p%5==1 then error(" + msg("Payload decoder: invalid encoded length") + ",0) end;for i=1,#p,5 do local v=0;local c=math.min(5,#p-i+1);for j=0,4 do local ch=string.sub(p,i+j,i+j);if ch=='' then ch=string.sub(a,85,85) end;local d=r[ch];if d==nil then error(" + msg("Payload decoder: invalid payload character at ") + "..tostring(i+j),0) end;v=v*85+d end;if c==5 and v>4294967295 then error(" + msg("Payload decoder: 32-bit block overflow") + ",0) end;local b1=math.floor(v/16777216)%256;local b2=math.floor(v/65536)%256;local b3=math.floor(v/256)%256;local b4=v%256;local z=string.char(b1,b2,b3,b4);local take=c==5 and 4 or c-1;if take>0 then oi=oi+1;o[oi]=string.sub(z,1,take) end end;local raw=table.concat(o);if #raw<n then error(" + msg("Payload decoder: decoded payload shorter than declared length") + ",0) end;return string.sub(raw,1,n) end;" +
    "local k='" + keyEncoded.payload + "';local key=dec(k,sa," + keyEncoded.length + ");local seed=tonumber(string.match(key,'%(#(%d+)#%)'));if not seed then error(" + msg("Payload decoder: key marker (#number#) not found") + ",0) end;local a=string.sub(sa,seed%85+1)..string.sub(sa,1,seed%85);" +
    "local s=dec('" + enc.payload + "',a," + enc.length + ");local h=0;for i=1,#s do h=(h*31+string.byte(s,i)+1)%" + digestMod + " end;if h~=" + payloadDigest + " then error(" + msg("Payload decoder: decoded payload checksum mismatch") + ",0) end;local loader=loadstring or load;if type(loader)~='function' then error(" + msg("Payload decoder: this runtime does not provide loadstring/load") + ",0) end;local f,e=loader(s);if not f then error(" + msg("VM compile error: ") + "..tostring(e),0) end;return f(...)";
}

/* Inline runtime_lock / anti_hook / anti_tamper checks are deliberately bounded runtime-contract tests.
   They can detect selected primitive behavior changes, not arbitrary RemoteEvent hooks,
   native injectors, external process memory, or memory dumps. A mismatch raises an explicit
   error; it never corrupts or self-destructs the VM. */
function __wsBuildInlineMacroGuard(profile) {
  const id = () => "__wsg" + Array.from({length: 7}, () => "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"[secureRandomFloat() * 52 | 0]).join("");
  const t=id(), p=id(), e=id(), ok=id(), a=id(), b=id(), c=id(), d=id(), f=id();
  if (profile === "anti_hook") {
    const fl=id(), by=id(), bx=id(), bc=id(), bl=id(), bw=id(), br=id(), pack=id(), unpack=id();
    const g=id(), h=id(), i=id(), j=id(), k=id();
    return `function() local ${t}=type;local ${p}=pcall;local ${e}=error;local ${fl}=math.floor;local ${by}=string.byte;local ${bx}=__bit.bxor;local ${bc}=buffer and buffer.create;local ${bl}=buffer and buffer.len;local ${bw}=buffer and buffer.writeu8;local ${br}=buffer and buffer.readu8;local ${pack}=table.pack;local ${unpack}=table.unpack;local ${ok},${a},${b},${c},${d},${f},${g},${h},${i},${j},${k}=${p}(function()local z=${bc}(2);${bw}(z,0,90);return ${t}(1),${t}("x"),${t}(${p}),${fl}(3.75),${by}("WSF",2),${bx}(5,3),${bl}(z),${br}(z,0),${t}(${pack}),${t}(${unpack})end);if not ${ok} or ${a}~="number" or ${b}~="string" or ${c}~="function" or ${d}~=3 or ${f}~=83 or ${g}~=6 or ${h}~=2 or ${i}~=90 or ${j}~="function" or ${k}~="function" then ${e}(${luaHiddenString("WSF runtime contract check failed")},0) end end`;
  }
  if (profile === "runtime_lock") {
    return `function() local ${t}=type;local ${p}=pcall;local ${e}=error;local ${ok},${a},${b},${c},${d},${f}=${p}(function()return ${t}(1),math.floor(3.75),string.byte("WSF",2),__bit.bxor(5,3),buffer and ${t}(buffer.create)end);if not ${ok} or ${a}~="number" or ${b}~=3 or ${c}~=83 or ${d}~=6 or ${f}~="function" then ${e}(${luaHiddenString("WSF runtime contract lock failed")},0) end end`;
  }
  if (profile === "anti_tamper") {
    return `function() local ${t}=type;local ${p}=pcall;local ${e}=error;local ${ok},${a},${b},${c},${d}=${p}(function()return ${t}(1),math.floor(3.75),string.byte("WSF",2),__bit.bxor(5,3)end);if not ${ok} or ${a}~="number" or ${b}~=3 or ${c}~=83 or (${d}~=6) then ${e}(${luaHiddenString("WSF runtime integrity check failed")},0) end end`;
  }
  return null;
}

/* Region-aware inline macro preprocessing. Replacements are represented by private identifiers
   until all whole-source passes finish, so generated decoder text is not re-encoded or renamed.
   Light regions retain original literal spelling; balanced/hardened regions mask strings and bounded
   decimal integers. runtime_lock adds a bounded runtime contract check at the marker location. */
function __wsMacroTargetLevel(profile, globalLevel) {
  const base = Number.isFinite(Number(globalLevel)) ? Math.max(1, Math.min(5, Number(globalLevel))) : 3;
  if (profile === "balanced") return Math.min(3, base);
  if (profile === "light") return Math.min(2, base);
  return 5;
}
function __wsPrepareInlineMacroSource(source, opts) {
  const parsed = __wsValidateInlineMacros(source);
  if (parsed.errors.length) throw new Error("Inline macro syntax error: " + parsed.errors.join("; "));
  if (!parsed.regions.length) return { source, replacements: new Map(), regions: [] };
  if (opts && opts.vm) {
    // Arbitrary source regions cannot be split into independent VMs without risking lexical-scope changes.
    // Anti profiles place a bounded runtime-contract check at the region entry and may request local payload consistency diagnostics.
    const lines = String(source).split(/\r?\n/);
    const cleanedLines = [];
    for (const line of lines) {
      const begin = line.match(/^\s*--\s*WSF:BEGIN\s+profile=(light|balanced|hardened|runtime_lock|anti_hook|anti_tamper)\s*$/i);
      if (begin) {
        const profile = begin[1].toLowerCase();
        if (profile === "runtime_lock" || profile === "anti_hook" || profile === "anti_tamper") {
          const guard = __wsBuildInlineMacroGuard(profile);
          if (guard) cleanedLines.push("(" + guard + ")()");
        }
        continue;
      }
      if (/^\s*--\s*WSF:END\s*$/i.test(line)) continue;
      cleanedLines.push(line);
    }
    const hardenedProfiles = new Set(["hardened", "runtime_lock", "anti_hook", "anti_tamper"]);
    return {
      source: cleanedLines.join("\n"), replacements: new Map(), regions: parsed.regions,
      vmHardened: parsed.regions.some(r => hardenedProfiles.has(r.profile)),
      vmAntiHook: parsed.regions.some(r => r.profile === "anti_hook"),
      vmAntiTamper: parsed.regions.some(r => r.profile === "anti_tamper"),
      vmRuntimeLock: parsed.regions.some(r => r.profile === "runtime_lock")
    };
  }
  const lines = String(source).split(/\r?\n/);
  const lineStarts = [];
  let cursor = 0;
  for (const line of lines) {
    lineStarts.push(cursor);
    cursor += line.length;
    if (source.slice(cursor, cursor + 2) === "\r\n") cursor += 2;
    else if (source[cursor] === "\n") cursor += 1;
  }
  const profileAtLine = new Map();
  for (const r of parsed.regions) {
    for (let ln = r.startLine + 1; ln < r.endLine; ln++) profileAtLine.set(ln, r.profile);
  }
  const edits = [];
  const replacements = new Map();
  let placeholderIndex = 0;
  const alphaIndex = n => { let out = ""; do { out = String.fromCharCode(65 + (n % 26)) + out; n = Math.floor(n / 26) - 1; } while (n >= 0); return out; };
  const makePlaceholder = expression => {
    let name;
    do { name = "__WSF_MACRO_LITERAL_" + alphaIndex(placeholderIndex++) + "__"; }
    while (source.includes(name) || replacements.has(name));
    replacements.set(name, expression);
    return name;
  };
  const tokens = lex(source).T;
  try {
  for (const tk of tokens) {
    const profile = profileAtLine.get(tk.l);
    if (!profile || tk.t === "eof") continue;
    const raw = source.slice(tk.pos, tk.pos + tk.len);
    if (tk.t === "str") {
      if (raw.startsWith("`")) {
        // Preserve interpolation syntax and expressions verbatim; encoding interpolation safely
        // requires parsing embedded expressions rather than treating the entire token as text.
        edits.push({ start: tk.pos, end: tk.pos + tk.len, text: makePlaceholder(raw) });
        continue;
      }
      const expr = profile !== "light"
        ? (() => {
            const priorLevel = levelHint, priorStrict = strictStringMasking, priorXor = forceRuntimeXor;
            try { levelHint = __wsMacroTargetLevel(profile, priorLevel); strictStringMasking = true; forceRuntimeXor = true; return encStr(tk.v); }
            finally { levelHint = priorLevel; strictStringMasking = priorStrict; forceRuntimeXor = priorXor; }
          })()
        : raw;
      edits.push({ start: tk.pos, end: tk.pos + tk.len, text: makePlaceholder(expr) });
    } else if (tk.t === "num") {
      // Only rewrite small plain decimal integers; preserve floats, exponents, bases and large integers.
      if (profile === "light") {
        edits.push({ start: tk.pos, end: tk.pos + tk.len, text: makePlaceholder(raw) });
      } else if (/^\d{1,9}$/.test(raw) && Number.isSafeInteger(Number(raw))) {
        const value = Number(raw);
        const delta = 17 + ((tk.pos * 31 + tk.l * 7) % 83);
        edits.push({ start: tk.pos, end: tk.pos + tk.len, text: makePlaceholder("(" + value + "+" + delta + "-" + delta + ")") });
      }
    }
  }
  } finally {
    __wsReleaseTokens(tokens);
  }
  // Remove marker lines. anti profiles leave a protected call placeholder at the region entry;
  // the full function expression is restored only after global transforms finish.
  for (let i = 0; i < lines.length; i++) {
    const begin = lines[i].match(/^\s*--\s*WSF:BEGIN\s+profile=(light|balanced|hardened|runtime_lock|anti_hook|anti_tamper)\s*$/i);
    const isEnd = /^\s*--\s*WSF:END\s*$/i.test(lines[i]);
    if (begin || isEnd) {
      const afterLine = lineStarts[i] + lines[i].length;
      const newlineText = source.slice(afterLine, afterLine + 2) === "\r\n" ? "\r\n" : (source[afterLine] === "\n" ? "\n" : "");
      let guardCall = "";
      if (begin && (begin[1].toLowerCase() === "runtime_lock" || begin[1].toLowerCase() === "anti_hook" || begin[1].toLowerCase() === "anti_tamper")) {
        const guard = __wsBuildInlineMacroGuard(begin[1].toLowerCase());
        if (guard) guardCall = makePlaceholder("(" + guard + ")") + "()";
      }
      edits.push({ start: lineStarts[i], end: afterLine + newlineText.length, text: guardCall + newlineText });
    }
  }
  edits.sort((a,b) => b.start - a.start);
  let transformed = String(source);
  let lastStart = Infinity;
  for (const e of edits) {
    if (e.end > lastStart) throw new Error("Inline macro replacement overlap detected.");
    transformed = transformed.slice(0, e.start) + e.text + transformed.slice(e.end);
    lastStart = e.start;
  }
  return { source: transformed, replacements, regions: parsed.regions };
}
function __wsRestoreInlineMacroPlaceholders(code, replacements) {
  if (!replacements || !replacements.size) return code;
  // Exact token names are unique and never appear in generated decoder payloads by construction.
  for (const [name, expr] of replacements) code = code.split(name).join(expr);
  return code;
}

/* Avoid embedding the entire VM runtime for tiny scripts. Eligibility is based on
   source/token/instruction budgets rather than syntax shape, so small functions and
   simple branches can also use the compact source transforms. Any inline macro is
   kept on its requested path. Set autoVmSize:false to force full VM output. */
function __wsShouldAutoSizeVm(source, opts, macroPrepared) {
  if (!opts || !opts.vm || opts.autoVmSize === false || opts.forceVm === true || opts.vmDebug === true) return false;
  if (macroPrepared && Array.isArray(macroPrepared.regions) && macroPrepared.regions.length) return false;
  let clean = String(source || '').trim();
  if (!clean || clean.length > 128) return false;
  try { clean = stripComments(clean).trim(); } catch (_) {}
  let tokens;
  let tokenized;
  try { tokenized = lex(clean); tokens = tokenized.T.filter(t => t.t !== 'eof'); } catch (_) { return false; }
  if (!tokens.length || tokens.length > 40) { __wsReleaseTokens(tokenized.T); return false; }
  __wsReleaseTokens(tokenized.T);
  try {
    const proto = compileToBytecode(clean);
    if (!proto || !Array.isArray(proto.code)) return false;
    const budgets = { instructions: 0, prototypes: 0, maxDepth: 0 };
    const visit = (p, depth) => {
      budgets.instructions += (p.code || []).length;
      budgets.prototypes += (p.protos || []).length;
      budgets.maxDepth = Math.max(budgets.maxDepth, depth);
      if (budgets.instructions > 24 || budgets.prototypes > 2 || depth > 2) return false;
      for (const child of p.protos || []) if (!visit(child, depth + 1)) return false;
      return true;
    };
    return visit(proto, 0) && budgets.instructions <= 24 && budgets.prototypes <= 2 && budgets.maxDepth <= 2;
  } catch (_) { return false; }
}

function __wsBuildForcedSourceGuard() {
  // Hidden generated Luau prelude. This is deliberately added after all source
  // transformations, so it never appears in the user's input editor and cannot
  // be accidentally renamed/flattened as if it were user code.
  const ids = Array.from({length: 8}, () => "_" + Array.from({length: 12 + (secureRandomFloat()*7|0)}, () => "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"[secureRandomFloat()*52|0]).join(""));
  const [ty, pc, ts, st, mt, tb, ok, valid] = ids;
  return `do local ${ty}=type;local ${pc}=pcall;local ${st}=string;local ${mt}=math;local ${tb}=table;local ${ok},${valid}=${pc}(function() return ${ty}=="function" and ${ty}(${pc})=="function" and ${ty}(${st})=="table" and ${ty}(${st}.byte)=="function" and ${ty}(${mt})=="table" and ${ty}(${mt}.floor)=="function" and ${ty}(${tb})=="table" and ${ty}(${tb}.insert)=="function" end);if not ${ok} or not ${valid} then error("WSF_RUNTIME_INTEGRITY",0) end end;`;
}

/* Build-time source prelude: these Luau checks are prepended to the user's source
   BEFORE macro preprocessing, parsing, renaming, string encoding, CFF and/or VM
   compilation. Thus they travel through the same obfuscation pipeline as user code.
   The error/pcall sentinel and primitive behavior checks detect selected runtime-contract changes,
   but are not a trusted anti-debug boundary and cannot prove client integrity. */
function __wsBuildObfuscatedProtectionSource() {
  const used = new Set();
  const id = () => {
    let value;
    do { value = "_" + Array.from({length: 14}, () => "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"[secureRandomFloat() * 52 | 0]).join(""); }
    while (used.has(value));
    used.add(value);
    return value;
  };
  const [ty, pc, er, mt, st, tb, ok, a, b, c, d, e, f, g, h, marker, threw, reason] = Array.from({length: 19}, id);
  return `do local ${ty}=type;local ${pc}=pcall;local ${er}=error;local ${mt}=math;local ${st}=string;local ${tb}=table;local ${ok},${a},${b},${c},${d},${e}=${pc}(function() return ${ty}(${ty}),${ty}(${pc}),${ty}(${mt}),${ty}(${st}),${ty}(${tb}) end);if not ${ok} or ${a}~="function" or ${b}~="function" or ${c}~="table" or ${d}~="table" or ${e}~="table" then ${er}("WSF_ANTITAMPER_PRIMITIVE_CHECK",0) end;local ${ok},${f},${g},${h}=${pc}(function() return ${mt}.floor(3.75),${st}.byte("WSF",2),${tb}.concat({"W","S","F"}) end);if not ${ok} or ${f}~=3 or ${g}~=83 or ${h}~="WSF" then ${er}("WSF_ANTITAMPER_BEHAVIOR_CHECK",0) end;local ${ok},${a},${b}=${pc}(function() return ${ty}(1),${ty}("x") end);if not ${ok} or ${a}~="number" or ${b}~="string" then ${er}("WSF_ANT_HOOK_TYPE_CHECK",0) end;local ${marker}="WSF_ERROR_SENTINEL";local ${threw},${reason}=${pc}(function() ${er}(${marker},0) end);if ${threw} or ${reason}~=${marker} then ${er}("WSF_ANT_ERROR_SEMANTICS",0) end end;`;
}

function obfImpl(src, opts) {
  // Keep the exact user input for byte-accurate reporting; directives are removed
  // from the transformed body below, not from the input-size measurement.
  const __wsOriginalInput = String(src ?? "");
  // Hybrid directives are opt-in and intentionally local to this build: --!ws:vm
  // forces VM mode; --!ws:cff enables CFF for source mode. The directive line is
  // removed before parsing so it cannot leak into emitted code or alter line tokens.
  const directiveVM = /^\s*--!ws:vm\b/im.test(__wsOriginalInput);
  const directiveCFF = /^\s*--!ws:cff\b/im.test(__wsOriginalInput);
  if (directiveVM && opts && !opts.vm) opts = { ...opts, vm:true, autoVmSize:false, forceVm:true };
  if (directiveCFF && opts && !opts.flow) opts = { ...opts, flow:true };
  src = __wsOriginalInput.replace(/^\s*--!ws:(?:vm|cff)\b[^\r\n]*(?:\r?\n|$)/gim, "");
  // All public size fields are bytes, not JavaScript UTF-16 code units.
  const __wsUserSourceLength = Buffer.byteLength(__wsOriginalInput, "utf8");
  const sourceDirective = /^(?:\uFEFF)?[\t ]*(--!(?:strict|nonstrict|nocheck)\b[^\r\n]*)(?:\r?\n|$)/.exec(src);
  const sourceDirectiveText = sourceDirective ? sourceDirective[1] + "\n" : "";
  if (sourceDirective) src = src.slice(sourceDirective[0].length);
  // Auto-size is opt-in only. The default public contract forces VM mode,
  // so tiny straight-line programs are never silently sent through source mode. Larger scripts and explicit --!ws:vm remain VM.
  let __wsAutoSizedToSource = false;
  if (!directiveVM && opts && opts.vm && opts.autoVmSize !== false && opts.forceVm !== true) {
    try {
      const __wsMacroProbe = __wsPrepareInlineMacroSource(src, opts);
      if (__wsShouldAutoSizeVm(src, opts, __wsMacroProbe)) {
        opts = { ...opts, vm: false };
        __wsAutoSizedToSource = true;
      }
    } catch (_) {
      // Leave the requested VM path intact; the normal parser/build path reports errors.
    }
  }
  // VM-mode already has its own bytecode, dispatch, capability, and optional
  // payload-integrity checks. Do not prepend the source-mode protection probe
  // program to VM input: that probe exercises nested pcall -> VM-closure calls
  // before the user's code and can fail in the VM call bridge with a misleading
  // "attempt to call a nil value". Keep the probe unchanged for source mode.
  const __wsVmProtectionMode = !!(opts && opts.vm) || directiveVM;
  const __wsSourceProtectionPrelude = __wsVmProtectionMode
    ? ""
    : __wsBuildObfuscatedProtectionSource() + "\n";
  src = sourceDirectiveText + __wsSourceProtectionPrelude + src;
  const requestedSettings = { level: +opts.level, name: !!opts.name, str: !!opts.str, strictStrings: opts.strictStrings !== false,
    runtimeXor: opts.runtimeXor !== false, runtimeBinding: !!opts.runtimeBinding, dead: !!opts.dead, flow: !!opts.flow, vm: !!opts.vm, autoVmSize: opts.autoVmSize !== false, forceVm: opts.forceVm === true,
    profile: opts.profile || "balanced", vmEnvironment: opts.vmEnvironment || "roblox", allowRequire: !!opts.allowRequire, allowCoroutine: !!opts.allowCoroutine, vmCoroutineScheduler: !!opts.vmCoroutineScheduler, vmDebug: !!opts.vmDebug, timingNoise: !!opts.timingNoise, sourceMap: !!opts.sourceMap,
    cmt: !!opts.cmt, kw: opts.kw !== false, constWrap: !!opts.constWrap,
    numberEncoding: opts.numberEncoding !== false,
    allowVmFallback: opts.allowVmFallback === true,
    maxCallDepth: opts.maxCallDepth,
    maxInputBytes: opts.maxInputBytes,
    integrity: opts.integrity !== false, antiHookMode: opts.antiHookMode || "balanced",
    runtimeSize: opts.runtimeSize || "compact", portableFallbacks: opts.portableFallbacks !== false,
    minify: opts.minify !== false };
  let { level, name, str, dead, flow, cmt } = opts;
  /* FIX #3 #15 */
  let const_ = !!opts.constWrap;
  const useVm = !!opts.vm;
  let sourceLite = false;
  let vmFallbackReason = null; /* BUGFIX v8.1-33: surfaced in the UI when VM build falls back */
  const warnings = [];         /* v8.1-40: non-fatal problems shown in the status line */
  if (__wsAutoSizedToSource) warnings.push("Auto-size selected the source transform path for a tiny straight-line program; set autoVmSize:false or add --!ws:vm to force VM mode.");
  opts.integrityPolicy = opts.integrityPolicy === "diagnostic" ? "diagnostic" : "strict";
  opts.antiHookMode = ["strict","balanced","off"].includes(opts.antiHookMode) ? opts.antiHookMode : "balanced";
  opts.maxCallDepth = Number.isInteger(opts.maxCallDepth) ? Math.max(16, Math.min(4096, opts.maxCallDepth)) : 512;
  const deterministicBuild = opts.seed !== undefined && opts.seed !== null && opts.seed !== "";
  if (deterministicBuild) warnings.push("deterministic seed mode is enabled by explicit debug opt-in: output keys become predictable and must never be used for production protection");
  if (opts.vmEnvironment === "extended") warnings.push("extended VM environment exposes additional Roblox APIs; it is a compatibility mode, not a sandbox");
  if (opts.allowRequire && opts.vmEnvironment !== "strict") warnings.push("VM require capability is enabled by explicit request; only use trusted module identifiers");
  if (opts.allowCoroutine && opts.vmEnvironment !== "strict") warnings.push("VM coroutine API is exposed; the internal VM coroutine scheduler remains independently controlled by vmCoroutineScheduler.");
  if (opts.vmCoroutineScheduler) warnings.push("The internal VM coroutine scheduler is enabled by explicit request; external coroutine yields are not supported inside shared VM dispatch.");
  if (opts.runtimeBinding && !useVm) warnings.push("runtime contract key binding is VM-only; enable Bytecode VM to activate it");
  let hideKw = opts.kw !== false;
  id_map.clear();
  v_counter = 0;
  const t0 = performance.now();
  levelHint = level;
  strictStringMasking = opts.strictStrings !== false;
  forceRuntimeXor = opts.runtimeXor !== false;

  const originalSourceLength = __wsUserSourceLength;
  const macroPrepared = __wsPrepareInlineMacroSource(src, opts);
  const macroReplacements = macroPrepared.replacements;
  src = macroPrepared.source;
  if (useVm && macroPrepared.vmHardened) {
    opts.profile = "hardened";
    warnings.push("hardened/anti macro selected the hardened VM profile for the entire script; VM compilation is not region-local");
    if (macroPrepared.vmAntiHook) warnings.push("anti_hook performs bounded primitive behavior checks; it cannot universally detect a specific RemoteEvent hook");
    if (macroPrepared.vmAntiTamper) warnings.push("anti_tamper forces payload integrity validation and explicit fail-closed errors; no VM self-destruction is installed");
  }
  let work = src;
  /* v8.1-40: long strings and backtick interpolation are normalized BEFORE comment stripping,
     so a "--" inside a string literal is not mistaken for a comment. */
  work = normalizeLongStrings(work);
  const interp = convertInterpolatedStrings(work);
  work = interp.code;

  /* Preserve Luau compilation directives at their original locations. */
  if (cmt) work = stripComments(work);

  /* v15.11: VM is mandatory when requested. Do not auto-select source-lite for tiny scripts. */
  if (useVm) {
    sourceLite = false;
    opts = { ...opts, vm: true, autoVmSize: false, forceVm: true };
  }

  /* UPGRADE: Bytecode virtualization — emit numeric array + VM, no user if/then/end */
  if (useVm && !sourceLite) {
    let vsrc = work;
    // optional: still strip comments already done
    try {
      /* BUGFIX: the VM engine ends with a top-level "return". Lua only allows return as
         the last statement of a block, so any statement after it (junk/padding) was a
         syntax error. Wrapping the engine in do...end keeps the output valid. */
      const macroRequiresIntegrity = !!(macroPrepared.vmAntiHook || macroPrepared.vmAntiTamper || macroPrepared.vmRuntimeLock);
      const bindingRequiresIntegrity = !!opts.runtimeBinding;
      // Forced hidden protection: the VM integrity/runtime checks are injected by the
      // generator and are never sourced from the visible input editor. vmDebug may
      // change diagnostics, but it must not disable the generated integrity layer.
      if (opts.vmDebug && opts.integrity === true) warnings.push("VM diagnostic mode does not disable explicitly enabled integrity checks");
      let vout = "do " + emitVirtualizedLuau(vsrc, { integrity: opts.integrity === true || macroRequiresIntegrity, profile: opts.profile, vmEnvironment: opts.vmEnvironment || "roblox", timingNoise: !!opts.timingNoise, runtimeBinding: !!opts.runtimeBinding, integrityPolicy: opts.integrityPolicy, antiHookMode: opts.antiHookMode, portableFallbacks: opts.portableFallbacks !== false, allowRequire: !!opts.allowRequire, allowCoroutine: !!opts.allowCoroutine, vmCoroutineScheduler: !!opts.vmCoroutineScheduler, vmDebug: !!opts.vmDebug, runtimeSize: opts.runtimeSize || "compact", maxCallDepth: opts.maxCallDepth, forceVm: opts.forceVm === true }) + " end";
      // Compact VM output: do not inject inert padding by default. Optional dead-code
      // padding remains disabled in VM mode because it can dominate output size without
      // improving runtime protection. The payload and dispatch table remain randomized.
      vout = stripComments(vout);
      // Fail closed on common token-boundary corruption seen in generated VM output.
      // This is a structural sanity check, not a substitute for executing Luau in its target runtime.
      if (!vout || !vout.trim()) throw new Error("VM emitter produced empty output");
      const mergedKeywords = /\b(?:endlocal|enddo|endreturn|endfunction|endwhile|endif|thenlocal|elselocal|returnlocal)\b/i;
      if (mergedKeywords.test(vout)) throw new Error("VM output failed token-boundary validation");
      // Reject a known corruption pattern: an opcode branch that ends at `then`
      // with no body. This prevents saving a syntactically incomplete VM artifact.
      // Check after whitespace compaction, so this also catches minified output.
      if (/\belseif\s+[A-Za-z_][A-Za-z0-9_]*\s*==\s*\d+\s+then\s*$/.test(vout)) {
        throw new Error("VM output is truncated: final opcode branch has no body. Rebuild with a different VM profile or disable VM mode; incomplete output was blocked.");
      }
      if (/\b(?:if|elseif|while|for)\b[^\n]*\bthen\s*$/.test(vout)) {
        throw new Error("VM output is truncated: final control-flow branch has no body. Incomplete output was blocked.");
      }
      /* The VM returns through its randomized entry-point name (for example,
         `return _mfz565(_ip6637,{})`), not necessarily table.unpack/unpack.
         Accept that generated call while still requiring a local declaration and
         a callable return expression in the emitted chunk. */
      if (!/local\s+\w+/.test(vout) || !/\breturn\s+(?:table\.unpack|unpack|[A-Za-z_]\w*)\s*\(/.test(vout))
        throw new Error("VM output failed structural validation (missing local declaration or VM entry return)");
      // Emit the VM interpreter directly instead of wrapping its source in Base85.
      // A Base85 wrapper requires runtime loadstring/load to compile the decoded source;
      // direct emission removes that dependency and runs the generated VM as ordinary Luau.
      // The custom bytecode, opcode mappings, masks, and constant transforms are still
      // produced by emitVirtualizedLuau. This deliberately trades whole-source encoding
      // for compatibility with runtimes where dynamic compilation is disabled.
      vout = sourceDirectiveText + "--[[ this file protected WSFuscate v2 ]]\n" + (opts.minify === false ? vout : compactLuaSingleLine(stripComments(vout)));
      // Final-output safety net: the old malformed form was seen in already
      // emitted VM files even after the call-shape generator had been patched.
      // Normalize it after all minification/name substitutions, then fail closed
      // if any instance remains. This does not alter valid `then do local ...`.
      vout = vout.replace(/\bthen\s+_[A-Za-z][A-Za-z0-9_]*\s+(?=local\s+_[A-Za-z][A-Za-z0-9_]*\s*=)/g, "then do ");
      if (/\bthen\s+_[A-Za-z][A-Za-z0-9_]*\s+local\s+_[A-Za-z][A-Za-z0-9_]*\s*=/.test(vout)) {
        throw new Error("VM output contains malformed then/local syntax; output was blocked");
      }
      if (opts.minify !== false && /\b(?:endlocal|enddo|endreturn|endfunction|endwhile|endif|thenlocal|elselocal|returnlocal)\b/i.test(vout)) {
        throw new Error("Final minifier produced a merged Luau token; output was blocked.");
      }
      return {
        code: vout,
        orig: originalSourceLength,
        obf: Buffer.byteLength(vout, "utf8"),
        time: performance.now() - t0,
        cffChanges: 0,
        level,
        mode: "vm",
        requestedSettings,
        appliedOptions: { level, mode: "vm", vm: true, vmProfile: opts.profile || "balanced", vmEnvironment: opts.vmEnvironment || "roblox", allowRequire: !!opts.allowRequire, allowCoroutine: !!opts.allowCoroutine, vmCoroutineScheduler: !!opts.vmCoroutineScheduler, stringPipeline: "VM bytecode constant pool and runtime masks", namePipeline: "VM register/opcode mapping", runtimeBinding: !!opts.runtimeBinding, timingNoise: !!opts.timingNoise, vmDebug: !!opts.vmDebug, integrity: opts.integrity === true, antiHookMode: opts.antiHookMode || "balanced", runtimeSize: opts.runtimeSize || "compact", portableFallbacks: opts.portableFallbacks !== false, minify: opts.minify !== false },
        warnings
      };
    } catch (e) {
      vmFallbackReason = e && e.message ? e.message : String(e);
      // A caller that selected VM must not unknowingly receive source-mode output.
      // Fallback is compatibility-only and must be explicitly requested.
      if (!opts.allowVmFallback) {
        const failureMessage = opts.includeInternalDiagnostics === true
          ? "Mandatory VM build failed; source fallback is disabled: " + String(vmFallbackReason).slice(0, 240)
          : "Mandatory VM build failed; source fallback is disabled. Internal cause is available only in server-side diagnostics.";
        const failure = new Error(failureMessage);
        failure.code = "WSF_VM_BUILD_FAILED";
        failure.stage = "VM";
        failure.status = 422;
        Object.defineProperty(failure, "cause", { value: e, enumerable: false, configurable: false });
        throw failure;
      }
      warnings.push(opts.includeInternalDiagnostics === true
        ? "VM build failed (" + String(vmFallbackReason).slice(0, 240) + "); acknowledged source-mode fallback was generated."
        : "VM build failed; acknowledged source-mode fallback was generated. Internal cause is hidden by default.");
      // Continue only because allowVmFallback:true was explicitly supplied.
    }
  }

  // Source mode gets a lexer-backed repeated-literal pool and safe integer disguise.
  // VM mode already deduplicates constants per prototype and masks numeric payloads;
  // applying source expressions before bytecode compilation would only inflate it.
  let pooledStringCount = 0;
  let disguisedNumberCount = 0;
  if (!opts.vm && opts.constWrap !== false) {
    const pooled = poolRepeatedSourceStrings(work, { stringEncoding: !!str });
    work = pooled.code;
    pooledStringCount = pooled.count;
  }
  if (!opts.vm && opts.numberEncoding !== false) {
    const disguised = disguiseSourceIntegerLiterals(work, level, true);
    work = disguised.code;
    disguisedNumberCount = disguised.count;
  }

  let cffChanges = 0;

  // Keyword surface reduction FIRST (on clean AST), then CFF.
  // Reset generated keyword identifier bookkeeping for every build, including
  // builds where that pass is disabled.
  _kwGeneratedNames = new Set();
  // Order matters: CFF output is dense; re-parsing it for and/or is fragile.
  // Residual `end`/`local`/`function`/`if` remain in source mode — use Bytecode VM to eliminate them.
  if (hideKw && level >= 2) {
    const kw = hideKeywordsAST(work, level);
    if (kw.changed) work = kw.code;
    /* v8.1-40: a parse failure used to be ignored silently, so the user assumed the
       keyword pass had run. It is now reported in the status line. */
    if (kw.error) warnings.push("Hide keywords skipped (" + kw.error.slice(0, 80) + ")");
  }

  if (flow) {
    const flat = flattenControlFlowAST(work, level);
    work = flat.code;
    cffChanges = flat.changed || 0;
    if (flat.error) warnings.push("CFF skipped (" + flat.error.slice(0, 80) + ")");
    // strip internal CFF marker; we add our own banner later
    work = work.replace(/--\[CFF applied:[^\]]*\]\s*/g, "");
  }

  const tokens = lex(work).T;
  const used_ids = new Set();
  for (const tok of tokens) {
    if (tok.t === "id" && !KW.has(tok.v)) used_ids.add(tok.v);
  }
  /* BUGFIX: member/method names (a.B, a:B) and table-constructor keys ({B = ...}) must
     not be renamed. Renaming them broke Roblox API access such as part.Position. */
  const fieldNames = new Set();
  {
    const brace = [];
    for (let k = 0; k < tokens.length; k++) {
      const tk = tokens[k], pv = tokens[k - 1], nx = tokens[k + 1];
      if (tk.t === "op" && (tk.v === "{" || tk.v === "(" || tk.v === "[")) brace.push(tk.v);
      else if (tk.t === "op" && (tk.v === "}" || tk.v === ")" || tk.v === "]")) brace.pop();
      if (tk.t !== "id") continue;
      if (pv && pv.t === "op" && (pv.v === "." || pv.v === ":")) fieldNames.add(tk.v);
      if (nx && nx.t === "op" && nx.v === "=" && brace[brace.length - 1] === "{") fieldNames.add(tk.v);
    }
  }

  /* v8.1-47: only names the source declares may be renamed. A free name (a global or an
     executor API such as loadstring, getgenv, getfenv, setfenv, hookfunction) is not declared
     anywhere in the source. Renaming it turned `loadstring(...)` into a call to an undefined
     local, which failed at runtime with "attempt to call a nil value". Declared names:
     `local` names, `local function`/`function` names (non-dotted), function parameters, and
     `for` loop variables. */
  const declaredNames = new Set();
  {
    const isId = tk => !!tk && tk.t === "id";
    const isOp = (tk, v) => !!tk && tk.t === "op" && tk.v === v;
    for (let k = 0; k < tokens.length; k++) {
      const tk = tokens[k];
      if (tk.t !== "kw") continue;
      if (tk.v === "local") {
        let j = k + 1;
        if (tokens[j] && tokens[j].t === "kw" && tokens[j].v === "function") {
          if (isId(tokens[j + 1])) declaredNames.add(tokens[j + 1].v);
          continue;
        }
        while (isId(tokens[j])) {
          declaredNames.add(tokens[j].v);
          j++;
          if (isOp(tokens[j], ",")) j++; else break;
        }
      } else if (tk.v === "for") {
        let j = k + 1;
        while (isId(tokens[j])) {
          declaredNames.add(tokens[j].v);
          j++;
          if (isOp(tokens[j], ",")) j++; else break;
        }
      } else if (tk.v === "function") {
        let j = k + 1;
        if (isId(tokens[j]) && !(isOp(tokens[j + 1], ".") || isOp(tokens[j + 1], ":"))) declaredNames.add(tokens[j].v);
        while (tokens[j] && !isOp(tokens[j], "(")) j++;
        for (j++; tokens[j] && !isOp(tokens[j], ")"); j++) {
          if (isId(tokens[j])) declaredNames.add(tokens[j].v);
        }
      }
    }
  }

  /* v8.1-40: SKIP is declared before id_var, so id_var never reads it before initialization
     (it was declared after id_var before; still safe at runtime, but fragile to refactoring). */
  const SKIP = new Set([
    "_G_", "game", "workspace", "script", "print", "warn", "error", "type", "typeof",
    "pairs", "ipairs", "next", "select", "unpack", "table", "string", "math",
    "buffer", "bit32", "coroutine", "task", "Instance", "Vector3", "CFrame",
    "Color3", "UDim2", "Enum", "require", "pcall", "xpcall", "tostring", "tonumber",
    "insert", "remove", "concat", "find", "sort", "create", "freeze", "clone",
    "char", "byte", "sub", "gsub", "format", "rep", "reverse", "upper", "lower", "len",
    "abs", "floor", "ceil", "sqrt", "random", "max", "min", "sin", "cos", "rad", "deg",
    "GetService", "WaitForChild", "FindFirstChild", "Clone", "Destroy", "Connect",
    "Fire", "Wait", "spawn", "delay", "defer", "wait", "tick", "time", "typeof",
    "setmetatable", "getmetatable", "rawget", "rawset", "rawequal", "newproxy"
  ]);

  /* PERF (P0-1): usedGenerated mirrors id_map's values, so the collision check is a Set
     lookup O(1) instead of [...id_map.values()].includes(v), an O(n) scan per call
     that made renaming O(n^2) on large sources. Same names are produced for the same
     random sequence. */
  const usedGenerated = new Set();
  const id_var = e => {
    if (id_map.has(e)) return id_map.get(e);
    /* BUGFIX: a generated name must not collide with keywords, skip-listed globals,
       field names, existing identifiers, or another generated name. Previously
       sequential replacement could rewrite an already-generated name a second time. */
    const bad = v => LUA_RESERVED.has(v) || SKIP.has(v) || used_ids.has(v) || fieldNames.has(v) || usedGenerated.has(v);
    let v = genId();
    for (let t = 0; t < 40 && bad(v); t++) v = genId();
    /* the fallback is also checked, so it can never reuse an earlier generated name */
    while (bad(v)) v = "_w" + (v_counter++).toString(36);
    id_map.set(e, v);
    usedGenerated.add(v);
    return v;
  };

  // string encode rate / dead rate scale with level
  const deadRate = dead ? Math.min(0.8, 0.25 + level * 0.1) * 0.5 : 0;

  /* P0-1: token-position replacement with lexical binding resolution. */
  let out = work;
  try {
    if (name) {
      const renamed = renameLocalsScopeAware(work, tokens, id =>
        SKIP.has(id) || fieldNames.has(id) || /^_s\d+$/.test(id) || /^__n\d+$/.test(id) || _kwGeneratedNames.has(id),
        key => id_var(key));
      out = renamed.code;
    }
  } finally {
    __wsReleaseTokens(tokens);
  }
  const lines = out.split("\n");
  out = "";
  for (let i = 0; i < lines.length; i++) {
    let nl = lines[i];
    if (str) {
      nl = nl.replace(/(["'])(?:\\.|(?!\1).)*\1/g, m => {
        const inner = m.slice(1, -1).replace(/\\(x[0-9a-fA-F]{2}|[\\'"nrt0])/g, (mm, g) => {
          if (g.startsWith("x")) return String.fromCharCode(parseInt(g.slice(1), 16));
          const map = { "\\\\": "\\", "\\n": "\n", "\\r": "\r", "\\t": "\t", "\\'": "'", '\\"': '"', "\\0": "\0" };
          return map["\\" + g] !== undefined ? map["\\" + g] : g;
        });
        // also handle already hex-escaped content from prior passes
        let decoded = m.slice(1, -1);
        try {
          decoded = decoded.replace(/\\x([0-9a-fA-F]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
          decoded = decoded.replace(/\\([\\'"nrt])/g, (_, c) => ({ n: "\n", r: "\r", t: "\t", "\\": "\\", "'": "'", '"': '"' }[c] || c));
        } catch (_) {}
        return encStr(decoded);
      });
    }
    if (dead && secureRandomFloat() < deadRate) {
      nl += " " + junkSnippet(level);
    }
    // inject junk lines between statements at higher levels
    if (dead && level >= 2 && secureRandomFloat() < deadRate * 0.5) {
      out += junkSnippet(level) + "\n";
    }
    out += nl + "\n";
  }

  /* FIX #4: junk ok multiple; noiseFunction at most once */
  if (dead && level >= 2) {
    out += junkBlock(level) + "\n";
  }
  if (dead && level >= 3) {
    out += junkBlock(level) + "\n";
    out += noiseFunction(level) + "\n";
  }
  if (dead && level >= 4) {
    out += junkBlock(level) + "\n";
  }
  if (dead && level >= 5) {
    out += junkBlock(level) + "\n";
  }


  /* Size-aware shared string pool. Numeric indirection is deliberately avoided:
     `_K[n]` is longer than most Luau integer literals, so pooling numbers usually
     increases output size. Only repeated plain strings with a positive measured
     byte saving are moved into the single shared pool. */
  if (const_) {
    const counts = new Map();
    const add = (value, literal) => {
      const key = "str:" + value;
      const item = counts.get(key) || { kind: "str", value, literal, count: 0 };
      item.count++;
      counts.set(key, item);
    };
    out.replace(/"([^"\\\n]+)"/g, (literal, value) => { add(value, literal); return literal; });

    // Pick only strings whose repeated references repay both the table entry and
    // the one-time `local _K={...};` header. Re-evaluate index widths in pool order.
    const candidates = [...counts.values()].filter(item => item.count >= 2);
    candidates.sort((a, b) => (b.count * b.literal.length - b.literal.length) - (a.count * a.literal.length - a.literal.length));
    const pool = [];
    let estimatedNet = -11; // `local _K={};` and its terminating separator
    for (const item of candidates) {
      const index = pool.length + 1;
      const referenceLength = 4 + String(index).length;
      const entry = JSON.stringify(item.value);
      const net = item.count * item.literal.length - (entry.length + item.count * referenceLength);
      if (net > 0) {
        pool.push(item);
        estimatedNet += net;
      }
    }
    if (pool.length && estimatedNet > 0) {
      const indexByValue = new Map(pool.map((item, index) => ["str:" + item.value, index]));
      out = out.replace(/"([^"\\\n]+)"/g, (literal, value) => {
        const index = indexByValue.get("str:" + value);
        return index === undefined ? literal : "\uE002" + index + "\uE003";
      });
      out = out.replace(/\uE002(\d+)\uE003/g, (_, index) => "_K[" + (+index + 1) + "]");
      const parts = pool.map(item => JSON.stringify(item.value));
      out = "local _K={" + parts.join(",") + "};" + out;
    }
  }


    // ALWAYS collapse body to a single line (banners stay on their own lines)
  out = out
    .split("\n")
    .map(l => l.trim())
    .filter(l => l.length && (!cmt || !l.startsWith("--")))
    .join(cmt ? " " : "\n");

  // final anti-read wrap
  if (level >= 3) {
    const w1 = "_" + (secureRandomFloat() * 1e5 | 0);
    const w2 = "_" + (secureRandomFloat() * 1e5 | 0);
    out = `do local ${w1}=${secureRandomFloat()*1e6|0};local ${w2}=(${w1}*0);` + out + ` end`;
  }
  if (level >= 5) {
    const w3 = "_" + (secureRandomFloat() * 1e5 | 0);
    out = `do local ${w3}=0;${out} end`;
  }

  // V8.2.18 removes the old debug-library string heuristic: debug.getinfo output is
  // runtime-specific and the old guard had a no-op warning sink. Bounded primitive
  // behavior checks remain in __wsBuildObfuscatedProtectionSource / forced guard.

  // Inert junk padding: isolated local computations with no global writes or calls.
  // Padding size scales with level; every temporary is scoped inside its own do/end.
  if (dead) {
    /* V8.2.6 size pass: inert dead padding reduced by 50%, with an 80-block hard cap. */
    const junkBlocks = Math.min(80, Math.floor((24 + level * 20) / 2));
    let padding = "";
    for (let ji = 0; ji < junkBlocks; ji++) {
      const a = (secureRandomFloat() * 900000 | 0) + 100000;
      const b = (secureRandomFloat() * 900000 | 0) + 100000;
      const c = (secureRandomFloat() * 900000 | 0) + 100000;
      padding += `do local __jx${ji}=${a};local __jy${ji}=(${b}+${c});local __jz${ji}=__jx${ji}*0+__jy${ji}*0 end;`;
    }
    out = padding + out;
  }

  // Keyword / global hiding: alias common globals to _G_.short + proxy header
  // level ≥ 2: _G_ proxy; level ≥ 4: map values are chunk-assembled ("p".."rint")
  if (level >= 2) {
    out = applyGlobalAlias(out);
    out = buildGlobalProxyHeader(level) + out;
  }

  // Always inject the hidden generated anti-tamper/runtime-contract prelude.
  // It is not displayed in the input editor and is not controlled by a user macro.
  // This is a compatibility/tamper-evidence check, not cryptographic authentication.
  // Luau compilation directives must remain the first line of the generated chunk.
  // Extract them before adding the hidden prelude and restore them ahead of the banner.
  const strictDirectiveMatch = /^[\t ]*(--!(?:strict|nonstrict|nocheck)\b[^\r\n]*)(?:\r?\n|$)/.exec(out);
  const strictDirective = sourceDirectiveText || (strictDirectiveMatch ? strictDirectiveMatch[1] + "\n" : "");
  if (strictDirectiveMatch) out = out.slice(strictDirectiveMatch[0].length);
  const forcedHiddenGuard = __wsBuildForcedSourceGuard();
  out = forcedHiddenGuard + out;

  // Keep the requested attribution banner separate from the compacted payload.
  out = compactLuaSingleLine(stripComments(out));
  out = strictDirective + "--[[ this file protected WSFuscate v2 ]]\n" + out;

  warnings.push("runtime primitive-contract diagnostics were prepended before obfuscation; they can detect selected compatibility failures but are editable client code, not trusted anti-tamper or anti-hook enforcement");
  warnings.push("local runtime consistency checks were injected automatically; their code and expected values ship together and are not a cryptographic integrity boundary");
  const t1 = performance.now();
  out = __wsRestoreInlineMacroPlaceholders(out, macroReplacements);
  return {
    code: out,
    orig: originalSourceLength,
    obf: Buffer.byteLength(out, "utf8"),
    time: t1 - t0,
    cffChanges,
    level,
    requestedSettings,
    appliedOptions: { level, mode: sourceLite ? "source-lite" : "source", vm: false, vmRequested: !!requestedSettings.vm,
      vmAutoSizeSkipped: sourceLite, name: !!name, stringEncoding: !!str, strictStringMasking: strictStringMasking,
      runtimeXor: forceRuntimeXor, deadCode: !!dead, controlFlow: !!flow, stripComments: !!cmt, hideKeywords: !!hideKw && level >= 2,
      constWrap: !!const_, pooledStringCount, disguisedNumberCount,
      numberEncoding: opts.numberEncoding !== false,
      vmProfile: opts.profile || "balanced", runtimeContractDiagnostics: true,
      clientEditableConsistencyChecks: true },
    vmFallback: vmFallbackReason,
    vmAutoSize: sourceLite,
    mode: sourceLite ? "source-lite" : "source",
    warnings
  };
}

/* ========== BYTECODE / VM / GC (kept from original stages, lightly adapted) ========== */
function newFuncState(parent, name, vararg) {
  return {
    parent, name: name || "?", vararg: !!vararg,
    locals: [], blockStack: [], upvals: [],
    consts: [], constMap: new Map(),
    code: [], freereg: 0, maxstack: 0,
    loopStack: [], protos: [], numparams: 0
  };
}
function fsK(fs, type, val) {
  const key = type + ":" + val;
  if (fs.constMap.has(key)) return fs.constMap.get(key);
  const idx = fs.consts.length;
  fs.consts.push({ type, val });
  fs.constMap.set(key, idx);
  return idx;
}
function emit(fs, op, fields) {
  fs.code.push(Object.assign({ op }, fields || {}));
  return fs.code.length - 1;
}
function patchJump(fs, pc, target) { fs.code[pc].sbx = target - pc - 1; }
function reserveReg(fs) {
  const r = fs.freereg++;
  if (fs.freereg > fs.maxstack) fs.maxstack = fs.freereg;
  return r;
}
function enterBlock(fs) { fs.blockStack.push(fs.locals.length); }
function leaveBlock(fs) {
  const n = fs.blockStack.pop();
  fs.locals.length = n;
  fs.freereg = n;
}
function addLocal(fs, name) {
  const reg = reserveReg(fs);
  fs.locals.push({ name, reg });
  return reg;
}
function resolveVar(fs, name) {
  for (let i = fs.locals.length - 1; i >= 0; i--)
    if (fs.locals[i].name === name) return { kind: "local", reg: fs.locals[i].reg };
  for (let i = 0; i < fs.upvals.length; i++)
    if (fs.upvals[i].name === name) return { kind: "upval", idx: i };
  if (fs.parent) {
    const r = resolveVar(fs.parent, name);
    if (r.kind === "local") {
      fs.upvals.push({ name, inStack: true, idx: r.reg });
      return { kind: "upval", idx: fs.upvals.length - 1 };
    }
    if (r.kind === "upval") {
      fs.upvals.push({ name, inStack: false, idx: r.idx });
      return { kind: "upval", idx: fs.upvals.length - 1 };
    }
  }
  return { kind: "global" };
}

function compileExprInto(fs, expr, reg) {
  switch (expr.type) {
    case "Nil": emit(fs, "LOADNIL", { a: reg, b: reg }); return;
    case "True": emit(fs, "LOADBOOL", { a: reg, b: 1 }); return;
    case "False": emit(fs, "LOADBOOL", { a: reg, b: 0 }); return;
    case "Num": emit(fs, "LOADK", { a: reg, bx: fsK(fs, "num", expr.value) }); return;
    case "Str": emit(fs, "LOADK", { a: reg, bx: fsK(fs, "str", expr.value) }); return;
    case "Vararg": emit(fs, "VARARG", { a: reg, b: 2 }); return;
    case "Paren": compileExprInto(fs, expr.e, reg); return;
    case "Name": {
      const r = resolveVar(fs, expr.name);
      if (r.kind === "local") { if (r.reg !== reg) emit(fs, "MOVE", { a: reg, b: r.reg }); }
      else if (r.kind === "upval") emit(fs, "GETUPVAL", { a: reg, b: r.idx });
      else emit(fs, "GETGLOBAL", { a: reg, bx: fsK(fs, "str", expr.name) });
      return;
    }
    case "Index": {
      const save = fs.freereg;
      const oReg = fs.freereg; reserveReg(fs); compileExprInto(fs, expr.obj, oReg);
      if (expr.computed) {
        const kReg = fs.freereg; reserveReg(fs); compileExprInto(fs, expr.key, kReg);
        emit(fs, "GETTABLE", { a: reg, b: oReg, c: kReg, ckey: false });
      } else {
        emit(fs, "GETTABLE", { a: reg, b: oReg, c: fsK(fs, "str", expr.key.value), ckey: true });
      }
      fs.freereg = save; return;
    }
    /* FIX #13: CALL.c is nresults+1; single value => 2 */
    case "Call": compileCall(fs, expr, reg, 2); return;
    case "Function": {
      const childFs = compileFunction(fs, expr, fs.name + "$anon");
      const pIdx = fs.protos.length; fs.protos.push(childFs.proto);
      emit(fs, "CLOSURE", { a: reg, bx: pIdx });
      return;
    }
    case "Table": compileTable(fs, expr, reg); return;
    case "UnOp": {
      const save = fs.freereg; const r = fs.freereg; reserveReg(fs);
      compileExprInto(fs, expr.e, r);
      const opMap = { "-": "UNM", "not": "NOT", "#": "LEN", "~": "BNOT" };
      emit(fs, opMap[expr.op], { a: reg, b: r });
      fs.freereg = save; return;
    }
    case "BinOp": compileBinOp(fs, expr, reg); return;
    case "IfExpr": {
      /* UPGRADE #3: compile if-expression to jumps */
      const save = fs.freereg;
      const cReg = fs.freereg; reserveReg(fs);
      compileExprInto(fs, expr.cond, cReg);
      const jf = emit(fs, "JMPIFNOT", { a: cReg, sbx: 0 });
      compileExprInto(fs, expr.yes, reg);
      const jEnd = emit(fs, "JMP", { sbx: 0 });
      patchJump(fs, jf, fs.code.length);
      compileExprInto(fs, expr.no, reg);
      patchJump(fs, jEnd, fs.code.length);
      fs.freereg = save;
      return;
    }
    default: throw new Error("unhandled expr " + expr.type);
  }
}

function compileCondJumpFalse(fs, expr) {
  const save = fs.freereg; const r = fs.freereg; reserveReg(fs);
  compileExprInto(fs, expr, r);
  const j = emit(fs, "JMPIFNOT", { a: r, sbx: 0 });
  fs.freereg = save;
  return j;
}

const ARITH_OPS = { "+": "ADD", "-": "SUB", "*": "MUL", "/": "DIV", "%": "MOD", "^": "POW", "//": "IDIV", "..": "CONCAT" };
const CMP_OPS = { "==": "CMPEQ", "~=": "CMPNE", "<": "CMPLT", "<=": "CMPLE", ">": "CMPGT", ">=": "CMPGE" };

// These optimized math calls are lowered to one-result VM opcodes, not CALL.
// They must not be treated as open/multi-return expressions in an argument or
// return list; otherwise CALL/RETURN operand B=0 reads a stale VM top register.
function isVmNameShadowed(fs, name) {
  for (let scope = fs; scope; scope = scope.parent) {
    if ((scope.locals || []).some(local => local.name === name)) return true;
    if ((scope.upvals || []).some(upvalue => upvalue.name === name)) return true;
  }
  return false;
}

function isVmSingleResultIntrinsicCall(fs, callExpr) {
  if (!callExpr || callExpr.type !== "Call" || callExpr.method || isVmNameShadowed(fs, "math")) return false;
  const fn = callExpr.fn;
  if (!fn || fn.type !== "Index" || fn.computed || !fn.obj || fn.obj.type !== "Name" || fn.obj.name !== "math" || !fn.key || fn.key.type !== "Str") return false;
  const name = fn.key.value;
  if (["floor", "ceil", "abs", "sqrt"].includes(name)) return callExpr.args.length === 1;
  if (name === "min" || name === "max") return callExpr.args.length >= 2;
  if (name === "clamp") return callExpr.args.length === 3;
  return false;
}

function compileBinOp(fs, expr, reg) {
  if (expr.op === "and") {
    compileExprInto(fs, expr.l, reg);
    const j = emit(fs, "JMPIFNOT", { a: reg, sbx: 0 });
    compileExprInto(fs, expr.r, reg);
    patchJump(fs, j, fs.code.length);
    return;
  }
  if (expr.op === "or") {
    compileExprInto(fs, expr.l, reg);
    const j = emit(fs, "JMPIF", { a: reg, sbx: 0 });
    compileExprInto(fs, expr.r, reg);
    patchJump(fs, j, fs.code.length);
    return;
  }
  const save = fs.freereg;
  const lReg = fs.freereg; reserveReg(fs); compileExprInto(fs, expr.l, lReg);
  const rReg = fs.freereg; reserveReg(fs); compileExprInto(fs, expr.r, rReg);
  if (ARITH_OPS[expr.op]) emit(fs, ARITH_OPS[expr.op], { a: reg, b: lReg, c: rReg });
  else if (CMP_OPS[expr.op]) emit(fs, CMP_OPS[expr.op], { a: reg, b: lReg, c: rReg });
  else if (expr.op === "|") emit(fs, "BOR", { a: reg, b: lReg, c: rReg });
  else if (expr.op === "~") emit(fs, "BXOR", { a: reg, b: lReg, c: rReg });
  else if (expr.op === "&") emit(fs, "BAND", { a: reg, b: lReg, c: rReg });
  else if (expr.op === "<<") emit(fs, "SHL", { a: reg, b: lReg, c: rReg });
  else if (expr.op === ">>") emit(fs, "SHR", { a: reg, b: lReg, c: rReg });
  else throw new Error("unhandled binop " + expr.op);
  fs.freereg = save;
}

function compileCall(fs, callExpr, base, wantPlus1) {
  // Recognize safe numeric math intrinsics and compile them to dedicated VM opcodes.
  const mathFn = callExpr.fn;
  const mathName = (!callExpr.method && !isVmNameShadowed(fs, "math") && mathFn && mathFn.type === "Index" && !mathFn.computed &&
      mathFn.obj && mathFn.obj.type === "Name" && mathFn.obj.name === "math" &&
      mathFn.key && mathFn.key.type === "Str") ? mathFn.key.value : null;
  const unaryMath = { floor: "MATHFLOOR", ceil: "MATHCEIL", abs: "MATHABS", sqrt: "MATHSQRT" };
  if (mathName && unaryMath[mathName] && callExpr.args.length === 1) {
    const argReg = base + 1;
    fs.freereg = argReg; reserveReg(fs); compileExprInto(fs, callExpr.args[0], argReg);
    emit(fs, unaryMath[mathName], { a: base, b: argReg });
    fs.freereg = wantPlus1 > 0 ? base + (wantPlus1 - 1) : base;
    return;
  }
  if (mathName && (mathName === "min" || mathName === "max") && callExpr.args.length >= 2) {
    const op = mathName === "min" ? "MATHMIN" : "MATHMAX";
    const save = fs.freereg;
    let acc = base + 1; fs.freereg = acc; reserveReg(fs); compileExprInto(fs, callExpr.args[0], acc);
    for (let i = 1; i < callExpr.args.length; i++) {
      const rhs = base + 2; fs.freereg = rhs; reserveReg(fs); compileExprInto(fs, callExpr.args[i], rhs);
      emit(fs, op, { a: acc, b: acc, c: rhs });
      fs.freereg = rhs;
    }
    emit(fs, "MOVE", { a: base, b: acc });
    fs.freereg = wantPlus1 > 0 ? base + (wantPlus1 - 1) : base;
    return;
  }
  // Compile math.clamp(x, lo, hi) as a dedicated VM opcode with numeric operands.
  // This bypasses generic CALL argument packing while preserving expression evaluation order.
  const clampFn = callExpr.fn;
  if (!callExpr.method && clampFn && clampFn.type === "Index" && !clampFn.computed &&
      clampFn.obj && clampFn.obj.type === "Name" && clampFn.obj.name === "math" &&
      clampFn.key && clampFn.key.type === "Str" && clampFn.key.value === "clamp" &&
      callExpr.args.length === 3) {
    fs.freereg = base + 1;
    const regs = [];
    for (let i = 0; i < 3; i++) {
      const r = base + 1 + i;
      fs.freereg = r;
      reserveReg(fs);
      compileExprInto(fs, callExpr.args[i], r);
      regs.push(r);
      fs.freereg = r + 1;
      if (fs.freereg > fs.maxstack) fs.maxstack = fs.freereg;
    }
    emit(fs, "MATHCLAMP", { a: base, b: regs[0], c: regs[1], bx: regs[2] });
    fs.freereg = wantPlus1 > 0 ? base + (wantPlus1 - 1) : base;
    return;
  }
  fs.freereg = base;
  let argStart;
  if (callExpr.method) {
    /* BUGFIX (method calls): the object is evaluated straight into the self slot (base+1).
       Previously it landed in base, GETTABLE then overwrote base with the method, and the
       MOVE copied that function into self, so `obj:m()` called m(m, ...). */
    fs.freereg = base + 2;
    compileExprInto(fs, callExpr.fn, base + 1);
    const kidx = fsK(fs, "str", callExpr.method);
    emit(fs, "GETTABLE", { a: base, b: base + 1, c: kidx, ckey: true });
    fs.freereg = base + 2;
    if (fs.freereg > fs.maxstack) fs.maxstack = fs.freereg;
    argStart = base + 2;
  } else {
    compileExprInto(fs, callExpr.fn, base);
    fs.freereg = base + 1;
    if (fs.freereg > fs.maxstack) fs.maxstack = fs.freereg;
    argStart = base + 1;
  }
  fs.freereg = argStart;
  const args = callExpr.args;
  let argB;
  if (args.length === 0) argB = argStart - base;
  else {
    for (let i = 0; i < args.length - 1; i++) {
      const r = fs.freereg; reserveReg(fs); compileExprInto(fs, args[i], r);
      fs.freereg = r + 1; // keep prior arg results
      if (fs.freereg > fs.maxstack) fs.maxstack = fs.freereg;
    }
    const last = args[args.length - 1];
    if (last.type === "Call" && !isVmSingleResultIntrinsicCall(fs, last)) { compileCall(fs, last, fs.freereg, 0); argB = 0; }
    else if (last.type === "Vararg") { emit(fs, "VARARG", { a: fs.freereg, b: 0 }); argB = 0; }
    else { const r = fs.freereg; reserveReg(fs); compileExprInto(fs, last, r); argB = fs.freereg - base; }
  }
  emit(fs, "CALL", { a: base, b: argB, c: wantPlus1 });
  if (fs.freereg > fs.maxstack) fs.maxstack = fs.freereg;
  fs.freereg = wantPlus1 > 0 ? base + (wantPlus1 - 1) : base;
}

function compileTable(fs, expr, reg) {
  emit(fs, "NEWTABLE", { a: reg });
  const save = fs.freereg;
  let arrIdx = 1;
  for (const f of expr.fields) {
    if (f.key === null) {
      const vReg = fs.freereg; reserveReg(fs); compileExprInto(fs, f.value, vReg);
      emit(fs, "SETTABLE", { a: reg, b: fsK(fs, "num", String(arrIdx)), bkey: true, c: vReg, ckey: false });
      arrIdx++;
      fs.freereg = save;
    } else if (f.key.type === "Str") {
      const vReg = fs.freereg; reserveReg(fs); compileExprInto(fs, f.value, vReg);
      emit(fs, "SETTABLE", { a: reg, b: fsK(fs, "str", f.key.value), bkey: true, c: vReg, ckey: false });
      fs.freereg = save;
    } else {
      const kReg = fs.freereg; reserveReg(fs); compileExprInto(fs, f.key, kReg);
      const vReg = fs.freereg; reserveReg(fs); compileExprInto(fs, f.value, vReg);
      emit(fs, "SETTABLE", { a: reg, b: kReg, bkey: false, c: vReg, ckey: false });
      fs.freereg = save;
    }
  }
}

function compileFixedList(fs, exprs, want) {
  const base = fs.freereg;
  const bump = r => { fs.freereg = Math.max(fs.freereg, r + 1); if (fs.freereg > fs.maxstack) fs.maxstack = fs.freereg; };
  if (want <= 0) {
    for (const e of exprs) { const r = fs.freereg; reserveReg(fs); compileExprInto(fs, e, r); }
    fs.freereg = base; return base;
  }
  if (exprs.length === 0) {
    for (let i = 0; i < want; i++) { const r = base + i; bump(r); emit(fs, "LOADNIL", { a: r, b: r }); }
    fs.freereg = base + want; return base;
  }
  const n = exprs.length, lastPos = n - 1;
  for (let i = 0; i < lastPos; i++) { const r = base + i; bump(r); compileExprInto(fs, exprs[i], r); }
  const last = exprs[lastPos];
  if (lastPos >= want) {
    const r = base + lastPos; bump(r); compileExprInto(fs, last, r);
  } else {
    const remaining = want - lastPos;
    if (remaining === 1) {
      const r = base + lastPos; bump(r); compileExprInto(fs, last, r);
    } else if (last.type === "Call" && !isVmSingleResultIntrinsicCall(fs, last)) {
      fs.freereg = base + lastPos; compileCall(fs, last, base + lastPos, remaining + 1); bump(base + lastPos + remaining - 1);
    } else if (last.type === "Vararg") {
      fs.freereg = base + lastPos; emit(fs, "VARARG", { a: base + lastPos, b: remaining + 1 }); bump(base + lastPos + remaining - 1);
    } else {
      // A single-result intrinsic (e.g. math.floor/min/max/clamp) cannot fill
      // the remaining assignment targets. Explicitly nil-pad them instead of
      // leaving scratch-register values from the intrinsic's temporary operands.
      const r = base + lastPos; bump(r); compileExprInto(fs, last, r);
      for (let k = 1; k < remaining; k++) { const rr = base + lastPos + k; bump(rr); emit(fs, "LOADNIL", { a: rr, b: rr }); }
    }
  }
  fs.freereg = base + want;
  return base;
}

function compileMultiList(fs, exprs) {
  const base = fs.freereg;
  if (exprs.length === 0) return { base, count: 0 };
  for (let i = 0; i < exprs.length - 1; i++) {
    const r = fs.freereg; reserveReg(fs); compileExprInto(fs, exprs[i], r);
  }
  const last = exprs[exprs.length - 1];
  if (last.type === "Call" && !isVmSingleResultIntrinsicCall(fs, last)) { compileCall(fs, last, fs.freereg, 0); return { base, count: -1 }; }
  if (last.type === "Vararg") { emit(fs, "VARARG", { a: fs.freereg, b: 0 }); return { base, count: -1 }; }
  const r = fs.freereg; reserveReg(fs); compileExprInto(fs, last, r);
  return { base, count: exprs.length };
}

function compileAssignTarget(fs, target, valueReg) {
  if (target.type === "Name") {
    const r = resolveVar(fs, target.name);
    if (r.kind === "local") { if (r.reg !== valueReg) emit(fs, "MOVE", { a: r.reg, b: valueReg }); }
    else if (r.kind === "upval") emit(fs, "SETUPVAL", { a: valueReg, b: r.idx });
    else emit(fs, "SETGLOBAL", { a: valueReg, bx: fsK(fs, "str", target.name) });
  } else if (target.type === "Index") {
    const save = fs.freereg;
    const oReg = fs.freereg; reserveReg(fs); compileExprInto(fs, target.obj, oReg);
    if (target.computed) {
      const kReg = fs.freereg; reserveReg(fs); compileExprInto(fs, target.key, kReg);
      emit(fs, "SETTABLE", { a: oReg, b: kReg, bkey: false, c: valueReg, ckey: false });
    } else {
      emit(fs, "SETTABLE", { a: oReg, b: fsK(fs, "str", target.key.value), bkey: true, c: valueReg, ckey: false });
    }
    fs.freereg = save;
  }
}

function compileAssign(fs, s) {
  if (s.targets.length === 1 && s.exprs.length === 1 && s.targets[0].type === "Name") {
    const r = resolveVar(fs, s.targets[0].name);
    if (r.kind === "local") { compileExprInto(fs, s.exprs[0], r.reg); return; }
  }
  const n = s.targets.length;
  const base = compileFixedList(fs, s.exprs, n);
  for (let i = 0; i < n; i++) compileAssignTarget(fs, s.targets[i], base + i);
}

function compileLocal(fs, s) {
  const n = s.names.length;
  const base = compileFixedList(fs, s.exprs, n);
  for (let i = 0; i < n; i++) fs.locals.push({ name: s.names[i], reg: base + i });
  fs.freereg = base + n;
}

function compileLocalFunction(fs, s) {
  const reg = addLocal(fs, s.name);
  const childFs = compileFunction(fs, s.func, s.name);
  const pIdx = fs.protos.length; fs.protos.push(childFs.proto);
  emit(fs, "CLOSURE", { a: reg, bx: pIdx });
}

function compileWhile(fs, s) {
  const startPc = fs.code.length;
  fs.loopStack.push({ breaks: [], continues: [] });
  const jf = compileCondJumpFalse(fs, s.cond);
  compileBlock(fs, s.body);
  emit(fs, "JMP", { sbx: startPc - fs.code.length - 1 });
  patchJump(fs, jf, fs.code.length);
  const loop = fs.loopStack.pop();
  for (const b of loop.breaks) patchJump(fs, b, fs.code.length);
  for (const c of loop.continues) patchJump(fs, c, startPc);
}

function compileRepeat(fs, s) {
  const startPc = fs.code.length;
  fs.loopStack.push({ breaks: [], continues: [] });
  enterBlock(fs);
  for (const st of s.body.body) compileStat(fs, st);
  const contTarget = fs.code.length;
  const save = fs.freereg;
  const r = fs.freereg; reserveReg(fs); compileExprInto(fs, s.cond, r);
  const jt = emit(fs, "JMPIF", { a: r, sbx: 0 });
  fs.freereg = save;
  emit(fs, "JMP", { sbx: startPc - fs.code.length - 1 });
  patchJump(fs, jt, fs.code.length);
  leaveBlock(fs);
  const loop = fs.loopStack.pop();
  for (const b of loop.breaks) patchJump(fs, b, fs.code.length);
  for (const c of loop.continues) patchJump(fs, c, contTarget);
}

function compileIf(fs, s) {
  const endJumps = [];
  for (let i = 0; i < s.clauses.length; i++) {
    const cl = s.clauses[i];
    const jf = compileCondJumpFalse(fs, cl.cond);
    compileBlock(fs, cl.body);
    if (i < s.clauses.length - 1 || s.elseBody) {
      const j = emit(fs, "JMP", { sbx: 0 });
      endJumps.push(j);
    }
    patchJump(fs, jf, fs.code.length);
  }
  if (s.elseBody) compileBlock(fs, s.elseBody);
  for (const j of endJumps) patchJump(fs, j, fs.code.length);
}

function compileNumericFor(fs, s) {
  const save = fs.freereg;
  const baseReg = fs.freereg;
  reserveReg(fs); compileExprInto(fs, s.start, baseReg);
  reserveReg(fs); compileExprInto(fs, s.stop, baseReg + 1);
  reserveReg(fs);
  if (s.step) compileExprInto(fs, s.step, baseReg + 2);
  else emit(fs, "LOADK", { a: baseReg + 2, bx: fsK(fs, "num", "1") });
  const forprepPc = emit(fs, "FORPREP", { a: baseReg, sbx: 0 });
  enterBlock(fs);
  /* pin control regs so compileStat freereg=locals.length does not clobber them */
  fs.locals.push({ name: "(for-idx)", reg: baseReg });
  fs.locals.push({ name: "(for-lim)", reg: baseReg + 1 });
  fs.locals.push({ name: "(for-step)", reg: baseReg + 2 });
  fs.freereg = baseReg + 3;
  addLocal(fs, s.var); // R(base+3)
  fs.loopStack.push({ breaks: [], continues: [] });
  for (const st of s.body.body) compileStat(fs, st);
  const forloopPc = emit(fs, "FORLOOP", { a: baseReg, sbx: 0 });
  patchJump(fs, forloopPc, forprepPc + 1);
  patchJump(fs, forprepPc, forloopPc);
  leaveBlock(fs);
  const loop = fs.loopStack.pop();
  for (const b of loop.breaks) patchJump(fs, b, fs.code.length);
  for (const c of loop.continues) patchJump(fs, c, forloopPc);
  fs.freereg = save;
}

function compileGenericFor(fs, s) {
  const save = fs.freereg;
  const baseReg = fs.freereg;
  compileFixedList(fs, s.exprs, 3);
  enterBlock(fs);
  /* pin iterator/state/ctrl regs against compileStat freereg reset */
  fs.locals.push({ name: "(for-gen)", reg: baseReg });
  fs.locals.push({ name: "(for-state)", reg: baseReg + 1 });
  fs.locals.push({ name: "(for-ctrl)", reg: baseReg + 2 });
  fs.freereg = baseReg + 3;
  const varBase = fs.freereg;
  for (const nm of s.names) addLocal(fs, nm);
  fs.loopStack.push({ breaks: [], continues: [] });
  const tforPc = emit(fs, "TFORLOOP", { a: baseReg, c: s.names.length });
  const jf = emit(fs, "JMPIFNOT", { a: varBase, sbx: 0 });
  for (const st of s.body.body) compileStat(fs, st);
  emit(fs, "JMP", { sbx: tforPc - fs.code.length - 1 });
  patchJump(fs, jf, fs.code.length);
  leaveBlock(fs);
  const loop = fs.loopStack.pop();
  for (const b of loop.breaks) patchJump(fs, b, fs.code.length);
  for (const c of loop.continues) patchJump(fs, c, tforPc);
  fs.freereg = save;
}

function compileReturn(fs, s) {
  const r = compileMultiList(fs, s.args);
  if (r.count === -1) emit(fs, "RETURN", { a: r.base, b: 0 });
  else emit(fs, "RETURN", { a: r.base, b: r.count + 1 });
}

function compileStat(fs, s) {
  fs.freereg = fs.locals.length;
  switch (s.type) {
    case "Local": return compileLocal(fs, s);
    case "Assign": return compileAssign(fs, s);
    case "CallStat": { compileCall(fs, s.call, fs.freereg, 1); return; }
    case "Do": return compileBlock(fs, s.body);
    case "While": return compileWhile(fs, s);
    case "Repeat": return compileRepeat(fs, s);
    case "If": return compileIf(fs, s);
    case "NumericFor": return compileNumericFor(fs, s);
    case "GenericFor": return compileGenericFor(fs, s);
    case "LocalFunction": return compileLocalFunction(fs, s);
    case "Break": {
      if (!fs.loopStack.length) throw new Error("break outside loop");
      const pc = emit(fs, "JMP", { sbx: 0 });
      fs.loopStack[fs.loopStack.length - 1].breaks.push(pc);
      return;
    }
    case "Continue": {
      if (!fs.loopStack.length) throw new Error("continue outside loop");
      const pc = emit(fs, "JMP", { sbx: 0 });
      fs.loopStack[fs.loopStack.length - 1].continues.push(pc);
      return;
    }
    case "Return": return compileReturn(fs, s);
    case "TypeAlias": return;
    default: throw new Error("unknown statement " + s.type);
  }
}

function compileBlock(fs, block) {
  enterBlock(fs);
  for (const s of block.body) compileStat(fs, s);
  leaveBlock(fs);
}

function compileFunction(parentFs, funcExpr, name) {
  const fs = newFuncState(parentFs, name, funcExpr.vararg);
  fs.numparams = funcExpr.params.length;
  enterBlock(fs);
  for (const p of funcExpr.params) addLocal(fs, p);
  for (const st of funcExpr.body.body) compileStat(fs, st);
  leaveBlock(fs);
  emit(fs, "RETURN", { a: fs.locals.length, b: 1 });
  fs.proto = {
    name: fs.name, numparams: fs.numparams, vararg: fs.vararg,
    maxstack: Math.max(fs.maxstack, 2), consts: fs.consts, code: fs.code,
    upvals: fs.upvals, protos: fs.protos
  };
  return fs;
}


/* Conservative IR pass: literal constant folding + unreachable-tail elimination.
   It never evaluates user code and folds only side-effect-free literal expressions. */
function wsIrLiteral(node) {
  if (!node) return { ok: false };
  if (node.type === "Paren") return wsIrLiteral(node.e);
  if (node.type === "Num") {
    const n = Number(node.value);
    return Number.isFinite(n) ? { ok: true, value: n, kind: "num" } : { ok: false };
  }
  if (node.type === "Str") return { ok: true, value: node.value, kind: "str" };
  if (node.type === "True") return { ok: true, value: true, kind: "bool" };
  if (node.type === "False") return { ok: true, value: false, kind: "bool" };
  if (node.type === "Nil") return { ok: true, value: null, kind: "nil" };
  return { ok: false };
}
function wsIrLiteralNode(value, kind) {
  if (kind === "nil") return { type: "Nil" };
  if (kind === "bool") return { type: value ? "True" : "False" };
  if (kind === "str") return { type: "Str", value: String(value) };
  return { type: "Num", value: String(value) };
}
function wsIrTruthy(v) { return !(v.kind === "nil" || (v.kind === "bool" && v.value === false)); }
function wsIrSubstituteExpr(e, constants) {
  if (!e || typeof e !== "object") return e;
  if (e.type === "Name" && constants && constants.has(e.name)) {
    const value = constants.get(e.name);
    return wsIrLiteralNode(value.value, value.kind);
  }
  // A nested function can run later and capture mutable bindings. Do not inline
  // outer values into closures; their lexical lifetime is longer than this pass.
  if (e.type === "Function") return e;
  switch (e.type) {
    case "UnOp": return { ...e, e: wsIrSubstituteExpr(e.e, constants) };
    case "BinOp": return { ...e, l: wsIrSubstituteExpr(e.l, constants), r: wsIrSubstituteExpr(e.r, constants) };
    case "Paren": return { ...e, e: wsIrSubstituteExpr(e.e, constants) };
    case "Index": return { ...e, obj: wsIrSubstituteExpr(e.obj, constants), key: wsIrSubstituteExpr(e.key, constants) };
    case "Call": return { ...e, fn: wsIrSubstituteExpr(e.fn, constants), args: (e.args || []).map(x => wsIrSubstituteExpr(x, constants)) };
    case "IfExpr": return { ...e, cond: wsIrSubstituteExpr(e.cond, constants), yes: wsIrSubstituteExpr(e.yes, constants), no: wsIrSubstituteExpr(e.no, constants) };
    case "Table": return { ...e, fields: (e.fields || []).map(f => ({ ...f, key: f.key ? wsIrSubstituteExpr(f.key, constants) : null, value: wsIrSubstituteExpr(f.value, constants) })) };
    default: return e;
  }
}
function wsIrHasObservableExpressionEffect(e) {
  if (!e || typeof e !== "object") return false;
  if (["Call", "Index", "Table", "Function", "Vararg"].includes(e.type)) return true;
  if (Array.isArray(e)) return e.some(wsIrHasObservableExpressionEffect);
  for (const [key, value] of Object.entries(e)) {
    if (key === "line" || key === "name") continue;
    if (value && typeof value === "object" && wsIrHasObservableExpressionEffect(value)) return true;
  }
  return false;
}
function wsIrCountNameReferences(node, name) {
  if (!node || typeof node !== "object") return 0;
  if (Array.isArray(node)) return node.reduce((sum, item) => sum + wsIrCountNameReferences(item, name), 0);
  if (node.type === "Name") return node.name === name ? 1 : 0;
  let count = 0;
  for (const [key, value] of Object.entries(node)) {
    // Declaration identifiers and source coordinates are not variable reads.
    if (["name", "names", "params", "var", "line"].includes(key)) continue;
    count += wsIrCountNameReferences(value, name);
  }
  return count;
}
function wsIrPruneUnusedLiteralLocals(body) {
  const out = [];
  for (let i = 0; i < body.length; i++) {
    const statement = body[i];
    if (statement && statement.type === "Local" && statement.names && statement.names.length === 1 &&
        statement.exprs && statement.exprs.length === 1 && wsIrLiteral(statement.exprs[0]).ok) {
      let references = 0;
      for (let j = i + 1; j < body.length && references === 0; j++) {
        references += wsIrCountNameReferences(body[j], statement.names[0]);
      }
      if (references === 0) continue;
    }
    out.push(statement);
  }
  return out;
}
function wsIrFoldExpr(e) {
  if (!e || typeof e !== "object") return e;
  switch (e.type) {
    case "UnOp": {
      const x = wsIrFoldExpr(e.expr || e.e || e.x);
      const lit = wsIrLiteral(x);
      if (lit.ok) {
        if (e.op === "-" && lit.kind === "num") return wsIrLiteralNode(-lit.value, "num");
        if (e.op === "+" && lit.kind === "num") return wsIrLiteralNode(+lit.value, "num");
        if (e.op === "not") return wsIrLiteralNode(!wsIrTruthy(lit), "bool");
        if (e.op === "#" && lit.kind === "str") return wsIrLiteralNode(new TextEncoder().encode(lit.value).length, "num");
        if (e.op === "~" && lit.kind === "num" && Number.isInteger(lit.value) && lit.value >= -2147483648 && lit.value <= 4294967295)
          return wsIrLiteralNode(~lit.value, "num");
      }
      if (e.expr) return { ...e, expr: x };
      if (e.e) return { ...e, e: x };
      if (e.x) return { ...e, x };
      return e;
    }
    case "BinOp": {
      const l = wsIrFoldExpr(e.l), r = wsIrFoldExpr(e.r);
      const a = wsIrLiteral(l), b = wsIrLiteral(r);
      if (a.ok && b.ok) {
        let v, kind = "num", valid = true;
        try {
          switch (e.op) {
            case "+": if (a.kind === "num" && b.kind === "num") v = a.value + b.value; else valid = false; break;
            case "-": if (a.kind === "num" && b.kind === "num") v = a.value - b.value; else valid = false; break;
            case "*": if (a.kind === "num" && b.kind === "num") v = a.value * b.value; else valid = false; break;
            case "/": if (a.kind === "num" && b.kind === "num" && b.value !== 0) v = a.value / b.value; else valid = false; break;
            case "//": if (a.kind === "num" && b.kind === "num" && b.value !== 0) v = Math.floor(a.value / b.value); else valid = false; break;
            case "%": if (a.kind === "num" && b.kind === "num" && b.value !== 0) v = a.value - Math.floor(a.value / b.value) * b.value; else valid = false; break;
            case "^": if (a.kind === "num" && b.kind === "num") v = Math.pow(a.value, b.value); else valid = false; break;
            case "&": if (a.kind === "num" && b.kind === "num" && Number.isInteger(a.value) && Number.isInteger(b.value) && a.value >= -2147483648 && a.value <= 4294967295 && b.value >= -2147483648 && b.value <= 4294967295) v = a.value & b.value; else valid = false; break;
            case "|": if (a.kind === "num" && b.kind === "num" && Number.isInteger(a.value) && Number.isInteger(b.value) && a.value >= -2147483648 && a.value <= 4294967295 && b.value >= -2147483648 && b.value <= 4294967295) v = a.value | b.value; else valid = false; break;
            case "~": if (a.kind === "num" && b.kind === "num" && Number.isInteger(a.value) && Number.isInteger(b.value) && a.value >= -2147483648 && a.value <= 4294967295 && b.value >= -2147483648 && b.value <= 4294967295) v = a.value ^ b.value; else valid = false; break;
            case "..":
              if (a.kind === "str" && b.kind === "str") { v = a.value + b.value; kind = "str"; }
              else valid = false;
              break;
            case "==": v = a.kind === b.kind && a.value === b.value; kind = "bool"; break;
            case "~=": v = !(a.kind === b.kind && a.value === b.value); kind = "bool"; break;
            case "<": if (a.kind === b.kind && (a.kind === "num" || a.kind === "str")) { v = a.value < b.value; kind = "bool"; } else valid = false; break;
            case "<=": if (a.kind === b.kind && (a.kind === "num" || a.kind === "str")) { v = a.value <= b.value; kind = "bool"; } else valid = false; break;
            case ">": if (a.kind === b.kind && (a.kind === "num" || a.kind === "str")) { v = a.value > b.value; kind = "bool"; } else valid = false; break;
            case ">=": if (a.kind === b.kind && (a.kind === "num" || a.kind === "str")) { v = a.value >= b.value; kind = "bool"; } else valid = false; break;
            case "and": v = wsIrTruthy(a) ? b.value : a.value; kind = wsIrTruthy(a) ? b.kind : a.kind; break;
            case "or": v = wsIrTruthy(a) ? a.value : b.value; kind = wsIrTruthy(a) ? a.kind : b.kind; break;
            default: valid = false;
          }
        } catch (_) { valid = false; }
        if (valid && (kind !== "num" || Number.isFinite(v))) return wsIrLiteralNode(v, kind);
      }
      return { ...e, l, r };
    }
    case "Paren": return { ...e, e: wsIrFoldExpr(e.e) };
    case "Index": return { ...e, obj: wsIrFoldExpr(e.obj), key: wsIrFoldExpr(e.key) };
    case "Call": return { ...e, fn: wsIrFoldExpr(e.fn), args: (e.args || []).map(wsIrFoldExpr) };
    case "IfExpr": {
      const cond = wsIrFoldExpr(e.cond), yes = wsIrFoldExpr(e.yes), no = wsIrFoldExpr(e.no);
      const cv = wsIrLiteral(cond);
      if (cv.ok) return wsIrTruthy(cv) ? yes : no;
      return { ...e, cond, yes, no };
    }
    case "Function": return { ...e, body: wsIrOptimizeBlock(e.body) };
    case "Table": return { ...e, fields: (e.fields || []).map(f => ({ ...f, key: f.key ? wsIrFoldExpr(f.key) : null, value: wsIrFoldExpr(f.value) })) };
    default: return e;
  }
}
function wsIrOptimizeBlock(block, inheritedConstants = null) {
  if (!block || !Array.isArray(block.body)) return block;
  const out = [];
  const constants = new Map(inheritedConstants || []);
  let terminated = false;
  const foldInline = expression => {
    if (!expression) return expression;
    const originalFold = wsIrFoldExpr(expression);
    if (wsIrHasObservableExpressionEffect(originalFold)) return originalFold;
    const candidate = wsIrFoldExpr(wsIrSubstituteExpr(originalFold, constants));
    // Only commit a substitution when the entire expression becomes a literal.
    // This avoids changing evaluation order or metamethod/closure side effects.
    return wsIrLiteral(candidate).ok ? candidate : originalFold;
  };
  for (const original of block.body) {
    if (terminated) break;
    let s = original;
    switch (s.type) {
      case "Local": {
        const exprs = (s.exprs || []).map(foldInline);
        s = { ...s, names: (s.names || []).slice(), exprs };
        for (const name of s.names) constants.delete(name); // New local shadows any outer binding.
        if (s.exprs.some(expression => wsIrHasObservableExpressionEffect(expression) || !wsIrLiteral(expression).ok)) constants.clear();
        if (s.names.length === 1 && s.exprs.length === 1) {
          const literal = wsIrLiteral(s.exprs[0]);
          if (literal.ok) constants.set(s.names[0], literal);
        }
        break;
      }
      case "LocalFunction":
        s = { ...s, func: { ...s.func, body: wsIrOptimizeBlock(s.func.body) } };
        constants.clear(); // A later call may mutate a captured local.
        break;
      case "Assign":
        s = { ...s, targets: (s.targets || []).map(t => wsIrFoldExpr(t)), exprs: (s.exprs || []).map(wsIrFoldExpr) };
        constants.clear();
        break;
      case "CallStat": s = { ...s, call: wsIrFoldExpr(s.call) }; constants.clear(); break;
      case "Return": {
        const effectful = (s.args || []).some(wsIrHasObservableExpressionEffect);
        s = { ...s, args: (s.args || []).map(effectful ? wsIrFoldExpr : foldInline) };
        break;
      }
      case "If": {
        const clauses = (s.clauses || []).map(c => ({ ...c, cond: foldInline(c.cond), body: wsIrOptimizeBlock(c.body, constants) }));
        let selected = null, keep = [];
        let elseBody = s.elseBody ? wsIrOptimizeBlock(s.elseBody, constants) : null;
        for (const c of clauses) {
          const v = wsIrLiteral(c.cond);
          if (v.ok) {
            if (wsIrTruthy(v)) {
              if (keep.length) elseBody = c.body;
              else selected = c.body;
              break;
            }
          } else { keep.push(c); }
        }
        if (selected) { out.push(...selected.body); constants.clear(); continue; }
        if (!keep.length && elseBody) { out.push(...elseBody.body); constants.clear(); continue; }
        if (!keep.length && !elseBody) continue;
        s = { ...s, clauses: keep, elseBody };
        constants.clear();
        break;
      }
      case "While": s = { ...s, cond: wsIrFoldExpr(s.cond), body: wsIrOptimizeBlock(s.body) }; constants.clear(); break;
      case "Repeat": s = { ...s, body: wsIrOptimizeBlock(s.body), cond: wsIrFoldExpr(s.cond) }; constants.clear(); break;
      case "Do": s = { ...s, body: wsIrOptimizeBlock(s.body, constants) }; constants.clear(); break;
      case "NumericFor": s = { ...s, start: wsIrFoldExpr(s.start), stop: wsIrFoldExpr(s.stop), step: wsIrFoldExpr(s.step), body: wsIrOptimizeBlock(s.body) }; constants.clear(); break;
      case "GenericFor": s = { ...s, exprs: (s.exprs || []).map(wsIrFoldExpr), body: wsIrOptimizeBlock(s.body) }; constants.clear(); break;
      default: break;
    }
    out.push(s);
    if (s.type === "Return" || s.type === "Break" || s.type === "Continue") terminated = true;
  }
  return { ...block, body: wsIrPruneUnusedLiteralLocals(out) };
}
function wsIrOptimizeAst(ast) {
  return { ...ast, body: wsIrOptimizeBlock(ast).body };
}

function compileToBytecode(source) {
  const T = lex(source).T;
  let parsedAst;
  try { parsedAst = parseProgram(T); }
  finally { __wsReleaseTokens(T); }
  const ast = wsIrOptimizeAst(parsedAst); // IR pipeline: fold safe literal expressions and prune unreachable tails.
  const fs = newFuncState(null, "main", true);
  enterBlock(fs);
  for (const st of ast.body) compileStat(fs, st);
  leaveBlock(fs);
  emit(fs, "RETURN", { a: fs.locals.length, b: 1 });
  fs.proto = {
    name: fs.name, numparams: 0, vararg: true,
    maxstack: Math.max(fs.maxstack, 2), consts: fs.consts, code: fs.code,
    upvals: fs.upvals, protos: fs.protos
  };
  return fs.proto;
}

function constStr(proto, idx) {
  const k = proto.consts[idx];
  if (!k) return "?";
  return k.type === "str" ? JSON.stringify(k.val) : String(k.val);
}
const SYM = {
  ADD: "+", SUB: "-", MUL: "*", DIV: "/", MOD: "%", POW: "^", IDIV: "//", CONCAT: "..",
  CMPEQ: "==", CMPNE: "~=", CMPLT: "<", CMPLE: "<=", CMPGT: ">", CMPGE: ">=", BOR: "|", BAND: "&", BXOR: "~", SHL: "<<", SHR: ">>",
  FUSED_MOVE_ADD: "+", FUSED_MOVE_SUB: "-", FUSED_MOVE_MUL: "*", FUSED_MOVE_DIV: "/"
};

function disasmInstr(proto, i) {
  const ins = proto.code[i];
  const op = ins.op;
  let s;
  switch (op) {
    case "LOADNIL": s = ins.a === ins.b ? `R${ins.a} := nil` : `R${ins.a}..R${ins.b} := nil`; break;
    case "LOADBOOL": s = `R${ins.a} := ${ins.b ? "true" : "false"}`; break;
    case "LOADK": s = `R${ins.a} := K${ins.bx}  ; ${constStr(proto, ins.bx)}`; break;
    case "MOVE": s = `R${ins.a} := R${ins.b}`; break;
    case "GETGLOBAL": s = `R${ins.a} := _G[${constStr(proto, ins.bx)}]`; break;
    case "SETGLOBAL": s = `_G[${constStr(proto, ins.bx)}] := R${ins.a}`; break;
    case "GETUPVAL": s = `R${ins.a} := Upval(${ins.b})`; break;
    case "SETUPVAL": s = `Upval(${ins.b}) := R${ins.a}`; break;
    case "NEWTABLE": s = `R${ins.a} := {}`; break;
    case "GETTABLE": s = `R${ins.a} := R${ins.b}[${ins.ckey ? constStr(proto, ins.c) : "R" + ins.c}]`; break;
    case "SETTABLE": s = `R${ins.a}[${ins.bkey ? constStr(proto, ins.b) : "R" + ins.b}] := R${ins.c}`; break;
    case "CALL": s = `CALL R${ins.a}  args=${ins.b === 0 ? "multi" : ins.b - 1}  results=${ins.c === 0 ? "multi" : ins.c - 1}`; break;
    case "RETURN": s = `RETURN R${ins.a}..  count=${ins.b === 0 ? "multi" : ins.b - 1}`; break;
    case "JMP": s = `JMP -> ${i + 1 + ins.sbx}`; break;
    case "STATEPRED": s = `STATEPRED R${ins.a} := opaque-runtime-state`; break;
    case "JMPIF": s = `if R${ins.a} then JMP -> ${i + 1 + ins.sbx}`; break;
    case "JMPIFNOT": s = `if not R${ins.a} then JMP -> ${i + 1 + ins.sbx}`; break;
    case "UNM": s = `R${ins.a} := -R${ins.b}`; break;
    case "NOT": s = `R${ins.a} := not R${ins.b}`; break;
    case "LEN": s = `R${ins.a} := #R${ins.b}`; break;
    case "FORPREP": s = `FORPREP R${ins.a}  -> ${i + 1 + ins.sbx}`; break;
    case "FORLOOP": s = `FORLOOP R${ins.a}  -> ${i + 1 + ins.sbx}`; break;
    case "TFORLOOP": s = `TFORLOOP R${ins.a}  (${ins.c} results)`; break;
    case "CLOSURE": s = `R${ins.a} := CLOSURE proto#${ins.bx}`; break;
    case "VARARG": s = `R${ins.a} := ...`; break;
    default: s = SYM[op] ? `R${ins.a} := R${ins.b} ${SYM[op]} R${ins.c}` : op;
  }
  return s;
}

function disasmProto(proto, depth) {
  depth = depth || 0;
  const pad = "  ".repeat(depth);
  const lines = [];
  lines.push(`${pad}function ${proto.name}(${proto.numparams} params${proto.vararg ? ", ..." : ""})  ; maxstack=${proto.maxstack}`);
  for (let i = 0; i < proto.code.length; i++) {
    lines.push(`${pad}  ${String(i).padStart(3)}  ${proto.code[i].op.padEnd(9)} ${disasmInstr(proto, i)}`);
  }
  lines.push(`${pad}end`);
  for (const child of proto.protos) {
    lines.push("");
    lines.push(...disasmProto(child, depth));
  }
  return lines;
}
function disassemble(proto) { return disasmProto(proto, 0).join("\n"); }

/* ========== VM + GC (simplified from stage 5/6) ========== */
__wqC();
function makeRng(seedStr) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  let s = h || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}
let VM_RNG = __wsVmCryptoFloat;
const vmRandInt = n => Math.floor(VM_RNG() * n);
const REAL_OPCODES = [
  "LOADNIL","LOADBOOL","LOADK","MOVE","GETGLOBAL","SETGLOBAL","GETUPVAL","SETUPVAL",
  "NEWTABLE","GETTABLE","SETTABLE","CALL","RETURN","VARARG","CLOSURE","JMP","JMPIF","JMPIFNOT",
  "UNM","NOT","LEN","ADD","SUB","MUL","DIV","MOD","POW","IDIV","CONCAT",
  "FORPREP","FORLOOP","TFORLOOP","CMPEQ","CMPNE","CMPLT","CMPLE","CMPGT","CMPGE","BOR","BAND","BXOR","SHL","SHR","BNOT",
  "FUSED_MOVE_ADD","FUSED_MOVE_SUB","FUSED_MOVE_MUL","FUSED_MOVE_DIV",
  "MATHCLAMP","MATHFLOOR","MATHCEIL","MATHABS","MATHSQRT","MATHMIN","MATHMAX","STATEPRED","NOP"
];
// Opcode labels and slot maps are rebuilt for each synchronous build. Keeping these
// module-global tables fixed would make opcode-slot relationships repeat across
// every request handled by a long-lived server process.
let FAKE_OPCODES = [];
let OBF_OPCODES = { bySlot: [], nameToSlot: new Map() };
let STAGE_MASK_PC_MUL = 1;
let STAGE_MASK_STAGE_MUL = 1;
let VM_MASK_SEED = 0;
function buildObfuscatedOpcodeTable() {
  const a = [
    ...REAL_OPCODES.map(name => ({ name, real: true })),
    ...FAKE_OPCODES.map(name => ({ name, real: false }))
  ];
  for (let i = a.length - 1; i > 0; i--) {
    const j = vmRandInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return { bySlot: a, nameToSlot: new Map(a.map((x, i) => [x.name, i])) };
}
function __wsInitializeVmLayout() {
  const labels = new Set();
  const pools = [
    () => "x/" + Array.from({length:8},()=>Math.floor(secureRandomFloat()*10)).join("") + "<_~fg12",
    () => "0x" + Math.floor(secureRandomFloat()*0xFFFFFFFF).toString(16).padStart(8,"0"),
    () => "_" + secureRandomFloat().toString(36).slice(2,10) + (secureRandomFloat()*1e6|0),
    () => "op@" + Math.floor(secureRandomFloat()*65536).toString(16),
    () => "μ" + Math.floor(secureRandomFloat()*99999),
  ];
  FAKE_OPCODES = Array.from({ length: 128 }, () => {
    let label;
    do { label = pools[secureRandomFloat()*pools.length|0](); }
    while (labels.has(label));
    labels.add(label);
    return label;
  });
  OBF_OPCODES = buildObfuscatedOpcodeTable();
  STAGE_MASK_PC_MUL = ((Math.floor(secureKeyFloat()*0x100000000)>>>0)|1)>>>0;
  STAGE_MASK_STAGE_MUL = ((Math.floor(secureKeyFloat()*0x100000000)>>>0)|1)>>>0;
  VM_MASK_SEED = (Math.floor(secureKeyFloat()*0x100000000)>>>0);
}
function __wsResetVmLayout() {
  FAKE_OPCODES = [];
  OBF_OPCODES = { bySlot: [], nameToSlot: new Map() };
  STAGE_MASK_PC_MUL = 1;
  STAGE_MASK_STAGE_MUL = 1;
  VM_MASK_SEED = 0;
}

/* UPGRADE v8.1: two-stage opcode mask + pc-dependent a-mask + decoy slots */
function stageMask(seed, pc, stage) {
  let x = (seed ^ Math.imul(pc + 1, STAGE_MASK_PC_MUL) ^ Math.imul(stage, STAGE_MASK_STAGE_MUL)) >>> 0;
  x = Math.imul(x ^ (x >>> 15), 0x2C1B3C6D) >>> 0;
  x = Math.imul(x ^ (x >>> 12), 0x297A2D39) >>> 0;
  return x & 0xff;
}
function maskSlot(op, k1, k2) { return ((op ^ k1) + k2) & 0xffff; }
function unmaskSlot(m, k1, k2) { return (((m - k2) & 0xffff) ^ k1); }
function mapProtoToVm(proto, depth) {
  depth = depth || 0;
  const seedBase = (VM_MASK_SEED + depth * 977 + (proto.code ? proto.code.length : 0)) >>> 0;
  const code = [];
  const pcMap = new Map(); // P1: remap original PCs after decoys so branches retain their targets.
  const BRANCH_OPS = new Set(["JMP", "JMPIF", "JMPIFNOT", "FORPREP", "FORLOOP", "TFORLOOP"]);
  // P1: first pass inserts decoys and records each original instruction's VM PC.
  (proto.code || []).forEach((ins, pc) => {
    const slot = OBF_OPCODES.nameToSlot.get(ins.op);
    if (slot === undefined) throw Error("Unknown opcode: " + ins.op);
    const k1 = stageMask(seedBase, pc, 1);
    const k2 = stageMask(seedBase, pc, 2);
    const maskedSlot = maskSlot(slot, k1, k2);
    const aMask = (Math.imul(k1, 3) + pc + k2) & 0x1f;
    const a = ins.a !== undefined ? (ins.a ^ aMask) : ins.a;
    pcMap.set(pc, code.length);
    code.push({ ...ins, slot: maskedSlot, _k1: k1, _k2: k2, _am: aMask, a });
    // P1: decoy instructions distort opcode-frequency analysis without executing.
    if ((pc * 11 + k1 * 3) % 7 < 2) {
      const fakeIdx = (k2 + pc * 13) % FAKE_OPCODES.length;
      const fakeSlot = OBF_OPCODES.nameToSlot.get(FAKE_OPCODES[fakeIdx]);
      code.push({ slot: fakeSlot, _k1: stageMask(seedBase, pc + 1, 1), _k2: stageMask(seedBase, pc + 2, 2), _am: 0, a: 0, _decoy: true });
    }
  });
  // P1: translate proto-space branch offsets into decoy-inclusive VM-space offsets.
  (proto.code || []).forEach((ins, pc) => {
    if (!BRANCH_OPS.has(ins.op)) return;
    const origTarget = pc + 1 + (ins.sbx || 0);
    const newTarget = pcMap.has(origTarget) ? pcMap.get(origTarget) : code.length;
    const vmIdx = pcMap.get(pc);
    if (vmIdx !== undefined) code[vmIdx].sbx = newTarget - vmIdx - 1;
  });
  return {
    name: proto.name,
    numparams: proto.numparams || 0,
    vararg: !!proto.vararg,
    maxstack: proto.maxstack || 2,
    consts: proto.consts || [],
    seedBase,
    vmCode: code,
    upvals: proto.upvals || [],
    protos: (proto.protos || []).map((p, i) => mapProtoToVm(p, depth + 1 + i))
  };
}

const V = {
  nil: () => ({ t: "nil", v: null }),
  bool: b => ({ t: "bool", v: !!b }),
  num: n => ({ t: "num", v: +n }),
  str: s => ({ t: "str", v: String(s) }),
  table: o => ({ t: "table", v: o }),
  func: (p, u) => ({ t: "func", v: { proto: p, upvals: u } }),
  native: (fn, name) => ({ t: "native", v: fn, name: name || "?" })
};
function vmTruthy(v) { return !!v && v.t !== "nil" && (v.t !== "bool" || v.v); }
function vmNum(v) {
  if (!v || v.t === "nil") throw Error("arithmetic on nil");
  if (v.t === "num") return v.v;
  if (v.t === "str" && !Number.isNaN(+v.v)) return +v.v;
  throw Error("arithmetic on " + v.t);
}
function vmStr(v) {
  if (!v || v.t === "nil") return "nil";
  if (v.t === "str" || v.t === "num") return String(v.v);
  if (v.t === "bool") return v.v ? "true" : "false";
  return "<" + v.t + ">";
}
let __tableId = 0;
// v8.1-43: reference keys map back to their original object, so next() returns the real key.
const __refKeys = new Map();
function vmTableKey(k) {
  if (!k) return "nil:null";
  if (k.t === "table" || k.t === "func" || k.t === "native") {
    if (!k.__id) { k.__id = "ref:" + (++__tableId); __refKeys.set(k.__id, k); }
    return k.__id;
  }
  return k.t + ":" + String(k.v);
}
function vmGet(t, k) {
  // Lua string metatable methods are reachable through colon syntax (s:sub(...)).
  // The test VM models only the bounded helpers needed by the generated CFF payload.
  if (t && t.t === "str" && k && k.t === "str") {
    const method = k.v;
    if (method === "sub") return V.native(a => {
      const source = vmStr(a[0]); let start = Math.trunc(vmNum(a[1] || V.num(1))); let end = a[2] && a[2].t !== "nil" ? Math.trunc(vmNum(a[2])) : source.length;
      if (start < 0) start = source.length + start + 1;
      if (end < 0) end = source.length + end + 1;
      start = Math.max(1, start); end = Math.min(source.length, end);
      return [V.str(end < start ? "" : source.slice(start - 1, end))];
    }, "string.sub");
    if (method === "lower") return V.native(a => [V.str(vmStr(a[0]).toLowerCase())], "string.lower");
    if (method === "byte") return V.native(a => { const source=vmStr(a[0]); const i=Math.trunc(vmNum(a[1]||V.num(1))); const j=a[2]&&a[2].t!=="nil"?Math.trunc(vmNum(a[2])):i; const out=[]; for(let n=i;n<=j;n++){let q=n<0?source.length+n+1:n;if(q<1||q>source.length)out.push(V.nil());else out.push(V.num(source.charCodeAt(q-1)&255));}return out; }, "string.byte");
  }
  if (!t || t.t !== "table") throw Error("index non-table");
  return t.v.get(vmTableKey(k)) || V.nil();
}
// v8.1-42: Lua's # on a table returns some border (t[n] ~= nil and t[n+1] == nil).
// Counting every key, as before, returned 1 for {a=1}; scanning from index 1 gives 0.
function vmTableBorder(t) {
  let n = 0;
  while (vmGet(t, V.num(n + 1)).t !== "nil") n++;
  return n;
}
function vmSet(t, k, v) {
  if (!t || t.t !== "table") throw Error("index non-table");
  const key = vmTableKey(k);
  t.__order = null; // v8.1-45: next() caches the key order; any write invalidates it
  if (v.t === "nil") t.v.delete(key);
  else t.v.set(key, v);
}
function makeVmGlobals(logs) {
  const g = new Map();
  const reg = (n, f) => g.set(n, V.native(f, n));
  reg("print", a => { logs.push(a.map(vmStr).join("\t")); return [V.nil()]; });
  reg("tostring", a => [V.str(vmStr(a[0]))]);
  reg("tonumber", a => {
    const n = Number(vmStr(a[0]));
    return Number.isNaN(n) ? [V.nil()] : [V.num(n)];
  });
  // Minimal string helpers required by generated CFF payloads in the test interpreter.
  // This mirrors the Lua APIs used by the emitted code without changing production output.
  const stringLib = V.table(new Map());
  vmSet(stringLib, V.str("char"), V.native(a => [V.str(a.map(x => String.fromCharCode(((Math.trunc(vmNum(x)) % 256) + 256) % 256)).join(""))], "string.char"));
  vmSet(stringLib, V.str("lower"), V.native(a => [V.str(vmStr(a[0]).toLowerCase())], "string.lower"));
  vmSet(stringLib, V.str("sub"), V.native(a => {
    const source=vmStr(a[0]); let start=Math.trunc(vmNum(a[1]||V.num(1))); let end=a[2]&&a[2].t!=="nil"?Math.trunc(vmNum(a[2])):source.length;
    if(start<0)start=source.length+start+1;if(end<0)end=source.length+end+1;start=Math.max(1,start);end=Math.min(source.length,end);
    return [V.str(end<start?"":source.slice(start-1,end))];
  }, "string.sub"));
  vmSet(stringLib, V.str("find"), V.native(a => {
    const source=vmStr(a[0]), pattern=vmStr(a[1]); const init=a[2]&&a[2].t!=="nil"?Math.trunc(vmNum(a[2])):1; const plain=!!(a[3]&&vmTruthy(a[3]));
    const from=init<0?Math.max(0,source.length+init):Math.max(0,init-1); let at=-1;
    if(plain) at=source.indexOf(pattern,from); else { try { const re=new RegExp(pattern); const m=re.exec(source.slice(from)); if(m)at=from+m.index; } catch (_) { at=source.indexOf(pattern,from); } }
    return at<0?[V.nil()]:[V.num(at+1),V.num(at+pattern.length)];
  }, "string.find"));
  vmSet(stringLib, V.str("byte"), V.native(a => {
    const source=vmStr(a[0]); const i=a[1]&&a[1].t!=="nil"?Math.trunc(vmNum(a[1])):1; const j=a[2]&&a[2].t!=="nil"?Math.trunc(vmNum(a[2])):i; const out=[];
    for(let n=i;n<=j;n++){const q=n<0?source.length+n+1:n;out.push(q<1||q>source.length?V.nil():V.num(source.charCodeAt(q-1)&255));}return out;
  }, "string.byte"));
  vmSet(stringLib, V.str("gmatch"), V.native(a => {
    const source = vmStr(a[0]);
    const pattern = vmStr(a[1]);
    let rx;
    if (pattern === "(%d+):(%d+)") rx = /(\d+):(\d+)/g;
    else if (pattern === "(%d+):(%d+):(%d+)") rx = /(\d+):(\d+):(\d+)/g;
    else if (pattern === "([^,]+)") rx = /([^,]+)/g;
    else {
      if ((globalThis.__WSFUSCATE_TEST_MODE__ === true || globalThis.__antiTamperDiagnostics === true) && typeof console !== "undefined" && console.warn) {
        console.warn("WSFuscate VM string.gmatch model: unsupported pattern; using minimal fallback:", pattern);
      }
      rx = /(.*?)/g;
    }
    return [V.native(() => {
      const match = rx.exec(source);
      if (!match) return [V.nil()];
      if (match[0] === "") rx.lastIndex = Math.max(rx.lastIndex + 1, source.length + 1);
      return match.slice(1).filter(x => x !== undefined).map(x => V.str(x));
    }, "string.gmatch_iter")];
  }, "string.gmatch"));
  g.set("string", stringLib);
  reg("type", a => [V.str((a[0] || V.nil()).t)]);
  // P1: select/assert cover common globals used by vararg and validation code.
  reg("select", a => {
    if (a.length === 0) throw Error("bad argument #1 to 'select' (number expected)");
    if (a[0].t === "str" && a[0].v === "#") return [V.num(a.length - 1)];
    const n = vmNum(a[0]);
    if (!Number.isInteger(n) || n === 0) throw Error("bad argument #1 to 'select' (index out of range)");
    const values = a.slice(1);
    const start = n < 0 ? values.length + n : n - 1;
    if (start < 0) throw Error("bad argument #1 to 'select' (index out of range)");
    return values.slice(start);
  });
  reg("assert", a => {
    if (!vmTruthy(a[0])) throw Error((a[1] && vmStr(a[1])) || "assertion failed");
    return a;
  });
  reg("error", a => {
    const msg = a[0] ? vmStr(a[0]) : "error";
    throw Error(msg);
  });
  reg("pcall", a => {
    const fn = a[0];
    try {
      let rets;
      if (!fn || fn.t === "nil") throw Error("bad argument #1 to pcall (function expected)");
      if (fn.t === "native") rets = fn.v(a.slice(1)) || [];
      else if (fn.t === "func") rets = runVmProto(fn.v.proto, g, a.slice(1), {}, fn.v.upvals);
      else throw Error("bad argument #1 to pcall (function expected)");
      return [V.bool(true), ...rets];
    } catch (e) {
      return [V.bool(false), V.str(e.message || String(e))];
    }
  });
  reg("xpcall", a => {
    const fn = a[0], handler = a[1];
    try {
      let rets;
      if (!fn || fn.t === "nil") throw Error("bad argument #1 to xpcall (function expected)");
      if (fn.t === "native") rets = fn.v(a.slice(2)) || [];
      else if (fn.t === "func") rets = runVmProto(fn.v.proto, g, a.slice(2), {}, fn.v.upvals);
      else throw Error("bad argument #1 to xpcall (function expected)");
      return [V.bool(true), ...rets];
    } catch (e) {
      let handled = [V.str(e.message || String(e))];
      try {
        if (handler && handler.t === "native") handled = handler.v([V.str(e.message || String(e))]) || handled;
        else if (handler && handler.t === "func") handled = runVmProto(handler.v.proto, g, [V.str(e.message || String(e))], {}, handler.v.upvals) || handled;
      } catch (_) {}
      return [V.bool(false), ...handled];
    }
  });
  /* FIX #19: pairs / ipairs / next for generic for */
  reg("next", a => {
    const t = a[0];
    if (!t || t.t !== "table") return [V.nil()];
    // v8.1-45: the key order and its position index are cached per table and rebuilt only
    // after a write, so a pairs() loop is O(n) rather than O(n^2).
    if (!t.__order) {
      const ks = [...t.v.keys()];
      t.__order = { ks, pos: new Map(ks.map((k, i) => [k, i])) };
    }
    const keys = t.__order.ks;
    const prev = a[1];
    let idx = -1;
    if (prev && prev.t !== "nil") {
      // v8.1-43: vmTableKey gives the same key for scalars and the object id for table keys.
      // The old string form was "table:[object Map]" for reference keys, so next() never found
      // its position and pairs() looped forever.
      const pk = vmTableKey(prev);
      const p = t.__order.pos.get(pk);
      idx = p === undefined ? -1 : p;
    }
    const n = idx + 1;
    if (n >= keys.length) return [V.nil()];
    const k = keys[n];
    const [kt, ...rest] = k.split(":");
    const kv = rest.join(":");
    const keyVal = kt === "num" ? V.num(+kv) : kt === "bool" ? V.bool(kv === "true")
      : kt === "ref" ? (__refKeys.get(k) || V.nil()) : V.str(kv);
    return [keyVal, t.v.get(k) || V.nil()];
  });
  reg("pairs", a => {
    const t = a[0] || V.table(new Map());
    return [globalsGet("next"), t, V.nil()];
  });
  reg("ipairs", a => {
    const t = a[0] || V.table(new Map());
    const iter = V.native(args => {
      const tbl = args[0];
      const i = vmNum(args[1] || V.num(0)) + 1;
      const v = vmGet(tbl, V.num(i));
      if (v.t === "nil") return [V.nil()];
      return [V.num(i), v];
    }, "ipairs_iter");
    return [iter, t, V.num(0)];
  });
  function globalsGet(n) { return g.get(n) || V.nil(); }
  const tbl = V.table(new Map());
  vmSet(tbl, V.str("insert"), V.native(a => {
    // v8.1-43: append at the border (#t + 1), as Luau does. Counting keys was wrong for
    // tables with hash entries. The 3-argument form shifts elements up from pos.
    const t = a[0];
    if (a.length <= 2) {
      vmSet(t, V.num(vmTableBorder(t) + 1), a[a.length - 1]);
    } else {
      const pos = vmNum(a[1]), n = vmTableBorder(t);
      // v8.1-44: Luau rejects positions outside 1..#t+1 instead of creating holes.
      if (!Number.isInteger(pos) || pos < 1 || pos > n + 1)
        throw Error("bad argument #2 to 'insert' (position out of bounds)");
      for (let i = n; i >= pos; i--) vmSet(t, V.num(i + 1), vmGet(t, V.num(i)));
      vmSet(t, V.num(pos), a[2]);
    }
    return [];
  }, "table.insert"));
  vmSet(tbl, V.str("concat"), V.native(a => {
    const t = a[0];
    if (!t || t.t !== "table") throw Error("bad argument #1 to 'concat' (table expected)");
    const sep = a[1] && a[1].t !== "nil" ? vmStr(a[1]) : "";
    const first = a[2] && a[2].t !== "nil" ? vmNum(a[2]) : 1;
    const last = a[3] && a[3].t !== "nil" ? vmNum(a[3]) : vmTableBorder(t);
    const out = [];
    for (let i = first; i <= last; i++) {
      const value = vmGet(t, V.num(i));
      if (!value || value.t === "nil") throw Error("invalid value (nil) at index " + i + " in table.concat");
      if (value.t !== "str" && value.t !== "num") throw Error("invalid value (" + value.t + ") at index " + i + " in table.concat");
      out.push(vmStr(value));
    }
    return [V.str(out.join(sep))];
  }, "table.concat"));
  g.set("table", tbl);
  const math = V.table(new Map());
  for (const [n, f] of Object.entries({ floor: Math.floor, ceil: Math.ceil, abs: Math.abs, sqrt: Math.sqrt })) {
    vmSet(math, V.str(n), V.native(a => [V.num(f(vmNum(a[0])))], "math." + n));
  }
  // v8.1-43: math.random honours its arguments: () -> [0,1), (m) -> [1,m], (m,n) -> [m,n].
  vmSet(math, V.str("random"), V.native(a => {
    if (a.length === 0) return [V.num(secureRandomFloat())];
    const lo = a.length === 1 ? 1 : Math.floor(vmNum(a[0]));
    const hi = Math.floor(vmNum(a[a.length === 1 ? 0 : 1]));
    // v8.1-44: an empty interval is an error in Luau, not a value outside the range.
    if (lo > hi) throw Error("bad argument #2 to 'random' (interval is empty)");
    return [V.num(lo + Math.floor(secureRandomFloat() * (hi - lo + 1)))];
  }, "math.random"));
  g.set("math", math);
  g.set("game", V.table(new Map([["GetService", V.native(() => [V.table(new Map())], "GetService")]])));
  return g;
}

function runVmProto(vmProto, globals, args, stats, upvals) {
  if (stats) stats.calls++;
  const reg = Array.from({ length: Math.max(2, vmProto.maxstack) }, () => V.nil());
  for (let i = 0; i < (vmProto.numparams || 0); i++) reg[i] = args[i] || V.nil();
  const varargs = args.slice(vmProto.numparams || 0);
  const code = vmProto.vmCode;
  const cs = vmProto.consts;
  let pc = 0, guard = 0, top = vmProto.numparams || 0;
  /* FIX #14: track top for multi-return */
  const touch = (a, n = 1) => { top = Math.max(top, (a || 0) + n); };
  const k = i => {
    const x = cs[i];
    if (!x) return V.nil();
    return x.type === "num" ? V.num(x.val) : x.type === "bool" ? V.bool(x.val) : V.str(x.val);
  };
  const uv = i => upvals[i] || { get: () => V.nil(), set: () => {} };
  while (pc >= 0 && pc < code.length) {
    if (++guard > 1e6) throw Error("VM instruction limit");
    const ins0 = code[pc];
    const next = pc + 1;
    /* UPGRADE v8.1: restore two-stage slot and pc-dependent a-field mask */
    const k1 = ins0._k1 !== undefined ? ins0._k1 : stageMask(vmProto.seedBase || 0, pc, 1);
    const k2 = ins0._k2 !== undefined ? ins0._k2 : stageMask(vmProto.seedBase || 0, pc, 2);
    const _slot = unmaskSlot(ins0.slot, k1, k2);
    const aMask = ins0._am !== undefined ? ins0._am : ((Math.imul(k1, 3) + pc + k2) & 0x1f);
    const ins = {
      ...ins0,
      slot: _slot,
      a: ins0.a !== undefined ? (ins0.a ^ aMask) : ins0.a
    };
    const opEntry = OBF_OPCODES.bySlot[_slot];
    if (!opEntry || !opEntry.real || ins0._decoy) { pc = next; continue; }
    const op = opEntry.name;
    if (stats) {
      /* BUGFIX (v8.1-32): pcall/xpcall pass a bare `{}` as stats, so `opcodes` was
         undefined and this line threw "Cannot read properties of undefined (reading 'LOADK')"
         for every pcall(function ...) call. Initialize the counters lazily. */
      stats.instructions = (stats.instructions || 0) + 1;
      stats.opcodes = stats.opcodes || {};
      stats.opcodes[op] = (stats.opcodes[op] || 0) + 1;
    }
    const A = () => reg[ins.a] || V.nil();
    const B = () => reg[ins.b] || V.nil();
    const C = () => reg[ins.c] || V.nil();
    switch (op) {
      case "LOADNIL": for (let i = ins.a; i <= ins.b; i++) reg[i] = V.nil(); pc = next; break;
      case "LOADBOOL": reg[ins.a] = V.bool(ins.b); touch(ins.a); pc = next; break;
      case "STATEPRED": reg[ins.a] = V.bool(((pc * 37 + (stats?.instructions || 0) * 19 + (stats?.calls || 0) * 7) % 2) === 0); pc = next; break;
      case "NOP": pc = next; break;
      case "LOADK": reg[ins.a] = k(ins.bx); touch(ins.a); pc = next; break;
      case "MOVE": reg[ins.a] = B(); touch(ins.a); pc = next; break;
      case "GETGLOBAL": reg[ins.a] = globals.get(cs[ins.bx]?.val) || V.nil(); pc = next; break;
      case "SETGLOBAL": globals.set(cs[ins.bx]?.val, A()); pc = next; break;
      case "GETUPVAL": reg[ins.a] = uv(ins.b).get(); pc = next; break;
      case "SETUPVAL": uv(ins.b).set(A()); pc = next; break;
      case "NEWTABLE": reg[ins.a] = V.table(new Map()); if (stats) stats.allocations++; pc = next; break;
      case "GETTABLE": reg[ins.a] = vmGet(B(), ins.ckey ? k(ins.c) : C()); pc = next; break;
      case "SETTABLE": vmSet(A(), ins.bkey ? k(ins.b) : B(), C()); pc = next; break;
      case "ADD": reg[ins.a] = V.num(vmNum(B()) + vmNum(C())); pc = next; break;
      case "SUB": reg[ins.a] = V.num(vmNum(B()) - vmNum(C())); pc = next; break;
      case "MUL": reg[ins.a] = V.num(vmNum(B()) * vmNum(C())); pc = next; break;
      case "DIV": reg[ins.a] = V.num(vmNum(B()) / vmNum(C())); pc = next; break;
      case "MOD": reg[ins.a] = V.num(vmNum(B()) % vmNum(C())); pc = next; break;
      case "POW": reg[ins.a] = V.num(vmNum(B()) ** vmNum(C())); pc = next; break;
      case "IDIV": reg[ins.a] = V.num(Math.floor(vmNum(B()) / vmNum(C()))); pc = next; break;
      case "CONCAT": reg[ins.a] = V.str(vmStr(B()) + vmStr(C())); pc = next; break;
      case "UNM": reg[ins.a] = V.num(-vmNum(B())); pc = next; break;
      case "NOT": reg[ins.a] = V.bool(!vmTruthy(B())); pc = next; break;
      case "LEN": {
        const v = B();
        const len = v.t === "str"
          ? new TextEncoder().encode(v.v).length
          : v.t === "table" ? vmTableBorder(v) : 0;
        reg[ins.a] = V.num(len);
        pc = next; break;
      }
      case "JMP": pc = pc + 1 + ins.sbx; break;
      case "JMPIF": pc = vmTruthy(A()) ? pc + 1 + ins.sbx : next; break;
      case "JMPIFNOT": pc = !vmTruthy(A()) ? pc + 1 + ins.sbx : next; break;
      case "CMPEQ": reg[ins.a] = V.bool(B().t === C().t && B().v === C().v); pc = next; break;
      case "CMPNE": reg[ins.a] = V.bool(!(B().t === C().t && B().v === C().v)); pc = next; break;
      case "CMPLT": reg[ins.a] = V.bool(vmNum(B()) < vmNum(C())); pc = next; break;
      case "CMPLE": reg[ins.a] = V.bool(vmNum(B()) <= vmNum(C())); pc = next; break;
      case "CMPGT": reg[ins.a] = V.bool(vmNum(B()) > vmNum(C())); pc = next; break;
      case "CMPGE": reg[ins.a] = V.bool(vmNum(B()) >= vmNum(C())); pc = next; break;
      case "BOR": reg[ins.a] = V.num((vmNum(B()) | vmNum(C())) >>> 0); pc = next; break;
      case "BAND": reg[ins.a] = V.num((vmNum(B()) & vmNum(C())) >>> 0); pc = next; break;
      case "BXOR": reg[ins.a] = V.num((vmNum(B()) ^ vmNum(C())) >>> 0); pc = next; break;
      case "SHL": reg[ins.a] = V.num((vmNum(B()) << (vmNum(C()) & 31)) >>> 0); pc = next; break;
      case "SHR": reg[ins.a] = V.num((vmNum(B()) >>> (vmNum(C()) & 31)) >>> 0); pc = next; break;
      case "BNOT": reg[ins.a] = V.num((~vmNum(B())) >>> 0); pc = next; break;
      case "MATHCLAMP": {
        const x = vmNum(B()), lo = vmNum(C()), hi = vmNum(reg[ins.bx] || V.nil());
        reg[ins.a] = V.num(Math.min(Math.max(x, lo), hi)); pc = next; break;
      }
      case "MATHFLOOR": reg[ins.a] = V.num(Math.floor(vmNum(B()))); pc = next; break;
      case "MATHCEIL": reg[ins.a] = V.num(Math.ceil(vmNum(B()))); pc = next; break;
      case "MATHABS": reg[ins.a] = V.num(Math.abs(vmNum(B()))); pc = next; break;
      case "MATHSQRT": reg[ins.a] = V.num(Math.sqrt(vmNum(B()))); pc = next; break;
      case "MATHMIN": reg[ins.a] = V.num(Math.min(vmNum(B()), vmNum(C()))); pc = next; break;
      case "MATHMAX": reg[ins.a] = V.num(Math.max(vmNum(B()), vmNum(C()))); pc = next; break;
      case "CALL": {
        const base = ins.a;
        const argc = ins.b === 0 ? Math.max(0, top - base - 1) : ins.b - 1;
        const fn = reg[base];
        const av = [];
        for (let i = 1; i <= argc; i++) av.push(reg[base + i] || V.nil());
        let rets;
        if (fn.t === "native") rets = fn.v(av) || [];
        else if (fn.t === "func") rets = runVmProto(fn.v.proto, globals, av, stats, fn.v.upvals);
        else throw Error("call a " + fn.t + " value");
        const n = ins.c === 0 ? rets.length : ins.c - 1;
        for (let i = 0; i < n; i++) reg[base + i] = rets[i] || V.nil();
        top = base + n;
        pc = next; break;
      }
      case "RETURN": {
        const n = ins.b === 0 ? Math.max(0, top - ins.a) : ins.b - 1;
        return Array.from({ length: n }, (_, i) => reg[ins.a + i] || V.nil());
      }
      case "VARARG": {
        const n = ins.b === 0 ? varargs.length : ins.b - 1;
        for (let i = 0; i < n; i++) reg[ins.a + i] = varargs[i] || V.nil();
        top = ins.a + n;
        pc = next; break;
      }
      case "CLOSURE": {
        const child = vmProto.protos[ins.bx];
        const u = child.upvals.map(x =>
          x.inStack
            ? { get: () => reg[x.idx] || V.nil(), set: v => { reg[x.idx] = v; } }
            : uv(x.idx)
        );
        reg[ins.a] = V.func(child, u);
        if (stats) stats.allocations++;
        pc = next; break;
      }
      case "FORPREP": {
        const a = ins.a;
        reg[a] = V.num(vmNum(reg[a]) - vmNum(reg[a + 2]));
        touch(a, 4);
        pc = pc + 1 + ins.sbx; break;
      }
      case "FORLOOP": {
        const a = ins.a;
        const step = vmNum(reg[a + 2]);
        const lim = vmNum(reg[a + 1]);
        const idx = vmNum(reg[a]) + step;
        if (step > 0 ? idx <= lim : idx >= lim) {
          reg[a] = V.num(idx);
          reg[a + 3] = V.num(idx);
          pc = pc + 1 + ins.sbx;
        } else pc = next;
        break;
      }
      /* FIX #19: TFORLOOP invokes iterator; update control R(A+2) */
      case "TFORLOOP": {
        const base = ins.a;
        const fn = reg[base];
        const av = [reg[base + 1] || V.nil(), reg[base + 2] || V.nil()];
        let rr = [];
        if (fn?.t === "native") rr = fn.v(av) || [];
        else if (fn?.t === "func") rr = runVmProto(fn.v.proto, globals, av, stats, fn.v.upvals) || [];
        for (let i = 0; i < (ins.c || 1); i++) reg[base + 3 + i] = rr[i] || V.nil();
        if (vmTruthy(reg[base + 3])) reg[base + 2] = reg[base + 3];
        top = Math.max(top, base + 3 + (ins.c || 1));
        pc = next; break;
      }
      default: pc = next;
    }
  }
  return [];
}

function runBytecode(source) {
  const proto = compileToBytecode(source);
  const vmProto = mapProtoToVm(proto);
  const logs = [];
  /* FIX #5 */
  const stats = { calls: 0, instructions: 0, allocations: 0, opcodes: {} };
  const globals = makeVmGlobals(logs);
  const rets = runVmProto(vmProto, globals, [], stats, []);
  return { rets, proto, vmProto, globals, logs, stats };
}

function dumpVmCode(p, depth = 0) {
  const pad = "  ".repeat(depth);
  const lines = [`${pad}VM ${p.name} (${p.vmCode.length} instr, maxstack=${p.maxstack})`];
  p.vmCode.forEach((i, n) => {
    // FIX: use two-stage unmask (_k1/_k2) matching mapProtoToVm / runVmProto
    const k1 = i._k1 !== undefined ? i._k1 : stageMask(p.seedBase || 0, n, 1);
    const k2 = i._k2 !== undefined ? i._k2 : stageMask(p.seedBase || 0, n, 2);
    const slot = unmaskSlot(i.slot, k1, k2);
    const e = OBF_OPCODES.bySlot[slot] || { name: "?", real: false };
    const tag = "";
    lines.push(`${pad}  ${String(n).padStart(3)} [slot ${String(slot).padStart(3)} k1=${k1} k2=${k2}] ${tag}${e.name}`);
  });
  for (const c of p.protos) {
    lines.push("");
    lines.push(...dumpVmCode(c, depth + 1));
  }
  return lines;
}

const GC_WHITE = 0, GC_GRAY = 1, GC_BLACK = 2, HDR_SIZE = 16;
const GC_TYPE = { TABLE: 1, CLOSURE: 2, STRING: 3, NATIVE: 4 };
class TriColorGC {
  constructor(opts = {}) {
    this.HEAP_BYTES = opts.heapSize || 65536;
    this.objects = new Map();
    this.nextAllocId = 1;
    this.roots = new Set();
    this.grayStack = [];
    this.markPhase = "idle";
    this.bytesAllocated = 0;
    this.bytesFreed = 0;
    this.collections = 0;
    this.steps = 0;
  }
  alloc(type, ref = {}, sizeHint = 32) {
    const id = this.nextAllocId++;
    const size = Math.max(HDR_SIZE, sizeHint);
    this.objects.set(id, { offset: this.bytesAllocated, size, type, ref, mark: GC_WHITE });
    this.bytesAllocated += size;
    return id;
  }
  getMark(id) { return this.objects.get(id)?.mark ?? -1; }
  setMark(id, m) { const o = this.objects.get(id); if (o) o.mark = m; }
  markRoots() {
    for (const id of this.roots) {
      if (this.objects.has(id) && this.getMark(id) === GC_WHITE) {
        this.setMark(id, GC_GRAY);
        this.grayStack.push(id);
      }
    }
  }
  collect() {
    this.markPhase = "idle";
    this.grayStack = [];
    this.markRoots();
    while (this.grayStack.length) {
      const id = this.grayStack.pop();
      const o = this.objects.get(id);
      if (!o) continue;
      for (const c of o.ref.children || []) {
        if (this.objects.has(c) && this.getMark(c) === GC_WHITE) {
          this.setMark(c, GC_GRAY);
          this.grayStack.push(c);
        }
      }
      this.setMark(id, GC_BLACK);
    }
    for (const [id, o] of this.objects) {
      if (o.mark === GC_WHITE) {
        this.objects.delete(id);
        this.bytesFreed += o.size;
      } else o.mark = GC_WHITE;
    }
    this.collections++;
    this.markPhase = "idle";
  }
  stats() {
    return {
      objects: this.objects.size,
      bytesAllocated: this.bytesAllocated,
      bytesFreed: this.bytesFreed,
      heapBytes: this.HEAP_BYTES,
      collections: this.collections
    };
  }
  dumpHeap(limit = 30) {
    return [
      "off  | id   | mark  | type    | size",
      "-----+------+-------+---------+------",
      ...[...this.objects].slice(0, limit).map(([id, o]) =>
        `${String(o.offset).padStart(4)} | ${String(id).padStart(4)} | ${["white","gray","black"][o.mark].padEnd(5)} | ${(["","TABLE","CLOSURE","STRING","NATIVE"][o.type]||"?").padEnd(7)} | ${String(o.size).padStart(4)}`
      )
    ].join("\n");
  }
}

function runBytecodeWithGC(source) {
  const res = runBytecode(source);
  const gc = new TriColorGC({ heapSize: 65536 });
  const root = gc.alloc(GC_TYPE.TABLE, { children: [] }, 256);
  gc.roots.add(root);
  for (const v of res.globals.values()) {
    if (v.t === "table") gc.alloc(GC_TYPE.TABLE, { children: [] }, 128);
    else if (v.t === "native") gc.alloc(GC_TYPE.NATIVE, { children: [] }, 48);
  }
  gc.collect();
  return { ...res, gc };
}

/* ========== UI ========== */
const $ = s => document.querySelector(s) || __wsEl();
const esc = s => String(s).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

const SAMPLE = `--!strict
-- Game lobby system
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")

type PlayerData = {
	name: string,
	userId: number,
	coins: number,
	level: number,
	badges: { string }
}

local function createPlayer(name: string, id: number): PlayerData
	return {
		name = name,
		userId = id,
		coins = 1000,
		level = 1,
		badges = {}
	}
end

local function addCoins(player: PlayerData, amount: number)
	player.coins += amount
	if player.coins > 10000 then
		table.insert(player.badges, "Rich")
	end
end

local function getLevelUp(current: number): number
	return current + 1
end

local myPlayer = createPlayer("Player", 12345)
addCoins(myPlayer, 500)
print("Name:", myPlayer.name)
print("Level:", getLevelUp(myPlayer.level))
for i, badge in ipairs(myPlayer.badges) do
	print(\`Badge #{i}: {badge}\`)
end
`;

let last_result = null;
let last_bc = null;

/* FEATURE v8.1-32: normalise the Seed field. Blank / whitespace-only = random (undefined). */
function getSeed() { const v = ($("#seed")?.value || "").trim(); return v || undefined; }

function setStatus(msg, kind) {
  const el = $("#status");
  el.textContent = msg;
  el.className = kind || "";
}

/* ========== v15.4 IMPORTANT-STRING LEAK SCANNER ========== */
/* Static-only analysis. This scanner never evaluates generated Luau and never sends data anywhere. */
const __WS_LEAK_SCAN_MAX_CHARS = 5_000_000;
let __wsLastLeakReport = null;
let __wsLeakScanGeneration = 0;

let __wsLeakLineCacheCode = null, __wsLeakLineCacheStarts = null;
function __wsLeakLineAt(code, offset) {
  code = String(code || "");
  const end = Math.max(0, Math.min(code.length, offset || 0));
  if (code.length < 4096) { let line = 1; for (let i = 0; i < end; i++) if (code.charCodeAt(i) === 10) line++; return line; }
  if (code !== __wsLeakLineCacheCode || !__wsLeakLineCacheStarts) {
    const starts = [0]; for (let i = 0; i < code.length; i++) if (code.charCodeAt(i) === 10) starts.push(i + 1);
    __wsLeakLineCacheCode = code; __wsLeakLineCacheStarts = starts;
  }
  let lo = 0, hi = __wsLeakLineCacheStarts.length;
  while (lo < hi) { const mid = (lo + hi) >>> 1; if (__wsLeakLineCacheStarts[mid] <= end) lo = mid + 1; else hi = mid; }
  return Math.max(1, lo);
}
function __wsLeakClearLineCache() { __wsLeakLineCacheCode = null; __wsLeakLineCacheStarts = null; }
function __wsLeakMask(value) {
  const v = String(value == null ? "" : value).replace(/[\r\n\t]/g, " ");
  if (v.length <= 8) return "••••••";
  return v.slice(0, 3) + "••••••" + v.slice(-4);
}
function __wsLeakPreview(value, severity, type) {
  const v = String(value == null ? "" : value).trim();
  if (severity !== "정보" || /private|token|secret|key|password|bearer|credential|고엔트로피|custom|중요 문자열/i.test(type || "")) return __wsLeakMask(v);
  if (/^https?:\/\//i.test(v)) {
    try {
      const u = new URL(v);
      // Keep useful URL context without exposing opaque path segments that could themselves be credentials.
      const safePath = u.pathname.split("/").map(seg => seg.length >= 12 ? (seg.slice(0, 2) + "••••") : seg).join("/");
      return u.origin + safePath.slice(0, 100) + (safePath.length > 100 ? "…" : "");
    } catch (_) { return v.slice(0, 100).split(/[?#]/)[0]; }
  }
  return v.slice(0, 80) + (v.length > 80 ? "…" : "");
}
function __wsLeakDecodeLua(raw) {
  let out = "";
  for (let i = 0; i < raw.length;) {
    if (raw[i] !== "\\") { out += raw[i++]; continue; }
    const r = decodeLuaEscape(raw, i + 1);
    out += r.ch; i = Math.max(i + 1, r.next);
  }
  return out;
}
function __wsLeakExtractLiterals(code) {
  const literals = [], maskedParts = [];
  const maxLiteralItems = 20000;
  let truncated = false, i = 0, plainStart = 0;
  const n = code.length;
  const pushLiteral = item => { if (literals.length < maxLiteralItems) literals.push(item); else truncated = true; };
  const hide = (start, end) => {
    if (start > plainStart) maskedParts.push(code.slice(plainStart, start));
    maskedParts.push(code.slice(start, end).replace(/[^\n]/g, " "));
    plainStart = end;
  };
  while (i < n) {
    // Comments are skipped so text in comments is not treated as source literals.
    if (code[i] === "-" && code[i + 1] === "-") {
      const lm = /^--\[(=*)\[/.exec(code.slice(i, i + 80));
      let end;
      if (lm) {
        const close = "]" + lm[1] + "]";
        const e = code.indexOf(close, i + lm[0].length);
        end = e < 0 ? n : e + close.length;
      } else {
        const e = code.indexOf("\n", i); end = e < 0 ? n : e;
      }
      hide(i, end); i = end; continue;
    }
    // Long-bracket strings [=[...]=] and [==[...]==].
    if (code[i] === "[") {
      const lm = /^\[(=*)\[/.exec(code.slice(i, i + 80));
      if (lm) {
        const close = "]" + lm[1] + "]";
        const bodyStart = i + lm[0].length;
        const e = code.indexOf(close, bodyStart);
        const end = e < 0 ? n : e + close.length;
        if (e >= 0) {
          let value = code.slice(bodyStart, e); if (value[0] === "\n") value = value.slice(1);
          pushLiteral({ value, start: i, end, line: __wsLeakLineAt(code, i), form: "long-string" });
        }
        hide(i, end); i = end; continue;
      }
    }
    if (code[i] === "'" || code[i] === '"' || code[i] === "`") {
      const start = i, q = code[i++]; let raw = "", closed = false;
      while (i < n) {
        const c = code[i++];
        if (c === q) { closed = true; break; }
        if (c === "\\" && i < n) { raw += c + code[i++]; continue; }
        if (c === "\n" && q !== "`") break;
        raw += c;
      }
      pushLiteral({ value: __wsLeakDecodeLua(raw), start, end: i, line: __wsLeakLineAt(code, start), form: q === "`" ? "interpolated-string" : "quoted-string", closed });
      hide(start, i); continue;
    }
    i++;
  }
  if (plainStart < n) maskedParts.push(code.slice(plainStart));
  return { literals, codeOnly: maskedParts.join(""), truncated };
}
function __wsLeakBase64Decode(s) {
  const v = String(s || "").replace(/-/g, "+").replace(/_/g, "/");
  if (!/^[A-Za-z0-9+/]{20,}={0,2}$/.test(v) || v.length % 4 === 1) return null;
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let bits = 0, buffer = 0, out = "";
  for (const ch of v.replace(/=+$/, "")) {
    const x = alphabet.indexOf(ch); if (x < 0) return null;
    buffer = (buffer << 6) | x; bits += 6;
    if (bits >= 8) { bits -= 8; out += String.fromCharCode((buffer >> bits) & 255); }
  }
  if (!out || !/^[\x09\x0a\x0d\x20-\x7e]+$/.test(out)) return null;
  return out;
}
function __wsLeakBuildStringInventory(code) {
  const parsed = __wsLeakExtractLiterals(code), all = [];
  const maxInventoryItems = 60000;
  let truncated = !!parsed.truncated;
  const add = (value, line, form, start, derived = false) => {
    if (typeof value !== "string" || !value.length) return;
    if (all.length >= maxInventoryItems) { truncated = true; return; }
    all.push({ value, line: line || 1, form, start: start || 0, derived });
  };
  for (const lit of parsed.literals) {
    add(lit.value, lit.line, lit.form, lit.start, false);
    const base64 = __wsLeakBase64Decode(lit.value);
    if (base64) add(base64, lit.line, "base64-decoded", lit.start, true);
    const hex = lit.value.replace(/^0x/i, "");
    if (hex.length >= 16 && hex.length % 2 === 0 && /^[0-9a-f]+$/i.test(hex)) {
      let decoded = "";
      for (let j = 0; j < hex.length; j += 2) decoded += String.fromCharCode(parseInt(hex.slice(j, j + 2), 16));
      if (/^[\x09\x0a\x0d\x20-\x7e]+$/.test(decoded)) add(decoded, lit.line, "hex-decoded", lit.start, true);
    }
  }
  // Static string concatenation: only adjacent literal .. literal chains are reconstructed.
  for (let i = 0; i < parsed.literals.length; i++) {
    let value = parsed.literals[i].value, end = parsed.literals[i].end, count = 1;
    for (let j = i + 1; j < parsed.literals.length && count < 12; j++) {
      const between = code.slice(end, parsed.literals[j].start);
      if (!/^\s*\.\.\s*$/.test(between)) break;
      value += parsed.literals[j].value; end = parsed.literals[j].end; count++;
      add(value, parsed.literals[i].line, "literal-concat", parsed.literals[i].start, true);
    }
  }
  // Only evaluate string.char calls made entirely of numeric literal arguments; no code is executed.
  const charRe = /\bstring\s*\.\s*char\s*\(([^)]{1,3000})\)/gi;
  let cm;
  while ((cm = charRe.exec(parsed.codeOnly))) {
    const args = cm[1].split(",").map(x => x.trim());
    if (!args.length || args.length > 2048 || !args.every(x => /^(?:0[xX][0-9a-fA-F]+|0[bB][01]+|\d{1,3})$/.test(x))) continue;
    const vals = args.map(x => Number(/^0x/i.test(x) ? parseInt(x.slice(2), 16) : /^0b/i.test(x) ? parseInt(x.slice(2), 2) : x));
    if (vals.some(x => !Number.isFinite(x) || x < 0 || x > 255)) continue;
    let decoded = ""; for (const v of vals) decoded += String.fromCharCode(v);
    if (decoded.length >= 4) add(decoded, __wsLeakLineAt(code, cm.index), "string.char-decoded", cm.index, true);
  }
  return { literals: parsed.literals, strings: all, codeOnly: parsed.codeOnly, truncated };
}
function __wsLeakEntropy(s) {
  if (!s || s.length < 28 || s.length > 180 || !/[a-z]/.test(s) || !/[A-Z]/.test(s) || !/\d/.test(s) || !/^[A-Za-z0-9_+\/=.-]+$/.test(s)) return 0;
  const freq = new Map(); for (const c of s) freq.set(c, (freq.get(c) || 0) + 1);
  let h = 0; for (const n of freq.values()) { const p = n / s.length; h -= p * Math.log2(p); }
  return h;
}
function __wsLeakPatternDefinitions() {
  return [
    { type: "일반 API 키 접두사", severity: "긴급", re: /\b(?:sk-(?:live|test)-[A-Za-z0-9_-]{12,}|sk-[A-Za-z0-9_-]{24,}|AIza[0-9A-Za-z_-]{30,}|gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[0-9A-Z]{16}|ASIA[0-9A-Z]{16}|glpat-[A-Za-z0-9_-]{20,}|xox[baprs]-[A-Za-z0-9-]{10,}|npm_[A-Za-z0-9]{30,})/g },
    { type: "Discord 웹훅 토큰", severity: "긴급", re: /https?:\/\/(?:canary\.|ptb\.)?discord(?:app)?\.com\/api\/webhooks\/\d{6,}\/([A-Za-z0-9._-]{20,})/gi, group: 1 },
    { type: "PEM 개인키", severity: "긴급", re: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----[\s\S]{20,}?-----END (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g },
    { type: "Bearer 인증정보", severity: "높음", re: /(?:authorization\s*[:=]?\s*["']?\s*bearer\s+|\bbearer\s+)([A-Za-z0-9._~+\/-]{12,}={0,2})/gi, group: 1 },
    { type: "JWT 형태 토큰", severity: "높음", re: /\b(eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,})\b/g, group: 1 },
    { type: "민감한 이름의 설정값", severity: "높음", re: /(?:api[_-]?key|access[_-]?token|refresh[_-]?token|client[_-]?secret|password|passwd|secret|private[_-]?key|auth[_-]?token)\s*["']?\s*[:=]\s*["']?([A-Za-z0-9_./+=-]{8,})/gi, group: 1, downgradePlaceholder: true }
  ];
}
function __wsLeakIsPlaceholder(v) {
  return /^(?:your[_ -]?(?:api[_ -]?)?key|replace[_ -]?me|changeme|placeholder|example|dummy|test(?:ing)?|none|null|undefined|<[^>]+>|\$\{[^}]+\})$/i.test(String(v).trim());
}
function __wsLeakDetectInText(text, target, inventory, addFinding) {
  const patterns = __wsLeakPatternDefinitions();
  for (const def of patterns) {
    def.re.lastIndex = 0; let m, guard = 0;
    while ((m = def.re.exec(text)) && guard++ < 1000) {
      const value = m[def.group || 0];
      if (!value || __wsLeakIsPlaceholder(value)) continue;
      let severity = def.severity;
      if (def.downgradePlaceholder && value.length < 16 && !/[A-Z0-9_+/=-]{12,}/i.test(value)) severity = "주의";
      const at = m.index + Math.max(0, m[0].lastIndexOf(value));
      addFinding({ type: def.type, severity, target, line: __wsLeakLineAt(text, at), value, confirmed: true,
        evidence: "코드에서 알려진 자격 증명 패턴과 일치하는 문자열을 확인했습니다.",
        recommendation: "실제 비밀정보라면 즉시 폐기·회전하고, 코드에서 제거한 뒤 런타임의 안전한 비밀 저장소를 사용하세요.", sourceStart: at });
      if (!def.re.global) break;
    }
  }
  // URL discovery is informational unless the host/path indicates private infrastructure or a management endpoint.
  const urlRe = /https?:\/\/[^\s"'<>`]+/gi; let um, uguard = 0;
  while ((um = urlRe.exec(text)) && uguard++ < 500) {
    const url = um[0].replace(/[),.;\]}]+$/, "");
    let severity = "정보";
    if (/(?:localhost|127\.0\.0\.1|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|\.local\b|\.internal\b|\/admin(?:\/|\?|$)|\/internal(?:\/|\?|$)|\/private(?:\/|\?|$)|\/manage(?:ment)?(?:\/|\?|$))/i.test(url)) severity = "주의";
    addFinding({ type: severity === "정보" ? "URL/도메인 식별자" : "내부 URL 또는 관리 경로", severity, target, line: __wsLeakLineAt(text, um.index), value: url,
      confirmed: severity !== "정보", evidence: severity === "정보" ? "URL이 발견됐습니다. 공개 정보일 수 있으므로 자체적으로 비밀이라고 단정하지 않습니다." : "로컬·사설 호스트 또는 관리용 경로 패턴이 확인됐습니다.",
      recommendation: severity === "정보" ? "공개 주소인지 확인하세요. 도메인 자체는 비밀정보가 아닐 수 있습니다." : "내부 주소와 관리 경로를 배포 코드에 포함해야 하는지 확인하고, 불필요하면 환경 설정으로 분리하세요.", sourceStart: um.index });
  }
  // Generic entropy is only a weak heuristic and never treated as a confirmed leak by itself.
  if (inventory) {
    for (const item of inventory.strings) {
      const h = __wsLeakEntropy(item.value);
      if (h >= 4.1) addFinding({ type: "고엔트로피 문자열(추정)", severity: "주의", target, line: item.line, value: item.value, confirmed: false,
        evidence: "길이와 문자 분포가 고엔트로피 패턴과 비슷합니다. 난독화 데이터·식별자일 수도 있어 비밀정보로 확정하지 않았습니다.",
        recommendation: "원본 코드에서 생성 목적을 확인하세요. 실제 키라면 코드에 하드코딩하지 말고 키를 회전하세요.", sourceStart: item.start });
    }
  }
}
function __wsPerformLeakScan(source, output, opts = {}, customValues = [], meta = {}) {
  const started = performance.now();
  source = String(source || ""); output = String(output || "");
  const result = { state: "명확한 노출 미발견", findings: [], counts: { 긴급: 0, 높음: 0, 주의: 0, 정보: 0 }, incomplete: false, incompleteReasons: [], scannedChars: { source: source.length, output: output.length }, elapsedMs: 0, sourceCandidateCount: 0 };
  if (source.length > __WS_LEAK_SCAN_MAX_CHARS || output.length > __WS_LEAK_SCAN_MAX_CHARS) {
    result.incomplete = true; result.incompleteReasons.push("입력 또는 출력이 5,000,000자 검사 한도를 넘었습니다. 대용량 입력의 일부 검사 항목을 건너뛰었습니다.");
    result.state = "검사 불완전"; result.elapsedMs = performance.now() - started; __wsLeakClearLineCache(); return result;
  }
  const seen = new Set();
  const addFinding = f => {
    const preview = __wsLeakPreview(f.value, f.severity, f.type);
    const key = [f.type, f.severity, f.target, f.line, preview].join("|");
    if (seen.has(key)) return; seen.add(key);
    result.findings.push({ severity: f.severity, type: f.type, target: f.target, line: f.line || 1, preview,
      evidence: f.evidence, recommendation: f.recommendation, confirmed: !!f.confirmed, sourceStart: Number.isFinite(f.sourceStart) ? f.sourceStart : 0 });
  };
  const sourceInv = __wsLeakBuildStringInventory(source), outputInv = __wsLeakBuildStringInventory(output);
  if (sourceInv.truncated) { result.incomplete = true; result.incompleteReasons.push("원본의 문자열 리터럴 수가 정적 분석 상한(20,000개)을 넘었습니다. 전체 원본 텍스트의 알려진 자격 증명 패턴은 검사했지만 모든 리터럴 복원은 수행하지 못했습니다."); }
  if (outputInv.truncated) { result.incomplete = true; result.incompleteReasons.push("출력의 문자열 복원 항목 수가 정적 분석 상한(60,000개)을 넘었습니다. 일부 인코딩/연결 리터럴은 분석하지 못했습니다."); }
  __wsLeakDetectInText(source, "source", sourceInv, f => {
    // Source-side credentials are candidates to compare, not output leaks by themselves.
    // Keep URL classifications visible, while the sourceCandidates comparison below determines unresolved secrets.
    if (f.type === "URL/도메인 식별자" || f.type === "내부 URL 또는 관리 경로" || f.type === "고엔트로피 문자열(추정)") addFinding({ ...f, confirmed: false });
  });
  // Raw output was scanned above; only scan derived forms separately to avoid repeatedly
  // regex-scanning every ordinary literal in large files.
  for (const item of outputInv.strings) {
    if (!item.derived) continue;
    __wsLeakDetectInText(item.value, "output", null, f => addFinding({ ...f, line: item.line, sourceStart: item.start }));
  }
  __wsLeakDetectInText(output, "output", outputInv, addFinding);
  const sourceCandidates = [];
  const sourceCandidateKeys = new Set();
  const collectCandidate = (value, severity, type, line, start) => {
    if (!value || value.length < 8) return;
    const key = value + "|" + type;
    if (sourceCandidateKeys.has(key)) return;
    sourceCandidateKeys.add(key);
    sourceCandidates.push({ key, value, severity, type, line, start });
  };
  for (const def of __wsLeakPatternDefinitions()) {
    def.re.lastIndex = 0; let m, guard = 0;
    while ((m = def.re.exec(source)) && guard++ < 500) {
      const value = m[def.group || 0]; if (!value || __wsLeakIsPlaceholder(value)) continue;
      collectCandidate(value, def.severity, def.type, __wsLeakLineAt(source, m.index), m.index);
      if (!def.re.global) break;
    }
    def.re.lastIndex = 0;
    for (const item of sourceInv.strings) {
      def.re.lastIndex = 0; const mm = def.re.exec(item.value);
      if (mm) collectCandidate(mm[def.group || 0], def.severity, def.type, item.line, item.start);
    }
  }
  for (const item of sourceInv.strings) {
    if (__wsLeakEntropy(item.value) >= 4.1) collectCandidate(item.value, "주의", "고엔트로피 문자열(추정)", item.line, item.start);
  }
  const sourceUrlRe = /https?:\/\/[^\s"'<>`]+/gi; let sourceUrlMatch;
  while ((sourceUrlMatch = sourceUrlRe.exec(source))) {
    const value = sourceUrlMatch[0].replace(/[),.;\]}]+$/, "");
    if (/(?:localhost|127\.0\.0\.1|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|\.local\b|\.internal\b|\/admin(?:\/|\?|$)|\/internal(?:\/|\?|$)|\/private(?:\/|\?|$)|\/manage(?:ment)?(?:\/|\?|$))/i.test(value)) {
      collectCandidate(value, "주의", "내부 URL 또는 관리 경로", __wsLeakLineAt(source, sourceUrlMatch.index), sourceUrlMatch.index);
    }
  }
  const customUnique = Array.from(new Set((customValues || []).map(x => String(x).trim()).filter(Boolean)));
  const customs = customUnique.slice(0, 200);
  for (const value of customs) {
    const inSource = source.includes(value);
    const inRawOutput = output.includes(value);
    let derived = null;
    if (!inRawOutput) derived = outputInv.strings.find(x => x.value.includes(value));
    if (inRawOutput || derived) {
      addFinding({ type: "사용자 지정 중요 문자열", severity: "주의", target: "output", line: inRawOutput ? __wsLeakLineAt(output, output.indexOf(value)) : derived.line, value,
        confirmed: true, evidence: "사용자가 지정한 중요 문자열이 출력 코드 또는 정적으로 복원한 문자열 데이터에서 확인됐습니다.",
        recommendation: "해당 값이 배포 코드에 있어야 하는지 확인하고, 비밀정보라면 삭제·회전한 뒤 외부 비밀 저장소로 옮기세요.", sourceStart: inRawOutput ? output.indexOf(value) : derived.start });
    } else if (inSource) {
      collectCandidate(value, "주의", "사용자 지정 중요 문자열", __wsLeakLineAt(source, source.indexOf(value)), source.indexOf(value));
    }
  }
  const transformedStringLayer = (opts.str !== false || opts.strictStrings !== false || opts.runtimeXor !== false) && /(?:bit32\s*\.\s*bxor|string\s*\.\s*char|tonumber\s*\(|table\.concat|__KC\s*\[|__vmenv|__WSV|buffer\.fromstring)/i.test(output);
  const vmLayer = !!opts.vm && /(?:VM direct-emission|__vmenv|__WSV|buffer\.fromstring|__WSAT_)/i.test(output);
  if (transformedStringLayer) {
    result.incomplete = true;
    result.incompleteReasons.push("출력에서 문자열/XOR/상수 디코딩 계층을 식별했습니다. 이 검사는 제한된 정적 표현만 복원하며 일반적인 XOR·산술 디코더를 역실행하지 않습니다.");
  }
  if (vmLayer) {
    result.incomplete = true;
    result.incompleteReasons.push("VM/상수 풀/런타임 페이로드가 식별됐습니다. VM 바이트코드와 런타임에서만 만들어지는 문자열은 실행하지 않았으므로 완전히 복원·검사할 수 없습니다.");
  }
  if (meta && meta.buildFailed) {
    result.incomplete = true;
    result.incompleteReasons.push("난독화 빌드 실패로 최종 출력 검사를 완료할 수 없습니다. 기존 빌드 오류 상태를 확인하세요.");
  }
  if (meta && meta.vmFallback) {
    result.incomplete = true;
    result.incompleteReasons.push("VM 생성 실패 후 Source 모드 결과가 생성됐습니다. 최종 출력은 정적으로 검사했지만 요청한 VM 프로필이 적용되지 않았으므로 난독화 상태 경고도 함께 검토하세요.");
  }
  for (const candidate of sourceCandidates) {
    result.sourceCandidateCount++;
    const foundStatic = output.includes(candidate.value) || outputInv.strings.some(x => x.value.includes(candidate.value));
    const confirmedOutput = result.findings.some(f => f.target === "output" && f.confirmed && f.preview === __wsLeakPreview(candidate.value, f.severity, f.type));
    // Entropy alone is never promoted to a confirmed secret, even if the same identifier is present in both files.
    if (candidate.type === "고엔트로피 문자열(추정)") {
      if (!foundStatic) {
        result.incomplete = true;
        result.findings.push({ severity: candidate.severity, type: "원본 고엔트로피 후보 — 출력에서 직접 복원 확인 안 됨", target: "source", line: candidate.line || 1,
          preview: __wsLeakPreview(candidate.value, candidate.severity, candidate.type),
          evidence: "고엔트로피 휴리스틱 후보는 실제 비밀정보인지 정적으로 구분할 수 없습니다. 평문 비교로 확인되지 않았지만, 이것만으로 안전하다고 판단하지 않습니다.",
          recommendation: "문자열의 용도를 직접 확인하세요. 무작위처럼 보이는 상수나 난독화 데이터는 API 키로 단정하지 않습니다.", confirmed: false, sourceStart: candidate.start || 0 });
      }
      continue;
    }
    if (foundStatic && !confirmedOutput) {
      result.findings.push({ severity: candidate.severity, type: "원본 중요 문자열이 출력에서 정적으로 확인됨", target: "output", line: (outputInv.strings.find(x => x.value.includes(candidate.value)) || {}).line || __wsLeakLineAt(output, Math.max(0, output.indexOf(candidate.value))),
        preview: __wsLeakPreview(candidate.value, candidate.severity, candidate.type),
        evidence: "원본의 중요 문자열 후보와 같은 값이 최종 출력 또는 지원되는 정적 복원 결과에서 확인됐습니다.",
        recommendation: "이 값이 비밀정보라면 배포 코드에서 제거하고 즉시 폐기·회전하세요. 비밀정보는 클라이언트 코드에 포함하지 마세요.", confirmed: true, sourceStart: output.indexOf(candidate.value) >= 0 ? output.indexOf(candidate.value) : 0 });
    } else if (!foundStatic && !confirmedOutput) {
      result.incomplete = true;
      result.findings.push({ severity: candidate.severity, type: "원본 중요 문자열 후보 — 출력에서 직접 복원 확인 안 됨", target: "source", line: candidate.line || 1,
        preview: __wsLeakPreview(candidate.value, candidate.severity, candidate.type),
        evidence: "원본에서 자격 증명 후보가 확인됐지만, 출력의 평문 또는 지원되는 정적 복원 경로에서 같은 값을 찾지 못했습니다. 이것만으로 안전하다고 판정하지 않습니다.",
        recommendation: "값이 실제 비밀인지 검토하고, 출력에 인코딩된 형태로 포함됐을 가능성이 있으면 배포 전에 별도 검토하거나 키를 회전하세요.", confirmed: false, sourceStart: candidate.start || 0 });
    }
  }
  if (customUnique.length > 200) { result.incomplete = true; result.incompleteReasons.push("사용자 지정 문자열 목록은 안전성을 위해 최대 200개까지만 검사했습니다."); }
  if (result.findings.some(f => f.target === "output" && f.type === "고엔트로피 문자열(추정)")) {
    result.incomplete = true;
    result.incompleteReasons.push("출력의 고엔트로피 문자열은 비밀정보와 난독화 데이터가 정적으로 구분되지 않아 검토 대상으로 남겼습니다. 이 휴리스틱만으로 위험 항목으로 확정하지 않습니다.");
  }
  for (const f of result.findings) result.counts[f.severity] = (result.counts[f.severity] || 0) + 1;
  const hasConfirmedRisk = result.findings.some(f => f.confirmed && f.severity !== "정보");
  result.state = hasConfirmedRisk ? "위험 항목 발견" : result.incomplete ? "검사 불완전" : "명확한 노출 미발견";
  result.elapsedMs = performance.now() - started;
  __wsLeakClearLineCache();
  return result;
}
function __wsLeakSummaryText(result) {
  return "상태: " + result.state + "\n" +
    "위험도별 발견: 긴급 " + result.counts.긴급 + " · 높음 " + result.counts.높음 + " · 주의 " + result.counts.주의 + " · 정보 " + result.counts.정보 + "\n" +
    "원본 중요 문자열 후보: " + result.sourceCandidateCount + " · 검사 항목: " + result.findings.length + " · 소요 " + result.elapsedMs.toFixed(1) + " ms\n" +
    (result.incompleteReasons.length ? "검사 한계:\n- " + result.incompleteReasons.join("\n- ") + "\n" : "") +
    (result.state === "명확한 노출 미발견" ? "검사 가능한 정적 범위에서 뚜렷한 노출을 찾지 못했습니다. 완전한 보안 보장은 아닙니다." : result.state === "위험 항목 발견" ? "확인된 후보가 있습니다. 배포 전 항목을 검토하고 실제 비밀정보는 폐기·회전하세요." : "정적 분석만으로 안전성을 충분히 확인하지 못했습니다. 결과를 안전 판정으로 취급하지 마세요.");
}
function __wsRenderLeakReport(result) {
  const summary = document.getElementById("leak_scan_summary"), list = document.getElementById("leak_scan_results");
  if (!summary || !list) return;
  summary.textContent = __wsLeakSummaryText(result);
  summary.className = "leak-summary " + (result.state === "위험 항목 발견" ? "risk" : result.state === "검사 불완전" ? "incomplete" : "clear");
  list.replaceChildren();
  if (!result.findings.length) { const empty = document.createElement("div"); empty.className = "leak-empty"; empty.textContent = "표시할 탐지 항목이 없습니다. 검사 범위의 한계는 위 상태를 확인하세요."; list.appendChild(empty); return; }
  for (const f of result.findings.slice(0, 500)) {
    const btn = document.createElement("button"); btn.type = "button"; btn.className = "leak-item";
    const head = document.createElement("div"); head.className = "leak-head";
    const sev = document.createElement("span"); sev.className = "leak-sev " + f.severity; sev.textContent = f.severity;
    const title = document.createElement("span"); title.textContent = f.type;
    const where = document.createElement("span"); where.className = "leak-muted"; where.textContent = (f.target === "output" ? "출력" : "원본") + " · L" + f.line;
    head.append(sev, title, where);
    const preview = document.createElement("div"); preview.textContent = "미리보기: " + f.preview;
    const evidence = document.createElement("div"); evidence.className = "leak-muted"; evidence.textContent = "근거: " + f.evidence;
    const advice = document.createElement("div"); advice.className = "leak-muted"; advice.textContent = "권장: " + f.recommendation;
    btn.append(head, preview, evidence, advice);
    btn.addEventListener("click", () => {
      const area = document.getElementById(f.target === "output" ? "out" : "src");
      if (!area) return;
      const value = area.value; const wantedLine = Math.max(1, f.line || 1); let offset = 0;
      for (let line = 1; line < wantedLine && offset < value.length; line++) {
        const nl = value.indexOf("\n", offset); if (nl < 0) break; offset = nl + 1;
      }
      const end = value.indexOf("\n", offset); const lineEnd = end < 0 ? value.length : end;
      area.focus(); area.setSelectionRange(offset, lineEnd);
      const gutter = document.getElementById(f.target === "output" ? "out_lines" : "src_lines");
      if (gutter) gutter.scrollTop = area.scrollTop;
    });
    list.appendChild(btn);
  }
  if (result.findings.length > 500) { const note = document.createElement("div"); note.className = "leak-empty"; note.textContent = "UI에는 처음 500개만 표시했습니다. 전체 집계는 보고서에 포함됩니다."; list.appendChild(note); }
}
function __wsRunLeakScan(source, output, opts = {}, meta = {}, force = false) {
  const enabled = document.getElementById("leak_scan_enabled");
  if (!force && enabled && !enabled.checked) {
    const panel = document.getElementById("leak_scan_summary");
    if (panel) { panel.className = "leak-summary incomplete"; panel.textContent = "자동 검사가 꺼져 있습니다. 현재 출력 검사 버튼을 누르면 1회 검사할 수 있습니다."; }
    return null;
  }
  const generation = ++__wsLeakScanGeneration;
  const summary = document.getElementById("leak_scan_summary");
  if (summary) { summary.className = "leak-summary"; summary.textContent = "원본과 출력의 문자열을 정적으로 검사하는 중…"; }
  // Yield to the browser before scanning, so output/editor updates can paint first.
  setTimeout(() => {
    if (generation !== __wsLeakScanGeneration) return;
    try {
      const custom = (document.getElementById("leak_custom_patterns")?.value || "").split(/\r?\n/).map(x => x.trim()).filter(Boolean);
      const result = __wsPerformLeakScan(source, output, opts || {}, custom, meta || {});
      __wsLastLeakReport = { result, generatedAt: new Date().toISOString() };
      __wsRenderLeakReport(result);
    } catch (e) {
      __wsLeakClearLineCache();
      const failed = { state: "검사 불완전", findings: [], counts: { 긴급: 0, 높음: 0, 주의: 0, 정보: 0 }, incomplete: true,
        incompleteReasons: ["검사기 내부 오류: " + String(e && e.message || e).slice(0, 220)], scannedChars: { source: String(source || "").length, output: String(output || "").length }, elapsedMs: 0, sourceCandidateCount: 0 };
      __wsLastLeakReport = { result: failed, generatedAt: new Date().toISOString() };
      __wsRenderLeakReport(failed);
    }
  }, 0);
  return true;
}
function __wsRunCurrentLeakScan() {
  const src = document.getElementById("src")?.value || "", out = document.getElementById("out")?.value || "";
  if (!out) {
    const failed = { state: "검사 불완전", findings: [], counts: { 긴급: 0, 높음: 0, 주의: 0, 정보: 0 }, incomplete: true,
      incompleteReasons: ["출력 코드가 없습니다. 먼저 난독화를 성공시키거나 검사할 출력 코드를 준비하세요."], scannedChars: { source: src.length, output: 0 }, elapsedMs: 0, sourceCandidateCount: 0 };
    __wsLastLeakReport = { result: failed, generatedAt: new Date().toISOString() }; __wsRenderLeakReport(failed); return;
  }
  const opts = typeof __wsSettingsSnapshot === "function" ? __wsSettingsSnapshot() : {};
  __wsRunLeakScan(src, out, opts, { buildFailed: false }, true);
}
function __wsDownloadLeakReport() {
  if (!__wsLastLeakReport) return setStatus("Download a leak-scan report after running the scanner.", "warn");
  const r = __wsLastLeakReport.result;
  // Deliberately export only masked previews and metadata; never export source/output or raw matches.
  const safe = { tool: "WSFuscate v15.4 LeakScan", generatedAt: __wsLastLeakReport.generatedAt, status: r.state,
    counts: r.counts, sourceCandidateCount: r.sourceCandidateCount, scannedChars: r.scannedChars, elapsedMs: r.elapsedMs,
    incompleteReasons: r.incompleteReasons,
    findings: r.findings.map(f => ({ severity: f.severity, type: f.type, target: f.target, line: f.line, maskedPreview: f.preview,
      evidence: f.evidence, recommendation: f.recommendation, confirmed: f.confirmed })),
    disclaimer: "Static analysis only. This report contains no source code, output code, or unmasked candidate values. No complete security guarantee." };
  __wsDownloadText("wsfuscate-leak-scan-report.json", JSON.stringify(safe, null, 2), "application/json");
}
function __wsRunLeakScannerTests() {
  const log = document.getElementById("leak_scan_test_log"); if (!log) return;
  const lines = []; let pass = 0, fail = 0;
  const check = (name, ok, detail = "") => { lines.push((ok ? "PASS " : "FAIL ") + name + (detail ? " — " + detail : "")); ok ? pass++ : fail++; };
  const fake = "ghp_abcdefghijklmnopqrstuvwxyz12345678";
  const optsOff = { str: false, strictStrings: false, runtimeXor: false, vm: false };
  try {
    let r = __wsPerformLeakScan("local x = 1", 'local token = "' + fake + '"', optsOff, []);
    check("평문 가짜 API 토큰 노출 감지", r.state === "위험 항목 발견" && r.findings.some(f => f.type === "일반 API 키 접두사" && f.target === "output" && f.confirmed));
    r = __wsPerformLeakScan('local key = "' + fake + '"', "local x = 1", optsOff, []);
    check("원본에만 있는 비밀 후보는 위험 단정 대신 검사 불완전", r.state === "검사 불완전" && !r.findings.some(f => f.target === "source" && f.confirmed));
    const b64 = (typeof btoa === "function" ? btoa(fake) : "");
    r = __wsPerformLeakScan("", 'local encoded = "' + b64 + '"', { str: true, strictStrings: true, runtimeXor: true, vm: false }, []);
    check("Base64 리터럴 정적 복원 후 감지", !!b64 && r.findings.some(f => f.type === "일반 API 키 접두사" && f.target === "output"));
    const chars = Array.from(fake).map(c => c.charCodeAt(0)).join(",");
    r = __wsPerformLeakScan("", "local encoded = string.char(" + chars + ")", { ...optsOff }, []);
    check("string.char 숫자 인자 정적 복원 후 감지", r.findings.some(f => f.type === "일반 API 키 접두사" && f.target === "output"));
    const splitAt = 15;
    r = __wsPerformLeakScan("", 'local s = "' + fake.slice(0, splitAt) + '" .. "' + fake.slice(splitAt) + '"', optsOff, []);
    check("연결된 문자열 리터럴 정적 재조합 후 감지", r.findings.some(f => f.type === "일반 API 키 접두사" && f.target === "output"));
    const hex = Array.from(fake).map(c => c.charCodeAt(0).toString(16).padStart(2, "0")).join("");
    r = __wsPerformLeakScan("", 'local encoded = "' + hex + '"', optsOff, []);
    check("16진수 문자열 리터럴 정적 복원 후 감지", r.findings.some(f => f.type === "일반 API 키 접두사" && f.target === "output"));
    check("탐지 결과·내보낼 자료에 가짜 토큰 원문 미포함", !JSON.stringify(r).includes(fake));
    r = __wsPerformLeakScan("local ev = ReplicatedStorage.RemoteEvent\nlocal u = 'https://create.roblox.com/docs/reference/engine'", "local ev = ReplicatedStorage.RemoteEvent; local u='https://create.roblox.com/docs/reference/engine'", optsOff, []);
    check("공개 문서 URL과 RemoteEvent는 긴급/높음 오탐 아님", r.counts.긴급 === 0 && r.counts.높음 === 0);
    const entropySample = "Aa0Bb1Cc2Dd3Ee4Ff5Gg6Hh7Ii8Jj9";
    r = __wsPerformLeakScan('local identifier = "' + entropySample + '"', 'local identifier = "' + entropySample + '"', optsOff, []);
    check("고엔트로피 문자열만으로 확인된 비밀이라고 단정하지 않음", r.state === "검사 불완전" && !r.findings.some(f => f.confirmed && /엔트로피/.test(f.type)));
    r = __wsPerformLeakScan("", 'local marker = "MY_PRIVATE_BUILD_MARKER_4815"', optsOff, ["MY_PRIVATE_BUILD_MARKER_4815"]);
    check("사용자 지정 중요 문자열 감지", r.findings.some(f => f.type === "사용자 지정 중요 문자열" && f.target === "output" && f.confirmed));
    r = __wsPerformLeakScan("", 'local __WSV = {}; local s=bit32.bxor(1,2); local b=buffer.fromstring("enc")', { str: true, strictStrings: true, runtimeXor: true, vm: true }, []);
    check("VM/XOR 런타임 레이어는 검사 불완전", r.state === "검사 불완전" && r.incompleteReasons.length > 0);
    r = __wsPerformLeakScan("", "", optsOff, []);
    check("빈 입력은 예외 없이 처리", r.state === "명확한 노출 미발견");
    r = __wsPerformLeakScan("local x = 'unterminated\nif then ???", "local y='also malformed", optsOff, []);
    check("잘못된 Luau라도 코드를 실행하지 않고 정적 검사", !!r && Array.isArray(r.findings));
    r = __wsPerformLeakScan("--" + "x".repeat(120000), "local x = 1", optsOff, []);
    check("중간 크기 입력에서 대용량 검사 경로 동작", r.scannedChars.source === 120002 && r.state !== "검사 불완전");
    const manyLiterals = 'local x = "a"\n'.repeat(20005);
    r = __wsPerformLeakScan(manyLiterals, manyLiterals, optsOff, []);
    check("리터럴 상한을 넘으면 검사 불완전으로 보고", r.state === "검사 불완전" && r.incompleteReasons.some(x => x.includes("20,000개")));
    r = __wsPerformLeakScan("x".repeat(__WS_LEAK_SCAN_MAX_CHARS + 1), "", optsOff, []);
    check("문자 수 한도 초과 입력은 즉시 검사 불완전 처리", r.state === "검사 불완전" && r.incompleteReasons.some(x => x.includes("5,000,000")));
    r = __wsPerformLeakScan("", "local y=1", optsOff, [], { buildFailed: true });
    check("VM/난독화 빌드 실패 정보는 안전 판정 대신 불완전 처리", r.state === "검사 불완전");
    r = __wsPerformLeakScan("", "local y=1", optsOff, [], { vmFallback: "fixture failure" });
    check("VM fallback은 검사 보고서에 불완전으로 표시", r.state === "검사 불완전" && r.incompleteReasons.some(x => x.includes("VM 생성 실패")));
    const pathToken = "https://example.test/private/ABCDEF1234567890TOKENVALUE";
    r = __wsPerformLeakScan("", 'local url = "' + pathToken + '"', optsOff, []);
    check("정보 URL의 긴 경로 세그먼트는 보고서 미리보기에서 마스킹", !r.findings.some(f => f.preview.includes("ABCDEF1234567890TOKENVALUE")));
    // Scanner is called after successful obfuscation behind an isolated try/catch; this source-level invariant
    // helps ensure diagnostic failure cannot become a build failure.
    check("난독화 흐름에 검사기 호출이 분리됨", String(analyze).includes("__wsRunLeakScan") && String(analyze).includes("catch (e)"));
    const markerFixture = "-- payload opcode\nlocal op=1;local opv=op;local key=2;local opcoded=key;local payload=opcoded;local s='payload op key'";
    const markerScrubbed = __wsScrubVmMarkerIdentifiers(markerFixture);
    check("VM 내부 식별자 마커를 문자열 바이트를 보존하며 변경", markerScrubbed.includes("local _q7=1;local _r4=_q7;local _m8=2;local _t3=_m8;local _x8=_t3") && markerScrubbed.includes("'payload op key'"));
  } catch (e) { check("누출 검사 자체 테스트 실행 예외", false, String(e && e.message || e)); }
  lines.push("", "누출 검사 테스트 결과: " + pass + " 통과 / " + fail + " 실패", "이 결과는 브라우저 내 정적 분석 테스트이며 Roblox Luau 런타임 실행 검증이 아닙니다.");
  log.hidden = false; log.textContent = lines.join("\n");
  setStatus("Leak scanner tests: " + pass + " passed, " + fail + " failed.", fail ? "err" : "ok");
}
document.getElementById("leak_scan_now")?.addEventListener("click", __wsRunCurrentLeakScan);
document.getElementById("leak_scan_tests")?.addEventListener("click", __wsRunLeakScannerTests);
document.getElementById("leak_scan_download")?.addEventListener("click", __wsDownloadLeakReport);
document.getElementById("leak_scan_enabled")?.addEventListener("change", e => {
  if (!e.target.checked) {
    const summary = document.getElementById("leak_scan_summary");
    if (summary) { summary.className = "leak-summary incomplete"; summary.textContent = "자동 검사가 꺼져 있습니다. 수동 검사 버튼으로 1회 검사를 할 수 있습니다."; }
  }
});

/* Inline macro parser. Profile-specific literal passes run before the whole-source transforms. */
function __wsValidateInlineMacros(source) {
  const lines = String(source).split(/\r?\n/);
  const regions = [];
  let active = null;
  const errors = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const begin = line.match(/^\s*--\s*WSF:BEGIN\s+profile=(light|balanced|hardened|runtime_lock|anti_hook|anti_tamper)\s*$/i);
    const end = /^\s*--\s*WSF:END\s*$/i.test(line);
    if (begin) {
      if (active) errors.push(`Line ${i + 1}: nested BEGIN; region opened at line ${active.line} is still active.`);
      else active = { profile: begin[1].toLowerCase(), line: i + 1 };
    } else if (/^\s*--\s*WSF:BEGIN\b/i.test(line)) {
      errors.push(`Line ${i + 1}: unsupported macro profile. Use profile=light, balanced, hardened, runtime_lock, anti_hook, or anti_tamper. runtime_lock and anti profiles perform bounded runtime-contract checks, not universal hook/injector detection or self-destruction.`);
    } else if (end) {
      if (!active) errors.push(`Line ${i + 1}: END without a matching BEGIN.`);
      else { regions.push({ profile: active.profile, startLine: active.line, endLine: i + 1 }); active = null; }
    }
  }
  if (active) errors.push(`Line ${active.line}: BEGIN has no matching END.`);
  return { regions, errors };
}
function __wsShowMacroReport() {
  const report = document.getElementById("macro_report");
  if (!report) return;
  const result = __wsValidateInlineMacros(document.getElementById("src")?.value || "");
  report.hidden = false;
  report.textContent = result.errors.length
    ? "Inline macro validation failed:\n- " + result.errors.join("\n- ")
    : "Macro syntax valid. Regions: " + result.regions.length + (result.regions.length ? "\n" + result.regions.map((r, i) => `${i + 1}. ${r.profile}: lines ${r.startLine}–${r.endLine}`).join("\n") : "") + "\nSource mode: region-local literal masking applies. runtime_lock checks the Luau runtime contract at the marked location; anti_hook checks selected primitive behavior; anti_tamper checks selected runtime primitives and, in VM mode, forces payload integrity checks. In VM mode these profiles request bounded local diagnostics across the whole VM because lexical regions cannot safely become separate VMs. These checks cannot universally detect specific RemoteEvent hooks, native injectors, or memory dumps; failures are explicit and non-destructive.";
}
document.getElementById("check_macros")?.addEventListener("click", __wsShowMacroReport);

/* Size target policy: adds inert Luau comments only when generated output is below the requested size floor.
   This changes file size, not semantic behavior or actual protection strength. */
function __wsTargetSizeMultiplier(sourceBytes) {
  const KB = 1024;
  if (sourceBytes < 10 * KB) return 5.0;
  if (sourceBytes < 100 * KB) return 3.0;
  if (sourceBytes < 300 * KB) return 2.0;
  if (sourceBytes < 500 * KB) return 1.7;
  return 1.5;
}
function __wsPadOutputToSize(code, source) {
  const encoder = new TextEncoder();
  const sourceBytes = encoder.encode(source).length;
  const currentBytes = encoder.encode(code).length;
  const multiplier = __wsTargetSizeMultiplier(sourceBytes);
  const targetBytes = Math.ceil(sourceBytes * multiplier);
  if (currentBytes >= targetBytes) {
    return { code, sourceBytes, outputBytes: currentBytes, targetBytes, multiplier, padded: false };
  }
  const marker = "\n--[[ WSFuscate inert size padding; no executable statements.\n";
  const closing = "\n]]\n";
  const payloadBytes = targetBytes - currentBytes - encoder.encode(marker + closing).length;
  if (payloadBytes <= 0) {
    const result = code + marker + closing;
    return { code: result, sourceBytes, outputBytes: encoder.encode(result).length, targetBytes, multiplier, padded: true };
  }
  // ASCII-only filler keeps byte accounting deterministic on mobile browsers.
  const line = "-- WSFuscate padding 0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ\n";
  let filler = "";
  while (filler.length + line.length <= payloadBytes) filler += line;
  if (filler.length < payloadBytes) filler += "x".repeat(payloadBytes - filler.length);
  const result = code + marker + filler + closing;
  return { code: result, sourceBytes, outputBytes: encoder.encode(result).length, targetBytes, multiplier, padded: true };
}

/* v8.1-38: Obfuscate reads only the visible settings. Seed and VM Debug are no longer exposed. */
/* FEATURE v16.5: normalized stage diagnostics and build summary.
   Counts derived from emitted text are estimates, never compiler proof. */
function __wsStageError(stage, error, advice) {
  const e = error || {};
  const line = Number(e.line || e.l || 0), col = Number(e.col || e.c || 0);
  const where = line > 0 ? line + ":" + (col > 0 ? col : 1) : "?:?";
  const cause = String(e.m || e.message || e || "알 수 없는 오류").replace(/\s+/g, " ").slice(0, 260);
  return "[" + stage + "] " + where + " — " + cause + " — " + (advice || "입력 구간을 분리해 사전 검사 후 다시 시도하세요.");
}
function __wsRenderBuildSummary(result, opts, source) {
  const panel = document.getElementById("build_summary");
  const state = document.getElementById("build_summary_state");
  if (!panel || !result) return;
  const a = result.appliedOptions || {};
  const enabled = [];
  if (opts.name) enabled.push("지역 변수 이름 변경(기존 패스)");
  if (opts.str) enabled.push("문자열 인코딩");
  if (opts.dead) enabled.push("불필요 코드");
  if (opts.flow) enabled.push("CFF");
  if (opts.constWrap) enabled.push("상수 래핑");
  if (opts.kw) enabled.push("키워드 숨김");
  if (opts.cmt) enabled.push("주석 제거");
  if (result.mode === "vm") enabled.push("바이트코드 VM");
  const warnings = (result.warnings || []).map(w => "  • " + __wsStageError(
    /keyword|키워드/i.test(w) ? "KeywordHide" : /cff|control.flow/i.test(w) ? "CFF" : /string|문자열/i.test(w) ? "StringEncode" : "Emit",
    {message:w}, "해당 패스를 끄거나 문제 구간을 단순화하고 재검사하세요."
  ));
  const stringCount = (String(source).match(/(["'`])(?:\\.|(?!\1)[^\\])*\1/g) || []).length;
  const cffCount = (String(source).match(/\b(?:if|while|repeat|for)\b/g) || []).length;
  const vmFunctions = result.mode === "vm" ? ((String(source).match(/\bfunction\b/g) || []).length + 1) : 0;
  const lines = [
    "모드: " + result.mode + " | Level: " + result.level,
    "VM: " + (result.mode === "vm" ? "사용" : "미사용") + " | profile: " + (a.vmProfile || opts.profile),
    "Integrity policy: " + (opts.integrityPolicy || "strict"),
    "적용 요청 패스: " + (enabled.length ? enabled.join(", ") : "없음"),
    "입력/출력: " + result.orig + " B → " + result.obf + " B (" + (result.orig ? (result.obf / result.orig).toFixed(2) : "0.00") + "×)",
    "카운트(정적 추정): VM 함수 약 " + vmFunctions + " | 문자열 리터럴 " + stringCount + " | CFF 후보 블록 " + cffCount,
    "주의: 카운트는 토큰 기반 추정치이며 실제 변환 성공 개수와 다를 수 있습니다.",
    "경고: " + (warnings.length ? "" : "없음"),
    ...warnings,
    "",
    "이 도구는 역공학 비용 증가 도구이며 서버 권한/서버 검증을 대체하지 않습니다.",
    "생성된 Luau는 반드시 실제 목표 Roblox/Luau 런타임에서 테스트하세요."
  ];
  panel.textContent = lines.join("\n");
  if (state) state.textContent = warnings.length ? "경고 있음" : "완료";
}
function __wsClearBuildSummary(message) {
  const panel = document.getElementById("build_summary");
  const state = document.getElementById("build_summary_state");
  if (panel) panel.textContent = message || "빌드가 완료되면 요약이 표시됩니다.";
  if (state) state.textContent = "대기";
}


const __WSF_VM_UNSUPPORTED_GLOBALS = new Set([
  "load", "getgenv", "getrenv", "getfenv", "setfenv",
  "hookfunction", "hookmetamethod", "newcclosure", "clonefunction",
  "restorefunction", "getgc", "getreg", "getconnections", "getloadedmodules",
  "getnilinstances", "getinstances", "checkcaller", "isexecutorclosure"
]);
function __wsFindUnsupportedVmGlobals(source) {
  let tokens;
  try { tokens = lex(source).T; } catch (_) { return []; }
  const declared = new Set();
  const isId = t => !!t && t.t === "id";
  const isOp = (t, v) => !!t && t.t === "op" && t.v === v;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.t !== "kw") continue;
    if (t.v === "local" || t.v === "const") {
      let j = i + 1;
      if (tokens[j] && tokens[j].t === "kw" && tokens[j].v === "function") {
        if (isId(tokens[j + 1])) declared.add(tokens[j + 1].v);
        continue;
      }
      while (isId(tokens[j])) {
        declared.add(tokens[j].v);
        j++;
        // A Luau local attribute or type annotation does not change the declared name.
        if (isOp(tokens[j], "<")) {
          while (j < tokens.length && !isOp(tokens[j], ">")) j++;
          if (isOp(tokens[j], ">")) j++;
        }
        if (isOp(tokens[j], ":")) {
          j++;
          while (j < tokens.length && !isOp(tokens[j], ",") && !isOp(tokens[j], "=") && tokens[j].t !== "eof") j++;
        }
        if (isOp(tokens[j], ",")) j++; else break;
      }
    } else if (t.v === "function") {
      let j = i + 1;
      if (isId(tokens[j]) && !isOp(tokens[j + 1], ".") && !isOp(tokens[j + 1], ":")) declared.add(tokens[j].v);
      while (j < tokens.length && !isOp(tokens[j], "(")) j++;
      if (isOp(tokens[j], "(")) {
        for (j++; j < tokens.length && !isOp(tokens[j], ")"); j++) {
          if (isId(tokens[j])) declared.add(tokens[j].v);
        }
      }
    } else if (t.v === "for") {
      for (let j = i + 1; j < tokens.length && !isKwBoundary(tokens[j]); j++) {
        if (isId(tokens[j])) declared.add(tokens[j].v);
        if (isOp(tokens[j], "in") || isOp(tokens[j], "=")) break;
      }
    }
  }
  const found = new Set();
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.t !== "id" || !__WSF_VM_UNSUPPORTED_GLOBALS.has(t.v) || declared.has(t.v)) continue;
    const prev = tokens[i - 1], next = tokens[i + 1];
    if (isOp(prev, ".") || isOp(prev, ":")) continue;
    // Table-constructor keys are labels, not global references.
    if (isOp(next, "=")) continue;
    found.add(t.v);
  }
  return [...found].sort();
  function isKwBoundary(t) {
    return !t || t.t === "eof" || (t.t === "kw" && ["do", "then", "end", "in"].includes(t.v));
  }
}

function obfuscateOnServer(source, options = {}) {
  __wqC();
  if (options === undefined) options = {};
  if (!options || typeof options !== "object" || Array.isArray(options) || __WSF_NODE_IS_PROXY(options)) {
    const err = new TypeError("options must be a plain data object; Proxy and accessor-backed options are not supported.");
    err.status = 400;
    err.code = "WSF_INVALID_OPTIONS";
    throw err;
  }
  const optionsPrototype = __WSF_OBJECT_GET_PROTOTYPE_OF(options);
  if (optionsPrototype !== __WSF_OBJECT_PROTOTYPE && optionsPrototype !== null) {
    const err = new TypeError("options must be a plain data object.");
    err.status = 400;
    err.code = "WSF_INVALID_OPTIONS";
    throw err;
  }
  const optionSnapshot = Object.create(null);
  for (const key of __WSF_REFLECT_OWN_KEYS(options)) {
    if (typeof key !== "string") {
      const err = new TypeError("options must not contain symbol keys.");
      err.status = 400;
      err.code = "WSF_INVALID_OPTIONS";
      throw err;
    }
    const descriptor = __WSF_OBJECT_GET_OWN_PROPERTY_DESCRIPTOR(options, key);
    if (!descriptor || !__WSF_HAS_OWN(descriptor, "value")) {
      const err = new TypeError("options must not contain getters or setters: " + key);
      err.status = 400;
      err.code = "WSF_INVALID_OPTIONS";
      throw err;
    }
    const value = descriptor.value;
    if (value !== null && !["string", "number", "boolean", "undefined"].includes(typeof value)) {
      const err = new TypeError("options values must be primitive data: " + key);
      err.status = 400;
      err.code = "WSF_INVALID_OPTIONS";
      throw err;
    }
    optionSnapshot[key] = value;
  }
  options = optionSnapshot;
  if (options.seed !== undefined && options.seed !== null &&
      !(typeof options.seed === "string" || (typeof options.seed === "number" && Number.isFinite(options.seed)))) {
    const err = new TypeError("seed must be a string or finite number.");
    err.status = 400;
    err.code = "WSF_INVALID_OPTIONS";
    throw err;
  }
  if (typeof source !== "string") {
    const err = new Error("source must be a string");
    err.status = 400;
    throw err;
  }
  if (!String(source).trim()) {
    const err = new Error("Source is empty.");
    err.status = 400;
    throw err;
  }
  __wqC();
  const inputBytes = Buffer.byteLength(source, "utf8");
  const maxInputBytes = Number.isFinite(Number(options.maxInputBytes))
    ? Math.max(1024, Math.min(20 * 1024 * 1024, Math.floor(Number(options.maxInputBytes))))
    : 5 * 1024 * 1024;
  if (inputBytes > maxInputBytes) {
    const err = new Error(`Source exceeds the ${maxInputBytes}-byte input limit.`);
    err.status = 413;
    err.code = "WSF_INPUT_TOO_LARGE";
    throw err;
  }
  const opts = {
    level: Math.min(5, Math.max(1, Math.floor(Number(options.level) || 5))),
    name: options.name !== false,
    str: options.str !== false,
    strictStrings: options.strictStrings !== false,
    runtimeXor: options.runtimeXor !== false,
    // V8.2.14 compatibility defaults. Local payload consistency diagnostics are enabled
    // unless explicitly disabled; they do not authenticate a client-controlled VM.
    runtimeBinding: options.runtimeBinding === true,
    dead: options.dead === true,
    flow: options.flow === true,
    // This engine build is locked to full VM output: UI-supplied vm:false and
    // auto-size preferences are intentionally ignored so no request silently emits source mode.
    vm: true,
    autoVmSize: false,
    forceVm: true,
    // A full-VM deployment must never silently substitute a source-mode artifact.
    allowVmFallback: false,
    includeInternalDiagnostics: options.includeInternalDiagnostics === true,
    // Requesting CFF without an explicit profile selects the stronger VM CFG layout.
    profile: ["compact", "balanced", "hardened"].includes(options.profile) ? options.profile : (options.flow === true ? "hardened" : "balanced"),
    vmEnvironment: ["extended", "strict", "roblox"].includes(options.vmEnvironment) ? options.vmEnvironment : "roblox",
    vmDebug: !!options.vmDebug,
    timingNoise: !!options.timingNoise,
    maxInstructions: options.maxInstructions,
    maxCallDepth: Number.isFinite(Number(options.maxCallDepth))
      ? Math.max(16, Math.min(4096, Math.floor(Number(options.maxCallDepth))))
      : 512,
    maxInputBytes: Number.isFinite(Number(options.maxInputBytes))
      ? Math.max(1024, Math.min(20 * 1024 * 1024, Math.floor(Number(options.maxInputBytes))))
      : 5 * 1024 * 1024,
    cmt: !!options.cmt,
    kw: options.kw !== false,
    constWrap: options.constWrap !== false,
    numberEncoding: options.numberEncoding !== false,
    seed: options.seed === undefined || options.seed === null || options.seed === "" ? undefined : options.seed,
    allowDeterministic: options.allowDeterministic === true,
    integrity: options.integrity === true,
    integrityPolicy: options.integrityPolicy === "diagnostic" ? "diagnostic" : "strict",
    antiHookMode: ["strict", "balanced", "off"].includes(options.antiHookMode) ? options.antiHookMode : "balanced",
    runtimeSize: options.runtimeSize === "full" ? "full" : "compact",
    portableFallbacks: options.portableFallbacks !== false,
    allowRequire: options.allowRequire === true,
    allowCoroutine: options.allowCoroutine !== false,
    vmCoroutineScheduler: options.vmCoroutineScheduler === true,
    minify: options.minify !== false
  };
  if (opts.vm) {
    const unsupportedGlobals = __wsFindUnsupportedVmGlobals(source);
    if (unsupportedGlobals.length) {
      const err = new Error(
        "VM mode does not expose dynamic code loaders or executor-only globals: " +
        unsupportedGlobals.join(", ") +
        ". Provide the inspected Luau source directly instead of loading code dynamically."
      );
      err.code = "WSF_VM_UNSUPPORTED_API";
      err.status = 400;
      throw err;
    }
  }
  let r;
  const previousVmSemanticOrder = VM_OP_LIST.slice();
  try {
    shuffleVmSemanticOrderForBuild();
    r = obf(source, opts);
  } catch (error) {
    // VM build failures retain their original cause privately. Inspect that cause
    // before choosing the public error, so parser coordinates/token text are never
    // exposed by default through the VM wrapper message.
    const sourceCause = error && error.cause ? error.cause : error;
    const isSourceDiagnostic = !!sourceCause && (sourceCause.code === "WSF_PARSE_ERROR" ||
      (Number.isInteger(sourceCause.line) && Number.isInteger(sourceCause.col)) ||
      (Number.isInteger(sourceCause.l) && Number.isInteger(sourceCause.c)));
    if (isSourceDiagnostic) {
      if (options.includeInternalDiagnostics === true) {
        const detail = sourceCause.diagnostic || sourceCause.m || sourceCause.message || "Parse failure";
        const line = Number.isInteger(sourceCause.line) ? sourceCause.line : sourceCause.l;
        const col = Number.isInteger(sourceCause.col) ? sourceCause.col : sourceCause.c;
        const detailed = new SyntaxError(String(detail) + " (line " + line + ", column " + col + ")");
        detailed.code = "WSF_PARSE_ERROR";
        detailed.status = 400;
        throw detailed;
      }
      const publicError = new SyntaxError("Invalid Luau source.");
      publicError.code = "WSF_INVALID_SOURCE";
      publicError.status = 400;
      throw publicError;
    }
    throw error;
  } finally {
    // Restore canonical module state even when parsing, serialization or VM
    // generation throws. No request can inherit another build's ISA order.
    VM_OP_LIST.splice(0, VM_OP_LIST.length, ...previousVmSemanticOrder);
    refreshVmOpIndex();
  }
  if (opts.forceVm === true && (!r || r.mode !== "vm" || r.vmFallback)) {
    const err = new Error("WSF_VM_REQUIRED: build did not produce a VM artifact; source-mode output was rejected.");
    err.code = "WSF_VM_REQUIRED";
    err.status = 500;
    throw err;
  }
  const code = typeof r === "string" ? r : String(r && r.code != null ? r.code : "");
  const originalBytes = typeof (r && r.orig === "number") ? r.orig : Buffer.byteLength(source, "utf8");
  const outLen = (r && typeof r.obf === "number") ? r.obf : Buffer.byteLength(code, "utf8");
  return {
    code,
    originalBytes,
    outputBytes: outLen,
    cffChanges: (r && Number.isFinite(r.cffChanges)) ? r.cffChanges : 0,
    mode: (r && r.mode) || "source",
    level: (r && r.level != null) ? r.level : opts.level,
    warnings: Array.isArray(r && r.warnings)
      ? (options.includeInternalDiagnostics === true
          ? r.warnings
          : r.warnings.map(message => {
              const value = String(message);
              const operatorFacingWarning = /^(?:VM coroutine API is exposed;|The internal VM coroutine scheduler is enabled by explicit request;|extended VM environment exposes additional Roblox APIs;|VM require capability is enabled by explicit request;)/i.test(value);
              return !operatorFacingWarning && /(?:\bVM\b|bytecode|opcode|prototype|dispatch|parse failure|build failed|internal cause|CFF skipped|Hide keywords skipped)/i.test(value)
                ? "A transformation stage reported a diagnostic; detailed server-side information is hidden."
                : value;
            }))
      : [],
    vmFallbackUsed: !!(r && r.vmFallback),
    vmFallbackReason: r && r.vmFallback
      ? (options.includeInternalDiagnostics === true ? String(r.vmFallback).slice(0, 240) : "VM build failed; source fallback was explicitly authorized.")
      : null,
    securityProfile: {
      vmProfile: opts.profile,
      vmProfileMeaning: "layout and compatibility preset only; it does not make client code confidential or tamper-proof",
      runtimeBinding: opts.runtimeBinding,
      buildRandomness: opts.seed !== undefined && opts.seed !== null && opts.seed !== "" ? "explicit deterministic debug opt-in; layout and key streams are reproducible and predictable" : "separate layout/key/VM streams with independent Node crypto.randomBytes requests; 256-byte chunks, consumed-word wiping, independently CSPRNG-selected 65..130-draw intrinsic revalidation, and end-of-build buffer cleanup",
      integrity: opts.vm && opts.integrity === true,
      integrityPolicy: opts.integrity ? opts.integrityPolicy : "disabled",
      integrityErrorPolicy: "integrity failures expose one generic public message; bounded reason codes are retained only in the server-side diagnostic ring and can be read with getInternalDiagnostics on trusted server code",
      tokenLifetimePolicy: "lexer token objects have decoded literal references and source spans cleared as soon as each consumer finishes; JavaScript string storage cannot be securely zeroized and AST/output copies remain by design",
      integrityPolicyMeaning: "controls local diagnostic failure behavior only; verifier and expected values are in the client output",
      antiHookMode: opts.antiHookMode || "balanced",
      antiHookGuarantee: "none; selected compatibility checks are editable and bypassable by a client controlling the runtime",
      antiHookMeaning: "compatibility diagnostics only; no reliable executor-hook detection or tamper resistance",
      runtimeSize: opts.runtimeSize || "compact",
      portableFallbacks: opts.portableFallbacks !== false,
      outputMinification: opts.minify !== false,
      serverOnlyBuild: true,
      clientRecoverability: "complete: emitted bytecode, handlers, decoder data, keys, and runtime checks are recoverable from the client output; this format is obfuscation, not encryption",
      trustBoundary: "server-authoritative validation is required; local integrity and anti-hook checks are diagnostic/friction only and cannot establish trust in a client-controlled runtime",
      vmFallbackPolicy: opts.allowVmFallback ? "enabled only with allowVmFallback:true and fallbackAcknowledgement: WSF_SOURCE_MODE_ACCEPTED; raw internal failure detail is hidden by default" : "disabled; VM build failures return WSF_VM_BUILD_FAILED",
      maxInstructions: Number.isFinite(Number(opts.maxInstructions))
        ? Math.max(1000, Math.min(100000000, Math.floor(Number(opts.maxInstructions))))
        : 1000000,
      maxCallDepth: opts.maxCallDepth || 512,
      instructionBudgetScope: "one shared maxInstructions budget per top-level VM run, including nested calls; intentionally prevents recursive calls from resetting the run budget",
      maxInputBytes,
      validationSchedule: opts.integrity ? "per-instruction VM bounds/state validation plus periodic local consistency diagnostics; editable by the client and not a trust guarantee" : "VM bounds/state validation only; optional local consistency diagnostics disabled",
      handlerLayout: "three independently shuffled handler-function lanes with lane-specific hash maps and identity checks; handler code and mappings remain client-visible and recoverable",
      dispatchLayout: opts.runtimeSize === "full"
        ? "feedback-decoded dispatch manifest resolves physical opcode slots through a rotating four-bank closure layout and state-selected handler lane; client-visible and reversible"
        : "three independent bijective slot permutations over the 0..250 domain; each instruction selects one table using state feedback before resolving the encoded handler-pool index; client-visible and reversible",
      decoyHandlers: "disabled; invalid slots fail closed",
      opcodeLayout: "per-build randomized sparse unsigned 32-bit per-prototype opcode IDs, regenerated decoy labels and slot map, six-byte records (id:u32, handlerSlot:u8, chained check:u8), feedback-encoded and split into two XOR shares; all client-side seeds and decoders remain reversible",
      constantLayout: "per-prototype masked physical constant-index tree; call-site salted direct/cache/lazy access routes; only scalar primitives enter a bounded four-slot cache with short build-random TTL; expired entries are swept; decoded strings are not cached but are necessarily plaintext while consumed as Luau values",
      integrityModel: opts.integrity ? "client-side consistency diagnostics and structural payload checks; code, verifier, and expected digest ship together and are editable; not a trusted integrity boundary or cryptographic MAC" : "diagnostics disabled by caller; structural bytecode/prototype bounds checks remain enabled",
      integrityFailurePath: opts.integrity ? "local consistency diagnostics report an error and the VM scheduler clears its per-run frame/call state; client code can patch this logic" : "not emitted",
      vmEnvironment: opts.vmEnvironment || "roblox",
      globalCapabilityPolicy: opts.vmEnvironment === "strict" ? "strict pure-Luau allowlist; Roblox services/modules and loadstring unavailable; coroutine and require are not exposed" : "Roblox compatibility allowlist; loadstring is passed through automatically when the host provides it; require=" + (opts.allowRequire ? "enabled by explicit opt-in" : "disabled by default") + "; coroutine=" + (opts.allowCoroutine ? "enabled" : "disabled") + "; os exposes clock only; this is not a security sandbox",
      vmCoroutineScheduler: opts.vmCoroutineScheduler === true,
      vmCoroutineSchedulerPolicy: opts.vmCoroutineScheduler ? "internal coroutine scheduler explicitly enabled; runtime coroutine API exposure is controlled separately by allowCoroutine" : "direct VM call bridge is the default; user coroutine API may still be exposed separately by allowCoroutine",
      bufferCapability: opts.portableFallbacks ? "native buffer/bit32 are preferred; Lua-compatible fallback implementations are emitted only because portableFallbacks was requested" : "binds native Luau buffer and bit32 directly; no buffer/bit32 fallback implementation or buffer proxy is emitted",
      reflectionBoundary: "debug is excluded from the VM capability table; privileged reflection outside the VM sandbox cannot be reliably disabled by client-side Luau code",
      sourceGlobalProxy: "finite direct-reference compatibility mapping; referenced globals are present in the client output and source mode is not an environment sandbox; no _G/getgenv/getfenv/shared enumeration",
      integrityRingSlots: opts.integrity ? 32 : 0,
      isaRandomization: "per-build shuffled semantic opcode iteration order plus independently randomized sparse 32-bit IDs, per-prototype opcode maps, physical handler slots, operand schemas, and closure-pool placement; all mappings remain recoverable from client output",
      microcode: "VM operation implementations are emitted in three independently ordered client-side handler lanes; opcode identifiers and per-lane mappings are embedded and recoverable; layout changes are obfuscation only",
      decoderExposure: "multiple per-literal decoder shapes are selected at build time; decoders, encoded bytes, seeds, alphabets, and required runtime values remain present in the generated client chunk and are recoverable; this is obfuscation, not encryption",
      releaseDiagnosticPolicy: opts.vmDebug ? "detailed VM diagnostics retained for debugging; runtime labels are encoded in generated strings" : "generated VM diagnostic errors are normalized to a generic failure message; PC/depth breadcrumbs are omitted",
      runtimePlaintextBoundary: "string constants are decoded only when their VM constant index is accessed; decoded buffers are zero-filled immediately after conversion to a Luau string; strings/tables/functions are never cached; scalar cache is a single primitive-only slot and is cleared on expiry or non-scalar access; immutable Luau strings remain live while referenced by registers or user code",
      memoryFootprintPolicy: "per-frame one-slot scalar cache uses primitive locals rather than per-access table records; strings are lazy-decoded and not cached; decode buffers are zero-filled before release; constant ciphertext remains embedded in the payload and must be resident",
      runtimeStateSaltPolicy: "per-build CSPRNG seed combined per VM frame with capability-filtered os.clock when available plus frame ID/depth and prototype metadata; applied to PC affine offset and dispatch-feedback routing; no debugger detection or destructive payload mutation",
      antiHook: opts.antiHookMode === "off" ? "disabled; VM bounds checks remain" : "selected runtime-compatibility diagnostics only; editable client-side checks, not anti-hook enforcement or reliable executor-hook detection",
      dispatchExposure: opts.runtimeSize === "full"
        ? "opcode IDs, handler slots, operands, rotating bank manifests, and decode parameters are embedded in the generated client chunk and are recoverable by a runtime analyst; do not treat them as secrets"
        : "opcode IDs, handler slots, operands, all three compact dispatch permutations, and decode parameters are embedded in the generated client chunk and are recoverable by a runtime analyst; do not treat them as secrets",
      instructionMap: "per-prototype delta-coded xorshift-feedback byte string with bounded 8-entry runtime cache; offsets are decoded on demand",
      wordCache: "8-entry direct-mapped decoded-word cache; rewind resets the sequential decoder state before replay",
      opcodeBlob: "six-byte sparse 32-bit opcode records with chained record checks, emitted as two XOR shares and recombined by the client decoder; representation change, not encryption",
      dispatchManifest: opts.runtimeSize === "full"
        ? "feedback-decoded rotating closure-bank manifests are client-side and reconstructible; local checks do not authenticate them"
        : "three independently permuted dispatch-slot maps are selected by a state-derived lane; maps are client-side and reconstructible, and local checks do not authenticate them",
      reflectionPolicy: opts.antiHookMode === "off" ? "compatibility diagnostics disabled" : "limited runtime compatibility diagnostics; privileged reflection and runtime patching are outside the client trust boundary",
      prototypeMetadata: "numeric metadata and decoders are embedded in the client output and are recoverable; packing changes representation, not confidentiality",
      operandEncoding: "per-prototype odd-multiplier affine transform plus XOR and word-position/field mixing over uint32 operands; the matching inverse is embedded in the client VM and is reversible",
      registerLayout: "per-prototype base-offset mapping keeps adjacent register ranges contiguous while using an ordinary raw table without __index/__newindex metamethods",
      operandEncoding: "per-prototype odd-multiplier affine transform plus XOR and word-position/field mixing over uint32 operands; the matching inverse is embedded in the client VM and is reversible",
      registerLayout: "per-prototype base-offset mapping keeps adjacent register ranges contiguous while using an ordinary raw table without __index/__newindex metamethods",
      serverBuildPolicy: "private CommonJS-captured Node crypto/buffer/util/reflection references are cross-checked by identity and bounded fresh-random-input behavior probes at import, build entry, and independently sampled 65..130 draws per stream with unbiased CSPRNG selection; no debugger, process-fingerprint, deceptive failure behavior, or browser-global spoofing; the bundled UI uses a frozen inert document adapter only; three separately managed build-time CSPRNG streams use 256-byte chunks with consumed-word and end-of-build zero-and-verify buffer wiping; VM opcode/decoy slot maps and masks are rebuilt per request and cleared after build; parser coordinates and token text are returned only with includeInternalDiagnostics:true; VM fallback requires explicit source-mode acknowledgement; generated client Luau contains its own VM, data, decoders, and checks, so these remain reversible obfuscation/local diagnostics rather than secret-key protection; module exports obfuscateOnServer plus trusted-server diagnostic accessors; integrity failures use numeric internal reason IDs mapped only by the private diagnostic sink; never expose diagnostic accessors to clients; never bundle the engine into public client assets",
      controlFlowLayout: opts.profile === "compact" ? "compact sequential VM instruction layout with encoded program counters" : "VM basic-block layout may be permuted and branch targets relocated; control-flow representation remains recoverable",
      branchRelocation: true,
      stateMachinePC: "per-prototype bijective affine state-token mapping with per-payload multiplier/addend/inverse; logical branch arithmetic is decoded only at the VM instruction boundary",
      opaqueControlFlow: opts.profile === "compact" ? "encoded state transitions; no claim of opaque or irreversible control flow" : "optional state predicates, block permutation, and branch relocation; all transitions remain recoverable from the client output",
      controlFlowRequested: opts.flow === true,
      sourceCffLayout: "AST-based control-flow restructuring for supported constructs; per-region primary/shadow tokens use separate build-key schedules and 32-bit Feistel encodings; generated states and transitions remain present in client output",
      sourceCffSizePolicy: "collision-checked state identifiers, arithmetic and bit32 identity predicate variants plus VM-state-coupled runtime bit predicates, per-region exit sentinels in 10000..65535, independently keyed paired 32-bit Feistel token schedules with 8..16 rounds, flat-or-nested equivalent dispatch trees, randomized safe nesting thresholds, and ordered uneven IR partitions",
      astOptimizationPolicy: "conservative literal constant folding, straight-line immutable local-literal substitution, unused pure-literal local removal, and unreachable-tail pruning; function-body inlining is intentionally omitted where closure capture or side effects cannot be proven safe",
      sourceStringPool: "lexer-backed duplicate literal pooling before per-literal encoding; only positive estimated byte savings are accepted; source/client literals remain recoverable at runtime",
      keywordLowering: "short-circuit left operand is captured exactly once; enclosing varargs are preserved by retaining native and/or for those expressions",
      interpolationParser: "expression delimiters skip quoted strings, long-bracket strings, and line/long comments",
      sourceNumberEncoding: opts.numberEncoding ? "sampled exact integer identities applied by token span before string encoding; decimal, floating, oversized, and precision-sensitive literals are skipped" : "disabled by caller",
      sourceRuntimeProbePolicy: "bounded primitive and error-semantics checks only; no timing-based debugger heuristic or debug-library fingerprinting",
      parserDiagnosticPolicy: "generic Invalid Luau source error by default; token/line/column diagnostic detail is opt-in through includeInternalDiagnostics:true",
      parserMetadataPolicy: "token positions remain private and temporary while source-span edits need them; type aliases and type-function declarations are consumed and omitted from runtime AST; Luau const bindings and function attributes are erased after balanced parsing; generic types, type packs, table/indexer types, union/intersection/optional types and if-expression elseif chains are lowered into nested conditional AST nodes",
      interpolationPolicy: "lexically balanced interpolation parser with quoted/long-string/comment skipping; concatenation remains explicit to preserve Luau evaluation order and tostring semantics",
      serverDomPolicy: "no global window/document/navigator spoofing; bundled server UI uses a frozen module-local inert document adapter only",
      integrityProbeSchedule: "module import, public build entry, and independently sampled 65..130 draws per layout/key/VM stream with unbiased CSPRNG selection; CSPRNG-shuffled identity plus bounded fresh-random-input probes; this detects accidental host monkey-patching, not privileged process compromise"
    },
    engine: "v8.2.44-three-lane-dispatch-integrity-digest-fix-lazy-memory-runtime-salt-luau-compat"
  };
}

module.exports = Object.freeze({ obfuscateOnServer, getInternalDiagnostics, clearInternalDiagnostics });
// Deploy this module only on a trusted Node server. Never bundle this engine into the public client.

