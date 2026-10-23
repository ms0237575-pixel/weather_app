import type { Coordinates, CurrentWeather } from "@/types/Area";
import { z } from "zod/mini";

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

const CURRENT_VARIABLES = [
    "temperature_2m",
    "apparent_temperature",
    "relative_humidity_2m",
    "wind_speed_10m",
    "weather_code",
    "is_day",
] as const;

const forecastResponseSchema = z.object({
    timezone: z.string(),
    current: z.object({
        time: z.string(),
        temperature_2m: z.nullable(z.number()),
        apparent_temperature: z.nullable(z.number()),
        relative_humidity_2m: z.nullable(z.number()),
        wind_speed_10m: z.nullable(z.number()),
        weather_code: z.nullable(z.number()),
        is_day: z.nullable(z.number()),
    }),
});

// Open-Meteo reports invalid requests as HTTP 400 with {"error": true, "reason": "..."}.
const errorResponseSchema = z.object({
    error: z.literal(true),
    reason: z.string(),
});

export async function fetchCurrentWeather(
    { latitude, longitude }: Coordinates,
    signal?: AbortSignal,
): Promise<CurrentWeather> {
    const params = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
        current: CURRENT_VARIABLES.join(","),
        timezone: "auto",
        temperature_unit: "celsius",
        wind_speed_unit: "kmh",
    });

    const response = await fetch(`${FORECAST_URL}?${params}`, { signal });
    const body: unknown = await response.json().catch(() => null);

    if (!response.ok) {
        const apiError = errorResponseSchema.safeParse(body);
        throw new Error(
            apiError.success
                ? `Open-Meteo error: ${apiError.data.reason}`
                : `Open-Meteo request failed with HTTP ${response.status}`,
        );
    }

    const parsed = forecastResponseSchema.safeParse(body);
    if (!parsed.success) {
        throw new Error("Unexpected response from Open-Meteo");
    }

    const { timezone, current } = parsed.data;
    return {
        time: current.time,
        timezone,
        temperature: current.temperature_2m,
        apparentTemperature: current.apparent_temperature,
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        weatherCode: current.weather_code,
        isDay: current.is_day === 1,
    };
}
