import type { AxisId, Contribution, FiveOptions, FourOptions, Polarity, Question, QuestionId } from '../domain/types'

export const QUESTIONNAIRE_VERSION = 'working-conditional-2026-10-13-v0.2'

const standardLabels = ['Strongly disagree', 'Disagree', 'Agree', 'Strongly agree'] as const
const midpointLabels = ['Strongly disagree', 'Disagree', 'Neither agree nor disagree', 'Agree', 'Strongly agree'] as const
const fourPositiveValues = [-2, -1, 1, 2] as const
const fourNegativeValues = [2, 1, -1, -2] as const
const positiveValues = [-2, -1, 0, 1, 2] as const
const negativeValues = [2, 1, 0, -1, -2] as const

function makeOptions<T extends readonly string[]>(labels: T, values: readonly Contribution[]): FourOptions | FiveOptions {
  return labels.map((label, index) => ({ label, contribution: values[index] })) as unknown as FourOptions | FiveOptions
}

function statement(id: QuestionId, axis: AxisId, prompt: string, polarity: Polarity, midpoint = false): Question {
  const options = midpoint
    ? makeOptions(midpointLabels, polarity === 'positive' ? positiveValues : negativeValues)
    : makeOptions(standardLabels, polarity === 'positive' ? fourPositiveValues : fourNegativeValues)
  return { id, axis, kind: 'statement', prompt, polarity, options }
}

function scenario(id: QuestionId, axis: AxisId, prompt: string, choices: readonly [string, string, string, string, string], values: readonly [Contribution, Contribution, Contribution, Contribution, Contribution]): Question {
  return { id, axis, kind: 'scenario', prompt, options: makeOptions(choices, values) }
}

const agencyScenarioChoices = [
  'Much more individual choices/effort',
  'Somewhat more individual choices/effort',
  'About equally',
  'Somewhat more circumstances/starting conditions',
  'Much more circumstances/starting conditions',
] as const

export const questions: readonly Question[] = [
  statement('A1', 'agency', "Over several years, a person’s repeated choices have more influence on their life direction than circumstances they did not choose.", 'positive'),
  statement('A2', 'agency', "Even when someone faces major disadvantages early in life, such as poverty or a disability, good habits, practical skills, and thoughtful decisions can substantially improve their long-term prospects.", 'positive'),
  statement('A3', 'agency', "People with the same starting opportunities end up in very different situations mainly because of how they respond to those opportunities.", 'positive'),
  statement('A4', 'agency', "A person’s living conditions—such as family, neighborhood, education, health, and social connections—explain more of their long-term outcomes than differences in effort and personal choices.", 'negative'),
  statement('A5', 'agency', "What looks like poor decision-making is better explained by limiting circumstances than by the person’s own character or willpower.", 'negative'),
  statement('A6', 'agency', "Chance, timing, and conditions outside a person’s control usually matter more than their own choices in determining long-term outcomes.", 'negative'),
  scenario('A7', 'agency', "Someone grows up poor and leaves school early to help support their family. As an adult they also make several avoidable financial decisions and remain financially unstable at age 40. Which factor carries more weight?", agencyScenarioChoices, [2, 1, 0, -1, -2]),
  scenario('A8', 'agency', "Someone grows up wealthy, receives an excellent education and early financial backing, but also works exceptionally hard, takes repeated risks, and builds a successful company after several failures. Which factor carries more weight?", agencyScenarioChoices, [2, 1, 0, -1, -2]),
  statement('M1', 'moralRadius', "When resources are limited, a government should prioritize the needs of its own citizens over equally serious needs in other countries.", 'negative'),
  statement('M2', 'moralRadius', "People have stronger obligations to their family and close community than to strangers, even when the strangers’ needs are greater.", 'negative'),
  statement('M4', 'moralRadius', "A person’s well-being should be given the same moral weight regardless of which country they are from.", 'positive'),
  statement('M5', 'moralRadius', "A government should accept a small negative impact on its own country if doing so prevents a much larger harm in another country.", 'positive'),
  statement('M6', 'moralRadius', "If preventing serious harm to future generations requires a meaningful cost today, people living today should accept that cost.", 'positive'),
  scenario('M7', 'moralRadius', "A government has a fixed budget for a life-saving program. It can save an estimated 5,000 lives in its own country or 20,000 lives in another country. Estimates are equally reliable and there are no other strategic effects. Which should receive priority?", ["Strongly prioritize people within its own country", "Somewhat prioritize people within its own country", "Give both groups equal moral priority", "Somewhat prioritize the larger number of people abroad", "Strongly prioritize the larger number of people abroad"], [-2, -1, 0, 1, 2]),
  scenario('M8', 'moralRadius', "A policy would impose a noticeable but manageable cost on people living today. The best evidence shows it would prevent much larger harms to people living 50 years from now. Which group should receive more weight?", ["Much more weight to people living today", "Somewhat more weight to people living today", "About equal weight", "Somewhat more weight to future generations", "Much more weight to future generations"], [-2, -1, 0, 1, 2]),
  statement('M9', 'moralRadius', "National borders should carry little moral weight when deciding how to allocate limited resources that could reduce serious suffering.", 'positive'),
  statement('AU1', 'authority', "Adults should generally be free to make risky personal choices as long as they are not directly harming other people.", 'negative'),
  statement('AU2', 'authority', "The government should tolerate offensive or disturbing speech unless it directly threatens or incites harm.", 'negative'),
  statement('AU3', 'authority', "Maintaining public order does not usually justify restricting peaceful protest or political dissent.", 'negative'),
  statement('AU4', 'authority', "It is better for a society to restrict personal freedoms than to risk public safety and disorder.", 'positive'),
  statement('AU5', 'authority', "Protecting the overall security of a society justifies taking away significant individual liberties.", 'positive'),
  statement('AU6', 'authority', "During a major public emergency, temporary restrictions on individual freedom can be justified if they substantially reduce harm to the population.", 'positive'),
  scenario('AU7', 'authority', "Authorities could substantially reduce violent crime by expanding camera surveillance and automated identification in public spaces, but this would allow the government to track much more of ordinary citizens’ movements. Which should receive more weight?", ["Much more individual privacy", "Somewhat more individual privacy", "About equally", "Somewhat more public safety", "Much more public safety"], [-2, -1, 0, 1, 2]),
  scenario('AU8', 'authority', "A political group expresses views that most people find deeply offensive and socially disruptive, but it does not advocate violence. Local officials want to prohibit its public demonstrations to maintain order. Which should receive more weight?", ["Much more freedom of expression", "Somewhat more freedom of expression", "About equally", "Somewhat more public order", "Much more public order"], [-2, -1, 0, 1, 2]),
  statement('E1', 'economic', "People should generally be free to set prices, wages, and terms of exchange without government interference, even when the resulting outcomes are unequal.", 'positive'),
  statement('E2', 'economic', "Individuals should be allowed to keep most of the income and wealth they legally earn, even when this results in large differences in wealth between people.", 'positive'),
  statement('E3', 'economic', "When both government and private businesses can provide the same service at the same cost, private provision should generally be preferred unless there is a clear reason it cannot work effectively.", 'positive'),
  statement('E4', 'economic', "Government should use taxation and redistribution to reduce large economic inequalities, even if doing so somewhat reduces incentives to earn, invest, or build businesses.", 'negative'),
  statement('E5', 'economic', "When markets leave many people unable to afford basic necessities, government should redistribute resources to ensure those necessities are available.", 'negative'),
  statement('E6', 'economic', "Essential services should sometimes be publicly provided even when private companies could provide them more efficiently, if public provision guarantees broader access.", 'negative'),
  scenario('E7', 'economic', "Imagine a necessary service that can be provided in two ways. Private companies can provide it at lower overall cost, but 1 in 12 people would be unable to afford it. A public program would cost more overall but guarantee access to everyone. Which consideration should receive more weight?", ["Much more weight to lower cost and private provision", "Somewhat more weight to lower cost and private provision", "About equal weight", "Somewhat more weight to universal access and public provision", "Much more weight to universal access and public provision"], [2, 1, 0, -1, -2]),
  scenario('E8', 'economic', "A new tax on very high incomes would substantially increase funding for services used by people with lower incomes. It would also moderately reduce private investment and the number of new businesses being started. Assume both effects are equally well supported by evidence. Which consideration should receive more weight?", ["Much more weight to preserving investment and business formation", "Somewhat more weight to preserving investment and business formation", "About equal weight", "Somewhat more weight to increased public services and redistribution", "Much more weight to increased public services and redistribution"], [2, 1, 0, -1, -2]),
]

export const questionById = new Map(questions.map((question) => [question.id, question]))

// These existing four-choice statements are held back for a final tie only.
export const tieBreakerIds = ['A6', 'M9', 'AU6', 'E6'] as const
export const tieBreakerIdSet = new Set<QuestionId>(tieBreakerIds)
export const coreQuestions = questions.filter((question) => !tieBreakerIdSet.has(question.id))
