import { describe, expect, test } from 'vitest'
import { prettyPrint, prettyPrintXState } from './prettyprint'

describe('prettyPrint', () => {
  test('handles primitives', () => {
    expect(prettyPrint('hello')).toBe('"hello"')
    expect(prettyPrint(42)).toBe('42')
    expect(prettyPrint(null)).toBe('null')
    expect(prettyPrint(true)).toBe('true')
    expect(prettyPrint(false)).toBe('false')
  })

  test('handles undefined', () => {
    expect(prettyPrint(undefined)).toBeUndefined()
  })

  test('handles simple objects', () => {
    const result = JSON.parse(prettyPrint({ a: 1, b: 'two' }))
    expect(result).toEqual({ a: 1, b: 'two' })
  })

  test('handles nested objects', () => {
    const result = JSON.parse(prettyPrint({ a: { b: { c: 3 } } }))
    expect(result).toEqual({ a: { b: { c: 3 } } })
  })

  test('handles arrays', () => {
    const result = JSON.parse(prettyPrint([1, 2, 3]))
    expect(result).toEqual([1, 2, 3])
  })

  test('handles nested arrays', () => {
    const result = JSON.parse(prettyPrint({ items: [{ id: 1 }, { id: 2 }] }))
    expect(result).toEqual({ items: [{ id: 1 }, { id: 2 }] })
  })

  test('converts Maps to objects', () => {
    const map = new Map([
      ['key1', 'value1'],
      ['key2', 'value2'],
    ])
    const result = JSON.parse(prettyPrint(map))
    expect(result).toEqual({ key1: 'value1', key2: 'value2' })
  })

  test('converts nested Maps', () => {
    const inner = new Map([['nested', 42]])
    const outer = { data: inner }
    const result = JSON.parse(prettyPrint(outer))
    expect(result).toEqual({ data: { nested: 42 } })
  })

  test('handles circular references', () => {
    const obj: any = { a: 1 }
    obj.self = obj
    const result = JSON.parse(prettyPrint(obj))
    expect(result).toEqual({ a: 1, self: '[CircularReference]' })
  })

  test('handles named functions', () => {
    function myFunc() {}
    const result = JSON.parse(prettyPrint({ fn: myFunc }))
    expect(result.fn).toBe('[Function]')
  })

  test('handles named functions with showOmitDetail', () => {
    function myFunc() {}
    const result = JSON.parse(prettyPrint({ fn: myFunc }, { showOmitDetail: true }))
    expect(result.fn).toBe('[Function: myFunc]')
  })

  test('handles anonymous functions', () => {
    const result = JSON.parse(prettyPrint({ fn: () => {} }, { showOmitDetail: true }))
    expect(result.fn).toMatch(/\[Function:/)
  })

  test('handles top-level function', () => {
    function topLevel() {}
    const result = prettyPrint(topLevel)
    expect(result).toBe('"[Function]"')
  })

  test('handles top-level function with showOmitDetail', () => {
    function topLevel() {}
    const result = prettyPrint(topLevel, { showOmitDetail: true })
    expect(result).toBe('"[Function: topLevel]"')
  })

  test('handles truly anonymous function with showOmitDetail', () => {
    // Object.defineProperty to create a function with empty name
    const fn = function () {}
    Object.defineProperty(fn, 'name', { value: '' })
    const result = JSON.parse(prettyPrint({ fn }, { showOmitDetail: true }))
    expect(result.fn).toBe('[Function: anonymous]')
  })

  // Key omission tests
  test('omits keys with dot-prefix path pattern', () => {
    const obj = { context: { connection: 'secret', name: 'test' } }
    const result = JSON.parse(prettyPrint(obj, { omitKeys: ['.context.connection'] }))
    expect(result.context.connection).toBe('[_Omit]')
    expect(result.context.name).toBe('test')
  })

  test('omits keys with path ending match', () => {
    const obj = { a: { b: { machine: 'value' } }, c: { machine: 'other' } }
    const result = JSON.parse(prettyPrint(obj, { omitKeys: ['.machine'] }))
    expect(result.a.b.machine).toBe('[_Omit]')
    expect(result.c.machine).toBe('[_Omit]')
  })

  test('omits keys with regex pattern', () => {
    const obj = { _private: 1, _hidden: 2, public: 3 }
    const result = JSON.parse(prettyPrint(obj, { omitKeys: ['^_.*'] }))
    expect(result._private).toBe('[_Omit]')
    expect(result._hidden).toBe('[_Omit]')
    expect(result.public).toBe(3)
  })

  test('omits keys with showOmitDetail', () => {
    const obj = { secret: 'value', name: 'test' }
    const result = JSON.parse(prettyPrint(obj, { omitKeys: ['.secret'], showOmitDetail: true }))
    expect(result.secret).toBe('[_Omit(secret)]')
  })

  test('omits keys in Maps with showOmitDetail', () => {
    const map = new Map<string, any>([
      ['secret', 'hidden'],
      ['name', 'visible'],
    ])
    const result = JSON.parse(prettyPrint(map, { omitKeys: ['.secret'], showOmitDetail: true }))
    expect(result.secret).toBe('[_Omit(secret)]')
    expect(result.name).toBe('visible')
  })

  test('falls back to plain key match for invalid regex', () => {
    const obj = { '[bad': 'value', other: 'ok' }
    const result = JSON.parse(prettyPrint(obj, { omitKeys: ['[bad'] }))
    expect(result['[bad']).toBe('[_Omit]')
    expect(result.other).toBe('ok')
  })

  test('omits keys in Maps without showOmitDetail', () => {
    const map = new Map<string, any>([
      ['secret', 'hidden'],
      ['name', 'visible'],
    ])
    const result = JSON.parse(prettyPrint(map, { omitKeys: ['.secret'] }))
    expect(result.secret).toBe('[_Omit]')
    expect(result.name).toBe('visible')
  })

  test('handles arrays with objects inside Maps', () => {
    const map = new Map<string, any>([['items', [{ a: 1 }, { b: 2 }]]])
    const result = JSON.parse(prettyPrint(map))
    expect(result.items).toEqual([{ a: 1 }, { b: 2 }])
  })

  // Type omission tests
  test('omits by type', () => {
    class MyClass {
      value = 42
    }
    const obj = { item: new MyClass(), name: 'test' }
    const result = JSON.parse(prettyPrint(obj, { omitTypes: ['MyClass'] }))
    expect(result.item).toBe('[_Omit]')
    expect(result.name).toBe('test')
  })

  test('omits by type with showOmitDetail', () => {
    class SubscriptionImpl {
      id = 1
    }
    const obj = { sub: new SubscriptionImpl() }
    const result = JSON.parse(prettyPrint(obj, { omitTypes: ['SubscriptionImpl'], showOmitDetail: true }))
    expect(result.sub).toBe('[_Omit(SubscriptionImpl)]')
  })

  test('shouldOmitType returns false for primitives', () => {
    const result = JSON.parse(prettyPrint({ a: 'string', b: 42 }, { omitTypes: ['String'] }))
    expect(result.a).toBe('string')
    expect(result.b).toBe(42)
  })

  test('shouldOmitType returns false for null', () => {
    const result = JSON.parse(prettyPrint({ a: null }, { omitTypes: ['Null'] }))
    expect(result.a).toBe(null)
  })

  test('handles empty options', () => {
    const result = JSON.parse(prettyPrint({ a: 1 }))
    expect(result).toEqual({ a: 1 })
  })

  test('handles empty object', () => {
    expect(prettyPrint({})).toBe('{}')
  })

  test('handles empty array', () => {
    expect(prettyPrint([])).toBe('[]')
  })

  test('regex pattern matches against full path', () => {
    const obj = { context: { auth: { token: 'secret' } } }
    const result = JSON.parse(prettyPrint(obj, { omitKeys: ['context\\.auth\\.token'] }))
    expect(result.context.auth.token).toBe('[_Omit]')
  })
})

describe('prettyPrintXState', () => {
  test('omits default keys', () => {
    const snapshot = {
      context: {
        connection: 'should-be-omitted',
        cachedKvm: 'should-be-omitted',
        duckDbHandle: 'should-be-omitted',
        name: 'visible',
      },
      machine: 'should-be-omitted',
      system: 'should-be-omitted',
      src: 'should-be-omitted',
      logic: 'should-be-omitted',
      options: 'should-be-omitted',
      children: 'should-be-omitted',
    }
    const result = JSON.parse(prettyPrintXState(snapshot))
    expect(result.context.connection).toBe('[_Omit]')
    expect(result.context.cachedKvm).toBe('[_Omit]')
    expect(result.context.duckDbHandle).toBe('[_Omit]')
    expect(result.context.name).toBe('visible')
    expect(result.machine).toBe('[_Omit]')
    expect(result.system).toBe('[_Omit]')
    expect(result.src).toBe('[_Omit]')
    expect(result.logic).toBe('[_Omit]')
    expect(result.options).toBe('[_Omit]')
    expect(result.children).toBe('[_Omit]')
  })

  test('omits auth-related keys', () => {
    const snapshot = {
      context: {},
      auth: {
        sentinelB64: 'secret',
        user: 'secret',
        pass: 'secret',
        token: 'secret',
        visible: 'ok',
      },
    }
    const result = JSON.parse(prettyPrintXState(snapshot))
    expect(result.auth.sentinelB64).toBe('[_Omit]')
    expect(result.auth.user).toBe('[_Omit]')
    expect(result.auth.pass).toBe('[_Omit]')
    expect(result.auth.token).toBe('[_Omit]')
    expect(result.auth.visible).toBe('ok')
  })

  test('omits keys matching underscore regex pattern', () => {
    const snapshot = { _internal: 'hidden', _state: 'hidden', visible: 'ok' }
    const result = JSON.parse(prettyPrintXState(snapshot))
    expect(result._internal).toBe('[_Omit]')
    expect(result._state).toBe('[_Omit]')
    expect(result.visible).toBe('ok')
  })

  test('omits SubscriptionImpl type by default', () => {
    class SubscriptionImpl {
      id = 1
    }
    const snapshot = { sub: new SubscriptionImpl() }
    const result = JSON.parse(prettyPrintXState(snapshot))
    expect(result.sub).toBe('[_Omit]')
  })

  test('accepts additional omit keys', () => {
    const snapshot = { customKey: 'hidden', visible: 'ok' }
    const result = JSON.parse(prettyPrintXState(snapshot, ['.customKey']))
    expect(result.customKey).toBe('[_Omit]')
    expect(result.visible).toBe('ok')
  })

  test('accepts additional omit types', () => {
    class CustomType {
      value = 1
    }
    const snapshot = { item: new CustomType() }
    const result = JSON.parse(prettyPrintXState(snapshot, [], ['CustomType']))
    expect(result.item).toBe('[_Omit]')
  })

  test('showOmitDetail works', () => {
    const snapshot = { machine: 'value' }
    const result = JSON.parse(prettyPrintXState(snapshot, [], [], true))
    expect(result.machine).toBe('[_Omit(machine)]')
  })

  test('default omits context.cachedConnection', () => {
    const snapshot = { context: { cachedConnection: 'secret', ok: 'visible' } }
    const result = JSON.parse(prettyPrintXState(snapshot))
    expect(result.context.cachedConnection).toBe('[_Omit]')
    expect(result.context.ok).toBe('visible')
  })
})
