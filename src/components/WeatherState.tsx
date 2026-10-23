import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import type { AsyncStatus, WeatherEntry } from '@/types/Area'
import { Alert02Icon, Location01Icon, Refresh01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

interface WeatherStateProps {
  countryName: string
  placeCount: number
  placesStatus: AsyncStatus
  placesError: string | null
  onRetryPlaces: () => void
  entries: readonly WeatherEntry[]
}

const WeatherState = ({ countryName, placeCount, placesStatus, placesError, onRetryPlaces, entries }: WeatherStateProps) => {
  const failed = entries.filter((e) => e.status === 'error').length
  const pending = entries.filter((e) => e.status === 'idle' || e.status === 'loading').length
  const discovering = placesStatus === 'idle' || placesStatus === 'loading'

  let status = 'Largest places by population. Search above to add another.'
  if (discovering) status = `Finding major places in ${countryName}…`
  else if (pending > 0) status = `Loading current weather for ${pending} of ${placeCount} places…`

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-foreground">{countryName}</h2>
        <p className="text-sm text-muted-foreground" aria-live="polite">{status}</p>
      </div>
      {placesStatus === 'error' && (
        <Alert variant="destructive">
          <HugeiconsIcon icon={Alert02Icon} aria-hidden="true" />
          <AlertTitle>Couldn't load major places for {countryName}</AlertTitle>
          <AlertDescription>{placesError} You can still search for a place above.</AlertDescription>
          <AlertAction>
            <Button variant="outline" size="sm" onClick={onRetryPlaces}>
              <HugeiconsIcon icon={Refresh01Icon} data-icon="inline-start" aria-hidden="true" />
              Retry
            </Button>
          </AlertAction>
        </Alert>
      )}
      {failed > 0 && (
        <Alert variant="destructive">
          <HugeiconsIcon icon={Alert02Icon} aria-hidden="true" />
          <AlertTitle>
            {failed === placeCount ? "Couldn't load weather for any place" : `Couldn't load weather for ${failed} of ${placeCount} places`}
          </AlertTitle>
          <AlertDescription>Use Retry on the affected cards to try again.</AlertDescription>
        </Alert>
      )}
      {placesStatus === 'success' && placeCount === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
          <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
            <HugeiconsIcon icon={Location01Icon} className="size-5" aria-hidden="true" />
          </span>
          <h3 className="text-base font-semibold text-foreground">No places listed for {countryName}</h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            The location data has no populated places for this country. Search above to add one.
          </p>
        </div>
      )}
      {discovering && placeCount === 0 && (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" aria-hidden="true">
          {Array.from({ length: 3 }, (_, i) => (
            <li key={i} className="h-40 animate-pulse rounded-lg bg-card ring-1 ring-foreground/10" />
          ))}
        </ul>
      )}
    </div>
  )
}

export default WeatherState
