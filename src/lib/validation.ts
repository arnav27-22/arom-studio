export function sanitize(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/['"]/g, '')
    .trim()
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validatePhone(phone: string): boolean {
  if (!phone) return true
  return /^[+]?[\d\s()-]{7,20}$/.test(phone)
}

export function validateRequired(value: string): boolean {
  return value.trim().length > 0
}

export function validateName(name: string): boolean {
  return /^[a-zA-Z\s'-]{2,60}$/.test(name.trim())
}

export interface ValidationErrors {
  name?: string
  email?: string
  phone?: string
  service?: string
  message?: string
  agreedToTerms?: string
}

export function validateContactForm(data: {
  name: string
  email: string
  phone: string
  service: string
  message: string
  agreedToTerms: boolean
}): ValidationErrors {
  const errors: ValidationErrors = {}

  if (!validateRequired(data.name)) {
    errors.name = 'Name is required'
  } else if (!validateName(data.name)) {
    errors.name = 'Please enter a valid name'
  }

  if (!validateRequired(data.email)) {
    errors.email = 'Email is required'
  } else if (!validateEmail(data.email)) {
    errors.email = 'Please enter a valid email'
  }

  if (data.phone && !validatePhone(data.phone)) {
    errors.phone = 'Please enter a valid phone number'
  }

  if (!validateRequired(data.service)) {
    errors.service = 'Please select a service'
  }

  if (!validateRequired(data.message)) {
    errors.message = 'Message is required'
  } else if (data.message.trim().length < 10) {
    errors.message = 'Message must be at least 10 characters'
  }

  if (!data.agreedToTerms) {
    errors.agreedToTerms = 'You must accept the Privacy Policy and Terms & Conditions'
  }

  return errors
}
