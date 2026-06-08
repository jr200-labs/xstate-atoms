import { describe, expect, it } from 'vitest'
import { mergeNatsTrafficMetrics } from './traffic'

describe('nats traffic atoms helpers', () => {
  it('merges missing metrics as empty metrics', () => {
    expect(mergeNatsTrafficMetrics(undefined)).toEqual({
      uploadBytes: 0,
      downloadBytes: 0,
      bySource: {},
    })
  })

  it('aggregates root-level and per-source traffic metrics', () => {
    const metrics = mergeNatsTrafficMetrics(
      {
        uploadBytes: 10,
        downloadBytes: 5,
        bySource: {
          'nats.request': { uploadBytes: 10, downloadBytes: 5 },
        },
      },
      {
        uploadBytes: 3,
        downloadBytes: 7,
        bySource: {
          'nats.request': { uploadBytes: 3, downloadBytes: 2 },
          'nats.kv': { uploadBytes: 0, downloadBytes: 5 },
        },
      }
    )

    expect(metrics).toEqual({
      uploadBytes: 13,
      downloadBytes: 12,
      bySource: {
        'nats.request': { uploadBytes: 13, downloadBytes: 7 },
        'nats.kv': { uploadBytes: 0, downloadBytes: 5 },
      },
    })
  })
})
