const projects = [
  {
    name: 'Cultural AI Muse',
    category: 'AI · E-commerce',
    desc: 'Māori AI art brand website with user authentication, digital product sales, and AI-generated artwork. Built with a full Supabase backend and Stripe payments.',
    tech: ['React', 'Vite', 'Tailwind CSS', 'Supabase', 'Stripe'],
    url: 'https://cultural-ai-muse.vercel.app',
    color: '#1D9E75',
  },
  {
    name: '2 Little Leashes',
    category: 'Business · E-commerce',
    desc: 'Brand and online presence for a NZ small business, live on a custom .co.nz domain. Built with Next.js and TypeScript for performance and scalability.',
    tech: ['Next.js', 'TypeScript'],
    url: 'https://2littleleashes.co.nz',
    color: '#EF9F27',
  },
  {
    name: 'Jerrican Trust',
    category: 'Non-profit · Web',
    desc: 'Website for the Jerrican Trust. A clean, fast site built to represent the organisation and communicate their mission online.',
    tech: ['React', 'Vite', 'Tailwind CSS'],
    url: 'https://jerrican-trust.vercel.app',
    color: '#185FA5',
  },
  {
    name: 'TaskMate NZ',
    category: 'SaaS · Productivity',
    desc: 'Task management application built for NZ teams and small businesses. A focused tool designed to keep work organised and moving.',
    tech: ['React', 'Vite'],
    url: null,
    color: '#A855F7',
  },
]

function ExternalIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M5 2H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8M8 1h4m0 0v4m0-4L5.5 7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Work() {
  return (
    <main className="max-w-6xl mx-auto px-5 py-20">
      {/* Header */}
      <div className="text-center mb-12">
        <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Our work
        </p>
        <h1 className="text-4xl md:text-5xl font-semibold text-white">Projects we&apos;ve built</h1>
        <p className="mt-4 text-base max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.55)' }}>
          Real products, real clients. Here&apos;s a selection of what we&apos;ve shipped.
        </p>
      </div>

      {/* Project grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {projects.map(({ name, category, desc, tech, url, color }) => (
          <div
            key={name}
            className="flex flex-col gap-5 p-6 rounded-2xl transition-all hover:translate-y-[-2px]"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <span
                  className="inline-block text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full mb-2"
                  style={{ background: `${color}22`, color }}
                >
                  {category}
                </span>
                <h2 className="text-lg font-semibold text-white leading-snug">{name}</h2>
              </div>
              <div
                className="mt-1 w-3 h-3 rounded-full flex-shrink-0"
                style={{ background: color, boxShadow: `0 0 8px ${color}88` }}
              />
            </div>

            {/* Description */}
            <p className="text-sm leading-relaxed flex-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {desc}
            </p>

            {/* Tech tags */}
            <div className="flex flex-wrap gap-2">
              {tech.map((t) => (
                <span
                  key={t}
                  className="text-xs px-2.5 py-1 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}
                >
                  {t}
                </span>
              ))}
            </div>

            {/* Footer */}
            <div className="pt-1 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
              {url ? (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm transition-colors hover:text-white"
                  style={{ color }}
                >
                  View live site <ExternalIcon />
                </a>
              ) : (
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  In development
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-14 text-center">
        <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Want to be on this list?
        </p>
        <a
          href="/contact"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-white transition-all hover:brightness-110"
          style={{ background: '#1D9E75' }}
        >
          Start a project <ArrowIcon />
        </a>
      </div>
    </main>
  )
}
