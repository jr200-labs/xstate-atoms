import { describe, expect, test, beforeEach } from 'vitest'
import { getDefaultStore } from 'jotai'
import { Temporal } from '@js-temporal/polyfill'
import { epochAtom, epochOffsetAtom } from './atoms'
import { useEpochWithStore, useZonedTimeWithStore } from './hooks'

const store = getDefaultStore()
const FIXED_EPOCH = Temporal.Instant.from('2024-03-15T12:34:56.789Z').epochMilliseconds

beforeEach(() => {
  store.set(epochOffsetAtom, 0)
  store.set(epochAtom, 0)
})

describe('useEpochWithStore', () => {
  test('returns epoch without granularity', () => {
    store.set(epochAtom, FIXED_EPOCH)
    const result = useEpochWithStore(store)
    expect(result).toBe(FIXED_EPOCH)
  })

  test('returns truncated epoch with minute granularity', () => {
    store.set(epochAtom, FIXED_EPOCH)
    const result = useEpochWithStore(store, 'minute')
    const msPerMinute = 60 * 1000
    const expected = Math.floor(FIXED_EPOCH / msPerMinute) * msPerMinute
    expect(result).toBe(expected)
  })

  test('returns truncated epoch with hour granularity', () => {
    store.set(epochAtom, FIXED_EPOCH)
    const result = useEpochWithStore(store, 'hour')
    const msPerHour = 60 * 60 * 1000
    const expected = Math.floor(FIXED_EPOCH / msPerHour) * msPerHour
    expect(result).toBe(expected)
  })

  test('returns 0 when epoch is not set', () => {
    const result = useEpochWithStore(store)
    expect(result).toBe(0)
  })

  test('includes offset in result', () => {
    store.set(epochOffsetAtom, 5000)
    store.set(epochAtom, FIXED_EPOCH)
    const result = useEpochWithStore(store, 'second')
    const expected = Math.floor((FIXED_EPOCH + 5000) / 1000) * 1000
    expect(result).toBe(expected)
  })
})

describe('useZonedTimeWithStore', () => {
  test('returns zoned time with explicit timezone', () => {
    store.set(epochAtom, FIXED_EPOCH)
    const result = useZonedTimeWithStore(store, 'minute', 'UTC')
    expect(result).not.toBeNull()
    expect(result!.timeZoneId).toBe('UTC')
  })

  test('returns zoned time with Tokyo timezone', () => {
    store.set(epochAtom, FIXED_EPOCH)
    const result = useZonedTimeWithStore(store, 'minute', 'Asia/Tokyo')
    expect(result).not.toBeNull()
    expect(result!.timeZoneId).toBe('Asia/Tokyo')
  })

  test('defaults granularity to millisecond when undefined', () => {
    store.set(epochAtom, FIXED_EPOCH)
    const result = useZonedTimeWithStore(store, undefined, 'UTC')
    expect(result).not.toBeNull()
    expect(result!.epochMilliseconds).toBe(FIXED_EPOCH)
  })

  test('defaults timezone to local when undefined', () => {
    store.set(epochAtom, FIXED_EPOCH)
    const result = useZonedTimeWithStore(store)
    expect(result).not.toBeNull()
    // Should use local timezone
    const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone
    expect(result!.timeZoneId).toBe(localTz)
  })

  test('truncates to specified granularity', () => {
    store.set(epochAtom, FIXED_EPOCH)
    const result = useZonedTimeWithStore(store, 'hour', 'UTC')
    expect(result).not.toBeNull()
    expect(result!.minute).toBe(0)
    expect(result!.second).toBe(0)
    expect(result!.millisecond).toBe(0)
  })
})
