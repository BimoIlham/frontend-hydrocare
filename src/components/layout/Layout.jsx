import Navbar from './Navbar'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen relative">
      {/* Subtle background orbs — light glass blue tones */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-300/12 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-20 w-60 h-60 bg-blue-300/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-cyan-200/8 rounded-full blur-3xl" />
      </div>

      <Navbar />

      {/* Main content — full width */}
      <main className="relative z-10 pt-8 md:pt-28 pb-24 md:pb-12 px-4 sm:px-6 lg:px-10 xl:px-16 w-full max-w-[1400px] mx-auto">
        {children}
      </main>
    </div>
  )
}