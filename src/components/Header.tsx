import { SunCloud01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const Header = () => {
    return (
        <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-background/75 backdrop-blur-xl">
            <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <a href="/" className="group flex items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Weatherly home">
                    <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/10 transition-transform group-hover:rotate-[-6deg]">
                        <HugeiconsIcon icon={SunCloud01Icon} strokeWidth={1.8} className="size-[1.35rem]" />
                    </span>
                    <span className="flex flex-col">
                        <span className="text-base font-semibold tracking-tight text-foreground">Weatherly</span>
                        <span className="text-[0.625rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">Your daily forecast</span>
                    </span>
                </a>
                <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1.5">
                    <span className="relative flex size-2">
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/35 motion-reduce:animate-none" />
                        <span className="relative inline-flex size-2 rounded-full bg-primary" />
                    </span>
                    <span className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        <span className="sm:hidden">Live</span>
                        <span className="hidden sm:inline">Current conditions</span>
                    </span>
                </div>
            </div>
        </header>
    );
};
export default Header;
