export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

export interface WeatherSnapshot {
  temp: number
  humidity: number
  windSpeed: number
  rainType: string
  pm25: number
}

export interface ReactionRecord extends WeatherSnapshot {
  date: string // YYYYMMDD
  hour: number
  reaction: 'good' | 'bad'
  tags?: string[]
  source?: 'onboarding_seed' | 'user'
}

export interface ProfileFeature {
  mean: number
  std: number
  n: number
}

// 사용자별 취향 프로필 good 통계는 선호 분포, bad 통계는 회피 분포로 분리 보관
export interface Profile {
  season: Season
  sampleCount: number
  goodSampleCount: number
  userFeedbackCount: number // onboarding seed 제외
  seedCount: number
  temp?: ProfileFeature
  humidity?: ProfileFeature
  windSpeed?: ProfileFeature
  pm25?: ProfileFeature
  rainTypeCounts: Record<string, number>
  avoidTemp?: ProfileFeature
  avoidHumidity?: ProfileFeature
  avoidWindSpeed?: ProfileFeature
  avoidPm25?: ProfileFeature
  avoidRainTypeCounts: Record<string, number>
}

// empty: 데이터 없음 / average: 평균 기준 fallback / seed_only: 온보딩만 / learning: 1~2개 / personalized: 3개 이상
export type ScoreConfidenceLevel = 'empty' | 'average' | 'seed_only' | 'learning' | 'personalized'

export type ReasonStatus = 'pass' | 'partial' | 'fail' | 'unknown'

export interface ScoreReason {
  label: string
  status: ReasonStatus
  detail: string
  match: number // 0~1
}

export interface ScoreResult {
  score: number // 0~100
  reasons: ScoreReason[]
  sampleCount: number
  goodSampleCount: number
  userFeedbackCount: number
  seedCount: number
  minRequired: number
  confidenceLevel: ScoreConfidenceLevel
  confident: boolean
}

// 현재 계절 기준으로 reactions를 가중집계해 Profile 생성
// 가중치 = (태그 부여 여부) × (사용자 피드백/시드) × (계절 거리)
export declare function buildProfile(reactions: ReactionRecord[], season?: Season): Profile

// Profile + 현재 날씨 → 0~100 점수
// feature별 가우시안 매칭으로 양의 점수 누적, avoid 분포에서 패널티 차감
// feature 1개여도 maxPossible 기준 정규화로 한쪽 쏠림 방지
export declare function computeScore(current: WeatherSnapshot, profile: Profile): ScoreResult

// 학습 데이터 부족 시 일반 인구 기준 fallback.
// 기온/습도/바람/미세먼지/하늘 각각 구간별 평균 매치 점수 테이블 보유
export declare function computeAverageScore(current: WeatherSnapshot): ScoreResult

export declare function getSeason(date?: Date): Season
export declare function seasonLabel(s: Season): string
