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

## 기술 스택

- HTML / CSS / JavaScript
- [Supabase](https://supabase.com/) (Postgres + JS SDK CDN)
- [Pretendard](https://github.com/orioncactus/pretendard)
- Vercel (정적 배포)
