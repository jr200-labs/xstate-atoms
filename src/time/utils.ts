// utils.ts
import { Temporal } from '@js-temporal/polyfill'
import { TimeGranularity } from './types'

// --- Helpers ---
export function truncateTime(epochMs: number, granularity?: TimeGranularity): number {
  if (!granularity) return epochMs

  const msMap: Record<TimeGranularity, number> = {
    millisecond: 1,
    second: 1000,
    minute: 60 * 1000,
    hour: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
  }

  const ms = msMap[granularity as keyof typeof msMap]
  return Math.floor(epochMs / ms) * ms
}

export function toZonedDateTime(epochMs: number, timeZone: string): Temporal.ZonedDateTime {
  const instant = Temporal.Instant.fromEpochMilliseconds(epochMs)
  return instant.toZonedDateTimeISO(timeZone)
}

export const getLocalTimeZone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}
