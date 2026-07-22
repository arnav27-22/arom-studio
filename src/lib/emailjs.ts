// EmailJS configuration
// IMPORTANT: These keys are inlined at build time and visible in the JS bundle.
// To prevent abuse, add domain restrictions in your EmailJS dashboard:
// https://dashboard.emailjs.com/admin/account/security
// Under "API Keys" → restrict your Public Key to your domains only.
export const EMAILJS_CONFIG = {
  SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID as string,
  TEMPLATE_ID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string,
  PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string,
}
