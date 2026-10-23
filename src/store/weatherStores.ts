import { DEFAULT_COUNTRY_CODE, getCountry } from "@/lib/countries";
import { toErrorMessage } from "@/lib/requestErrors";
import { fetchCurrentWeather } from "@/services/openMeteo";
import { fetchMajorPlaces } from "@/services/placeDiscovery";
import type { AsyncStatus, Place, WeatherEntry } from "@/types/Area";
import { create } from "zustand"

const REQUEST_TIMEOUT_MS = 10_000;
// Places discovered per country, and the cap including places added from search.
const DISCOVERED_PLACE_COUNT = 6;
const MAX_PLACES = 12;

// Every request belongs to the current country's session; changing country aborts them all.
let countrySession = new AbortController();
// Latest request per kind; a superseded request is aborted and its response ignored.
let discoveryRequest: AbortController | null = null;
const weatherRequests = new Map<string, AbortController>();

function requestSignal(controller: AbortController): AbortSignal {
    return AbortSignal.any([controller.signal, countrySession.signal, AbortSignal.timeout(REQUEST_TIMEOUT_MS)]);
}

function resetCountrySession() {
    countrySession.abort();
    countrySession = new AbortController();
    discoveryRequest = null;
    weatherRequests.clear();
}

interface WeatherStore {
    countryCode: string;
    setCountry: (code:string)=>void;
    places: Place[];
    placesStatus: AsyncStatus;
    placesError: string | null;
    weather: Record<string, WeatherEntry>;
    loadCountryPlaces: (options?: { force?: boolean }) => void;
    addPlace: (place: Place) => void;
    retryWeather: (placeId: string) => void;
}
export const useWeatherStore = create<WeatherStore>()((set, get) => {
    const setWeather = (placeId: string, entry: WeatherEntry) =>
        set((state) => ({ weather: { ...state.weather, [placeId]: entry } }));

    const loadWeather = async (place: Place) => {
        weatherRequests.get(place.id)?.abort();
        const controller = new AbortController();
        weatherRequests.set(place.id, controller);

        setWeather(place.id, { status: "loading", data: null, error: null });
        try {
            const data = await fetchCurrentWeather(place, requestSignal(controller));
            if (weatherRequests.get(place.id) !== controller) return;
            setWeather(place.id, { status: "success", data, error: null });
        } catch (error) {
            if (weatherRequests.get(place.id) !== controller) return;
            setWeather(place.id, {
                status: "error",
                data: null,
                error: toErrorMessage(error, {
                    service: "weather service",
                    fallback: "Weather data is unavailable right now.",
                }),
            });
        } finally {
            if (weatherRequests.get(place.id) === controller) weatherRequests.delete(place.id);
        }
    };

    // Keeps the first MAX_PLACES places and forgets the weather of any that fall off the end.
    const setPlaces = (places: Place[]) => {
        const kept = places.slice(0, MAX_PLACES);
        const keptIds = new Set(kept.map((p) => p.id));
        for (const [id, controller] of weatherRequests) {
            if (!keptIds.has(id)) {
                controller.abort();
                weatherRequests.delete(id);
            }
        }
        set((state) => ({
            places: kept,
            weather: Object.fromEntries(Object.entries(state.weather).filter(([id]) => keptIds.has(id))),
        }));
        return kept;
    };

    return {
        countryCode: DEFAULT_COUNTRY_CODE,
        setCountry: (code) => {
            const nextCode = code.toUpperCase();
            if (!getCountry(nextCode) || nextCode === get().countryCode) return;
            resetCountrySession();
            set({
                countryCode: nextCode,
                places: [],
                placesStatus: "idle",
                placesError: null,
                weather: {},
            })
            get().loadCountryPlaces();
        },
        places: [],
        placesStatus: "idle",
        placesError: null,
        weather: {},
        loadCountryPlaces: async ({ force = false } = {}) => {
            const { countryCode, placesStatus } = get();
            if (!force && placesStatus !== "idle") return;

            discoveryRequest?.abort();
            const controller = new AbortController();
            discoveryRequest = controller;

            set({ placesStatus: "loading", placesError: null });
            try {
                const discovered = await fetchMajorPlaces(countryCode, DISCOVERED_PLACE_COUNT, requestSignal(controller));
                if (discoveryRequest !== controller) return;

                // Places added from search while discovery was running stay first.
                const current = get().places;
                const currentIds = new Set(current.map((p) => p.id));
                const kept = setPlaces([...current, ...discovered.filter((p) => !currentIds.has(p.id))]);
                set({ placesStatus: "success" });
                for (const place of kept) {
                    if (!currentIds.has(place.id)) void loadWeather(place);
                }
            } catch (error) {
                if (discoveryRequest !== controller) return;
                set({
                    placesStatus: "error",
                    placesError: toErrorMessage(error, {
                        service: "location service",
                        fallback: "Couldn't load places for this country right now.",
                    }),
                });
            } finally {
                if (discoveryRequest === controller) discoveryRequest = null;
            }
        },
        addPlace: (place) => {
            const { places, weather } = get();
            const existing = places.find((p) => p.id === place.id);
            // New or already-listed, the chosen place moves to the front; it is never duplicated.
            setPlaces([existing ?? place, ...places.filter((p) => p.id !== place.id)]);
            if (!existing || weather[place.id]?.status === "error") void loadWeather(place);
        },
        retryWeather: (placeId) => {
            const place = get().places.find((p) => p.id === placeId);
            if (place) void loadWeather(place);
        },
    };
});
