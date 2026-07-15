/**
 * Supabase 설정 템플릿 (이 파일은 커밋해도 됩니다)
 *
 * [로컬 A] 이 파일을 복사해 config.js 로 저장 후 값 입력
 * [로컬 B] .env.example → .env 복사 후 `npm run build` 로 config.js 생성
 * [Vercel] Environment Variables에 SUPABASE_URL, SUPABASE_ANON_KEY 등록
 *          → 빌드 시 generate-config.js 가 config.js 를 만듭니다
 *
 * 키 위치: Supabase Dashboard → Project Settings → API
 * - url / SUPABASE_URL           : Project URL
 * - anonKey / SUPABASE_ANON_KEY  : Publishable key
 *
 * 주의:
 * - Secret key 는 절대 넣지 마세요
 * - Publishable key는 브라우저에 보일 수 있으므로 RLS로 보호하세요
 * - config.js / .env 는 gitignore 대상입니다
 */
window.SUPABASE_CONFIG = {
  url: "https://YOUR_PROJECT_REF.supabase.co",
  anonKey: "YOUR_SUPABASE_ANON_KEY",
};
