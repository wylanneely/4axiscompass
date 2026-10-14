import { palette, politicalOrder, politicalRegions, worldviewOrder, worldviewRegions } from '../data/palette'
import type { PoliticalRegionId, Scores, WorldviewRegionId } from './types'

export interface CombinedRegion {
  politicalId: PoliticalRegionId
  worldviewId: WorldviewRegionId
  politicalName: string
  worldviewName: string
  title: string
  colorName: string
  hex: string
}

function assertScores(scores: Scores): void {
  const axes: readonly (keyof Scores)[] = ['economic', 'authority', 'agency', 'moralRadius']
  if (!axes.every((axis) => {
    const value = scores[axis]
    return Number.isFinite(value) && value >= -100 && value <= 100
  })) throw new Error('Invalid axis scores')
}

export function politicalRegion(scores: Scores): PoliticalRegionId | null {
  assertScores(scores)
  if (scores.economic === 0 || scores.authority === 0) return null
  if (scores.authority > 0) return scores.economic < 0 ? 'authoritarianLeft' : 'authoritarianRight'
  return scores.economic < 0 ? 'libertarianLeft' : 'libertarianRight'
}

export function worldviewRegion(scores: Scores): WorldviewRegionId | null {
  assertScores(scores)
  if (scores.agency === 0 || scores.moralRadius === 0) return null
  if (scores.agency > 0) return scores.moralRadius < 0 ? 'agencyProximal' : 'agencyUniversal'
  return scores.moralRadius < 0 ? 'structureProximal' : 'structureUniversal'
}

export function candidateRegions(scores: Scores): CombinedRegion[] {
  assertScores(scores)
  const political = politicalOrder.filter((region) =>
    (scores.authority === 0 || (scores.authority > 0) === region.startsWith('authoritarian')) &&
    (scores.economic === 0 || (scores.economic < 0) === region.endsWith('Left')))
  const worldview = worldviewOrder.filter((region) =>
    (scores.agency === 0 || (scores.agency > 0) === region.startsWith('agency')) &&
    (scores.moralRadius === 0 || (scores.moralRadius < 0) === region.endsWith('Proximal')))
  return political.flatMap((politicalId) => worldview.map((worldviewId) => ({
    politicalId, worldviewId,
    politicalName: politicalRegions[politicalId],
    worldviewName: worldviewRegions[worldviewId],
    title: palette[politicalId][worldviewId].title,
    colorName: palette[politicalId][worldviewId].name,
    hex: palette[politicalId][worldviewId].hex,
  })))
}

export function combinedRegion(scores: Scores): CombinedRegion | null {
  if (!politicalRegion(scores) || !worldviewRegion(scores)) return null
  return candidateRegions(scores)[0] ?? null
}
