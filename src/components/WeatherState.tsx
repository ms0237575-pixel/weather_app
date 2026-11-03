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
    <div className="flex flex-col gap-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.035] text-primary">
            <HugeiconsIcon icon={Location01Icon} className="size-5" aria-hidden="true" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">{countryName}</h2>
              {placeCount > 0 && (
                <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[0.625rem] font-medium text-muted-foreground">
                  {placeCount} {placeCount === 1 ? 'place' : 'places'}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm" aria-live="polite">{status}</p>
          </div>
        </div>
        <span className="hidden text-[0.65rem] font-medium uppercase tracking-[0.16em] text-muted-foreground/70 sm:block">Weather near you</span>
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
            <li key={i} className="h-64 animate-pulse rounded-3xl border border-white/[0.06] bg-white/[0.025]" />
          ))}
        </ul>
      )}
    </div>
  )
}

export default WeatherState
