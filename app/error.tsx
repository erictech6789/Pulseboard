'use client'

import { useEffect } from 'react'
import ErrorState from '../components/ErrorState'

export default function Error({ error, reset }: { error: Error, reset: () => void }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <ErrorState
          title="Something went wrong!"
          description="We're sorry, but an unexpected error occurred. Please try again."
          onRetry={reset}
        />
      </body>
    </html>
  )
}
