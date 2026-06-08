import { atomWithActor, atomWithActorSnapshot } from 'jotai-xstate'
import { duckdbMachine } from '@jr200-labs/xstate-duckdb'
import { AnyActor } from 'xstate'
import { atom, type Atom, WritableAtom } from 'jotai'
import {
  createEmptyDuckDbLoadMetrics,
  duckDbLoadMetricsFromSnapshot,
  type DuckDbLoadMetrics,
  type DuckDbLoadMetricsResetEvent,
} from './loadMetrics'

export { createEmptyDuckDbLoadMetrics, duckDbLoadMetricsFromSnapshot } from './loadMetrics'
export type { DuckDbLoadMetricBucket, DuckDbLoadMetrics, DuckDbLoadMetricsResetEvent } from './loadMetrics'

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

export const duckdbLoadMetricsAtom: Atom<DuckDbLoadMetrics> = atom(get => {
  const catalogSnapshot = get(duckdbCatalogSnapshotAtom)
  if (!catalogSnapshot) return createEmptyDuckDbLoadMetrics()
  return duckDbLoadMetricsFromSnapshot(catalogSnapshot)
})
duckdbLoadMetricsAtom.debugLabel = 'xa.duckdbLoadMetricsAtom'

export const duckdbEncodedBytesAtom: Atom<number> = atom(get => get(duckdbLoadMetricsAtom).encodedBytes)
duckdbEncodedBytesAtom.debugLabel = 'xa.duckdbEncodedBytesAtom'

export const duckdbDecodedBytesAtom: Atom<number> = atom(get => get(duckdbLoadMetricsAtom).decodedBytes)
duckdbDecodedBytesAtom.debugLabel = 'xa.duckdbDecodedBytesAtom'

export const duckdbLoadedBytesAtom: Atom<number> = atom(get => get(duckdbLoadMetricsAtom).loadedBytes)
duckdbLoadedBytesAtom.debugLabel = 'xa.duckdbLoadedBytesAtom'

export const resetDuckDbLoadMetricsAtom = atom(null, (_get, set, tableSpecName?: string) => {
  const event: DuckDbLoadMetricsResetEvent = { type: 'CATALOG.METRICS.RESET_LOADS', tableSpecName }
  set(duckdbActorAtom, event)
})
resetDuckDbLoadMetricsAtom.debugLabel = 'xa.resetDuckDbLoadMetricsAtom'
