import { Link } from 'react-router-dom'

/* ── Service data ────────────────────────────────────────── */
const services = [
  {
    name: 'Kaupeka Web',
    tagline: 'A website that works as hard as you do.',
    price: 'From $1,500 NZD',
    accent: '#185FA5',
    includes: [
      'Custom design & development',
      'Up to 5 pages',
      'Mobile responsive',
      'SEO foundations (meta, sitemap, OG)',
      'Contact form',
      '2 rounds of revisions',
      'Delivered in 2–3 weeks',
    ],
  },
  {
    name: 'Kaupeka Build',
    tagline: 'A full-stack product built to scale.',
    price: 'From $5,000 NZD',
    accent: '#1D9E75',
    includes: [
      'Full-stack web application',
      'Custom database & API',
      'User authentication',
      'Admin dashboard',
      'Scalable cloud infrastructure',
      '3 months post-launch support',
      'Timeline scoped per project',
    ],
  },
  {
    name: 'Kaupeka Grow',
    tagline: 'Your tech team, long-term.',
    price: 'From $500 / mo NZD',
    accent: '#EF9F27',
    includes: [
      'Ongoing feature development',
      'Bug fixes & maintenance',
      'Priority response time',
      'Monthly progress report',
      'Code reviews & performance audits',
      'Cancel anytime',
      'Minimum 3-month engagement',
    ],
  },
]

/* ── Process steps ───────────────────────────────────────── */
const steps = [
  {
    number: '01',
    title: 'Discovery',
    desc: 'We learn your goals, audience, and constraints. One focused call — no fluff.',
  },
  {
    number: '02',
    title: 'Design',
    desc: 'Wireframes and visual design signed off before a single line of code is written.',
  },
  {
    number: '03',
    title: 'Build',
    desc: 'Development with regular check-ins. You see progress, not just a final reveal.',
  },
  {
    number: '04',
    title: 'Launch',
    desc: 'Deploy, test, and hand over. You own everything — code, domain, accounts.',
  },
]

/* ── Service Card ────────────────────────────────────────── */
function ServiceCard({ name, tagline, price, accent, includes }) {
  return (
    <div
      className="flex flex-col p-8 rounded-2xl h-full"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Header */}
      <div className="mb-6">
        <div
          className="inline-block px-3 py-1 rounded-lg text-xs font-medium mb-4"
          style={{ background: `${accent}22`, color: accent }}
        >
          {name}
        </div>
        <h3 className="text-xl font-semibold text-white leading-snug">{tagline}</h3>
      </div>

      {/* Price */}
      <p className="text-2xl font-semibold mb-6" style={{ color: accent }}>{price}</p>

      {/* Divider */}
      <div className="mb-6" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />

      {/* Inclusions */}
      <ul className="flex flex-col gap-3 mb-8 flex-1">
        {includes.map(item => (
          <li key={item} className="flex items-start gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
            <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px]"
              style={{ background: `${accent}22`, color: accent }}>✓</span>
            {item}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        to="/contact"
        className="w-full text-center py-3 rounded-xl text-sm font-medium text-white transition-all hover:brightness-110"
        style={{ background: accent }}
      >
        Start a project →
      </Link>
    </div>
  )
}

/* ── Process Section ─────────────────────────────────────── */
function Process() {
  return (
    <section className="max-w-6xl mx-auto px-5 py-16 md:py-20">
      {/* Heading */}
      <div className="text-center mb-12">
        <div
          className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-medium mb-6"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' }}
        >
          How we work
        </div>
        <h2 className="text-3xl md:text-4xl font-semibold text-white">
          Simple process.<br />
          <span style={{ color: '#1D9E75' }}>No surprises.</span>
        </h2>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {steps.map(({ number, title, desc }, i) => (
          <div key={number} className="relative flex flex-col gap-4 p-6 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {/* Connector line (desktop) */}
            {i < steps.length - 1 && (
              <div className="hidden lg:block absolute top-10 left-full w-5 h-px z-10"
                style={{ background: 'rgba(255,255,255,0.12)' }} />
            )}
            <span className="text-3xl font-bold" style={{ color: 'rgba(255,255,255,0.08)' }}>{number}</span>
            <div>
              <h4 className="text-base font-semibold text-white mb-1">{title}</h4>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ── CTA Banner ──────────────────────────────────────────── */
function CTABanner() {
  return (
    <section className="max-w-6xl mx-auto px-5 pb-20">
      <div
        className="rounded-3xl px-8 py-14 flex flex-col md:flex-row items-center justify-between gap-6"
        style={{ background: 'rgba(24,95,165,0.9)', border: '1px solid rgba(255,255,255,0.10)' }}
      >
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold text-white">Not sure which fits?</h2>
          <p className="mt-2 text-base" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Tell us what you're building and we'll recommend the right fit.
          </p>
        </div>
        <Link
          to="/contact"
          className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-white transition-all hover:brightness-110"
          style={{ background: '#1D9E75' }}
        >
          Start a conversation →
        </Link>
      </div>
    </section>
  )
}

/* ── Page ────────────────────────────────────────────────── */
export default function Services() {
  return (
    <>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 pt-20 pb-12 md:pt-28">
        <div
          className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-medium mb-8"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' }}
        >
          Services
        </div>
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.08] tracking-tight text-white">
          Three ways to
        </h1>
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.08] tracking-tight" style={{ color: '#1D9E75' }}>
          work with us.
        </h1>
        <p className="mt-6 text-lg max-w-xl leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
          Whether you need a sharp new website, a full product build, or an ongoing tech partner — we've got a model that fits.
        </p>
      </section>

      {/* Service cards */}
      <section className="max-w-6xl mx-auto px-5 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {services.map(s => <ServiceCard key={s.name} {...s} />)}
        </div>
      </section>

      <Process />
      <CTABanner />
    </>
  )
}
