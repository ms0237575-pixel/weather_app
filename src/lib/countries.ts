import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";

countries.registerLocale(en);

export interface Country {
    code: string;
    name: string;
    flag: string;
}

export const DEFAULT_COUNTRY_CODE = "EG";

function toFlagEmoji(code: string): string {
    return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

export const COUNTRIES: readonly Country[] = Object.entries(countries.getNames("en", { select: "alias" }))
    .map(([code, name]) => ({ code, name, flag: toFlagEmoji(code) }))
    .sort((a, b) => a.name.localeCompare(b.name));

const byCode = new Map(COUNTRIES.map((c) => [c.code, c]));

export function getCountry(code: string): Country | undefined {
    return byCode.get(code.toUpperCase());
}
