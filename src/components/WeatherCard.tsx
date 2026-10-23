import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { getWeatherDescription } from '@/lib/weatherCodes'
import type { CurrentWeather, WeatherEntry } from '@/types/Area'
import {
  CloudAngledRainIcon,
  CloudAngledZapIcon,
  CloudIcon,
  CloudLittleRainIcon,
  CloudSnowIcon,
  DropletIcon,
  FastWindIcon,
  Moon02Icon,
  MoonCloudIcon,
  Refresh01Icon,
  Sun03Icon,
  SunCloud02Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

interface WeatherCardProps {
    name: string;
    entry:WeatherEntry;
    onRetry:()=>void
}

function getWeatherIcon(code: number | null, isDay: boolean) {
  if (code === null) return CloudIcon
  if (code <= 1) return isDay ? Sun03Icon : Moon02Icon
  if (code === 2) return isDay ? SunCloud02Icon : MoonCloudIcon
  if (code <= 48) return CloudIcon
  if (code <= 57) return CloudLittleRainIcon
  if (code <= 67 || (code >= 80 && code <= 82)) return CloudAngledRainIcon
  if (code <= 86) return CloudSnowIcon
  return CloudAngledZapIcon
}

function formatValue(value: number | null, unit: string): string {
  return value === null ? '—' : `${Math.round(value)}${unit}`
}

// Open-Meteo returns local time without an offset (e.g. "2026-10-23T19:00") when timezone=auto.
function formatLocalTime(isoTime: string): string {
  return isoTime.slice(11, 16)
}

const WeatherCard = ({ name, entry, onRetry }: WeatherCardProps) => {
  return (
    <Card className="h-full" aria-busy={entry.status === 'idle' || entry.status === 'loading'}>
      <CardHeader>
        <CardTitle className="text-base">{name}</CardTitle>
        {entry.status === 'success' && entry.data && (
          <>
            <CardDescription>{getWeatherDescription(entry.data.weatherCode)}</CardDescription>
            <CardAction>
              <HugeiconsIcon
                icon={getWeatherIcon(entry.data.weatherCode, entry.data.isDay)}
                className="size-8 text-primary"
                aria-hidden="true"
              />
            </CardAction>
          </>
        )}
      </CardHeader>
      {entry.status === 'success' && entry.data ? (
        <WeatherDetails data={entry.data} />
      ) : entry.status === 'error' ? (
        <CardContent className="flex flex-1 flex-col items-start gap-3">
          <p className="text-sm text-destructive">{entry.error}</p>
          <Button variant="outline" size="sm" onClick={onRetry}>
            <HugeiconsIcon icon={Refresh01Icon} data-icon="inline-start" aria-hidden="true" />
            Retry
          </Button>
        </CardContent>
      ) : (
        <CardContent className="flex flex-col gap-3" >
          <span className="sr-only">Loading weather for {name}…</span>
          <div className="h-10 w-24 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-40 animate-pulse rounded-md bg-muted" />
        </CardContent>
      )}
    </Card>
  )
}

const WeatherDetails = ({ data }: { data: CurrentWeather }) => {
  return (
    <>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-semibold tabular-nums text-foreground">{formatValue(data.temperature, '°C')}</span>
          <span className="text-sm text-muted-foreground">Feels like {formatValue(data.apparentTemperature, '°C')}</span>
        </div>
        <dl className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <HugeiconsIcon icon={DropletIcon} className="size-4" aria-hidden="true" />
            <dt className="sr-only">Humidity</dt>
            <dd className="tabular-nums">{formatValue(data.humidity, '%')}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <HugeiconsIcon icon={FastWindIcon} className="size-4" aria-hidden="true" />
            <dt className="sr-only">Wind speed</dt>
            <dd className="tabular-nums">{formatValue(data.windSpeed, ' km/h')}</dd>
          </div>
        </dl>
      </CardContent>
      <CardFooter className="mt-auto text-muted-foreground">
        As of {formatLocalTime(data.time)} local time
      </CardFooter>
    </>
  )
}

export default WeatherCard
