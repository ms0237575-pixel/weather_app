import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WeatherApp from "@/components/WeatherApp";

const App = () => {
    return (
        <>
            <Header />
            <main>
                <WeatherApp />
            </main>
            <Footer />
        </>
    );
};
export default App;
