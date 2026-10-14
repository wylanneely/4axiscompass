import { before, after, test } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'

let server, questions, coreQuestions, tieBreakerIds, scoring, classification, tieBreak, validation, plot, palette, persistence, questionOrder
before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'error' })
  ;({ questions, coreQuestions, tieBreakerIds } = await server.ssrLoadModule('/src/data/questions.ts'))
  scoring = await server.ssrLoadModule('/src/domain/scoring.ts')
  classification = await server.ssrLoadModule('/src/domain/classification.ts')
  tieBreak = await server.ssrLoadModule('/src/domain/tieBreak.ts')
  validation = await server.ssrLoadModule('/src/domain/validation.ts')
  plot = await server.ssrLoadModule('/src/domain/plot.ts')
  palette = await server.ssrLoadModule('/src/data/palette.ts')
  persistence = await server.ssrLoadModule('/src/services/persistence.ts')
  questionOrder = await server.ssrLoadModule('/src/domain/questionOrder.ts')
})
after(async () => { await server?.close() })

function choices(contribution = 0) {
  return Object.fromEntries(questions.map((q) => {
    const index = q.options.findIndex((option) => option.contribution === contribution)
    assert.notEqual(index, -1, `${q.id} has ${contribution}`)
    return [q.id, index]
  }))
}
function balanced() {
  const counts = new Map()
  return Object.fromEntries(coreQuestions.map((q) => {
    const count = counts.get(q.axis) ?? 0
    counts.set(q.axis, count + 1)
    const contribution = [2, 1, 1, -2, -1, -1, 0][count]
    return [q.id, q.options.findIndex((option) => option.contribution === contribution)]
  }))
}
function scores(economic, authority, agency, moralRadius) { return { economic, authority, agency, moralRadius } }
function store(initial = {}) {
  const entries = new Map(Object.entries(initial))
  return { entries, getItem: (key) => entries.get(key) ?? null, setItem: (key, value) => { entries.set(key, value) }, removeItem: (key) => { entries.delete(key) } }
}

test('bank has exactly eight items per axis with directional statements and five-choice scenarios', () => {
  assert.equal(validation.validateQuestionBank(questions), true)
  assert.equal(questions.length, 32)
  assert.equal(new Set(questions.map((q) => q.id)).size, 32)
  assert.equal(questions.some((q) => q.id === 'M3'), false)
  assert.equal(questions.some((q) => q.id === 'M9'), true)
  for (const axis of ['agency', 'moralRadius', 'authority', 'economic']) {
    const group = questions.filter((q) => q.axis === axis)
    assert.equal(group.length, 8)
    assert.equal(group.filter((q) => q.kind === 'statement').length, 6)
    assert.equal(group.filter((q) => q.kind === 'scenario').length, 2)
    assert.ok(group.every((q) => q.options.length === (q.kind === 'scenario' ? 5 : 4) && q.options.every((o) => Number.isInteger(o.contribution) && Math.abs(o.contribution) <= 2)))
  }
  assert.equal(validation.validateQuestionBank([...questions].reverse()), true)
  assert.equal(validation.validateQuestionBank([...questions.slice(0,31), questions[30]]), false)
  assert.equal(validation.validateQuestionBank(questions.map((q) => q.id === 'A1' ? { ...q, options: q.options.slice(0,3) } : q)), false)
})

test('statement polarity and all scenario endpoints match the contract', () => {
  const q = (id) => questions.find((item) => item.id === id)
  assert.deepEqual(q('A1').options.map((o) => o.contribution), [-2,-1,1,2])
  assert.deepEqual(q('A4').options.map((o) => o.contribution), [2,1,-1,-2])
  assert.equal(q('AU1').options[3].contribution, -2)
  assert.equal(q('E1').options[3].contribution, 2)
  for (const id of ['A7', 'A8', 'E7', 'E8']) assert.deepEqual(q(id).options.map((o) => o.contribution), [2, 1, 0, -1, -2])
  for (const id of ['M7', 'M8', 'AU7', 'AU8']) assert.deepEqual(q(id).options.map((o) => o.contribution), [-2, -1, 0, 1, 2])
})

test('balanced core answers have zero scores and require the four reserved statements', () => {
  const answers = balanced()
  assert.equal(validation.validateAnswers(answers, true), true)
  assert.deepEqual(scoring.scoreAnswers(answers), scores(0,0,0,0))
  assert.equal(coreQuestions.length, 28)
  assert.deepEqual(new Set(tieBreak.pendingTieIds(answers)), new Set(tieBreakerIds))
  assert.equal(tieBreak.assessmentComplete(answers), false)
  assert.equal(classification.combinedRegion(scores(0,0,0,0)), null)
  assert.equal(classification.candidateRegions(scores(0,0,0,0)).length, 16)
  assert.deepEqual(plot.plotPoint(0,0,{left:60,top:49,width:280,height:268}), {x:200,y:183})
})

test('all positive and negative contributions yield exactly 100 or -100', () => {
  assert.deepEqual(scoring.scoreAnswers(choices(2)), scores(100,100,100,100))
  assert.deepEqual(scoring.scoreAnswers(choices(-2)), scores(-100,-100,-100,-100))
})

test('hand-computed mixed agency fixture updates only agency', () => {
  const answers = balanced()
  answers.A1 = 0
  assert.ok(Math.abs(scoring.scoreAnswers(answers).agency + 200 / 7) < 1e-10)
  answers.A1 = 3
  assert.deepEqual(scoring.scoreAnswers(answers), scores(0,0,0,0))
  assert.deepEqual(scoring.scoreAnswers(answers,[...questions].reverse()), scores(0,0,0,0))
})

test('answer count resolves a zero score without asking a reserved question', () => {
  const answers = Object.fromEntries(coreQuestions.map((question) => {
    const index = coreQuestions.filter((item) => item.axis === question.axis).findIndex((item) => item.id === question.id)
    const value = [1, 1, 1, -2, -1, 1, -1][index]
    return [question.id, question.options.findIndex((option) => option.contribution === value)]
  }))
  assert.deepEqual(scoring.scoreAnswers(answers), scores(0,0,0,0))
  assert.deepEqual(tieBreak.pendingTieIds(answers), [])
  assert.equal(tieBreak.assessmentComplete(answers), true)
  assert.deepEqual(tieBreak.classificationScores(answers), scores(1,1,1,1))
  assert.equal(classification.combinedRegion(tieBreak.classificationScores(answers)).title, 'The Governor')
})

test('reserved statements resolve exact score and count ties without changing plotted scores', () => {
  const answers = balanced()
  for (const id of tieBreakerIds) {
    const question = questions.find((item) => item.id === id)
    answers[id] = question.options.findIndex((option) => option.contribution === -1)
  }
  assert.equal(tieBreak.assessmentComplete(answers), true)
  assert.deepEqual(scoring.scoreAnswers(answers), scores(0,0,0,0))
  assert.deepEqual(tieBreak.classificationScores(answers), scores(-1,-1,-1,-1))
  assert.equal(classification.combinedRegion(tieBreak.classificationScores(answers)).title, 'The Humanitarian')
})

test('all sixteen regions resolve to their exact archetypes, colors, and hex codes at small and large scores', () => {
  const expected = [
    ['authoritarianLeft', [['agencyProximal','The Protector','Garnet','#A52A43'],['agencyUniversal','The Campaigner','Scarlet','#EE4B4B'],['structureProximal','The Organizer','Tangerine','#F58A38'],['structureUniversal','The Architect','Rose','#EBA4B2']]],
    ['authoritarianRight', [['agencyProximal','The Commander','Midnight blue','#244675'],['agencyUniversal','The Governor','Azure','#168BDD'],['structureProximal','The Guardian','Marigold','#D5A51D'],['structureUniversal','The Trustee','Butter yellow','#EFDD86']]],
    ['libertarianRight', [['agencyProximal','The Maverick','Fuchsia','#D42B91'],['agencyUniversal','The Innovator','Violet','#7550E8'],['structureProximal','The Traditionalist','Mulberry','#75456D'],['structureUniversal','The Pluralist','Lavender','#B3A0E6']]],
    ['libertarianLeft', [['agencyProximal','The Collaborator','Rainforest','#216F54'],['agencyUniversal','The Idealist','Spring green','#72BC47'],['structureProximal','The Humanitarian','Moss','#85934A'],['structureUniversal','The Empath','Ice blue','#96CFF0']]],
  ]
  const titles = []
  for (const [politicalId, worlds] of expected) {
    for (const [worldviewId, title, name, hex] of worlds) {
      titles.push(title)
      const economic = politicalId.endsWith('Left') ? -1 : 1
      const authority = politicalId.startsWith('authoritarian') ? 1 : -1
      const agency = worldviewId.startsWith('agency') ? 1 : -1
      const moralRadius = worldviewId.endsWith('Proximal') ? -1 : 1
      for (const magnitude of [6.25, 100]) {
        const result = classification.combinedRegion(scores(economic*magnitude, authority*magnitude, agency*magnitude, moralRadius*magnitude))
        assert.equal(result.politicalId, politicalId)
        assert.equal(result.worldviewId, worldviewId)
        assert.equal(result.title, title)
        assert.equal(result.colorName, name)
        assert.equal(result.hex, hex)
        assert.deepEqual(palette.palette[politicalId][worldviewId], {title,name,hex})
      }
    }
  }
  assert.equal(new Set(titles).size, 16)
})

test('centered axes enumerate compatible regions without assigning a pole', () => {
  const one = scores(0, 20, 30, 40)
  assert.equal(classification.politicalRegion(one), null)
  assert.equal(classification.worldviewRegion(one), 'agencyUniversal')
  assert.deepEqual(classification.candidateRegions(one).map((r) => r.colorName), ['Scarlet','Azure'])
  assert.deepEqual(classification.candidateRegions(one).map((r) => r.title), ['The Campaigner','The Governor'])
  const two = scores(0, 0, 20, 20)
  assert.equal(classification.candidateRegions(two).length, 4)
  assert.equal(classification.combinedRegion(two), null)
  assert.equal(classification.candidateRegions(scores(0,0,0,0)).length, 16)
  assert.throws(() => classification.candidateRegions(scores(NaN,0,0,0)))
})

test('SVG mapping preserves inverted y and all corners', () => {
  const area = {left:60,top:49,width:280,height:268}
  assert.deepEqual(plot.plotPoint(-100,100,area), {x:60,y:49})
  assert.deepEqual(plot.plotPoint(100,100,area), {x:340,y:49})
  assert.deepEqual(plot.plotPoint(-100,-100,area), {x:60,y:317})
  assert.deepEqual(plot.plotPoint(100,-100,area), {x:340,y:317})
  assert.throws(() => plot.plotPoint(NaN,0,area))
})

test('missing, unknown, and invalid answers cannot produce a completed score', () => {
  const all = balanced()
  assert.equal(all.A1, 3)
  all.A1 = 0
  assert.equal(validation.validateAnswers(all,true), true)
  delete all.A1
  assert.equal(validation.validateAnswers(all,true), false)
  assert.throws(() => scoring.scoreAnswers(all))
  assert.equal(validation.validateAnswers({...balanced(),M3:0},true), false)
  assert.equal(validation.validateAnswers({...balanced(),A1:4},true), false)
  assert.equal(validation.validateAnswers({...balanced(),A1:NaN},true), false)
  assert.throws(() => scoring.scoreAnswers({...balanced(),A1:1.5}))
})

test('question order is a complete permutation and changes on retake', () => {
  const first = persistence.newSession()
  const second = persistence.newSession(first.questionOrder)
  assert.equal(questionOrder.validQuestionOrder(first.questionOrder), true)
  assert.equal(questionOrder.validQuestionOrder(second.questionOrder), true)
  assert.notDeepEqual(second.questionOrder, first.questionOrder)
  assert.deepEqual(new Set(first.questionOrder.slice(0, 28)), new Set(coreQuestions.map((question) => question.id)))
  assert.deepEqual(new Set(first.questionOrder.slice(28)), new Set(tieBreakerIds))
  assert.equal(second.currentQuestionId, second.questionOrder[0])
  assert.equal(questionOrder.validQuestionOrder([...first.questionOrder.slice(0,31),first.questionOrder[0]]), false)
})

test('progress restores; corrupt, old, and invalid sessions recover safely', () => {
  const device = store({unrelated:'keep'})
  const session = {...persistence.newSession(), responses: {A1:0}, view:'question', currentQuestionId:'A2'}
  assert.equal(persistence.persistSession(device,session), true)
  assert.deepEqual(persistence.restoreSession(device).session, session)
  device.setItem(persistence.SESSION_KEY, JSON.stringify({...session, questionnaireVersion:'working-32-2026-09-26'}))
  const updated = persistence.restoreSession(device)
  assert.deepEqual(updated.session.responses,{})
  assert.match(updated.notice,/assessment was updated/)
  for (const raw of ['{', JSON.stringify({...session,responses:{M3:0}}), JSON.stringify({...session,responses:{A1:9}}), JSON.stringify({...session,completed:true})]) {
    device.setItem(persistence.SESSION_KEY,raw)
    const restored = persistence.restoreSession(device)
    assert.deepEqual(restored.session.responses,{})
    assert.match(restored.notice,/could not be restored/)
  }
  assert.equal(device.getItem('unrelated'),'keep')
  assert.equal(persistence.clearSession(device),true)
  assert.equal(device.getItem('unrelated'),'keep')
})

test('conditional tie progress persists and cannot be marked complete early', () => {
  const device = store()
  const first = persistence.newSession()
  const answers = balanced()
  const needed = tieBreak.requiredTieIds(answers, first.questionOrder)
  const halfway = { ...first, responses: answers, currentQuestionId: needed[0], view: 'question' }
  assert.equal(persistence.validateSession(halfway), true)
  assert.equal(persistence.validateSession({ ...halfway, completed: true }), false)
  assert.equal(persistence.validateSession({ ...halfway, currentQuestionId: 'E1' }), true)
  for (const id of needed) {
    const question = questions.find((item) => item.id === id)
    answers[id] = question.options.findIndex((option) => option.contribution === 1)
  }
  const done = { ...halfway, responses: answers, completed: true, view: 'results' }
  assert.equal(persistence.validateSession(done), true)
  persistence.persistSession(device, done)
  assert.deepEqual(persistence.restoreSession(device).session, done)
})

test('storage exceptions keep a usable in-memory session', () => {
  const broken = {getItem(){throw Error('blocked')},setItem(){throw Error('full')},removeItem(){throw Error('blocked')}}
  assert.equal(persistence.restoreSession(broken).available,false)
  assert.equal(persistence.persistSession(broken,persistence.newSession()),false)
  assert.equal(persistence.clearSession(broken),false)
  assert.equal(persistence.restoreSession(null).available,false)
})
