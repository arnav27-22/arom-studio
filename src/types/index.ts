export interface Service {
  slug: string
  title: string
  description: string
  longDescription?: string
  icon: string
  features: string[]
  process: { step: number; title: string; description: string }[]
  faqs: { question: string; answer: string }[]
  techTags?: string[]
  idealFor?: string
}

export interface Testimonial {
  id: number
  quote: string
  client: string
  company: string
  rating: number
}

export interface Plan {
  name: string
  price: string
  description: string
  features: string[]
  highlighted?: boolean
  badge?: string
}
