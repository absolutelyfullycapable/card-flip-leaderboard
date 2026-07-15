/**
 * 환경 변수로 config.js 를 생성합니다.
 *
 * 필요 변수:
 *   SUPABASE_URL
 *   SUPABASE_ANON_KEY  (Publishable key)
 *
 * 로컬: .env 에 값을 넣고 `npm run build` 또는 `node generate-config.js`
 * Vercel: Project Settings → Environment Variables 에 동일 키 등록 후 배포
 */
const fs = require("fs");
const path = require("path");

function loadDotEnv() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function escapeForJsString(value) {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r");
}

loadDotEnv();

const url = process.env.SUPABASE_URL || "";
const anonKey =
  process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || "";

if (!url || !anonKey) {
  console.error(
    "[generate-config] SUPABASE_URL / SUPABASE_ANON_KEY 환경 변수가 필요합니다."
  );
  console.error(
    "로컬: .env 파일을 만들거나, Vercel Environment Variables를 설정하세요."
  );
  process.exit(1);
}

const content = `/**
 * 자동 생성 파일 — 직접 수정하거나 Git에 커밋하지 마세요.
 * 생성: node generate-config.js / npm run build
 */
window.SUPABASE_CONFIG = {
  url: '${escapeForJsString(url)}',
  anonKey: '${escapeForJsString(anonKey)}',
};
`;

const outPath = path.join(__dirname, "config.js");
fs.writeFileSync(outPath, content, "utf8");
console.log(`[generate-config] wrote ${outPath}`);
