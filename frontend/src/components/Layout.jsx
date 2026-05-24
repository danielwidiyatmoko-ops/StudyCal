import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import api from '../lib/api'

const NAV = [
  { to: '/calendar', icon: '📅', label: 'Calendar' },
  { to: '/tasks',    icon: '✅', label: 'Tasks' },
  { to: '/courses',  icon: '📚', label: 'Courses' },
  { to: '/alerts',   icon: '🔔', label: 'Alerts' },
  { to: '/import',   icon: '📥', label: 'Import ICS' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()
  const [unread, setUnread] = useState(0)
  
  // Request browser notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])
  
  // Poll for pending notifications every 60s
  useEffect(() => {
    const poll = async () => {
      try {
        const r = await api.get('/notifications/pending')
        if (r.data.length) {
          setUnread(n => n + r.data.length)

          // Show a browser push notification for each one
          if ('Notification' in window && Notification.permission === 'granted') {
            r.data.forEach(n => {
              new Notification(`📅 StudyCal — Task Due Soon`, {
                body: `${n.task_title} (${n.course_name})`,
                icon: '/favicon.svg',
              })
            })
          }
        }
      } catch (_) {}
    }
    poll()
    const id = setInterval(poll, 60000)
    return () => clearInterval(id)
  }, [])

  const initials = user?.name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* Sidebar */}
      <aside style={{
        width: 210, flexShrink: 0, background: '#fff',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        padding: '0',
      }}>

        {/* Logo */}
        <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid var(--border)' }}>
          <img src="/favicon.svg" alt="StudyCal" style={{ height: 28 }} />
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
          {NAV.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 18px', fontSize: 13, fontWeight: 500,
              color: isActive ? 'var(--purple)' : 'var(--text-3)',
              background: isActive ? 'var(--purple-light)' : 'transparent',
              borderRight: isActive ? '2px solid var(--purple)' : '2px solid transparent',
              transition: 'all .15s',
            })}>
              <span style={{ fontSize: 15 }}>{icon}</span>
              {label}
              {label === 'Alerts' && unread > 0 && (
                <span style={{
                  marginLeft: 'auto', background: 'var(--red)', color: '#fff',
                  fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 99,
                }}>{unread}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'var(--purple-light)', color: 'var(--purple-dark)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, flexShrink: 0,
          }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/login') }} style={{
            background: 'none', border: 'none', color: 'var(--text-4)',
            fontSize: 11, cursor: 'pointer', flexShrink: 0, padding: '2px 4px',
          }} title="Sign out">↩</button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '2rem 2.5rem', background: 'var(--bg)' }}>
        <Outlet />
      </main>
    </div>
  )
}
