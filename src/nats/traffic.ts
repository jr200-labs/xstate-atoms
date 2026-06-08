export type NatsTrafficMetricSource = 'nats.publish' | 'nats.request' | 'nats.subscribe' | 'nats.kv'

export interface NatsTrafficMetricBucket {
  uploadBytes: number
  downloadBytes: number
}

export interface NatsTrafficMetrics extends NatsTrafficMetricBucket {
  bySource: Partial<Record<NatsTrafficMetricSource, NatsTrafficMetricBucket>>
}

export type NatsTrafficResetEvent =
  | { type: 'METRICS.RESET_UPLOAD'; source?: NatsTrafficMetricSource }
  | { type: 'METRICS.RESET_DOWNLOAD'; source?: NatsTrafficMetricSource }
  | { type: 'METRICS.RESET_ALL'; source?: NatsTrafficMetricSource }

export const emptyNatsTrafficMetrics: NatsTrafficMetrics = {
  uploadBytes: 0,
  downloadBytes: 0,
  bySource: {},
}

export function mergeNatsTrafficMetrics(...metrics: Array<NatsTrafficMetrics | undefined>): NatsTrafficMetrics {
  return metrics.reduce<NatsTrafficMetrics>((aggregate, metric) => {
    if (!metric) return aggregate

    const bySource = { ...aggregate.bySource }
    for (const [source, sourceMetrics] of Object.entries(metric.bySource)) {
      if (!sourceMetrics) continue

      const typedSource = source as NatsTrafficMetricSource
      const current = bySource[typedSource] ?? { uploadBytes: 0, downloadBytes: 0 }
      bySource[typedSource] = {
        uploadBytes: current.uploadBytes + sourceMetrics.uploadBytes,
        downloadBytes: current.downloadBytes + sourceMetrics.downloadBytes,
      }
    }

    return {
      uploadBytes: aggregate.uploadBytes + metric.uploadBytes,
      downloadBytes: aggregate.downloadBytes + metric.downloadBytes,
      bySource,
    }
  }, emptyNatsTrafficMetrics)
}

export function trafficMetricsFromSnapshot(snapshot: unknown): NatsTrafficMetrics | undefined {
  return (snapshot as { context?: { trafficMetrics?: NatsTrafficMetrics } } | undefined)?.context?.trafficMetrics
}
