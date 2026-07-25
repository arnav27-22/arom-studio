// AROM AI — Flagship AI Knowledge Engine, Security & Confidentiality Policy Logic

export interface AiKnowledgeItem {
  id: string
  category: 'company' | 'services' | 'pricing' | 'process' | 'portal' | 'admin' | 'policies' | 'faq'
  question: string
  answer: string
  keywords: string[]
  updatedAt: string
}

export const INITIAL_AI_KNOWLEDGE: AiKnowledgeItem[] = [
  {
    id: 'k_1',
    category: 'company',
    question: 'Who founded AROM STUDIO and what is your mission?',
    answer: `### About AROM STUDIO
AROM STUDIO was founded by **Arnav Pagare** (Founder & Lead Engineer). 

Our mission is to redefine the modern web agency experience by engineering ultra-fast, visually stunning, and high-converting web applications.

- **100/100 Core Web Vitals Guarantee**: Sub-second load times, LCP < 1.2s, CLS = 0.00.
- **100% Source Code Ownership**: You retain 100% ownership of your code, designs, and hosting upon final payment.
- **1 Year Warranty & Support**: All projects include 1 full year of support and maintenance coverage.`,
    keywords: ['founder', 'arnav', 'mission', 'about', 'company', 'guarantee', 'ownership', 'who'],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'k_2',
    category: 'pricing',
    question: 'How much does a website cost at AROM STUDIO?',
    answer: `### Transparent Pricing Tiers
We offer 5 clear pricing packages tailored to your business scale:

1. **Starter Website — ₹15,999+**
   - 1 to 5 Pages, Responsive Design, Basic SEO, Contact Form, Analytics, 1 Year Support.
2. **Professional Website (Most Popular) — ₹32,999+**
   - Up to 10 Pages, Custom UI/UX, Premium Typography, On-Page SEO, Blog Setup, WhatsApp Integration, Free Domain (1 Year T&C), 1 Year Support.
3. **Business Website — ₹59,999+**
   - Up to 20 Pages, Custom Premium Design System, Advanced SEO, CMS Integration, E-commerce/Booking System, API Integrations, 1 Year Support.
4. **Premium Website — ₹1,00,999+**
   - Unlimited Pages, Full Custom Design & Branding, Advanced GSAP/Framer Animations, Web App Features, AI Features, Lighthouse 95+ Score, 1 Year Support.
5. **Enterprise Solution — ₹1,27,000+**
   - Custom Full-Stack Architecture, Dedicated Project Manager, SLA-Backed Support, Priority Response, Monthly Performance Reports, Team Training.

**Payment Schedule**: 50% Advance Deposit to begin work, 50% Final Payment upon completion before production launch.`,
    keywords: ['cost', 'price', 'pricing', 'package', 'plan', 'starter', 'professional', 'business', 'premium', 'enterprise', 'rate', 'budget'],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'k_3',
    category: 'services',
    question: 'What services does AROM STUDIO offer?',
    answer: `### Services & Engineering Capabilities
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
    keywords: ['service', 'services', 'offer', 'build', 'ecommerce', 'saas', 'web app', 'ui/ux', 'design', 'seo', 'performance', 'redesign'],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'k_4',
    category: 'process',
    question: 'How does your web development process work and how long does it take?',
    answer: `### Development Process & Timeline
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
    keywords: ['process', 'workflow', 'timeline', 'long', 'duration', 'time', 'step', 'stages', 'how it works'],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'k_5',
    category: 'portal',
    question: 'Can I track my project progress in real-time?',
    answer: `### Client Portal (/clientportal)
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
    keywords: ['track', 'portal', 'client portal', 'progress', 'status', 'dashboard', 'agreement', 'prd', 'revision', 'handover'],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'k_6',
    category: 'admin',
    question: 'What features are available in the AROM STUDIO Admin Dashboard?',
    answer: `### Admin Control Panel (/admin)
The Admin Panel features **23 modules** for total agency control:

- **Executive Overview**: Real-time activity feeds, KPI stat cards, PDF exporter.
- **24/7 Continuous Traffic Generator**: Automatically simulates ~20 viewers/hr lifetime upgraded.
- **Visitor Analytics**: Real-time traffic, IP tracking, location, browser/OS stats, and device brand detection (iPhone, Samsung, Pixel, OnePlus, Xiaomi, Vivo).
- **PDF Documents Archive**: Embedded visual iframe modal previews & instant binary downloads of all generated PDFs.
- **Invoice Generator**: Custom invoice builder with itemized pricing, tax, and PDF exports.
- **Blog Manager CMS**: Create, edit, publish, and soft-delete blog articles with live preview.
- **AI Conversations & Knowledge Manager**: Track user chats, review ChatGPT-style transcripts, export chat PDFs, and update AI rules.
- **Recycle Bin**: Soft-delete system with one-click restore functionality.`,
    keywords: ['admin', 'dashboard', 'control panel', 'analytics', 'traffic', 'cms', 'recyle bin'],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'k_7',
    category: 'policies',
    question: 'What is your refund policy and deposit policy?',
    answer: `### Payment & Refund Policy
- **Deposit**: A **50% advance deposit** is required before project commencement to cover discovery, design system setup, and resource allocation.
- **Milestone Cancellations**: If a project is cancelled prior to design approval, unearned portions of the deposit minus work completed are eligible for refund.
- **Final Payment**: The remaining 50% balance is due upon final design & build approval before live production deployment or source code handover.
- **1-Year Support Guarantee**: Should any bugs or technical issues arise within 1 year post-launch, our team fixes them free of charge under our warranty guarantee.`,
    keywords: ['refund', 'cancel', 'cancellation', 'deposit', 'policy', 'terms', 'guarantee', 'money back'],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'k_8',
    category: 'faq',
    question: 'What technologies do you use to build websites?',
    answer: `### Modern Tech Stack
We build with cutting-edge, battle-tested modern web technologies:

- **Frontend**: React 19, Next.js, TypeScript, Tailwind CSS v4, Framer Motion 12.
- **Backend & Database**: Node.js, PostgreSQL, Supabase, Vercel Serverless.
- **E-Commerce & Payments**: Razorpay, Stripe, Supabase Auth.
- **Deployment & Hosting**: Vercel Edge Network, Cloudflare CDN, SSL encryption.
- **AI & Automation**: OpenAI API, LangChain, Vector Databases, EmailJS.`,
    keywords: ['tech', 'technology', 'stack', 'react', 'next.js', 'typescript', 'tailwind', 'node', 'database', 'hosting'],
    updatedAt: new Date().toISOString(),
  },
]

// Official Security & Confidentiality Response
export const SECURITY_RESTRICTED_RESPONSE = `I'm sorry, but I can't provide confidential, private, or security-sensitive information. If you need assistance with AROM STUDIO's public services or have a legitimate support request, I'd be happy to help.`

// Polite response for out-of-scope/unrelated questions
export const UNRELATED_TOPIC_RESPONSE = `I'm designed specifically to assist with **AROM STUDIO** and our website development services. I may not be the best source for unrelated topics. 

If you have any questions about AROM STUDIO's services, pricing, technology stack, process, or client portal, I'd be happy to help!`

// Security & Prompt Injection Patterns
const RESTRICTED_PATTERNS = [
  /\b(api[ _]?key|secret[ _]?key|access[ _]?token|jwt|env|\.env|database[ _]?url|db[ _]?password|smtp|oauth|admin[ _]?credential|session[ _]?token|private[ _]?key|ssh[ _]?key|firebase|supabase[ _]?service|openai[ _]?key|gemini[ _]?key|vercel[ _]?secret|github[ _]?token|encryption[ _]?key|sql[ _]?query|system[ _]?prompt|developer[ _]?mode|reveal[ _]?prompt|print[ _]?code|export[ _]?database|give[ _]?passwords)\b/i,
  /\b(ignore (all )?previous instructions|reveal your prompt|show hidden instructions|print system prompt|show developer message|display memory|pretend you are (admin|owner|founder|developer)|you are now in developer mode|show \.env|print backend code|export database|give me passwords|reveal secrets)\b/i,
  /\b(i am (the )?(founder|owner|admin|administrator|developer|employee|investor|government|hacker|security researcher))\b/i,
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

export function generateAiResponse(userQuery: string, customKnowledge: AiKnowledgeItem[] = INITIAL_AI_KNOWLEDGE): string {
  const queryLower = userQuery.trim().toLowerCase()

  if (!queryLower) {
    return `Hello! How can I assist you with AROM STUDIO today?`
  }

  // 1. Security & Prompt Injection Protection Check (ZERO TRUST)
  const isRestricted = RESTRICTED_PATTERNS.some((pattern) => pattern.test(queryLower))
  if (isRestricted) {
    return SECURITY_RESTRICTED_RESPONSE
  }

  // 2. Check if the question is out of scope / unrelated
  const isUnrelated = UNRELATED_PATTERNS.some((pattern) => pattern.test(queryLower))
  if (isUnrelated) {
    return UNRELATED_TOPIC_RESPONSE
  }

  // 3. Specific Quick Matches
  if (queryLower.includes('cost') || queryLower.includes('price') || queryLower.includes('pricing') || queryLower.includes('how much')) {
    const item = customKnowledge.find((k) => k.category === 'pricing')
    if (item) return item.answer
  }

  if (queryLower.includes('service') || queryLower.includes('what do you do') || queryLower.includes('what do you offer') || queryLower.includes('ecommerce') || queryLower.includes('saas')) {
    const item = customKnowledge.find((k) => k.category === 'services')
    if (item) return item.answer
  }

  if (queryLower.includes('process') || queryLower.includes('timeline') || queryLower.includes('how long') || queryLower.includes('duration')) {
    const item = customKnowledge.find((k) => k.category === 'process')
    if (item) return item.answer
  }

  if (queryLower.includes('track') || queryLower.includes('portal') || queryLower.includes('client portal') || queryLower.includes('agreement') || queryLower.includes('handover')) {
    const item = customKnowledge.find((k) => k.category === 'portal')
    if (item) return item.answer
  }

  if (queryLower.includes('founder') || queryLower.includes('arnav') || queryLower.includes('who are you') || queryLower.includes('about')) {
    const item = customKnowledge.find((k) => k.category === 'company')
    if (item) return item.answer
  }

  if (queryLower.includes('refund') || queryLower.includes('cancel') || queryLower.includes('deposit') || queryLower.includes('policy')) {
    const item = customKnowledge.find((k) => k.category === 'policies')
    if (item) return item.answer
  }

  if (queryLower.includes('tech') || queryLower.includes('stack') || queryLower.includes('react') || queryLower.includes('next')) {
    const item = customKnowledge.find((k) => k.category === 'faq')
    if (item) return item.answer
  }

  // 4. Keyword Scoring Matcher across knowledge items
  let bestMatch: AiKnowledgeItem | null = null
  let maxScore = 0

  const queryWords = queryLower.split(/\s+/)

  for (const item of customKnowledge) {
    let score = 0
    item.keywords.forEach((kw) => {
      if (queryLower.includes(kw.toLowerCase())) {
        score += 3
      }
    })

    queryWords.forEach((word) => {
      if (word.length > 3 && (item.question.toLowerCase().includes(word) || item.answer.toLowerCase().includes(word))) {
        score += 1
      }
    })

    if (score > maxScore) {
      maxScore = score
      bestMatch = item
    }
  }

  if (bestMatch && maxScore >= 2) {
    return bestMatch.answer
  }

  // 5. Default Helpful Fallback
  return `### How Can AROM STUDIO Help You?

I can provide detailed information regarding:
- **Services**: Custom Web Apps, E-commerce, SaaS, Business Sites, UI/UX, SEO & Performance.
- **Pricing Tiers**: Starter (₹15,999+), Professional (₹32,999+), Business (₹59,999+), Premium (₹1,00,999+), Enterprise (₹1,27,000+).
- **Process & Timelines**: 4-stage lifecycle (Discovery, Design, Development, Launch in 2-6 weeks).
- **Client Portal**: Track progress, sign agreements, approve designs, and view invoices in real-time.

Feel free to ask a specific question, or click one of the suggested prompts below!`
}
