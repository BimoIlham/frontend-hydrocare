import { useEffect, useState, useMemo } from 'react'
import { historyService } from '../services/historyService'
import { weatherService } from '../services/weatherService'
import useUserStore from '../store/useUserStore'
import useHydrationStore from '../store/useHydrationStore'
import WeatherCard from '../components/dashboard/WeatherCard'
import QuickAddWater from '../components/dashboard/QuickAddWater'
import StreakCounter from '../components/gamification/StreakCounter'
import { useReminder } from '../hooks/useReminder'
import Card from '../components/ui/Card'
import {
  Target, CheckCircle2, AlertTriangle, Info, Droplets, Clock,
  TrendingUp, Lightbulb, GlassWater, Sparkles, Activity
} from 'lucide-react'

const HYDRATION_TIPS = [
  { icon: '💡', title: 'Pencernaan Optimal', text: 'Minum segelas air 30 menit sebelum makan bisa membantu memperlancar pencernaan.' },
  { icon: '🧠', title: 'Fokus & Konsentrasi', text: 'Otak kita butuh air! Dehidrasi ringan bisa menurunkan konsentrasi hingga 25%.' },
  { icon: '🏃', title: 'Performa Olahraga', text: 'Saat berolahraga, usahakan minum 150-250 mL air setiap 15 menit agar tetap bertenaga.' },
  { icon: '🌅', title: 'Morning Ritual', text: 'Minum segelas air hangat saat bangun tidur sangat baik untuk mengaktifkan organ tubuh.' },
  { icon: '🍋', title: 'Rasa Ekstra', text: 'Bosan air tawar? Tambahkan irisan lemon atau mentimun untuk rasa segar dan vitamin ekstra.' },
  { icon: '😴', title: 'Tidur Berkualitas', text: 'Kurang minum air bisa menyebabkan kelelahan kronis dan membuatmu lebih sulit tidur lelap.' },
  { icon: '🫀', title: 'Kesehatan Jantung', text: 'Hidrasi yang baik membuat darah tidak mengental, sehingga meringankan kerja jantung.' },
  { icon: '✨', title: 'Kulit Glowing', text: 'Rahasia kulit cerah ada pada hidrasi! Minum cukup air menjaga elastisitas kulit dari dalam.' },
  { icon: '💧', title: 'Mencegah Batu Ginjal', text: 'Minum air dalam jumlah cukup adalah cara terbaik mencegah pembentukan batu ginjal.' },
  { icon: '🌡️', title: 'Suhu Tubuh', text: 'Air bertindak sebagai sistem pendingin tubuh. Pastikan minum lebih banyak saat cuaca panas.' }
]

function WaterBottle({ percentage }) {
  const level = Math.min(percentage, 100)
  const getColor = () => {
    if (percentage >= 100) return { from: '#10b981', to: '#34d399' }
    return { from: '#0ea5e9', to: '#38bdf8' }
  }
  const color = getColor()

  return (
    <div className="relative w-28 h-44 mx-auto flex-shrink-0">
      <svg viewBox="0 0 80 130" className="w-full h-full drop-shadow-lg">
        <rect x="28" y="0" width="24" height="12" rx="4" fill="rgba(14,165,233,0.08)" stroke="rgba(14,165,233,0.2)" strokeWidth="1.5" />
        <rect x="10" y="12" width="60" height="114" rx="14" fill="rgba(255,255,255,0.5)" stroke="rgba(14,165,233,0.15)" strokeWidth="1.5" />
        <defs>
          <clipPath id="bottleClip">
            <rect x="11" y="13" width="58" height="112" rx="13" />
          </clipPath>
          <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color.from} stopOpacity="0.85" />
            <stop offset="100%" stopColor={color.to} stopOpacity="0.5" />
          </linearGradient>
        </defs>
        <g clipPath="url(#bottleClip)">
          <rect x="11" y={13 + 112 * (1 - level / 100)} width="58" height={112 * level / 100} fill="url(#waterGrad)" style={{ transition: 'y 0.8s ease-out, height 0.8s ease-out' }} />
          {level > 0 && level < 100 && (
            <path d={`M11 ${13 + 112 * (1 - level / 100)} Q25 ${13 + 112 * (1 - level / 100) - 5} 40 ${13 + 112 * (1 - level / 100)} Q55 ${13 + 112 * (1 - level / 100) + 5} 69 ${13 + 112 * (1 - level / 100)} V125 H11 Z`} fill="url(#waterGrad)" opacity="0.4" style={{ transition: 'all 0.8s ease-out' }} />
          )}
        </g>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center" style={{ paddingTop: '12px' }}>
        <div className="text-center">
          <span className="text-2xl font-bold text-gradient">{Math.round(percentage)}%</span>
          <p className="text-[9px] text-gray-500 font-medium mt-0.5">
            {percentage >= 100 ? '✓ Tercapai!' : 'terisi'}
          </p>
        </div>
      </div>
    </div>
  )
}

function NextDrinkReminder({ totalToday, dailyTarget, logsCount }) {
  const remaining = Math.max(0, dailyTarget - totalToday)
  const [now, setNow] = useState(new Date())
  useEffect(() => { const timer = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(timer) }, [])
  const hours = now.getHours(), minutes = now.getMinutes()
  const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  const endHour = 22, minutesLeft = Math.max(0, (endHour - hours) * 60 - minutes)
  const hoursLeftDisplay = Math.floor(minutesLeft / 60), minsLeftDisplay = minutesLeft % 60
  const mlPerHour = minutesLeft > 0 ? Math.round(remaining / (minutesLeft / 60)) : 0
  const glassesLeft = remaining > 0 ? Math.ceil(remaining / 250) : 0

  if (remaining <= 0) {
    return (
      <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200/60 animate-fade-in backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-700">Target Tercapai! 🎉</p>
            <p className="text-xs text-emerald-600/70 mt-0.5">Kerja bagus! Tetap jaga hidrasi kamu ya.</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-emerald-600 font-mono">{timeStr}</p>
            <p className="text-[10px] text-emerald-500/60">waktu saat ini</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 rounded-xl bg-sky-50/80 border border-sky-200/60 animate-fade-in backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
            <Clock className="w-5 h-5 text-sky-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">Saran Minum Berikutnya</p>
            <p className="text-xs text-gray-500 mt-0.5">Update otomatis secara real-time</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-sky-600 font-mono">{timeStr}</p>
          <p className="text-[10px] text-gray-400">waktu saat ini</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center p-2 rounded-lg bg-white/50">
          <p className="text-lg font-bold text-sky-600">{mlPerHour}</p>
          <p className="text-[10px] text-gray-500">mL/jam</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-white/50">
          <p className="text-lg font-bold text-sky-600">{glassesLeft}</p>
          <p className="text-[10px] text-gray-500">gelas lagi</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-white/50">
          <p className="text-lg font-bold text-sky-600">
            {hoursLeftDisplay}<span className="text-xs text-gray-500">j</span>{' '}
            {minsLeftDisplay}<span className="text-xs text-gray-500">m</span>
          </p>
          <p className="text-[10px] text-gray-500">tersisa</p>
        </div>
      </div>
    </div>
  )
}

function WeeklySparkline({ weeklyData, dailyTarget }) {
  if (!weeklyData || weeklyData.length === 0) return null
  const max = Math.max(...weeklyData.map((d) => d.total_ml || 0), dailyTarget)
  const points = weeklyData.map((d, i) => {
    const x = (i / Math.max(weeklyData.length - 1, 1)) * 200
    const y = 40 - ((d.total_ml || 0) / max) * 36
    return `${x},${y}`
  }).join(' ')
  const targetY = 40 - (dailyTarget / max) * 36
  const goalsHit = weeklyData.filter((d) => d.goal_met).length

  return (
    <Card className="animate-fade-in animate-delay-300">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-sky-500" /> Tren 7 Hari
        </h3>
        <span className="text-[11px] text-gray-500">{goalsHit}/{weeklyData.length} target tercapai</span>
      </div>
      <svg viewBox="0 0 200 48" className="w-full h-12">
        <line x1="0" y1={targetY} x2="200" y2={targetY} stroke="rgba(14,165,233,0.25)" strokeWidth="1" strokeDasharray="4 3" />
        <polygon points={`0,40 ${points} 200,40`} fill="url(#sparkFill)" opacity="0.2" />
        <polyline points={points} fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {weeklyData.map((d, i) => {
          const x = (i / Math.max(weeklyData.length - 1, 1)) * 200
          const y = 40 - ((d.total_ml || 0) / max) * 36
          return <circle key={i} cx={x} cy={y} r="3" fill={d.goal_met ? '#0ea5e9' : '#ffffff'} stroke={d.goal_met ? '#0ea5e9' : '#94a3b8'} strokeWidth="1.5" />
        })}
        <defs>
          <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      <div className="flex justify-between mt-1">
        {weeklyData.map((d, i) => (
          <span key={i} className={`text-[9px] font-medium ${d.goal_met ? 'text-sky-500' : 'text-gray-400'}`}>
            {d.day_name?.slice(0, 3)}
          </span>
        ))}
      </div>
    </Card>
  )
}

function TipOfTheDay() {
  const [seed, setSeed] = useState(0)
  
  useEffect(() => {
    // Generate a fixed random seed based on the current date, so it changes randomly each day but stays consistent within the same day
    const now = new Date()
    const dailySeed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
    setSeed(dailySeed)
  }, [])

  // Pseudo-random selection based on the daily seed
  const tipIndex = (seed * 13) % HYDRATION_TIPS.length
  const tip = HYDRATION_TIPS[tipIndex] || HYDRATION_TIPS[0]

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50 via-white to-blue-50 
                    border border-sky-100 shadow-sm animate-fade-in animate-delay-500 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-sky-200/20 rounded-full blur-3xl transform translate-x-10 -translate-y-10" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-200/20 rounded-full blur-2xl transform -translate-x-10 translate-y-10" />
      
      <div className="flex items-start gap-4 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center flex-shrink-0 text-2xl shadow-inner border border-white">
          {tip.icon}
        </div>
        <div className="flex-1 pt-0.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span className="text-[11px] font-bold tracking-wider text-sky-600 uppercase">Tip Hari Ini</span>
          </div>
          <h4 className="text-sm font-bold text-gray-800 mb-1">{tip.title}</h4>
          <p className="text-sm text-gray-600 leading-relaxed">{tip.text}</p>
        </div>
      </div>
    </div>
  )
}

function ProgressBar({ current, target }) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-gray-500">Progress Harian</span>
        <span className="text-sky-600 font-bold">{Math.round(pct)}%</span>
      </div>
      <div className="w-full h-2.5 rounded-full bg-sky-100/60 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
          style={{
            width: `${pct}%`,
            background: pct >= 100 ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #0ea5e9, #38bdf8)',
          }}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" style={{ animation: 'shimmer 2s infinite' }} />
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { profile, dailyTarget, hydrationBreakdown } = useUserStore()
  const { totalToday, todayLogs, streak, weeklyData, setTodayData, setWeeklyData } = useHydrationStore()
  const [weather, setWeather] = useState(null)
  const [loadingWeather, setLoadingWeather] = useState(true)
  const percentage = dailyTarget > 0 ? (totalToday / dailyTarget) * 100 : 0
  const remaining = Math.max(0, dailyTarget - totalToday)
  useReminder(2)

  const loadData = async () => {
    try {
      const [todayRes, weekRes] = await Promise.all([historyService.getToday(dailyTarget), historyService.getWeekly(dailyTarget)])
      setTodayData(todayRes.logs || [], todayRes.total_ml || 0)
      setWeeklyData(weekRes.data || [])
    } catch (err) { console.error('Error loading data:', err) }
  }
  const loadWeather = async () => {
    setLoadingWeather(true)
    try { const res = await weatherService.getWeather(profile?.city || 'Bandar Lampung'); setWeather(res.data) }
    catch { setWeather(null) }
    finally { setLoadingWeather(false) }
  }
  useEffect(() => { loadData(); loadWeather() }, [])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Selamat Pagi'; if (hour < 17) return 'Selamat Siang'; if (hour < 20) return 'Selamat Sore'; return 'Selamat Malam'
  }
  const getGreetingEmoji = () => {
    const hour = new Date().getHours()
    if (hour < 12) return '🌅'; if (hour < 17) return '☀️'; if (hour < 20) return '🌇'; return '🌙'
  }

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          {getGreeting()}, {profile?.name?.split(' ')[0] || 'Kamu'}! {getGreetingEmoji()}
        </h2>
        <p className="text-gray-500 mt-1 font-medium">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <Card className="animate-fade-in animate-delay-100 overflow-hidden relative">
        {percentage >= 100 && (
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/50 via-transparent to-emerald-50/50 pointer-events-none" />
        )}
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 relative">
          <WaterBottle percentage={percentage} />
          <div className="flex-1 text-center md:text-left space-y-3">
            <div>
              <p className="text-sm text-gray-500 mb-1 font-medium">Total minum hari ini</p>
              <p className="text-5xl font-extrabold text-gray-800 tracking-tight">
                {totalToday} <span className="text-xl text-gray-400 font-medium">mL</span>
              </p>
            </div>
            <ProgressBar current={totalToday} target={dailyTarget} />
            <p className="text-gray-500 text-sm">
              Target: <span className="font-semibold text-sky-600">{dailyTarget} mL</span>
              {' · '}<span className="text-gray-400">{(dailyTarget / 1000).toFixed(1)} liter</span>
            </p>
            {remaining > 0 ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200/60 text-sm">
                <Target className="w-4 h-4 text-amber-500" />
                <span className="text-amber-700 font-medium">Kurang {remaining} mL lagi</span>
              </div>
            ) : percentage <= 120 ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-sm">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-700 font-medium">Target hari ini tercapai! 🎉</span>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200/60">
                <p className="text-sm text-red-700 font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  Sudah {Math.round(percentage)}% dari target!
                </p>
                <p className="text-xs text-red-600/70 mt-1">
                  Kelebihan {totalToday - dailyTarget} mL. Minum berlebihan bisa mengganggu keseimbangan elektrolit.
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-3 animate-fade-in animate-delay-200">
        <div className="p-3 rounded-xl bg-white/50 border border-sky-100/60 text-center hover:border-sky-300/40 transition-all duration-300 backdrop-blur-sm">
          <GlassWater className="w-5 h-5 text-sky-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-gray-800">{todayLogs.length}</p>
          <p className="text-[10px] text-gray-500 font-medium">kali minum</p>
        </div>
        <div className="p-3 rounded-xl bg-white/50 border border-sky-100/60 text-center hover:border-sky-300/40 transition-all duration-300 backdrop-blur-sm">
          <Droplets className="w-5 h-5 text-cyan-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-gray-800">{remaining}</p>
          <p className="text-[10px] text-gray-500 font-medium">mL tersisa</p>
        </div>
        <div className="p-3 rounded-xl bg-white/50 border border-sky-100/60 text-center hover:border-sky-300/40 transition-all duration-300 backdrop-blur-sm">
          <TrendingUp className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-gray-800">{todayLogs.length > 0 ? Math.round(totalToday / todayLogs.length) : 0}</p>
          <p className="text-[10px] text-gray-500 font-medium">mL rata-rata</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        <div className="flex flex-col gap-5">
          <div className="animate-fade-in animate-delay-200"><WeatherCard weather={weather} loading={loadingWeather} /></div>
          <div className="animate-fade-in animate-delay-300 flex-1 flex"><StreakCounter streak={streak} className="flex-1" /></div>
        </div>
        <div className="animate-fade-in animate-delay-200"><QuickAddWater targetMl={dailyTarget} onAdded={loadData} /></div>
      </div>

      <div className="space-y-5">
        <div className="animate-fade-in animate-delay-400">
          <NextDrinkReminder totalToday={totalToday} dailyTarget={dailyTarget} logsCount={todayLogs.length} />
        </div>
        <WeeklySparkline weeklyData={weeklyData} dailyTarget={dailyTarget} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="animate-fade-in animate-delay-400">
          <h3 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-sky-500" /> Perhitungan Target Kamu
          </h3>
          {hydrationBreakdown ? (() => {
            const baseMl = hydrationBreakdown.base_ml + hydrationBreakdown.gender_ml + (hydrationBreakdown.age_ml || 0)
            const fActivity = hydrationBreakdown.factor_activity || 0
            const fWeather = hydrationBreakdown.factor_weather || 0
            const fHumidity = hydrationBreakdown.factor_humidity || 0
            return (
            <div className="space-y-1.5 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Dasar <span className="text-gray-400 text-xs">({profile?.weight_kg}kg × 35{hydrationBreakdown.gender_ml > 0 ? ' + gender' : ''})</span></span>
                <span className="font-semibold text-gray-700">{baseMl} mL</span>
              </div>
              {fActivity > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Aktivitas</span>
                  <span className="font-medium text-emerald-600">+{Math.round(fActivity * 100)}%
                    <span className="text-gray-400 text-xs ml-1">(+{hydrationBreakdown.activity_ml} mL)</span>
                  </span>
                </div>
              )}
              {fWeather > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Cuaca <span className="text-gray-400 text-xs">({weather?.temperature ? `${Math.round(weather.temperature)}°C` : '-'})</span></span>
                  <span className="font-medium text-orange-500">+{Math.round(fWeather * 100)}%
                    <span className="text-gray-400 text-xs ml-1">(+{hydrationBreakdown.weather_ml} mL)</span>
                  </span>
                </div>
              )}
              {fHumidity > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Kelembapan <span className="text-gray-400 text-xs">({weather?.humidity ? `${weather.humidity}%` : '-'})</span></span>
                  <span className="font-medium text-cyan-600">+{Math.round(fHumidity * 100)}%
                    <span className="text-gray-400 text-xs ml-1">(+{hydrationBreakdown.humidity_ml} mL)</span>
                  </span>
                </div>
              )}
              <div className="border-t border-sky-100/60 pt-2 mt-2 flex justify-between items-center">
                <span className="text-gray-700 font-semibold">Total
                  <span className="text-gray-400 text-xs ml-1">(×{hydrationBreakdown.factor_total || '1.00'})</span>
                </span>
                <span className="font-bold text-gradient text-base">{dailyTarget} mL</span>
              </div>
            </div>
            )
          })() : (
            <div className="flex justify-between text-sm mb-4">
              <span className="text-gray-500">Target harian</span>
              <span className="font-medium text-gray-600">{dailyTarget} mL</span>
            </div>
          )}
          <div className="border-t border-sky-100/60 pt-3 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Sudah diminum</span><span className="font-medium text-sky-600">{totalToday} mL</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Sisa kebutuhan</span><span className="font-medium text-amber-600">{remaining} mL</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Jumlah minum</span><span className="font-medium text-gray-600">{todayLogs.length} kali</span></div>
            {todayLogs.length > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Terakhir minum</span>
                <span className="font-medium text-gray-600">
                  {(() => { const raw = todayLogs[todayLogs.length - 1]?.logged_at; const str = String(raw || ''); const dt = (!str.endsWith('Z') && !str.includes('+') && !str.includes('-', 10)) ? new Date(str + 'Z') : new Date(str); return dt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) })()}
                </span>
              </div>
            )}
            <div className="border-t border-sky-100/60 pt-2.5 mt-2.5 flex justify-between">
              <span className="text-gray-500">Progress</span>
              <span className="font-bold text-gradient">{Math.round(percentage)}%</span>
            </div>
          </div>
        </Card>
        <TipOfTheDay />
      </div>
    </div>
  )
}