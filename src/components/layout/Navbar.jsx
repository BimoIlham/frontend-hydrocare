import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, BarChart2, BookOpen, User, LogOut, AlertTriangle, X } from 'lucide-react'
import logoImg from '../../assets/logo.png'
import useUserStore from '../../store/useUserStore'
import useHydrationStore from '../../store/useHydrationStore'

const NAV_ITEMS = [
  { to: '/',          icon: Home,      label: 'Dashboard' },
  { to: '/tracker',   icon: BarChart2,  label: 'Tracker'   },
  { to: '/education', icon: BookOpen,   label: 'Edukasi'   },
  { to: '/profile',   icon: User,       label: 'Profil'    },
]

export default function Navbar() {
  const location = useLocation()
  const clearProfile = useUserStore((s) => s.clearProfile)
  const resetHydration = useHydrationStore((s) => s.reset)

  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [hoveredPath, setHoveredPath] = useState(null)

  const activePath = NAV_ITEMS.find(item => item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to))?.to || '/'
  const currentPath = hoveredPath || activePath

  const confirmLogout = () => {
    clearProfile()
    if (resetHydration) resetHydration()
    localStorage.removeItem('hydrocare-user')
    localStorage.removeItem('hydrocare-hydration')
    window.location.reload()
  }

  return (
    <>
      {/* ─── Desktop Top Navbar ─── */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 h-20 z-50 px-8
                       items-center justify-between glass
                       border-b border-sky-200/30 shadow-nav">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="HydroCare Logo" className="w-12 h-12 md:w-14 md:h-14 object-contain drop-shadow-md" />
          <div className="hidden lg:block">
            <h1 className="font-extrabold text-slate-800 text-2xl leading-none tracking-tight">
              HydroCare
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-1">Smart Hydration</p>
          </div>
        </div>

        {/* Menu items */}
        <div className="flex items-center gap-1">
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
              <li 
                key={to} 
                className="relative"
                onMouseEnter={() => setHoveredPath(to)}
                onMouseLeave={() => setHoveredPath(null)}
              >
                <NavLink
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `relative z-10 flex items-center gap-2 px-4 py-2 rounded-xl transition-colors duration-300 font-semibold text-sm
                     ${isActive ? 'text-sky-700' : 'text-slate-600 hover:text-slate-800'}`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </NavLink>
                {currentPath === to && (
                  <motion.div
                    layoutId="desktop-nav-pill"
                    className="absolute inset-0 bg-sky-600/10 border border-sky-400/30 rounded-xl shadow-glow-sm z-0"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </li>
            ))}
          </ul>

          {/* Logout Button */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                       text-red-500 hover:text-red-600 hover:bg-red-50/80
                       transition-all duration-300 ml-2 border border-transparent hover:border-red-200/50"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </div>
      </nav>

      {/* ─── Mobile Bottom Navigation ─── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50
                       glass border-t border-sky-200/30 shadow-nav">
        <ul className="flex justify-around items-center h-16 px-2">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <li 
              key={to} 
              className="relative flex-1 flex justify-center"
              onMouseEnter={() => setHoveredPath(to)}
              onMouseLeave={() => setHoveredPath(null)}
            >
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `relative z-10 flex flex-col items-center gap-1 px-3 py-1.5 w-full rounded-xl transition-colors duration-300
                   ${isActive ? 'text-sky-700' : 'text-slate-400 hover:text-slate-600'}`
                }
              >
                <div className="p-1.5 rounded-lg">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold">{label}</span>
              </NavLink>
              {currentPath === to && (
                <motion.div
                  layoutId="mobile-nav-pill"
                  className="absolute inset-1 bg-sky-600/10 shadow-glow-sm rounded-xl z-0"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </li>
          ))}
          <li>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-300 text-slate-400 hover:text-red-500"
            >
              <div className="p-1.5 rounded-lg transition-all duration-300">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-semibold">Keluar</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* ─── Logout Modal ─── */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={() => setShowLogoutModal(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in border border-slate-100">
            {/* Header Area */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 flex flex-col items-center text-center border-b border-red-100/50">
              <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 relative">
                <div className="absolute inset-0 rounded-full border-2 border-red-100 animate-ping opacity-20" />
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 tracking-tight">Konfirmasi Keluar</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Apakah kamu yakin ingin keluar dari <span className="font-semibold text-sky-600">HydroCare</span>?
                Jangan lupa kembali lagi nanti untuk mencapai target minummu ya! 💧
              </p>
            </div>
            
            {/* Action Area */}
            <div className="p-5 flex gap-3 bg-white">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3 px-4 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 border border-slate-200/60 transition-all"
              >
                Batal
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 py-3 px-4 rounded-xl text-white font-bold bg-red-500 hover:bg-red-600 shadow-md shadow-red-500/20 hover:shadow-red-500/30 transition-all flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Ya, Keluar
              </button>
            </div>
            
            {/* Close Icon Corner */}
            <button 
              onClick={() => setShowLogoutModal(false)}
              className="absolute top-4 right-4 p-2 text-red-400 hover:text-red-600 hover:bg-red-100/50 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}