import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Escape user-supplied text before inserting into HTML to prevent injection
const escapeHtml = (raw: string): string =>
  String(raw)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')

serve(async (req) => {
  try {
    const payload = await req.json()

    const record = payload.record
    if (!record) throw new Error("No database entry record payload caught.")

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) throw new Error("Missing cloud environment RESEND_API_KEY.")

    const safeName    = escapeHtml(record.name    ?? '')
    const safeSurname = escapeHtml(record.surname ?? '')
    const safeEmail   = escapeHtml(record.email   ?? '')
    const safeMessage = escapeHtml(record.message ?? '')

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'ASTÉRI2KStudio <studio@asteri2kstudio.com>',
        to: ['asteri2kstudio@gmail.com'],
        subject: `Studio Inquiry // From ${safeName.toUpperCase()} ${safeSurname.toUpperCase()}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #1a1a1a; max-width: 600px;">
            <h2 style="border-bottom: 1px solid #eaeaea; padding-bottom: 10px; letter-spacing: 1px;">NEW CONTACT FORM SUBMISSION</h2>
            <p style="margin: 15px 0;"><strong>Client Name:</strong> ${safeName} ${safeSurname}</p>
            <p style="margin: 15px 0;"><strong>Client Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
            <p style="margin: 25px 0 10px 0; font-weight: bold; letter-spacing: 0.5px;">MESSAGE CONTENT:</p>
            <div style="background-color: #f9f9f9; border-left: 3px solid #000000; padding: 15px; font-size: 0.95rem; line-height: 1.6; white-space: pre-wrap;">${safeMessage}</div>
            <p style="font-size: 0.75rem; color: #a0a0a0; margin-top: 40px; border-top: 1px solid #eaeaea; padding-top: 15px;">AUTOMATED DATA LOOP // ASTÉRI STUDIO SYSTEM 2026</p>
          </div>
        `
      })
    })

    const data = await response.json()
    return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  }
})
