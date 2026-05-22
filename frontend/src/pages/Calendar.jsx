import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval,
         getDay, isSameDay, isToday, addMonths, subMonths } from 'date-fns'
import api from '../lib/api'
import { Card, PageHeader, Btn, CategoryPill, CourseDot, EmptyState } from '../components/ui'

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export default function Calendar() {
  const [current,  setCurrent]  = useState(new Date())
  const [tasks,    setTasks]    = useState([])
  const [selected, setSelected] = useState(null)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get('/tasks/calendar', {
      params: { year: current.getFullYear(), month: current.getMonth() + 1 }
    })
      .then(r => setTasks(r.data))
      .finally(() => setLoading(false))
  }, [current])

  const monthStart = startOfMonth(current)
  const days       = eachDayOfInterval({ start: monthStart, end: endOfMonth(current) })
  const startPad   = getDay(monthStart)
  const tasksOn    = day => tasks.filter(t => isSameDay(new Date(t.due_date), day))
  const selTasks   = selected ? tasksOn(selected) : []

  return (
    <div>
      <PageHeader
        title={format(current, 'MMMM yyyy')}
        subtitle={`${tasks.length} task${tasks.length !== 1 ? 's' : ''} this month`}
      >
        <Btn variant="ghost" onClick={() => setCurrent(d => subMonths(d, 1))}>‹</Btn>
        <Btn variant="secondary" onClick={() => { setCurrent(new Date()); setSelected(null) }}>Today</Btn>
        <Btn variant="ghost" onClick={() => setCurrent(d => addMonths(d, 1))}>›</Btn>
      </PageHeader>

      <Card>
        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '10px 12px 6px' }}>
          {DAYS.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--text-4)', letterSpacing: '.04em' }}>{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, padding: '0 12px 12px' }}>
          {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
          {days.map(day => {
            const dayTasks = tasksOn(day)
            const isSel    = selected && isSameDay(day, selected)
            const today    = isToday(day)
            return (
              <div key={day.toISOString()} onClick={() => setSelected(isSel ? null : day)}
                style={{
                  minHeight: 64, borderRadius: 'var(--r-sm)', padding: '5px 6px',
                  cursor: 'pointer', transition: 'background .1s',
                  border: `1px solid ${isSel ? 'var(--purple)' : today ? 'var(--purple)' : 'var(--border)'}`,
                  background: isSel ? 'var(--purple-light)' : today ? '#F8F7FF' : '#fff',
                }}>
                <div style={{
                  fontSize: 12, fontWeight: today ? 700 : 400, marginBottom: 4,
                  color: today ? 'var(--purple)' : 'var(--text-3)',
                }}>
                  {format(day, 'd')}
                </div>
                {dayTasks.slice(0, 3).map(t => (
                  <div key={t.task_id} style={{
                    height: 4, borderRadius: 2, marginBottom: 2,
                    background: t.is_completed ? 'var(--border)' : (t.color_tag || 'var(--purple)'),
                  }} title={t.title} />
                ))}
                {dayTasks.length > 3 && (
                  <div style={{ fontSize: 9, color: 'var(--text-4)' }}>+{dayTasks.length - 3}</div>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Day detail panel */}
      {selected && (
        <Card style={{ marginTop: '1rem', padding: 0 }}>
          <div style={{ padding: '12px 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>
              {format(selected, 'EEEE, MMMM d')}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-4)' }}>
              {selTasks.length} task{selTasks.length !== 1 ? 's' : ''}
            </span>
          </div>
          {selTasks.length === 0
            ? <EmptyState icon="✓" message="Nothing due on this day" />
            : selTasks.map((t, i) => (
              <div key={t.task_id} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 1.25rem',
                borderBottom: i < selTasks.length - 1 ? '1px solid var(--border)' : 'none',
                opacity: t.is_completed ? 0.5 : 1,
              }}>
                <CourseDot color={t.color_tag} size={9} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, textDecoration: t.is_completed ? 'line-through' : 'none' }}>
                    {t.title}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 2 }}>
                    {t.course_name} · {format(new Date(t.due_date), 'HH:mm')}
                    {t.estimated_minutes ? ` · ${t.estimated_minutes}min` : ''}
                  </div>
                </div>
                <CategoryPill name={t.category} />
              </div>
            ))
          }
        </Card>
      )}
    </div>
  )
}
