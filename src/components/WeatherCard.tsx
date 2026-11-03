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
import { memo } from 'react'

interface WeatherCardProps {
    name: string;
    subtitle?: string;
    entry:WeatherEntry;
    onRetry:(placeId: string)=>void
    placeId: string
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

const WeatherCard = ({ name, subtitle, entry, onRetry, placeId }: WeatherCardProps) => {
  return (
    <Card className="weather-card glass-panel h-full min-h-64 rounded-3xl border border-white/[0.08] py-5 shadow-lg shadow-black/10" aria-busy={entry.status === 'idle' || entry.status === 'loading'}>
      <CardHeader className="px-5">
        <CardTitle className="text-base font-semibold tracking-tight">{name}</CardTitle>
        {subtitle && <CardDescription className="text-xs">{subtitle}</CardDescription>}
        {entry.status === 'success' && entry.data && (
          <CardAction className="row-span-2">
            <HugeiconsIcon
              icon={getWeatherIcon(entry.data.weatherCode, entry.data.isDay)}
              className="size-11 rounded-2xl bg-primary/[0.09] p-2 text-primary"
              aria-hidden="true"
            />
          </CardAction>
        )}
      </CardHeader>
      {entry.status === 'success' && entry.data ? (
        <WeatherDetails data={entry.data} />
      ) : entry.status === 'error' ? (
        <CardContent className="flex flex-1 flex-col items-start gap-3 px-5 pt-4">
          <p className="text-sm text-destructive">{entry.error}</p>
          <Button variant="outline" size="sm" onClick={() => onRetry(placeId)}>
            <HugeiconsIcon icon={Refresh01Icon} data-icon="inline-start" aria-hidden="true" />
            Retry
          </Button>
        </CardContent>
      ) : (
        <CardContent className="flex flex-col gap-3 px-5 pt-4">
          <span className="sr-only">Loading weather for {name}…</span>
          <div className="h-11 w-28 animate-pulse rounded-lg bg-white/[0.07]" />
          <div className="h-4 w-40 animate-pulse rounded-md bg-white/[0.06]" />
          <div className="mt-3 h-12 w-full animate-pulse rounded-xl bg-white/[0.04]" />
        </CardContent>
      )}
    </Card>
  )
}

const WeatherDetails = ({ data }: { data: CurrentWeather }) => {
  return (
    <>
      <CardContent className="flex flex-1 flex-col gap-4 px-5 pt-4">
        <p className="w-fit rounded-full border border-primary/15 bg-primary/[0.07] px-2.5 py-1 text-xs font-medium text-primary">{getWeatherDescription(data.weatherCode)}</p>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-5xl font-semibold tracking-[-0.06em] tabular-nums text-foreground">{formatValue(data.temperature, '°C')}</span>
          <span className="text-xs text-muted-foreground">Feels like {formatValue(data.apparentTemperature, '°C')}</span>
        </div>
        <dl className="mt-auto grid grid-cols-2 gap-2 border-t border-white/[0.07] pt-3">
          <div className="flex items-center gap-2 rounded-xl bg-white/[0.035] px-3 py-2.5">
            <HugeiconsIcon icon={DropletIcon} className="size-4 text-primary/80" aria-hidden="true" />
            <div>
              <dt className="text-[0.625rem] font-medium uppercase tracking-wider text-muted-foreground">Humidity</dt>
              <dd className="mt-0.5 text-xs font-semibold tabular-nums text-foreground">{formatValue(data.humidity, '%')}</dd>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white/[0.035] px-3 py-2.5">
            <HugeiconsIcon icon={FastWindIcon} className="size-4 text-muted-foreground" aria-hidden="true" />
            <div>
              <dt className="text-[0.625rem] font-medium uppercase tracking-wider text-muted-foreground">Wind</dt>
              <dd className="mt-0.5 text-xs font-semibold tabular-nums text-foreground">{formatValue(data.windSpeed, ' km/h')}</dd>
            </div>
          </div>
        </dl>
      </CardContent>
      <CardFooter className="mt-1 justify-between px-5 text-[0.65rem] text-muted-foreground">
        <span>Local time</span>
        <time dateTime={data.time} className="font-medium tabular-nums text-muted-foreground/90">{formatLocalTime(data.time)}</time>
      </CardFooter>
    </>
  )
}

export default memo(WeatherCard)
