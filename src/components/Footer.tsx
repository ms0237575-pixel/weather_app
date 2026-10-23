const Footer = () => {
    return (
        <footer className="border-t border-border/70">
            <div className="container mx-auto text-xs text-muted-foreground py-6">
                <div className="flex items-center gap-0.5 justify-center">
                    Weather data by
                    <a href="#" className="font-medium text-foreground underline-offset-4 hover:underline">
                        Open-Meteo.com
                    </a>
                    (CC BY 4.0). Location data from
                    <a className="font-medium text-foreground underline-offset-4 hover:underline">GeoNames</a>
                    (CC BY 4.0) via the Open-Meteo Geocoding API and OpenDataSoft.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
