import React, { useEffect } from 'react'
import { useAtom } from 'jotai'
import { epochAtom } from '@jr200-labs/xstate-atoms'

export const TemporalUpdater = () => {
  const [_, setEpoch] = useAtom(epochAtom)

  // Initialize and update the epoch
  useEffect(() => {
    const now = Date.now()
    setEpoch(now)

    // Update every second
    const interval = setInterval(() => {
      const currentTime = Date.now()
      setEpoch(currentTime)
    }, 1000)

    return () => clearInterval(interval)
  }, [setEpoch])

  return <></>
}
