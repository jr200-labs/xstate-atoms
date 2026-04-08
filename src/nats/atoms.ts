import { atomWithActor, atomWithActorSnapshot } from 'jotai-xstate'
import { natsMachine, type NatsContext, type NatsEvent } from '@jr200-labs/xstate-nats'
import { Actor, AnyActor, StateMachine } from 'xstate'
import { atom, WritableAtom } from 'jotai'

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

export const natsConnectionHandleAtom = atom(get => get(natsSnapshotAtom).context.connection)
natsConnectionHandleAtom.debugLabel = 'xa.natsConnectionHandleAtom'
