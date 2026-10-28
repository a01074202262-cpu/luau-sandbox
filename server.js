// Luau 샌드박스 서버 (외부 패키지 필요 없음)
// 실행: node server.js
// 사전 준비: Luau CLI(실행 파일 "luau")가 설치되어 있어야 합니다.
//   - https://github.com/luau-lang/luau/releases 에서 받아 PATH에 넣거나
//   - LUAU_PATH 환경변수로 경로를 지정하세요. 예) LUAU_PATH=C:\luau\luau.exe node server.js
//
// Roblox 모드: roblox.luau(에뮬레이터)를 사용자 코드 앞에 붙여서 실행합니다.
//   game / workspace / Instance.new / task / Vector3 / CFrame ... 등을 흉내 냅니다.

const http = require("http");
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { spawn } = require("child_process");

const PORT = process.env.PORT || 3000;
const LUAU_PATH = process.env.LUAU_PATH || "luau";
const PRELUDE_PATH = path.join(__dirname, "roblox.luau");
const TIME_LIMIT_MS = Number(process.env.TIME_LIMIT_MS) || 5000; // 실행 제한 시간(ms)
const OUTPUT_LIMIT = 64 * 1024; // 출력 최대 64KB
const CODE_LIMIT = (Number(process.env.CODE_LIMIT_KB) || 100) * 1024; // 코드 최대 크기

// roblox.luau 가 stdout 으로 보내는 특수 표시 (오류 / 알림)
const ERR_MARK = "\x01RBX_ERR\x02";
const NOTE_MARK = "\x01RBX_NOTE\x02";

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > CODE_LIMIT * 2) {
        reject(new Error("요청이 너무 큽니다."));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

// 사용자 코드를 Roblox 에뮬레이터로 감싸기
// 사용자 코드의 첫 줄은 합쳐진 파일의 (offset + 1)번째 줄이 됩니다.
function buildProgram(code, roblox) {
  if (!roblox) return { source: code, offset: 0, userLines: code.split("\n").length };
  const prelude = fs.readFileSync(PRELUDE_PATH, "utf8").replace(/\s+$/, "");
  const header = prelude + "\n__rbx_main(function()\n";
  const offset = header.split("\n").length - 1;
  const footer = "\nend)\n__rbx_run()\n";
  return { source: header + code + footer, offset, userLines: code.split("\n").length };
}

// 합쳐진 파일의 줄 번호를 사용자 코드 기준으로 되돌리기
function fixLines(text, offset, userLines) {
  if (!offset) return text;
  const out = [];
  const lines = text.split("\n");
  lines.forEach((line, idx) => {
    let internal = false;
    let fixed = line.replace(/main\.luau:(\d+)/g, (m, n) => {
      const l = Number(n) - offset;
      if (l < 1) {
        internal = true;
        return m;
      }
      return "main.luau:" + Math.min(l, userLines);
    });
    fixed = fixed.replace(/at line (\d+)/g, (m, n) => {
      const l = Number(n) - offset;
      return l < 1 ? m : "at line " + Math.min(l, userLines);
    });
    if (internal) {
      // 에뮬레이터 내부 줄: 첫 줄(오류 메시지)이면 표시만 바꾸고, 스택 줄이면 숨김
      if (idx === 0) out.push(fixed.replace(/\S*main\.luau:\d+:?\s*/, "(roblox 에뮬레이터) "));
      return;
    }
    out.push(fixed);
  });
  return out.join("\n");
}

function runLuau(code, roblox) {
  return new Promise((resolve) => {
    const id = crypto.randomBytes(8).toString("hex");
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "luau-"));
    const file = path.join(dir, `main_${id}.luau`);

    let program;
    try {
      program = buildProgram(code, roblox);
    } catch (e) {
      try {
        fs.rmSync(dir, { recursive: true, force: true });
      } catch (_) {}
      return resolve({
        ok: false,
        stdout: "",
        stderr: `roblox.luau 를 읽을 수 없습니다: ${e.message}\nserver.js 와 같은 폴더에 roblox.luau 를 두세요.`,
        exitCode: -1,
        timedOut: false,
        truncated: false,
        durationMs: 0,
        serverError: true,
      });
    }
    fs.writeFileSync(file, program.source, "utf8");

    const started = Date.now();
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    let truncated = false;
    let finished = false;

    const child = spawn(LUAU_PATH, [file], { cwd: dir, windowsHide: true });

    const cleanup = () => {
      try {
        fs.rmSync(dir, { recursive: true, force: true });
      } catch (_) {}
    };

    const done = (payload) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      cleanup();
      resolve(payload);
    };

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, TIME_LIMIT_MS);

    const collect = (which) => (chunk) => {
      const text = chunk.toString("utf8");
      if (which === "out") {
        if (stdout.length < OUTPUT_LIMIT) stdout += text;
        else truncated = true;
      } else {
        if (stderr.length < OUTPUT_LIMIT) stderr += text;
        else truncated = true;
      }
      if (truncated) child.kill("SIGKILL");
    };

    child.stdout.on("data", collect("out"));
    child.stderr.on("data", collect("err"));

    child.on("error", (err) => {
      const notFound = err.code === "ENOENT";
      done({
        ok: false,
        stdout: "",
        stderr: notFound
          ? `Luau 실행 파일을 찾을 수 없습니다: "${LUAU_PATH}"\n` +
            "Luau CLI를 설치하거나 LUAU_PATH 환경변수로 경로를 지정하세요."
          : `프로세스 실행 실패: ${err.message}`,
        exitCode: -1,
        timedOut: false,
        truncated: false,
        durationMs: Date.now() - started,
        serverError: true,
      });
    });

    child.on("close", (exitCode) => {
      const clean = (s) => s.split(file).join("main.luau");

      // stdout 에서 에뮬레이터가 보낸 오류/알림 줄을 분리
      const outLines = [];
      const scriptErrors = [];
      for (const line of clean(stdout).split("\n")) {
        if (line.startsWith(ERR_MARK)) {
          const msg = line.slice(ERR_MARK.length).replace(/\x03/g, "\n");
          scriptErrors.push(fixLines(msg, program.offset, program.userLines).trim());
        } else if (line.startsWith(NOTE_MARK)) {
          outLines.push("[알림] " + line.slice(NOTE_MARK.length));
        } else {
          outLines.push(line);
        }
      }
      let outText = outLines.join("\n");

      let errText = fixLines(clean(stderr), program.offset, program.userLines).trim();
      if (scriptErrors.length) {
        errText = (errText ? errText + "\n\n" : "") + scriptErrors.join("\n\n");
      }
      if (timedOut) {
        errText += `\n[시간 초과] ${TIME_LIMIT_MS / 1000}초 안에 끝나지 않아 강제 종료했습니다.`;
      }
      if (truncated) {
        errText += "\n[출력 초과] 출력이 너무 많아 강제 종료했습니다.";
      }

      done({
        ok: exitCode === 0 && !timedOut && !truncated && scriptErrors.length === 0,
        stdout: outText.replace(/\n+$/, "\n"),
        stderr: errText.trim(),
        exitCode,
        timedOut,
        truncated,
        durationMs: Date.now() - started,
        roblox: !!roblox,
      });
    });
  });
}

// ---- 공개 서버용 보호 장치 (Render 등) ----
const MAX_CONCURRENT = Number(process.env.MAX_CONCURRENT) || 4; // 동시에 실행할 코드 수
const RATE_LIMIT = Number(process.env.RATE_LIMIT_PER_MIN) || 30; // IP당 분당 실행 횟수
let running = 0;
const hits = new Map();

function clientIp(req) {
  const xff = req.headers["x-forwarded-for"]; // Render 같은 프록시 뒤에서는 이 헤더에 실제 IP가 옵니다
  return (xff ? xff.split(",")[0].trim() : req.socket.remoteAddress) || "unknown";
}
function rateLimited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 60000);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > RATE_LIMIT;
}
setInterval(() => {
  const now = Date.now();
  for (const [ip, arr] of hits) {
    if (!arr.length || now - arr[arr.length - 1] > 60000) hits.delete(ip);
  }
}, 60000).unref();

const server = http.createServer(async (req, res) => {
  const url = req.url.split("?")[0];

  if (req.method === "GET" && url === "/healthz") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("ok");
    return;
  }

  if (req.method === "GET" && (url === "/" || url === "/index.html")) {
    fs.readFile(path.join(__dirname, "index.html"), (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("index.html 파일을 찾을 수 없습니다. server.js와 같은 폴더에 두세요.");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(data);
    });
    return;
  }

  if (req.method === "POST" && url === "/run") {
    if (rateLimited(clientIp(req))) {
      return sendJson(res, 429, { error: "요청이 너무 많아요. 잠시 후 다시 시도해 주세요." });
    }
    if (running >= MAX_CONCURRENT) {
      return sendJson(res, 503, { error: "서버가 바쁩니다. 잠시 후 다시 시도해 주세요." });
    }
    running++;
    try {
      const raw = await readBody(req);
      const { code, roblox } = JSON.parse(raw || "{}");
      if (typeof code !== "string" || code.trim() === "") {
        return sendJson(res, 400, { error: "코드를 입력해 주세요." });
      }
      if (code.length > CODE_LIMIT) {
        return sendJson(res, 400, { error: `코드가 너무 깁니다. (최대 ${CODE_LIMIT / 1024}KB)` });
      }
      const result = await runLuau(code, roblox !== false); // 기본값: Roblox 모드 켜짐
      return sendJson(res, 200, result);
    } catch (e) {
      return sendJson(res, 400, { error: `잘못된 요청입니다: ${e.message}` });
    } finally {
      running--;
    }
  }

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Not found");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Luau 샌드박스 실행 중: http://localhost:${PORT}`);
  console.log(`Luau 경로: ${LUAU_PATH}`);
});
