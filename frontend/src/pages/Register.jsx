import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Input, Btn, Banner } from '../components/ui'

export default function Register() {
  const { register } = useAuth()
  const navigate     = useNavigate()
  const [form, setForm]   = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy]   = useState(false)

  const handle = async e => {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      await register(form.name, form.email, form.password)
      navigate('/calendar')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.')
    } finally { setBusy(false) }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-subtle)',
    }}>
      <div style={{ width: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src="/Logo_Dark.svg" alt="StudyCal" style={{ height: 40, marginBottom: 12 }} />
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-.02em' }}>Create your account</h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>Start organizing your academic life</p>
        </div>

        <div style={{
          background: '#fff', borderRadius: 'var(--r-xl)',
          border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)',
          padding: '2rem',
        }}>
          <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input
              label="Full name"
              type="text"
              placeholder="Your name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
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
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              minLength={8}
              required
            />
            {error && <Banner type="error">{error}</Banner>}
            <Btn type="submit" disabled={busy} style={{ width: '100%', height: 40, marginTop: 4 }}>
              {busy ? 'Creating account…' : 'Create account'}
            </Btn>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-3)', marginTop: '1.25rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--purple)', fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
