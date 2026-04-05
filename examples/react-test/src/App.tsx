import React from 'react'
import JotaiProvider from './providers/JotaiProvider'
import { DuckDbExample } from './components/DuckDbExample'
import { NatsExample } from './components/NatsExample'
import { TemporalExample } from './components/TemporalExample'
import { TemporalUpdater } from './components/TemporalUpdater'
import { TemporalGranularityExample } from './components/TemporalGranularityExample'
import { DuckDbCatalog } from './components/DuckDbCatalog'
import { DuckDbUpdater } from './components/DuckDbUpdater'
import { DuckDbStatus } from './components/DuckDbStatus'
import { DuckDbCatalogState } from './components/DuckDbCatalogState'
import { duckdbCatalogLoadedVersionsAtom, duckdbCatalogTableDefinitionsAtom } from '@jr200/xstate-atoms'

function App() {
  return (
    <div className='App'>
      <div className='flex flex-row gap-4'>
        <JotaiProvider>
          <div className='flex flex-col gap-4 h-full'>
            <DuckDbCatalog />
            <DuckDbCatalogState label='TableDefinition' someAtom={duckdbCatalogTableDefinitionsAtom} />
            <DuckDbCatalogState label='LoadedVersions' someAtom={duckdbCatalogLoadedVersionsAtom} />
          </div>
          <div className='flex flex-col gap-4 h-full'>
            <DuckDbExample />
            <DuckDbUpdater />
            <DuckDbStatus />
          </div>
          <div className='flex flex-col gap-4 h-full'>
            <TemporalUpdater />
            <TemporalExample />
            <TemporalGranularityExample granularity='minute' />
          </div>
          <NatsExample />
        </JotaiProvider>
      </div>
    </div>
  )
}

export default App
