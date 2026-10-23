import { SunCloud01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
const Header = () => {
    return (
        <header className="border-b border-border bg-card/80 backdrop-blur ">
            <div className="container mx-auto h-16 flex items-center">
                <div className="flex items-center gap-2.5">
                    <span className="flex items-center justify-center size-9 bg-primary rounded-xl text-primary-foreground">
                        <HugeiconsIcon icon={SunCloud01Icon} strokeWidth={1.8} className="size-5"/>
                    </span>
                    <span className="text-lg font-semibold text-foreground">Weatherly</span>
                </div>
            </div>
        </header>
    );
};
export default Header;
