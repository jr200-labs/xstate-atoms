import React from 'react'
import { useSetAtom } from 'jotai'
import { duckdbActorAtom } from '@jr200-labs/xstate-atoms'
import payloadContent from '/payload.b64ipc_zlib.txt?raw'
import { callbackTextAtom } from './atoms'

export const DuckDbUpdater = () => {
  const duckdbSend = useSetAtom(duckdbActorAtom)
  const setCallbackText = useSetAtom(callbackTextAtom)

  const handleUpdate = () => {
    const tableSpecName = 'test_table'
    duckdbSend({
      type: 'CATALOG.LOAD_TABLE',
      data: {
        tableSpecName,
        tablePayload: payloadContent,
        payloadType: 'b64ipc',
        payloadCompression: 'zlib',
        callback: (tableInstanceName: string, error?: string) => {
          if (error) {
            setCallbackText(`Error loading table '${tableSpecName}'`)
          } else {
            setCallbackText(`Loaded new table: ${tableInstanceName}`)
          }
        },
      },
    })
  }

  return (
    <div className='bg-gray-50 p-8'>
      <div className='w-96 mx-auto'>
        <div className='grid grid-cols-1 gap-8'>
          {/* State Panel */}
          <div className='bg-white rounded-xl border border-gray-200 p-8 shadow-sm'>
            <div>
              <div className='flex items-center justify-between mb-6'>
                <div className='flex items-center gap-3'>
                  <div className='w-3 h-3 rounded-full bg-blue-500' />
                  <h2 className='text-lg font-semibold text-gray-900'>DuckDB Updater</h2>
                </div>
                <button
                  onClick={handleUpdate}
                  className='px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
                >
                  Load Table
                </button>
              </div>
            </div>

            <div className='text-xs text-gray-500 text-center mt-4'>Last render: {new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
