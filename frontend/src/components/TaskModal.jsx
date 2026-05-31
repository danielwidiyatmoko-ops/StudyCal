import { useState, useEffect } from 'react'
import api from '../lib/api'
import { Btn, Input, Select, Textarea, Banner } from './ui'

export default function TaskModal({ task, onClose, onSaved }) {
  const [courses, setCourses] = useState([])
  const [rubrics, setRubrics] = useState([])
  const [cats,    setCats]    = useState([])
  const [busy,    setBusy]    = useState(false)
  const [error,   setError]   = useState('')

  const [form, setForm] = useState({
    title:             task?.title             || '',
    course_id:         task?.course_id         || '',
    rubric_id:         task?.rubric_id         || '',
    category_id:       task?.category_id       || '',
    due_date:          task?.due_date ? new Date(task.due_date).toLocaleDateString('sv') + 'T' + new Date(task.due_date).toLocaleTimeString('sv', { hour: '2-digit', minute: '2-digit' }): '',    
    estimated_minutes: task?.estimated_minutes || '',
    description:       task?.description       || '',
  })

  useEffect(() => {
    api.get('/courses').then(r => setCourses(r.data))
    api.get('/categories').then(r => setCats(r.data))
  }, [])

  useEffect(() => {
    if (!form.course_id) { setRubrics([]); return }
    api.get(`/rubrics/course/${form.course_id}`)
      .then(r => setRubrics(r.data))
      .catch(() => setRubrics([]))
  }, [form.course_id])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async e => {
    e.preventDefault()
    setBusy(true); setError('')
    const dueDateISO = form.due_date ? new Date(form.due_date).toISOString() : null
    const payload = {
      ...form,
      due_date:          dueDateISO,
      rubric_id:         form.rubric_id         || null,
      category_id:       form.category_id       || null,
      estimated_minutes: form.estimated_minutes ? parseInt(form.estimated_minutes) : null,
    }
    try {
      if (task) {
        await api.put(`/tasks/${task.task_id}`, payload)
      } else {
        await api.post('/tasks', payload)
      }
      onSaved()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save task')
    } finally { setBusy(false) }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(20,19,16,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200, backdropFilter: 'blur(2px)',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: '#fff', borderRadius: 'var(--r-xl)',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)',
        padding: '1.75rem', width: 460, maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-.01em' }}>
            {task ? 'Edit task' : 'New task'}
          </h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: 18,
            color: 'var(--text-4)', cursor: 'pointer', lineHeight: 1,
          }}>✕</button>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Title" value={form.title}
            onChange={e => set('title', e.target.value)}
            placeholder="e.g. Midterm Exam" required />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Select label="Course" value={form.course_id}
              onChange={e => { set('course_id', e.target.value); set('rubric_id', '') }} required>
              <option value="">Select course</option>
              {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.course_name}</option>)}
            </Select>

            <Select label="Category" value={form.category_id}
              onChange={e => set('category_id', e.target.value)}>
              <option value="">None</option>
              {cats.map(c => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
            </Select>
          </div>

          <Select label="Rubric component (grade weight)" value={form.rubric_id}
            onChange={e => set('rubric_id', e.target.value)}>
            <option value="">None (ungraded)</option>
            {rubrics.map(r => (
              <option key={r.rubric_id} value={r.rubric_id}>
                {r.component_name} — {r.weight_percent}%
              </option>
            ))}
          </Select>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Due date & time" type="datetime-local" value={form.due_date}
              onChange={e => set('due_date', e.target.value)} required />
            <Input label="Estimated time (min)" type="number" min="1" value={form.estimated_minutes}
              onChange={e => set('estimated_minutes', e.target.value)}
              placeholder="e.g. 90" />
          </div>

          <Textarea label="Description (optional)" value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Notes about this task…" />

          {error && <Banner type="error">{error}</Banner>}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
            <Btn type="submit" disabled={busy}>{busy ? 'Saving…' : task ? 'Save changes' : 'Create task'}</Btn>
          </div>
        </form>
      </div>
    </div>
  )
}
