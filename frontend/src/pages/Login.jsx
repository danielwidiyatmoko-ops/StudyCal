import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Input, Btn, Banner } from '../components/ui'

export default function Login() {
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const [form, setForm]   = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy]   = useState(false)

  const handle = async e => {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      await login(form.email, form.password)
      navigate('/calendar')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.')
    } finally { setBusy(false) }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-subtle)',
    }}>
      <div style={{ width: 380 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src="/favicon.svg" alt="StudyCal" style={{ height: 40, marginBottom: 12 }} />
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-.02em' }}>Welcome back</h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>Sign in to your StudyCal account</p>
        </div>

        {/* Card */}
        <div style={{
          background: '#fff', borderRadius: 'var(--r-xl)',
          border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)',
          padding: '2rem',
        }}>
          <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input
              label="Email address"
              type="email"
              placeholder="you@university.ac.id"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
            {error && <Banner type="error">{error}</Banner>}
            <Btn type="submit" disabled={busy} style={{ width: '100%', height: 40, marginTop: 4 }}>
              {busy ? 'Signing in…' : 'Sign in'}
            </Btn>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-3)', marginTop: '1.25rem' }}>
          No account?{' '}
          <Link to="/register" style={{ color: 'var(--purple)', fontWeight: 500 }}>Create one</Link>
        </p>
      </div>
    </div>
  )
}
