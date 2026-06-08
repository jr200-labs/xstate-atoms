import { describe, expect, it } from 'vitest'
import {
  addHttpTrafficMetrics,
  emptyHttpTrafficMetrics,
  estimateBodyBytes,
  resetHttpTrafficDownload,
  resetHttpTrafficUpload,
} from './traffic'

describe('http traffic helpers', () => {
  it('adds normalised traffic metrics', () => {
    expect(addHttpTrafficMetrics(emptyHttpTrafficMetrics, { uploadBytes: 10.8, downloadBytes: -1 })).toEqual({
      uploadBytes: 10,
      downloadBytes: 0,
    })
  })

  it('resets upload and download independently', () => {
    const metrics = { uploadBytes: 12, downloadBytes: 34 }

    expect(resetHttpTrafficUpload(metrics)).toEqual({ uploadBytes: 0, downloadBytes: 34 })
    expect(resetHttpTrafficDownload(metrics)).toEqual({ uploadBytes: 12, downloadBytes: 0 })
  })

  it('estimates body byte counts for common fetch body types', () => {
    expect(estimateBodyBytes('hello')).toBe(5)
    expect(estimateBodyBytes(new Uint8Array([1, 2, 3]))).toBe(3)
    expect(estimateBodyBytes(new URLSearchParams({ a: 'b' }))).toBe(3)
    expect(estimateBodyBytes(null)).toBe(0)
  })
})
