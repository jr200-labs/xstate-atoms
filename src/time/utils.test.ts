import { describe, expect, test } from 'vitest'
import { Temporal } from '@js-temporal/polyfill'
import { truncateTime, toZonedDateTime, getLocalTimeZone } from './utils'

const FIXED_EPOCH = Temporal.Instant.from('2024-03-15T12:34:56.789Z').epochMilliseconds

describe('truncateTime', () => {
  test('returns unchanged epoch when granularity is undefined', () => {
    expect(truncateTime(FIXED_EPOCH)).toBe(FIXED_EPOCH)
  })

  test('truncates to millisecond (no-op)', () => {
    expect(truncateTime(FIXED_EPOCH, 'millisecond')).toBe(FIXED_EPOCH)
  })

  test('truncates to second', () => {
    const result = truncateTime(FIXED_EPOCH, 'second')
    const expected = Math.floor(FIXED_EPOCH / 1000) * 1000
    expect(result).toBe(expected)
    // Verify milliseconds are zeroed
    expect(result % 1000).toBe(0)
  })

  test('truncates to minute', () => {
    const result = truncateTime(FIXED_EPOCH, 'minute')
    const msPerMinute = 60 * 1000
    const expected = Math.floor(FIXED_EPOCH / msPerMinute) * msPerMinute
    expect(result).toBe(expected)
    expect(result % msPerMinute).toBe(0)
  })

  test('truncates to hour', () => {
    const result = truncateTime(FIXED_EPOCH, 'hour')
    const msPerHour = 60 * 60 * 1000
    const expected = Math.floor(FIXED_EPOCH / msPerHour) * msPerHour
    expect(result).toBe(expected)
    expect(result % msPerHour).toBe(0)
  })

  test('truncates to day', () => {
    const result = truncateTime(FIXED_EPOCH, 'day')
    const msPerDay = 24 * 60 * 60 * 1000
    const expected = Math.floor(FIXED_EPOCH / msPerDay) * msPerDay
    expect(result).toBe(expected)
    expect(result % msPerDay).toBe(0)
  })

  test('handles epoch zero', () => {
    expect(truncateTime(0, 'hour')).toBe(0)
  })
})

describe('toZonedDateTime', () => {
  test('converts epoch to UTC zoned datetime', () => {
    const zdt = toZonedDateTime(FIXED_EPOCH, 'UTC')
    expect(zdt.timeZoneId).toBe('UTC')
    expect(zdt.epochMilliseconds).toBe(FIXED_EPOCH)
    expect(zdt.year).toBe(2024)
    expect(zdt.month).toBe(3)
    expect(zdt.day).toBe(15)
    expect(zdt.hour).toBe(12)
    expect(zdt.minute).toBe(34)
    expect(zdt.second).toBe(56)
  })

  test('converts epoch to Tokyo timezone', () => {
    const zdt = toZonedDateTime(FIXED_EPOCH, 'Asia/Tokyo')
    expect(zdt.timeZoneId).toBe('Asia/Tokyo')
    expect(zdt.epochMilliseconds).toBe(FIXED_EPOCH)
    // Tokyo is UTC+9, so 12:34 UTC = 21:34 Tokyo
    expect(zdt.hour).toBe(21)
  })

  test('converts epoch to New York timezone', () => {
    const zdt = toZonedDateTime(FIXED_EPOCH, 'America/New_York')
    expect(zdt.timeZoneId).toBe('America/New_York')
    expect(zdt.epochMilliseconds).toBe(FIXED_EPOCH)
  })

  test('preserves millisecond precision', () => {
    const zdt = toZonedDateTime(FIXED_EPOCH, 'UTC')
    expect(zdt.millisecond).toBe(789)
  })

  test('returns Temporal.ZonedDateTime instance', () => {
    const zdt = toZonedDateTime(FIXED_EPOCH, 'UTC')
    expect(zdt).toBeInstanceOf(Temporal.ZonedDateTime)
  })
})

describe('getLocalTimeZone', () => {
  test('returns a non-empty string', () => {
    const tz = getLocalTimeZone()
    expect(typeof tz).toBe('string')
    expect(tz.length).toBeGreaterThan(0)
  })

  test('returns a valid IANA timezone identifier', () => {
    const tz = getLocalTimeZone()
    // IANA timezone identifiers contain a slash (e.g., "America/New_York")
    // or are "UTC"
    expect(tz).toMatch(/^[A-Za-z_]+\/[A-Za-z_]+|^UTC$/)
  })
})
