import { atom } from 'jotai'

export const markdown = atom<string>('')

export const crepeAPI = atom<{
  loaded: boolean
  onExportDocx: () => Promise<void>
  update: (markdown: string) => void
}>({
  loaded: false,
  onExportDocx: async () => {},
  update: () => {},
})

export const cmAPI = atom<{
  loaded: boolean
  update: (markdown: string) => void
}>({
  loaded: false,
  update: () => {},
})

export type FocusType = 'crepe' | 'cm' | null
export const focus = atom<FocusType>(null)

export type ExpandedSide = 'cm' | 'milkdown' | null
export const expandedSide = atom<ExpandedSide>(null)