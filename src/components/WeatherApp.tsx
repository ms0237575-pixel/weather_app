import FindLocationBar from "@/components/FindLocationBar"
import WeatherGrid from "@/components/WeatherGrid"

const WeatherApp = () => {
    return <section className="py-20">
        <div className="container mx-auto flex flex-col gap-6">
            <FindLocationBar />
            <WeatherGrid/>
        </div>
    </section>
 }
export default WeatherApp