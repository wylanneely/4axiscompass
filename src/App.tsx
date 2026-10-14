import { useEffect, useRef, useState } from 'react'
import './App.css'
import { coreQuestions, questionById } from './data/questions'
import { scoreAnswers } from './domain/scoring'
import { assessmentComplete, classificationScores, requiredTieIds } from './domain/tieBreak'
import { validateAnswers } from './domain/validation'
import type { OptionIndex, QuestionId, Session } from './domain/types'
import { clearSession, newSession, persistSession, restoreSession } from './services/persistence'
import StartScreen from './features/assessment/StartScreen'
import QuestionScreen from './features/assessment/QuestionScreen'
import ReviewScreen from './features/assessment/ReviewScreen'
import ResultsScreen from './features/results/ResultsScreen'

function browserStorage(): Storage | null {
  try { return window.localStorage } catch { return null }
}
function activeOrder(session: Session): QuestionId[] {
  return [...session.questionOrder.slice(0, coreQuestions.length), ...requiredTieIds(session.responses, session.questionOrder)]
}
function changed(session: Session, patch: Partial<Session>): Session {
  return { ...session, ...patch, updatedAt: new Date().toISOString() }
}

export default function App() {
  const [storage] = useState(browserStorage)
  const [initial] = useState(() => restoreSession(storage))
  const [session, setSession] = useState(initial.session)
  const [storageAvailable, setStorageAvailable] = useState(initial.available)
  const [notice, setNotice] = useState<string | null>(initial.notice)
  const [confirmReset, setConfirmReset] = useState(false)
  const resetDialog = useRef<HTMLDialogElement>(null)

  const order = activeOrder(session)
  const answered = order.filter((id) => session.responses[id] !== undefined).length
  const complete = assessmentComplete(session.responses)
  const currentIndex = Math.max(0, order.indexOf(session.currentQuestionId))
  const currentQuestion = questionById.get(order[currentIndex])!
  const showResults = session.completed && complete && session.view === 'results'
  const scores = showResults ? scoreAnswers(session.responses) : null
  const regionScores = showResults ? classificationScores(session.responses) : null

  useEffect(() => {
    if (session.view !== 'question') window.scrollTo({ top: 0, behavior: 'auto' })
  }, [session.view])
  useEffect(() => {
    const dialog = resetDialog.current
    if (!dialog) return
    if (confirmReset && !dialog.open) dialog.showModal()
    else if (!confirmReset && dialog.open) dialog.close()
  }, [confirmReset])

  function commit(next: Session) {
    if (storageAvailable && !persistSession(storage, next)) {
      setStorageAvailable(false)
      setNotice('Progress cannot be saved on this device right now. Keep this page open to retain it.')
    }
    setSession(next)
  }
  function go(view: Session['view']) { commit(changed(session, { view })) }
  function setAnswer(index: OptionIndex) {
    const responses = { ...session.responses, [session.currentQuestionId]: index }
    commit(changed(session, { responses, completed: session.completed && assessmentComplete(responses) }))
  }
  function goQuestion(id: QuestionId) { commit(changed(session, { currentQuestionId: id, view: 'question' })) }
  function next() {
    if (session.responses[currentQuestion.id] === undefined) return
    if (validateAnswers(session.responses, true)) {
      const missingTie = requiredTieIds(session.responses, session.questionOrder).find((id) => session.responses[id] === undefined)
      if (missingTie) { goQuestion(missingTie); return }
      if (complete) commit(changed(session, { completed: true, view: 'results' }))
      return
    }
    goQuestion(order[currentIndex + 1])
  }
  function back() { if (currentIndex === 0) go('start'); else goQuestion(order[currentIndex - 1]) }
  function reset() {
    if (storageAvailable && !clearSession(storage)) {
      setStorageAvailable(false)
      setNotice('Progress cannot be saved on this device right now. Keep this page open to retain it.')
    }
    setConfirmReset(false)
    commit(changed(newSession(session.questionOrder), { view: 'question' }))
  }
  function viewResults() { if (session.completed && complete) go('results') }
  function continueAssessment() {
    const missing = order.find((id) => session.responses[id] === undefined)
    goQuestion(missing ?? session.currentQuestionId)
  }

  return <div className="app-shell">
    <header className="site-header"><button className="brand" onClick={() => go('start')} aria-label="4 Axis Compass, back to start"><span className="brand-symbol" aria-hidden="true"><i /><i /></span><span>4 Axis <strong>Compass</strong></span></button><span className="header-aside">AN EXPLORATORY ASSESSMENT</span></header>
    {notice && <div className="storage-notice" role="status"><span>{notice}</span><button onClick={() => setNotice(null)} aria-label="Dismiss notice">×</button></div>}
    {session.view === 'start' && <StartScreen answered={answered} completed={session.completed && complete} storageAvailable={storageAvailable} onStart={() => goQuestion(order[0])} onContinue={continueAssessment} onResults={viewResults} onReset={() => setConfirmReset(true)} />}
    {session.view === 'question' && <QuestionScreen question={currentQuestion} index={currentIndex} total={order.length} answered={answered} selected={session.responses[currentQuestion.id]} completed={session.completed && complete} onSelect={setAnswer} onBack={back} onNext={next} onExit={() => go('start')} onResults={viewResults} />}
    {session.view === 'review' && complete && <ReviewScreen answers={session.responses} order={order} onEdit={goQuestion} onResults={viewResults} />}
    {showResults && scores && regionScores && <ResultsScreen scores={scores} regionScores={regionScores} onReview={() => go('review')} onReset={() => setConfirmReset(true)} onHome={() => go('start')} />}
    <dialog className="reset-dialog" ref={resetDialog} aria-labelledby="reset-title" aria-describedby="reset-description" onCancel={() => setConfirmReset(false)}>
      <h2 id="reset-title">Start a new assessment?</h2>
      <p id="reset-description">This clears your current answers and result from this device.</p>
      <div className="dialog-actions"><button className="button button-outline" onClick={() => setConfirmReset(false)}>Keep my answers</button><button className="button button-primary" onClick={reset}>Clear and retake</button></div>
    </dialog>
    <footer className="site-footer"><span>4 Axis Compass</span><span>Explore your answers with care.</span></footer>
  </div>
}
