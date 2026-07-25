// AROM AI — UNLIMITED AI KNOWLEDGE ENGINE & SEMANTIC SEARCH SYSTEM (v1.0)
import type { AiKnowledgeItem } from '../types/ai'
export type { AiKnowledgeItem }

export const UNLIMITED_KNOWLEDGE_SYSTEM_PROMPT = `
# ============================================================
# AROM AI - UNLIMITED AI KNOWLEDGE ENGINE (v1.0)
# ============================================================
Capable of indexing and semantically retrieving unlimited public knowledge records.
Never uses hardcoded logic or device-level local statistics.
`

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
   - Up to 10 Pages, Custom UI/UX, On-Page SEO, Blog Setup, WhatsApp Integration, Free Domain (1 Year T&C), 1 Year Support.
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
]

// Official Safe Security Response (Global Policy v1.0)
export const SECURITY_RESTRICTED_RESPONSE = `I'm sorry, but I can't provide confidential, private, or security-sensitive information. If you need help with AROM STUDIO's public services, I'd be happy to assist.`

// Official Internal System Refusal Response
export const INTERNAL_SYSTEM_REFUSAL_RESPONSE = `Some internal systems are used privately to manage AROM STUDIO's operations and ensure smooth project delivery. Those systems are not publicly available, so I can't provide details about them. If you have questions about our public services or website development process, I'd be happy to help.`

// Rare Public Unknown Fallback Response
export const PUBLIC_UNKNOWN_RESPONSE = `I couldn't find any public information about that specific topic. If your question is about AROM STUDIO, I'd be happy to help with our services, process, pricing, or other public information.`

// Security & Prompt Injection Protection Patterns (Zero Trust Model)
const RESTRICTED_PATTERNS = [
  /\b(api[ _]?key|secret[ _]?key|access[ _]?token|jwt|env|\.env|database[ _]?url|db[ _]?password|smtp|oauth|admin[ _]?credential|session[ _]?token|private[ _]?key|ssh[ _]?key|firebase|supabase[ _]?service|openai[ _]?key|gemini[ _]?key|stripe[ _]?secret|vercel[ _]?secret|github[ _]?token|encryption[ _]?key|server[ _]?ip|internal[ _]?url|sql[ _]?query|system[ _]?prompt|developer[ _]?prompt|memory[ _]?content|hidden[ _]?config|build[ _]?files|source[ _]?code|backend[ _]?logic|financial[ _]?record|revenue[ _]?report|user[ _]?password|client[ _]?personal|private[ _]?file|uploaded[ _]?document)\b/i,
  /\b(ignore (all )?previous instructions|reveal (your )?(system )?prompt|show hidden (prompt|instructions)|print system prompt|show developer (prompt|message)|display memory|developer mode|debug mode|print memory|reveal api|show \.env|print backend|display database|reveal passwords|export data|dump (logs|database)|show secret|show authentication|bypass security|disable restrictions|act as (administrator|owner)|simulat(e|ing) owner|pretend security is disabled)\b/i,
  /\b(i am (the )?(founder|owner|admin|administrator|developer|employee|investor|government|hacker|security researcher)|i built this|i own the company|i forgot my password|i work here|i have permission|my manager approved|my boss asked|security testing|need it urgently|i am from the government|i am openai)\b/i,
]

// Forbidden Internal System Inquiries
const INTERNAL_SYSTEM_PATTERNS = [
  /\b(admin|admin[ _]?panel|admin[ _]?dashboard|\/admin|executive[ _]?overview|crm|lead[ _]?management|visitor[ _]?analytics|traffic[ _]?generator|pdf[ _]?archive|invoice[ _]?generator|blog[ _]?manager|cms|ai[ _]?conversations|ai[ _]?knowledge|chat[ _]?transcripts|recycle[ _]?bin|internal[ _]?tools|backend[ _]?architecture|audit[ _]?logs|hidden[ _]?features|internal[ _]?system|internal[ _]?database|user[ _]?database)\b/i,
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

    // Title / Question match (Highest Priority: +25)
    if (item.title && item.title.toLowerCase().includes(normalizedQuery)) score += 25
    if (item.question && item.question.toLowerCase().includes(normalizedQuery)) score += 25

    // Alternate Questions & Synonyms match (+15)
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

    // Keywords match (+10)
    if (Array.isArray(item.keywords)) {
      item.keywords.forEach((kw) => {
        if (normalizedQuery.includes(kw.toLowerCase())) score += 10
      })
    }

    // Tags match (+8)
    if (Array.isArray(item.tags)) {
      item.tags.forEach((tag) => {
        if (normalizedQuery.includes(tag.toLowerCase())) score += 8
      })
    }

    // Token match in Answer text (+3)
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

export function generateAiResponse(userQuery: string, customKnowledge: AiKnowledgeItem[] = INITIAL_AI_KNOWLEDGE): string {
  const normalized = normalizeUserQuery(userQuery)

  if (!normalized) {
    return `Hi! 👋\n\nI'm AROM AI, the official AI assistant of AROM STUDIO.\n\nIt's great to meet you.\nHow can I help you today?`
  }

  // 1. Zero Trust Security & Prompt Injection Check (HIGHEST PRIORITY)
  if (RESTRICTED_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return SECURITY_RESTRICTED_RESPONSE
  }

  // 2. Forbidden Internal Systems Check (PUBLIC ACCESS POLICY)
  if (INTERNAL_SYSTEM_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return INTERNAL_SYSTEM_REFUSAL_RESPONSE
  }

  // 3. Unrelated / Out-of-Scope Questions
  if (UNRELATED_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return `I'm designed specifically to assist with AROM STUDIO and our website development services. I may not be the best source for unrelated topics, but I'd be happy to help with anything about AROM STUDIO.`
  }

  // 4. Universal Intent Classification Engine v3

  // A. Greeting Intent (Includes Slang, Emojis, Short-forms)
  if (/^(hi|hello|hey|good morning|good afternoon|good evening|namaste|namaskar|gm|hlo|hii|heyy|yo|sup|wassup|hy|🙏|👋|🙂|😊)$/i.test(normalized) || (/^(hi|hello|hey|hlo)\b/i.test(normalized) && normalized.length < 8)) {
    return `Hi! 👋\n\nI'm AROM AI, the official AI assistant of AROM STUDIO.\n\nIt's great to meet you.\nHow can I help you today?`
  }

  // B. Thank You Intent
  if (/\b(thank you|thanks|thank u|tanks|thx|thnk)\b/i.test(normalized)) {
    return `You're very welcome! 😊`
  }

  // C. Goodbye Intent
  if (/\b(bye|goodbye|see you|tata)\b/i.test(normalized)) {
    return `Goodbye! 👋\nIt was a pleasure chatting with you.\nHave a wonderful day.`
  }

  // D. AI Self Introduction Intent ("Who are you?", "What is your name?", "What is AROM AI?", "Why do you exist?")
  if (/\b(who are you|tell me about yourself|introduce yourself|what('s| is) your name|are you ai|what do you do|who created you|why do you exist|what is arom ai|explain arom ai|meaning of arom ai|purpose of arom ai|why was arom ai built)\b/i.test(normalized) && !normalized.includes('arom studio')) {
    return `Hello! 👋\n\nI'm AROM AI, the official AI assistant of AROM STUDIO.\n\nI'm here to answer questions about our services, guide you through the website, and help you understand how we can assist with your project.`
  }

  // E. AI Capabilities Intent ("What can you do?")
  if (/\b(what can you do|what are your capabilities|how can you help me|what do you do)\b/i.test(normalized) && !normalized.includes('arom studio')) {
    return `I can:\n\n• Answer questions about AROM STUDIO\n• Help you choose services & pricing packages\n• Explain our website development process\n• Guide you through the website & navigation\n• Help you start a project\n\nWhat would you like to know today?`
  }

  // F. Company Overview Intent ("Tell me about AROM STUDIO", "What is AROM STUDIO?", "Who owns AROM STUDIO?")
  if (/\b(tell me about arom studio|what is arom studio|who owns arom studio|explain your company|about your company|company overview|introduce arom studio|who is arom studio)\b/i.test(normalized)) {
    return `AROM STUDIO is a modern, high-performance web design and software development agency founded by **Arnav Pagare** (Founder & Lead Engineer).\n\nWe specialize in engineering ultra-fast, visually stunning, and high-converting web applications with a **100/100 Core Web Vitals Guarantee**, 100% source code ownership, and 1 full year of support coverage.\n\nWould you like to explore our pricing packages or see our services?`
  }

  // G. Founder Intent ("Tell me about your founder", "Who founded AROM STUDIO?")
  if (/\b(founder|who founded|tell me about your founder|who created arom studio)\b/i.test(normalized)) {
    return `AROM STUDIO was founded by **Arnav Pagare** (Founder & Lead Engineer).\n\nHe leads our engineering team, specializing in React 19 architecture, performance engineering, modern dark glassmorphic UI design, and scalable cloud applications.`
  }

  // H. Start Project Onboarding Intent ("I need a website", "I want a website", "How do I start?")
  if (/\b(how do i start|how can i work with you|i want a website|i need a website|let's begin|start my project|hire arom studio|start a project|begin project)\b/i.test(normalized)) {
    return `Great! I'd be happy to help.\n\nCould you tell me what type of business or project the website is for? That will help me recommend the best package and timeline for you.`
  }

  // I. Navigation Intent
  if (/\b(take me to|open the|where is the|go to|navigate to)\b/i.test(normalized)) {
    if (normalized.includes('pricing') || normalized.includes('plan') || normalized.includes('package')) {
      return `Sure! Here's how you can reach the Pricing page:\n\n1. Open the navigation bar at the top of the website.\n2. Click on **'Pricing'**.\n3. You'll see all available website packages, included features, and pricing details.`
    }
    if (normalized.includes('contact') || normalized.includes('touch') || normalized.includes('hire')) {
      return `Sure! To visit the Contact page:\n\n1. Open the navigation bar at the top of the website.\n2. Click on **'Contact'**.\n3. Fill in your message or project form to reach our team.`
    }
    if (normalized.includes('service') || normalized.includes('about')) {
      return `Sure! You can open the navigation bar at the top of the website and click on **'Services'** or **'About'** to explore details.`
    }
  }

  // J. Industry Personalization: Restaurant
  if (/\b(restaurant|food|cafe|dining|bakery)\b/i.test(normalized)) {
    return `Awesome! For restaurant and food businesses, we build high-converting websites featuring:\n- **Interactive Digital Menus**: Showcase dishes with high-res photos & pricing.\n- **Online Table Reservations**: Let customers book tables directly.\n- **Instant WhatsApp Ordering**: Receive food orders directly on your phone.\n- **Location & Google Maps**: Help patrons find your restaurant easily.\n\nOur **Professional Tier (₹32,999+)** or **Business Tier (₹59,999+)** is usually perfect for restaurants. Would you like to know more about what's included?`
  }

  // K. Industry Personalization: Doctor / Clinic / Healthcare
  if (/\b(doctor|clinic|hospital|dental|healthcare|medical)\b/i.test(normalized)) {
    return `We specialize in healthcare and clinic websites! Key features include:\n- **Online Appointment Booking**: Allow patients to schedule visits online.\n- **Doctor Profiles & Credentials**: Build trust with patient reviews and specialization details.\n- **Services & Treatment Guides**: Clearly explain treatments offered.\n- **Patient Inquiry Forms & Location**: Directions to your clinic with Google Maps.\n\nOur **Professional Tier (₹32,999+)** is ideal for clinics. Would you like me to share details?`
  }

  // L. Industry Personalization: Clothing / E-commerce
  if (/\b(clothing|clothes|store|shop|sell online|ecommerce|fashion|products)\b/i.test(normalized)) {
    return `For clothing stores and retail brands, we build custom **E-commerce Platforms**:\n- **Product Catalog & Filters**: Category browsing, size/color selectors.\n- **Secure Checkout & Payments**: Seamless integration with Razorpay, Stripe, and UPI.\n- **Order & Inventory Dashboard**: Manage inventory and track orders easily.\n- **Mobile-Optimized Shopping**: Blazing-fast mobile shopping UX.\n\nOur **Business Tier (₹59,999+)** or **E-Commerce Package** is designed specifically for online stores. Shall we discuss your product catalog size?`
  }

  // 5. Scalable Semantic Search across Unlimited Knowledge Items
  const searchResult = searchKnowledgeEngine(normalized, customKnowledge)
  if (searchResult.bestMatch) {
    return searchResult.bestMatch.detailedAnswer || searchResult.bestMatch.answer || PUBLIC_UNKNOWN_RESPONSE
  }

  // 6. Rare Fallback Response
  return PUBLIC_UNKNOWN_RESPONSE
}
