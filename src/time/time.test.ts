import { getDefaultStore } from 'jotai'
import { epochAtom, epochOffsetAtom, epochRoundedFamily, timeTzFamily } from './atoms'
import { Temporal } from '@js-temporal/polyfill'
import { expect, test, beforeEach } from 'vitest'
import { TimeGranularity } from './types'

const store = getDefaultStore()

const FIXED_EPOCH = Temporal.Instant.from('2024-03-15T12:34:56.789Z').epochMilliseconds

beforeEach(() => {
  store.set(epochOffsetAtom, 0)
  store.set(epochAtom, 0)
})

test('truncates to minute correctly', () => {
  store.set(epochAtom, FIXED_EPOCH)
  const val = store.get(epochRoundedFamily('minute'))
  const expected = Temporal.Instant.fromEpochMilliseconds(FIXED_EPOCH)
    .toZonedDateTimeISO('UTC')
    .with({ second: 0, millisecond: 0, microsecond: 0, nanosecond: 0 })
    .toInstant().epochMilliseconds
  expect(val).toBe(expected)
})

test('truncates to hour correctly', () => {
  store.set(epochAtom, FIXED_EPOCH)
  const val = store.get(epochRoundedFamily('hour'))
  const expected = Temporal.Instant.fromEpochMilliseconds(FIXED_EPOCH)
    .toZonedDateTimeISO('UTC')
    .with({ minute: 0, second: 0, millisecond: 0, microsecond: 0, nanosecond: 0 })
    .toInstant().epochMilliseconds
  expect(val).toBe(expected)
})

test('does not truncate with undefined granularity', () => {
  store.set(epochAtom, FIXED_EPOCH)
  const val = store.get(epochRoundedFamily(undefined))
  expect(val).toBe(FIXED_EPOCH)
})

test('zoned time uses correct time zone', () => {
  const zdt = store.get(timeTzFamily('minute|Asia/Tokyo'))
  expect(zdt?.timeZoneId).toBe('Asia/Tokyo')
  expect(zdt?.epochMilliseconds).toBe(store.get(epochRoundedFamily('minute')))
})

function getExpectedTruncation(epoch: number, granularity: TimeGranularity): number {
  const date = Temporal.Instant.fromEpochMilliseconds(epoch).toZonedDateTimeISO('UTC')

  const rounded = {
    day: date.with({ hour: 0, minute: 0, second: 0, millisecond: 0, microsecond: 0, nanosecond: 0 }),
    hour: date.with({ minute: 0, second: 0, millisecond: 0, microsecond: 0, nanosecond: 0 }),
    minute: date.with({ second: 0, millisecond: 0, microsecond: 0, nanosecond: 0 }),
    second: date.with({ millisecond: 0, microsecond: 0, nanosecond: 0 }),
    millisecond: date,
  }[granularity]

  return rounded.toInstant().epochMilliseconds
}

test('offset correctly applied in fixed mode', () => {
  store.set(epochOffsetAtom, 5000) // +5 seconds
  store.set(epochAtom, FIXED_EPOCH)

  const epoch = store.get(epochRoundedFamily('second'))
  const expected = getExpectedTruncation(FIXED_EPOCH + 5000, 'second')
  expect(epoch).toBe(expected)
})

test('offset correctly subtracted in fixed mode', () => {
  store.set(epochOffsetAtom, -1000)
  store.set(epochAtom, FIXED_EPOCH)

  const epoch = store.get(epochRoundedFamily('second'))
  const expected = getExpectedTruncation(FIXED_EPOCH - 1000, 'second')
  expect(epoch).toBe(expected)
})

test('time with offset adds offset', () => {
  store.set(epochOffsetAtom, 60_000) // +1 minute

  const now = Temporal.Now.instant().epochMilliseconds
  store.set(epochAtom, now)
  const expected = getExpectedTruncation(now + 60_000, 'minute')
  const result = store.get(epochRoundedFamily('minute'))
  expect(result).toBe(expected)
})

test('time is initially undefined', () => {
  store.set(epochOffsetAtom, 0)

  const result = store.get(epochRoundedFamily('minute'))
  expect(result).toBe(0)
})

test('time can be injected manually', () => {
  const testEpoch = Temporal.Instant.from('2025-01-01T00:01:30Z').epochMilliseconds

  store.set(epochOffsetAtom, 0)

  // Manually inject epochAtom
  store.set(epochAtom, testEpoch)

  const truncated = store.get(epochRoundedFamily('minute'))
  const expected = Temporal.Instant.fromEpochMilliseconds(testEpoch)
    .toZonedDateTimeISO('UTC')
    .with({ second: 0, millisecond: 0, microsecond: 0, nanosecond: 0 })
    .toInstant().epochMilliseconds

  expect(truncated).toBe(expected)
})

test('minute-level atom does not update when only seconds change', () => {
  // Track subscription calls
  let updateCount = 0
  const updateValues: number[] = []

  // Set up external time source
  store.set(epochOffsetAtom, 0)

  // Subscribe to minute-level atom
  const minuteAtom = epochRoundedFamily('minute')
  const unsubscribe = store.sub(minuteAtom, () => {
    updateCount++
    updateValues.push(store.get(minuteAtom))
  })

  try {
    // Set initial time: 12:34:30.000
    const baseTime = Temporal.Instant.from('2024-03-15T12:34:30.000Z').epochMilliseconds
    store.set(epochAtom, baseTime)

    // Get initial minute value
    const initialMinuteValue = store.get(minuteAtom)
    const expectedMinuteValue = Temporal.Instant.fromEpochMilliseconds(baseTime)
      .toZonedDateTimeISO('UTC')
      .with({ second: 0, millisecond: 0, microsecond: 0, nanosecond: 0 })
      .toInstant().epochMilliseconds

    expect(initialMinuteValue).toBe(expectedMinuteValue)

    // Clear tracking after initial setup
    updateCount = 0
    updateValues.length = 0

    // Update to change only seconds: 12:34:45.000 (same minute)
    const updatedTime = Temporal.Instant.from('2024-03-15T12:34:45.000Z').epochMilliseconds
    store.set(epochAtom, updatedTime)

    // Verify no subscription updates occurred
    expect(updateCount).toBe(0)
    expect(updateValues).toHaveLength(0)

    // Verify the minute value is still the same
    const finalMinuteValue = store.get(minuteAtom)
    expect(finalMinuteValue).toBe(expectedMinuteValue)

    // Now update to change the minute: 12:35:15.000 (different minute)
    const newMinuteTime = Temporal.Instant.from('2024-03-15T12:35:15.000Z').epochMilliseconds
    store.set(epochAtom, newMinuteTime)

    // Verify subscription update occurred
    expect(updateCount).toBe(1)
    expect(updateValues).toHaveLength(1)

    // Verify the new minute value is correct
    const newExpectedMinuteValue = Temporal.Instant.fromEpochMilliseconds(newMinuteTime)
      .toZonedDateTimeISO('UTC')
      .with({ second: 0, millisecond: 0, microsecond: 0, nanosecond: 0 })
      .toInstant().epochMilliseconds

    const updatedMinuteValue = store.get(minuteAtom)
    expect(updatedMinuteValue).toBe(newExpectedMinuteValue)
    expect(updateValues[0]).toBe(newExpectedMinuteValue)
  } finally {
    unsubscribe()
  }
})
