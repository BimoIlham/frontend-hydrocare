import { useState } from 'react'
import Card from '../ui/Card'
import { Cloud, Sun, Thermometer, Droplets, Info } from 'lucide-react'

const WEATHER_ICONS = {
  '01d': Sun, '01n': Cloud, '02d': Cloud, '02n': Cloud,
  '03d': Cloud, '03n': Cloud, '04d': Cloud, '09d': Droplets,
  '10d': Droplets, '11d': Cloud, '13d': Cloud, '50d': Cloud,
}

export default function WeatherCard({ weather, loading }) {
  const [showTooltip, setShowTooltip] = useState(false)
  if (loading) return <Card className="animate-pulse"><div className="h-20 bg-sky-50/60 rounded-xl" /></Card>
  if (!weather) return null

  const WeatherIcon = WEATHER_ICONS[weather.icon] || Cloud
  const isHot = weather.temperature > 32
  const actualTemp = Math.round(weather.temperature)
  const feelsLike = Math.round(weather.feels_like)
  const diff = feelsLike - actualTemp

  return (
    <Card className={isHot ? 'border-amber-200/60 bg-amber-50/40' : ''}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1 font-medium">Cuaca di {weather.city}</p>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-gradient">{actualTemp}°C</span>
            <WeatherIcon className={`w-6 h-6 ${isHot ? 'text-amber-500' : 'text-cyan-500'}`} />
          </div>
          <p className="text-sm text-gray-500 mt-1.5 capitalize">{weather.description}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <div className="relative">
              <button onClick={() => setShowTooltip(!showTooltip)} onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}
                className="flex items-center gap-1 hover:text-gray-700 transition-colors cursor-help">
                <Thermometer className="w-3 h-3" /> Terasa {feelsLike}°C
                {diff > 0 && <Info className="w-3 h-3 text-sky-400" />}
              </button>
              {showTooltip && diff > 0 && (
                <div className="absolute bottom-full left-0 mb-2 w-64 p-3 rounded-xl bg-white/90 backdrop-blur-xl border border-sky-200/60 shadow-xl text-xs text-gray-600 leading-relaxed z-50 animate-fade-in">
                  <div className="flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 text-sky-500 mt-0.5 flex-shrink-0" />
                    <p>Suhu asli adalah <span className="text-gray-800 font-semibold">{actualTemp}°C</span>, namun kelembapan udara yang tinggi (<span className="text-cyan-600 font-semibold">{weather.humidity}%</span>) membuat keringat lebih sulit menguap, sehingga tubuhmu merasakannya seperti <span className="text-amber-600 font-semibold"> {feelsLike}°C</span>.</p>
                  </div>
                  <div className="absolute -bottom-1.5 left-4 w-3 h-3 bg-white/90 border-r border-b border-sky-200/60 transform rotate-45" />
                </div>
              )}
            </div>
            <span className="flex items-center gap-1"><Droplets className="w-3 h-3" />{weather.humidity}%</span>
          </div>
        </div>
        <div className="text-right">
          {isHot && (
            <>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-600 border border-amber-200/60">
                <Sun className="w-3 h-3" /> Cuaca Panas!
              </div>
              <p className="text-xs text-amber-500/70 mt-2 max-w-[130px]">Tambah target minum hari ini</p>
            </>
          )}
        </div>
      </div>
    </Card>
  )
}