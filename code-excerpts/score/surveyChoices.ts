import type { ReactionRecord } from './score'

// 5스텝 온보딩 설문 Step 1만 현재 기온 의존(없으면 스킵)
// Step 2~5는 항상 노출 Step 4는 다중 선택

export type NowFeelChoice = 'hot' | 'perfect' | 'chilly' | 'cold'
export type BodyTempChoice = 'heat_sensitive' | 'average' | 'cold_sensitive'
export type WarmPrefChoice = 'sunny_dry' | 'humid_ok' | 'dislike_heat'
export type DislikeWeatherChoice = 'rain' | 'snow' | 'cloudy' | 'all_ok'
export type DustChoice = 'very_sensitive' | 'average' | 'not_care'

export interface SurveyAnswers {
  nowFeel?: NowFeelChoice
  bodyTemp: BodyTempChoice
  warmPref: WarmPrefChoice
  dislikeWeather: DislikeWeatherChoice[]
  dust: DustChoice
}

export interface SurveyOption<K extends string> {
  key: K
  emoji: string
  label: string
}

export interface SurveyStep<K extends string = string> {
  id: keyof SurveyAnswers
  question: string
  options: SurveyOption<K>[]
  multiSelect?: boolean
}

export const STEP1_OPTIONS: SurveyOption<NowFeelChoice>[] = [
  { key: 'hot', emoji: '🔥', label: '덥다' },
  { key: 'perfect', emoji: '🌤', label: '딱 좋다' },
  { key: 'chilly', emoji: '🌬', label: '쌀쌀' },
  { key: 'cold', emoji: '🥶', label: '춥다' },
]

export const SURVEY_STEPS: [
  SurveyStep<NowFeelChoice>,
  SurveyStep<BodyTempChoice>,
  SurveyStep<WarmPrefChoice>,
  SurveyStep<DislikeWeatherChoice>,
  SurveyStep<DustChoice>,
] = [
  {
    id: 'nowFeel',
    question: '지금 밖 어때요?',
    options: STEP1_OPTIONS,
  },
  {
    id: 'bodyTemp',
    question: '평소 체감',
    options: [
      { key: 'heat_sensitive', emoji: '🔥', label: '더위 잘 탐' },
      { key: 'average', emoji: '🌡', label: '평균' },
      { key: 'cold_sensitive', emoji: '🥶', label: '추위 잘 탐' },
    ],
  },
  {
    id: 'warmPref',
    question: '따뜻한 날, 어떤 게 좋아요?',
    options: [
      { key: 'sunny_dry', emoji: '☀️', label: '맑고 건조' },
      { key: 'humid_ok', emoji: '🌴', label: '습해도 ok' },
      { key: 'dislike_heat', emoji: '🙅', label: '더위 자체 싫음' },
    ],
  },
  {
    id: 'dislikeWeather',
    question: '싫은 날씨',
    options: [
      { key: 'rain', emoji: '☔', label: '비' },
      { key: 'snow', emoji: '🌨', label: '눈' },
      { key: 'cloudy', emoji: '☁️', label: '흐림' },
      { key: 'all_ok', emoji: '🙆', label: '다 괜찮아요' },
    ],
    multiSelect: true,
  },
  {
    id: 'dust',
    question: '공기 질 민감도',
    options: [
      { key: 'very_sensitive', emoji: '😷', label: '매우 민감 (호흡기·반려동물)' },
      { key: 'average', emoji: '🙂', label: '평균' },
      { key: 'not_care', emoji: '😎', label: '신경 안 씀' },
    ],
  },
]

// 답변 → 가상 ReactionRecord 배열로 변환
// 결과는 source='onboarding_seed'로 태깅되어 점수 가중치에서 실제 피드백보다 낮게 잡힘
export declare function answersToReactions(
  answers: SurveyAnswers,
  currentTemp?: number,
): ReactionRecord[]
