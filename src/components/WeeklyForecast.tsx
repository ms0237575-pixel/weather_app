import { Button } from "@/components/ui/button";
import { getWeatherDescription } from "@/lib/weatherCodes";
import { toErrorMessage } from "@/lib/requestErrors";
import { fetchDailyForecast } from "@/services/openMeteo";
import { useWeatherStore } from "@/store/weatherStores";
import type { DailyForecastDay } from "@/types/Area";
import { Refresh01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";

const REQUEST_TIMEOUT_MS = 10_000;
const CHART_WIDTH = 760;
const CHART_HEIGHT = 210;
const CHART_PADDING = { top: 20, right: 24, bottom: 34, left: 30 };

function formatTemperature(value: number | null): string {
    return value === null ? "—" : `${Math.round(value)}°`;
}

function formatDay(date: string, options: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(undefined, options).format(new Date(`${date}T12:00:00`));
}

function makeLinePath(days: DailyForecastDay[], key: "temperatureMax" | "temperatureMin", y: (value: number) => number): string {
    let hasPreviousValue = false;
    return days.flatMap((day, index) => {
        const value = day[key];
        if (value === null) {
            hasPreviousValue = false;
            return [];
        }
        const x = CHART_PADDING.left + (index * (CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right)) / (days.length - 1);
        const command = `${hasPreviousValue ? "L" : "M"} ${x} ${y(value)}`;
        hasPreviousValue = true;
        return [command];
    }).join(" ");
}

function TrendChart({ days, selectedIndex }: { days: DailyForecastDay[]; selectedIndex: number }) {
    const values = days.flatMap((day) => [day.temperatureMax, day.temperatureMin].filter((value): value is number => value !== null));
    const lowest = values.length ? Math.min(...values) : 0;
    const highest = values.length ? Math.max(...values) : 10;
    const range = Math.max(highest - lowest, 4);
    const min = lowest - range * 0.18;
    const max = highest + range * 0.18;
    const plotHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;
    const x = (index: number) =>
        CHART_PADDING.left + (index * (CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right)) / (days.length - 1);
    const y = (value: number) => CHART_PADDING.top + ((max - value) / (max - min)) * plotHeight;
    const selected = days[selectedIndex];

    return (
        <div className="w-full overflow-hidden">
            <svg
                viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
                className="h-auto w-full overflow-visible"
                role="img"
                aria-label={`Seven-day high and low temperature trend for ${days.length} days`}
            >
                <title>Seven-day temperature trend</title>
                <desc>Wine-red line shows daily highs and ivory line shows daily lows, in degrees Celsius.</desc>
                {[0, 1, 2].map((step) => {
                    const lineY = CHART_PADDING.top + (plotHeight * step) / 2;
                    return (
                        <line
                            key={step}
                            x1={CHART_PADDING.left}
                            x2={CHART_WIDTH - CHART_PADDING.right}
                            y1={lineY}
                            y2={lineY}
                            stroke="currentColor"
                            strokeOpacity="0.09"
                            strokeDasharray={step === 2 ? undefined : "3 6"}
                        />
                    );
                })}
                {selected && (
                    <line
                        x1={x(selectedIndex)}
                        x2={x(selectedIndex)}
                        y1={CHART_PADDING.top}
                        y2={CHART_HEIGHT - CHART_PADDING.bottom}
                        stroke="var(--primary)"
                        strokeOpacity="0.35"
                        strokeDasharray="3 5"
                    />
                )}
                <path d={makeLinePath(days, "temperatureMax", y)} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d={makeLinePath(days, "temperatureMin", y)} fill="none" stroke="var(--foreground)" strokeOpacity="0.72" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                {days.map((day, index) => (
                    <g key={day.date}>
                        {day.temperatureMax !== null && (
                            <circle
                                cx={x(index)}
                                cy={y(day.temperatureMax)}
                                r={selectedIndex === index ? 5 : 3.5}
                                fill="var(--primary)"
                                stroke="var(--card)"
                                strokeWidth="2"
                            />
                        )}
                        {day.temperatureMin !== null && (
                            <circle
                                cx={x(index)}
                                cy={y(day.temperatureMin)}
                                r={selectedIndex === index ? 5 : 3.5}
                                fill="var(--foreground)"
                                stroke="var(--card)"
                                strokeWidth="2"
                            />
                        )}
                        <text
                            x={x(index)}
                            y={CHART_HEIGHT - 8}
                            textAnchor="middle"
                            fill="currentColor"
                            fillOpacity={selectedIndex === index ? "0.95" : "0.52"}
                            fontSize="11"
                        >
                            {formatDay(day.date, { weekday: "short" })}
                        </text>
                    </g>
                ))}
            </svg>
        </div>
    );
}

const WeeklyForecast = () => {
    const places = useWeatherStore((state) => state.places);
    const [selectedPlaceId, setSelectedPlaceId] = useState("");
    const [forecastState, setForecastState] = useState<{
        key: string;
        status: "success" | "error";
        days: DailyForecastDay[] | null;
        error: string | null;
    } | null>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [retryCount, setRetryCount] = useState(0);
    const selectedPlace = places.find((place) => place.id === selectedPlaceId) ?? places[0];
    const placeId = selectedPlace?.id;
    const latitude = selectedPlace?.latitude;
    const longitude = selectedPlace?.longitude;
    const requestKey = placeId ? `${placeId}:${latitude}:${longitude}:${retryCount}` : "";
    const status = forecastState?.key === requestKey ? forecastState.status : "loading";
    const days = forecastState?.key === requestKey && forecastState.status === "success" ? forecastState.days : null;

    useEffect(() => {
        if (!placeId || latitude === undefined || longitude === undefined) return;

        const controller = new AbortController();
        const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(REQUEST_TIMEOUT_MS)]);
        const key = `${placeId}:${latitude}:${longitude}:${retryCount}`;

        void fetchDailyForecast({ latitude, longitude }, signal)
            .then((forecast) => {
                if (!controller.signal.aborted) {
                    setForecastState({ key, status: "success", days: forecast, error: null });
                }
            })
            .catch((requestError: unknown) => {
                if (controller.signal.aborted) return;
                setForecastState({
                    key,
                    status: "error",
                    days: null,
                    error: toErrorMessage(requestError, {
                        service: "forecast service",
                        fallback: "The 7-day forecast is unavailable right now.",
                    }),
                });
            });

        return () => controller.abort();
    }, [placeId, latitude, longitude, retryCount]);

    const selectedDay = days?.[selectedIndex];

    if (places.length === 0) return null;

    return (
        <section className="glass-panel overflow-hidden rounded-[1.75rem_1.75rem_0.75rem_1.75rem] border border-white/[0.08] shadow-xl shadow-black/10" aria-labelledby="weekly-forecast-title" aria-busy={status === "loading"}>
            <div className="flex flex-col gap-5 border-b border-white/[0.07] px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-7 sm:py-6">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-primary">
                        <span className="h-px w-5 bg-primary" />
                        The week ahead
                    </div>
                    <h2 id="weekly-forecast-title" className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">Seven-day forecast</h2>
                    <p className="mt-1 text-xs text-muted-foreground sm:text-sm">A closer look at the temperatures and conditions ahead.</p>
                </div>
                <label className="flex min-w-0 flex-col gap-1.5 text-[0.625rem] font-medium uppercase tracking-[0.12em] text-muted-foreground sm:min-w-48">
                    Forecast location
                    <select
                        className="h-10 w-full rounded-xl border border-white/[0.1] bg-background/70 px-3 text-sm font-medium normal-case tracking-normal text-foreground outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
                        value={selectedPlace?.id ?? ""}
                        onChange={(event) => {
                            setSelectedIndex(0);
                            setSelectedPlaceId(event.target.value);
                        }}
                        aria-label="Choose a city for the 7-day forecast"
                    >
                        {places.map((place) => (
                            <option key={place.id} value={place.id}>{place.name}{place.admin1 ? `, ${place.admin1}` : ""}</option>
                        ))}
                    </select>
                </label>
            </div>
            {status === "loading" && (
                <div className="space-y-5 px-5 py-6 sm:px-7" aria-live="polite">
                    <p className="text-sm text-muted-foreground">Loading the forecast for {selectedPlace?.name}…</p>
                    <div className="h-44 animate-pulse rounded-2xl bg-white/[0.035]" />
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                        {Array.from({ length: 7 }, (_, index) => <div key={index} className="h-24 animate-pulse rounded-xl bg-white/[0.035]" />)}
                    </div>
                </div>
            )}
            {status === "error" && (
                <div className="flex flex-col items-start gap-3 px-5 py-8 sm:px-7">
                    <p className="text-sm text-destructive" role="alert">{forecastState?.error}</p>
                    <Button variant="outline" size="sm" onClick={() => setRetryCount((count) => count + 1)}>
                        <HugeiconsIcon icon={Refresh01Icon} data-icon="inline-start" aria-hidden="true" />
                        Retry forecast
                    </Button>
                </div>
            )}
            {status === "success" && days && selectedDay && (
                <div className="space-y-5 px-5 py-5 sm:px-7 sm:py-6">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <p className="text-[0.625rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">{formatDay(selectedDay.date, { weekday: "long", month: "long", day: "numeric" })}</p>
                            <p className="mt-1 text-sm font-medium text-foreground">{getWeatherDescription(selectedDay.weatherCode)}</p>
                        </div>
                        <div className="flex items-baseline gap-3">
                            <span className="text-3xl font-semibold tracking-[-0.06em] tabular-nums text-primary">{formatTemperature(selectedDay.temperatureMax)}</span>
                            <span className="text-lg font-medium tracking-[-0.04em] tabular-nums text-muted-foreground">{formatTemperature(selectedDay.temperatureMin)}</span>
                            {selectedDay.precipitationProbability !== null && (
                                <span className="text-xs tabular-nums text-muted-foreground">{Math.round(selectedDay.precipitationProbability)}% rain</span>
                            )}
                        </div>
                    </div>
                    <div className="rounded-2xl border border-white/[0.06] bg-background/25 px-2 py-3 sm:px-4" role="group" aria-label="Temperature chart showing daily highs and lows in Celsius">
                        <div className="mb-1 flex justify-end gap-4 pr-2 text-[0.625rem] font-medium text-muted-foreground">
                            <span className="flex items-center gap-1.5"><i className="h-0.5 w-3 rounded bg-primary" aria-hidden="true" />High</span>
                            <span className="flex items-center gap-1.5"><i className="h-0.5 w-3 rounded bg-foreground/70" aria-hidden="true" />Low</span>
                        </div>
                        <TrendChart days={days} selectedIndex={selectedIndex} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7" role="group" aria-label="Select a day to see its forecast">
                        {days.map((day, index) => {
                            const selected = selectedIndex === index;
                            return (
                                <button
                                    key={day.date}
                                    type="button"
                                    aria-pressed={selected}
                                    onClick={() => setSelectedIndex(index)}
                                    className={`flex min-h-24 flex-col items-center justify-center gap-1 rounded-xl border px-2 py-3 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${selected ? "border-primary/35 bg-primary/[0.08]" : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.14] hover:bg-white/[0.045]"}`}
                                >
                                    <span className={`text-[0.625rem] font-medium uppercase tracking-wide ${selected ? "text-primary" : "text-muted-foreground"}`}>{index === 0 ? "Today" : formatDay(day.date, { weekday: "short" })}</span>
                                    <span className="text-sm font-semibold tabular-nums text-foreground">{formatTemperature(day.temperatureMax)}</span>
                                    <span className="text-xs tabular-nums text-muted-foreground">{formatTemperature(day.temperatureMin)}</span>
                                </button>
                            );
                        })}
                    </div>
                    <p className="text-right text-[0.625rem] text-muted-foreground/70">Temperatures in °C · Forecast data by Open-Meteo</p>
                </div>
            )}
        </section>
    );
};

export default WeeklyForecast;
