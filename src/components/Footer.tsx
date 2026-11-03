const Footer = () => {
    return (
        <footer className="border-t border-white/[0.07] bg-black/10">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-center text-xs text-muted-foreground sm:flex-row sm:px-6 sm:text-left lg:px-8">
                <span className="font-medium tracking-tight text-foreground/80">Weatherly<span className="text-primary">.</span></span>
                <p className="max-w-2xl leading-5">
                    Weather by{' '}
                    <a href="https://open-meteo.com/" target="_blank" rel="noreferrer" className="font-medium text-foreground underline decoration-white/20 underline-offset-4 transition-colors hover:text-primary">Open-Meteo</a>
                    {' '}and location data by{' '}
                    <a href="https://www.geonames.org/" target="_blank" rel="noreferrer" className="font-medium text-foreground underline decoration-white/20 underline-offset-4 transition-colors hover:text-primary">GeoNames</a>
                    {' '}via OpenDataSoft. Licensed under CC BY 4.0.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
