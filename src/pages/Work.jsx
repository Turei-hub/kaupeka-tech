import { useState } from 'react'
import { Link } from 'react-router-dom'

const projects = [
  { id: 1, name: 'Tūhoe Digital',       type: 'Website',  year: '2025',    service: 'Kaupeka Web',   category: 'Websites',    image: '/card-tuhoe-digital.png',    accent: '#1D9E75' },
  { id: 2, name: 'Poutama Ventures',    type: 'SaaS',     year: '2025',    service: 'Kaupeka Build', category: 'SaaS / Build', image: '/card-poutama-ventures.png', accent: '#185FA5' },
  { id: 3, name: 'Ngāti Whātua Comms', type: 'Website',  year: '2024',    service: 'Kaupeka Web',   category: 'Websites',    image: '/card-ngati-whatua.png',     accent: '#EF9F27' },
  { id: 4, name: 'RuaFarm Co.',         type: 'Platform', year: '2024',    service: 'Kaupeka Build', category: 'SaaS / Build', image: '/card-ruafarm.png',          accent: '#1D9E75' },
  { id: 5, name: 'Āhuru Mōwai Trust',  type: 'Website',  year: '2024',    service: 'Kaupeka Web',   category: 'Websites',    image: '/card-ahuru-mowai.png',      accent: '#185FA5' },
  { id: 6, name: 'Kaupeka Internal',    type: 'Retainer', year: 'Ongoing', service: 'Kaupeka Grow',  category: 'Retainer',    image: '/card-kaupeka-internal.png', accent: '#EF9F27' },
]

const tabs = ['All', 'Websites', 'SaaS / Build', 'Retainer']

function ProjectCard({ name, type, year, service, image, accent }) {
  const tagBg      = `${accent}26`
  const arrowColor = `${accent}cc`

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden transition-all hover:translate-y-[-2px]"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Image area */}
      <div className="relative overflow-hidden">
        <img src={image} alt={name} className="w-full object-cover" />
        {/* Tag top-left */}
        <div
          className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1 rounded-xl"
          style={{ background: tagBg }}
        >
          <span className="text-[11px] font-medium" style={{ color: accent }}>{service}</span>
          <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.55)' }}>{year}</span>
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-col gap-3 p-5 pt-4">
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} className="pt-4">
          <h3 className="text-lg font-semibold text-white leading-snug">{name}</h3>
          <p className="text-[13px] mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>{type}</p>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[13px] font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>View case study</span>
          <span style={{ color: arrowColor }}>→</span>
        </div>
      </div>
    </div>
  )
}

function CTABanner() {
  return (
    <section className="max-w-6xl mx-auto px-5 pb-20">
      <div
        className="rounded-3xl px-8 py-14 flex flex-col md:flex-row items-center justify-between gap-6"
        style={{ background: 'rgba(24,95,165,0.9)', border: '1px solid rgba(255,255,255,0.10)' }}
      >
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold text-white">Have a project in mind?</h2>
          <p className="mt-2 text-base" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Let's talk. We respond within one business day.
          </p>
        </div>
        <Link
          to="/contact"
          className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-white transition-all hover:brightness-110"
          style={{ background: '#1D9E75' }}
        >
          Start a project →
        </Link>
      </div>
    </section>
  )
}

export default function Work() {
  const [active, setActive] = useState('All')

  const filtered = active === 'All'
    ? projects
    : projects.filter(p => p.category === active)

  return (
    <>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 pt-20 pb-10 md:pt-28">
        <div
          className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-medium mb-8"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' }}
        >
          Our Work
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.08] tracking-tight text-white">
          Projects that
        </h1>
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.08] tracking-tight" style={{ color: '#1D9E75' }}>
          speak for themselves.
        </h1>

        <p className="mt-6 text-lg max-w-xl leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
          Every project below is a real product built for a real client.<br />
          No filler, no lorem ipsum — just work we're proud of.
        </p>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mt-10">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className="px-4 py-2 rounded-lg text-[13px] font-medium transition-all"
              style={
                active === tab
                  ? { background: '#185FA5', color: '#fff' }
                  : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.08)' }
              }
            >
              {tab}
            </button>
          ))}
        </div>
      </section>

      {/* Cards grid */}
      <section className="max-w-6xl mx-auto px-5 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(p => <ProjectCard key={p.id} {...p} />)}
        </div>
      </section>

      <CTABanner />
    </>
  )
}
