import { Button } from "@/components/ui/button";
import { CommandItem } from "@/components/ui/command";
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group";
import { MIN_QUERY_LENGTH, useLocationSearch } from "@/hooks/useLocationSearch";
import { getCountry } from "@/lib/countries";
import { formatRegion } from "@/lib/places";
import { useWeatherStore } from "@/store/weatherStores";
import type { Place } from "@/types/Area";
import { Location01Icon, Refresh01Icon, SearchIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Command as CommandPrimitive } from "cmdk";
import { useRef, useState } from "react";

const LocationSearch = () => {
    const countryCode = useWeatherStore((s) => s.countryCode);
    const addPlace = useWeatherStore((s) => s.addPlace);
    const countryName = getCountry(countryCode)?.name ?? countryCode;

    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const search = useLocationSearch(query, countryCode);
    const term = query.trim();

    const choose = (place: Place) => {
        addPlace(place);
        setQuery("");
        setOpen(false);
    };

    let message: string | null = null;
    if (term.length < MIN_QUERY_LENGTH) message = `Type at least ${MIN_QUERY_LENGTH} characters to search.`;
    else if (search.status === "loading") message = "Searching…";
    else if (search.status === "success" && search.places.length === 0) message = `No places found for “${term}” in ${countryName}.`;

    return (
        <CommandPrimitive
            shouldFilter={false}
            label={`Search for a city or governorate in ${countryName}`}
            className="relative flex flex-1 min-w-0 flex-col gap-2"
            onKeyDown={(e) => {
                if (e.key === "Escape" && open) {
                    e.preventDefault();
                    setOpen(false);
                }
            }}
            onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
            }}
        >
            <span className="text-xs font-medium text-muted-foreground" aria-hidden="true">
                Location
            </span>
            <InputGroup className="h-12 rounded-xl border-white/[0.1] bg-white/[0.035] transition-colors hover:bg-white/[0.05] has-[[cmdk-input]:focus-visible]:border-ring has-[[cmdk-input]:focus-visible]:ring-2 has-[[cmdk-input]:focus-visible]:ring-ring/30">
                <InputGroupAddon>
                    <HugeiconsIcon icon={SearchIcon} className="size-4 text-primary" aria-hidden="true" />
                </InputGroupAddon>
                <CommandPrimitive.Input
                    ref={inputRef}
                    value={query}
                    onValueChange={(value) => {
                        setQuery(value);
                        setOpen(value.trim().length > 0);
                    }}
                    onFocus={() => setOpen(query.trim().length > 0)}
                    placeholder={`Search a city or governorate in ${countryName}…`}
                    className="h-full w-full min-w-0 bg-transparent pr-3 text-sm outline-hidden placeholder:text-muted-foreground/75"
                />
            </InputGroup>
            {open && (
                <CommandPrimitive.List
                    label="Matching places"
                    className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-white/[0.1] bg-popover/95 p-1 text-popover-foreground shadow-2xl backdrop-blur-xl"
                    // Keep focus in the input while clicking results, so blur doesn't close the list first.
                    onMouseDown={(e) => e.preventDefault()}
                >
                    {message && (
                        <div role="status" className="px-2.5 py-3 text-center text-xs/relaxed text-muted-foreground">
                            {message}
                        </div>
                    )}
                    {search.status === "error" && (
                        <div role="alert" className="flex flex-col items-center gap-2 px-2.5 py-3 text-center text-xs/relaxed text-destructive">
                            {search.error}
                            <Button
                                variant="outline"
                                size="sm"
                                // cmdk's root swallows Enter for item selection; let it activate this button instead.
                                onKeyDown={(e) => {
                                    if (e.key !== "Escape") e.stopPropagation();
                                }}
                                onClick={() => {
                                    search.retry();
                                    inputRef.current?.focus();
                                }}
                            >
                                <HugeiconsIcon icon={Refresh01Icon} data-icon="inline-start" aria-hidden="true" />
                                Retry search
                            </Button>
                        </div>
                    )}
                    {search.status === "success" &&
                        search.places.map((place) => (
                            <CommandItem key={place.id} value={place.id} onSelect={() => choose(place)} className="text-sm">
                                <HugeiconsIcon icon={Location01Icon} className="size-4 text-muted-foreground" aria-hidden="true" />
                                <span className="flex min-w-0 flex-col">
                                    <span className="truncate font-medium">{place.name}</span>
                                    {formatRegion(place) && (
                                        <span className="truncate text-xs text-muted-foreground">{formatRegion(place)}</span>
                                    )}
                                </span>
                            </CommandItem>
                        ))}
                </CommandPrimitive.List>
            )}
        </CommandPrimitive>
    );
};

export default LocationSearch;
