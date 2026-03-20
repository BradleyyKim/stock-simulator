# 모의투자 시뮬레이션 - 기술 아키텍처 문서

---

## 1. 프로젝트 구조

```
stock-simulator/
├── docs/                          # 프로젝트 문서
│   ├── README.md                  # docs 폴더 안내
│   ├── PROJECT-SPEC.md            # 프로젝트 명세서 (기획/설계)
│   ├── OPERATION-GUIDE.md         # 운영 가이드 (교사용)
│   ├── ARCHITECTURE.md            # 기술 아키텍처 (본 문서)
│   ├── CHAT-LOG-ARCHIVE.md        # 기획 대화 요약 아카이브
│   └── addRequirement.md          # 추가 요구사항 메모 (기획 리뷰)
├── src/
│   ├── App.tsx                    # 라우터 + 스토어 구독 초기화
│   ├── main.tsx                   # React 진입점
│   ├── index.css                  # Tailwind + 커스텀 유틸리티
│   ├── vite-env.d.ts
│   ├── types/
│   │   └── index.ts               # 전체 TypeScript 타입 정의
│   ├── lib/
│   │   └── firebase.ts            # Firebase 초기화 + DB 참조 헬퍼
│   ├── data/
│   │   └── scenarios.ts           # 시나리오 데이터 + 종목 초기값
│   ├── store/
│   │   ├── gameStore.ts           # 게임 상태 (phase, round, hints)
│   │   ├── stockStore.ts          # 종목 데이터 (가격, OHLC 히스토리)
│   │   ├── playerStore.ts         # 플레이어 (포트폴리오, 로그인, 자산)
│   │   └── orderStore.ts          # 주문 처리 (매수/매도)
│   ├── pages/
│   │   ├── LoginPage.tsx          # 로그인 페이지 (/)
│   │   ├── StudentView.tsx        # 학생 메인 화면 (/student)
│   │   └── AdminView.tsx          # 관리자 대시보드 (/admin)
│   ├── components/
│   │   ├── Student/
│   │   │   ├── StockList.tsx      # 종목 목록 (현재가, 등락률)
│   │   │   ├── StockDetail.tsx    # 종목 상세 모달 (차트 + 주문)
│   │   │   ├── StockChart.tsx     # 캔들스틱 차트 (lightweight-charts)
│   │   │   ├── OrderForm.tsx      # 주문 폼 (미사용, StockDetail에 통합)
│   │   │   ├── Portfolio.tsx      # 포트폴리오 (보유종목 + 자산 차트)
│   │   │   ├── AssetChart.tsx     # 자산 추이 라인 차트
│   │   │   ├── Leaderboard.tsx    # 순위판 (수익률 기준)
│   │   │   ├── HintPanel.tsx      # 뉴스/힌트 패널 (3단계)
│   │   │   └── GameEventNotification.tsx  # 이벤트 팝업 알림
│   │   ├── Admin/
│   │   │   ├── RoundControl.tsx       # 라운드 제어 (시작/마감/다음)
│   │   │   ├── ScenarioSelector.tsx   # 시나리오 선택기
│   │   │   ├── StudentStatusList.tsx  # 학생 현황 테이블
│   │   │   └── LeaderboardControl.tsx # 순위판 공개/비공개 토글
│   │   └── UI/
│   │       ├── Button.tsx         # 공통 버튼 (6개 variant)
│   │       ├── Card.tsx           # 카드 컨테이너
│   │       ├── Badge.tsx          # 상태 뱃지 (등락/phase)
│   │       ├── Modal.tsx          # 모달 오버레이
│   │       └── TabBar.tsx         # 하단 탭 네비게이션
│   └── utils/
│       ├── format.ts              # 숫자/통화/퍼센트 포맷터
│       └── cn.ts                  # Tailwind 클래스 병합 유틸
├── CLAUDE.md                      # Claude Code 프로젝트 컨텍스트
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── .env.local                     # Firebase 환경변수 (비공개)
```

---

## 2. 기술 스택 상세

| 레이어 | 기술 | 버전 | 역할 |
|--------|------|------|------|
| 프론트엔드 | React | 18.3 | UI 렌더링 |
| 빌드 | Vite | 6.0 | 번들링, HMR, 개발서버 |
| 언어 | TypeScript | 5.6 | 타입 안전성 |
| 라우팅 | react-router-dom | 6.21 | SPA 라우팅 (/, /student, /admin) |
| 상태관리 | Zustand | 4.4 | 4개 스토어로 전역 상태 관리 |
| 차트 | lightweight-charts | 4.1 | 캔들스틱(OHLC) + 라인 차트 |
| 백엔드/DB | Firebase Realtime DB | 10.7 | 실시간 데이터 동기화 |
| 스타일 | Tailwind CSS | 3.4 | 유틸리티 기반 반응형 스타일 |
| 아이콘 | lucide-react | 0.294 | 종목/UI 아이콘 |
| 유틸 | clsx + tailwind-merge | - | 조건부 클래스 병합 |

---

## 3. 핵심 타입 정의

```typescript
// 게임 상태
type GamePhase = "waiting" | "trading" | "paused" | "reviewing" | "ended";

interface GameConfig {
  currentRound: number;       // 현재 라운드 (0부터 시작)
  totalRounds: number;        // 총 라운드 수 (기본 6)
  phase: GamePhase;
  startingCash: number;       // 초기 자금 (100,000원)
  leaderboardVisible: boolean;
  scenarioId: string | null;
  session: number;
}

// 종목
interface Stock {
  id: string;                 // "ai" | "energy" | "bio" | "semi" | "game"
  name: string;
  sector: string;
  currentPrice: number;
  previousPrice: number;
  priceHistory: PricePoint[];
}

interface PricePoint {
  round: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

// 플레이어
interface Player {
  id: string;
  name: string;
  pinLast4: string;
  cash: number;
  holdings: Record<string, number>;  // { stockId: quantity }
  totalAssets: number;
  assetHistory: AssetSnapshot[];
  isOnline: boolean;
}

interface AssetSnapshot {
  round: number;
  totalAssets: number;
}

// 주문
interface Order {
  id: string;
  playerId: string;
  playerName: string;
  stockId: string;
  type: "buy" | "sell";
  quantity: number;
  price: number;
  round: number;
  timestamp: number;
  status: "filled" | "cancelled";
}

// 시나리오
interface Scenario {
  id: string;
  name: string;
  description: string;
  rounds: ScenarioRound[];
}

interface ScenarioRound {
  round: number;
  news: string;               // 라운드 종료 후 발표되는 뉴스
  hint1: string;              // 속보
  hint2: string;              // 추가 보도
  hint3: string;              // 긴급 속보
  analysis?: string;          // 뉴스 정답 분석 (reviewing 시 표시)
  priceChanges: Record<string, number>; // { stockId: changeRate }
}
```

---

## 4. Zustand 스토어 아키텍처

### 4.1 데이터 흐름 다이어그램

```
Firebase Realtime DB
     |
     | onValue (실시간 리스너)
     v
┌─────────────────────────────────────────────────┐
│              Zustand Stores                      │
│                                                  │
│  gameStore ──── phase, round, hints, config      │
│  stockStore ─── 5개 종목 가격 + OHLC 히스토리     │
│  playerStore ── 전체 플레이어 + 로그인 유저        │
│  orderStore ─── 주문 내역 + 주문 실행 로직        │
│                                                  │
└──────────┬──────────────────────────┬────────────┘
           │                          │
           v                          v
    StudentView                  AdminView
    (종목/포트폴리오/순위)       (라운드제어/학생현황)
```

### 4.2 스토어별 책임

| 스토어 | 상태 | 주요 액션 |
|--------|------|----------|
| **gameStore** | config, hints, isLoading | subscribe, startRound, endRound, nextRound, revealNextHint, resetCurrentRound, toggleLeaderboard |
| **stockStore** | stocks, isLoading | subscribe, initializeStocks, updatePrice, applyPriceChanges |
| **playerStore** | currentPlayer, players, isLoading | subscribe, login, logout, initializePlayers, updatePlayerCash, updatePlayerHolding, recalculateAllAssets, resetAllPlayers |
| **orderStore** | orders, isLoading | subscribe, submitOrder, getPlayerOrders, getRoundOrders, clearOrders |

### 4.3 스토어 간 상호작용

```
[관리자: 거래 마감 클릭]
     │
     ├── stockStore.applyPriceChanges()   → 시나리오 변동률로 가격 갱신
     ├── playerStore.recalculateAllAssets() → 전체 플레이어 자산 재계산
     └── gameStore.endRound()              → phase='reviewing', analysis 설정

[학생: 매수/매도 주문]
     │
     └── orderStore.submitOrder()
          ├── playerStore.updatePlayerCash()     → 현금 증감
          ├── playerStore.updatePlayerHolding()   → 보유수량 변경
          └── playerStore.recalculateTotalAssets() → 해당 학생 자산 재계산
```

---

## 5. Firebase DB 구조

```
root/
├── game/                          # GameConfig (단일 객체)
│   ├── currentRound: number
│   ├── totalRounds: number
│   ├── phase: GamePhase
│   ├── startingCash: number
│   ├── leaderboardVisible: boolean
│   ├── scenarioId: string | null
│   └── session: number
│
├── stocks/{stockId}/              # Stock 객체
│   ├── id, name, sector
│   ├── currentPrice, previousPrice
│   └── priceHistory: PricePoint[]
│
├── hints/                         # 현재 라운드 힌트 (단일 객체)
│   ├── hint1, hint2, hint3: string
│   ├── visibleHints: number (0~3)
│   └── analysis: string
│
├── players/{playerId}/            # Player 객체
│   ├── id, name, pinLast4
│   ├── cash: number
│   ├── holdings: { stockId: quantity }
│   ├── totalAssets: number
│   ├── assetHistory: AssetSnapshot[]
│   └── isOnline: boolean
│
├── orders/{orderId}/              # Order 객체
│   ├── playerId, playerName, stockId
│   ├── type, quantity, price, round
│   ├── timestamp, status
│
└── sessionResults/                # (Phase 3, 미구현)
```

**dbRefs 헬퍼** (`src/lib/firebase.ts`):

| 헬퍼 | Firebase 경로 |
|------|---------------|
| `dbRefs.game()` | `/game` |
| `dbRefs.stocks()` | `/stocks` |
| `dbRefs.stock(id)` | `/stocks/{id}` |
| `dbRefs.players()` | `/players` |
| `dbRefs.player(id)` | `/players/{id}` |
| `dbRefs.orders()` | `/orders` |
| `dbRefs.hints()` | `/hints` |
| `dbRefs.sessionResults()` | `/sessionResults` |

---

## 6. 라우트 및 페이지 구조

### 6.1 라우트 맵

| 경로 | 컴포넌트 | 용도 | 인증 |
|------|---------|------|------|
| `/` | LoginPage | 학생 로그인 | 없음 |
| `/student` | StudentView | 학생 거래/포트폴리오 | 이름 + PIN |
| `/admin` | AdminView | 관리자 대시보드 | PIN 고정값 |

### 6.2 StudentView 구조

```
StudentView
├── Header (이름, 현금, 라운드/상태 뱃지, 로그아웃)
├── HintPanel (뉴스 3단계 / reviewing시 분석)
├── TabBar 콘텐츠 (하단 탭으로 전환)
│   ├── [종목] StockList → StockDetail(Modal)
│   │                       ├── StockChart (캔들스틱)
│   │                       └── 주문폼 (매수/매도)
│   ├── [포트폴리오] Portfolio
│   │                ├── 자산 요약 카드
│   │                ├── AssetChart (자산 추이)
│   │                └── 보유종목 리스트
│   └── [순위] Leaderboard (수익률 순위)
├── GameEventNotification (오버레이 팝업)
└── TabBar (하단 고정 네비게이션)
```

### 6.3 AdminView 구조

```
AdminView
├── PIN 인증 게이트 (930919)
├── Header (세션/라운드 표시)
├── 학생 등록 (textarea 일괄 입력)
├── 3-Column Grid
│   ├── ScenarioSelector (시나리오 선택 + 초기화)
│   ├── RoundControl (라운드 시작/힌트 공개/마감/다음)
│   ├── LeaderboardControl (순위판 토글)
│   └── StudentStatusList (전체 학생 현황 테이블)
```

---

## 7. 게임 라이프사이클

### 7.1 Phase 상태 전이

```
                    startRound()
    waiting ──────────────────────> trading
       ^                              │
       │                    revealNextHint() (1→2→3)
       │                              │
       │         nextRound()          │  endRound()
       └──────────── reviewing <──────┘
                         │
                    (마지막 라운드면)
                         │
                         v
                       ended
```

### 7.2 라운드 진행 상세 플로우

```
1. [Admin] 시나리오 선택
   → stockStore.initializeStocks()  (종목 가격 초기화)
   → playerStore.resetAllPlayers()  (학생 자산 리셋)
   → gameStore.updateConfig()       (round=0, phase='waiting')

2. [Admin] "라운드 N 시작" 클릭
   → gameStore.startRound()         (round++, phase='trading')
   → 시나리오에서 해당 라운드 힌트 로드
   → [Student] GameEventNotification 팝업

3. [Admin] "힌트 1/2/3단계 공개" 클릭
   → gameStore.revealNextHint()     (visibleHints++)
   → [Student] HintPanel에 뉴스 추가 표시
   → [Student] GameEventNotification 팝업

4. [Student] 종목 클릭 → 매수/매도 주문
   → orderStore.submitOrder()       (검증 후 즉시 체결)
   → playerStore 현금/보유량 갱신

5. [Admin] "거래 마감 및 결과 반영" 클릭
   → stockStore.applyPriceChanges() (시나리오 변동률 적용)
   → playerStore.recalculateAllAssets() (자산 재계산 + 스냅샷)
   → gameStore.endRound()           (phase='reviewing', analysis)
   → [Student] 결과 확인 + 뉴스 정답 분석

6. [Admin] "다음 라운드 준비" 클릭
   → gameStore.nextRound()          (phase='waiting')
   → (2번으로 반복)
```

---

## 8. 주요 컴포넌트 상세

### 8.1 StockDetail (종목 상세 + 주문)

- 종목 헤더 (아이콘, 현재가, 등락률)
- StockChart: lightweight-charts 캔들스틱 (200px)
- 주문폼: 매수/매도 토글, +/- 수량 조절, 최대 수량 자동 계산
- 주문 검증: phase='trading' 확인, 수량 유효성, 현금/보유량 체크
- 체결 시 0.8초 후 메시지 자동 클리어

### 8.2 HintPanel (뉴스 패널)

- trading/paused 상태: visibleHints 수에 따라 1~3개 뉴스 카드 표시
  - 1단계: 황색 (속보)
  - 2단계: 주황 (추가 보도)
  - 3단계: 빨강 (긴급 속보)
- reviewing 상태: 남색 분석 박스 ("뉴스 정답 분석")
- 기타 상태: 숨김

### 8.3 GameEventNotification (팝업 알림)

- 전체 화면 오버레이, 2.5초 자동 소멸 + 300ms 페이드 아웃
- 4가지 알림 유형:
  - 라운드 시작 (초록)
  - 힌트 공개 (호박색)
  - 거래 마감 (빨강)
  - 라운드 종료 (파랑)

### 8.4 Leaderboard (순위판)

- leaderboardVisible 플래그에 따라 공개/비공개
- 현재 주가 기준 총자산 실시간 계산
- 수익률(%) 기준 정렬
- 1/2/3위 메달 표시, 본인 행 하이라이트

---

## 9. 종목 데이터 (초기값)

| ID | 종목명 | 초기가격 | 섹터 | 테마색 |
|----|--------|---------|------|--------|
| `ai` | 인공지능 | 10,000원 | AI | blue |
| `energy` | 에너지 | 8,000원 | Energy | amber |
| `bio` | 바이오 | 12,000원 | Bio | green |
| `semi` | 반도체 | 15,000원 | Semi | purple |
| `game` | 게임 | 9,000원 | Game | pink |

---

## 10. 주요 설계 결정 및 근거

| 결정 | 근거 |
|------|------|
| 클라이언트 사이드 주문 처리 (서버 검증 없음) | ~15명 소규모, 교육용이므로 악의적 조작 가능성 낮음 |
| 가격 변동은 거래 마감 시 일괄 적용 | 힌트 공개 시 즉시 반영하면 선매수 문제 발생 |
| 종목 공급량 무제한 | 동시성 이슈 제거, 구현 단순화 |
| Firebase Realtime DB 선택 | 서버 관리 불필요, 실시간 동기화, 무료 티어 충분 |
| 시나리오 하드코딩 | Phase 1에서는 오류 방지 우선, 관리자 편집은 Phase 2에서 검토 |
| 관리자 PIN 하드코딩 | 내부 수업 전용, 보안 요구사항 낮음 |
| OrderForm.tsx 미사용 | StockDetail 모달 내에 주문 UI 통합됨 (리팩토링 대상) |

---

## 11. 개발 환경 설정

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프리뷰
npm run preview
```

**환경 변수** (`.env.local`):
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DATABASE_URL=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

---

*최종 수정일: 2026-03-20*
