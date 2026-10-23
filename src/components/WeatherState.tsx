import { Location01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

interface WeatherStateProps {
  countryName: string
}

const WeatherState = ({ countryName }: WeatherStateProps) => {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
      <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
        <HugeiconsIcon icon={Location01Icon} className="size-5" aria-hidden="true" />
      </span>
      <h2 className="text-base font-semibold text-foreground">Choose a location</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        Search for a city or governorate in {countryName} to see its current weather.
      </p>
    </div>
  )
}

export default WeatherState
