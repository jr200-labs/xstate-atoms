import { atom } from 'jotai'
import {
  addHttpTrafficMetrics,
  emptyHttpTrafficMetrics,
  resetHttpTrafficDownload,
  resetHttpTrafficUpload,
  type HttpTrafficMetrics,
} from './traffic'

export {
  addHttpTrafficMetrics,
  emptyHttpTrafficMetrics,
  estimateBodyBytes,
  estimateFetchUploadBytes,
  resetHttpTrafficDownload,
  resetHttpTrafficUpload,
  type HttpTrafficMetrics,
} from './traffic'
export { installFetchHttpTrafficInstrumentation, type HttpTrafficRecorder } from './fetchInstrumentation'

export const httpTrafficMetricsAtom = atom<HttpTrafficMetrics>(emptyHttpTrafficMetrics)
httpTrafficMetricsAtom.debugLabel = 'xa.httpTrafficMetricsAtom'

export const httpTrafficUploadBytesAtom = atom(get => get(httpTrafficMetricsAtom).uploadBytes)
httpTrafficUploadBytesAtom.debugLabel = 'xa.httpTrafficUploadBytesAtom'

export const httpTrafficDownloadBytesAtom = atom(get => get(httpTrafficMetricsAtom).downloadBytes)
httpTrafficDownloadBytesAtom.debugLabel = 'xa.httpTrafficDownloadBytesAtom'

export const recordHttpTrafficAtom = atom(null, (get, set, traffic: Partial<HttpTrafficMetrics>) => {
  set(httpTrafficMetricsAtom, addHttpTrafficMetrics(get(httpTrafficMetricsAtom), traffic))
})
recordHttpTrafficAtom.debugLabel = 'xa.recordHttpTrafficAtom'

export const resetHttpTrafficUploadAtom = atom(null, (get, set) => {
  set(httpTrafficMetricsAtom, resetHttpTrafficUpload(get(httpTrafficMetricsAtom)))
})
resetHttpTrafficUploadAtom.debugLabel = 'xa.resetHttpTrafficUploadAtom'

export const resetHttpTrafficDownloadAtom = atom(null, (get, set) => {
  set(httpTrafficMetricsAtom, resetHttpTrafficDownload(get(httpTrafficMetricsAtom)))
})
resetHttpTrafficDownloadAtom.debugLabel = 'xa.resetHttpTrafficDownloadAtom'

export const resetHttpTrafficAllAtom = atom(null, (_get, set) => {
  set(httpTrafficMetricsAtom, emptyHttpTrafficMetrics)
})
resetHttpTrafficAllAtom.debugLabel = 'xa.resetHttpTrafficAllAtom'
