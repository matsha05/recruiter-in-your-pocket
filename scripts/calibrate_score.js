/* Calibration runner: reads tests/calibration_results.csv, sends each resume to
 * /api/resume-feedback, compares returned content_score to target ranges in notes,
 * and prints a drift report. */

if (typeof process.env.USE_MOCK_OPENAI === "undefined") {
  process.env.USE_MOCK_OPENAI = "0";
}
if (process.env.USE_MOCK_OPENAI === "1") {
  console.error("Calibration aborted: running in mock mode. Set USE_MOCK_OPENAI=0.");
  process.exit(1);
}
process.env.API_AUTH_TOKEN = process.env.API_AUTH_TOKEN || "";

const fs = require("fs");
const path = require("path");
const app = require("../app");

async function startServerSafe() {
  return new Promise((resolve, reject) => {
    const server = app.listen({ port: 0, host: "127.0.0.1" });

    server.on("listening", () => resolve(server));
    server.on("error", (err) => {
      reject(
        new Error("Calibration server failed to start — port conflict or EPERM.")
      );
    });
  });
}

function parseContentRange(notes) {
  if (!notes) return null;
  const match = notes.match(
    /(thin_signal|strong_foundation|high_bar|rare_air)\s+content\s+(\d+)[–-](\d+)/i
  );
  if (!match) return null;
  const band = match[1].toLowerCase();
  const min = Number(match[2]);
  const max = Number(match[3]);
  if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
  return { band, min, max };
}

async function postResume(baseUrl, text) {
  const res = await fetch(`${baseUrl}/api/resume-feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, mode: "resume" })
  });
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }
  const payload = await res.json();
  if (!payload.ok || !payload.data) {
    throw new Error(`Unexpected payload: ${JSON.stringify(payload)}`);
  }
  const data = payload.data;
  const score =
    typeof data.content_score === "number" ? data.content_score : data.score;
  return typeof score === "number" ? Math.round(score) : null;
}

function resolveResumePath(resumeFile) {
  if (!resumeFile) return null;
  const trimmed = resumeFile.trim();
  if (!trimmed) return null;
  const baseDir = path.join(__dirname, "..");
  const directPath = path.resolve(baseDir, trimmed);
  if (fs.existsSync(directPath)) return directPath;
  const underTests = path.resolve(baseDir, "tests", "resumes", trimmed);
  if (fs.existsSync(underTests)) return underTests;
  return null;
}

function formatDelta(delta) {
  if (!Number.isFinite(delta)) return "n/a";
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toFixed(1)}`;
}

function parseCsv(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return [];
  const header = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cols = parseCsvLine(line);
    const row = {};
    header.forEach((key, idx) => {
      row[key] = idx < cols.length ? cols[idx] : "";
    });
    return row;
  });
}

function parseCsvLine(line) {
  const fields = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        const next = line[i + 1];
        if (next === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        fields.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
  }
  fields.push(current);
  return fields;
}

async function runCalibration() {
  const csvPath = path.join(__dirname, "..", "tests", "calibration_results.csv");
  const csvText = fs.readFileSync(csvPath, "utf8");
  const rows = parseCsv(csvText);

  const server = await startServerSafe();
  if (!server) return;
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  const results = [];

  for (const row of rows) {
    const resumePath = resolveResumePath(row.resume_file);
    if (!resumePath) {
      console.warn(`Skipping row (missing file): ${row.resume_file}`);
      continue;
    }
    const notes = (row.overall || "").trim();
    const range = parseContentRange(notes);
    if (!range) {
      console.warn(`Skipping row (no content range in notes): ${row.resume_file}`);
      continue;
    }
    const text = fs.readFileSync(resumePath, "utf8");
    let score = null;
    try {
      score = await postResume(baseUrl, text);
    } catch (err) {
      console.error(`Error scoring ${row.resume_file}: ${err.message}`);
      continue;
    }
    if (score === null) {
      console.warn(`No score returned for ${row.resume_file}`);
      continue;
    }
    const expectedMid = (range.min + range.max) / 2;
    const inRange = score >= range.min && score <= range.max;
    const delta = score - expectedMid;
    results.push({
      file: row.resume_file,
      band: range.band,
      expectedMin: range.min,
      expectedMax: range.max,
      score,
      inRange,
      delta
    });
  }

  server.close();

  if (results.length === 0) {
    console.log("No resumes processed.");
    return;
  }

  console.log("Calibration results (content clarity):\n");
  for (const r of results) {
    const status = r.inRange ? "✅ in range" : "❌ drift";
    console.log(
      `${r.file}  ${r.band}  target ${r.expectedMin}–${r.expectedMax}  got ${r.score}  ${status} (delta ${formatDelta(
        r.delta
      )})`
    );
  }

  const total = results.length;
  const inRangeCount = results.filter((r) => r.inRange).length;
  const outRangeCount = total - inRangeCount;
  const avgAbsDelta =
    results.reduce((sum, r) => sum + Math.abs(r.delta), 0) / total;

  const bands = ["thin_signal", "strong_foundation", "high_bar", "rare_air"];
  const bandStats = bands.map((band) => {
    const subset = results.filter((r) => r.band === band);
    if (subset.length === 0) return { band, n: 0 };
    const avgDelta =
      subset.reduce((sum, r) => sum + r.delta, 0) / subset.length;
    const avgAbs =
      subset.reduce((sum, r) => sum + Math.abs(r.delta), 0) / subset.length;
    return { band, n: subset.length, avgDelta, avgAbs };
  });

  console.log("\nSummary:");
  console.log(`  Total resumes: ${total}`);
  console.log(`  In range: ${inRangeCount}`);
  console.log(`  Out of range: ${outRangeCount}`);
  console.log(`  Avg |delta| overall: ${avgAbsDelta.toFixed(2)}`);
  console.log("");
  for (const stat of bandStats) {
    if (stat.n === 0) {
      console.log(`  ${stat.band}: n=0`);
    } else {
      console.log(
        `  ${stat.band}: n=${stat.n}, avg delta ${formatDelta(
          stat.avgDelta
        )}, avg |delta| ${stat.avgAbs.toFixed(2)}`
      );
    }
  }

  process.exitCode = 0;
}

runCalibration().catch((err) => {
  console.error(err);
  process.exitCode = 0;
});
