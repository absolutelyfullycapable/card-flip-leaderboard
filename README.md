# ♣️ Card Flip Leaderboard

HTML / CSS / Vanilla JS로 만든 **카드 짝 맞추기 게임**입니다.  
클리어 기록은 **Supabase** `scores` 테이블에 저장되며, Top 10 리더보드로 표시됩니다.

배포용 저장소: [absolutelyfullycapable/card-flip-leaderboard](https://github.com/absolutelyfullycapable/card-flip-leaderboard)

---

## 주요 기능

- 플레이어 이름 입력 후 게임 시작
- 4×4 보드 카드 뒤집기 · 짝 맞추기
- 시간 · 시도 횟수 · 남은 짝 표시
- 이름 중복 검사 (이미 등록된 이름은 사용 불가)
- 클리어 후 리더보드 기록 저장 (Top 10)
- 클리어 화면 버튼
  - **기록 저장** · 현재 결과 저장
  - **한 판 더** · 저장 전이면 같은 이름으로 바로 재시작 / 저장 후면 새 이름 입력
  - **처음으로** · 이름 입력 화면부터 다시 시작
- 순위: `time_ms` 오름차순 → 같으면 `moves` 오름차순

---

## 폴더 구조

```
.
├── index.html           # UI (시작/클리어 모달, 보드, 리더보드)
├── style.css            # Pretendard 기반 스타일
├── script.js            # 게임 로직 · Supabase 연동
├── config.example.js    # config.js 템플릿
├── .env.example         # 환경 변수 예시
├── generate-config.js   # 환경 변수 → config.js 생성
├── package.json         # npm run build
├── vercel.json          # Vercel 빌드 설정
└── .gitignore           # config.js · .env 제외
```

---

## 사전 준비 (Supabase)

1. Supabase 프로젝트 생성
2. `scores` 테이블 예시 컬럼
   - `id` (int8, PK)
   - `player_name` (text)
   - `time_ms` (int4)
   - `moves` (int4)
   - `created_at` (timestamptz)
3. RLS 정책
   - `SELECT`: 공개 조회 허용
   - `INSERT`: anon 삽입 허용
   - `UPDATE` / `DELETE`: 차단 권장
4. **Project Settings → API**에서
   - Project URL
   - **Publishable key** (Secret key는 사용하지 마세요)

---

## 로컬 실행

### 방법 A — `config.js` 직접 작성

```bash
cp config.example.js config.js
# config.js에 url · anonKey(Publishable key) 입력

python3 -m http.server 8720
# http://127.0.0.1:8720
```

### 방법 B — `.env`로 `config.js` 생성

```bash
cp .env.example .env
# .env에 SUPABASE_URL · SUPABASE_ANON_KEY 입력

npm run build
python3 -m http.server 8720
```

`config.js`와 `.env`는 Git에 올라가지 않습니다.

---

## Vercel 배포

GitHub에는 키를 올리지 않고, Vercel 환경 변수로 빌드 시 `config.js`를 생성합니다.

1. 이 저장소를 Vercel에 Import
2. **Environment Variables** 등록

| Name | Value |
|------|--------|
| `SUPABASE_URL` | Project URL |
| `SUPABASE_ANON_KEY` | Publishable key |

3. Deploy  
   - 빌드 명령: `npm run build` (`generate-config.js` 실행)

---

## 보안 메모

- **Publishable key**는 브라우저용이라 프론트에 포함됩니다. 진짜 보호는 **RLS**로 합니다.
- **Secret key / service_role**은 절대 프론트·Git·Vercel 공개 환경에 넣지 마세요.
- 클라이언트에서 보내는 점수는 조작될 수 있으므로, 학습용 MVP 기준으로 RLS로 조회·수정 범위만 제한합니다.

---

## 기술 스택

- HTML / CSS / JavaScript
- [Supabase](https://supabase.com/) (Postgres + JS SDK CDN)
- [Pretendard](https://github.com/orioncactus/pretendard)
- Vercel (정적 배포)
