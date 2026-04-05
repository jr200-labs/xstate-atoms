import { atom } from 'jotai'
import { InstantiationProgress } from '@duckdb/duckdb-wasm'

export const renderKeyAtom = atom(0)
export const callbackTextAtom = atom<string>(
  'Click the button above to load a test table into DuckDB with the provided payload.'
)
export const initProgressAtom = atom<InstantiationProgress | null>(null)
