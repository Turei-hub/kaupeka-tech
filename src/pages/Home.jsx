import { Link } from 'react-router-dom'
import { useFadeIn } from '../hooks/useFadeIn'

/* ── Hero ────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="relative w-full pt-20 pb-16 md:pt-28 md:pb-24 text-center overflow-hidden">
      {/* Hero image — full bleed */}
      <div className="absolute inset-0" style={{ backgroundImage: 'url(/hero.png)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
      {/* Deep overlay */}
      <div className="absolute inset-0" style={{ background: 'rgba(11,18,32,0.78)' }} />

      {/* Content */}
      <div className="relative z-10 fade-up visible">
        {/* Kicker */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.8)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] animate-pulse" />
          Auckland, NZ — available for new projects
        </div>

        {/* H1 */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.08] tracking-tight text-white max-w-3xl mx-auto">
          We build the branch.<br />
          <span className="text-gradient-teal">You grow the tree.</span>
        </h1>

        {/* Subtext */}
        <p className="mt-6 text-base md:text-lg max-w-xl mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
          Kaupeka Digital is a studio building websites and SaaS products for NZ businesses,
          Māori organisations, and anyone who needs tech that actually works.
        </p>

        {/* CTAs */}
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/work"
            className="btn-shimmer inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110 hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #185FA5 0%, #1a6fc4 100%)', boxShadow: '0 0 24px rgba(24,95,165,0.45)' }}
          >
            See our work
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all"
            style={{ border: '1px solid rgba(255,255,255,0.18)' }}
          >
            How we work
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ── Social Proof Strip ──────────────────────────────────── */
const stats = [
  { value: '12+', label: 'Projects delivered', color: '#1D9E75' },
  { value: '5',   label: 'Live client sites',  color: '#185FA5' },
  { value: '100%', label: 'Real products, real clients', color: '#EF9F27' },
]
const avatars = ['RA', 'JT', 'ME', 'RY']
const avatarColors = ['#185FA5', '#1D9E75', '#EF9F27', '#185FA5']

function SocialProof() {
  const ref = useFadeIn(0)
  return (
    <section ref={ref} className="fade-up w-full py-6" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="max-w-6xl mx-auto px-5 flex items-center justify-center gap-12">
        {stats.map(({ value, label, color }) => (
          <div key={label} className="text-center">
            <p className="text-lg font-bold leading-none" style={{ color }}>{value}</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</p>
          </div>
        ))}
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
  const headingRef = useFadeIn(0)
  const card0 = useFadeIn(0)
  const card1 = useFadeIn(100)
  const card2 = useFadeIn(200)
  const cardRefs = [card0, card1, card2]
  return (
    <section className="max-w-6xl mx-auto px-5 py-16 md:py-20">
      <div ref={headingRef} className="fade-up text-center mb-10">
        <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
          What we offer
        </p>
        <h2 className="text-2xl md:text-3xl font-semibold text-white">Three ways to work with us</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {services.map(({ name, desc, price, icon, color }, i) => (
          <div
            ref={cardRefs[i]}
            key={name}
            className="card-hover fade-up flex flex-col gap-4 p-6 rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 32px ${color}33`; e.currentTarget.style.borderColor = `${color}55` }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}22`, color }}>
              {icon}
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">{name}</h3>
              <p className="text-sm mt-1 leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>{desc}</p>
            </div>
            <p className="text-sm font-semibold mt-auto" style={{ color }}>{price}</p>
          </div>
        ))}
      </div>

      <div className="text-center mt-8">
        <Link to="/services" className="inline-flex items-center gap-1.5 text-sm transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.55)' }}>
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
  const ref = useFadeIn(0)
  return (
    <section ref={ref} className="fade-up max-w-6xl mx-auto px-5 pb-20">
      <div
        className="relative rounded-3xl px-8 py-14 md:py-16 text-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0d3d6b 0%, #185FA5 50%, #1a6e52 100%)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 0 60px rgba(24,95,165,0.3)',
        }}
      >
        <div className="relative z-10">
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3">
            Ready to build something real?
          </h2>
          <p className="text-sm md:text-base mb-7" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Tell us about your project. We'll come back within one business day.
          </p>
          <Link
            to="/contact"
            className="btn-shimmer inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110 hover:scale-[1.02]"
            style={{ background: '#1D9E75', boxShadow: '0 0 20px rgba(29,158,117,0.5)' }}
          >
            Start a project
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
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
