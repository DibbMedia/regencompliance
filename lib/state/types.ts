export interface StateFocusArea {
  title: string
  body: string
}

export interface StateWatchItem {
  pattern: string
  why: string
}

export interface StateMeta {
  slug: string
  state: string
  abbreviation: string
  title: string
  description: string
  heroTagline: string
  intro: string
  medicalBoardName: string
  medicalBoardFocus: string
  stateAgFocus: string
  focusAreas: StateFocusArea[]
  watchItems: StateWatchItem[]
  specialtyCallouts: string[]
  disclaimer: string
  keywords: string[]
}
