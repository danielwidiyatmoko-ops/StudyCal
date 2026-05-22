import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import api from '../lib/api'
import { Card, PageHeader, Btn, CategoryPill, PriorityBadge, PriorityBar, CourseDot, EmptyState } from '../components/ui'
import TaskModal from '../components/TaskModal'

const FILTERS = [['pending','Pending'],['all','All'],['done','Done']]

export default function Tasks() {
  const [tasks,  setTasks]  = useState([])
  const [filter, setFilter] = useState('pending')
  const [modal,  setModal]  = useState(null) // null | 'new' | task object

  const load = () => api.get('/tasks').then(r => setTasks(r.data)).catch(() => {})
  useEffect(() => { load() }, [])

  const visible = tasks.filter(t =>
    filter === 'all'     ? true :
    filter === 'pending' ? !t.is_completed :
    t.is_completed
  )

  const toggle = async task => {
    await api.patch(`/tasks/${task.task_id}/complete`)
    load()
  }

  const del = async task => {
    if (!confirm(`Delete "${task.title}"?`)) return
    await api.delete(`/tasks/${task.task_id}`)
    load()
  }

  return (
    <div>
      <PageHeader
        title="Tasks"
        subtitle="Sorted by priority score"
      >
        <Btn onClick={() => setModal('new')}>+ New task</Btn>
      </PageHeader>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: '1rem', alignItems: 'center' }}>
        {FILTERS.map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)} style={{
            padding: '5px 14px', borderRadius: 'var(--r-sm)', fontSize: 12, fontWeight: 500,
            border: '1px solid', cursor: 'pointer',
            background: filter === val ? 'var(--purple-light)' : '#fff',
            color:      filter === val ? 'var(--purple-dark)'  : 'var(--text-3)',
            borderColor:filter === val ? 'var(--purple)'       : 'var(--border)',
          }}>{label}</button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-4)' }}>
          {visible.length} task{visible.length !== 1 ? 's' : ''}
        </span>
      </div>

      <Card style={{ padding: 0 }}>
        {visible.length === 0
          ? <EmptyState
              icon={filter === 'done' ? '🎉' : '📋'}
              message={filter === 'done' ? 'No completed tasks yet' : 'No tasks here'}
              sub={filter === 'pending' ? 'Click "+ New task" to add one' : undefined}
            />
          : visible.map((task, i) => (
            <div key={task.task_id} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '12px 1.25rem',
              borderBottom: i < visible.length - 1 ? '1px solid var(--border)' : 'none',
              opacity: task.is_completed ? 0.55 : 1,
              transition: 'opacity .15s',
            }}>
              {/* Checkbox */}
              <input type="checkbox" checked={task.is_completed}
                onChange={() => toggle(task)}
                style={{ marginTop: 3, accentColor: 'var(--purple)', cursor: 'pointer', flexShrink: 0 }} />

              {/* Task info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13, fontWeight: 500, marginBottom: 4,
                  textDecoration: task.is_completed ? 'line-through' : 'none',
                  color: task.is_completed ? 'var(--text-3)' : 'var(--text)',
                }}>
                  {task.title}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <CourseDot color={task.color_tag} />
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{task.course_name}</span>
                  {task.rubric_component && (
                    <span style={{ fontSize: 11, color: 'var(--text-4)' }}>
                      · {task.rubric_component} ({task.weight_percent}%)
                    </span>
                  )}
                  <span style={{ fontSize: 11, color: 'var(--text-4)' }}>
                    · Due {task.due_date ? format(new Date(task.due_date), 'dd MMM, HH:mm') : '—'}
                  </span>
                  {task.estimated_minutes && (
                    <span style={{ fontSize: 11, color: 'var(--text-4)' }}>· {task.estimated_minutes}min</span>
                  )}
                </div>
              </div>

              {/* Right column */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <CategoryPill name={task.category} />
                  <PriorityBadge score={task.priority_score} />
                </div>
                <PriorityBar score={task.priority_score} />
                {task.priority_score !== null && (
                  <span style={{ fontSize: 10, color: 'var(--text-4)' }}>
                    Score: {task.priority_score}
                  </span>
                )}
                <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
                  <Btn variant="ghost" style={{ padding: '0 10px', height: 28, fontSize: 11 }}
                    onClick={() => setModal(task)}>Edit</Btn>
                  <Btn variant="danger" style={{ padding: '0 10px', height: 28, fontSize: 11 }}
                    onClick={() => del(task)}>Delete</Btn>
                </div>
              </div>
            </div>
          ))
        }
      </Card>

      {modal && (
        <TaskModal
          task={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load() }}
        />
      )}
    </div>
  )
}
