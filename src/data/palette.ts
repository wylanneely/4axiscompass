import type { PoliticalRegionId, WorldviewRegionId } from '../domain/types'

export const politicalRegions: Record<PoliticalRegionId, string> = {
  authoritarianLeft: 'Authoritarian Left',
  authoritarianRight: 'Authoritarian Right',
  libertarianRight: 'Libertarian Right',
  libertarianLeft: 'Libertarian Left',
}

export const worldviewRegions: Record<WorldviewRegionId, string> = {
  agencyProximal: 'Agency + Proximal',
  agencyUniversal: 'Agency + Universal',
  structureProximal: 'Structure + Proximal',
  structureUniversal: 'Structure + Universal',
}

export const politicalOrder: readonly PoliticalRegionId[] = [
  'authoritarianLeft', 'authoritarianRight', 'libertarianRight', 'libertarianLeft',
]
export const worldviewOrder: readonly WorldviewRegionId[] = [
  'agencyProximal', 'agencyUniversal', 'structureProximal', 'structureUniversal',
]

export interface CanonicalColor { readonly title: string; readonly name: string; readonly hex: string }
export const palette: Record<PoliticalRegionId, Record<WorldviewRegionId, CanonicalColor>> = {
  authoritarianLeft: {
    agencyProximal: { title: 'The Protector', name: 'Garnet', hex: '#A52A43' },
    agencyUniversal: { title: 'The Campaigner', name: 'Scarlet', hex: '#EE4B4B' },
    structureProximal: { title: 'The Organizer', name: 'Tangerine', hex: '#F58A38' },
    structureUniversal: { title: 'The Architect', name: 'Rose', hex: '#EBA4B2' },
  },
  authoritarianRight: {
    agencyProximal: { title: 'The Commander', name: 'Midnight blue', hex: '#244675' },
    agencyUniversal: { title: 'The Governor', name: 'Azure', hex: '#168BDD' },
    structureProximal: { title: 'The Guardian', name: 'Marigold', hex: '#D5A51D' },
    structureUniversal: { title: 'The Trustee', name: 'Butter yellow', hex: '#EFDD86' },
  },
  libertarianRight: {
    agencyProximal: { title: 'The Maverick', name: 'Fuchsia', hex: '#D42B91' },
    agencyUniversal: { title: 'The Innovator', name: 'Violet', hex: '#7550E8' },
    structureProximal: { title: 'The Traditionalist', name: 'Mulberry', hex: '#75456D' },
    structureUniversal: { title: 'The Pluralist', name: 'Lavender', hex: '#B3A0E6' },
  },
  libertarianLeft: {
    agencyProximal: { title: 'The Collaborator', name: 'Rainforest', hex: '#216F54' },
    agencyUniversal: { title: 'The Idealist', name: 'Spring green', hex: '#72BC47' },
    structureProximal: { title: 'The Humanitarian', name: 'Moss', hex: '#85934A' },
    structureUniversal: { title: 'The Empath', name: 'Ice blue', hex: '#96CFF0' },
  },
}
