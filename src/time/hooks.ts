// hooks.ts
import { useStore } from 'jotai'
import { epochRoundedFamily, timeTzFamily } from './atoms'
import { TimeGranularity } from './types'
import { getLocalTimeZone } from './utils'

type Store = ReturnType<typeof useStore>

export function useEpochWithStore(store: Store, granularity?: TimeGranularity) {
  const epoch = store.get(epochRoundedFamily(granularity))
  return epoch
}

export function useEpoch(granularity?: TimeGranularity) {
  return useEpochWithStore(useStore(), granularity)
}

export function useZonedTimeWithStore(store: Store, granularity?: TimeGranularity, timeZone?: string) {
  if (!granularity) {
    granularity = 'millisecond'
  }

  if (!timeZone) {
    timeZone = getLocalTimeZone()
  }

  const zonedTime = store.get(timeTzFamily(`${granularity}|${timeZone}`))
  return zonedTime
}

export function useZonedTime(granularity?: TimeGranularity, timeZone?: string) {
  return useZonedTimeWithStore(useStore(), granularity, timeZone)
}
