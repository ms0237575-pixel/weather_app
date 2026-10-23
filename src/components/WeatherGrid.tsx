import WeatherCard from "@/components/WeatherCard";
import WeatherState from "@/components/WeatherState";
import { CAIRO_AREAS } from "@/config/cairoAreas";

const WeatherGrid = () => {
    return (
        <div className="flex flex-col gap-4">
            <WeatherState />
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {CAIRO_AREAS.map((area) => (
                    <li key={area.id} >
                        <WeatherCard name={area.name } />
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default WeatherGrid;
