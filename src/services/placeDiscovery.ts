import type { Place } from "@/types/Area";
import { z } from "zod/mini";

// GeoNames "cities with a population > 1000" (CC BY 4.0), served by OpenDataSoft's public Explore API.
// geoname_id matches the `id` returned by the Open-Meteo Geocoding API, so places can be de-duplicated by id.
const DATASET_URL =
    "https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/geonames-all-cities-with-a-population-1000/records";

const recordsResponseSchema = z.object({
    results: z.array(
        z.object({
            geoname_id: z.union([z.string(), z.number()]),
            name: z.string(),
            cou_name_en: z.nullable(z.string()),
            coordinates: z.object({ lat: z.number(), lon: z.number() }),
        }),
    ),
});

const errorResponseSchema = z.object({
    message: z.string(),
});

// Largest populated places in a country, most populous first.
export async function fetchMajorPlaces(
    countryCode: string,
    limit: number,
    signal?: AbortSignal,
): Promise<Place[]> {
    // The code is interpolated into an ODSQL filter, so only accept ISO alpha-2.
    if (!/^[A-Z]{2}$/.test(countryCode)) {
        throw new Error(`Invalid country code: ${countryCode}`);
    }

    const params = new URLSearchParams({
        select: "geoname_id,name,cou_name_en,coordinates",
        where: `country_code="${countryCode}"`,
        order_by: "population desc",
        limit: String(limit),
    });

    const response = await fetch(`${DATASET_URL}?${params}`, { signal });
    const body: unknown = await response.json().catch(() => null);

    if (!response.ok) {
        const apiError = errorResponseSchema.safeParse(body);
        throw new Error(
            apiError.success
                ? `OpenDataSoft error: ${apiError.data.message}`
                : `OpenDataSoft request failed with HTTP ${response.status}`,
        );
    }

    const parsed = recordsResponseSchema.safeParse(body);
    if (!parsed.success) {
        throw new Error("Unexpected response from OpenDataSoft");
    }

    return parsed.data.results.map((record) => ({
        id: String(record.geoname_id),
        name: record.name,
        latitude: record.coordinates.lat,
        longitude: record.coordinates.lon,
        admin1: null,
        country: record.cou_name_en,
    }));
}
