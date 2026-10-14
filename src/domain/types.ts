export type AxisId = 'agency' | 'moralRadius' | 'authority' | 'economic'
export type QuestionId =
  | 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6' | 'A7' | 'A8'
  | 'M1' | 'M2' | 'M4' | 'M5' | 'M6' | 'M7' | 'M8' | 'M9'
  | 'AU1' | 'AU2' | 'AU3' | 'AU4' | 'AU5' | 'AU6' | 'AU7' | 'AU8'
  | 'E1' | 'E2' | 'E3' | 'E4' | 'E5' | 'E6' | 'E7' | 'E8'
export type OptionIndex = 0 | 1 | 2 | 3 | 4
export type Contribution = -2 | -1 | 0 | 1 | 2
export type QuestionKind = 'statement' | 'scenario'
export type Polarity = 'positive' | 'negative'
export interface Option {
  readonly label: string
  readonly contribution: Contribution
}
export type FiveOptions = readonly [Option, Option, Option, Option, Option]
export type FourOptions = readonly [Option, Option, Option, Option]
export interface Question {
  readonly id: QuestionId
  readonly axis: AxisId
  readonly kind: QuestionKind
  readonly prompt: string
  readonly options: FourOptions | FiveOptions
  readonly polarity?: Polarity
}
export type Answers = Partial<Record<QuestionId, OptionIndex>>
export type Scores = Record<AxisId, number>
export type PoliticalRegionId = 'authoritarianLeft' | 'authoritarianRight' | 'libertarianRight' | 'libertarianLeft'
export type WorldviewRegionId = 'agencyProximal' | 'agencyUniversal' | 'structureProximal' | 'structureUniversal'
export interface Region { readonly id: string; readonly name: string }
export type AppView = 'start' | 'question' | 'review' | 'results'
export interface Session {
  readonly schemaVersion: 1
  readonly questionnaireVersion: string
  readonly responses: Answers
  readonly questionOrder: readonly QuestionId[]
  readonly currentQuestionId: QuestionId
  readonly completed: boolean
  readonly view: AppView
  readonly updatedAt: string
}
