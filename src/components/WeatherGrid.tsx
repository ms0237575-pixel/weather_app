import WeatherCard from "@/components/WeatherCard";
import WeatherState from "@/components/WeatherState";
import { getCountry } from "@/lib/countries";
import { formatRegion } from "@/lib/places";
import { useWeatherStore } from "@/store/weatherStores";
import type { WeatherEntry } from "@/types/Area";
import { useEffect } from "react";

const IDLE_ENTRY: WeatherEntry = { status: "idle", data: null, error: null };

const WeatherGrid = () => {
    const countryCode = useWeatherStore((s) => s.countryCode);
    const places = useWeatherStore((s) => s.places);
    const placesStatus = useWeatherStore((s) => s.placesStatus);
    const placesError = useWeatherStore((s) => s.placesError);
    const weather = useWeatherStore((s) => s.weather);
    const loadCountryPlaces = useWeatherStore((s) => s.loadCountryPlaces);
    const retryWeather = useWeatherStore((s) => s.retryWeather);

    useEffect(() => {
        // Skipped by the store unless nothing has been requested yet, so StrictMode's re-run is harmless.
        loadCountryPlaces();
    }, [loadCountryPlaces]);

    const entries = places.map((place) => weather[place.id] ?? IDLE_ENTRY);

    return (
        <div className="flex flex-col gap-5">
            <WeatherState
                countryName={getCountry(countryCode)?.name ?? countryCode}
                placeCount={places.length}
                placesStatus={placesStatus}
                placesError={placesError}
                onRetryPlaces={() => loadCountryPlaces({ force: true })}
                entries={entries}
            />
            {places.length > 0 && (
                <ul className="weather-grid grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {places.map((place, index) => (
                        <li key={place.id} >
                            <WeatherCard
                                name={place.name}
                                subtitle={formatRegion(place)}
                                entry={entries[index]}
                                onRetry={retryWeather}
                                placeId={place.id}
                            />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default WeatherGrid;
