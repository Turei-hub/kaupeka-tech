import { Link } from 'react-router-dom'

/* ── Hero ────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="max-w-6xl mx-auto px-5 pt-20 pb-16 md:pt-28 md:pb-24 text-center">
      {/* Kicker */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.7)' }}>
        <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] animate-pulse" />
        Auckland, NZ — available for new projects
      </div>

      {/* H1 */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.08] tracking-tight text-white max-w-3xl mx-auto">
        We build the branch.<br />
        <span style={{ color: '#1D9E75' }}>You grow the tree.</span>
      </h1>

      {/* Subtext */}
      <p className="mt-6 text-base md:text-lg max-w-xl mx-auto leading-relaxed"
        style={{ color: 'rgba(255,255,255,0.55)' }}>
        Kaupeka Tech is a digital studio building websites and SaaS products for NZ businesses,
        Māori organisations, and anyone who needs tech that actually works.
      </p>

      {/* CTAs */}
      <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          to="/work"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-white transition-all hover:brightness-110"
          style={{ background: '#185FA5' }}
        >
          See our work
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <Link
          to="/services"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-white/80 hover:text-white transition-colors"
          style={{ border: '1px solid rgba(255,255,255,0.14)' }}
        >
          How we work
        </Link>
      </div>
    </section>
  )
}

/* ── Social Proof Strip ──────────────────────────────────── */
const stats = [
  { value: '12+', label: 'Projects delivered' },
  { value: '5', label: 'Live client sites' },
  { value: '100%', label: 'Real products, real clients' },
]

const avatars = ['RA', 'JT', 'ME', 'RY']
const avatarColors = ['#185FA5', '#1D9E75', '#EF9F27', '#185FA5']

function SocialProof() {
  return (
    <section
      className="w-full py-6"
      style={{ borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Avatar stack + label */}
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {avatars.map((initials, i) => (
              <div
                key={initials}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-semibold text-white ring-2"
                style={{ background: avatarColors[i], ringColor: '#0B1220' }}
              >
                {initials}
              </div>
            ))}
          </div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Trusted by NZ businesses & Māori organisations
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-8">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-lg font-semibold text-white leading-none">{value}</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Services Strip ──────────────────────────────────────── */
const services = [
  {
    name: 'Kaupeka Web',
    desc: 'Bespoke websites crafted for performance, brand, and conversion.',
    price: 'From $1,500 NZD',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="4" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2 8h18" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="5.5" cy="6" r="0.75" fill="currentColor" />
        <circle cx="8.5" cy="6" r="0.75" fill="currentColor" />
      </svg>
    ),
    color: '#185FA5',
  },
  {
    name: 'Kaupeka Build',
    desc: 'Full-stack platforms & SaaS products built to scale.',
    price: 'From $5,000 NZD',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M6 8l-4 3 4 3M16 8l4 3-4 3M13 5l-4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    color: '#1D9E75',
  },
  {
    name: 'Kaupeka Grow',
    desc: 'Ongoing retainer — your tech team, long-term.',
    price: 'From $500/mo NZD',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M3 17c2-4 4-6 6-5s3 4 5 4 3-2 5-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    color: '#EF9F27',
  },
]

function ServicesStrip() {
  return (
    <section className="max-w-6xl mx-auto px-5 py-16 md:py-20">
      <div className="text-center mb-10">
        <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
          What we offer
        </p>
        <h2 className="text-2xl md:text-3xl font-semibold text-white">Three ways to work with us</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {services.map(({ name, desc, price, icon, color }) => (
          <div
            key={name}
            className="flex flex-col gap-4 p-6 rounded-2xl transition-all hover:translate-y-[-2px]"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${color}22`, color }}
            >
              {icon}
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">{name}</h3>
              <p className="text-sm mt-1 leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>{desc}</p>
            </div>
            <p className="text-sm font-medium mt-auto" style={{ color }}>
              {price}
            </p>
          </div>
        ))}
      </div>

      <div className="text-center mt-8">
        <Link
          to="/services"
          className="inline-flex items-center gap-1.5 text-sm transition-colors hover:text-white"
          style={{ color: 'rgba(255,255,255,0.55)' }}
        >
          See full service breakdown
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </section>
  )
}

/* ── CTA Banner ──────────────────────────────────────────── */
function CTABanner() {
  return (
    <section className="max-w-6xl mx-auto px-5 pb-20">
      <div
        className="rounded-2xl px-8 py-12 md:py-16 text-center"
        style={{ background: 'linear-gradient(135deg, #185FA5 0%, #0d3d6b 100%)', border: '1px solid rgba(255,255,255,0.12)' }}
      >
        <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3">
          Ready to build something real?
        </h2>
        <p className="text-sm md:text-base mb-7" style={{ color: 'rgba(255,255,255,0.7)' }}>
          Tell us about your project. We'll come back within one business day.
        </p>
        <Link
          to="/contact"
          className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-medium text-white transition-all hover:brightness-110"
          style={{ background: '#1D9E75' }}
        >
          Start a project
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </section>
  )
}

/* ── Page ────────────────────────────────────────────────── */
export default function Home() {
  return (
    <>
      <Hero />
      <SocialProof />
      <ServicesStrip />
      <CTABanner />
    </>
  )
}
