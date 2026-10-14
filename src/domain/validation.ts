import { coreQuestions, questionById } from '../data/questions'
import type { Answers, AxisId, Question, QuestionId } from './types'

const expectedIds: readonly QuestionId[] = [
  'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8',
  'M1', 'M2', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9',
  'AU1', 'AU2', 'AU3', 'AU4', 'AU5', 'AU6', 'AU7', 'AU8',
  'E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8',
]
const idSet = new Set<string>(expectedIds)
const axes: readonly AxisId[] = ['agency', 'moralRadius', 'authority', 'economic']
const fourLabels = ['Strongly disagree', 'Disagree', 'Agree', 'Strongly agree']
const fiveLabels = ['Strongly disagree', 'Disagree', 'Neither agree nor disagree', 'Agree', 'Strongly agree']
const fourPositive = [-2, -1, 1, 2]
const fourNegative = [2, 1, -1, -2]
const positive = [-2, -1, 0, 1, 2]
const negative = [2, 1, 0, -1, -2]

export function isQuestionId(value: unknown): value is QuestionId {
  return typeof value === 'string' && idSet.has(value)
}

export function isOptionIndex(value: unknown, questionId: QuestionId): value is 0 | 1 | 2 | 3 | 4 {
  return Number.isInteger(value) && typeof value === 'number' && value >= 0 && value < (questionById.get(questionId)?.options.length ?? 0)
}

export function validateAnswers(value: unknown, complete = false): value is Answers {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false
  const entries = Object.entries(value)
  if (entries.some(([id, index]) => !isQuestionId(id) || !isOptionIndex(index, id))) return false
  return !complete || coreQuestions.every((question) => Object.hasOwn(value, question.id))
}

export function validateQuestionBank(value: unknown): value is readonly Question[] {
  if (!Array.isArray(value) || value.length !== expectedIds.length) return false
  const seen = new Set<string>()
  const counts = new Map<AxisId, { statement: number; scenario: number }>(axes.map((axis) => [axis, { statement: 0, scenario: 0 }]))
  for (const entry of value) {
    if (entry === null || typeof entry !== 'object') return false
    const q = entry as Record<string, unknown>
    if (!isQuestionId(q.id) || seen.has(q.id) || !axes.includes(q.axis as AxisId)) return false
    const expectedAxis = q.id.startsWith('AU') ? 'authority' : q.id.startsWith('A') ? 'agency' : q.id.startsWith('M') ? 'moralRadius' : 'economic'
    if (q.axis !== expectedAxis || (q.kind !== 'statement' && q.kind !== 'scenario')) return false
    if (typeof q.prompt !== 'string' || !q.prompt.trim() || !Array.isArray(q.options) || (q.options.length !== 4 && q.options.length !== 5)) return false
    const options = q.options as unknown[]
    if (options.some((option) => option === null || typeof option !== 'object' ||
      typeof (option as Record<string, unknown>).label !== 'string' || !(option as { label: string }).label.trim() ||
      ![-2, -1, 0, 1, 2].includes((option as { contribution: number }).contribution))) return false
    if (q.kind === 'statement') {
      if (q.polarity !== 'positive' && q.polarity !== 'negative') return false
      const values = options.length === 4
        ? q.polarity === 'positive' ? fourPositive : fourNegative
        : q.polarity === 'positive' ? positive : negative
      const labels = options.length === 4 ? fourLabels : fiveLabels
      if (options.some((option, i) => (option as { label: string }).label !== labels[i] || (option as { contribution: number }).contribution !== values[i])) return false
    } else {
      if (q.polarity !== undefined || options.length !== 5) return false
      const contributions = options.map((option) => (option as { contribution: number }).contribution).sort((a, b) => a - b)
      if (contributions.some((contribution, index) => contribution !== positive[index])) return false
    }
    seen.add(q.id)
    const count = counts.get(q.axis as AxisId)
    if (!count) return false
    count[q.kind as 'statement' | 'scenario'] += 1
  }
  return expectedIds.every((id) => seen.has(id)) && axes.every((axis) => {
    const count = counts.get(axis)
    return count?.statement === 6 && count.scenario === 2
  })
}
