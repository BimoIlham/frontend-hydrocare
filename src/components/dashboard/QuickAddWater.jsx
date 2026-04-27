import { useState, useEffect, useCallback, useRef } from 'react'
import { historyService } from '../../services/historyService'
import useHydrationStore from '../../store/useHydrationStore'
import { Droplet, CupSoda, GlassWater, Cylinder, AlertTriangle, CheckCircle2, Clock, Trash2, Plus } from 'lucide-react'

const QUICK_AMOUNTS = [
  { label: 'Tegukan',       ml: 100,  icon: Droplet },
  { label: 'Gelas kecil',   ml: 200,  icon: CupSoda },
  { label: 'Gelas standar', ml: 250,  icon: CupSoda },
  { label: 'Botol kecil',   ml: 500,  icon: GlassWater },
  { label: 'Botol besar',   ml: 750,  icon: GlassWater },
  { label: '1 Liter',       ml: 1000, icon: Cylinder },
]
const UNDO_TIMEOUT = 5000

export default function QuickAddWater({ targetMl, onAdded }) {
  const [customMl, setCustomMl] = useState('')
  const [loading, setLoading] = useState(null)
  const [showCustom, setShowCustom] = useState(false)
  const [toast, setToast] = useState(null)
  const toastTimerRef = useRef(null)
  const todayLogs = useHydrationStore((s) => s.todayLogs)
  const totalToday = useHydrationStore((s) => s.totalToday)
  const addLog = useHydrationStore((s) => s.addLog)
  const removeLog = useHydrationStore((s) => s.removeLog)
  const isOverTarget = totalToday > targetMl
  const overAmount = totalToday - targetMl
  const percentage = targetMl > 0 ? (totalToday / targetMl) * 100 : 0

  useEffect(() => { return () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current) } }, [])

  const showToast = useCallback((logId, amount) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    const timerId = setTimeout(() => setToast(null), UNDO_TIMEOUT)
    toastTimerRef.current = timerId
    setToast({ id: logId, amount_ml: amount, timerId })
  }, [])

  const handleUndo = async () => {
    if (!toast) return; clearTimeout(toastTimerRef.current)
    try { await historyService.deleteLog(toast.id); removeLog(toast.id); onAdded?.() }
    catch (err) { console.error('Gagal undo:', err) }
    finally { setToast(null) }
  }
  const handleDeleteLog = async (logId) => {
    try { await historyService.deleteLog(logId); removeLog(logId); onAdded?.() }
    catch (err) { console.error('Gagal hapus log:', err) }
  }
  const dismissToast = () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); setToast(null) }

  const handleAdd = async (ml) => {
    const projectedTotal = totalToday + ml
    if (projectedTotal > targetMl * 1.2 && targetMl > 0) {
      const confirmed = window.confirm(`⚠️ Perhatian!\n\nDengan menambahkan ${ml} mL, total kamu akan menjadi ${projectedTotal} mL.\nIni melebihi target harian (${targetMl} mL) sebesar ${projectedTotal - targetMl} mL.\n\nTerlalu banyak minum air juga tidak baik untuk kesehatan.\nYakin ingin melanjutkan?`)
      if (!confirmed) return
    }
    setLoading(ml)
    try {
      const response = await historyService.addLog(ml)
      const logId = response.data?.id
      addLog({ amount_ml: ml, id: logId, logged_at: new Date() })
      showToast(logId, ml); onAdded?.()
    } catch (err) { console.error('Gagal mencatat:', err) }
    finally { setLoading(null) }
  }

  return (
    <div className="card relative">
      <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <Droplet className="w-5 h-5 text-sky-500" /> Tambah Minum
      </h3>
      {isOverTarget && (
        <div className="mb-4 p-3 rounded-xl bg-amber-50/80 border border-amber-200/60">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-700">Kamu sudah melebihi target!</p>
              <p className="text-xs text-amber-600/70 mt-0.5">
                Kelebihan <span className="font-bold">{Math.round(overAmount)} mL</span> dari target {targetMl} mL.
                {percentage > 150 ? ' Terlalu banyak minum air bisa menyebabkan hiponatremia. Istirahat dulu ya!' : ' Pastikan kamu tidak minum berlebihan.'}
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {QUICK_AMOUNTS.map(({ label, ml, icon: Icon }) => (
          <button key={ml} onClick={() => handleAdd(ml)} disabled={loading === ml}
            className={`flex flex-col items-center p-3.5 rounded-xl border transition-all duration-300 text-center group
              ${loading === ml ? 'opacity-50 cursor-wait' : ''}
              ${isOverTarget
                ? 'border-amber-200/60 hover:border-amber-300/60 hover:bg-amber-50/50 bg-white/40'
                : 'border-sky-100/60 hover:border-sky-300/40 hover:bg-sky-50/50 bg-white/40'
              } active:scale-95`}>
            <Icon className={`w-5 h-5 mb-1.5 transition-colors duration-300
              ${isOverTarget ? 'text-amber-400 group-hover:text-amber-500' : 'text-sky-400 group-hover:text-sky-500'}`} />
            <span className="text-[11px] font-medium text-gray-500 group-hover:text-gray-700">{label}</span>
            <span className={`text-xs font-bold mt-0.5 ${isOverTarget ? 'text-amber-500/70' : 'text-sky-500/70'}`}>{ml}ml</span>
          </button>
        ))}
      </div>
      {showCustom ? (
        <div className="flex gap-2">
          <input type="number" placeholder="Jumlah mL" value={customMl} onChange={(e) => setCustomMl(e.target.value)} className="input-field flex-1" min="50" max="5000" />
          <button onClick={() => { handleAdd(Number(customMl)); setCustomMl(''); setShowCustom(false) }} disabled={!customMl || Number(customMl) < 50} className="btn-primary whitespace-nowrap">Tambah</button>
        </div>
      ) : (
        <button onClick={() => setShowCustom(true)} className="w-full text-sm text-sky-500/70 hover:text-sky-600 py-2 flex items-center justify-center gap-1.5 transition-colors">
          <Plus className="w-4 h-4" /> Input jumlah lain
        </button>
      )}
      {toast && (
        <div className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-[100]">
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl shadow-glass glass border border-sky-200/40 text-sm animate-fade-in">
            <div className="flex items-center gap-2 text-gray-700">
              <CheckCircle2 className="w-4 h-4 text-sky-500" />
              <span>+{toast.amount_ml} mL dicatat</span>
            </div>
            <button onClick={handleUndo} className="px-3 py-1 rounded-lg bg-sky-100 hover:bg-sky-200 transition-colors font-semibold text-sky-600 text-xs">Undo</button>
            <button onClick={dismissToast} className="text-gray-400 hover:text-gray-600 transition-colors ml-1 text-xs">✕</button>
          </div>
        </div>
      )}
    </div>
  )
}