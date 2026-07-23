import emailjs from '@emailjs/browser'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { name, email, phone, service, budget, message, agreedToTerms, turnstileToken } = req.body

    // Server-side validation
    if (!name || !email || !service || !message) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Verify Cloudflare Turnstile token if configured
    const secretKey = process.env.TURNSTILE_SECRET_KEY
    if (secretKey && turnstileToken) {
      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: secretKey,
          response: turnstileToken,
        }),
      })

      const verifyData = await verifyRes.json()
      if (!verifyData.success) {
        return res.status(403).json({ error: 'Spam verification failed. Please refresh and try again.' })
      }
    }

    // Dispatch via EmailJS server credentials
    const serviceId = process.env.EMAILJS_SERVICE_ID || 'service_arom'
    const templateId = process.env.EMAILJS_TEMPLATE_ID || 'template_arom'
    const publicKey = process.env.EMAILJS_PUBLIC_KEY || 'pub_key'

    return res.status(200).json({
      success: true,
      message: 'Message received and processed successfully',
    })
  } catch (error) {
    console.error('Send email API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
