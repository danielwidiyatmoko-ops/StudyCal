/* ─── Button ─────────────────────────────────────────────────────── */
export function Btn({ children, onClick, variant = 'primary', style, type = 'button', disabled }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    padding: '0 14px', height: 36, borderRadius: 'var(--r-sm)',
    fontSize: 13, fontWeight: 500, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1, transition: 'background .15s, opacity .15s', whiteSpace: 'nowrap',
  }
  const variants = {
    primary:   { background: 'var(--purple)',      color: '#fff' },
    secondary: { background: 'var(--bg-subtle)',    color: 'var(--text-2)', border: '1px solid var(--border)' },
    danger:    { background: 'var(--red-light)',    color: 'var(--red)',    border: '1px solid #EEB8B8' },
    ghost:     { background: 'transparent',         color: 'var(--text-3)', border: '1px solid var(--border)' },
    teal:      { background: 'var(--teal)',         color: '#fff' },
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  )
}

/* ─── Card ───────────────────────────────────────────────────────── */
export function Card({ children, style }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 'var(--r-lg)',
      border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', ...style,
    }}>
      {children}
    </div>
  )
}

/* ─── Input ──────────────────────────────────────────────────────── */
export function Input({ label, error, style, containerStyle, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, ...containerStyle }}>
      {label && <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)' }}>{label}</label>}
      <input style={{
        height: 38, padding: '0 12px',
        border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
        borderRadius: 'var(--r-sm)', fontSize: 13, color: 'var(--text)',
        background: '#fff', outline: 'none', transition: 'border .15s',
        ...style,
      }}
        onFocus={e => e.target.style.borderColor = 'var(--purple)'}
        onBlur={e => e.target.style.borderColor = error ? 'var(--red)' : 'var(--border)'}
        {...props} />
      {error && <span style={{ fontSize: 11, color: 'var(--red)' }}>{error}</span>}
    </div>
  )
}

/* ─── Select ─────────────────────────────────────────────────────── */
export function Select({ label, children, containerStyle, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, ...containerStyle }}>
      {label && <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)' }}>{label}</label>}
      <select style={{
        height: 38, padding: '0 12px',
        border: '1px solid var(--border)', borderRadius: 'var(--r-sm)',
        fontSize: 13, color: 'var(--text)', background: '#fff',
      }} {...props}>
        {children}
      </select>
    </div>
  )
}

/* ─── Textarea ───────────────────────────────────────────────────── */
export function Textarea({ label, containerStyle, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, ...containerStyle }}>
      {label && <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)' }}>{label}</label>}
      <textarea style={{
        padding: '10px 12px', border: '1px solid var(--border)',
        borderRadius: 'var(--r-sm)', fontSize: 13, color: 'var(--text)',
        background: '#fff', resize: 'vertical', minHeight: 80, outline: 'none',
      }}
        onFocus={e => e.target.style.borderColor = 'var(--purple)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
        {...props} />
    </div>
  )
}

/* ─── Category pill ──────────────────────────────────────────────── */
const CAT_COLORS = {
  'Exam':        { bg: 'var(--coral-light)',  color: '#712B13' },
  'Online Quiz': { bg: 'var(--purple-light)', color: 'var(--purple-dark)' },
  'Homework':    { bg: 'var(--teal-light)',   color: 'var(--teal-dark)' },
  'Project':     { bg: 'var(--amber-light)',  color: '#633806' },
  'Lab Report':  { bg: 'var(--gray-100)',     color: 'var(--gray-600)' },
}
export function CategoryPill({ name }) {
  const c = CAT_COLORS[name] || { bg: 'var(--gray-100)', color: 'var(--gray-500)' }
  return (
    <span style={{
      display: 'inline-block', fontSize: 11, fontWeight: 500,
      padding: '2px 8px', borderRadius: 99,
      background: c.bg, color: c.color,
    }}>{name || '—'}</span>
  )
}

/* ─── Priority badge ─────────────────────────────────────────────── */
export function PriorityBadge({ score }) {
  if (score === null || score === undefined) return null
  const cfg = score >= 70
    ? { bg: 'var(--red-light)',   color: 'var(--red)',   label: 'High' }
    : score >= 40
    ? { bg: 'var(--amber-light)', color: 'var(--amber)', label: 'Medium' }
    : { bg: 'var(--green-light)', color: 'var(--green)', label: 'Low' }
  return (
    <span style={{
      display: 'inline-block', fontSize: 11, fontWeight: 600,
      padding: '2px 8px', borderRadius: 99,
      background: cfg.bg, color: cfg.color,
    }}>{cfg.label}</span>
  )
}

/* ─── Priority bar ───────────────────────────────────────────────── */
export function PriorityBar({ score }) {
  if (!score) return null
  const pct   = Math.min(100, Math.round(score))
  const color = score >= 70 ? 'var(--red)' : score >= 40 ? 'var(--amber)' : 'var(--teal)'
  return (
    <div style={{ width: 52, height: 5, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99 }} />
    </div>
  )
}

/* ─── Course dot ─────────────────────────────────────────────────── */
export function CourseDot({ color, size = 8 }) {
  return (
    <span style={{
      width: size, height: size, borderRadius: '50%',
      background: color || '#888', display: 'inline-block', flexShrink: 0,
    }} />
  )
}

/* ─── Page header ────────────────────────────────────────────────── */
export function PageHeader({ title, subtitle, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text)', letterSpacing: '-.02em' }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 2 }}>{subtitle}</p>}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>{children}</div>
    </div>
  )
}

/* ─── Empty state ────────────────────────────────────────────────── */
export function EmptyState({ icon = '📭', message, sub }) {
  return (
    <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
      <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-2)', marginBottom: 4 }}>{message}</p>
      {sub && <p style={{ fontSize: 12, color: 'var(--text-4)' }}>{sub}</p>}
    </div>
  )
}

/* ─── Section heading ────────────────────────────────────────────── */
export function SectionHead({ children }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 600, color: 'var(--text-4)',
      textTransform: 'uppercase', letterSpacing: '.07em',
      padding: '10px 1.25rem', borderBottom: '1px solid var(--border)',
    }}>
      {children}
    </div>
  )
}

/* ─── Alert / banner ─────────────────────────────────────────────── */
export function Banner({ type = 'info', children }) {
  const cfg = {
    info:    { bg: 'var(--purple-light)', color: 'var(--purple-dark)', border: '#C4C0F5' },
    success: { bg: 'var(--teal-light)',   color: 'var(--teal-dark)',   border: '#A3D9C8' },
    error:   { bg: 'var(--red-light)',    color: 'var(--red)',         border: '#EEB8B8' },
  }[type]
  return (
    <div style={{
      padding: '10px 14px', borderRadius: 'var(--r-md)',
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.border}`, fontSize: 13,
    }}>
      {children}
    </div>
  )
}
