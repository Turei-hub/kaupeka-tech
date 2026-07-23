import { Link } from 'react-router-dom'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer
      className="mt-auto w-full"
      style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="max-w-6xl mx-auto px-5 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand */}
        <div className="flex flex-col gap-3">
          <Logo />
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Build sharp. Grow deep.
          </p>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Tāmaki Makaurau, Aotearoa New Zealand
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Navigate
          </p>
          {[
            { to: '/', label: 'Home' },
            { to: '/work', label: 'Work' },
            { to: '/services', label: 'Services' },
            { to: '/about', label: 'About' },
            { to: '/contact', label: 'Contact' },
          ].map(({ to, label }) => (
            <Link key={to} to={to} className="text-sm text-white/55 hover:text-white transition-colors w-fit">
              {label}
            </Link>
          ))}
        </div>

        {/* Contact */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Get in touch
          </p>
          <a href="mailto:hello@kaupekadigital.com" className="text-sm text-white/55 hover:text-white transition-colors w-fit">
            hello@kaupekadigital.com
          </a>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="max-w-6xl mx-auto px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-2"
        style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
      >
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
          © {new Date().getFullYear()} Kaupeka Tech Ltd. All rights reserved.
        </p>
        <p className="text-xs font-medium" style={{ color: '#1D9E75' }}>
          Nō konei. Built here.
        </p>
      </div>
    </footer>
  )
}
