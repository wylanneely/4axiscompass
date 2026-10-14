import { combinedRegion, candidateRegions, politicalRegion, worldviewRegion } from '../../domain/classification'
import { formatScore } from '../../domain/scoring'
import { politicalRegions, worldviewRegions } from '../../data/palette'
import type { AxisId, Scores } from '../../domain/types'
import Compass from '../compass/Compass'

interface Props { scores: Scores; regionScores: Scores; onReview: () => void; onReset: () => void; onHome: () => void }
const axisDetails: Record<AxisId, { name: string; negative: string; positive: string; negativeText: string; positiveText: string }> = {
  economic: { name: 'Economic', negative: 'Left', positive: 'Right', negativeText: 'These responses lean toward collective provision and redistribution.', positiveText: 'These responses lean toward market autonomy and private ownership.' },
  authority: { name: 'Authority', negative: 'Libertarian', positive: 'Authoritarian', negativeText: 'These responses lean toward personal liberty and constraints on state power.', positiveText: 'These responses lean toward authority, security, and public order.' },
  moralRadius: { name: 'Moral Radius', negative: 'Proximal', positive: 'Universal', negativeText: 'These responses lean toward stronger obligations to nearer groups.', positiveText: 'These responses lean toward moral concern across borders and generations.' },
  agency: { name: 'Agency', negative: 'Structural', positive: 'Individual', negativeText: 'These responses lean toward circumstances and external constraints as explanations of outcomes.', positiveText: 'These responses lean toward individual choices and action as explanations of outcomes.' },
}
const scoreOrder: readonly AxisId[] = ['economic', 'authority', 'moralRadius', 'agency']

function AxisRow({ axis, score }: { axis: AxisId; score: number }) {
  const detail = axisDetails[axis]
  const direction = score === 0 ? 'Balanced on this scoring scale.' : score < 0 ? detail.negativeText : detail.positiveText
  return <article className="score-row">
    <div className="score-row-heading"><h3>{detail.name}</h3><strong>{formatScore(score)}</strong></div>
    <div className={`score-scale score-scale-${axis}`} role="img" aria-label={`${detail.name}: ${formatScore(score)} on a scale from -100 ${detail.negative} to +100 ${detail.positive}`}><span className="score-center" /><span className="score-marker" style={{ left: `${(score + 100) / 2}%` }} /></div>
    <div className="score-poles"><span>{detail.negative}</span><span>{detail.positive}</span></div>
    <p className="score-interpretation">{direction}</p>
  </article>
}

export default function ResultsScreen({ scores, regionScores, onReview, onReset, onHome }: Props) {
  const combined = combinedRegion(regionScores)
  const political = politicalRegion(regionScores)
  const worldview = worldviewRegion(regionScores)
  const candidates = combined ? [] : candidateRegions(regionScores)
  const hasTieBreak = Object.values(scores).some((score) => score === 0)
  return <main className="results-page">
    <p className="eyebrow">ASSESSMENT COMPLETE</p>
    <h1>Your four-axis result</h1>
    <p className="results-intro">A map of these responses across two separate compasses.</p>
    <section className={`result-color-card ${combined ? '' : 'boundary-card'}`} aria-label="Combined result">
      <div className="result-swatch" style={combined ? { background: combined.hex } : undefined} aria-hidden="true">{combined ? '' : '＋'}</div>
      <div className="result-color-copy"><p className="card-kicker">COMBINED REGION</p>
        <h2>{combined ? combined.title : 'On a region boundary'}</h2>
        {combined && <p className="result-color-meta">{combined.colorName} · {combined.hex}</p>}
        <div className="region-tags"><span>{political ? politicalRegions[political] : 'Political region boundary'}</span><span>{worldview ? worldviewRegions[worldview] : 'Worldview region boundary'}</span></div>
        {hasTieBreak && <p className="boundary-explain">A centered score was assigned to a persona using directional answer counts or, when needed, a final tie-break question. The compass dots remain at the original scores.</p>}
        {!combined && <><p className="boundary-explain">One or more axes are exactly centered. The dots show your true position; compatible regions are listed below.</p>
          <details className="candidate-details"><summary>View {candidates.length} compatible archetypes</summary><ul>{candidates.map((candidate) => <li key={`${candidate.politicalId}-${candidate.worldviewId}`}><span className="candidate-swatch" style={{ background: candidate.hex }} aria-hidden="true" /><div><strong>{candidate.title}</strong><small>{candidate.colorName} · {candidate.hex}</small><small>{candidate.politicalName} · {candidate.worldviewName}</small></div></li>)}</ul></details></>}
      </div>
    </section>
    <section className="results-section" aria-labelledby="compasses-heading"><div className="results-section-heading"><span className="eyebrow">01 / THE COMPASSES</span><h2 id="compasses-heading">Where your answers land</h2></div>
      <div className="compass-grid"><Compass kind="political" x={scores.economic} y={scores.authority} color={combined?.hex ?? null} /><Compass kind="worldview" x={scores.moralRadius} y={scores.agency} color={combined?.hex ?? null} /></div>
    </section>
    <section className="results-section" aria-labelledby="scores-heading"><div className="results-section-heading"><span className="eyebrow">02 / THE DIMENSIONS</span><h2 id="scores-heading">Your four scores</h2></div>
      <p className="score-note">Scores describe the direction of these responses. They are not population percentiles or confidence estimates.</p>
      <div className="scores-grid">{scoreOrder.map((axis) => <AxisRow key={axis} axis={axis} score={scores[axis]} />)}</div>
    </section>
    <div className="result-actions"><button className="button button-primary" onClick={onReview}>Review answers</button><button className="button button-outline" onClick={onReset}>Retake assessment</button><button className="button button-subtle" onClick={onHome}>Back to start</button></div>
  </main>
}
