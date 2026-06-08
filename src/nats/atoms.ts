import { atomWithActor, atomWithActorSnapshot } from 'jotai-xstate'
import { natsMachine, type NatsContext, type NatsEvent } from '@jr200-labs/xstate-nats'
import { Actor, AnyActor, StateMachine } from 'xstate'
import { atom, type Atom, WritableAtom } from 'jotai'
import { mergeNatsTrafficMetrics, trafficMetricsFromSnapshot } from './traffic'
import type { NatsTrafficMetricSource, NatsTrafficMetrics, NatsTrafficResetEvent } from './traffic'

export { mergeNatsTrafficMetrics } from './traffic'
export type {
  NatsTrafficMetricBucket,
  NatsTrafficMetrics,
  NatsTrafficMetricSource,
  NatsTrafficResetEvent,
} from './traffic'

type NatsMachine = StateMachine<NatsContext, NatsEvent, any, any, any, any, any, any, any, any, any, any, any, any>

export const natsActorAtom = atomWithActor(natsMachine) as WritableAtom<Actor<NatsMachine>, any, any>
natsActorAtom.debugLabel = 'xa.natsActorAtom'

export const natsSnapshotAtom = atomWithActorSnapshot<Actor<NatsMachine>>(get => {
  const snapshot = get(natsActorAtom)
  return snapshot
})
natsSnapshotAtom.debugLabel = 'xa.natsSnapshotAtom'

export const natsSubjectSnapshotAtom = atomWithActorSnapshot(get => {
  const snapshot = get(natsSnapshotAtom)
  return snapshot.children.subject as AnyActor | undefined
})
natsSubjectSnapshotAtom.debugLabel = 'xa.natsSubjectSnapshotAtom'

export const natsKvSnapshotAtom = atomWithActorSnapshot(get => {
  const snapshot = get(natsSnapshotAtom)
  return snapshot.children.kv as AnyActor | undefined
})
natsKvSnapshotAtom.debugLabel = 'xa.natsKvSnapshotAtom'

export const natsConnectionHandleAtom: Atom<NatsContext['connection']> = atom(
  get => get(natsSnapshotAtom).context.connection
)
natsConnectionHandleAtom.debugLabel = 'xa.natsConnectionHandleAtom'

export const natsTrafficMetricsAtom: Atom<NatsTrafficMetrics> = atom(get =>
  mergeNatsTrafficMetrics(
    trafficMetricsFromSnapshot(get(natsSubjectSnapshotAtom)),
    trafficMetricsFromSnapshot(get(natsKvSnapshotAtom))
  )
)
natsTrafficMetricsAtom.debugLabel = 'xa.natsTrafficMetricsAtom'

export const natsTrafficUploadBytesAtom: Atom<number> = atom(get => get(natsTrafficMetricsAtom).uploadBytes)
natsTrafficUploadBytesAtom.debugLabel = 'xa.natsTrafficUploadBytesAtom'

export const natsTrafficDownloadBytesAtom: Atom<number> = atom(get => get(natsTrafficMetricsAtom).downloadBytes)
natsTrafficDownloadBytesAtom.debugLabel = 'xa.natsTrafficDownloadBytesAtom'

function sendNatsTrafficReset(
  set: (atom: typeof natsActorAtom, event: NatsTrafficResetEvent) => void,
  event: NatsTrafficResetEvent
): void {
  set(natsActorAtom, event)
}

export const resetNatsTrafficUploadAtom = atom(null, (_get, set, source?: NatsTrafficMetricSource) => {
  sendNatsTrafficReset(set, { type: 'METRICS.RESET_UPLOAD', source })
})
resetNatsTrafficUploadAtom.debugLabel = 'xa.resetNatsTrafficUploadAtom'

export const resetNatsTrafficDownloadAtom = atom(null, (_get, set, source?: NatsTrafficMetricSource) => {
  sendNatsTrafficReset(set, { type: 'METRICS.RESET_DOWNLOAD', source })
})
resetNatsTrafficDownloadAtom.debugLabel = 'xa.resetNatsTrafficDownloadAtom'

export const resetNatsTrafficAllAtom = atom(null, (_get, set, source?: NatsTrafficMetricSource) => {
  sendNatsTrafficReset(set, { type: 'METRICS.RESET_ALL', source })
})
resetNatsTrafficAllAtom.debugLabel = 'xa.resetNatsTrafficAllAtom'
