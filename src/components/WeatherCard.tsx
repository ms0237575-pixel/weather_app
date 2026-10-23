interface WeatherCardProps {
    name: string;
}
const WeatherCard = ({ name }: WeatherCardProps) => {
  return (
      <div>WeatherCard {name }</div>
  )
}

export default WeatherCard