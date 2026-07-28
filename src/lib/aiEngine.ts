// AROM AI — INTELLIGENT REASONING & RESPONSE ENGINE (Version 5.0)
import type { AiKnowledgeItem } from '../types/ai'
import type { AiContext } from './aiStore'
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
    if (/\b(proposal|quote|estimat)/i.test(lower)) this.context.proposalRequested = true
    if (/\b(agreement|sign|contract)/i.test(lower)) this.context.agreementSigned = true

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
    if (ctx.discussedTopics.length > 0) parts.push(`Discussed: ${ctx.discussedTopics.join(', ')}`)
    if (ctx.needsSEO) parts.push('Needs SEO')
    if (ctx.needsMaintenance) parts.push('Needs Maintenance')
    if (ctx.proposalRequested) parts.push('Proposal requested')
    if (ctx.features && ctx.features.length > 0) parts.push(`Features: ${ctx.features.join(', ')}`)
    return parts.join(' | ')
  }

  greetMessage(): string {
    const name = this.context.userName
    const lang = this.context.language

    if (lang === 'mr') {
      return `नमस्कार${name ? ' ' + name : ''}! 👋\n\nमी AROM AI आहे, AROM STUDIO चा अधिकृत AI सहाय्यक.\n\nतुमचं स्वागत आहे. मी तुम्हाला आमच्या सेवा, प्राइसिंग, वेबसाइट डेव्हलपमेंट प्रक्रिया आणि बरंच काही याबद्दल मदत करू शकतो.\n\nकृपया मला सांगा की मी तुम्हाला कशी मदत करू शकतो?`
    }
    if (lang === 'hi') {
      return `नमस्ते${name ? ' ' + name : ''}! 👋\n\nमैं AROM AI हूँ, AROM STUDIO का आधिकारिक AI सहायक.\n\nआपका स्वागत है। मैं हमारी सेवाओं, मूल्य निर्धारण, वेबसाइट डेवलपमेंट प्रक्रिया और बहुत कुछ के बारे में आपकी मदद कर सकता हूँ।\n\nकृपया मुझे बताएं कि मैं आपकी कैसे मदद कर सकता हूँ?`
    }

    if (name && this.context.discussedTopics.length === 0) {
      const summary = this.context.conversationSummary
      if (summary) {
        return `Welcome back, ${name}! 👋\n\nI remember our previous conversation — ${summary}\n\nHow can I help you today?`
      }
      return `Welcome back, ${name}! 👋\n\nGreat to see you again. How can I help you with your project today?`
    }
    return `Hi${name ? ' ' + name : ''}! 👋\n\nI'm AROM AI, the official AI assistant of AROM STUDIO.\n\nIt's great to meet you.\nHow can I help you today?`
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

function generateSingleFollowUp(context: AiContext, responseText: string): string[] {
  const down = responseText.toLowerCase()

  if (!context.budget && (down.includes('price') || down.includes('cost') || down.includes('package') || down.includes('tier'))) {
    return ['What budget range are you considering for your website?']
  }

  if (!context.projectType && (down.includes('build') || down.includes('start') || down.includes('website'))) {
    return ['What type of website are you planning to build? For example, a business website, e-commerce store, portfolio, or something else?']
  }

  if (context.projectType && !context.preferredPackage && !down.includes('starter') && !down.includes('professional')) {
    const questions: Record<string, string> = {
      gym: 'Would you like to start with our Professional (₹32,999+) or Business (₹59,999+) package for your fitness studio?',
      restaurant: 'Would the Professional (₹32,999+) or Business (₹59,999+) package work best for your restaurant?',
      clinic: 'Our Professional package (₹32,999+) is popular for clinics. Would you like to explore it?',
      ecommerce: 'For your online store, our Business package (₹59,999+) is ideal. Shall we discuss it?',
    }
    return [questions[context.projectType] || 'Would you like me to recommend a package for your project?']
  }

  if (!context.timeline && (context.budget || context.preferredPackage)) {
    return ['What timeline are you targeting for your website launch?']
  }

  if (context.projectType && INDUSTRY_FOLLOW_UPS[context.projectType]) {
    return [INDUSTRY_FOLLOW_UPS[context.projectType][0]]
  }

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

  return [FOLLOW_UP_MAP['default'][0]]
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
      followUps: FOLLOW_UP_MAP['default'].slice(0, 3),
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
    // For pricing answers, append recommendation
    if (searchResult.bestMatch.category === 'Pricing' && updatedContext.projectType) {
      const rec = smartRecommend(updatedContext)
      return makeResponse(`${answer}\n\n**Recommendation for you**: Based on your project type, I recommend the **${rec.recommendedPackage}** package with an estimated timeline of **${rec.estimatedTimeline}**.\n\nSuggested features: ${rec.suggestedFeatures.join(', ')}.`)
    }
    return makeResponse(answer)
  }

  // 4. Greeting
  if (/^(hi|hello|hey|good morning|good afternoon|good evening|namaste|namaskar|gm|hlo|hii|heyy|yo|sup|wassup|hy|🙏|👋|🙂|😊)$/i.test(normalized) || (/^(hi|hello|hey|hlo)\b/i.test(normalized) && normalized.length < 8)) {
    if (updatedContext.userName || updatedContext.discussedTopics.length > 0) {
      return makeResponse(`Welcome back${name ? ' ' + name : ''}! 👋\n\nHow can I help you today?`)
    }
    return makeResponse(ctxManager.greetMessage())
  }

  // 5. Thank You
  if (/\b(thank you|thanks|thank u|tanks|thx|thnk)\b/i.test(normalized)) {
    return makeResponse(`You're very welcome${name ? ', ' + name : ''}! 😊\n\nIs there anything else I can help you with?`)
  }

  // 6. Goodbye
  if (/\b(bye|goodbye|see you|tata)\b/i.test(normalized)) {
    return makeResponse(`Goodbye, ${namePrefix}it was a pleasure chatting with you. Have a wonderful day! 👋\n\nFeel free to reach out anytime you need help with your website.`)
  }

  // 7. AI Self Intro
  if (/\b(who are you|tell me about yourself|introduce yourself|what('s| is) your name|are you ai|what do you do|who created you|why do you exist|what is arom ai|explain arom ai|meaning of arom ai|purpose of arom ai)\b/i.test(normalized) && !normalized.includes('arom studio')) {
    return makeResponse(`Hello${name ? ' ' + name : ''}! 👋\n\nI'm AROM AI, the official AI assistant of AROM STUDIO. I'm here to answer questions about our services, guide you through the website, and help you understand how we can bring your project to life. What would you like to know?`)
  }

  // 8. AI Capabilities
  if (/\b(what can you do|what are your capabilities|how can you help me|what do you do)\b/i.test(normalized) && !normalized.includes('arom studio')) {
    return makeResponse(`${namePrefix}I can:\n\n• Answer questions about AROM STUDIO\n• Help you choose services & pricing packages\n• Explain our website development process\n• Guide you through the website & navigation\n• Help you start a project\n\nWhat would you like to know today?`)
  }

  // 9. Company Overview
  if (/\b(tell me about arom studio|what is arom studio|who owns arom studio|explain your company|about your company|company overview|introduce arom studio|who is arom studio)\b/i.test(normalized)) {
    return makeResponse(`${namePrefix}AROM STUDIO is a modern, high-performance web design and software development agency founded by **Arnav Pagare** (Founder & Lead Engineer).\n\nWe specialize in engineering ultra-fast, visually stunning, and high-converting web applications with a **100/100 Core Web Vitals Guarantee**, 100% source code ownership, and 1 full year of support coverage.\n\nWould you like to explore our pricing packages or see our services?`)
  }

  // 10. Founder
  if (/\b(founder|who founded|tell me about your founder|who created arom studio)\b/i.test(normalized)) {
    return makeResponse(`AROM STUDIO was founded by **Arnav Pagare** (Founder & Lead Engineer). He leads our engineering team, specializing in React 19 architecture, performance engineering, and scalable cloud applications.`)
  }

  // 11. Start Project
  if (/\b(how do i start|how can i work with you|i want a website|i need a website|let's begin|start my project|hire arom studio|start a project|begin project)\b/i.test(normalized)) {
    return makeResponse(`${namePrefix}I'd be happy to help you get started!\n\nHere's how our seamless onboarding works:\n1. **Tell us about your business**: Share your goals, features needed, and target audience.\n2. **Package Recommendation**: We guide you to the exact tier that fits your scope.\n3. **Discovery & Onboarding**: Fill out our Discovery Questionnaire.\n4. **Build & Launch**: We engineer your website with sub-second speed and 1-year warranty.\n\nCould you tell me what type of business or project this is for?`)
  }

  // 12. Package Recommendation
  if (/\b(which package|recommend package|what package|choose package|don't know|dont know|not sure|confused)\b/i.test(normalized) && !normalized.includes('gym') && !normalized.includes('restaurant') && !normalized.includes('clinic')) {
    return makeResponse(`${namePrefix}I'd be happy to recommend the perfect package!\n\nHere is a quick overview of our most popular tiers:\n- **Starter (₹15,999+)**: Perfect for small business landing pages (1-5 pages).\n- **Professional (₹32,999+)**: Ideal for growing businesses needing custom UI and SEO (up to 10 pages).\n- **Business (₹59,999+)**: Built for e-commerce, custom booking systems, and APIs (up to 20 pages).\n\nWhat type of business are you planning the website for?`)
  }

  // 13. Industry: Gym
  if (/\b(gym|fitness|workout|trainer|crossfit|health club)\b/i.test(normalized)) {
    return makeResponse(`We specialize in fitness and gym studio websites! Key features:\n- **Interactive Class Schedules & Timetables**\n- **Online Membership Booking & Registration**\n- **Trainer Profiles & Testimonials**\n- **WhatsApp Lead Capture & Maps**\n\nOur **Professional Tier (₹32,999+)** or **Business Tier (₹59,999+)** is usually ideal for gym studios. Would you like to explore what's included?`)
  }

  // 14. Industry: Restaurant
  if (/\b(restaurant|food|cafe|dining|bakery)\b/i.test(normalized)) {
    return makeResponse(`For restaurant and food businesses, we build high-converting websites featuring:\n- **Interactive Digital Menus** with photos & pricing\n- **Online Table Reservations**\n- **Instant WhatsApp Ordering**\n- **Location & Google Maps**\n\nOur **Professional Tier (₹32,999+)** or **Business Tier (₹59,999+)** is usually perfect for restaurants. Would you like to know more?`)
  }

  // 15. Industry: Clinic
  if (/\b(doctor|clinic|hospital|dental|healthcare|medical)\b/i.test(normalized)) {
    return makeResponse(`We specialize in healthcare and clinic websites! Key features:\n- **Online Appointment Booking**\n- **Doctor Profiles & Credentials**\n- **Services & Treatment Guides**\n- **Patient Inquiry Forms & Location**\n\nOur **Professional Tier (₹32,999+)** is ideal for clinics. Would you like me to share details?`)
  }

  // 16. Industry: E-commerce
  if (/\b(clothing|clothes|store|shop|sell online|ecommerce|fashion|products)\b/i.test(normalized)) {
    return makeResponse(`For clothing stores and retail brands, we build custom **E-commerce Platforms**:\n- **Product Catalog & Filters** with size/color selectors\n- **Secure Checkout** with Razorpay, Stripe, UPI\n- **Order & Inventory Dashboard**\n- **Mobile-Optimized Shopping**\n\nOur **Business Tier (₹59,999+)** is designed for online stores. Shall we discuss your product catalog size?`)
  }

  // 17. Fallback Semantic Search (for low-confidence matches)
  if (searchResult.bestMatch) {
    const answer = searchResult.bestMatch.detailedAnswer || searchResult.bestMatch.answer || PUBLIC_UNKNOWN_RESPONSE
    return makeResponse(answer)
  }

  // 18. Anti-Hallucination Guardrail
  return makeResponse(PUBLIC_UNKNOWN_RESPONSE)
}
