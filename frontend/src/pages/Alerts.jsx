import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import api from '../lib/api'
import { Card, PageHeader, Btn, CourseDot, PriorityBadge, EmptyState, SectionHead } from '../components/ui'

export default function Alerts() {
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    api.get('/notifications')
       .then(r => setNotifs(r.data))
       .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const ack = async id => {
    await api.patch(`/notifications/${id}/acknowledge`)
    load()
  }

  const unread  = notifs.filter(n => n.is_sent && !n.is_acknowledged)
  const earlier = notifs.filter(n => n.is_acknowledged || !n.is_sent)

  const Row = ({ n }) => (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '12px 1.25rem', borderBottom: '1px solid var(--border)',
      opacity: n.is_acknowledged ? 0.5 : 1,
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 'var(--r-sm)', flexShrink: 0,
        background: n.is_acknowledged ? 'var(--bg-subtle)' : 'var(--red-light)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
      }}>
        {n.is_acknowledged ? '✓' : '🔔'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 500, marginBottom: 3,
          textDecoration: n.is_acknowledged ? 'line-through' : 'none',
          color: n.is_acknowledged ? 'var(--text-3)' : 'var(--text)',
        }}>
          {n.task_title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {n.color_tag && <CourseDot color={n.color_tag} />}
          <span style={{ fontSize: 11, color: 'var(--text-4)' }}>{n.course_name}</span>
          <span style={{ fontSize: 11, color: 'var(--text-4)' }}>
            · Alert: {n.notify_at ? format(new Date(n.notify_at), 'dd MMM, HH:mm') : '—'}
          </span>
          {n.due_date && (
            <span style={{ fontSize: 11, color: 'var(--text-4)' }}>
              · Due: {format(new Date(n.due_date), 'dd MMM, HH:mm')}
            </span>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
        <PriorityBadge score={n.priority_score} />
        {!n.is_sent && (
          <span style={{ fontSize: 11, color: 'var(--text-4)', fontStyle: 'italic' }}>Scheduled</span>
        )}
        {n.is_sent && !n.is_acknowledged && (
          <Btn variant="secondary" style={{ height: 26, fontSize: 11, padding: '0 10px' }}
            onClick={() => ack(n.notif_id)}>
            Dismiss
          </Btn>
        )}
      </div>
    </div>
  )

  return (
    <div>
      <PageHeader title="Alerts" subtitle="Upcoming and past task reminders">
        <Btn variant="ghost" onClick={load}>↺ Refresh</Btn>
      </PageHeader>

      <Card style={{ padding: 0, marginBottom: '1rem' }}>
        <SectionHead>Unread · {unread.length}</SectionHead>
        {unread.length === 0
          ? <EmptyState icon="✓" message="All caught up" sub="No unread alerts right now" />
          : unread.map(n => <Row key={n.notif_id} n={n} />)
        }
      </Card>

      <Card style={{ padding: 0 }}>
        <SectionHead>Earlier · {earlier.length}</SectionHead>
        {earlier.length === 0
          ? <EmptyState icon="🗂" message="No earlier alerts" />
          : earlier.map(n => <Row key={n.notif_id} n={n} />)
        }
      </Card>
    </div>
  )
}
