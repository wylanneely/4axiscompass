import { useEffect, useRef } from 'react'
import type { Question, OptionIndex } from '../../domain/types'

interface Props {
  question: Question
  index: number
  total: number
  answered: number
  selected: OptionIndex | undefined
  completed: boolean
  onSelect: (index: OptionIndex) => void
  onBack: () => void
  onNext: () => void
  onExit: () => void
  onResults: () => void
}
export default function QuestionScreen({ question, index, total, answered, selected, completed, onSelect, onBack, onNext, onExit, onResults }: Props) {
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    heading.current?.focus({ preventScroll: true })
    heading.current?.scrollIntoView({ block: 'start', behavior: 'auto' })
  }, [question.id])
  return <main className="question-page">
    <div className="question-topline"><button className="text-button" onClick={onExit}>Save and exit</button></div>
    <div className="question-meta"><span>Question {index + 1} of {total}</span><span>{Math.round(answered / total * 100)}% answered</span></div>
    <div className="progress-track" role="progressbar" aria-label="Questions answered" aria-valuemin={0} aria-valuemax={total} aria-valuenow={answered}><span style={{ width: `${answered / total * 100}%` }} /></div>
    <section className="question-panel" aria-labelledby="question-heading">
      <h1 id="question-heading" tabIndex={-1} ref={heading}>{question.prompt}</h1>
      <fieldset className="answer-fieldset"><legend>Choose one response</legend>
        <div className="option-list">{question.options.map((option, optionIndex) => <label className={`option ${selected === optionIndex ? 'selected' : ''}`} key={option.label}>
          <input type="radio" name={`answer-${question.id}`} value={optionIndex} checked={selected === optionIndex} onChange={() => onSelect(optionIndex as OptionIndex)} />
          <span className="radio-mark" aria-hidden="true" /><span>{option.label}</span>
        </label>)}</div>
      </fieldset>
      <div className="question-navigation"><button className="button button-outline" onClick={onBack}>← Back</button><button className="button button-primary" onClick={onNext} disabled={selected === undefined}>{index === total - 1 ? 'See results' : 'Next →'}</button></div>
      {completed && <button className="text-button return-results" onClick={onResults}>Return to updated results</button>}
    </section>
    <p className="question-footnote">Your responses are stored only on this device when browser storage is available.</p>
  </main>
}
