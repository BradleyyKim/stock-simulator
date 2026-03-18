import type { Scenario, Stock } from '@/types';

export const INITIAL_STOCKS: Omit<Stock, 'priceHistory'>[] = [
  { id: 'ai', name: '인공지능', sector: 'ai', currentPrice: 10000, previousPrice: 10000 },
  { id: 'energy', name: '에너지', sector: 'energy', currentPrice: 8000, previousPrice: 8000 },
  { id: 'bio', name: '바이오', sector: 'bio', currentPrice: 12000, previousPrice: 12000 },
  { id: 'semi', name: '반도체', sector: 'semi', currentPrice: 15000, previousPrice: 15000 },
  { id: 'game', name: '게임', sector: 'game', currentPrice: 9000, previousPrice: 9000 },
];

export const SECTOR_COLORS: Record<string, string> = {
  ai: '#8b5cf6',
  energy: '#f59e0b',
  bio: '#10b981',
  semi: '#3b82f6',
  game: '#ec4899',
};

export const SECTOR_LABELS: Record<string, string> = {
  ai: '인공지능',
  energy: '에너지',
  bio: '바이오',
  semi: '반도체',
  game: '게임',
};

export const scenarios: Scenario[] = [
  {
    id: 'scenario-1',
    name: '시나리오 1: 기본 시장 체험',
    description: '기초적인 경제 이벤트로 시장의 반응을 체험합니다.',
    rounds: [
      {
        round: 1,
        news: '정부, 기준금리 0.25%p 인하 발표',
        hint1: '정부가 경제 부양을 위한 정책을 검토 중이다.',
        hint2: '금융 정책의 변화가 예상된다.',
        hint3: '대출과 투자에 긍정적인 영향을 줄 수 있는 조치다.',
        priceChanges: { ai: 0.05, energy: 0.03, bio: 0.02, semi: 0.04, game: 0.01 },
      },
      {
        round: 2,
        news: 'AI 반도체 수요 폭발, 글로벌 공급 부족 심화',
        hint1: '글로벌 기술 산업에 큰 변화가 감지되고 있다.',
        hint2: '특정 첨단 기술 부품의 수요가 급증하고 있다.',
        hint3: '연산 능력과 관련된 핵심 부품이 부족하다.',
        priceChanges: { ai: 0.12, energy: 0, bio: 0, semi: 0.08, game: 0.03 },
      },
      {
        round: 3,
        news: '중동 지역 무력 충돌 발생, 원유 공급 불안',
        hint1: '국제 정세에 불안한 조짐이 보이고 있다.',
        hint2: '특정 자원의 공급이 위협받고 있다.',
        hint3: '에너지 관련 자산에 큰 영향을 줄 수 있는 사건이다.',
        priceChanges: { ai: -0.04, energy: 0.10, bio: -0.02, semi: -0.06, game: -0.04 },
      },
      {
        round: 4,
        news: '대형 게임사 대표 사임 및 구조조정 발표',
        hint1: '한 대형 기업이 예기치 못한 인사 변동을 발표했다.',
        hint2: '새 경영진은 기존 사업 구조 재편을 예고했다.',
        hint3: '핵심 사업부는 게임 콘텐츠 부문이다.',
        priceChanges: { ai: -0.02, energy: 0, bio: 0, semi: -0.01, game: -0.12 },
      },
      {
        round: 5,
        news: '바이오 기업, 신약 임상 3상 성공 발표',
        hint1: '의료 분야에서 큰 진전이 있었다.',
        hint2: '특정 질병의 치료법이 획기적으로 발전할 수 있다.',
        hint3: '임상시험의 최종 단계에서 긍정적 결과가 나왔다.',
        priceChanges: { ai: 0.02, energy: 0, bio: 0.15, semi: 0, game: 0 },
      },
      {
        round: 6,
        news: '정부, 반도체 산업 대규모 지원 정책 발표',
        hint1: '정부가 새로운 산업 정책을 검토 중이다.',
        hint2: '지원 대상은 첨단 기술 제조업 중심이다.',
        hint3: '핵심 수혜 분야는 고성능 연산 장치 관련 산업이다.',
        priceChanges: { ai: 0.06, energy: 0, bio: 0, semi: 0.15, game: -0.02 },
      },
    ],
  },
  {
    id: 'scenario-2',
    name: '시나리오 2: 변동성 장세',
    description: '급등락이 반복되는 시장에서 리스크 관리를 학습합니다.',
    rounds: [
      {
        round: 1,
        news: 'AI 기술 혁명 선언, 주요 기업 투자 확대',
        hint1: '기술 분야에서 역사적인 발표가 있었다.',
        hint2: '자동화와 지능형 시스템에 대한 관심이 폭발적이다.',
        hint3: '인공지능과 관련된 기업들이 직접적인 수혜를 입을 것이다.',
        priceChanges: { ai: 0.15, energy: 0, bio: 0.03, semi: 0.06, game: 0.04 },
      },
      {
        round: 2,
        news: '대형 AI 기업 회계 부정 스캔들 발각',
        hint1: '시장에 충격적인 소식이 전해졌다.',
        hint2: '특정 기업의 신뢰도에 심각한 문제가 생겼다.',
        hint3: '기술 섹터의 대표 기업이 관련되어 있다.',
        priceChanges: { ai: -0.18, energy: 0.02, bio: 0.01, semi: -0.05, game: -0.03 },
      },
      {
        round: 3,
        news: '글로벌 경기 침체 우려 확산, 안전자산 선호',
        hint1: '세계 경제에 대한 우려가 커지고 있다.',
        hint2: '소비와 투자 심리가 급격히 위축되고 있다.',
        hint3: '위험 자산에서 자금이 빠져나가고 있다.',
        priceChanges: { ai: -0.08, energy: -0.06, bio: -0.04, semi: -0.10, game: -0.07 },
      },
      {
        round: 4,
        news: '정부 긴급 경기 부양책 발표, 전 산업 지원',
        hint1: '정부가 긴급 대책을 마련하고 있다.',
        hint2: '경제 전반에 걸친 대규모 지원이 예상된다.',
        hint3: '모든 산업이 수혜를 받을 수 있는 정책이다.',
        priceChanges: { ai: 0.10, energy: 0.08, bio: 0.07, semi: 0.12, game: 0.06 },
      },
      {
        round: 5,
        news: '에너지 대란 발생, 원자재 가격 급등',
        hint1: '글로벌 공급망에 심각한 문제가 발생했다.',
        hint2: '기초 자원의 가격이 급변하고 있다.',
        hint3: '에너지 관련 기업들이 직접적인 영향을 받고 있다.',
        priceChanges: { ai: -0.03, energy: 0.20, bio: -0.05, semi: -0.08, game: -0.04 },
      },
      {
        round: 6,
        news: '블록버스터 게임 출시 대성공, 업계 매출 신기록',
        hint1: '엔터테인먼트 업계에서 큰 성공 사례가 나왔다.',
        hint2: '디지털 콘텐츠 소비가 폭발적으로 증가했다.',
        hint3: '게임 산업이 직접적인 수혜를 받고 있다.',
        priceChanges: { ai: 0.03, energy: 0, bio: 0, semi: 0.02, game: 0.18 },
      },
    ],
  },
];
