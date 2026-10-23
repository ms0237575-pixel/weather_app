import type { WeatherEntry } from '@/types/Area';
import React from 'react'
interface WeatherCardProps {
    name: string;
    entry:WeatherEntry;
    onRetry:()=>void
}
const WeatherCard = ({ name, entry, onRetry }: WeatherCardProps) => {
  return (
      <div>WeatherCard {name }</div>
  )
}

export default WeatherCard