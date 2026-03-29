# 업무 체크리스트

> 최종 업데이트: 2026-03-23
> 상세 분석: `REQUIREMENTS-ANALYSIS.md` 참고
> 원본 메모: `addRequirement.md` (기획 리뷰 원본, 아카이브)

---

## Phase 1: MVP (완료)

- [x] 학생 로그인 (이름 드롭다운 + 4자리 PIN)
- [x] 종목 현황 + 캔들스틱 차트 (5종목)
- [x] 매수/매도 주문 (현금/보유량 검증)
- [x] 포트폴리오 + 자산 추이 그래프
- [x] 순위판 (on/off 가능)
- [x] 힌트 3단계 순차 공개 (속보/추가 보도/긴급 속보)
- [x] 관리자 라운드 제어 + 학생 현황
- [x] 시나리오 기반 가격 반영
- [x] Firebase 실시간 동기화
- [x] 학생 팝업 알림 (라운드 시작/힌트 공개/거래 마감)
- [x] 뉴스 정답 분석 (reviewing 단계)
- [x] 종목별 아이콘 표시
- [x] 종목 클릭 시 차트 표시
- [x] 라운드별 금액 누적
- [x] 자산 변화 그래프
- [x] 라운드 초기화 버튼 + 학생 뉴스 클리어

---

## Phase 2: 핵심 시스템 확장 (진행 중)

### R1. 차시별 자산 누적 + 라운드 용돈
- [x] `GameConfig`에 `roundAllowance` 추가 (Admin 설정 가능)
- [x] 라운드 시작 시 전체 학생에 용돈 자동 지급
- [x] Admin 게임 설정에서 용돈 금액 조절 가능
- [x] ScenarioSelector에 "이전 자산 이어서 시작" 체크박스

### R2. 경연대회 모드 (마지막 2차시)
- [x] 시나리오 선택 시 리셋/이어서 시작 선택 가능 (R1 체크박스로 해결)
- [ ] `GameConfig`에 `isCompetitionMode` 플래그 추가 (선택)
- [ ] 경연대회 모드일 때 순위판 자동 비공개 → 최종 라운드에서 공개

### R3. 정보 거래소 시스템
- [x] `IntelItem` 타입 정의 (id, grade, content)
- [x] `Player.purchasedIntels` 필드 추가
- [x] `GameConfig.intelPrices` (A/B/C 등급별 가격, Admin 설정 가능)
- [x] `playerStore.purchaseIntel()` 메서드 (현금 차감 + 중복 구매 방지)
- [x] `IntelMarket.tsx` 컴포넌트 (6개 카드 그리드, 구매 확인 팝업, 내 정보 목록)
- [x] 학생 화면 하단 탭에 "거래소" 추가
- [x] `ScenarioRound.intels` 필드 (시나리오 편집에서 입력 가능)
- [ ] 기존 시나리오에 정보 거래소 콘텐츠 입력 (**광희 작업**)
- [ ] 라운드 시작 시 이전 라운드 구매 정보 초기화 여부 결정

### R5. 시나리오 CRUD 관리 (Admin)
- [x] `scenarioStore` 생성 (Firebase 기반 CRUD)
- [x] 최초 실행 시 하드코딩 시나리오 자동 시드
- [x] `ScenarioManager.tsx` (시나리오 목록 + 생성/삭제)
- [x] `ScenarioEditor.tsx` (라운드별 아코디언 편집 UI)
- [x] 라운드별 편집: 뉴스, 힌트 3개, 분석, 종목별 변동률(%), 정보 아이템 6개
- [x] 라운드 추가/삭제 기능
- [x] Admin "운영 | 설정" 탭 분리
- [x] `GameSettings.tsx` (시작 자금, 용돈, 정보 가격 설정 폼)

### R4. 개인별 종목 손익 퍼센테이지
- [ ] `Player.holdings` 구조 변경: `number` → `{ quantity, avgPrice, totalCost }`
- [ ] `orderStore.submitOrder()` 수정: 매수 시 가중 평균가 계산
- [ ] `Portfolio.tsx` 수정: 종목별 손익률(%) 표시
- [ ] `StudentStatusList.tsx` 수정: 학생별 손익 현황 추가 (선택)
- [ ] Firebase 데이터 마이그레이션 스크립트

### R9. 힌트-차트 날짜 표기 일치
- [ ] HintPanel 라벨에 라운드 번호 추가 ("Day 1 속보" 형식)
- [ ] StockChart X축과 힌트 라벨 표기 통일

### R10. 정보 없는 종목 증감율 제한
- [ ] 시나리오 편집 시 가이드라인 표시 ("뉴스 대상이 아닌 종목은 ±2% 이내 권장")
- [ ] 또는 priceChanges에 없는 종목은 자동 ±1% 랜덤 적용

---

## Phase 3: 고급 기능 (미착수)

### R6. 라운드별 회고 메모 + 최종 기록
- [ ] `RoundReflection` 타입 정의 (잘한 점, 아쉬운 점, 다짐)
- [ ] `FinalReflection` 타입 정의 (투자 전략, 배운 점, 최종 소감)
- [ ] Firebase `reflections/` 경로 추가
- [ ] `RoundReflectionForm.tsx` (reviewing 단계에서 작성)
- [ ] `FinalReflectionView.tsx` (ended 단계에서 전체 리스트 + 최종 기록)
- [ ] Admin 회고 열람 기능
- [ ] 내보내기 기능 (CSV/PDF, 입시 서류 활용)

### R7. 원/달러 구별 + 환율 시스템
- [ ] `Stock`에 `currency: 'KRW' | 'USD'` 추가
- [ ] `Player`에 `cashKRW`, `cashUSD` 분리
- [ ] `GameConfig`에 `exchangeRate` 추가
- [ ] 환율 기반 자산 계산 공식 변경
- [ ] 환전 기능 UI
- [ ] Admin 환율 설정 (수동 or 시나리오 기반)
- [ ] 포트폴리오/순위판 원/달러 구분 표시

### R8. 카테고리별 종목 확장
- [ ] `INITIAL_STOCKS` 확장 (카테고리당 2~3개)
- [ ] `StockList` 카테고리별 그룹핑 UI
- [ ] 시나리오 `priceChanges`에 새 종목 ID 추가
- [ ] 모바일 UX 재설계 (종목 수 증가 대응)

### R11. 기능별 점진적 해금 (Feature Flag)
- [ ] `FeatureFlags` 타입 정의
- [ ] Firebase `game/features` 경로
- [ ] Admin Feature Flag 토글 패널
- [ ] 차시 프리셋 ("3차시 설정 적용" 등)
- [ ] 각 컴포넌트에서 플래그 확인 후 조건부 렌더링

### R12. 금액 매트릭스 검증
- [ ] 시드/정보비용/변동률 밸런스 시뮬레이션
- [ ] GameConfig에서 정보 가격 실시간 조절 가능 (완료)
- [ ] 테스트 시나리오로 밸런스 검증

---

## 기술 부채 / 개선 사항

- [ ] `OrderForm.tsx` 미사용 파일 제거 (StockDetail에 통합됨)
- [ ] Admin PIN 하드코딩 → 환경변수 또는 Firebase Auth
- [ ] 번들 사이즈 최적화 (현재 634KB, code-splitting 적용)
- [ ] Firebase Security Rules 강화
- [ ] 오프라인 감지 + 재연결 처리

---

## 광희(기획) 작업 필요 항목

- [ ] 시나리오 1: 라운드별 정보 거래소 콘텐츠 6개 x 6라운드 = 36개 작성
- [ ] 시나리오 2: 라운드별 정보 거래소 콘텐츠 6개 x 6라운드 = 36개 작성
- [ ] 추가 시나리오 기획 (필요 시 Admin 설정에서 직접 생성 가능)
- [ ] 정보 등급별 가격 밸런스 검토 (C:1,000 / B:3,000 / A:5,000)
- [ ] 회고 메모 양식 확정 (잘한 점/아쉬운 점/다짐 외 항목 추가 여부)
