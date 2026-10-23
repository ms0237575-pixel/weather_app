import { DEFAULT_COUNTRY_CODE, getCountry } from "@/lib/countries";
import { toErrorMessage } from "@/lib/requestErrors";
import { fetchCurrentWeather } from "@/services/openMeteo";
import type { Place, WeatherEntry } from "@/types/Area";
import { create } from "zustand"

const REQUEST_TIMEOUT_MS = 10_000;
const IDLE_ENTRY: WeatherEntry = { status: "idle", data: null, error: null };

// Only the latest weather request may update the store; older ones are aborted and ignored.
let activeWeatherRequest: AbortController | null = null;

function cancelWeatherRequest() {
    activeWeatherRequest?.abort();
    activeWeatherRequest = null;
}

interface WeatherStore {
    countryCode: string;
    setCountry: (code:string)=>void;
    selectedPlace: Place | null;
    weather: WeatherEntry;
    selectPlace: (place: Place) => void;
    retryWeather: () => void;
}
export const useWeatherStore = create<WeatherStore>()((set, get) => {
    const loadWeather = async (place: Place) => {
        cancelWeatherRequest();
        const controller = new AbortController();
        activeWeatherRequest = controller;

        set({ weather: { status: "loading", data: null, error: null } });
        try {
            const data = await fetchCurrentWeather(
                place,
                AbortSignal.any([controller.signal, AbortSignal.timeout(REQUEST_TIMEOUT_MS)]),
            );
            if (activeWeatherRequest !== controller) return;
            set({ weather: { status: "success", data, error: null } });
        } catch (error) {
            if (activeWeatherRequest !== controller) return;
            set({
                weather: {
                    status: "error",
                    data: null,
                    error: toErrorMessage(error, {
                        service: "weather service",
                        fallback: "Weather data is unavailable right now.",
                    }),
                },
            });
        } finally {
            if (activeWeatherRequest === controller) activeWeatherRequest = null;
        }
    };

    return {
        countryCode: DEFAULT_COUNTRY_CODE,
        setCountry: (code) => {
            const nextCode = code.toUpperCase();
            if (!getCountry(nextCode) || nextCode === get().countryCode) return;
            cancelWeatherRequest();
            set({
                countryCode: nextCode,
                selectedPlace: null,
                weather: IDLE_ENTRY,
            })
        },
        selectedPlace: null,
        weather: IDLE_ENTRY,
        selectPlace: (place) => {
            const { selectedPlace, weather } = get();
            if (selectedPlace?.id === place.id && weather.status !== "error") return;
            set({ selectedPlace: place });
            void loadWeather(place);
        },
        retryWeather: () => {
            const { selectedPlace } = get();
            if (selectedPlace) void loadWeather(selectedPlace);
        },
    };
});
