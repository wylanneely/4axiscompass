import { coreQuestions, QUESTIONNAIRE_VERSION, tieBreakerIdSet } from '../data/questions'
import { isQuestionId, validateAnswers } from '../domain/validation'
import { assessmentComplete, requiredTieIds } from '../domain/tieBreak'
import { shuffleQuestionOrder, validQuestionOrder } from '../domain/questionOrder'
import type { QuestionId, Session } from '../domain/types'

export const SESSION_KEY = 'four-axis-compass:session:v1'
export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export function newSession(previousOrder?: readonly QuestionId[]): Session {
  const questionOrder = shuffleQuestionOrder(previousOrder)
  return { schemaVersion: 1, questionnaireVersion: QUESTIONNAIRE_VERSION, responses: {}, questionOrder, currentQuestionId: questionOrder[0], completed: false, view: 'start', updatedAt: new Date().toISOString() }
}

export function validateSession(value: unknown): value is Session {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false
  const data = value as Record<string, unknown>
  if (data.schemaVersion !== 1 || data.questionnaireVersion !== QUESTIONNAIRE_VERSION || !validateAnswers(data.responses) || !validQuestionOrder(data.questionOrder) || !isQuestionId(data.currentQuestionId)) return false
  if (typeof data.completed !== 'boolean' || !['start', 'question', 'review', 'results'].includes(String(data.view))) return false
  if (typeof data.updatedAt !== 'string' || !Number.isFinite(Date.parse(data.updatedAt))) return false
  const complete = assessmentComplete(data.responses as Session['responses'])
  if (data.completed && !complete) return false
  if ((data.view === 'results' || data.view === 'review') && (!data.completed || !complete)) return false
  if (data.view === 'question' && tieBreakerIdSet.has(data.currentQuestionId) &&
    (!validateAnswers(data.responses, true) || !requiredTieIds(data.responses as Session['responses'], data.questionOrder as QuestionId[]).includes(data.currentQuestionId as QuestionId))) return false
  if (data.view === 'question' && !tieBreakerIdSet.has(data.currentQuestionId) &&
    !coreQuestions.some((question) => question.id === data.currentQuestionId)) return false
  return true
}

export interface RestoreResult { session: Session; notice: string | null; available: boolean }
export function restoreSession(storage: StorageLike | null): RestoreResult {
  if (!storage) return { session: newSession(), notice: 'Device storage is unavailable. Progress will last only while this page stays open.', available: false }
  let raw: string | null
  try {
    raw = storage.getItem(SESSION_KEY)
  } catch {
    return { session: newSession(), notice: 'Device storage is unavailable. Progress will last only while this page stays open.', available: false }
  }
  if (raw === null) return { session: newSession(), notice: null, available: true }
  try {
    const parsed: unknown = JSON.parse(raw)
    if (validateSession(parsed)) return { session: parsed, notice: null, available: true }
    if (parsed && typeof parsed === 'object' && 'questionnaireVersion' in parsed && parsed.questionnaireVersion !== QUESTIONNAIRE_VERSION) {
      try { storage.removeItem(SESSION_KEY) } catch { /* a blocked store still permits an in-memory session */ }
      return { session: newSession(), notice: 'The assessment was updated, so a new test is ready.', available: true }
    }
  } catch { /* malformed JSON is invalid progress, not unavailable storage */ }
  try { storage.removeItem(SESSION_KEY) } catch { /* a blocked store still permits an in-memory session */ }
  return { session: newSession(), notice: 'Previous progress could not be restored, so a new assessment is ready.', available: true }
}

export function persistSession(storage: StorageLike | null, session: Session): boolean {
  if (!storage) return false
  try { storage.setItem(SESSION_KEY, JSON.stringify(session)); return true } catch { return false }
}

export function clearSession(storage: StorageLike | null): boolean {
  if (!storage) return false
  try { storage.removeItem(SESSION_KEY); return true } catch { return false }
}
