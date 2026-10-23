import WeatherCard from "@/components/WeatherCard";
import WeatherState from "@/components/WeatherState";
import { CAIRO_AREAS } from "@/config/cairoAreas";
import { useWeatherStore } from "@/store/weatherStores";
import type { WeatherEntry } from "@/types/Area";
import { useEffect } from "react";

const IDLE_ENTRY: WeatherEntry = { status: "idle", data: null, error: null };

const WeatherGrid = () => {
    const areaWeather = useWeatherStore((s) => s.areaWeather);
    const loadAreaWeather = useWeatherStore((s) => s.loadAreaWeather);

    useEffect(() => {
        // The store skips areas that are already loading or loaded, so re-running this is safe.
        for (const area of CAIRO_AREAS) {
            void loadAreaWeather(area);
        }
    }, [loadAreaWeather]);

    const entries = CAIRO_AREAS.map((area) => areaWeather[area.id] ?? IDLE_ENTRY);

    return (
        <div className="flex flex-col gap-4">
            <WeatherState entries={entries} />
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {CAIRO_AREAS.map((area, index) => (
                    <li key={area.id} >
                        <WeatherCard
                            name={area.name}
                            entry={entries[index]}
                            onRetry={() => void loadAreaWeather(area, { force: true })}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default WeatherGrid;
