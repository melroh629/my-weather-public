# 듀이 (my-weather)

듀이는 토스 앱 안에서 동작하는 날씨 미니앱입니다.
기온·강수·미세먼지 데이터에 사용자의 피드백을 더해 그 사용자에게 맞는 외출 점수를 제시합니다.

본 저장소에는 운영 코드 전체가 아닌, 설계 의도가 드러나는 일부 시그니처와 설정만 발췌해 둡니다.

진입 — 토스 앱에서 '듀이' 검색 〈여기 직접 채움: 진입 링크〉

<p align="center">
  <img src="assets/screenshots/onboarding-intro.png" width="280" />
  <img src="assets/screenshots/dashboard.png" width="280" />
</p>

## 기술 스택

Vite 5 · React 18 · TypeScript strict · Granite/Apps-in-Toss · TDS Mobile
Firebase Auth + Firestore · Vercel Functions · TanStack Query · Vitest 3 · Sentry

## 주요 기능

- 5스텝 온보딩으로 취향 시드 수집 (현재 체감 / 평소 체감 / 따뜻한 날 선호 / 싫은 날씨 / 공기질)
- 매 시간 슬롯에 좋아요/별로예요 반응을 남겨 점수 학습
- 점수 confidence 단계(`empty / average / seed_only / learning / personalized`)별 카피 분기
- 옷차림 추천과 옷차림 피드백 루프를 분리
- 위치는 Apps-in-Toss bridge → geolocation → 캐시 폴백, localStorage 30분 TTL

## 디렉토리 구조

```
my-weather-public/
├── assets/
│   ├── screenshots/   # 프리뷰 갤러리 캡처
│   └── diagrams/      # 아키텍처 다이어그램 (예정)
├── code-excerpts/
│   ├── score/         # 점수 엔진 입출력 계약, 온보딩 설문
│   ├── hooks/         # 반응 훅, 위치 캐시
│   ├── api/           # 기상청 프록시
│   └── quality/       # ESLint, Vitest, CI 설정
└── docs/              # 결정 기록 (작성 중)
```

## 라이센스

MIT
