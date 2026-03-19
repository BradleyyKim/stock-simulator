# Claude Code 프로젝트 컨텍스트

## 프로젝트 개요
- 교육용 모의투자 시뮬레이션 웹앱 (고등학교 창체 동아리용)
- ~15명 학생이 갤럭시 탭/폰으로 참여, 교사가 관리자 대시보드에서 라운드 제어
- 턴제 시장: 관리자가 라운드 시작 → 힌트 1/2/3 공개 → 거래 마감 → 결과 반영

## 기술 스택
- React 18 + Vite + TypeScript
- Firebase Realtime DB (BaaS)
- Zustand (상태관리)
- Lightweight Charts (TradingView 캔들스틱)
- Tailwind CSS
- Vercel 배포

## 현재 완료된 기능 (Phase 1)
- 학생 로그인 (이름 드롭다운 + 4자리 PIN)
- 종목 현황 + 캔들스틱 차트 (5종목: AI, 에너지, 바이오, 반도체, 게임)
- 매수/매도 주문 (현금/보유량 검증)
- 포트폴리오 + 순위판 (on/off 가능)
- 힌트 3단계 순차 공개 (뉴스 형태로 개편 완료)
- 관리자 라운드 제어 + 학생 현황
- 시나리오 기반 가격 반영 (라운드 종료 시 일괄 적용)
- Firebase 실시간 동기화
- 학생 화면 팝업 알림 (라운드 시작/힌트 공개/거래 마감)
- 결과 반영 후 "뉴스 정답 분석" 표시 기능

## 최근 작업 내역

### 완료된 작업
1. **OrderForm 버그 수정**: `currentPlayer.holdings?.[stock.id] || 0` (optional chaining)
2. **playerStore 버그 수정**: `Object.entries(player.holdings || {})` (Firebase null 대응)
3. **tsconfig.node.json 수정**: `composite: true`, `noEmit: false` 추가
4. **학생 팝업 알림 구현**: `GameEventNotification` 컴포넌트 생성
   - 파일: `src/components/Student/GameEventNotification.tsx`
   - StudentView.tsx에 통합, phase/hints 변화 감지
5. **시나리오 데이터 전면 개편** (방금 완료):
   - 직관적 힌트 → 간접적 뉴스 형태로 변경
   - 각 라운드에 `analysis` (뉴스 정답 분석) 추가
   - 일부 라운드에 반전 요소 포함
   - HintPanel: "1단계 힌트" → "속보/추가 보도/긴급 속보"로 라벨 변경
   - reviewing 단계에서 분석 표시

### 변경된 파일 목록 (시나리오 개편)
- `src/types/index.ts` - ScenarioRound에 `analysis?: string` 추가
- `src/store/gameStore.ts` - HintState에 `analysis: string` 추가
- `src/data/scenarios.ts` - 전면 재작성 (간접 뉴스 + 반전 + 분석)
- `src/components/Student/HintPanel.tsx` - 뉴스 라벨 변경 + reviewing시 분석 표시
- `src/components/Admin/RoundControl.tsx` - 거래 마감 시 analysis 설정, 라운드 시작 시 초기화

### 아직 타입 체크 미완료
- Bash 도구의 working directory 문제로 `npx tsc --noEmit` 실행 불가
- stock-simulator 폴더에서 Claude Code 재실행 후 빌드 확인 필요

## 미구현 (향후)
- Phase 2: 비밀정보 코드 앱 내 구매, 거래량 표시
- Phase 3: 미국 시장 + 환율, ETF, 공매도/선물, 세션 결과 저장

## 주요 설계 결정
- 가격 변동은 힌트 공개 시가 아닌 "거래 마감 및 결과 반영" 시 일괄 적용
- 힌트는 3단계까지만 (4단계 없음)
- 종목 공급량 무제한 (동시성 이슈 제거)
- 공매도/레버리지/대출 없음

## 프로젝트 문서
- `docs/PROJECT-SPEC.md` - 프로젝트 명세서
- `docs/OPERATION-GUIDE.md` - 운영 가이드
- `docs/CHAT-LOG-ARCHIVE.md` - 기획 대화 아카이브
