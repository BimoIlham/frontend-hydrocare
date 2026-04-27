import { useState, useMemo } from 'react'
import { userService } from '../services/userService'
import { hydrationService } from '../services/hydrationService'
import useUserStore from '../store/useUserStore'
import useHydrationStore from '../store/useHydrationStore'
import Card from '../components/ui/Card'
import {
  User, Edit2, Save, Target, Medal, Droplet, Flame, Trophy,
  CheckCircle2, Activity, Ruler, Weight, Calendar,
  Sparkles, X, GlassWater, Zap, ShieldCheck
} from 'lucide-react'

const BADGE_INFO = {
  first_drop:       { icon: Droplet,  color: 'text-cyan-500',   bg: 'bg-cyan-100',   border: 'border-cyan-200/60', label: 'Tetes Pertama',    desc: 'Minum pertama kalinya' },
  daily_goal:       { icon: Target,   color: 'text-sky-500',    bg: 'bg-sky-100',    border: 'border-sky-200/60',  label: 'Daily Goal',       desc: 'Capai target harian' },
  three_day_streak: { icon: Flame,    color: 'text-orange-500', bg: 'bg-orange-100', border: 'border-orange-200/60', label: 'Api Biru',       desc: 'Streak 3 hari berturut-turut' },
  hydration_master: { icon: Trophy,   color: 'text-yellow-500', bg: 'bg-yellow-100', border: 'border-yellow-200/60', label: 'Hydration Master', desc: 'Streak 7 hari!' },
}
const ACTIVITY_LABELS = { light: 'Ringan', moderate: 'Sedang', heavy: 'Berat' }
const ACTIVITY_DESC = { light: 'Kerja kantor, aktivitas minimal', moderate: 'Olahraga 2-3x seminggu', heavy: 'Olahraga intensif setiap hari' }

function getBMI(weight, height) { if (!weight || !height) return null; return (weight / ((height / 100) ** 2)).toFixed(1) }
function getBMICategory(bmi) {
  if (bmi < 18.5) return { label: 'Kurus', color: 'text-amber-600', bg: 'bg-amber-100' }
  if (bmi < 25)   return { label: 'Normal', color: 'text-emerald-600', bg: 'bg-emerald-100' }
  if (bmi < 30)   return { label: 'Berlebih', color: 'text-orange-600', bg: 'bg-orange-100' }
  return { label: 'Obesitas', color: 'text-red-600', bg: 'bg-red-100' }
}

export default function Profile() {
  const { profile, dailyTarget, setProfile, setDailyTarget, setHydrationBreakdown } = useUserStore()
  const { badges, streak } = useHydrationStore()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(profile || {})
  const [loading, setLoading] = useState(false)
  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const handleSave = async () => {
    setLoading(true)
    try {
      await userService.createOrUpdateProfile({ ...form, age: Number(form.age), weight_kg: Number(form.weight_kg), height_cm: Number(form.height_cm) })
      const result = await hydrationService.calculate(form)
      const rb = result.data.rule_based
      setProfile(form); setDailyTarget(rb.total_ml)
      setHydrationBreakdown({ base_ml: rb.base_ml, gender_ml: rb.gender_ml || 0, age_ml: rb.age_ml || 0, activity_ml: rb.activity_ml, weather_ml: rb.weather_ml, humidity_ml: rb.humidity_ml || 0, factor_activity: rb.factor_activity || 0, factor_weather: rb.factor_weather || 0, factor_humidity: rb.factor_humidity || 0, factor_total: rb.factor_total || 1 })
      setEditing(false)
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  const bmi = useMemo(() => getBMI(profile?.weight_kg, profile?.height_cm), [profile])
  const bmiCat = useMemo(() => bmi ? getBMICategory(parseFloat(bmi)) : null, [bmi])
  const initials = profile?.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?'
  const earnedCount = badges.length
  const totalBadges = Object.keys(BADGE_INFO).length
  const glassesPerDay = Math.round(dailyTarget / 250)

  return (
    <div className="space-y-6">
      {/* Hero Profile Header */}
      <div className="animate-fade-in relative overflow-hidden rounded-2xl
                      bg-gradient-to-br from-sky-50/80 via-white/60 to-blue-50/80
                      border border-sky-100/60 p-6 md:p-8 backdrop-blur-sm">
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-sky-200/20 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-blue-200/20 blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <div className="relative">
            <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-br from-sky-400 via-blue-400 to-sky-500 shadow-lg shadow-sky-500/20">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                <span className="text-2xl font-bold text-gradient">{initials}</span>
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center border-[3px] border-white">
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{profile?.name || 'Pengguna'}</h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2">
              <span className="inline-flex items-center gap-1 text-sm text-gray-500"><Calendar className="w-3.5 h-3.5 text-sky-500" /> {profile?.age} tahun</span>
              <span className="text-gray-300">·</span>
              <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                {profile?.gender === 'male' ? <><span className="text-base leading-none text-sky-500">♂</span> Laki-laki</> : <><span className="text-base leading-none text-pink-500">♀</span> Perempuan</>}
              </span>
              <span className="text-gray-300">·</span>
              <span className="inline-flex items-center gap-1 text-sm text-gray-500"><Zap className="w-3.5 h-3.5 text-amber-500" /> {ACTIVITY_LABELS[profile?.activity] || 'Sedang'}</span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-4 mt-3">
              {[{ l: 'Streak', v: `${streak} hari` }, { l: 'Badge', v: `${earnedCount}/${totalBadges}` }, { l: 'Target', v: `${(dailyTarget / 1000).toFixed(1)}L` }].map(({ l, v }) => (
                <div key={l} className="px-3 py-1.5 rounded-lg bg-white/60 border border-sky-100/60">
                  <p className="text-xs text-gray-500">{l}</p>
                  <p className="text-sm font-bold text-gradient">{v}</p>
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => { setEditing(!editing); setForm(profile || {}) }}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-300 self-start
              ${editing ? 'bg-red-50 border border-red-200/60 text-red-500 hover:bg-red-100' : 'bg-sky-50 border border-sky-200/60 text-sky-600 hover:bg-sky-100'}`}>
            {editing ? <><X className="w-4 h-4" /> Batal</> : <><Edit2 className="w-4 h-4" /> Edit Profil</>}
          </button>
        </div>
      </div>

      {/* Edit Form */}
      {editing && (
        <Card className="animate-fade-in border-sky-200/60">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2"><Edit2 className="w-4 h-4 text-sky-500" /> Edit Data Profil</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs font-semibold text-gray-500 mb-1.5 block flex items-center gap-1"><User className="w-3 h-3" /> Nama</label><input className="input-field" value={form.name || ''} onChange={(e) => update('name', e.target.value)} /></div>
              <div><label className="text-xs font-semibold text-gray-500 mb-1.5 block flex items-center gap-1"><Calendar className="w-3 h-3" /> Umur</label><input className="input-field" type="number" value={form.age || ''} onChange={(e) => update('age', e.target.value)} /></div>
              <div><label className="text-xs font-semibold text-gray-500 mb-1.5 block flex items-center gap-1"><Weight className="w-3 h-3" /> Berat (kg)</label><input className="input-field" type="number" value={form.weight_kg || ''} onChange={(e) => update('weight_kg', e.target.value)} /></div>
              <div><label className="text-xs font-semibold text-gray-500 mb-1.5 block flex items-center gap-1"><Ruler className="w-3 h-3" /> Tinggi (cm)</label><input className="input-field" type="number" value={form.height_cm || ''} onChange={(e) => update('height_cm', e.target.value)} /></div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-2 block flex items-center gap-1"><Activity className="w-3 h-3" /> Aktivitas Fisik</label>
              <div className="grid grid-cols-3 gap-3">
                {['light', 'moderate', 'heavy'].map((val) => (
                  <button key={val} type="button" onClick={() => update('activity', val)}
                    className={`p-3 rounded-xl border text-center transition-all duration-300
                      ${form.activity === val ? 'border-sky-400/40 bg-sky-50/80 text-sky-700' : 'border-gray-200/60 bg-white/40 text-gray-500 hover:border-sky-200/40'}`}>
                    <p className="text-sm font-semibold">{ACTIVITY_LABELS[val]}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{ACTIVITY_DESC[val]}</p>
                  </button>
                ))}
              </div>
            </div>
            <button onClick={handleSave} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2 py-3 text-sm">
              {loading ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Menyimpan...</span> : <><Save className="w-4 h-4" /> Simpan Perubahan</>}
            </button>
          </div>
        </Card>
      )}

      {/* Body Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in animate-delay-100">
        {[
          { icon: Weight, label: 'Berat Badan', value: `${profile?.weight_kg || '-'} kg`, color: 'text-sky-500', bg: 'bg-sky-100' },
          { icon: Ruler, label: 'Tinggi Badan', value: `${profile?.height_cm || '-'} cm`, color: 'text-cyan-500', bg: 'bg-cyan-100' },
          { icon: Activity, label: 'BMI', value: bmi || '-', sub: bmiCat?.label, color: bmiCat?.color || 'text-gray-500', bg: bmiCat?.bg || 'bg-gray-100' },
          { icon: Activity, label: 'Aktivitas', value: ACTIVITY_LABELS[profile?.activity] || '-', sub: ACTIVITY_DESC[profile?.activity], color: 'text-amber-500', bg: 'bg-amber-100' },
        ].map(({ icon: Icon, label, value, sub, color, bg }) => (
          <div key={label} className="p-4 rounded-xl bg-white/50 border border-sky-100/60 hover:border-sky-300/40 transition-all duration-300 group backdrop-blur-sm">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-xs text-gray-500 font-medium">{label}</p>
            <p className="text-xl font-bold text-gray-800 mt-0.5">{value}</p>
            {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
          </div>
        ))}
      </div>

      {/* Hydration Target */}
      <Card className="animate-fade-in animate-delay-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center flex-shrink-0">
            <Target className="w-6 h-6 text-sky-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
              Rekomendasi Hidrasi
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-600 border border-sky-200/60 font-medium">Personalized</span>
            </h3>
            <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="text-center sm:text-left">
                <p className="text-4xl font-extrabold text-gradient">{dailyTarget}</p>
                <p className="text-xs text-gray-500 font-medium">mL per hari</p>
              </div>
              <div className="flex-1 grid grid-cols-3 gap-3">
                {[{ icon: GlassWater, c: 'text-sky-500', v: glassesPerDay, l: 'gelas/hari' }, { icon: Droplet, c: 'text-cyan-500', v: (dailyTarget / 1000).toFixed(1), l: 'liter/hari' }, { icon: GlassWater, c: 'text-emerald-500', v: Math.round(dailyTarget / 16), l: 'mL/jam aktif' }].map(({ icon: I2, c, v, l }, idx) => (
                  <div key={idx} className="text-center p-2.5 rounded-lg bg-white/50 border border-sky-100/60">
                    <I2 className={`w-4 h-4 ${c} mx-auto mb-1`} />
                    <p className="text-lg font-bold text-gray-800">{v}</p>
                    <p className="text-[10px] text-gray-500">{l}</p>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-gray-400 text-[11px] mt-3 flex items-center gap-1"><Sparkles className="w-3 h-3 text-sky-500" /> Target dihitung berdasarkan berat badan, aktivitas, dan kondisi cuaca</p>
          </div>
        </div>
      </Card>

      {/* Badge Collection */}
      <Card className="animate-fade-in animate-delay-300">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2"><Medal className="w-5 h-5 text-yellow-500" /> Koleksi Badge</h3>
          <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold bg-yellow-100 text-yellow-600 border border-yellow-200/60">{earnedCount}/{totalBadges} Diraih</span>
        </div>
        <div className="mb-5">
          <div className="h-1.5 bg-sky-50 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-sky-500 to-yellow-400 rounded-full transition-all duration-700" style={{ width: `${(earnedCount / totalBadges) * 100}%` }} />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(BADGE_INFO).map(([id, { icon: Icon, color, bg, border, label, desc }]) => {
            const earned = badges.includes(id)
            return (
              <div key={id} className={`relative p-5 rounded-xl border text-center transition-all duration-500 group cursor-default overflow-hidden
                ${earned ? `${border} bg-white/60 hover:bg-white/80` : 'border-gray-200/40 bg-white/30 opacity-40 grayscale'}`}>
                {earned && <div className="absolute inset-0 bg-gradient-to-b from-sky-50/50 to-transparent pointer-events-none" />}
                <div className={`relative z-10 w-14 h-14 rounded-2xl ${bg} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-7 h-7 ${color}`} />
                </div>
                <p className="relative z-10 font-semibold text-sm text-gray-700">{label}</p>
                <p className="relative z-10 text-[11px] text-gray-400 mt-1 leading-relaxed">{desc}</p>
                {earned && (
                  <div className="relative z-10 flex items-center justify-center gap-1 mt-3 text-xs text-emerald-500 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Diraih!
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}