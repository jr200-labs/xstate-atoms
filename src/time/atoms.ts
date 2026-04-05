// atoms.ts
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { truncateTime, toZonedDateTime } from './utils'
import { TimeGranularity } from './types'

// --- Config Atom ---
export const epochOffsetAtom = atom<number>(0)
const epochStorageAtom = atom<number>(0)
export const epochAtom = atom(
  get => {
    return get(epochStorageAtom) + get(epochOffsetAtom)
  },
  (_get, set, newValue: number) => set(epochStorageAtom, newValue)
)

// --- Atom Family: Per-Granularity Truncated Epoch ---
export const epochRoundedFamily = atomFamily((granularity?: TimeGranularity) =>
  atom(get => {
    const epoch = get(epochAtom)
    return truncateTime(epoch, granularity)
  })
)

export const timeTzFamily = atomFamily((key: string) =>
  atom(get => {
    const [granularity, timeZone] = key.split('|')
    const truncatedEpoch = get(epochRoundedFamily(granularity as TimeGranularity))
    if (truncatedEpoch === null) {
      return null
    }
    return toZonedDateTime(truncatedEpoch, timeZone)
  })
)
