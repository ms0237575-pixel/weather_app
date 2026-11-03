import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WeatherApp from "@/components/WeatherApp";

const App = () => {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                <WeatherApp />
            </main>
            <Footer />
        </div>
    );
};
export default App;
