import WeatherCard from "@/components/WeatherCard";
import WeatherState from "@/components/WeatherState";
import { getCountry } from "@/lib/countries";
import { formatRegion } from "@/lib/places";
import { useWeatherStore } from "@/store/weatherStores";

const WeatherGrid = () => {
    const countryCode = useWeatherStore((s) => s.countryCode);
    const selectedPlace = useWeatherStore((s) => s.selectedPlace);
    const weather = useWeatherStore((s) => s.weather);
    const retryWeather = useWeatherStore((s) => s.retryWeather);

    if (!selectedPlace) {
        return <WeatherState countryName={getCountry(countryCode)?.name ?? countryCode} />;
    }

    return (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" aria-live="polite">
            <li>
                <WeatherCard
                    name={selectedPlace.name}
                    subtitle={formatRegion(selectedPlace)}
                    entry={weather}
                    onRetry={retryWeather}
                />
            </li>
        </ul>
    );
};

export default WeatherGrid;
