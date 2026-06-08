export interface HttpTrafficMetrics {
  uploadBytes: number
  downloadBytes: number
}

export const emptyHttpTrafficMetrics: HttpTrafficMetrics = {
  uploadBytes: 0,
  downloadBytes: 0,
}

export function addHttpTrafficMetrics(
  current: HttpTrafficMetrics,
  traffic: Partial<HttpTrafficMetrics>
): HttpTrafficMetrics {
  return {
    uploadBytes: current.uploadBytes + normaliseByteCount(traffic.uploadBytes),
    downloadBytes: current.downloadBytes + normaliseByteCount(traffic.downloadBytes),
  }
}

export function resetHttpTrafficUpload(current: HttpTrafficMetrics): HttpTrafficMetrics {
  return { ...current, uploadBytes: 0 }
}

export function resetHttpTrafficDownload(current: HttpTrafficMetrics): HttpTrafficMetrics {
  return { ...current, downloadBytes: 0 }
}

export function estimateFetchUploadBytes(input: RequestInfo | URL, init?: RequestInit): number {
  const body = init?.body ?? (input instanceof Request ? input.body : undefined)
  return estimateBodyBytes(body)
}

export function estimateBodyBytes(body: BodyInit | ReadableStream<Uint8Array> | null | undefined): number {
  if (!body) return 0
  if (typeof body === 'string') return new TextEncoder().encode(body).byteLength
  if (body instanceof Blob) return body.size
  if (body instanceof ArrayBuffer) return body.byteLength
  if (ArrayBuffer.isView(body)) return body.byteLength
  if (body instanceof URLSearchParams) return new TextEncoder().encode(body.toString()).byteLength
  if (typeof FormData !== 'undefined' && body instanceof FormData) return estimateFormDataBytes(body)
  return 0
}

function estimateFormDataBytes(formData: FormData): number {
  let bytes = 0
  for (const [key, value] of formData.entries()) {
    bytes += new TextEncoder().encode(key).byteLength
    if (typeof value === 'string') {
      bytes += new TextEncoder().encode(value).byteLength
    } else {
      bytes += value.size
    }
  }
  return bytes
}

function normaliseByteCount(value: number | undefined): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return 0
  return Math.floor(value)
}
