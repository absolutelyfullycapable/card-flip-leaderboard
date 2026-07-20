# Card Flip Leaderboard 👩🏻‍💻

> [요즘 바이브 코딩 커서 AI 30가지 프로그램 만들기](https://product.kyobobook.co.kr/detail/S000217462860) 리더보드가 있는 카드 뒤집기 게임 만들기 실습

HTML / CSS / Vanilla JS로 만든 카드 짝 맞추기 게임입니다.  
클리어 기록은 Supabase `scores` 테이블에 저장되며, Top 10 리더보드로 표시됩니다.

---

## 주요 기능

- 이름 입력 후 시작 · 이름 중복 검사
- 4×4 보드 카드 뒤집기 · 짝 맞추기
- 시간 · 시도 횟수 · Top 10 리더보드 · 기록 저장
- 클리어 후 · `기록 저장` · `한 판 더` · `처음으로`
- 순위 · `time_ms` 오름차순 → 같으면 `moves` 오름차순

---

## 폴더 구조

```
card-flip-leaderboard/
├── index.html           # 시작·클리어 모달 · 보드 · 리더보드 UI
├── style.css            # Pretendard · 아케이드 보드 스타일
├── script.js            # 카드 짝 맞추기 · 이름 중복 검사 · 점수 저장
├── config.example.js    # config.js 템플릿
├── .env.example         # SUPABASE_URL · SUPABASE_ANON_KEY 예시
├── generate-config.js   # 환경 변수로 config.js 생성 (Vercel 빌드)
├── package.json
├── vercel.json
└── .gitignore           # config.js · .env 제외
```

---

## 실행 방법

```bash
# 방법 A) config.js 직접 설정
cp config.example.js config.js
# config.js에 Project URL · Publishable key 입력

# 방법 B) .env로 config.js 생성
cp .env.example .env
# .env에 SUPABASE_URL · SUPABASE_ANON_KEY 입력
npm run build

# 로컬 서버로 열기
python3 -m http.server 8720
# http://127.0.0.1:8720 접속
```

---

## 참고

- **실습 기록** · [CursorAI-study](https://github.com/absolutelyfullycapable/CursorAI-study)
- **저자** · 박현규
- **출판** · 골든래빗(주), 2025
