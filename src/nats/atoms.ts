import { atomWithActor, atomWithActorSnapshot } from 'jotai-xstate'
import { natsMachine, type NatsContext, type NatsEvent } from '@jr200/xstate-nats'
import { Actor, AnyActor, StateMachine } from 'xstate'
import { atom, WritableAtom } from 'jotai'

// this pattern/workaround for accessing child states is from:
// https://github.com/jotaijs/jotai-xstate/issues/11

// this is a workaround to get at least some information out of
// the 'too complex' natsMachine type
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
  const child = snapshot.children.subject
  return child as AnyActor
})
natsSubjectSnapshotAtom.debugLabel = 'xa.natsSubjectSnapshotAtom'

export const natsKvSnapshotAtom = atomWithActorSnapshot(get => {
  const snapshot = get(natsSnapshotAtom)
  const child = snapshot.children.kv
  return child as AnyActor
})
natsKvSnapshotAtom.debugLabel = 'xa.natsKvSnapshotAtom'

export const natsConnectionHandleAtom = atom(get => get(natsSnapshotAtom).context.connection)
natsConnectionHandleAtom.debugLabel = 'xa.natsConnectionHandleAtom'
