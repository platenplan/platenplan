'use client' // Error components must be Client Components

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-4 text-center p-6">
      <div className="p-6 rounded-full bg-red-100 dark:bg-red-900/20">
         <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-500" />
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tighter">Something went wrong!</h2>
        <p className="text-muted-foreground">
          We apologize for the inconvenience. An unexpected error occurred.
        </p>
        {error.digest && (
            <p className="text-xs text-muted-foreground font-mono bg-muted p-1 rounded">
                Ref: {error.digest}
            </p>
        )}
      </div>
      <div className="flex gap-2">
        <Button onClick={() => reset()}>
            Try Again
        </Button>
        <Button variant="outline" onClick={() => window.location.href = '/'}>
            Return Home
        </Button>
      </div>
    </div>
  )
}
