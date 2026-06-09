import { useState } from 'react'

const PROJECT_TYPES = [
  'Website (Kaupeka Web)',
  'SaaS / App (Kaupeka Build)',
  'Monthly Retainer (Kaupeka Grow)',
  'Not sure yet',
]

const FIELD_STYLE = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.10)',
  color: 'white',
}

function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>{label}</label>
      {children}
      {error && <p className="text-xs" style={{ color: '#EF9F27' }}>{error}</p>}
    </div>
  )
}

const details = [
  { label: 'Email', value: 'kia.ora@kaupeka.nz', href: 'mailto:kia.ora@kaupeka.nz' },
  { label: 'Based in', value: 'Tāmaki Makaurau, Auckland NZ', href: null },
  { label: 'Response time', value: 'Within one business day', href: null },
]

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', projectType: '', message: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required.'
    if (!form.email.trim()) e.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address.'
    if (!form.message.trim()) e.message = 'Message is required.'
    return e
  }

  function set(field) {
    return (e) => {
      setForm((f) => ({ ...f, [field]: e.target.value }))
      if (errors[field]) setErrors((err) => ({ ...err, [field]: undefined }))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    setStatus('submitting')
    try {
      const res = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(form),
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  const inputClass = 'w-full px-4 py-3 rounded-xl text-sm outline-none transition-all placeholder:text-white/25 focus:border-[#185FA5]'

  if (status === 'success') {
    return (
      <main className="max-w-6xl mx-auto px-5 py-32 text-center">
        <div
          className="inline-flex flex-col items-center gap-4 px-10 py-12 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(29,158,117,0.15)', color: '#1D9E75' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white">Message sent!</h2>
          <p className="text-sm max-w-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Thanks for reaching out. We&apos;ll get back to you within one business day.
          </p>
        </div>
      </main>
    )
  }

  return (
    <>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 pt-20 pb-12 md:pt-28">
        <div
          className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-medium mb-8"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' }}
        >
          Get in touch
        </div>
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.08] tracking-tight text-white">
          Let&apos;s build
        </h1>
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.08] tracking-tight" style={{ color: '#1D9E75' }}>
          something real.
        </h1>
        <p className="mt-6 text-lg max-w-xl leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
          Tell us what you&apos;re building. We respond within one business day — no automated replies, just Turei.
        </p>
      </section>

      {/* Two-column layout */}
      <section className="max-w-6xl mx-auto px-5 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Form — 2/3 width */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="lg:col-span-2 flex flex-col gap-5 p-6 md:p-8 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Name" error={errors.name}>
                <input
                  type="text"
                  placeholder="Your name"
                  value={form.name}
                  onChange={set('name')}
                  className={inputClass}
                  style={FIELD_STYLE}
                />
              </Field>
              <Field label="Email" error={errors.email}>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={set('email')}
                  className={inputClass}
                  style={FIELD_STYLE}
                />
              </Field>
            </div>

            <Field label="Project type (optional)">
              <select
                value={form.projectType}
                onChange={set('projectType')}
                className={inputClass}
                style={{ ...FIELD_STYLE, colorScheme: 'dark' }}
              >
                <option value="">Select a service…</option>
                {PROJECT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>

            <Field label="Message" error={errors.message}>
              <textarea
                rows={6}
                placeholder="Tell us about your project…"
                value={form.message}
                onChange={set('message')}
                className={`${inputClass} resize-none`}
                style={FIELD_STYLE}
              />
            </Field>

            {status === 'error' && (
              <p className="text-sm" style={{ color: '#EF9F27' }}>
                Something went wrong. Please try again or email us directly at kia.ora@kaupeka.nz
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="self-end inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-white transition-all hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: '#185FA5' }}
            >
              {status === 'submitting' ? 'Sending…' : 'Send message'}
              {status !== 'submitting' && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </form>

          {/* Side panel — 1/3 width */}
          <div className="flex flex-col gap-5">
            {/* Contact details */}
            <div
              className="flex flex-col gap-5 p-6 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {details.map(({ label, value, href }) => (
                <div key={label}>
                  <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</p>
                  {href ? (
                    <a href={href} className="text-sm transition-colors hover:text-white" style={{ color: '#1D9E75' }}>{value}</a>
                  ) : (
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{value}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Founder note */}
            <div
              className="flex flex-col gap-3 p-6 rounded-2xl"
              style={{ background: 'rgba(29,158,117,0.06)', border: '1px solid rgba(29,158,117,0.2)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold text-white shrink-0"
                  style={{ background: '#185FA5' }}
                >
                  T
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Turei Milner</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>Founder & Developer</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                Every message comes directly to me. No sales team, no handoffs — just a straight conversation about your project.
              </p>
            </div>
          </div>

        </div>
      </section>
    </>
  )
}
