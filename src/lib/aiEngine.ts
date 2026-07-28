// AROM AI — INTELLIGENT REASONING & RESPONSE ENGINE (Version 5.0)
import type { AiKnowledgeItem } from '../types/ai'
import type { AiContext } from './aiStore'
import type { AiProjectPhase } from './aiStore'
export type { AiKnowledgeItem }

export const REASONING_ENGINE_PROMPT_V5 = `
# ============================================================
# AROM AI - INTELLIGENT REASONING & RESPONSE ENGINE v5.0
# ============================================================
You are AROM AI, the official AI assistant of AROM STUDIO.
Your mission is to act as an expert digital consultant: explain WHY, explain BENEFITS, explain PROCESS, and guide NEXT STEPS.
Never copy website paragraphs verbatim. Reason, synthesize, and respond naturally.
`

export interface AiResponse {
  text: string
  followUps: string[]
  context: AiContext
}

export function createDefaultContext(): AiContext {
  return {
    language: 'en',
    discussedTopics: [],
  }
}

// Language detection
function detectLanguage(text: string): 'en' | 'mr' | 'hi' {
  const mrPattern = /[ािीुूेैोौंअआइईउऊएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह]/u
  const hiPattern = /[अआइईउऊएऐओऔकखगघचछजझटठडढणतथदधनपफबभमयरलवशषसहािीुूेैोौं]/u
  const mrCount = (text.match(mrPattern) || []).length
  const hiCount = (text.match(hiPattern) || []).length
  if (mrCount > hiCount && mrCount > 2) return 'mr'
  if (hiCount > 2) return 'hi'
  return 'en'
}

// Name extraction patterns
const NAME_PATTERNS = [
  /(?:my name is|i'm|i am|call me|myself|this is)\s+(\w+)/i,
  /name[:\s]*(\w+)/i,
  /(\w+)\s+(?:here|speaking)/i,
]

function extractName(text: string): string | null {
  const normalized = text.toLowerCase().trim()
  for (const pattern of NAME_PATTERNS) {
    const match = normalized.match(pattern)
    if (match && match[1].length > 1) {
      return match[1].charAt(0).toUpperCase() + match[1].slice(1)
    }
  }
  return null
}

// Budget extraction
const BUDGET_PATTERNS = [
  /(?:budget|around|approximately|roughly|about)\s*(?:is|of|:)?\s*(?:₹|rs\.?|inr)?\s*([\d,]+(?:,\d{3})*(?:\.\d+)?)/i,
  /(?:₹|rs\.?|inr)\s*([\d,]+(?:,\d{3})*(?:\.\d+)?)/i,
]

function extractBudget(text: string): string | null {
  for (const pattern of BUDGET_PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      const num = match[1].replace(/,/g, '')
      if (parseInt(num) > 1000) return `₹${match[1]}`
    }
  }
  return null
}

// Timeline extraction
const TIMELINE_PATTERNS = [
  /(?:timeline|deadline|need it by|want it by|need by|by when|how soon|urgent|asap|quickly|fast|speed)/i,
  /(\d+)\s*(week|month|day|year)s?/i,
]

function extractTimeline(text: string): string | null {
  const lower = text.toLowerCase()
  if (/\b(asap|urgent|immediately|right away)\b/i.test(lower)) return 'ASAP'
  if (/\b(quick|fast|speed)\b/i.test(lower)) return 'Quick (1-2 weeks)'
  const match = text.match(TIMELINE_PATTERNS[1])
  if (match) return `${match[1]} ${match[2]}${parseInt(match[1]) > 1 ? 's' : ''}`
  return null
}

function extractPackage(text: string): string | null {
  const lower = text.toLowerCase()
  if (/\b(premium|enterprise|unlimited)\b/i.test(lower)) return 'Premium / Enterprise'
  if (/\b(business|growth|advanced|ecommerce)\b/i.test(lower)) return 'Business'
  if (/\b(professional|pro|standard|popular)\b/i.test(lower)) return 'Professional'
  if (/\b(starter|basic|small|simple)\b/i.test(lower)) return 'Starter'
  return null
}

function extractCompany(text: string): string | null {
  const patterns = [
    /(?:my company|my business|my firm|i run|i own|we are)\s+(?:is|are|called)?\s*([A-Za-z0-9\s&]+?)(?:\.|,|and|which|that|in|for|we|i\s|$)/i,
    /(?:company|business|firm|studio|agency|brand)\s*(?:name)?\s*(?:is)?\s*:?\s*([A-Za-z0-9\s&]+?)(?:\.|,|$)/i,
  ]
  for (const p of patterns) {
    const m = text.match(p)
    if (m && m[1].trim().length > 1) return m[1].trim()
  }
  return null
}

function extractCountry(text: string): string | null {
  const countries: Record<string, string> = {
    india: 'India', usa: 'USA', america: 'USA', 'united states': 'USA',
    uk: 'UK', 'united kingdom': 'UK', canada: 'Canada', australia: 'Australia',
    dubai: 'UAE', uae: 'UAE', germany: 'Germany', singapore: 'Singapore',
    japan: 'Japan', china: 'China', brazil: 'Brazil', 'saudi arabia': 'Saudi Arabia',
  }
  const lower = text.toLowerCase()
  for (const [key, val] of Object.entries(countries)) {
    if (lower.includes(key)) return val
  }
  return null
}

function extractTargetAudience(text: string): string | null {
  const patterns = [
    /(?:target|audience|customer|client|visitor|user)\s*(?:is|are|audience)?\s*:?\s*([A-Za-z0-9\s&]+?)(?:\.|,|$)/i,
    /(?:for|serving|helping|catering to)\s+([A-Za-z0-9\s&]+?)(?:\.|,|and|which|who|in|$)/i,
  ]
  for (const p of patterns) {
    const m = text.match(p)
    if (m && m[1].trim().length > 2) return m[1].trim()
  }
  return null
}

function extractDesignStyle(text: string): string | null {
  const styles: Record<string, string> = {
    'modern': 'Modern',
    'minimal': 'Minimal',
    'dark': 'Dark',
    'glass': 'Glassmorphic',
    'luxury': 'Luxury',
    'creative': 'Creative',
    'corporate': 'Corporate',
    'colorful': 'Colorful',
    'elegant': 'Elegant',
    'playful': 'Playful',
    'simple': 'Simple',
    'clean': 'Clean',
  }
  const lower = text.toLowerCase()
  for (const [key, val] of Object.entries(styles)) {
    if (lower.includes(key)) return val
  }
  return null
}

function extractFeatures(text: string): string[] {
  const found: string[] = []
  const featurePatterns = [
    /(?:need|need a|needs|require|requires|want|wants|looking for|add|include|with)\s+([A-Za-z0-9\s]+?)(?:\.|,|and|also|$)/gi,
  ]
  for (const p of featurePatterns) {
    let m: RegExpExecArray | null
    while ((m = p.exec(text)) !== null) {
      const f = m[1].trim().toLowerCase()
      if (f.length > 2 && f.length < 40) found.push(f)
    }
  }
  const knownFeatures = ['booking', 'payment', 'chat', 'login', 'dashboard', 'cms', 'blog', 'gallery',
    'cart', 'search', 'filter', 'review', 'rating', 'notification', 'email', 'api']
  return found.filter(f => knownFeatures.some(k => f.includes(k)))
}

function extractContactMethod(text: string): string | null {
  const lower = text.toLowerCase()
  if (/\b(email|e-?mail)\b/i.test(lower)) return 'Email'
  if (/\b(phone|call|telephone)\b/i.test(lower)) return 'Phone'
  if (/\b(whatsapp|wa)\b/i.test(lower)) return 'WhatsApp'
  if (/\b(sms|text|message)\b/i.test(lower)) return 'SMS'
  return null
}

function extractMeetingInfo(text: string): { date?: string; time?: string; purpose?: string } | null {
  const lower = text.toLowerCase()
  if (!/\b(meeting|schedule|book|call|consultation|discuss)\b/i.test(lower)) return null
  const result: { date?: string; time?: string; purpose?: string } = {}
  const dateMatch = lower.match(/(?:on|at|this)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|today)/i)
  if (dateMatch) result.date = dateMatch[1]
  const timeMatch = lower.match(/(\d{1,2})\s*(?::(\d{2}))?\s*(am|pm)/i)
  if (timeMatch) result.time = `${timeMatch[1]}${timeMatch[2] ? ':' + timeMatch[2] : ''} ${timeMatch[3]}`
  const purposeMatch = lower.match(/(?:about|regarding|discuss|talk about)\s+([A-Za-z0-9\s]+?)(?:\.|,|$)/i)
  if (purposeMatch) result.purpose = purposeMatch[1].trim()
  return Object.keys(result).length > 0 ? result : null
}

export function calculateLeadScore(context: AiContext): number {
  let score = 0
  if (context.userName) score += 10
  if (context.email) score += 5
  if (context.phone) score += 5
  if (context.businessName) score += 10
  if (context.projectType) score += 15
  if (context.budget) score += 15
  if (context.timeline) score += 10
  if (context.preferredPackage) score += 10
  if (context.country) score += 5
  if (context.targetAudience) score += 5
  if (context.preferredDesignStyle) score += 5
  if (context.needsSEO) score += 5
  if (context.needsMaintenance) score += 5
  if (context.discussedTopics.length >= 3) score += 5
  if (context.proposalRequested) score += 10
  if (context.meetingRequested) score += 5
  if (context.currentPhase?.phase === 'proposal') score += 15
  if (context.currentPhase?.phase === 'agreement') score += 20
  if (context.currentPhase?.phase === 'development') score += 25
  if (context.currentPhase?.phase === 'handover') score += 30
  return Math.min(score, 100)
}

export function generateConversationTags(context: AiContext): string[] {
  const tags: string[] = []
  if (context.userName) tags.push('New Lead')
  if (context.proposalRequested) tags.push('Proposal')
  if (context.agreementSigned) tags.push('Agreement')
  if (context.meetingRequested) tags.push('Meeting Request')
  if (context.discoveryStarted) tags.push('Discovery')
  if (context.contentCollectionStarted) tags.push('Content Collection')
  if (context.projectType === 'ecommerce') tags.push('E-commerce')
  if (context.preferredPackage === 'Premium / Enterprise') tags.push('Enterprise')
  if (context.needsSEO) tags.push('SEO')
  if (context.needsMaintenance) tags.push('Support')
  if (context.discussedTopics.includes('Portfolio')) tags.push('Portfolio')
  if (context.discussedTopics.includes('Pricing') && !context.budget) tags.push('Pricing')
  if (context.budget && parseInt(context.budget.replace(/[^0-9]/g, '')) > 60000) tags.push('High Value Lead')
  const score = calculateLeadScore(context)
  if (score >= 50) { if (!tags.includes('High Value Lead')) tags.push('High Value Lead') }
  return [...new Set(tags)]
}

/**
 * AiContextManager — tracks conversation state, name, language, topics, budget, timeline, package, and generates summaries
 */
export class AiContextManager {
  private context: AiContext

  constructor(existingContext?: AiContext) {
    this.context = existingContext ? { ...existingContext } : createDefaultContext()
  }

  getContext(): AiContext {
    return { ...this.context }
  }

  setPhase(phase: AiProjectPhase['phase']): void {
    const now = new Date().toISOString()
    const current = this.context.currentPhase
    if (current && current.phase === phase) return
    if (current && current.phase !== phase) {
      current.completedAt = now
    }
    this.context.currentPhase = { phase, enteredAt: now }
  }

  updateFromUserMessage(text: string): void {
    const detectedLang = detectLanguage(text)
    if (this.context.language === 'en' && detectedLang !== 'en') {
      this.context.language = detectedLang
    }

    const name = extractName(text)
    if (name && !this.context.userName) {
      this.context.userName = name
    }

    const budget = extractBudget(text)
    if (budget && !this.context.budget) {
      this.context.budget = budget
    }

    const timeline = extractTimeline(text)
    if (timeline && !this.context.timeline) {
      this.context.timeline = timeline
    }

    const pkg = extractPackage(text)
    if (pkg && !this.context.preferredPackage) {
      this.context.preferredPackage = pkg
    }

    const company = extractCompany(text)
    if (company && !this.context.businessName) {
      this.context.businessName = company
    }

    const country = extractCountry(text)
    if (country && !this.context.country) {
      this.context.country = country
    }

    const audience = extractTargetAudience(text)
    if (audience && !this.context.targetAudience) {
      this.context.targetAudience = audience
    }

    const design = extractDesignStyle(text)
    if (design && !this.context.preferredDesignStyle) {
      this.context.preferredDesignStyle = design
    }

    const contactMethod = extractContactMethod(text)
    if (contactMethod && !this.context.preferredContactMethod) {
      this.context.preferredContactMethod = contactMethod
    }

    const meetingInfo = extractMeetingInfo(text)
    if (meetingInfo) {
      this.context.meetingRequested = true
      if (meetingInfo.date && !this.context.meetingDate) this.context.meetingDate = meetingInfo.date
      if (meetingInfo.time && !this.context.meetingTime) this.context.meetingTime = meetingInfo.time
      if (meetingInfo.purpose && !this.context.meetingPurpose) this.context.meetingPurpose = meetingInfo.purpose
    }

    const features = extractFeatures(text)
    if (features.length > 0) {
      this.context.features = [...new Set([...(this.context.features || []), ...features])]
    }

    if (/\b(email|e-?mail)\b/i.test(text)) {
      const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
      if (emailMatch && !this.context.email) this.context.email = emailMatch[0]
    }

    if (/\b(phone|mobile|whatsapp|call)\b/i.test(text)) {
      const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)
      if (phoneMatch && !this.context.phone) this.context.phone = phoneMatch[0]
    }

    const projectIndicators = [
      { type: 'gym', words: ['gym', 'fitness', 'workout', 'trainer', 'crossfit', 'health club'] },
      { type: 'restaurant', words: ['restaurant', 'food', 'cafe', 'dining', 'bakery', 'cloud kitchen'] },
      { type: 'clinic', words: ['doctor', 'clinic', 'hospital', 'dental', 'healthcare', 'medical', 'ayurvedic'] },
      { type: 'ecommerce', words: ['clothing', 'clothes', 'store', 'shop', 'sell online', 'ecommerce', 'fashion', 'products', 'retail'] },
      { type: 'portfolio', words: ['portfolio', 'showcase', 'gallery', 'photography'] },
      { type: 'saas', words: ['saas', 'web app', 'application', 'platform', 'software'] },
      { type: 'blog', words: ['blog', 'magazine', 'news', 'content', 'articles'] },
      { type: 'realestate', words: ['real estate', 'property', 'builder', 'construction'] },
    ]

    const lower = text.toLowerCase()
    for (const indicator of projectIndicators) {
      if (indicator.words.some(w => lower.includes(w))) {
        this.context.projectType = indicator.type
        break
      }
    }

    if (lower.includes('seo') && !this.context.needsSEO) this.context.needsSEO = true
    if (/\b(maintenance|support|maintain|update)/i.test(lower) && !this.context.needsMaintenance) this.context.needsMaintenance = true
    if (/\b(proposal|quote|estimat)/i.test(lower)) { this.context.proposalRequested = true; this.setPhase('proposal') }
    if (/\b(agreement|sign|contract)/i.test(lower)) { this.context.agreementSigned = true; this.setPhase('agreement') }
    if (/\b(discovery|questionnaire|form)/i.test(lower)) this.context.discoveryStarted = true
    if (/\b(logo|brand|color|font|image|photo|video|content|asset)/i.test(lower)) this.context.contentCollectionStarted = true

    const topicKeywords: Record<string, string[]> = {
      'Pricing': ['price', 'cost', 'pricing', 'package', 'plan', 'budget', 'rupees', '₹', 'money', 'afford'],
      'Services': ['service', 'offer', 'build', 'develop', 'create', 'capabilities'],
      'Process': ['process', 'timeline', 'long', 'duration', 'week', 'month', 'step', 'stage'],
      'Technologies': ['technology', 'tech', 'stack', 'react', 'next.js', 'node', 'typescript', 'framework'],
      'Portfolio': ['portfolio', 'past work', 'example', 'client', 'project', 'showcase'],
      'Support': ['support', 'maintenance', 'warranty', 'help', 'update', 'fix'],
      'SEO': ['seo', 'ranking', 'google', 'search', 'traffic', 'visibility'],
      'AI': ['ai', 'chatbot', 'automation', 'intelligence', 'machine learning'],
      'Hosting': ['hosting', 'host', 'server', 'domain', 'deploy', 'live'],
      'Design': ['design', 'ui', 'ux', 'figma', 'prototype', 'mockup', 'wireframe', 'interface'],
    }

    const lowerText = text.toLowerCase()
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(kw => lowerText.includes(kw))) {
        if (!this.context.discussedTopics.includes(topic)) {
          this.context.discussedTopics.push(topic)
        }
      }
    }

    this.context.lastQuestion = text
  }

  generateSummary(): string {
    const parts: string[] = []
    const ctx = this.context
    if (ctx.userName) parts.push(`User: ${ctx.userName}`)
    if (ctx.businessName) parts.push(`Business: ${ctx.businessName}`)
    if (ctx.projectType) parts.push(`Project: ${ctx.projectType} website`)
    if (ctx.preferredPackage) parts.push(`Package: ${ctx.preferredPackage}`)
    if (ctx.budget) parts.push(`Budget: ${ctx.budget}`)
    if (ctx.timeline) parts.push(`Timeline: ${ctx.timeline}`)
    if (ctx.country) parts.push(`Country: ${ctx.country}`)
    if (ctx.targetAudience) parts.push(`Audience: ${ctx.targetAudience}`)
    if (ctx.discussedTopics.length > 0) parts.push(`Discussed: ${ctx.discussedTopics.join(', ')}`)
    if (ctx.needsSEO) parts.push('Needs SEO')
    if (ctx.needsMaintenance) parts.push('Needs Maintenance')
    if (ctx.proposalRequested) parts.push('Proposal requested')
    if (ctx.meetingRequested) parts.push('Meeting requested')
    if (ctx.features && ctx.features.length > 0) parts.push(`Features: ${ctx.features.join(', ')}`)
    return parts.join(' | ')
  }

  greetMessage(): string {
    const name = this.context.userName
    const lang = this.context.language
    const phase = this.context.currentPhase?.phase

    if (lang === 'mr') {
      return `नमस्कार${name ? ' ' + name : ''}! मी AROM AI आहे, AROM STUDIO चा डिजिटल कन्सल्टंट.\n\nतुमच्या प्रकल्पाबद्दल बोलूया. तुम्ही कोणत्या प्रकारची वेबसाइट बनवू इच्छिता?`
    }
    if (lang === 'hi') {
      return `नमस्ते${name ? ' ' + name : ''}! मैं AROM AI हूँ, AROM STUDIO का डिजिटल कंसल्टेंट.\n\nआपके प्रोजेक्ट के बारे में बात करते हैं। आप किस तरह की वेबसाइट बनाना चाहते हैं?`
    }

    if (name && this.context.discussedTopics.length === 0) {
      const summary = this.context.conversationSummary
      if (summary) {
        return `Welcome back, ${name}. I remember our last conversation — ${summary}\n\nHow would you like to move forward with your project today?`
      }
      return `Welcome back, ${name}. Good to see you again. What's the next step for your project?`
    }

    if (phase === 'proposal') {
      return `Hi${name ? ' ' + name : ''}. Based on our discussion, I can prepare a detailed proposal for you. Could you confirm your email address so I can send it over?`
    }
    if (phase === 'agreement') {
      return `Hi${name ? ' ' + name : ''}. Ready to move forward with the agreement? I just need a few details to get it drafted.`
    }

    return `Hi${name ? ' ' + name : ''}. I'm your project consultant at AROM STUDIO. I can help you plan your website, recommend the right package, and guide you through the entire process. What type of project are you working on?`
  }
}

export function generateConversationSummary(messages: { sender: string; text: string }[], context: AiContext): string {
  const ctxMgr = new AiContextManager(context)
  for (const msg of messages) {
    if (msg.sender === 'user') ctxMgr.updateFromUserMessage(msg.text)
  }
  return ctxMgr.generateSummary()
}

export const INITIAL_AI_KNOWLEDGE: AiKnowledgeItem[] = [
  {
    id: 'k_comp_1',
    category: 'Company',
    title: 'Company Overview & Mission',
    question: 'Who is AROM STUDIO and what is your mission?',
    alternateQuestions: ['Tell me about AROM STUDIO', 'What is AROM STUDIO?', 'Who owns AROM STUDIO?', 'Explain your company'],
    synonyms: ['agency', 'studio', 'web engineering firm', 'firm'],
    keywords: ['founder', 'arnav', 'mission', 'about', 'company', 'guarantee', 'ownership', 'who', 'overview'],
    description: 'Overview of AROM STUDIO agency founded by Arnav Pagare.',
    detailedAnswer: `### About AROM STUDIO
AROM STUDIO is a modern, high-performance web design and software development agency founded by **Arnav Pagare** (Founder & Lead Engineer). 

Our mission is to redefine the modern web agency experience by engineering ultra-fast, visually stunning, and high-converting web applications.

- **100/100 Core Web Vitals Guarantee**: Sub-second load times, LCP < 1.2s, CLS = 0.00.
- **100% Source Code Ownership**: You retain 100% ownership of your code, designs, and hosting upon final payment.
- **1 Year Warranty & Support**: All projects include 1 full year of support and maintenance coverage.`,
    shortAnswer: 'AROM STUDIO is a high-performance web development agency founded by Arnav Pagare offering 100/100 Core Web Vitals guarantee and 1-year warranty.',
    relatedTopics: ['Founder', 'Services', 'Pricing'],
    navigationLinks: ['/about'],
    tags: ['company', 'about', 'arnav', 'mission'],
    priority: 10,
    language: 'en',
    version: '1.0',
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: 'Arnav Pagare',
    source: 'AROM STUDIO Official Document',
  },
  {
    id: 'k_price_1',
    category: 'Pricing',
    title: 'Transparent Pricing Packages',
    question: 'What is your pricing structure and available packages?',
    alternateQuestions: ['How much does a website cost?', 'Website pricing?', 'Plans?', 'Packages?', 'Price list?', 'Cost?', 'Quotation?'],
    synonyms: ['cost', 'rates', 'fees', 'budget', 'packages', 'plans', 'estimate'],
    keywords: ['cost', 'price', 'pricing', 'package', 'plan', 'starter', 'professional', 'business', 'premium', 'enterprise', 'rate', 'budget', 'estimate', 'quotation'],
    description: 'Itemized 5-tier pricing packages from Starter to Enterprise.',
    detailedAnswer: `### Transparent Pricing Tiers
We offer 5 clear pricing packages tailored to your business scale:

1. **Starter Website — ₹15,999+**
   - 1 to 5 Pages, Responsive Design, Basic SEO, Contact Form, Analytics, 1 Year Support.
2. **Professional Website (Most Popular) — ₹32,999+**
   - Up to 10 Pages, Custom UI/UX, On-Page SEO, WhatsApp Integration, Free Domain (1 Year T&C), 1 Year Support.
3. **Business Website — ₹59,999+**
   - Up to 20 Pages, Custom Premium Design System, Advanced SEO, CMS Integration, E-commerce/Booking System, API Integrations, 1 Year Support.
4. **Premium Website — ₹1,00,999+**
   - Unlimited Pages, Full Custom Design & Branding, Advanced GSAP/Framer Animations, Web App Features, AI Features, Lighthouse 95+ Score, 1 Year Support.
5. **Enterprise Solution — ₹1,27,000+**
   - Custom Full-Stack Architecture, Dedicated Project Manager, SLA-Backed Support, Priority Response, Monthly Performance Reports, Team Training.

**Payment Schedule**: 50% Advance Deposit to begin work, 50% Final Payment upon completion before production launch.`,
    shortAnswer: 'Packages start from ₹15,999+ (Starter) to ₹1,27,000+ (Enterprise) with a 50/50 payment terms.',
    relatedTopics: ['Services', 'Process', 'Policies'],
    navigationLinks: ['/pricing'],
    tags: ['pricing', 'plans', 'cost', 'packages'],
    priority: 10,
    language: 'en',
    version: '1.0',
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: 'Arnav Pagare',
    source: 'AROM STUDIO Official Document',
  },
  {
    id: 'k_serv_1',
    category: 'Services',
    title: 'Digital Engineering Services',
    question: 'What services does AROM STUDIO offer?',
    alternateQuestions: ['What services do you provide?', 'What can you build?', 'What do you offer?', 'Can you build an eCommerce site?'],
    synonyms: ['capabilities', 'offerings', 'web development', 'ui/ux design', 'redesign'],
    keywords: ['service', 'services', 'offer', 'build', 'ecommerce', 'saas', 'web app', 'ui/ux', 'design', 'seo', 'performance', 'redesign', 'portfolio'],
    description: 'Complete breakdown of web engineering, e-commerce, custom web apps, and UI/UX design capabilities.',
    detailedAnswer: `### Services & Engineering Capabilities
We specialize in end-to-end digital engineering:

- **Business Websites**: High-performance corporate sites optimized for conversions.
- **E-commerce Websites**: Scalable online stores with Razorpay/Stripe checkout, inventory management, and mobile UI.
- **Custom Web Applications**: Bespoke full-stack web applications built with Next.js, Node.js, and PostgreSQL.
- **SaaS Platforms**: Multi-tenant subscription platforms with user management and billing.
- **UI/UX Design**: Dark glassmorphic interfaces, visual design systems, and interactive Figma prototypes.
- **Website Redesign**: Modernizing legacy websites to improve load speed, mobile UX, and SEO.
- **SEO Optimization**: On-page, technical, schema markup, and sitemap optimization.
- **Performance Tuning**: Core Web Vitals optimization targeting Lighthouse 95+ scores.
- **AI Integration & GEO**: AI Chatbot setup, vector search, and Generative Engine Optimization (\`llms.txt\`).`,
    shortAnswer: 'We build Business Sites, E-commerce Stores, Custom Web Apps, SaaS Platforms, UI/UX Systems, and Performance Tuning.',
    relatedTopics: ['Pricing', 'Process', 'Technologies'],
    navigationLinks: ['/services'],
    tags: ['services', 'ecommerce', 'webapps', 'uiux', 'seo'],
    priority: 9,
    language: 'en',
    version: '1.0',
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: 'Arnav Pagare',
    source: 'AROM STUDIO Official Document',
  },
  {
    id: 'k_proc_1',
    category: 'Process',
    question: 'How does your development process work and how long does it take?',
    alternateQuestions: ['How long will my project take?', 'Timeline?', 'Delivery?', 'Project duration?', 'Stages?'],
    synonyms: ['workflow', 'steps', 'timeline', 'duration', 'phases'],
    keywords: ['process', 'workflow', 'timeline', 'long', 'duration', 'time', 'step', 'stages', 'how it works', 'completion', 'delivery'],
    description: '5-stage development workflow and typical project timelines.',
    detailedAnswer: `### Development Process & Timeline
Our structured workflow ensures transparent execution from discovery to launch:

1. **Discovery & Onboarding (Week 1)**: Interactive Discovery Questionnaire, requirements analysis, scope confirmation.
2. **UI/UX Design & Wireframing (Week 1-2)**: Interactive Figma prototypes, visual design system creation, client review.
3. **Production Development (Week 2-4)**: Clean React 19/Next.js & TypeScript code, API integrations, CMS setup.
4. **QA Testing & Performance Tuning (Week 4-5)**: Lighthouse speed audit, cross-browser/device testing, accessibility check.
5. **Launch & Handover (Week 5-6)**: Production deployment, domain/SSL configuration, source code transfer, 1-year support kickoff.

**Typical Timeline**:
- Starter/Professional: 2 to 4 weeks.
- Business/Premium: 4 to 6 weeks.
- Enterprise: 6 to 10 weeks.`,
    shortAnswer: 'Our development process takes 2 to 6 weeks depending on package complexity across 5 structured phases.',
    relatedTopics: ['Services', 'Client Portal', 'Handover'],
    navigationLinks: ['/services'],
    tags: ['process', 'timeline', 'stages', 'workflow'],
    priority: 9,
    language: 'en',
    version: '1.0',
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: 'Arnav Pagare',
    source: 'AROM STUDIO Official Document',
  },
  {
    id: 'k_port_1',
    category: 'Portal',
    question: 'Can I track my project progress in real-time?',
    alternateQuestions: ['What is the Client Portal?', 'How do I track my project?', 'Can I approve designs online?'],
    synonyms: ['client portal', 'dashboard', 'progress tracker', 'agreement', 'milestones'],
    keywords: ['track', 'portal', 'client portal', 'progress', 'status', 'dashboard', 'agreement', 'prd', 'revision', 'handover'],
    description: 'Features of the 15-module Client Portal for real-time client tracking.',
    detailedAnswer: `### Client Portal (/clientportal)
Yes! We provide a dedicated **15-Module Client Portal** where you can track every phase in real-time:

- **Live Dashboard**: Milestone progress bars, status indicators, file archives.
- **Discovery Questionnaire**: 16-section business discovery form with instant PDF export.
- **Development Agreement**: 23-section digital legal contract with digital sign-off.
- **Master Specification (PRD)**: Full product requirements document breakdown.
- **Project Timeline**: Real-time phase updates and task completion tracking.
- **Design Approval**: Page-by-page visual reviews and comment threads.
- **Revision Requests**: Priority-based revision logging (*Low*, *Medium*, *High*).
- **Invoices & Payments**: Instant PDF invoices and payment status trackers.
- **Project Handover**: Secure access to credentials, hosting info, GitHub repo link, and 1-year warranty timer.`,
    shortAnswer: 'Clients get access to a 15-module Client Portal to track milestones, sign agreements, and download invoices in real-time.',
    relatedTopics: ['Process', 'Handover', 'Services'],
    navigationLinks: ['/clientportal'],
    tags: ['portal', 'tracking', 'agreements', 'invoices'],
    priority: 8,
    language: 'en',
    version: '1.0',
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: 'Arnav Pagare',
    source: 'AROM STUDIO Official Document',
  },
  {
    id: 'k_pol_1',
    category: 'Policies',
    question: 'What is your refund policy and deposit policy?',
    detailedAnswer: `### Payment & Refund Policy
- **Deposit**: A **50% advance deposit** is required before project commencement to cover discovery, design system setup, and resource allocation.
- **Milestone Cancellations**: If a project is cancelled prior to design approval, unearned portions of the deposit minus work completed are eligible for refund.
- **Final Payment**: The remaining 50% balance is due upon final design & build approval before live production deployment or source code handover.
- **1-Year Support Guarantee**: Should any bugs or technical issues arise within 1 year post-launch, our team fixes them free of charge under our warranty guarantee.`,
    answer: `### Payment & Refund Policy
- **Deposit**: A **50% advance deposit** is required before project commencement to cover discovery, design system setup, and resource allocation.
- **Milestone Cancellations**: If a project is cancelled prior to design approval, unearned portions of the deposit minus work completed are eligible for refund.
- **Final Payment**: The remaining 50% balance is due upon final design & build approval before live production deployment or source code handover.
- **1-Year Support Guarantee**: Should any bugs or technical issues arise within 1 year post-launch, our team fixes them free of charge under our warranty guarantee.`,
    keywords: ['refund', 'cancel', 'cancellation', 'deposit', 'policy', 'terms', 'guarantee', 'money back'],
    title: 'Payment & Refund Policies',
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'k_comp_mr',
    category: 'Company',
    title: 'कंपनी माहिती - मराठी',
    question: 'AROM STUDIO म्हणजे काय?',
    alternateQuestions: ['AROM STUDIO बद्दल सांगा', 'तुमची कंपनी काय करते?', 'तुमचे संस्थापक कोण आहेत?'],
    synonyms: ['एजन्सी', 'स्टुडिओ', 'कंपनी'],
    keywords: ['arom studio', 'अरोम स्टुडिओ', 'कंपनी', 'संस्थापक', 'अर्णव', 'सेवा', 'माहिती', 'mr'],
    description: 'AROM STUDIO बद्दल मराठी माहिती.',
    detailedAnswer: `### AROM STUDIO बद्दल
AROM STUDIO ही **अर्णव पगारे** (संस्थापक आणि मुख्य अभियंता) यांनी स्थापन केलेली एक आधुनिक, उच्च-कार्यक्षम वेब डिझाइन आणि सॉफ्टवेअर डेव्हलपमेंट एजन्सी आहे.

आमचे वैशिष्ट्य:
- **100/100 कोर वेब व्हाइटल्स हमी**: सब-सेकंद लोड वेळा, LCP < 1.2s, CLS = 0.00
- **100% सोर्स कोड मालकी**: तुम्ही तुमच्या कोडचे पूर्ण मालक आहात
- **1 वर्ष वॉरंटी आणि सपोर्ट**: सर्व प्रकल्पांना 1 वर्ष मोफत सपोर्ट`,
    shortAnswer: 'AROM STUDIO ही अर्णव पगारे यांनी स्थापन केलेली वेब डेव्हलपमेंट एजन्सी आहे.',
    relatedTopics: ['Founder', 'Services', 'Pricing'],
    tags: ['mr', 'मराठी', 'company'],
    priority: 8,
    language: 'mr',
    version: '1.0',
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: 'Arnav Pagare',
    source: 'AROM STUDIO Official Document',
  },
  {
    id: 'k_price_mr',
    category: 'Pricing',
    title: 'किंमत योजना - मराठी',
    question: 'तुमची किंमत योजना काय आहे?',
    alternateQuestions: ['वेबसाइटची किंमत किती?', 'पॅकेजची किंमत?', 'प्लॅन्सची माहिती?'],
    synonyms: ['किंमत', 'दर', 'पॅकेज', 'योजना'],
    keywords: ['किंमत', 'price', 'pricing', 'पॅकेज', 'प्लॅन', 'starter', 'professional', 'business', 'premium', 'mr'],
    description: '5 स्तरीय किंमत योजना मराठीमध्ये.',
    detailedAnswer: `### किंमत योजना
आम्ही तुमच्या व्यवसायासाठी 5 स्पष्ट किंमत पॅकेजेस ऑफर करतो:

1. **स्टार्टर वेबसाइट — ₹15,999+**: 1-5 पेजेस, रिस्पॉन्सिव डिझाइन, बेसिक SEO, कॉन्टॅक्ट फॉर्म
2. **प्रोफेशनल वेबसाइट — ₹32,999+**: 10 पेजेस, कस्टम UI/UX, WhatsApp इंटिग्रेशन, 1 वर्ष सपोर्ट
3. **बिझनेस वेबसाइट — ₹59,999+**: 20 पेजेस, CMS, ई-कॉमर्स/बुकिंग सिस्टम, API इंटिग्रेशन
4. **प्रीमियम वेबसाइट — ₹1,00,999+**: अनलिमिटेड पेजेस, GSAP अॅनिमेशन, AI फीचर्स
5. **एंटरप्राइज सोल्यूशन — ₹1,27,000+**: कस्टम आर्किटेक्चर, SLA सपोर्ट

**पेमेंट**: 50% अॅडव्हान्स, 50% कम्प्लीशनवर.`,
    shortAnswer: 'पॅकेजेस ₹15,999+ पासून ₹1,27,000+ पर्यंत.',
    relatedTopics: ['Services', 'Process', 'Policies'],
    tags: ['mr', 'मराठी', 'pricing'],
    priority: 8,
    language: 'mr',
    version: '1.0',
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: 'Arnav Pagare',
    source: 'AROM STUDIO Official Document',
  },
  {
    id: 'k_comp_hi',
    category: 'Company',
    title: 'कंपनी जानकारी - हिंदी',
    question: 'AROM STUDIO क्या है?',
    alternateQuestions: ['AROM STUDIO के बारे में बताएं', 'आपकी कंपनी क्या करती है?', 'आपके संस्थापक कौन हैं?'],
    synonyms: ['एजेंसी', 'स्टूडियो', 'कंपनी'],
    keywords: ['arom studio', 'अरोम स्टूडियो', 'कंपनी', 'संस्थापक', 'अर्णव', 'सेवा', 'जानकारी', 'hi'],
    description: 'AROM STUDIO के बारे में हिंदी जानकारी.',
    detailedAnswer: `### AROM STUDIO के बारे में
AROM STUDIO एक आधुनिक, उच्च-प्रदर्शन वेब डिज़ाइन और सॉफ्टवेयर डेवलपमेंट एजेंसी है जिसकी स्थापना **अर्णव पगारे** (संस्थापक और मुख्य अभियंता) ने की है।

हमारी विशेषताएं:
- **100/100 कोर वेब वाइटल्स गारंटी**: सब-सेकंड लोड टाइम, LCP < 1.2s, CLS = 0.00
- **100% सोर्स कोड स्वामित्व**: आप अपने कोड के पूर्ण मालिक हैं
- **1 वर्ष वारंटी और सपोर्ट**: सभी प्रोजेक्ट्स पर 1 वर्ष मुफ्त सपोर्ट`,
    shortAnswer: 'AROM STUDIO अर्णव पगारे द्वारा स्थापित एक वेब डेवलपमेंट एजेंसी है।',
    relatedTopics: ['Founder', 'Services', 'Pricing'],
    tags: ['hi', 'हिंदी', 'company'],
    priority: 8,
    language: 'hi',
    version: '1.0',
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: 'Arnav Pagare',
    source: 'AROM STUDIO Official Document',
  },
  {
    id: 'k_host_1',
    category: 'Hosting',
    title: 'Web Hosting Services',
    question: 'Do you provide web hosting?',
    alternateQuestions: ['Is hosting included?', 'What hosting do you use?', 'Hosting plans?', 'Server details?'],
    synonyms: ['host', 'server', 'deploy', 'live', 'cloud'],
    keywords: ['hosting', 'host', 'server', 'deploy', 'cloud', 'vps', 'shared', 'dedicated'],
    description: 'Hosting options and offerings from AROM STUDIO.',
    detailedAnswer: `### Hosting Services
We offer flexible hosting solutions for all our clients:

- **Free Domain (1 Year)**: Included with Professional plan and above (T&C apply).
- **Managed Hosting**: We handle server setup, SSL, backups, and monitoring.
- **Vercel / Netlify**: Recommended for static and Next.js sites (blazing fast CDN).
- **Traditional Hosting**: Available for WordPress or custom backend projects.
- **Uptime SLA**: 99.9% uptime guarantee on all managed hosting plans.

Hosting is optional — you can use your own provider, and we'll deploy there.`,
    shortAnswer: 'We provide managed hosting, Vercel/Netlify deployment, and free domain with Professional+ plans.',
    relatedTopics: ['Services', 'Pricing', 'Support'],
    navigationLinks: ['/pricing'],
    tags: ['hosting', 'domain', 'server', 'deploy'],
    priority: 8, language: 'en', version: '1.0', status: 'Active',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    author: 'Arnav Pagare', source: 'AROM STUDIO Official Document',
  },
  {
    id: 'k_maint_1',
    category: 'Maintenance',
    title: 'Maintenance & Support Plans',
    question: 'Do you offer website maintenance?',
    alternateQuestions: ['How much is maintenance?', 'What does maintenance include?', 'Post-launch support?', 'Update costs?'],
    synonyms: ['maintain', 'upkeep', 'care', 'service'],
    keywords: ['maintenance', 'support', 'update', 'upkeep', 'monthly', 'retainer', 'warranty'],
    description: 'Ongoing maintenance and support after launch.',
    detailedAnswer: `### Maintenance & Support
All projects include **1 Year Warranty & Support** free of charge covering:

- Bug fixes and security patches
- Performance monitoring and optimization
- Content updates (text, images)
- Uptime monitoring
- Email support response within 24 hours

**Extended Maintenance Plans** (after 1 year):
- **Basic (₹3,999/mo)**: Monthly content updates, backups, security checks
- **Standard (₹7,999/mo)**: Weekly updates, SEO monitoring, priority support
- **Premium (₹14,999/mo)**: Unlimited updates, dedicated account manager, SLA`,
    shortAnswer: '1 year free warranty included, extended plans from ₹3,999/mo after year one.',
    relatedTopics: ['Services', 'Support', 'Pricing'],
    tags: ['maintenance', 'support', 'warranty', 'updates'],
    priority: 8, language: 'en', version: '1.0', status: 'Active',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    author: 'Arnav Pagare', source: 'AROM STUDIO Official Document',
  },
  {
    id: 'k_tech_1',
    category: 'Technologies',
    title: 'Technology Stack Overview',
    question: 'What technologies do you use?',
    alternateQuestions: ['What tech stack?', 'Do you use React?', 'What framework?', 'Do you build with WordPress?'],
    synonyms: ['tech', 'stack', 'framework', 'language', 'tools'],
    keywords: ['react', 'next.js', 'node', 'typescript', 'tailwind', 'postgresql', 'wordpress', 'shopify', 'technology', 'stack'],
    description: 'Complete technology stack used by AROM STUDIO.',
    detailedAnswer: `### Technology Stack
We use modern, battle-tested technologies:

**Frontend**: React 19, Next.js 15, TypeScript, Tailwind CSS, Framer Motion
**Backend**: Node.js, Express, Next.js API Routes
**Database**: PostgreSQL, Prisma ORM, Supabase
**CMS**: WordPress (headless), Sanity, Custom CMS
**E-commerce**: Shopify, Custom with Razorpay/Stripe
**Hosting**: Vercel, Netlify, AWS, DigitalOcean
**AI**: LangChain, Vector Search, OpenAI API, Gemini API
**Tools**: Figma, Git, GitHub, VS Code, Linear, Discord`,
    shortAnswer: 'React 19, Next.js, TypeScript, Node.js, PostgreSQL, Tailwind, and WordPress/Shopify.',
    relatedTopics: ['Services', 'AI', 'Performance'],
    tags: ['technology', 'react', 'nextjs', 'node', 'typescript', 'tailwind'],
    priority: 8, language: 'en', version: '1.0', status: 'Active',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    author: 'Arnav Pagare', source: 'AROM STUDIO Official Document',
  },
  {
    id: 'k_faq_1',
    category: 'FAQ',
    title: 'Frequently Asked Questions',
    question: 'What are common questions about AROM STUDIO?',
    alternateQuestions: ['FAQs', 'Common questions', 'Do you have FAQs?'],
    synonyms: ['faq', 'questions', 'common'],
    keywords: ['faq', 'question', 'common', 'doubts', 'clarify'],
    description: 'Answers to frequently asked questions.',
    detailedAnswer: `### Frequently Asked Questions

**Q: Do I need technical knowledge to work with you?**
A: No. We handle everything from domain setup to deployment. You just need to share your vision.

**Q: Can I update the website myself after launch?**
A: Yes. We provide a CMS dashboard for content updates. Training is included.

**Q: Do you redesign existing websites?**
A: Yes. We specialize in modernizing legacy websites with better speed, UX, and SEO.

**Q: What if I don't like the design?**
A: We offer unlimited revisions during the design phase until you're 100% satisfied.

**Q: How do payments work?**
A: 50% advance to start, 50% on completion before launch.

**Q: Is there a contract lock-in?**
A: No. You own 100% of your code and can leave anytime after final payment.`,
    shortAnswer: 'No technical knowledge needed, unlimited design revisions, 50/50 payment, no lock-in.',
    relatedTopics: ['Services', 'Pricing', 'Process', 'Support'],
    tags: ['faq', 'questions', 'common', 'help'],
    priority: 8, language: 'en', version: '1.0', status: 'Active',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    author: 'Arnav Pagare', source: 'AROM STUDIO Official Document',
  },
  {
    id: 'k_price_hi',
    category: 'Pricing',
    title: 'मूल्य योजना - हिंदी',
    question: 'आपकी मूल्य योजना क्या है?',
    alternateQuestions: ['वेबसाइट की कीमत कितनी है?', 'पैकेज की कीमत?', 'प्लान्स की जानकारी?'],
    synonyms: ['कीमत', 'दर', 'पैकेज', 'योजना'],
    keywords: ['कीमत', 'price', 'pricing', 'पैकेज', 'प्लान', 'starter', 'professional', 'business', 'hi'],
    description: '5 स्तरीय मूल्य योजना हिंदी में.',
    detailedAnswer: `### मूल्य योजना
हम आपके व्यवसाय के लिए 5 स्पष्ट मूल्य पैकेज प्रदान करते हैं:

1. **स्टार्टर वेबसाइट — ₹15,999+**: 1-5 पेज, रिस्पॉन्सिव डिज़ाइन, बेसिक SEO, कॉन्टैक्ट फॉर्म
2. **प्रोफेशनल वेबसाइट — ₹32,999+**: 10 पेज, कस्टम UI/UX, WhatsApp इंटीग्रेशन, 1 वर्ष सपोर्ट
3. **बिज़नेस वेबसाइट — ₹59,999+**: 20 पेज, CMS, ई-कॉमर्स/बुकिंग सिस्टम, API इंटीग्रेशन
4. **प्रीमियम वेबसाइट — ₹1,00,999+**: अनलिमिटेड पेज, GSAP एनिमेशन, AI फीचर्स
5. **एंटरप्राइज सॉल्यूशन — ₹1,27,000+**: कस्टम आर्किटेक्चर, SLA सपोर्ट

**भुगतान**: 50% एडवांस, 50% पूर्णता पर.`,
    shortAnswer: 'पैकेज ₹15,999+ से ₹1,27,000+ तक।',
    relatedTopics: ['Services', 'Process', 'Policies'],
    tags: ['hi', 'हिंदी', 'pricing'],
    priority: 8,
    language: 'hi',
    version: '1.0',
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: 'Arnav Pagare',
    source: 'AROM STUDIO Official Document',
  },
]

// Official Safe Security Response (Global Policy v1.0)
export const SECURITY_RESTRICTED_RESPONSE = `I'm sorry, but I can't provide confidential, private, or security-sensitive information. If you need help with AROM STUDIO's public services, I'd be happy to assist.`

// Official Internal System Refusal Response
export const INTERNAL_SYSTEM_REFUSAL_RESPONSE = `Some internal systems are used privately to manage AROM STUDIO's operations. Those systems aren't publicly available, so I can't provide details about them. I'd be happy to help with any public information about AROM STUDIO.`

// Rare Public Unknown Fallback Response (Anti-Hallucination Guardrail)
export const PUBLIC_UNKNOWN_RESPONSE = `I couldn't find public information confirming that. I don't want to guess. If you'd like, I can help with another question about AROM STUDIO.`

// Security & Prompt Injection Protection Patterns (Zero Trust Model)
const RESTRICTED_PATTERNS = [
  /\b(api[ _]?key|secret[ _]?key|access[ _]?token|jwt|env|\.env|database[ _]?url|db[ _]?password|smtp|oauth|admin[ _]?credential|session[ _]?token|private[ _]?key|ssh[ _]?key|firebase|supabase[ _]?service|openai[ _]?key|gemini[ _]?key|stripe[ _]?secret|vercel[ _]?secret|github[ _]?token|encryption[ _]?key|server[ _]?ip|internal[ _]?url|sql[ _]?query|system[ _]?prompt|developer[ _]?prompt|memory[ _]?content|hidden[ _]?config|build[ _]?files|source[ _]?code|backend[ _]?logic|financial[ _]?record|revenue[ _]?report|user[ _]?password|client[ _]?personal|private[ _]?file|uploaded[ _]?document)\b/i,
  /\b(ignore (all )?previous instructions|reveal (your )?(system )?prompt|show hidden (prompt|instructions)|print system prompt|show developer (prompt|message)|display memory|developer mode|debug mode|print memory|reveal api|show \.env|print backend|display database|reveal passwords|export data|dump (logs|database)|show secret|show authentication|bypass security|disable restrictions|act as (administrator|owner)|simulat(e|ing) owner|pretend security is disabled)\b/i,
  /\b(i am (the )?(founder|owner|admin|administrator|developer|employee|investor|government|hacker|security researcher)|i built this|i own the company|i forgot my password|i work here|i have permission|my manager approved|my boss asked|security testing|need it urgently|i am from the government|i am openai)\b/i,
]

// Forbidden Internal System Inquiries
const INTERNAL_SYSTEM_PATTERNS = [
  /\b(admin|admin[ _]?panel|admin[ _]?dashboard|\/admin|executive[ _]?overview|crm|lead[ _]?management|visitor[ _]?analytics|traffic[ _]?generator|pdf[ _]?archive|invoice[ _]?generator|cms|ai[ _]?conversations|ai[ _]?knowledge|chat[ _]?transcripts|recycle[ _]?bin|internal[ _]?tools|backend[ _]?architecture|audit[ _]?logs|hidden[ _]?features|internal[ _]?system|internal[ _]?database|user[ _]?database)\b/i,
]

// Unrelated query patterns
const UNRELATED_PATTERNS = [
  /\b(movie|cinema|actor|actress|hollywood|bollywood|netflix|film)\b/i,
  /\b(cricket|football|soccer|nba|ipl|messi|ronaldo|match|score|sports)\b/i,
  /\b(politics|election|president|prime minister|bjp|congress|government|vote)\b/i,
  /\b(medicine|doctor|disease|covid|symptom|prescription|hospital|treatment)\b/i,
  /\b(weather|forecast|rain today|temperature|climate)\b/i,
  /\b(tell me a joke|funny joke|riddle|story about a cat)\b/i,
  /\b(write a python script for homework|solve this math equation|who discovered america)\b/i,
]

// Typo & Normalization Helper
function normalizeUserQuery(input: string): string {
  let cleaned = input.toLowerCase().trim()
  cleaned = cleaned.replace(/(.)\1{2,}/g, '$1')

  const typoMap: Record<string, string> = {
    'prcing': 'pricing', 'prise': 'pricing', 'prce': 'price', 'priting': 'pricing',
    'pakage': 'package', 'packg': 'package', 'pkg': 'package',
    'websit': 'website', 'websitr': 'website', 'siet': 'website',
    'contct': 'contact', 'cotnact': 'contact', 'cntct': 'contact',
    'proposel': 'proposal', 'servise': 'services', 'srvc': 'services',
    'maintainance': 'maintenance', 'arome': 'arom studio', 'arrom': 'arom studio',
    'aron': 'arom studio', 'aromai': 'arom ai', 'hlep': 'help', 'adbout': 'about',
    'gm': 'good morning', 'hlo': 'hello', 'hii': 'hi', 'heyy': 'hey', 'hy': 'hi',
    'sup': 'hi', 'yo': 'hi', 'wassup': 'hi',
  }

  const words = cleaned.split(/\s+/)
  const corrected = words.map((w) => typoMap[w] || w)
  return corrected.join(' ')
}

// Enterprise Scalable Semantic Search Engine across Knowledge Items
export function searchKnowledgeEngine(
  normalizedQuery: string,
  knowledgeList: AiKnowledgeItem[] = INITIAL_AI_KNOWLEDGE
): { bestMatch: AiKnowledgeItem | null; score: number; related: AiKnowledgeItem[] } {
  // Filter active public records only (ZERO TRUST PRIVACY GUARANTEE)
  const publicRecords = knowledgeList.filter((k) => k.status === 'Active' || !k.status)
  if (publicRecords.length === 0) return { bestMatch: null, score: 0, related: [] }

  const queryWords = normalizedQuery.split(/\s+/).filter((w) => w.length > 2)
  const scoredItems: { item: AiKnowledgeItem; score: number }[] = []

  for (const item of publicRecords) {
    let score = 0

    if (item.title && item.title.toLowerCase().includes(normalizedQuery)) score += 25
    if (item.question && item.question.toLowerCase().includes(normalizedQuery)) score += 25

    if (Array.isArray(item.alternateQuestions)) {
      item.alternateQuestions.forEach((aq) => {
        if (aq.toLowerCase().includes(normalizedQuery)) score += 15
      })
    }

    if (Array.isArray(item.synonyms)) {
      item.synonyms.forEach((syn) => {
        if (normalizedQuery.includes(syn.toLowerCase())) score += 12
      })
    }

    if (Array.isArray(item.keywords)) {
      item.keywords.forEach((kw) => {
        if (normalizedQuery.includes(kw.toLowerCase())) score += 10
      })
    }

    if (Array.isArray(item.tags)) {
      item.tags.forEach((tag) => {
        if (normalizedQuery.includes(tag.toLowerCase())) score += 8
      })
    }

    queryWords.forEach((word) => {
      const textToSearch = (item.detailedAnswer || item.answer || '').toLowerCase()
      if (textToSearch.includes(word)) score += 3
      if (item.question && item.question.toLowerCase().includes(word)) score += 4
    })

    if (score > 0) {
      scoredItems.push({ item: { ...item, searchScore: score }, score })
    }
  }

  scoredItems.sort((a, b) => b.score - a.score)

  if (scoredItems.length > 0 && scoredItems[0].score >= 6) {
    return {
      bestMatch: scoredItems[0].item,
      score: scoredItems[0].score,
      related: scoredItems.slice(1, 3).map((s) => s.item),
    }
  }

  return { bestMatch: null, score: 0, related: [] }
}

const FOLLOW_UP_MAP: Record<string, string[]> = {
  'Pricing': [
    'Which package do you recommend for my business?',
    'What is included in the Professional plan?',
    'Do you offer payment plans?',
  ],
  'Services': [
    'What is included in a business website?',
    'How long does a typical project take?',
    'Can you show me some examples of your work?',
  ],
  'Process': [
    'How do we get started on a project?',
    'What information do you need from me?',
    'How do I track my project progress?',
  ],
  'Technologies': [
    'What tech stack do you use?',
    'Do you build mobile apps too?',
    'What CMS options do you offer?',
  ],
  'Portfolio': [
    'Do you have case studies?',
    'What industries have you worked with?',
    'Can I see live demo sites?',
  ],
  'Support': [
    'What does the 1-year warranty cover?',
    'How do I request changes after launch?',
    'Is hosting included in the package?',
  ],
  'SEO': [
    'Do you guarantee search rankings?',
    'What SEO tools do you use?',
    'How long until I see SEO results?',
  ],
  'AI': [
    'How do AI chatbots work?',
    'Can you integrate AI into my website?',
    'What is GEO and llms.txt?',
  ],
  'default': [
    'What services do you offer?',
    'How much does a website cost?',
    'How does your process work?',
    'Can you show me examples of your work?',
  ],
}

const INDUSTRY_FOLLOW_UPS: Record<string, string[]> = {
  gym: [
    'Do you include class booking systems?',
    'Can members sign up and pay online?',
    'Do you integrate with fitness apps?',
  ],
  restaurant: [
    'Can customers book tables online?',
    'Do you include online ordering?',
    'Can you integrate with Zomato/Swiggy?',
  ],
  clinic: [
    'Do you include online appointment booking?',
    'Can patients fill intake forms online?',
    'Do you offer telemedicine integration?',
  ],
  ecommerce: [
    'How many products can I list?',
    'Which payment gateways do you support?',
    'Do you include inventory management?',
  ],
}

export function smartRecommend(context: AiContext): {
  recommendedPackage: string
  estimatedTimeline: string
  suggestedFeatures: string[]
  estimatedBudget: string
} {
  const pkg = context.preferredPackage
  const type = context.projectType
  const needsSEO = context.needsSEO
  const needsMaint = context.needsMaintenance

  let recommendedPackage = 'Professional (₹32,999+)'
  let estimatedTimeline = '3-4 weeks'
  let estimatedBudget = '₹32,999+'
  const suggestedFeatures: string[] = ['Responsive Design', 'Contact Form', 'Basic SEO']

  if (type === 'gym' || type === 'restaurant' || type === 'clinic') {
    recommendedPackage = 'Professional (₹32,999+)'
    estimatedBudget = '₹32,999+'
    estimatedTimeline = '3-4 weeks'
    suggestedFeatures.push('Online Booking System', 'WhatsApp Integration', 'Google Maps')
  }

  if (type === 'ecommerce') {
    recommendedPackage = 'Business (₹59,999+)'
    estimatedBudget = '₹59,999+'
    estimatedTimeline = '4-6 weeks'
    suggestedFeatures.push('Product Catalog', 'Payment Gateway', 'Inventory Management')
  }

  if (type === 'saas' || type === 'realestate') {
    recommendedPackage = 'Business (₹59,999+)'
    estimatedBudget = '₹59,999+'
    estimatedTimeline = '5-7 weeks'
    suggestedFeatures.push('User Authentication', 'Admin Dashboard', 'API Integration')
  }

  if (pkg === 'Starter') {
    recommendedPackage = 'Starter (₹15,999+)'
    estimatedBudget = '₹15,999+'
    estimatedTimeline = '2-3 weeks'
  }
  if (pkg === 'Business' || pkg === 'Premium / Enterprise') {
    recommendedPackage = 'Business (₹59,999+)'
    estimatedBudget = '₹59,999+'
    estimatedTimeline = '4-6 weeks'
  }

  if (needsSEO) suggestedFeatures.push('Advanced SEO Optimization')
  if (needsMaint) suggestedFeatures.push('Monthly Maintenance Plan')
  suggestedFeatures.push('1 Year Support & Warranty')

  return { recommendedPackage, estimatedTimeline, suggestedFeatures, estimatedBudget }
}

export function generateProposalFromContext(context: AiContext): Record<string, any> | null {
  if (!context.userName || !context.projectType) return null
  return {
    clientName: context.userName,
    businessName: context.businessName || context.userName,
    email: context.email || '',
    projectType: context.projectType,
    preferredPackage: context.preferredPackage || 'Professional (₹32,999+)',
    budget: context.budget || 'To be confirmed',
    timeline: context.timeline || '3-4 weeks',
    features: context.features || [],
    needsSEO: context.needsSEO || false,
    needsMaintenance: context.needsMaintenance || false,
    scopeSummary: `A ${context.projectType} website${context.features && context.features.length > 0 ? ' with ' + context.features.join(', ') : ''}.${context.needsSEO ? ' Includes SEO optimization.' : ''}${context.needsMaintenance ? ' Includes maintenance plan.' : ''}`,
    recommendedPackage: smartRecommend(context),
  }
}

function generateSingleFollowUp(context: AiContext, responseText: string): string[] {
  const down = responseText.toLowerCase()

  // Lead qualification: collect info naturally, one at a time
  if (!context.userName && !down.includes('name')) {
    return ['May I know your name so I can assist you better?']
  }

  if (context.userName && !context.businessName && !down.includes('company') && !down.includes('business')) {
    return [`Thanks, ${context.userName}. Could you tell me your business or company name?`]
  }

  if (context.userName && !context.projectType && !down.includes('website') && !down.includes('build')) {
    return [`What type of website are you planning? For example, a business site, e-commerce store, portfolio, or a custom web application?`]
  }

  if (context.projectType && !context.budget && !down.includes('budget') && !down.includes('price') && !down.includes('cost')) {
    return [`Do you have a budget range in mind for your ${context.projectType} website?`]
  }

  if (context.budget && !context.preferredPackage && !down.includes('package') && !down.includes('plan')) {
    return [`Based on your budget, would you like me to recommend a package that fits your requirements?`]
  }

  if (context.preferredPackage && !context.timeline && !down.includes('timeline') && !down.includes('week')) {
    return ['What timeline are you targeting for your website launch?']
  }

  if (context.projectType && !context.targetAudience && context.discussedTopics.length >= 2) {
    return ['Who is your target audience? Understanding your visitors helps me design the right experience.']
  }

  if (context.timeline && !context.proposalRequested && context.budget && context.projectType) {
    return ['Would you like me to prepare a detailed proposal with pricing and timeline based on our discussion?']
  }

  if (context.proposalRequested && !context.email) {
    return ['To send you the proposal, could you share your email address?']
  }

  if (context.agreementSigned && !context.meetingRequested) {
    return ['Would you like to schedule a call to go over the agreement details?']

  }

  // Topic-based follow-ups
  const askedTopics = context.discussedTopics
  const lastTopic = askedTopics[askedTopics.length - 1]
  if (lastTopic && FOLLOW_UP_MAP[lastTopic]) {
    return [FOLLOW_UP_MAP[lastTopic][0]]
  }

  if (down.includes('price') || down.includes('cost') || down.includes('package') || down.includes('tier')) {
    return [FOLLOW_UP_MAP['Pricing'][0]]
  }
  if (down.includes('service') || down.includes('offer') || down.includes('build')) {
    return [FOLLOW_UP_MAP['Services'][0]]
  }
  if (down.includes('process') || down.includes('timeline') || down.includes('week')) {
    return [FOLLOW_UP_MAP['Process'][0]]
  }

  if (context.projectType && INDUSTRY_FOLLOW_UPS[context.projectType]) {
    return [INDUSTRY_FOLLOW_UPS[context.projectType][0]]
  }

  return [FOLLOW_UP_MAP['default'][0]]
}

export function generateAiResponse(
  userQuery: string,
  customKnowledge: AiKnowledgeItem[] = INITIAL_AI_KNOWLEDGE,
  context: AiContext = createDefaultContext()
): AiResponse {
  const ctxManager = new AiContextManager(context)
  ctxManager.updateFromUserMessage(userQuery)
  const updatedContext = ctxManager.getContext()

  const normalized = normalizeUserQuery(userQuery)

  if (!normalized) {
    return {
      text: ctxManager.greetMessage(),
      followUps: generateSingleFollowUp(updatedContext, ''),
      context: updatedContext,
    }
  }

  const makeResponse = (text: string): AiResponse => ({
    text,
    followUps: generateSingleFollowUp(updatedContext, text),
    context: updatedContext,
  })

  const name = updatedContext.userName
  const namePrefix = name ? `${name}, ` : ''

  // Always search knowledge base first (RAG)
  const searchResult = searchKnowledgeEngine(normalized, customKnowledge)

  // 1. Zero Trust Security & Prompt Injection
  if (RESTRICTED_PATTERNS.some((p) => p.test(normalized))) {
    return makeResponse(SECURITY_RESTRICTED_RESPONSE)
  }

  // 2. Forbidden Internal Systems
  if (INTERNAL_SYSTEM_PATTERNS.some((p) => p.test(normalized))) {
    return makeResponse(INTERNAL_SYSTEM_REFUSAL_RESPONSE)
  }

  // 3. Unrelated / Out-of-Scope
  if (UNRELATED_PATTERNS.some((p) => p.test(normalized))) {
    return makeResponse(`I'm designed to assist with AROM STUDIO and our website development services. I'd be happy to help with anything about AROM STUDIO.`)
  }

  // If knowledge base has a direct answer, use it
  if (searchResult.bestMatch && searchResult.score >= 20) {
    const answer = searchResult.bestMatch.detailedAnswer || searchResult.bestMatch.answer || PUBLIC_UNKNOWN_RESPONSE
    if (searchResult.bestMatch.category === 'Pricing' && updatedContext.projectType) {
      const rec = smartRecommend(updatedContext)
      return makeResponse(`${answer}\n\n**For your ${updatedContext.projectType} project**, I recommend the **${rec.recommendedPackage}** package with an estimated timeline of **${rec.estimatedTimeline}**. Suggested features: ${rec.suggestedFeatures.join(', ')}.`)
    }
    return makeResponse(answer)
  }

  // 4. Greeting
  if (/^(hi|hello|hey|good morning|good afternoon|good evening|namaste|namaskar|gm|hlo|hii|heyy|yo|sup|wassup|hy|🙏|👋|🙂|😊)$/i.test(normalized) || (/^(hi|hello|hey|hlo)\b/i.test(normalized) && normalized.length < 8)) {
    if (updatedContext.userName || updatedContext.discussedTopics.length > 0) {
      const phase = updatedContext.currentPhase?.phase
      if (phase === 'proposal') {
        return makeResponse(`${namePrefix}welcome back. I have your proposal information ready. If you share your email, I can send it over.`)
      }
      if (phase === 'agreement') {
        return makeResponse(`${namePrefix}good to see you. Ready to proceed with the agreement?`)
      }
      return makeResponse(`${namePrefix}welcome back. How can I help you with your project today?`)
    }
    return makeResponse(ctxManager.greetMessage())
  }

  // 5. Thank You
  if (/\b(thank you|thanks|thank u|tanks|thx|thnk)\b/i.test(normalized)) {
    return makeResponse(`You're welcome${name ? ', ' + name : ''}. Happy to help. What else can I assist you with?`)
  }

  // 6. Goodbye
  if (/\b(bye|goodbye|see you|tata)\b/i.test(normalized)) {
    return makeResponse(`${namePrefix}thanks for your time. You can reach out anytime when you're ready to move forward with your project.`)
  }

  // 7. AI Self Intro
  if (/\b(who are you|tell me about yourself|introduce yourself|what('s| is) your name|are you ai|what do you do|who created you|why do you exist|what is arom ai|explain arom ai|meaning of arom ai|purpose of arom ai)\b/i.test(normalized) && !normalized.includes('arom studio')) {
    return makeResponse(`I'm AROM AI, your project consultant at AROM STUDIO. I help businesses plan, scope, and launch their websites. I can recommend the right package, prepare proposals, schedule meetings, and guide you through the entire process. What would you like to discuss?`)
  }

  // 8. AI Capabilities
  if (/\b(what can you do|what are your capabilities|how can you help me|what do you do)\b/i.test(normalized) && !normalized.includes('arom studio')) {
    return makeResponse(`${namePrefix}I can help you:\n\n• Plan your website and choose the right package\n• Prepare a detailed project proposal\n• Schedule a consultation call\n• Answer questions about our services, pricing, and process\n• Guide you through the discovery phase\n• Help you prepare content and assets for your project\n\nWhat would you like to start with?`)
  }

  // 9. Company Overview
  if (/\b(tell me about arom studio|what is arom studio|who owns arom studio|explain your company|about your company|company overview|introduce arom studio|who is arom studio)\b/i.test(normalized)) {
    return makeResponse(`${namePrefix}AROM STUDIO is a web design and software development agency founded by Arnav Pagare. We build high-performance websites with a 100/100 Core Web Vitals guarantee, 100% source code ownership, and 1 year of free support. Would you like to discuss how we can help with your project?`)
  }

  // 10. Founder
  if (/\b(founder|who founded|tell me about your founder|who created arom studio)\b/i.test(normalized)) {
    return makeResponse(`AROM STUDIO was founded by Arnav Pagare (Founder & Lead Engineer), who leads our team in React 19, performance engineering, and cloud applications.`)
  }

  // 11. Start Project / I want a website
  if (/\b(how do i start|how can i work with you|i want a website|i need a website|let's begin|start my project|hire arom studio|start a project|begin project)\b/i.test(normalized)) {
    if (updatedContext.projectType && updatedContext.budget) {
      const rec = smartRecommend(updatedContext)
      return makeResponse(`${namePrefix}ready to get started. Based on what you've shared, here's a quick overview:\n\n**Recommended**: ${rec.recommendedPackage}\n**Timeline**: ${rec.estimatedTimeline}\n**Features**: ${rec.suggestedFeatures.join(', ')}\n\nWould you like me to prepare a formal proposal?`)
    }
    return makeResponse(`${namePrefix}let's start by understanding your project. What type of website are you looking to build? A business site, e-commerce store, portfolio, or something else?`)
  }

  // 12. Package Recommendation
  if (/\b(which package|recommend package|what package|choose package|don't know|dont know|not sure|confused)\b/i.test(normalized)) {
    if (updatedContext.projectType) {
      const rec = smartRecommend(updatedContext)
      return makeResponse(`${namePrefix}for your ${updatedContext.projectType} project, I recommend the **${rec.recommendedPackage}** package. Estimated timeline: **${rec.estimatedTimeline}**. Key features include: ${rec.suggestedFeatures.join(', ')}. Would you like to know more?`)
    }
    return makeResponse(`Our packages start at ₹15,999+ (Starter) and go up to ₹1,27,000+ (Enterprise). The most popular is Professional (₹32,999+). To recommend the right one, could you tell me what type of business you have?`)
  }

  // 13. Proposal Request
  if (/\b(proposal|quote|estimate|send proposal|get a quote|i want a proposal)\b/i.test(normalized)) {
    const proposalData = generateProposalFromContext(updatedContext)
    if (proposalData && updatedContext.email) {
      return makeResponse(`${namePrefix}I can generate your proposal right away. Here's a preview:\n\n**Project**: ${proposalData.scopeSummary}\n**Package**: ${proposalData.recommendedPackage.recommendedPackage}\n**Timeline**: ${proposalData.recommendedPackage.estimatedTimeline}\n**Budget**: ${proposalData.budget}\n\nI'll send this to ${updatedContext.email}. One of our team members will follow up to finalize the details.`)
    }
    if (proposalData && !updatedContext.email) {
      return makeResponse(`${namePrefix}I have enough information to prepare your proposal. Could you share your email so I can send it over?`)
    }
    return makeResponse(`${namePrefix}I'd be happy to prepare a proposal. First, I need to understand your project a bit better. Could you tell me what type of website you need?`)
  }

  // 14. Agreement / Sign
  if (/\b(agreement|sign|contract|send agreement)\b/i.test(normalized)) {
    if (updatedContext.userName && updatedContext.email) {
      return makeResponse(`${namePrefix}I can prepare the agreement. It will include the scope, pricing, timeline, and payment schedule we discussed. Our team will review it before sending it to ${updatedContext.email} for your signature. Is there anything specific you'd like included?`)
    }
    return makeResponse(`${namePrefix}to prepare the agreement, I need your email address. Could you share that?`)
  }

  // 15. Meeting / Schedule a call
  if (/\b(schedule|book a call|meeting|consultation|discuss\s+(in|over|on a)\s*call|zoom|google meet)\b/i.test(normalized)) {
    if (updatedContext.meetingRequested) {
      return makeResponse(`${namePrefix}I've noted your meeting request. Please let me know your preferred date, time, and timezone so I can schedule it. Our team typically uses Google Meet for consultations.`)
    }
    updatedContext.meetingRequested = true
    return makeResponse(`${namePrefix}sure, I can help schedule a call. What time and date works best for you? Also, what would you like to discuss during the call?`)
  }

  // 16. Discovery / Questionnaire
  if (/\b(discovery|questionnaire|form|get started|onboarding)\b/i.test(normalized)) {
    updatedContext.discoveryStarted = true
    if (!updatedContext.targetAudience) {
      return makeResponse(`${namePrefix}let's start the discovery process. First question - who is your target audience? Who will be visiting your website most often?`)
    }
    if (!updatedContext.goals || updatedContext.goals.length === 0) {
      return makeResponse(`${namePrefix}great. What are the main goals for your website? For example, generating leads, selling products, showcasing a portfolio, or providing information?`)
    }
    return makeResponse(`${namePrefix}I have enough information to start. Our team will reach out to complete the detailed discovery questionnaire. Is there anything else you'd like to add?`)
  }

  // 17. Content / Assets Collection
  if (/\b(logo|brand|color|font|image|photo|video|content|upload)\b/i.test(normalized) && !searchResult.bestMatch) {
    updatedContext.contentCollectionStarted = true
    return makeResponse(`${namePrefix}we'll need a few assets for your project:\n\n• Logo and brand colors\n• Business description and services\n• Photos or images you'd like to use\n• Any existing content or copy\n\nYou can upload these through our client portal once we start the project. For now, could you tell me if you have a logo and brand colors ready?`)
  }

  // 18. Project status (if returning)
  if (/\b(project status|where is my project|progress|timeline for my project)\b/i.test(normalized)) {
    if (updatedContext.currentPhase) {
      return makeResponse(`${namePrefix}your project is currently in the **${updatedContext.currentPhase.phase}** phase. If you need specific details about tasks, milestones, or deliverables, please contact our team directly, and they'll provide you with a full update.`)
    }
    return makeResponse(`${namePrefix}I don't see an active project associated with this conversation. Would you like to start discussing a new project?`)
  }

  // 19. Industry-specific responses (with consultant tone)
  if (/\b(gym|fitness|workout|trainer|crossfit|health club)\b/i.test(normalized)) {
    return makeResponse(`${namePrefix}for fitness studios, we build websites with class scheduling, membership registration, trainer profiles, and WhatsApp integration. The **Professional (₹32,999+)** package covers these features. Would you like to explore what's included?`)
  }

  if (/\b(restaurant|food|cafe|dining|bakery)\b/i.test(normalized)) {
    return makeResponse(`${namePrefix}for restaurants, we build sites with digital menus, table reservations, online ordering, and location maps. The **Professional (₹32,999+)** or **Business (₹59,999+)** package works well. Would you like to discuss further?`)
  }

  if (/\b(doctor|clinic|hospital|dental|healthcare|medical)\b/i.test(normalized)) {
    return makeResponse(`${namePrefix}for clinics and healthcare, we include appointment booking, doctor profiles, patient intake forms, and location pages. The **Professional (₹32,999+)** package is popular for this. Would you like more details?`)
  }

  if (/\b(clothing|clothes|store|shop|sell online|ecommerce|fashion|products)\b/i.test(normalized)) {
    return makeResponse(`${namePrefix}for online stores, we build custom e-commerce platforms with product catalogs, secure checkout, and inventory management. The **Business (₹59,999+)** package is designed for this. How many products do you plan to sell?`)
  }

  // 20. Fallback Semantic Search
  if (searchResult.bestMatch) {
    const answer = searchResult.bestMatch.detailedAnswer || searchResult.bestMatch.answer || PUBLIC_UNKNOWN_RESPONSE
    return makeResponse(answer)
  }

  // 21. Anti-Hallucination Guardrail
  return makeResponse(PUBLIC_UNKNOWN_RESPONSE)
}
