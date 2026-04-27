import { useState } from 'react'
import { authService } from '../services/authService'
import { hydrationService } from '../services/hydrationService'
import useUserStore from '../store/useUserStore'
import logoImg from '../assets/logo.png'

import {
  Laptop, Footprints, Dumbbell, ClipboardList, Activity,
  Hourglass, Rocket, CheckCircle2, LogIn, UserPlus, Eye, EyeOff,
  User, Lock, ArrowRight, ArrowLeft, Sparkles
} from 'lucide-react'

const ACTIVITY_OPTIONS = [
  { value: 'light',    label: 'Ringan',  desc: 'Kerja kantoran, sedikit gerak',     icon: Laptop,     color: 'text-sky-600',    bg: 'bg-sky-500/10' },
  { value: 'moderate', label: 'Sedang',  desc: 'Jalan kaki, olahraga 3x/minggu',    icon: Footprints, color: 'text-blue-600',   bg: 'bg-blue-500/10' },
  { value: 'heavy',    label: 'Berat',   desc: 'Atlet, kerja fisik, olahraga rutin', icon: Dumbbell,   color: 'text-orange-500', bg: 'bg-orange-500/10' },
]

export default function Onboarding() {
  const { login, setDailyTarget, setHydrationBreakdown } = useUserStore()

  // Mode: 'login' or 'register'
  const [mode, setMode] = useState('login')

  // Register step: 1 = akun, 2 = data diri, 3 = aktivitas
  const [regStep, setRegStep] = useState(1)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Login form
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })

  // Register form
  const [regForm, setRegForm] = useState({
    username: '', password: '', confirmPassword: '',
    name: '', age: '', gender: 'male',
    weight_kg: '', height_cm: '',
    activity: 'moderate', city: 'Bandar Lampung',
  })

  const updateLogin = (field, value) => setLoginForm(f => ({ ...f, [field]: value }))
  const updateReg = (field, value) => setRegForm(f => ({ ...f, [field]: value }))

  // After successful auth, calculate hydration and enter dashboard
  const finishAuth = async (userData) => {
    try {
      const result = await hydrationService.calculate(userData)
      const rb = result.data?.rule_based
      const targetMl = rb?.total_ml || result.data?.total_ml || 2000
      setDailyTarget(targetMl)
      if (rb) {
        setHydrationBreakdown({
          base_ml: rb.base_ml,
          gender_ml: rb.gender_ml || 0,
          age_ml: rb.age_ml || 0,
          activity_ml: rb.activity_ml,
          weather_ml: rb.weather_ml,
          humidity_ml: rb.humidity_ml || 0,
          factor_activity: rb.factor_activity || 0,
          factor_weather: rb.factor_weather || 0,
          factor_humidity: rb.factor_humidity || 0,
          factor_total: rb.factor_total || 1,
        })
      }
    } catch (err) {
      console.warn('Hydration calculation failed, using default:', err)
    }
    // Login ke store — ini akan trigger masuk dashboard
    login(userData)
  }

  // ── Handle Login ──
  const handleLogin = async () => {
    setError('')
    if (!loginForm.username || !loginForm.password) {
      setError('Username dan password harus diisi')
      return
    }
    setLoading(true)
    try {
      const result = await authService.login(loginForm.username, loginForm.password)
      await finishAuth(result.data)
    } catch (err) {
      const msg = err.response?.data?.detail || 'Login gagal, cek username dan password'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // ── Handle Register ──
  const handleRegister = async () => {
    setError('')
    setLoading(true)
    try {
      const result = await authService.register({
        username: regForm.username,
        password: regForm.password,
        name: regForm.name,
        age: Number(regForm.age),
        gender: regForm.gender,
        weight_kg: Number(regForm.weight_kg),
        height_cm: Number(regForm.height_cm),
        activity: regForm.activity,
        city: regForm.city,
      })
      await finishAuth(result.data)
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registrasi gagal, coba lagi'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // Switch mode handler
  const switchMode = (newMode) => {
    setMode(newMode)
    setError('')
    setRegStep(1)
  }

  // ── Validate register steps ──
  const canNextStep1 = regForm.username && regForm.password && regForm.password.length >= 6
    && regForm.confirmPassword && regForm.password === regForm.confirmPassword
  const canNextStep2 = regForm.name && regForm.age && regForm.weight_kg && regForm.height_cm

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
         style={{ background: 'linear-gradient(135deg, #e8f4fd 0%, #f0f7ff 25%, #ffffff 50%, #f0f7ff 75%, #e8f4fd 100%)' }}>

      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-300/15 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-300/15 rounded-full blur-3xl animate-float"
             style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-200/10 rounded-full blur-3xl animate-float"
             style={{ animationDelay: '2.5s' }} />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4
                          bg-white/60 backdrop-blur-xl border border-white/70
                          shadow-lg shadow-sky-500/10">
            <img src={logoImg} alt="HydroCare Logo" className="w-14 h-14 object-contain drop-shadow-md" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">
            <span className="text-gradient">HydroCare</span>
          </h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">
            Smart Hydration Monitoring
          </p>
        </div>

        {/* ── Mode Tabs ── */}
        <div className="flex rounded-xl p-1 mb-6 bg-white/50 backdrop-blur-sm border border-white/60 shadow-sm">
          <button
            onClick={() => switchMode('login')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300
              ${mode === 'login'
                ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25'
                : 'text-gray-500 hover:text-gray-700'}`}
          >
            <LogIn className="w-4 h-4" /> Masuk
          </button>
          <button
            onClick={() => switchMode('register')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300
              ${mode === 'register'
                ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25'
                : 'text-gray-500 hover:text-gray-700'}`}
          >
            <UserPlus className="w-4 h-4" /> Daftar
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50/80 border border-red-200/50 text-red-600 text-sm font-medium text-center backdrop-blur-sm animate-fade-in">
            {error}
          </div>
        )}

        <div className="card">
          {/* ═══════════════════════ LOGIN MODE ═══════════════════════ */}
          {mode === 'login' && (
            <>
              <h2 className="text-lg font-semibold mb-5 flex items-center gap-2 text-gray-700">
                <LogIn className="w-5 h-5 text-sky-500" /> Masuk ke Akun
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-1.5 block">Username</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      className="input-field pl-10"
                      placeholder="Masukkan username"
                      value={loginForm.username}
                      onChange={(e) => updateLogin('username', e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 mb-1.5 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      className="input-field pl-10 pr-10"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Masukkan password"
                      value={loginForm.password}
                      onChange={(e) => updateLogin('password', e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleLogin}
                  disabled={loading || !loginForm.username || !loginForm.password}
                  className="btn-primary w-full mt-2 flex items-center justify-center gap-2"
                >
                  {loading
                    ? <><Hourglass className="w-4 h-4 animate-spin" /> Memproses...</>
                    : <><LogIn className="w-4 h-4" /> Masuk</>
                  }
                </button>
              </div>

              <p className="text-center text-sm text-gray-500 mt-5">
                Belum punya akun?{' '}
                <button onClick={() => switchMode('register')} className="text-sky-600 font-semibold hover:underline">
                  Daftar sekarang
                </button>
              </p>
            </>
          )}

          {/* ═══════════════════════ REGISTER MODE ═══════════════════════ */}
          {mode === 'register' && (
            <>
              {/* Step indicator */}
              <div className="flex items-center justify-center gap-2 mb-5">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500
                      ${regStep >= s
                        ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-glow-sm'
                        : 'bg-white/60 text-gray-400 border border-gray-200/60 backdrop-blur-sm'}`}>
                      {regStep > s ? <CheckCircle2 className="w-3.5 h-3.5" /> : s}
                    </div>
                    {s < 3 && (
                      <div className={`w-8 h-0.5 rounded-full transition-all duration-500
                        ${regStep > s ? 'bg-sky-500' : 'bg-gray-200'}`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Akun */}
              {regStep === 1 && (
                <>
                  <h2 className="text-lg font-semibold mb-5 flex items-center gap-2 text-gray-700">
                    <UserPlus className="w-5 h-5 text-sky-500" /> Buat Akun
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-1.5 block">Username</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          className="input-field pl-10"
                          placeholder="Pilih username unik"
                          value={regForm.username}
                          onChange={(e) => updateReg('username', e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-1.5 block">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          className="input-field pl-10 pr-10"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Minimal 6 karakter"
                          value={regForm.password}
                          onChange={(e) => updateReg('password', e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {regForm.password && regForm.password.length < 6 && (
                        <p className="text-xs text-red-400 mt-1">Password minimal 6 karakter</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-1.5 block">Konfirmasi Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          className="input-field pl-10"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Ulangi password"
                          value={regForm.confirmPassword}
                          onChange={(e) => updateReg('confirmPassword', e.target.value)}
                        />
                      </div>
                      {regForm.confirmPassword && regForm.password !== regForm.confirmPassword && (
                        <p className="text-xs text-red-400 mt-1">Password tidak cocok</p>
                      )}
                    </div>

                    <button
                      onClick={() => { setError(''); setRegStep(2) }}
                      disabled={!canNextStep1}
                      className="btn-primary w-full mt-2 flex items-center justify-center gap-2"
                    >
                      Lanjut <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}

              {/* Step 2: Data Diri */}
              {regStep === 2 && (
                <>
                  <h2 className="text-lg font-semibold mb-5 flex items-center gap-2 text-gray-700">
                    <ClipboardList className="w-5 h-5 text-gray-400" /> Data Diri
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-1.5 block">Nama Lengkap</label>
                      <input className="input-field" placeholder="Contoh: Budi Santoso"
                        value={regForm.name} onChange={(e) => updateReg('name', e.target.value)} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500 mb-1.5 block">Umur</label>
                        <input className="input-field" type="number" placeholder="25"
                          value={regForm.age} onChange={(e) => updateReg('age', e.target.value)} />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 mb-1.5 block">Jenis Kelamin</label>
                        <select className="input-field" value={regForm.gender} onChange={(e) => updateReg('gender', e.target.value)}>
                          <option value="male">Laki-laki</option>
                          <option value="female">Perempuan</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500 mb-1.5 block">Berat (kg)</label>
                        <input className="input-field" type="number" placeholder="65"
                          value={regForm.weight_kg} onChange={(e) => updateReg('weight_kg', e.target.value)} />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 mb-1.5 block">Tinggi (cm)</label>
                        <input className="input-field" type="number" placeholder="170"
                          value={regForm.height_cm} onChange={(e) => updateReg('height_cm', e.target.value)} />
                      </div>
                    </div>

                    <div className="flex gap-3 mt-2">
                      <button onClick={() => setRegStep(1)} className="btn-outline flex-1 flex items-center justify-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Kembali
                      </button>
                      <button
                        onClick={() => { setError(''); setRegStep(3) }}
                        disabled={!canNextStep2}
                        className="btn-primary flex-1 flex items-center justify-center gap-2"
                      >
                        Lanjut <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Step 3: Aktivitas */}
              {regStep === 3 && (
                <>
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-700">
                    <Activity className="w-5 h-5 text-sky-500" /> Tingkat Aktivitas
                  </h2>
                  <p className="text-sm text-gray-500 mb-4">Ini mempengaruhi kebutuhan air harianmu</p>

                  <div className="space-y-3">
                    {ACTIVITY_OPTIONS.map(({ value, label, desc, icon: Icon, color, bg }) => (
                      <button
                        key={value}
                        onClick={() => updateReg('activity', value)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 text-left
                          ${regForm.activity === value
                            ? 'border-sky-400/40 bg-sky-50/80 shadow-glow-sm'
                            : 'border-gray-200/60 hover:border-sky-300/30 hover:bg-white/60 bg-white/40'}`}
                      >
                        <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${color}`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-700">{label}</p>
                          <p className="text-sm text-gray-500">{desc}</p>
                        </div>
                        {regForm.activity === value && (
                          <CheckCircle2 className="w-5 h-5 text-sky-500" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setRegStep(2)} className="btn-outline flex-1 flex items-center justify-center gap-2">
                      <ArrowLeft className="w-4 h-4" /> Kembali
                    </button>
                    <button
                      onClick={handleRegister}
                      disabled={loading}
                      className="btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                      {loading
                        ? <><Hourglass className="w-4 h-4 animate-spin" /> Mendaftar...</>
                        : <><Sparkles className="w-4 h-4" /> Daftar & Mulai</>
                      }
                    </button>
                  </div>
                </>
              )}

              {/* Link ke Login */}
              {regStep === 1 && (
                <p className="text-center text-sm text-gray-500 mt-5">
                  Sudah punya akun?{' '}
                  <button onClick={() => switchMode('login')} className="text-sky-600 font-semibold hover:underline">
                    Masuk
                  </button>
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}