import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { COUNTRIES, getCountry } from "@/lib/countries";
import { useWeatherStore } from "@/store/weatherStores";
import { UnfoldMoreIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

const CountrySelector = () => {
    const [open, setOpen] = useState(false);
    const countryCode = useWeatherStore((s) => s.countryCode);
    const setCountry = useWeatherStore((s) => s.setCountry);
    const selected = getCountry(countryCode);

    return (
        <div className="flex min-w-0 flex-col gap-2 md:w-64 md:shrink-0">
            <Label className="text-xs font-medium text-muted-foreground" id="country-label" htmlFor="country-trigger">
                Country
            </Label>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger
                    id="country-trigger"
                    render={<Button variant="outline" className="h-12 w-full justify-between gap-2 rounded-xl border-white/10 bg-white/[0.035] px-3 text-sm font-medium hover:bg-white/[0.07]" />}>
                    <span className="flex min-w-0 items-center gap-2">
                        {selected ? (
                            <>
                                <span className="text-lg leading-none">{selected.flag}</span>
                                <span className="truncate">{selected.name}</span>
                            </>
                        ) : (
                            <span className="text-muted-foreground">Select a country</span>
                        )}
                    </span>
                    <HugeiconsIcon icon={UnfoldMoreIcon}/>
                </PopoverTrigger>
                <PopoverContent align="start" className="min-w-[min(18rem,calc(100vw-2rem))] border-white/10 bg-popover/95 p-0 shadow-2xl backdrop-blur-xl">
                    <Command>
                        <CommandInput placeholder="Search Countries..." />
                        <CommandList>
                            <CommandEmpty>No country found.</CommandEmpty>
                            <CommandGroup>
                                {COUNTRIES.map((country) => (
                                    <CommandItem key={country.code} value={`${country.name} ${country.code}`} data-checked={country.code === countryCode} onSelect={() => {
                                        setCountry(country.code)
                                        setOpen(false)
                                    }}>
                                        <span className="text-base leading-none">{country.flag}</span>
                                        <span className="truncate">{country.name}</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default CountrySelector;
