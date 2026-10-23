import CountrySelector from '@/components/CountrySelector'
import LocationSearch from '@/components/LocationSearch'
import { useWeatherStore } from '@/store/weatherStores'

const FindLocationBar = () => {
  const countryCode = useWeatherStore((s) => s.countryCode)

  return (
      <div className='flex flex-col gap-4 p-4 bg-card rounded-2xl border border-border shadow-sm md:flex-row md:items-end'>
          <CountrySelector/>
          {/* Remounting on country change resets the search text and suggestions. */}
          <LocationSearch key={countryCode}/>
    </div>
  )
}

export default FindLocationBar
