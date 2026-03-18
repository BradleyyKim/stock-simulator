# 교육용 모의투자 시뮬레이션 — 프로젝트 명세서

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **프로젝트명** | 교육용 모의투자 시뮬레이션 |
| **목적** | 고등학교 창체 동아리 수업용 턴제 모의투자 프로그램 |
| **대상** | 고등학생 ~15명 (개인전) |
| **수업 구성** | 10차시 × 2시간 |
| **라운드 구성** | 20분 × 5~6라운드/차시 |
| **디바이스** | 갤럭시 탭, 휴대폰 (반응형 필수) |
| **배포** | Firebase Hosting (무료) |

---

## 2. 핵심 설계 원칙

1. **턴제 시장** — 관리자가 라운드를 넘겨야만 상태 변경
2. **학생 / 관리자 화면 완전 분리**
3. **교사가 시장을 통제** — 가격 조정, 힌트 공개, 거래 마감
4. **단순한 UX** — 한 번 설명으로 바로 사용 가능
5. **안정성 우선** — 수업 현장에서 안 터지는 것이 중요

---

## 3. 기술 스택

| 레이어 | 기술 | 선정 이유 |
|--------|------|-----------|
| 프론트엔드 | React 18 + Vite + TypeScript | 현업 기술 스택 |
| 상태관리 | Zustand | 경량, 보일러플레이트 최소 |
| 차트 | Lightweight Charts (TradingView) | Canvas 기반 캔들스틱 최적 |
| 백엔드/DB | Firebase Realtime DB | 서버 관리 불필요, 실시간 동기화, 무료 |
| 스타일 | Tailwind CSS | 반응형 대응 용이 |
| 호스팅 | Firebase Hosting | 무료, HTTPS 자동 |

---

## 4. 확정된 설계 결정사항

| 번호 | 항목 | 확정 내용 |
|------|------|-----------|
| 1 | 학생 인증 | 이름 드롭다운 + 휴대폰 뒷자리 4자리 PIN |
| 2 | 거래 횟수 | 기본 제한 없음. config에서 변경 가능하게 설정 |
| 3 | 시나리오 입력 | 미리 만들어두고 불러서 사용. 오류 방지 |
| 4 | 차시별 데이터 | 최종 결과값만 저장 |
| 5 | 정보 구매 | 1차 오프라인, 이후 앱 내 구현 |
| 6 | 순위판 | 교사 on/off 가능 |

---

## 5. 거래 규칙

- 매수/매도 모두 가능, 주(株) 단위
- 현금 부족 시 매수 불가
- 보유수량 부족 시 매도 불가
- 라운드 마감 후 주문 불가
- 해당 라운드 가격 기준 체결
- 공매도, 레버리지, 대출 없음 (9차시 체험은 별도)
- 종목 공급량 무제한 (동시성 이슈 제거)

---

## 6. Firebase DB 구조

```
root/
├── game/
│   ├── currentRound: number
│   ├── totalRounds: number
│   ├── phase: "waiting" | "trading" | "paused" | "reviewing" | "ended"
│   ├── startingCash: number
│   ├── leaderboardVisible: boolean
│   ├── scenarioId: string | null
│   ├── roundDuration: number
│   ├── maxOrdersPerRound: number
│   └── session: number
│
├── stocks/{stockId}/
│   ├── id, name, sector
│   ├── currentPrice, previousPrice
│   └── priceHistory: PricePoint[]
│
├── hints/
│   ├── hint1, hint2, hint3: string
│   └── visibleHints: number (0~3)
│
├── players/{playerId}/
│   ├── id, name, pinLast4
│   ├── cash: number
│   ├── holdings: { stockId: quantity }
│   ├── totalAssets: number
│   └── isOnline: boolean
│
├── orders/{orderId}/
│   ├── playerId, playerName, stockId
│   ├── type: "buy" | "sell"
│   ├── quantity, price, round
│   ├── timestamp, status
│
└── sessionResults/  (Phase 3)
```

---

## 7. 개발 로드맵

### Phase 1: MVP ✅ 완료

- 학생 로그인 (이름 + PIN)
- 종목 현황 + 캔들스틱 차트
- 매수/매도 (현금/보유량 검증)
- 포트폴리오 + 순위판
- 힌트 1/2/3단계 순차 공개
- 관리자 라운드 제어 + 학생 현황
- 시나리오 기반 가격 반영
- 순위판 on/off
- Firebase 실시간 동기화

### Phase 2: 정보 시스템 (미구현)

- 비밀정보 코드 앱 내 구매
- 정보 구매 비용 자동 차감
- 종목별 거래량 표시

### Phase 3: 글로벌 시장 / 고급 기능 (미구현)

- 미국 시장 종목 + 환율 시스템
- ETF 생성
- 공매도/선물 (선택)
- 차시별 결과 저장/export
- 누적 리그 순위

---

## 8. 10차시 커리큘럼

| 차시 | 주제 | 핵심 기능 | Phase |
|------|------|----------|-------|
| 1 | 모의 시장 입문 | 종목 3개, 연습 라운드 | 1 |
| 2 | 뉴스와 주가 | 힌트 1/2/3단계 시작 | 1 |
| 3 | 산업 구조 이해 | 종목 5개, 다양한 이벤트 | 1 |
| 4 | 정보 비대칭 | 비밀정보 코드 도입 | 2 |
| 5 | 리스크 관리 | 변동성 이벤트, 분산투자 | 2 |
| 6 | 군중 심리 | 거래량 공개, 순위판 on/off | 2 |
| 7 | 미국 시장 도입 | 미국 종목, 환율 | 3 |
| 8 | 환율 충격 | 환율 변동 이벤트 | 3 |
| 9 | 파생상품 체험 | 공매도/선물 (선택) | 3 |
| 10 | ETF + 최종 리그 | ETF 제작, 최종 순위 | 3 |

---

## 9. AI 분석 비교 (참고)

| 주제 | ChatGPT | Gemini | Claude |
|------|---------|--------|--------|
| 구현 방식 | 구글시트+폼 → 웹앱 | React 클라이언트 only | React + Firebase BaaS |
| 차트 | 없음 | Lightweight Charts | Lightweight Charts ✅ |
| 상태관리 | 없음 | Zustand | Zustand ✅ |
| 주가 엔진 | 교사 수동 | GBM + Jump Diffusion | 시나리오 기반 (GBM 불필요) |
| 백엔드 | Firebase 언급 | localStorage only | Firebase Realtime DB ✅ |

**채택 결과:** React + Firebase + Zustand + Lightweight Charts + Tailwind

---

## 10. 참고 링크

- 런닝맨 레퍼런스: https://youtu.be/8IyCPgwrJ24
- Lightweight Charts: https://github.com/nicholasgasior/lightweight-charts
- Firebase Realtime DB: https://firebase.google.com/docs/database
- Zustand: https://github.com/pmndrs/zustand

---

*최종 수정일: 2026-03-18*
