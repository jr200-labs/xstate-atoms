import { estimateFetchUploadBytes, type HttpTrafficMetrics } from './traffic'

export type HttpTrafficRecorder = (traffic: Partial<HttpTrafficMetrics>) => void

let activeInstrumentation: { restore: () => void } | null = null

export function installFetchHttpTrafficInstrumentation(record: HttpTrafficRecorder): () => void {
  if (typeof window === 'undefined') return () => undefined

  if (activeInstrumentation) {
    activeInstrumentation.restore()
  }

  const originalFetch = window.fetch.bind(window)
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const uploadBytes = estimateFetchUploadBytes(input, init)
    const response = await originalFetch(input, init)

    void response
      .clone()
      .arrayBuffer()
      .then(buffer => {
        record({
          uploadBytes,
          downloadBytes: buffer.byteLength,
        })
      })
      .catch(() => {
        record({ uploadBytes })
      })

    return response
  }

  activeInstrumentation = {
    restore() {
      window.fetch = originalFetch
      activeInstrumentation = null
    },
  }

  return activeInstrumentation.restore
}
