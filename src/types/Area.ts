

export interface Coordinates {
    latitude: number;
    longitude:number;
}
export type AsyncStatus = "idle" | "loading" | "success" | "error"
export interface CurrentWeather {
    time: string
    timezone: string
    temperature: number | null
    apparentTemperature: number | null
    humidity: number | null
    windSpeed: number | null
    weatherCode: number | null
    isDay:boolean
}
export interface WeatherEntry {
    status: AsyncStatus;
    data:CurrentWeather| null;
    error: string | null;
}
export interface Area extends Coordinates {
    id: string;
    name:string
}