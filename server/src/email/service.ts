import { CONFIG } from '../config'
import { logger } from '../utils/logger'
import { enqueue } from '../jobs/worker'

interface EmailPayload {
  to: string
  subject: string
  html: string
  text?: string
  from?: string
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  const { to, subject, html, text, from } = payload

  if (!CONFIG.SMTP_HOST) {
    logger.warn('SMTP not configured, skipping email', { to, subject })
    return
  }

  try {
    const nodemailer = await import('nodemailer')
    const transporter = nodemailer.default.createTransport({
      host: CONFIG.SMTP_HOST,
      port: CONFIG.SMTP_PORT,
      secure: CONFIG.SMTP_PORT === 465,
      auth: {
        user: CONFIG.SMTP_USER,
        pass: CONFIG.SMTP_PASS,
      },
    })

    await transporter.sendMail({
      from: from || CONFIG.SMTP_FROM,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    })

    logger.debug('Email sent successfully', { to, subject })
  } catch (err) {
    logger.error('Failed to send email', { to, subject, error: (err as Error).message })
    throw err
  }
}

export async function sendEmailQueued(payload: EmailPayload): Promise<void> {
  await enqueue('email:send', payload)
}

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  await sendEmailQueued({
    to,
    subject: 'Welcome to AROM STUDIO',
    html: `<h1>Welcome, ${name}!</h1><p>Thank you for choosing AROM STUDIO.</p>`,
  })
}

export async function sendContactNotification(contact: {
  name: string; email: string; message: string; service?: string
}): Promise<void> {
  await sendEmailQueued({
    to: CONFIG.SMTP_FROM,
    subject: `New Contact Form Submission from ${contact.name}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${contact.name}</p>
      <p><strong>Email:</strong> ${contact.email}</p>
      <p><strong>Service:</strong> ${contact.service || 'General'}</p>
      <p><strong>Message:</strong> ${contact.message}</p>
    `,
  })
}

export async function sendInvoiceEmail(to: string, invoiceNumber: string, totalAmount: number): Promise<void> {
  await sendEmailQueued({
    to,
    subject: `Invoice ${invoiceNumber} from AROM STUDIO`,
    html: `
      <h2>Invoice ${invoiceNumber}</h2>
      <p>Your invoice for ${totalAmount.toFixed(2)} has been generated.</p>
      <p>Please check your client portal for details.</p>
    `,
  })
}

export async function sendProposalEmail(to: string, proposalTitle: string): Promise<void> {
  await sendEmailQueued({
    to,
    subject: `Proposal: ${proposalTitle} from AROM STUDIO`,
    html: `
      <h2>New Proposal</h2>
      <p>A new proposal "${proposalTitle}" has been created for you.</p>
      <p>Please check your client portal to review and respond.</p>
    `,
  })
}

export async function sendProjectUpdateEmail(to: string, projectName: string, update: string): Promise<void> {
  await sendEmailQueued({
    to,
    subject: `Update: ${projectName} - ${update}`,
    html: `<h2>Project Update</h2><p>${update}</p><p>View details in your client portal.</p>`,
  })
}
