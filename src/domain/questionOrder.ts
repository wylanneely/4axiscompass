import { coreQuestions, tieBreakerIds } from '../data/questions'
import type { QuestionId } from './types'

const coreIds = coreQuestions.map((question) => question.id)
const reservedIds = [...tieBreakerIds]

export function validQuestionOrder(value: unknown): value is readonly QuestionId[] {
  return Array.isArray(value) && value.length === coreIds.length + reservedIds.length &&
    new Set(value.slice(0, coreIds.length)).size === coreIds.length &&
    coreIds.every((id) => value.slice(0, coreIds.length).includes(id)) &&
    new Set(value.slice(coreIds.length)).size === reservedIds.length &&
    reservedIds.every((id) => value.slice(coreIds.length).includes(id))
}

export function shuffleQuestionOrder(previous?: readonly QuestionId[], random = Math.random): QuestionId[] {
  const order = [...coreIds]
  const reserve = [...reservedIds]
  for (const group of [order, reserve]) {
    for (let index = group.length - 1; index > 0; index--) {
      const swapIndex = Math.floor(random() * (index + 1))
      ;[group[index], group[swapIndex]] = [group[swapIndex], group[index]]
    }
  }
  if (previous && order.every((id, index) => id === previous[index])) {
    ;[order[0], order[1]] = [order[1], order[0]]
  }
  return [...order, ...reserve]
}
