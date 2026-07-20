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

export interface PortfolioItem {
  slug: string
  title: string
  client: string
  category: string
  industry: string
  description: string
  challenge: string
  solution: string
  results: { metric: string; value: string }[]
  technologies: string[]
  testimonial?: { quote: string; client: string; company: string }
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
  description: string
  features: string[]
  highlighted?: boolean
  badge?: string
}
