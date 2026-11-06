import type { Coordinates, CurrentWeather, DailyForecastDay, Place } from "@/types/Area";
import { z } from "zod/mini";

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const SEARCH_RESULT_COUNT = 10;

const CURRENT_VARIABLES = [
    "temperature_2m",
    "apparent_temperature",
    "relative_humidity_2m",
    "wind_speed_10m",
    "weather_code",
    "is_day",
] as const;
const DAILY_VARIABLES = [
    "weather_code",
    "temperature_2m_max",
    "temperature_2m_min",
    "precipitation_probability_max",
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

const dailyForecastResponseSchema = z.object({
    daily: z.object({
        time: z.array(z.string()),
        weather_code: z.array(z.nullable(z.number())),
        temperature_2m_max: z.array(z.nullable(z.number())),
        temperature_2m_min: z.array(z.nullable(z.number())),
        precipitation_probability_max: z.array(z.nullable(z.number())),
    }),
});

// Empty fields are omitted, and "results" is missing entirely when nothing matches.
const geocodingResponseSchema = z.object({
    results: z.optional(
        z.array(
            z.object({
                id: z.number(),
                name: z.string(),
                latitude: z.number(),
                longitude: z.number(),
                admin1: z.optional(z.string()),
                country: z.optional(z.string()),
            }),
        ),
    ),
});

// Open-Meteo reports invalid requests as HTTP 400 with {"error": true, "reason": "..."}.
const errorResponseSchema = z.object({
    error: z.literal(true),
    reason: z.string(),
});

async function getJson(url: string, signal?: AbortSignal): Promise<unknown> {
    const response = await fetch(url, { signal });
    const body: unknown = await response.json().catch(() => null);

    if (!response.ok) {
        const apiError = errorResponseSchema.safeParse(body);
        throw new Error(
            apiError.success
                ? `Open-Meteo error: ${apiError.data.reason}`
                : `Open-Meteo request failed with HTTP ${response.status}`,
        );
    }
    return body;
}

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

    const parsed = forecastResponseSchema.safeParse(await getJson(`${FORECAST_URL}?${params}`, signal));
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

export async function fetchDailyForecast(
    { latitude, longitude }: Coordinates,
    signal?: AbortSignal,
): Promise<DailyForecastDay[]> {
    const params = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
        daily: DAILY_VARIABLES.join(","),
        forecast_days: "7",
        timezone: "auto",
        temperature_unit: "celsius",
    });

    const parsed = dailyForecastResponseSchema.safeParse(await getJson(`${FORECAST_URL}?${params}`, signal));
    if (!parsed.success) {
        throw new Error("Unexpected daily forecast response from Open-Meteo");
    }

    const {
        time,
        weather_code: weatherCodes,
        temperature_2m_max: temperaturesMax,
        temperature_2m_min: temperaturesMin,
        precipitation_probability_max: precipitationProbabilities,
    } = parsed.data.daily;
    const days = [
        weatherCodes.length,
        temperaturesMax.length,
        temperaturesMin.length,
        precipitationProbabilities.length,
    ];
    if (time.length !== 7 || days.some((length) => length !== time.length)) {
        throw new Error("Incomplete daily forecast response from Open-Meteo");
    }

    return time.map((date, index) => ({
        date,
        weatherCode: weatherCodes[index],
        temperatureMax: temperaturesMax[index],
        temperatureMin: temperaturesMin[index],
        precipitationProbability: precipitationProbabilities[index],
    }));
}

export async function searchPlaces(
    query: string,
    countryCode: string,
    signal?: AbortSignal,
): Promise<Place[]> {
    const params = new URLSearchParams({
        name: query,
        count: String(SEARCH_RESULT_COUNT),
        language: "en",
        format: "json",
        countryCode,
    });

    const parsed = geocodingResponseSchema.safeParse(await getJson(`${GEOCODING_URL}?${params}`, signal));
    if (!parsed.success) {
        throw new Error("Unexpected response from Open-Meteo Geocoding");
    }

    return (parsed.data.results ?? []).map((result) => ({
        id: String(result.id),
        name: result.name,
        latitude: result.latitude,
        longitude: result.longitude,
        admin1: result.admin1 || null,
        country: result.country || null,
    }));
}
