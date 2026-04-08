import { atomWithActor, atomWithActorSnapshot } from 'jotai-xstate'
import { duckdbMachine } from '@jr200-labs/xstate-duckdb'
import { AnyActor } from 'xstate'
import { atom, WritableAtom } from 'jotai'

export const duckdbActorAtom: WritableAtom<any, any, any> = atomWithActor(duckdbMachine)
duckdbActorAtom.debugLabel = 'xa.duckdbActorAtom'

export const duckdbSnapshotAtom: WritableAtom<any, any, any> = atomWithActorSnapshot(get => {
  const snapshot = get(duckdbActorAtom)
  return snapshot
})
duckdbSnapshotAtom.debugLabel = 'xa.duckdbSnapshotAtom'

export const duckdbCatalogSnapshotAtom = atomWithActorSnapshot(get => {
  const snapshot = get(duckdbSnapshotAtom)
  return snapshot.children.dbCatalog as AnyActor | undefined
})
duckdbCatalogSnapshotAtom.debugLabel = 'xa.duckdbCatalogSnapshotAtom'

export const duckdbCatalogTableDefinitionsAtom = atom(get => get(duckdbCatalogSnapshotAtom).context.tableDefinitions)
duckdbCatalogTableDefinitionsAtom.debugLabel = 'xa.duckdbCatalogTableDefinitionsAtom'

export const duckdbCatalogLoadedVersionsAtom = atom(get => get(duckdbCatalogSnapshotAtom).context.loadedVersions)
duckdbCatalogLoadedVersionsAtom.debugLabel = 'xa.duckdbCatalogLoadedVersionsAtom'

export const duckdbHandleAtom = atom(get => get(duckdbSnapshotAtom).context.duckDbHandle)
duckdbHandleAtom.debugLabel = 'xa.duckdbHandleAtom'
