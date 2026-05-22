import { useState, useEffect, useRef } from 'react'
import { format } from 'date-fns'
import api from '../lib/api'
import { Card, PageHeader, Btn, Select, EmptyState, Banner } from '../components/ui'

export default function ImportICS() {
  const [courses,  setCourses]  = useState([])
  const [courseId, setCourseId] = useState('')
  const [preview,  setPreview]  = useState(null)
  const [busy,     setBusy]     = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')
  const fileRef = useRef()

  useEffect(() => {
    api.get('/courses').then(r => {
      setCourses(r.data)
      if (r.data.length > 0) setCourseId(String(r.data[0].course_id))
    })
  }, [])

  const handleFile = async e => {
    const file = e.target.files[0]
    if (!file) return
    setError(''); setPreview(null); setSuccess('')

    const text   = await file.text()
    const events = []
    let cur = {}

    for (const line of text.split(/\r?\n/)) {
      const l = line.trim()
      if      (l === 'BEGIN:VEVENT') cur = {}
      else if (l === 'END:VEVENT')   { if (cur.title) events.push(cur) }
      else if (l.startsWith('SUMMARY'))  cur.title = l.split(':').slice(1).join(':')
      else if (l.startsWith('DTSTART')) {
        const val = l.split(':').slice(1).join(':').replace(/[TZ]/g, ' ').trim()
        try {
          const d = val.length >= 14
            ? new Date(val.replace(/(\d{4})(\d{2})(\d{2}) (\d{2})(\d{2})(\d{2})/, '$1-$2-$3T$4:$5:$6'))
            : new Date(val.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'))
          if (!isNaN(d)) cur.due_date = d
        } catch (_) {}
      }
    }
    setPreview(events)
  }

  const submit = async () => {
    if (!preview?.length || !courseId) return
    setBusy(true); setError('')
    try {
      const file = fileRef.current.files[0]
      const fd   = new FormData()
      fd.append('file', file)
      fd.append('course_id', courseId)
      const r = await api.post('/tasks/import-ics', fd)
      setSuccess(`Successfully imported ${r.data.imported} task${r.data.imported !== 1 ? 's' : ''}!`)
      setPreview(null)
      fileRef.current.value = ''
    } catch (err) {
      setError(err.response?.data?.error || 'Import failed')
    } finally { setBusy(false) }
  }

  return (
    <div>
      <PageHeader title="Import ICS" subtitle="Import your schedule from Canvas or Moodle" />

      <Card style={{ padding: '1.5rem', marginBottom: '1rem' }}>
        <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
          Export your schedule from <strong>Canvas</strong> or <strong>Moodle</strong> as an{' '}
          <code style={{ background: 'var(--bg-subtle)', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>.ics</code>{' '}
          file, then upload it below. All detected events will be added as tasks assigned to the selected course.
          You can then edit each task individually to assign rubric components.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Select label="Assign all imported tasks to" value={courseId}
            onChange={e => setCourseId(e.target.value)}>
            {courses.length === 0
              ? <option value="">— add a course first —</option>
              : courses.map(c => <option key={c.course_id} value={c.course_id}>{c.course_name}</option>)
            }
          </Select>

          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: 8 }}>
              ICS file
            </label>
            <div style={{
              border: '1.5px dashed var(--border-mid)', borderRadius: 'var(--r-lg)',
              padding: '2rem', textAlign: 'center', cursor: 'pointer',
              background: 'var(--bg-subtle)', transition: 'border-color .15s',
            }} onClick={() => fileRef.current.click()}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>📥</div>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-2)', marginBottom: 4 }}>
                Click to select .ics file
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-4)' }}>
                {fileRef.current?.files?.[0]?.name || 'No file selected'}
              </p>
              <input ref={fileRef} type="file" accept=".ics" style={{ display: 'none' }}
                onChange={handleFile} />
            </div>
          </div>
        </div>
      </Card>

      {success && <Banner type="success" style={{ marginBottom: '1rem' }}>{success} Go to Tasks to assign rubric components.</Banner>}
      {error   && <Banner type="error"   style={{ marginBottom: '1rem' }}>{error}</Banner>}

      {preview && preview.length === 0 && (
        <EmptyState icon="🤔" message="No events found in this file" sub="Make sure you're uploading a valid .ics file" />
      )}

      {preview && preview.length > 0 && (
        <Card style={{ padding: 0 }}>
          <div style={{
            padding: '10px 1.25rem', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)' }}>
              PREVIEW — {preview.length} EVENT{preview.length !== 1 ? 'S' : ''} DETECTED
            </span>
            <Btn onClick={submit} disabled={busy || !courseId}>
              {busy ? 'Importing…' : `Import ${preview.length} tasks`}
            </Btn>
          </div>
          {preview.map((ev, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 1.25rem',
              borderBottom: i < preview.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{ev.title}</div>
                {ev.due_date && (
                  <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 2 }}>
                    {format(ev.due_date, 'dd MMM yyyy, HH:mm')}
                  </div>
                )}
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-4)', fontStyle: 'italic' }}>
                needs rubric assignment
              </span>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
