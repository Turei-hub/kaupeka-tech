import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SITE = 'https://kaupekadigital.com'

const DEFAULT_DESC =
  'Kaupeka Digital is a New Zealand digital studio building websites and SaaS products for NZ businesses, Māori organisations, and anyone who needs tech that actually works.'

const META = {
  '/': {
    title: 'Kaupeka Digital — Websites & SaaS for NZ businesses',
    description: DEFAULT_DESC,
  },
  '/work': {
    title: 'Our work — Kaupeka Digital',
    description:
      'Real products for real clients — websites and SaaS platforms Kaupeka Digital has built for NZ businesses and Māori organisations.',
  },
  '/services': {
    title: 'Services — Kaupeka Digital',
    description:
      'Kaupeka Web, Build and Grow — bespoke websites, full-stack SaaS products, and ongoing retainers for NZ businesses and Māori organisations.',
  },
  '/about': {
    title: 'About — Kaupeka Digital',
    description:
      'Kaupeka Digital is led by Turei Milner, a Māori developer from Gisborne building websites and SaaS for NZ businesses and Māori organisations.',
  },
  '/contact': {
    title: 'Contact — Kaupeka Digital',
    description:
      'Tell us about your project. Kaupeka Digital responds within one business day — no automated replies, just Turei.',
  },
}

function upsertMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

export default function Seo() {
  const { pathname } = useLocation()

  useEffect(() => {
    const meta = META[pathname] || META['/']
    const url = SITE + (pathname === '/' ? '/' : pathname)

    document.title = meta.title
    upsertMeta('name', 'description', meta.description)
    upsertCanonical(url)

    upsertMeta('property', 'og:title', meta.title)
    upsertMeta('property', 'og:description', meta.description)
    upsertMeta('property', 'og:url', url)
    upsertMeta('name', 'twitter:title', meta.title)
    upsertMeta('name', 'twitter:description', meta.description)
  }, [pathname])

  return null
}
