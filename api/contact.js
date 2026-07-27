// Receives contact-form submissions and relays them via Brevo's transactional
// email API. Runs as a Vercel Node function, so BREVO_API_KEY never reaches the
// browser. Configure BREVO_API_KEY / CONTACT_TO / CONTACT_FROM in Vercel.

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email'

// hello@ is the sender because it is the address verified in Brevo. Mail is
// delivered to contact@ instead — both route into the same inbox via Cloudflare
// Email Routing, and keeping them distinct avoids Gmail treating the enquiry as
// a message you sent to yourself.
const FROM = process.env.CONTACT_FROM || 'hello@kaupekadigital.com'
const TO = process.env.CONTACT_TO || 'contact@kaupekadigital.com'

const MAX_LENGTHS = { name: 100, email: 200, projectType: 80, message: 5000 }
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// Mirrors the client-side rules, because the client can be bypassed entirely.
function validate({ name, email, projectType, message }) {
  if (!name) return 'Name is required.'
  if (!email) return 'Email is required.'
  if (!EMAIL_RE.test(email)) return 'Enter a valid email address.'
  if (!message) return 'Message is required.'

  for (const [field, limit] of Object.entries(MAX_LENGTHS)) {
    const value = { name, email, projectType, message }[field] || ''
    if (value.length > limit) return `${field} is too long (max ${limit} characters).`
  }
  return null
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed.' })
  }

  if (!process.env.BREVO_API_KEY) {
    console.error('contact: BREVO_API_KEY is not set')
    return res.status(500).json({ error: 'Contact form is not configured.' })
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body
  if (!body) return res.status(400).json({ error: 'Invalid request body.' })

  // Honeypot: a field hidden from real users, so anything in it is a bot.
  // Answer 200 so the bot has no signal that it was filtered.
  if (typeof body.company === 'string' && body.company.trim()) {
    return res.status(200).json({ ok: true })
  }

  const name = String(body.name || '').trim()
  const email = String(body.email || '').trim()
  const projectType = String(body.projectType || '').trim()
  const message = String(body.message || '').trim()

  const invalid = validate({ name, email, projectType, message })
  if (invalid) return res.status(400).json({ error: invalid })

  const lines = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Project type: ${projectType || '(not specified)'}`,
    '',
    message,
  ]

  const html = [
    `<p><strong>Name:</strong> ${escapeHtml(name)}</p>`,
    `<p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>`,
    `<p><strong>Project type:</strong> ${escapeHtml(projectType) || '(not specified)'}</p>`,
    `<hr>`,
    `<p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>`,
  ].join('')

  try {
    const brevo = await fetch(BREVO_ENDPOINT, {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { email: FROM, name: 'Kaupeka Digital Website' },
        to: [{ email: TO }],
        // Replying in Gmail goes straight back to the enquirer.
        replyTo: { email, name },
        subject: `New enquiry from ${name}`,
        textContent: lines.join('\n'),
        htmlContent: html,
      }),
    })

    if (!brevo.ok) {
      // Brevo's message can name the account or key — log it, don't return it.
      console.error('contact: Brevo rejected the send', brevo.status, await brevo.text())
      return res.status(502).json({ error: 'Could not send your message right now.' })
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('contact: request to Brevo failed', err)
    return res.status(502).json({ error: 'Could not send your message right now.' })
  }
}

function safeParse(raw) {
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}
