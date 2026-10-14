import { coreQuestions, questions, tieBreakerIdSet } from '../data/questions'
import { validateAnswers, validateQuestionBank } from './validation'
import type { Answers, AxisId, Question, Scores } from './types'

export const axisOrder: readonly AxisId[] = ['agency', 'moralRadius', 'authority', 'economic']

export function scoreAnswers(answers: unknown, bank: unknown = questions): Scores {
  if (!validateQuestionBank(bank)) throw new Error('Invalid questionnaire definition')
  if (!validateAnswers(answers, true)) throw new Error('Assessment requires 28 valid core answers')
  const totals: Scores = { agency: 0, moralRadius: 0, authority: 0, economic: 0 }
  for (const question of bank as readonly Question[]) {
    if (tieBreakerIdSet.has(question.id)) continue
    const index = (answers as Answers)[question.id]
    if (index === undefined) throw new Error('Missing answer')
    totals[question.axis] += question.options[index]!.contribution
  }
  for (const axis of axisOrder) totals[axis] = (totals[axis] / (coreQuestions.length / axisOrder.length * 2)) * 100 || 0
  return totals
}

export function formatScore(score: number): string {
  const value = Object.is(score, -0) ? 0 : score
  return `${value > 0 ? '+' : ''}${Number(value.toFixed(2))}`
}
