import type { Place } from "@/types/Area";

// e.g. "Alexandria Governorate, Egypt"; empty when the result has neither field.
export function formatRegion(place: Place): string {
    return [place.admin1, place.country].filter(Boolean).join(", ");
}
