import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout   from './components/Layout'
import Login    from './pages/Login'
import Register from './pages/Register'
import Calendar from './pages/Calendar'
import Tasks    from './pages/Tasks'
import Courses  from './pages/Courses'
import Alerts   from './pages/Alerts'
import ImportICS from './pages/ImportICS'

function Private({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}>
      Loading…
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Private><Layout /></Private>}>
        <Route index             element={<Navigate to="/calendar" replace />} />
        <Route path="calendar"   element={<Calendar />} />
        <Route path="tasks"      element={<Tasks />} />
        <Route path="courses"    element={<Courses />} />
        <Route path="alerts"     element={<Alerts />} />
        <Route path="import"     element={<ImportICS />} />
      </Route>
    </Routes>
  )
}
