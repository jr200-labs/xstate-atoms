import React from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { duckdbActorAtom, prettyPrintXState, duckdbSnapshotAtom } from '@jr200-labs/xstate-atoms'
import yaml from 'js-yaml'
import configContent from '/duckdbmachine.yaml.txt?raw'
import { ProgressBar } from './ProgressBar'
import { InstantiationProgress } from '@duckdb/duckdb-wasm'
import { initProgressAtom } from './atoms'

export const DuckDbExample = () => {
  const duckdbSend = useSetAtom(duckdbActorAtom)
  const state = useAtomValue(duckdbSnapshotAtom)
  const [initProgress, setInitProgress] = useAtom(initProgressAtom)

  const configure = () => {
    try {
      const yamlConfig = yaml.load(configContent)
      duckdbSend({
        type: 'CONFIGURE',
        config: yamlConfig as any,
      })
      const dbProgressHandler = (progress: InstantiationProgress) => {
        setInitProgress(progress)
      }

      duckdbSend({ type: 'CONNECT', dbProgressHandler: dbProgressHandler, statusHandler: null })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className='h-full bg-gray-50 p-8'>
      <div className='max-w-3xl mx-auto'>
        <div className='grid grid-cols-1 gap-8'>
          {/* State Panel */}
          <div className='bg-white rounded-xl border border-gray-200 p-8 shadow-sm'>
            <div>
              <div className='flex items-center justify-between mb-6'>
                <div className='flex items-center gap-3'>
                  <div
                    className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                      state.matches('connected')
                        ? 'bg-green-500'
                        : state.matches('connecting')
                          ? 'bg-yellow-400'
                          : 'bg-red-400'
                    }`}
                  />
                  <h2 className='text-lg font-semibold text-gray-900'>DuckDB</h2>
                </div>
                <div className='flex items-center gap-4'>
                  {state.matches('initializing') && initProgress && (
                    <div className='flex-1 max-w-md'>
                      <ProgressBar progress={initProgress} />
                    </div>
                  )}
                  <button
                    onClick={configure}
                    className='px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
                  >
                    Connect
                  </button>
                </div>
              </div>
            </div>

            <hr className='my-6 border-gray-200' />

            <div className='bg-gray-50 border border-gray-200 rounded-md p-4 overflow-auto '>
              <pre className='text-xs text-black font-mono leading-relaxed whitespace-pre-wrap'>
                {prettyPrintXState(state)}
              </pre>
            </div>
            <div className='text-xs text-gray-500 text-center mt-4'>Last render: {new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
