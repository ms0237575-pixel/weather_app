import { DEFAULT_COUNTRY_CODE, getCountry } from "@/lib/countries";
import { create } from "zustand"



interface WeatherStore {
    countryCode: string;
    setCountry: (code:string)=>void;
}
export const useWeatherStore = create<WeatherStore>()((set, get) => ({
    countryCode: DEFAULT_COUNTRY_CODE,
    setCountry: (code) => {
        if (!getCountry(code) || code === get().countryCode) return;
        set({
            countryCode:code.toUpperCase()
        })
    }
}));