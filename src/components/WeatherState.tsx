import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import type { WeatherEntry } from '@/types/Area'
import { Alert02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

interface WeatherStateProps {
  entries: readonly WeatherEntry[]
}

const WeatherState = ({ entries }: WeatherStateProps) => {
  const total = entries.length
  const failed = entries.filter((e) => e.status === 'error').length
  const pending = entries.filter((e) => e.status === 'idle' || e.status === 'loading').length

  let status = 'Current conditions for each area.'
  if (pending > 0) status = `Loading current weather for ${pending} of ${total} areas…`

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-foreground">Cairo</h2>
        <p className="text-sm text-muted-foreground" aria-live="polite">{status}</p>
      </div>
      {failed > 0 && (
        <Alert variant="destructive">
          <HugeiconsIcon icon={Alert02Icon} aria-hidden="true" />
          <AlertTitle>
            {failed === total ? "Couldn't load weather for any area" : `Couldn't load weather for ${failed} of ${total} areas`}
          </AlertTitle>
          <AlertDescription>Use Retry on the affected cards to try again.</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export default WeatherState
