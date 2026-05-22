import { useState, useEffect } from 'react'
import api from '../lib/api'
import { Card, PageHeader, Btn, Input, Select, CourseDot, EmptyState, Banner } from '../components/ui'

const COLORS = ['#534AB7','#1D9E75','#D85A30','#BA7517','#D4537E','#185FA5','#B53030','#639922']

export default function Courses() {
  const [courses,  setCourses]  = useState([])
  const [expanded, setExpanded] = useState(null)
  const [rubrics,  setRubrics]  = useState({})
  const [cats,     setCats]     = useState([])
  const [showForm, setShowForm] = useState(false)
  const [rfMap,    setRfMap]    = useState({}) // rubric form per course

  const [form, setForm] = useState({
    course_name: '', course_code: '', semester: '', color_tag: COLORS[0]
  })

  useEffect(() => {
    load()
    api.get('/categories').then(r => setCats(r.data))
  }, [])

  const load = () => api.get('/courses').then(r => setCourses(r.data)).catch(() => {})

  const loadRubrics = id =>
    api.get(`/rubrics/course/${id}`)
       .then(r => setRubrics(p => ({ ...p, [id]: r.data })))

  const expand = id => {
    if (expanded === id) { setExpanded(null); return }
    setExpanded(id)
    loadRubrics(id)
    setRfMap(p => ({ ...p, [id]: { component_name: '', weight_percent: '', category_id: '' } }))
  }

  const addCourse = async e => {
    e.preventDefault()
    await api.post('/courses', form)
    setForm({ course_name: '', course_code: '', semester: '', color_tag: COLORS[0] })
    setShowForm(false)
    load()
  }

  const delCourse = async id => {
    if (!confirm('Delete this course and all its tasks?')) return
    await api.delete(`/courses/${id}`)
    if (expanded === id) setExpanded(null)
    load()
  }

  const addRubric = async (cid, e) => {
    e.preventDefault()
    const f = rfMap[cid]
    await api.post('/rubrics', {
      course_id: cid,
      component_name: f.component_name,
      weight_percent: parseFloat(f.weight_percent),
      category_id: f.category_id || null,
    })
    loadRubrics(cid)
    setRfMap(p => ({ ...p, [cid]: { component_name: '', weight_percent: '', category_id: '' } }))
  }

  const delRubric = async (cid, rid) => {
    await api.delete(`/rubrics/${rid}`)
    loadRubrics(cid)
  }

  const setRF = (id, k, v) =>
    setRfMap(p => ({ ...p, [id]: { ...p[id], [k]: v } }))

  return (
    <div>
      <PageHeader title="Courses" subtitle="Manage your enrolled courses and grading rubrics">
        <Btn onClick={() => setShowForm(s => !s)}>
          {showForm ? 'Cancel' : '+ Add course'}
        </Btn>
      </PageHeader>

      {showForm && (
        <Card style={{ padding: '1.25rem', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: '1rem' }}>New course</h3>
          <form onSubmit={addCourse} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input label="Course name" value={form.course_name} required
                onChange={e => setForm(f => ({ ...f, course_name: e.target.value }))}
                placeholder="e.g. Computer Networks" />
              <Input label="Course code" value={form.course_code} required
                onChange={e => setForm(f => ({ ...f, course_code: e.target.value }))}
                placeholder="e.g. IF3030" />
            </div>
            <Input label="Semester" value={form.semester} required
              onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}
              placeholder="e.g. Semester 6 2026" />
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: 8 }}>
                Color tag
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {COLORS.map(c => (
                  <div key={c} onClick={() => setForm(f => ({ ...f, color_tag: c }))}
                    style={{
                      width: 24, height: 24, borderRadius: '50%', background: c, cursor: 'pointer',
                      outline: form.color_tag === c ? `3px solid ${c}` : 'none',
                      outlineOffset: 2,
                    }} />
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Btn type="submit">Save course</Btn>
            </div>
          </form>
        </Card>
      )}

      {courses.length === 0 && !showForm && (
        <EmptyState icon="📚" message="No courses yet" sub='Click "+ Add course" to get started' />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {courses.map(course => {
          const rubList = rubrics[course.course_id] || []
          const total   = rubList.reduce((s, r) => s + r.weight_percent, 0)
          const isOpen  = expanded === course.course_id

          return (
            <Card key={course.course_id} style={{ padding: 0, overflow: 'hidden' }}>
              {/* Course header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '13px 1.25rem', cursor: 'pointer',
              }} onClick={() => expand(course.course_id)}>
                <CourseDot color={course.color_tag} size={10} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{course.course_name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-4)' }}>
                    {course.course_code} · {course.semester}
                  </div>
                </div>
                <Btn variant="danger" style={{ height: 28, fontSize: 11, padding: '0 10px' }}
                  onClick={e => { e.stopPropagation(); delCourse(course.course_id) }}>
                  Delete
                </Btn>
                <span style={{ fontSize: 12, color: 'var(--text-4)', marginLeft: 4 }}>
                  {isOpen ? '▲' : '▼'}
                </span>
              </div>

              {/* Rubric panel */}
              {isOpen && (
                <div style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-subtle)', padding: '1rem 1.25rem' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10 }}>
                    Rubric components
                  </div>

                  {rubList.length === 0
                    ? <p style={{ fontSize: 12, color: 'var(--text-4)', marginBottom: 12 }}>No components yet</p>
                    : rubList.map(r => (
                      <div key={r.rubric_id} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '7px 0', borderBottom: '1px solid var(--border)',
                      }}>
                        <span style={{ flex: 1, fontSize: 13 }}>{r.component_name}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: course.color_tag }}>
                          {r.weight_percent}%
                        </span>
                        <button onClick={() => delRubric(course.course_id, r.rubric_id)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-4)', cursor: 'pointer', fontSize: 14 }}>
                          ✕
                        </button>
                      </div>
                    ))
                  }

                  {/* Total weight indicator */}
                  {rubList.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, padding: '8px 0', fontSize: 12 }}>
                      <span style={{ color: 'var(--text-4)' }}>Total:</span>
                      <span style={{ fontWeight: 600, color: total === 100 ? 'var(--teal)' : 'var(--red)' }}>
                        {total.toFixed(0)}%
                      </span>
                      {total !== 100 && (
                        <span style={{ fontSize: 11, color: 'var(--red)' }}>⚠ should be 100%</span>
                      )}
                    </div>
                  )}

                  {/* Add rubric form */}
                  <form onSubmit={e => addRubric(course.course_id, e)}
                    style={{ display: 'grid', gridTemplateColumns: '1fr 80px 120px auto', gap: 8, marginTop: 12, alignItems: 'flex-end' }}>
                    <Input placeholder="Component name"
                      value={rfMap[course.course_id]?.component_name || ''}
                      onChange={e => setRF(course.course_id, 'component_name', e.target.value)} required />
                    <Input placeholder="%" type="number" min="1" max="100"
                      value={rfMap[course.course_id]?.weight_percent || ''}
                      onChange={e => setRF(course.course_id, 'weight_percent', e.target.value)} required />
                    <Select value={rfMap[course.course_id]?.category_id || ''}
                      onChange={e => setRF(course.course_id, 'category_id', e.target.value)}>
                      <option value="">Category</option>
                      {cats.map(c => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
                    </Select>
                    <Btn type="submit" style={{ height: 38 }}>Add</Btn>
                  </form>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
