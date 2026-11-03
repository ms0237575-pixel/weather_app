import FindLocationBar from "@/components/FindLocationBar"
import WeatherGrid from "@/components/WeatherGrid"
import { SunCloud02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

const WeatherApp = () => {
    return (
        <section className="relative mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 pb-16 pt-12 sm:px-6 sm:pt-16 lg:gap-12 lg:px-8 lg:pb-24 lg:pt-20">
            <div className="hero-panel relative isolate overflow-hidden rounded-[2rem_2rem_2rem_0.75rem] border border-white/[0.08] px-6 py-8 shadow-2xl shadow-black/15 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
                <span className="absolute bottom-0 left-0 top-0 w-1 bg-primary/70" aria-hidden="true" />
                <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
                    <div className="max-w-2xl">
                        <div className="mb-6 flex items-center gap-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            <span className="h-px w-7 bg-primary" />
                            The day, where you are
                        </div>
                        <h1 className="max-w-xl text-[2.6rem] font-medium leading-[1.03] tracking-[-0.055em] text-foreground sm:text-5xl lg:text-[4rem]">
                            A closer look
                            <br />
                            <span className="font-editorial font-normal italic text-primary">at what’s outside.</span>
                        </h1>
                        <p className="mt-5 max-w-md text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                            Current conditions for the places you call yours. No fuss, just a better feel for the day ahead.
                        </p>
                    </div>
                    <div className="hidden max-w-[13rem] shrink-0 flex-col gap-5 border-l border-white/[0.1] py-2 pl-7 lg:flex">
                        <HugeiconsIcon icon={SunCloud02Icon} className="size-8 text-primary" aria-hidden="true" strokeWidth={1.4} />
                        <p className="text-sm leading-6 text-muted-foreground">
                            A little more in tune with the world just beyond your window.
                        </p>
                        <span className="text-[0.6rem] font-medium uppercase tracking-[0.18em] text-muted-foreground/60">Weather, thoughtfully told</span>
                    </div>
                </div>
            </div>
            <FindLocationBar />
            <WeatherGrid />
        </section>
    )
}

export default WeatherApp