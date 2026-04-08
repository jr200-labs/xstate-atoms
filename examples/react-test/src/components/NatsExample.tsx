import React from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { natsActorAtom, natsSnapshotAtom, prettyPrintXState } from '@jr200-labs/xstate-atoms'
import yaml from 'js-yaml'
import configContent from '/nats_basic.yaml.txt?raw'

export const NatsExample = () => {
  const natsActor = useAtomValue(natsActorAtom)
  const natsSend = useSetAtom(natsActorAtom)

  const natsState = useAtomValue(natsSnapshotAtom)

  const configure = () => {
    try {
      const yamlConfig = yaml.load(configContent)

      // showing two different ways to send messages to the machine
      natsSend({
        type: 'CONFIGURE',
        config: yamlConfig as any,
      })
      natsActor.send({ type: 'CONNECT' })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className='min-h-screen bg-gray-50 p-8'>
      <div className='max-w-3xl mx-auto'>
        <div className='grid grid-cols-1 gap-8'>
          {/* State Panel */}
          <div className='bg-white rounded-xl border border-gray-200 p-8 shadow-sm'>
            <div>
              <div className='flex items-center justify-between mb-6'>
                <div className='flex items-center gap-3'>
                  <div
                    className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                      natsState.matches('connected')
                        ? 'bg-green-500'
                        : natsState.matches('connecting')
                          ? 'bg-yellow-400'
                          : 'bg-red-400'
                    }`}
                  />
                  <h2 className='text-lg font-semibold text-gray-900'>NATS</h2>
                </div>
                <button
                  onClick={configure}
                  className='px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
                >
                  Load
                </button>
              </div>
            </div>

            <hr className='my-6 border-gray-200' />

            <div className='bg-gray-50 border border-gray-200 rounded-md p-4 overflow-auto max-h-96'>
              <pre className='text-xs text-black text-sm font-mono leading-relaxed whitespace-pre-wrap'>
                {prettyPrintXState(natsState)}
              </pre>
            </div>
            <div className='text-xs text-gray-500 text-center mt-4'>Last render: {new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
