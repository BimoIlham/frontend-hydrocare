import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard  from './pages/Dashboard'
import Tracker    from './pages/Tracker'
import Education  from './pages/Education'
import Profile    from './pages/Profile'
import Onboarding from './pages/Onboarding'
import useUserStore from './store/useUserStore'

export default function App() {
  const { isLoggedIn } = useUserStore()

  // Jika belum login, tampilkan halaman login/register
  if (!isLoggedIn) return <Onboarding />

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/"          element={<Dashboard />}  />
          <Route path="/tracker"   element={<Tracker />}    />
          <Route path="/education" element={<Education />}  />
          <Route path="/profile"   element={<Profile />}    />
          <Route path="*"          element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}