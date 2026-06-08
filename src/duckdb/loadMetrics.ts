export interface DuckDbLoadMetricBucket {
  encodedBytes: number
  decodedBytes: number
  loadedBytes: number
}

export interface DuckDbLoadMetrics extends DuckDbLoadMetricBucket {
  byTable: Partial<Record<string, DuckDbLoadMetricBucket>>
}

export interface DuckDbLoadMetricsResetEvent {
  type: 'CATALOG.METRICS.RESET_LOADS'
  tableSpecName?: string
}

export function createEmptyDuckDbLoadMetrics(): DuckDbLoadMetrics {
  return {
    encodedBytes: 0,
    decodedBytes: 0,
    loadedBytes: 0,
    byTable: {},
  }
}

export function duckDbLoadMetricsFromSnapshot(snapshot: unknown): DuckDbLoadMetrics {
  const metrics = getSnapshotContext(snapshot).loadMetrics
  if (!isDuckDbLoadMetrics(metrics)) return createEmptyDuckDbLoadMetrics()

  return {
    encodedBytes: normaliseByteCount(metrics.encodedBytes),
    decodedBytes: normaliseByteCount(metrics.decodedBytes),
    loadedBytes: normaliseByteCount(metrics.loadedBytes),
    byTable: normaliseTableMetrics(metrics.byTable),
  }
}

function getSnapshotContext(snapshot: unknown): Record<string, unknown> {
  if (!snapshot || typeof snapshot !== 'object') return {}
  const context = (snapshot as { context?: unknown }).context
  if (!context || typeof context !== 'object') return {}
  return context as Record<string, unknown>
}

function isDuckDbLoadMetrics(value: unknown): value is Partial<DuckDbLoadMetrics> {
  return Boolean(value && typeof value === 'object')
}

function normaliseTableMetrics(value: unknown): Partial<Record<string, DuckDbLoadMetricBucket>> {
  if (!value || typeof value !== 'object') return {}

  const byTable: Partial<Record<string, DuckDbLoadMetricBucket>> = {}
  for (const [tableSpecName, metrics] of Object.entries(
    value as Record<string, Partial<DuckDbLoadMetricBucket>>
  )) {
    const tableMetrics = {
      encodedBytes: normaliseByteCount(metrics?.encodedBytes),
      decodedBytes: normaliseByteCount(metrics?.decodedBytes),
      loadedBytes: normaliseByteCount(metrics?.loadedBytes),
    }
    if (tableMetrics.encodedBytes > 0 || tableMetrics.decodedBytes > 0 || tableMetrics.loadedBytes > 0) {
      byTable[tableSpecName] = tableMetrics
    }
  }
  return byTable
}

function normaliseByteCount(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return 0
  return Math.floor(value)
}
