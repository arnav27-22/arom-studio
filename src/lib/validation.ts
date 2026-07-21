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
  message?: string
}

export function validateContactForm(data: {
  name: string
  email: string
  message: string
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

  if (!validateRequired(data.message)) {
    errors.message = 'Message is required'
  } else if (data.message.trim().length < 10) {
    errors.message = 'Message must be at least 10 characters'
  }

  return errors
}
