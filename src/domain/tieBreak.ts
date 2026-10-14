import { coreQuestions, questionById, tieBreakerIds } from '../data/questions'
import { scoreAnswers } from './scoring'
import { validateAnswers } from './validation'
import type { Answers, AxisId, QuestionId, Scores } from './types'

function contribution(answers: Answers, id: QuestionId): number | null {
  const index = answers[id]
  return index === undefined ? null : questionById.get(id)!.options[index]!.contribution
}

export function pendingTieIds(answers: Answers): QuestionId[] {
  if (!validateAnswers(answers, true)) return []
  const scores = scoreAnswers(answers)
  return tieBreakerIds.filter((id) => {
    const axis = questionById.get(id)!.axis
    if (scores[axis] !== 0) return false
    const directions = coreQuestions.filter((question) => question.axis === axis)
      .map((question) => Math.sign(contribution(answers, question.id)!))
    return directions.reduce((sum, direction) => sum + direction, 0) === 0
  })
}

export function requiredTieIds(answers: Answers, order: readonly QuestionId[]): QuestionId[] {
  const pending = new Set(pendingTieIds(answers))
  return order.filter((id) => pending.has(id))
}

export function assessmentComplete(answers: Answers): boolean {
  return validateAnswers(answers, true) && pendingTieIds(answers).every((id) => contribution(answers, id) !== null)
}

export function classificationScores(answers: Answers): Scores | null {
  if (!assessmentComplete(answers)) return null
  const scores = scoreAnswers(answers)
  const resolved = { ...scores }
  for (const axis of Object.keys(scores) as AxisId[]) {
    if (scores[axis] !== 0) continue
    const count = coreQuestions.filter((question) => question.axis === axis)
      .reduce((sum, question) => sum + Math.sign(contribution(answers, question.id)!), 0)
    const reservedId = tieBreakerIds.find((id) => questionById.get(id)!.axis === axis)!
    resolved[axis] = Math.sign(count || contribution(answers, reservedId)!)
  }
  return resolved
}
