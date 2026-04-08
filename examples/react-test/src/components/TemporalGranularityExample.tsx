import React, { useEffect, useState } from 'react'
import { type TimeGranularity, useZonedTime } from '@jr200-labs/xstate-atoms'

export const TemporalGranularityExample = ({ granularity }: { granularity: TimeGranularity }) => {
  const zdt = useZonedTime(granularity, 'UTC')
  const [localTime, setLocalTime] = useState<string>('')

  useEffect(() => {
    if (!zdt) return
    setLocalTime(zdt.toLocaleString())
  }, [zdt])

  return (
    <div className='min-h-screen bg-gray-50 p-8'>
      <div className='max-w-3xl mx-auto'>
        <div className='grid grid-cols-1 gap-8'>
          {/* State Panel */}
          <div className='bg-white rounded-xl border border-gray-200 p-8 shadow-sm'>
            <div>
              <div className='flex items-center justify-between mb-6 gap-4'>
                <div className='flex items-center gap-3'>
                  <div className='w-3 h-3 rounded-full bg-blue-500 animate-pulse' />
                  <h2 className='text-lg font-semibold text-gray-900'>Temporal ({granularity})</h2>
                </div>
                <div className='text-sm text-gray-500'>Live Updates</div>
              </div>
            </div>

            <hr className='my-6 border-gray-200' />

            <div className='bg-gray-50 border border-gray-200 rounded-md p-4 overflow-auto max-h-96'>
              <div className='text-sm space-y-3'>
                <div className='flex items-center justify-between gap-4'>
                  <span className='font-medium text-gray-700'>Raw Epoch value:</span>
                  <span className='font-mono text-gray-900'>{zdt?.epochMilliseconds ?? 'undefined'}</span>
                </div>
                <div className='flex items-center justify-between gap-4'>
                  <span className='font-medium text-gray-700'>Local time:</span>
                  <span className='font-mono text-gray-900'>{localTime}</span>
                </div>
                <div className='flex items-center justify-between gap-4'>
                  <span className='font-medium text-gray-700'>ISO string:</span>
                  <span className='font-mono text-gray-900'>{zdt ? zdt.toString() : 'undefined'}</span>
                </div>
              </div>
            </div>
            <div className='text-xs text-gray-500 text-center mt-4'>Last render: {new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
