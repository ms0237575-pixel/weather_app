import { toErrorMessage } from "@/lib/requestErrors";
import { searchPlaces } from "@/services/openMeteo";
import type { AsyncStatus, Place } from "@/types/Area";
import { useCallback, useEffect, useState } from "react";

// Open-Meteo returns nothing for empty or single-character names.
export const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;
const REQUEST_TIMEOUT_MS = 10_000;

interface SearchResult {
    key: string;
    attempt: number;
    status: Exclude<AsyncStatus, "idle" | "loading">;
    places: Place[];
    error: string | null;
}

export interface LocationSearchState {
    status: AsyncStatus;
    places: Place[];
    error: string | null;
    retry: () => void;
}

export function useLocationSearch(query: string, countryCode: string): LocationSearchState {
    const term = query.trim();
    const key = `${countryCode}:${term}`;
    const [attempt, setAttempt] = useState(0);
    const [result, setResult] = useState<SearchResult | null>(null);

    useEffect(() => {
        if (term.length < MIN_QUERY_LENGTH) return;

        // Aborting on cleanup cancels the request for a query that has since changed.
        const controller = new AbortController();
        const timer = setTimeout(async () => {
            try {
                const places = await searchPlaces(
                    term,
                    countryCode,
                    AbortSignal.any([controller.signal, AbortSignal.timeout(REQUEST_TIMEOUT_MS)]),
                );
                if (controller.signal.aborted) return;
                setResult({ key, attempt, status: "success", places, error: null });
            } catch (error) {
                if (controller.signal.aborted) return;
                setResult({
                    key,
                    attempt,
                    status: "error",
                    places: [],
                    error: toErrorMessage(error, {
                        service: "location search",
                        fallback: "Location search is unavailable right now.",
                    }),
                });
            }
        }, DEBOUNCE_MS);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [term, countryCode, key, attempt]);

    const retry = useCallback(() => setAttempt((n) => n + 1), []);

    if (term.length < MIN_QUERY_LENGTH) {
        return { status: "idle", places: [], error: null, retry };
    }
    // Results for any other query or attempt are stale; treat the current one as still loading.
    if (!result || result.key !== key || result.attempt !== attempt) {
        return { status: "loading", places: [], error: null, retry };
    }
    return { status: result.status, places: result.places, error: result.error, retry };
}
