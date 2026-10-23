import { DEFAULT_COUNTRY_CODE, getCountry } from "@/lib/countries";
import { fetchCurrentWeather } from "@/services/openMeteo";
import type { Area, WeatherEntry } from "@/types/Area";
import { create } from "zustand"

const REQUEST_TIMEOUT_MS = 10_000;

// Latest request per area id; responses from superseded requests are ignored.
const activeRequests = new Map<string, AbortController>();

function toErrorMessage(error: unknown): string {
    if (error instanceof DOMException && error.name === "TimeoutError") {
        return "The weather service took too long to respond.";
    }
    if (error instanceof TypeError) {
        return "Couldn't reach the weather service. Check your connection.";
    }
    return "Weather data is unavailable right now.";
}

interface WeatherStore {
    countryCode: string;
    setCountry: (code:string)=>void;
    areaWeather: Record<string, WeatherEntry>;
    loadAreaWeather: (area: Area, options?: { force?: boolean }) => Promise<void>;
}
export const useWeatherStore = create<WeatherStore>()((set, get) => ({
    countryCode: DEFAULT_COUNTRY_CODE,
    setCountry: (code) => {
        if (!getCountry(code) || code === get().countryCode) return;
        set({
            countryCode:code.toUpperCase()
        })
    },
    areaWeather: {},
    loadAreaWeather: async (area, { force = false } = {}) => {
        const status = get().areaWeather[area.id]?.status;
        if (!force && (status === "loading" || status === "success")) return;

        activeRequests.get(area.id)?.abort();
        const controller = new AbortController();
        activeRequests.set(area.id, controller);

        const setEntry = (entry: WeatherEntry) =>
            set((state) => ({ areaWeather: { ...state.areaWeather, [area.id]: entry } }));

        setEntry({ status: "loading", data: null, error: null });
        try {
            const data = await fetchCurrentWeather(
                area,
                AbortSignal.any([controller.signal, AbortSignal.timeout(REQUEST_TIMEOUT_MS)]),
            );
            if (activeRequests.get(area.id) !== controller) return;
            setEntry({ status: "success", data, error: null });
        } catch (error) {
            if (activeRequests.get(area.id) !== controller) return;
            setEntry({ status: "error", data: null, error: toErrorMessage(error) });
        } finally {
            if (activeRequests.get(area.id) === controller) activeRequests.delete(area.id);
        }
    },
}));
