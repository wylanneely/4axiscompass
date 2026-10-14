import { questionById } from '../../data/questions'
import type { Answers, QuestionId } from '../../domain/types'

interface Props { answers: Answers; order: readonly QuestionId[]; onEdit: (id: QuestionId) => void; onResults: () => void }
const sectionNames = { agency: 'Agency', moralRadius: 'Moral Radius', authority: 'Authority', economic: 'Economic' }
export default function ReviewScreen({ answers, order, onEdit, onResults }: Props) {
  return <main className="review-page">
    <button className="text-button back-link" onClick={onResults}>← Back to results</button>
    <p className="eyebrow">YOUR RESPONSES</p><h1>Review answers</h1><p className="review-intro">Edit any response. Your results update from the answers you have now.</p>
    <div className="review-list">{order.map((id, index) => {
      const question = questionById.get(id)!
      const choice = answers[question.id]
      return <article className="review-item" key={question.id}>
        <div><p className="review-number">{String(index + 1).padStart(2, '0')} <span>· {sectionNames[question.axis]}</span></p><h2>{question.prompt}</h2><p className="review-answer">{choice === undefined ? 'Unanswered' : question.options[choice]!.label}</p></div>
        <button className="button button-outline" onClick={() => onEdit(question.id)} aria-label={`Edit question ${index + 1}`}>Edit</button>
      </article>
    })}</div>
    <button className="button button-primary review-done" onClick={onResults}>Back to results</button>
  </main>
}
