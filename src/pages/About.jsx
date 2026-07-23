import { Link } from 'react-router-dom'

const values = [
  {
    title: 'Real work only.',
    desc: 'No filler projects, no lorem ipsum, no fake clients. Every line of code we ship is for a real product solving a real problem.',
    accent: '#185FA5',
  },
  {
    title: 'Built from scratch.',
    desc: "We don't bolt on templates and call it done. Every project is designed and built from the ground up to fit the client.",
    accent: '#1D9E75',
  },
  {
    title: 'Grounded in community.',
    desc: 'Kaupeka Digital was built with Māori organisations and NZ businesses in mind. We know what it means to work hard for something that matters.',
    accent: '#EF9F27',
  },
]

function Values() {
  return (
    <section className="max-w-6xl mx-auto px-5 py-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {values.map(({ title, desc, accent }) => (
          <div
            key={title}
            className="flex flex-col gap-4 p-7 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="w-2 h-2 rounded-full" style={{ background: accent }} />
            <h3 className="text-base font-semibold text-white">{title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>{desc}</p>
          </div>
        ))}
      </div>
    </section>
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
          <h2 className="text-2xl md:text-3xl font-semibold text-white">Want to work together?</h2>
          <p className="mt-2 text-base" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Tell us what you're building. We'll take it from there.
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

export default function About() {
  return (
    <>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 pt-20 pb-12 md:pt-28">
        <div
          className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-medium mb-8"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' }}
        >
          About
        </div>
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.08] tracking-tight text-white">
          Built from the<br />
          <span style={{ color: '#1D9E75' }}>ground up.</span>
        </h1>
      </section>

      {/* Founder story */}
      <section className="max-w-6xl mx-auto px-5 pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Left — the story */}
          <div className="flex flex-col gap-6">
            <p className="text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
              My name is <span className="text-white font-semibold">Turei Milner</span>. I spent 15 years in the bush as a logger, then another 10 in construction. Hard work, early mornings, and doing it properly — that's all I knew.
            </p>
            <p className="text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
              30 weeks ago I made the decision to change everything. I put down the tools and picked up a keyboard. I struggled through the long nights, the frustrating bugs, the moments where giving up felt easier. But I kept going — and now I'm building full-stack applications from scratch.
            </p>
            <p className="text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Kaupeka Digital is the result of that journey. Built by someone who knows what it means to work hard for something, and who refuses to ship anything less than quality.
            </p>

            {/* Pull quote */}
            <blockquote
              className="mt-2 pl-5 text-xl font-medium leading-snug"
              style={{ borderLeft: '3px solid #1D9E75', color: 'rgba(255,255,255,0.9)' }}
            >
              "From the bush to the browser — still building things that last."
            </blockquote>
          </div>

          {/* Right — identity card */}
          <div
            className="rounded-2xl p-8 flex flex-col gap-6"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
                style={{ background: '#185FA5' }}
              >
                T
              </div>
              <div>
                <p className="text-base font-semibold text-white">Turei Milner</p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>Founder & Developer</p>
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />

            {/* Details */}
            <div className="flex flex-col gap-4">
              {[
                { label: 'Based in', value: 'Tāmaki Makaurau, Auckland' },
                { label: 'From', value: 'Mangatu, Gisborne — Te Aitanga-a-Māhaki' },
                { label: 'Background', value: '15 yrs logging · 10 yrs construction · 30 weeks tech' },
                { label: 'Builds with', value: 'React, Node, Supabase, Tailwind, Vite' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</p>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The name */}
      <section className="max-w-6xl mx-auto px-5 py-16">
        <div
          className="rounded-2xl p-8 md:p-12"
          style={{ background: 'rgba(29,158,117,0.06)', border: '1px solid rgba(29,158,117,0.2)' }}
        >
          <p className="text-xs font-medium uppercase tracking-widest mb-4" style={{ color: '#1D9E75' }}>
            The name
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
            Why Kaupeka?
          </h2>
          <p className="text-lg leading-relaxed max-w-2xl" style={{ color: 'rgba(255,255,255,0.7)' }}>
            <span className="text-white font-medium">Kaupeka</span> is the Māori word for branch — a branch of a tree, an extension that carries life outward from the roots. It reflects who I am: a Māori man from Gisborne, proud of where I come from, growing into something new. When we build your website or product, we're adding a branch to your tree. You keep the roots. We help you reach further.
          </p>
        </div>
      </section>

      <Values />
      <CTABanner />
    </>
  )
}
