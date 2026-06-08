import { describe, expect, it } from 'vitest'
import { createEmptyDuckDbLoadMetrics, duckDbLoadMetricsFromSnapshot } from './loadMetrics'

describe('duckdb load metrics helpers', () => {
  it('returns empty metrics when the catalog snapshot has no load metrics', () => {
    expect(duckDbLoadMetricsFromSnapshot({ context: {} })).toEqual(createEmptyDuckDbLoadMetrics())
    expect(duckDbLoadMetricsFromSnapshot(undefined)).toEqual(createEmptyDuckDbLoadMetrics())
  })

  it('normalises aggregate and per-table load metrics', () => {
    expect(
      duckDbLoadMetricsFromSnapshot({
        context: {
          loadMetrics: {
            encodedBytes: 10.8,
            decodedBytes: -1,
            loadedBytes: 2048,
            byTable: {
              cargos: {
                encodedBytes: 10.8,
                decodedBytes: 128,
                loadedBytes: 2048,
              },
              empty: {
                encodedBytes: 0,
                decodedBytes: 0,
                loadedBytes: 0,
              },
            },
          },
        },
      })
    ).toEqual({
      encodedBytes: 10,
      decodedBytes: 0,
      loadedBytes: 2048,
      byTable: {
        cargos: {
          encodedBytes: 10,
          decodedBytes: 128,
          loadedBytes: 2048,
        },
      },
    })
  })
})
