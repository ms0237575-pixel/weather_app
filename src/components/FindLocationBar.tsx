import CountrySelector from '@/components/CountrySelector'
import LocationSearch from '@/components/LocationSearch'
import { useWeatherStore } from '@/store/weatherStores'
import { Location01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

const FindLocationBar = () => {
  const countryCode = useWeatherStore((s) => s.countryCode)

  return (
    <section aria-label="Find a location" className="glass-panel rounded-[1.5rem_2rem_1.5rem_2rem] border border-white/[0.09] p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <HugeiconsIcon icon={Location01Icon} className="size-5" aria-hidden="true" />
            </span>
            <div>
                <h2 className="text-sm font-semibold text-foreground">Explore a location</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Choose a country, then search for a place to add.</p>
            </div>
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <CountrySelector />
            {/* Remounting on country change resets the search text and suggestions. */}
            <LocationSearch key={countryCode} />
        </div>
    </section>
  )
}

export default FindLocationBar
