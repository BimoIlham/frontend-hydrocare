import { useEffect, useState, useMemo } from 'react'
import { historyService } from '../services/historyService'
import useUserStore from '../store/useUserStore'
import useHydrationStore from '../store/useHydrationStore'
import WeeklyChart from '../components/tracker/WeeklyChart'
import Card from '../components/ui/Card'
import {
  BarChart2, ClipboardList, Droplet, Trash2, TrendingUp,
  Clock, Target, Award, Zap, CalendarDays, GlassWater, ArrowUp, ArrowDown
} from 'lucide-react'

function parseLogTime(logged_at) {
  if (!logged_at) return null
  const str = String(logged_at)
  if (!str.endsWith('Z') && !str.includes('+') && !str.includes('-', 10)) return new Date(str + 'Z')
  return new Date(str)
}

function HourlyChart({ logs }) {
  const hourlyData = useMemo(() => {
    const hours = Array(24).fill(0)
    logs.forEach((log) => { if (log.logged_at) { const dt = parseLogTime(log.logged_at); if (dt) hours[dt.getHours()] += log.amount_ml } })
    return hours.map((ml, h) => ({ hour: h, label: `${String(h).padStart(2, '0')}:00`, ml }))
  }, [logs])
  const maxMl = Math.max(...hourlyData.map((d) => d.ml), 1)
  const visibleHours = hourlyData.filter((d) => d.hour >= 6 && d.hour <= 23)

  return (
    <Card className="animate-fade-in animate-delay-300">
      <h3 className="text-base font-semibold text-gray-700 mb-1 flex items-center gap-2">
        <Clock className="w-5 h-5 text-sky-500" /> Distribusi Per Jam
      </h3>
      <p className="text-xs text-gray-400 mb-4">Pola minum kamu sepanjang hari ini</p>
      {logs.length === 0 ? (
        <div className="text-center py-6 text-gray-400 text-sm">Belum ada data hari ini</div>
      ) : (
        <div className="flex items-end gap-[3px] h-28">
          {visibleHours.map((d) => {
            const pct = maxMl > 0 ? (d.ml / maxMl) * 100 : 0
            const hasData = d.ml > 0
            return (
              <div key={d.hour} className="flex-1 flex flex-col items-center gap-1 group relative">
                {hasData && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 px-2 py-1 rounded-lg bg-white/80 backdrop-blur-sm border border-sky-200/40 shadow-sm text-[10px] whitespace-nowrap">
                    <span className="text-sky-600 font-bold">{d.ml} mL</span>
                  </div>
                )}
                <div className="w-full flex items-end h-20">
                  <div className={`w-full rounded-t transition-all duration-500 ease-out ${hasData ? 'bg-gradient-to-t from-sky-500 to-sky-400 group-hover:from-sky-400 group-hover:to-sky-300' : 'bg-sky-50'}`}
                    style={{ height: hasData ? `${Math.max(pct, 8)}%` : '4px' }} />
                </div>
                <span className={`text-[9px] ${hasData ? 'text-gray-500' : 'text-gray-300'}`}>{d.hour % 3 === 0 ? d.label.slice(0, 2) : ''}</span>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}

function StatCard({ icon: Icon, label, value, unit, color = 'text-sky-500', delay = '' }) {
  return (
    <div className={`p-4 rounded-xl bg-white/50 border border-sky-100/60 hover:border-sky-300/40 hover:bg-sky-50/50 transition-all duration-300 animate-fade-in backdrop-blur-sm ${delay}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center"><Icon className={`w-4 h-4 ${color}`} /></div>
        <span className="text-xs text-gray-500 font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-800">{value} <span className="text-sm text-gray-400 font-medium">{unit}</span></p>
    </div>
  )
}

function WeeklySummary({ weeklyData, dailyTarget }) {
  const stats = useMemo(() => {
    if (!weeklyData || weeklyData.length === 0) return null
    const totals = weeklyData.map((d) => d.total_ml || 0)
    const average = Math.round(totals.reduce((a, b) => a + b, 0) / totals.length)
    const best = Math.max(...totals), worst = Math.min(...totals)
    const goalsHit = weeklyData.filter((d) => d.goal_met).length
    const bestDay = weeklyData.find((d) => d.total_ml === best)
    return { average, best, worst, goalsHit, bestDay, consistency: Math.round((goalsHit / weeklyData.length) * 100) }
  }, [weeklyData])
  if (!stats) return null

  return (
    <Card className="animate-fade-in animate-delay-200">
      <h3 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2"><CalendarDays className="w-5 h-5 text-sky-500" /> Ringkasan 7 Hari</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-white/50 border border-sky-100/60">
          <div className="flex items-center gap-1.5 mb-1"><TrendingUp className="w-3.5 h-3.5 text-sky-500" /><span className="text-[11px] text-gray-500 font-medium">Rata-rata / hari</span></div>
          <p className="text-lg font-bold text-gray-800">{stats.average} <span className="text-xs text-gray-400">mL</span></p>
          <div className="mt-1">{stats.average >= dailyTarget ? <span className="text-[10px] text-emerald-500 flex items-center gap-0.5"><ArrowUp className="w-3 h-3" /> Di atas target</span> : <span className="text-[10px] text-amber-500 flex items-center gap-0.5"><ArrowDown className="w-3 h-3" /> Di bawah target ({Math.round(((dailyTarget - stats.average) / dailyTarget) * 100)}%)</span>}</div>
        </div>
        <div className="p-3 rounded-xl bg-white/50 border border-sky-100/60">
          <div className="flex items-center gap-1.5 mb-1"><Target className="w-3.5 h-3.5 text-emerald-500" /><span className="text-[11px] text-gray-500 font-medium">Target tercapai</span></div>
          <p className="text-lg font-bold text-gray-800">{stats.goalsHit}<span className="text-xs text-gray-400">/{weeklyData.length} hari</span></p>
          <div className="mt-1.5"><div className="w-full h-1.5 rounded-full bg-sky-50 overflow-hidden"><div className="h-full rounded-full transition-all duration-700" style={{ width: `${stats.consistency}%`, background: stats.consistency >= 70 ? 'linear-gradient(90deg, #10b981, #34d399)' : stats.consistency >= 40 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' : 'linear-gradient(90deg, #ef4444, #f87171)' }} /></div><p className="text-[10px] text-gray-400 mt-0.5">Konsistensi {stats.consistency}%</p></div>
        </div>
        <div className="p-3 rounded-xl bg-white/50 border border-sky-100/60">
          <div className="flex items-center gap-1.5 mb-1"><Award className="w-3.5 h-3.5 text-yellow-500" /><span className="text-[11px] text-gray-500 font-medium">Hari terbaik</span></div>
          <p className="text-lg font-bold text-gray-800">{stats.best} <span className="text-xs text-gray-400">mL</span></p>
          {stats.bestDay && <p className="text-[10px] text-gray-400 mt-0.5">{stats.bestDay.day_name}</p>}
        </div>
        <div className="p-3 rounded-xl bg-white/50 border border-sky-100/60">
          <div className="flex items-center gap-1.5 mb-1"><Zap className="w-3.5 h-3.5 text-orange-500" /><span className="text-[11px] text-gray-500 font-medium">Hari terendah</span></div>
          <p className="text-lg font-bold text-gray-800">{stats.worst} <span className="text-xs text-gray-400">mL</span></p>
          <p className="text-[10px] text-gray-400 mt-0.5">{stats.worst < dailyTarget ? `Kurang ${dailyTarget - stats.worst} mL` : 'Target tercapai!'}</p>
        </div>
      </div>
    </Card>
  )
}

function TodayTimeline({ logs, onDelete }) {
  if (logs.length === 0) {
    return (
      <Card className="animate-fade-in animate-delay-400">
        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2"><ClipboardList className="w-5 h-5 text-gray-400" /> Timeline Hari Ini</h3>
        <div className="text-center py-10 text-gray-400">
          <Droplet className="w-10 h-10 mx-auto text-sky-200 mb-3" />
          <p className="text-gray-500">Belum ada catatan minum hari ini.</p>
          <p className="text-sm mt-1 text-gray-400">Tambahkan dari halaman Dashboard!</p>
        </div>
      </Card>
    )
  }
  const reversedLogs = [...logs].reverse()
  const totalMl = logs.reduce((sum, l) => sum + l.amount_ml, 0)

  return (
    <Card className="animate-fade-in animate-delay-400">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-700 flex items-center gap-2"><ClipboardList className="w-5 h-5 text-gray-400" /> Timeline Hari Ini</h3>
        <span className="text-[11px] bg-sky-100 text-sky-600 px-2.5 py-0.5 rounded-full font-semibold border border-sky-200/60">{logs.length} entri · {totalMl} mL</span>
      </div>
      <div className="relative">
        <div className="absolute left-4 top-3 bottom-3 w-px bg-gradient-to-b from-sky-400/30 via-sky-300/10 to-transparent" />
        <div className="space-y-1">
          {reversedLogs.map((log) => {
            const dt = parseLogTime(log.logged_at)
            const time = dt ? dt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'Baru saja'
            const isLargest = log.amount_ml === Math.max(...logs.map(l => l.amount_ml))
            return (
              <div key={log.id} className="flex items-center gap-4 pl-1 py-2 rounded-xl hover:bg-red-50/50 transition-all duration-200 group relative">
                <div className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${isLargest ? 'bg-sky-100 border-2 border-sky-400/50 shadow-glow-sm' : 'bg-white/60 border border-sky-100/60'}`}>
                  <Droplet className={`w-3 h-3 ${isLargest ? 'text-sky-500' : 'text-gray-400'}`} />
                </div>
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-700">{log.amount_ml} mL</p>
                      {isLargest && logs.length > 1 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-100 text-sky-600 font-semibold">Terbanyak</span>}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{time}</p>
                  </div>
                  <button onClick={() => onDelete(log.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100" title="Hapus">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}

export default function Tracker() {
  const { dailyTarget } = useUserStore()
  const { todayLogs, weeklyData, totalToday, setTodayData, setWeeklyData, removeLog } = useHydrationStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [todayRes, weekRes] = await Promise.all([historyService.getToday(dailyTarget), historyService.getWeekly(dailyTarget)])
        setTodayData(todayRes.logs || [], todayRes.total_ml || 0)
        setWeeklyData(weekRes.data || [])
      } finally { setLoading(false) }
    }
    load()
  }, [dailyTarget])

  const handleDelete = async (logId) => {
    // 1. Optimistic UI Update (Hapus dari layar seketika)
    removeLog(logId)
    
    // 2. Background API Call
    try {
      await historyService.deleteLog(logId)
      // Optional: Update grafik mingguan di background
      const weekRes = await historyService.getWeekly(dailyTarget)
      setWeeklyData(weekRes.data || [])
    } catch (err) {
      console.error('Gagal menghapus:', err)
      // Rollback dengan memuat ulang data asli jika gagal
      const todayRes = await historyService.getToday(dailyTarget)
      setTodayData(todayRes.logs || [], todayRes.total_ml || 0)
    }
  }

  const todayStats = useMemo(() => {
    if (todayLogs.length === 0) return { count: 0, avg: 0, largest: 0, smallest: 0 }
    const amounts = todayLogs.map((l) => l.amount_ml)
    return { count: todayLogs.length, avg: Math.round(amounts.reduce((a, b) => a + b, 0) / amounts.length), largest: Math.max(...amounts), smallest: Math.min(...amounts) }
  }, [todayLogs])

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2"><BarChart2 className="w-7 h-7 text-sky-500" /> Histori Minum</h2>
        <p className="text-gray-500 mt-1 font-medium">Pantau dan analisis pola minum air kamu</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Droplet} label="Total Hari Ini" value={totalToday} unit="mL" delay="animate-delay-100" />
        <StatCard icon={GlassWater} label="Jumlah Minum" value={todayStats.count} unit="kali" color="text-cyan-500" delay="animate-delay-200" />
        <StatCard icon={TrendingUp} label="Rata-rata / minum" value={todayStats.avg} unit="mL" color="text-emerald-500" delay="animate-delay-300" />
        <StatCard icon={Award} label="Terbanyak sekali minum" value={todayStats.largest} unit="mL" color="text-amber-500" delay="animate-delay-400" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="animate-fade-in animate-delay-100">
          {loading ? <div className="card animate-pulse h-64 bg-sky-50/30" /> : <WeeklyChart data={weeklyData} targetMl={dailyTarget} />}
        </div>
        <HourlyChart logs={todayLogs} />
      </div>
      {!loading && weeklyData.length > 0 && <WeeklySummary weeklyData={weeklyData} dailyTarget={dailyTarget} />}
      <TodayTimeline logs={todayLogs} onDelete={handleDelete} />
    </div>
  )
}