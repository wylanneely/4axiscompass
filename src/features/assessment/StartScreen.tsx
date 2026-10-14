import { palette, politicalOrder, worldviewOrder } from '../../data/palette'

interface Props {
  answered: number
  completed: boolean
  storageAvailable: boolean
  onStart: () => void
  onContinue: () => void
  onResults: () => void
  onReset: () => void
}

const axes = [
  { name: 'Economic', poles: 'Economic Left ↔ Economic Right', description: 'Collective provision and redistribution ↔ market autonomy and private ownership' },
  { name: 'Authority', poles: 'Libertarian ↔ Authoritarian', description: 'Personal liberty and constraints on state power ↔ authority, security, and public order' },
  { name: 'Moral Radius', poles: 'Proximal ↔ Universal', description: 'Stronger obligations to nearer groups ↔ moral concern extending across borders and generations' },
  { name: 'Agency', poles: 'Structure ↔ Agency', description: 'Circumstances and external constraints ↔ individual choices and action as explanations of outcomes' },
]

export default function StartScreen({ answered, completed, storageAvailable, onStart, onContinue, onResults, onReset }: Props) {
  return <main className="start-page">
    <section className="hero-layout">
      <div className="hero-copy">
        <p className="eyebrow">A clearer map of where you stand</p>
        <h1>An Updated<br />Political Compass.<br /><em>Four Dimensions.</em></h1>
        <p className="lead">The 4-Axis Compass maps political and social beliefs across four independent dimensions: Economics, Authority, Moral Radius, and Agency.</p>
        <div className="test-description">
          <p>Traditional political compasses usually reduce ideology to left vs. right or liberty vs. authority. This test adds two additional dimensions: how broadly you extend moral concern, and how much you attribute life outcomes to individual agency versus structural conditions.</p>
          <p>There are no correct answers. Choose the response that most closely reflects what you actually believe rather than what you think you should believe.</p>
          <p>Your answers are combined into a four-axis profile showing both your political orientation and the underlying worldview that helps shape it.</p>
        </div>
        <div className="hero-actions">
          {completed ? <><button className="button button-primary" onClick={onResults}>View results <span aria-hidden="true">↗</span></button><button className="button button-subtle" onClick={onReset}>Retake assessment</button></>
            : answered > 0 ? <><button className="button button-primary" onClick={onContinue}>Continue assessment <span aria-hidden="true">→</span></button><button className="button button-subtle" onClick={onReset}>Start over</button></>
              : <button className="button button-primary" onClick={onStart}>Start assessment <span aria-hidden="true">→</span></button>}
        </div>
        <p className="facts">28 questions, with up to 4 more if needed to break ties <span>·</span> No account required <span>·</span> {storageAvailable ? 'Saved on this device' : 'Available this session'}</p>
      </div>
      <div className="hero-art" aria-label="Two compasses and sixteen possible combined colors">
        <div className="preview-grid">
          <div className="preview-compass"><div className="preview-name">01 / POLITICAL</div><div className="preview-cross preview-political"><span className="preview-top">Authoritarian</span><span className="preview-left">Left</span><span className="preview-right">Right</span><span className="preview-bottom">Libertarian</span></div><p>Economic × Authority</p></div>
          <div className="preview-compass"><div className="preview-name">02 / WORLDVIEW</div><div className="preview-cross preview-worldview"><span className="preview-top">Individual</span><span className="preview-left">Proximal</span><span className="preview-right">Universal</span><span className="preview-bottom">Structure</span></div><p>Moral Radius × Agency</p></div>
        </div>
        <div className="palette-preview"><span>16 combined regions</span><div className="preview-swatches" aria-hidden="true">{politicalOrder.flatMap((p) => worldviewOrder.map((w) => <i key={`${p}-${w}`} style={{ background: palette[p][w].hex }} />))}</div></div>
      </div>
    </section>
    <section className="intro-section" aria-labelledby="measure-heading">
      <div className="section-heading"><p className="eyebrow">THE FRAMEWORK</p><h2 id="measure-heading">Four axes, two different questions.</h2><p>Each dimension is scored separately from your responses.</p></div>
      <div className="axis-intro-grid">{axes.map((axis, i) => <article className="axis-intro" key={axis.name}><span className="axis-number">0{i + 1}</span><h3>{axis.name}</h3><p className="axis-poles">{axis.poles}</p><p>{axis.description}</p></article>)}</div>
    </section>
    <p className="method-note">An exploratory assessment of your answers, not a validated diagnostic instrument.</p>
  </main>
}
