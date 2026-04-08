import { describe, expect, test } from 'vitest'
import { joinLiterals } from './utils'

describe('joinLiterals', () => {
  test('joins multiple values with single quotes and commas', () => {
    expect(joinLiterals(['a', 'b', 'c'])).toBe("'a','b','c'")
  })

  test('handles single value', () => {
    expect(joinLiterals(['only'])).toBe("'only'")
  })

  test('handles empty array', () => {
    expect(joinLiterals([])).toBe('')
  })

  test('handles values with spaces', () => {
    expect(joinLiterals(['hello world', 'foo bar'])).toBe("'hello world','foo bar'")
  })

  test('handles values with special characters', () => {
    expect(joinLiterals(['it"s', "he's"])).toBe(`'it"s','he's'`)
  })
})
