// AROM STUDIO — AROM AI CONVERSATION ENGINE (HIGHEST PRIORITY) & GLOBAL SECURITY POLICY v2.0

export interface AiKnowledgeItem {
  id: string
  category: 'company' | 'services' | 'pricing' | 'process' | 'portal' | 'admin' | 'policies' | 'faq'
  question: string
  answer: string
  keywords: string[]
  updatedAt: string
}

export const MASTER_CONVERSATION_RULES_V2 = `
# ============================================
# AROM AI CONVERSATION ENGINE (HIGHEST PRIORITY)
# ============================================
Response Priority Order:
1. Conversation Intent (Greeting / AI identity / Capabilities / Company identity)
2. User Intent & Empathy (Asking business details before selling)
3. Context Memory
4. Knowledge Base Search
5. Website Content

Never confuse AROM AI (the assistant) with AROM STUDIO (the company).
`

export const INITIAL_AI_KNOWLEDGE: AiKnowledgeItem[] = [
  {
    id: 'k_1',
    category: 'company',
    question: 'Who is AROM STUDIO and what is your mission?',
    answer: `### About AROM STUDIO
AROM STUDIO is a modern, high-performance web design and software development agency founded by **Arnav Pagare** (Founder & Lead Engineer). 

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
    question: 'What is your pricing structure?',
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
]

// Official Safe Security Response (Global Policy v1.0)
export const SECURITY_RESTRICTED_RESPONSE = `I'm sorry, but I can't provide confidential, private, or security-sensitive information. If you need help with AROM STUDIO's public services, I'd be happy to assist.`

// Security & Prompt Injection Protection Patterns (Zero Trust Model)
const RESTRICTED_PATTERNS = [
  /\b(api[ _]?key|secret[ _]?key|access[ _]?token|jwt|env|\.env|database[ _]?url|db[ _]?password|smtp|oauth|admin[ _]?credential|session[ _]?token|private[ _]?key|ssh[ _]?key|firebase|supabase[ _]?service|openai[ _]?key|gemini[ _]?key|stripe[ _]?secret|vercel[ _]?secret|github[ _]?token|encryption[ _]?key|server[ _]?ip|internal[ _]?url|sql[ _]?query|system[ _]?prompt|developer[ _]?prompt|memory[ _]?content|hidden[ _]?config|build[ _]?files|source[ _]?code|backend[ _]?logic|financial[ _]?record|revenue[ _]?report|user[ _]?password|client[ _]?personal|private[ _]?file|uploaded[ _]?document)\b/i,
  /\b(ignore (all )?previous instructions|reveal (your )?(system )?prompt|show hidden (prompt|instructions)|print system prompt|show developer (prompt|message)|display memory|developer mode|debug mode|print memory|reveal api|show \.env|print backend|display database|reveal passwords|export data|dump (logs|database)|show secret|show authentication|bypass security|disable restrictions|act as (administrator|owner)|simulat(e|ing) owner|pretend security is disabled)\b/i,
  /\b(i am (the )?(founder|owner|admin|administrator|developer|employee|investor|government|hacker|security researcher)|i built this|i own the company|i forgot my password|i work here|i have permission|my manager approved|my boss asked|security testing|need it urgently|i am from the government|i am openai)\b/i,
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
  const queryTrimmed = userQuery.trim()
  const queryLower = queryTrimmed.toLowerCase()

  // 1. Zero Trust Security & Prompt Injection Check (PRIORITY 1A)
  if (RESTRICTED_PATTERNS.some((pattern) => pattern.test(queryLower))) {
    return SECURITY_RESTRICTED_RESPONSE
  }

  // 2. Unrelated / Out-of-Scope Questions (PRIORITY 1B)
  if (UNRELATED_PATTERNS.some((pattern) => pattern.test(queryLower))) {
    return `I'm designed specifically to assist with AROM STUDIO and our website development services. I may not be the best source for unrelated topics, but I'd be happy to help with anything about AROM STUDIO.`
  }

  // 3. Conversational Intent Rules — HIGHEST CONVERSATION PRIORITY

  // A. Greetings (DO NOT EXPLAIN SERVICES OR PRICING)
  if (/^(hi|hello|hey|good morning|good afternoon|good evening|namaste|hlo|hii|heyy)$/i.test(queryLower)) {
    return `Hi! 👋\n\nI'm AROM AI.\nNice to meet you.\nHow can I help you today?`
  }

  // B. Thank You
  if (/\b(thank you|thanks|thank u|tanks|thx)\b/i.test(queryLower)) {
    return `You're very welcome! 😊`
  }

  // C. Goodbye
  if (/\b(bye|goodbye|see you|tata)\b/i.test(queryLower)) {
    return `Goodbye! 👋\nIt was a pleasure chatting with you.\nHave a wonderful day.`
  }

  // D. Ask about AI Identity ("Who are you?", "What is your name?", "Are you AI?")
  if (/\b(who are you|what is your name|who made you|are you ai|what are you|introduce yourself)\b/i.test(queryLower) && !queryLower.includes('arom studio')) {
    return `Hello! 👋\n\nI'm AROM AI, the official AI assistant of AROM STUDIO.\n\nI'm here to help visitors learn about our services, guide them through the website, answer questions, and assist them throughout their journey.\n\nHow can I help you today?`
  }

  // E. Ask about AI Capabilities ("What can you do?")
  if (/\b(what can you do|what are your capabilities|how can you help me|what do you do)\b/i.test(queryLower) && !queryLower.includes('arom studio')) {
    return `I can:\n\n• Answer questions about AROM STUDIO\n• Help you choose services\n• Explain pricing\n• Guide you through the website\n• Help you start a project\n• Answer FAQs\n• Assist with navigation\n\nWhat would you like to know today?`
  }

  // F. Ask about Company Identity ("Who is AROM STUDIO?")
  if (/\b(who is arom studio|what is arom studio|tell me about arom studio|about arom studio)\b/i.test(queryLower)) {
    return `AROM STUDIO is a modern, high-performance web design and software development agency founded by **Arnav Pagare** (Founder & Lead Engineer).\n\nWe specialize in engineering ultra-fast, visually stunning, and high-converting web applications with a **100/100 Core Web Vitals Guarantee**, 100% source code ownership, and 1 full year of support coverage.`
  }

  // G. Ask about Founder ("Tell me about your founder", "Who founded AROM STUDIO?")
  if (/\b(founder|who founded|tell me about your founder|who created arom studio)\b/i.test(queryLower)) {
    return `AROM STUDIO was founded by **Arnav Pagare** (Founder & Lead Engineer).\n\nHe leads our engineering team, specializing in React 19 architecture, performance engineering, modern dark glassmorphic UI design, and scalable cloud applications.`
  }

  // H. Navigation Guidance: Pricing
  if (/\b(take me to pricing|where is pricing|how to find pricing|show pricing page)\b/i.test(queryLower)) {
    return `Sure! Here's how you can reach the Pricing page:\n\n1. Open the navigation bar at the top of the website.\n2. Click on **'Pricing'**.\n3. You'll see all available website packages, included features, and pricing details.\n\nIf you're on the homepage, simply click the **'Pricing'** option in the main navigation.`
  }

  // I. Task Guidance: Start Project
  if (/\b(start a project|start project|build my site|hire you|want a website|need a site|begin project)\b/i.test(queryLower) && !queryLower.includes('cost') && !queryLower.includes('price')) {
    return `Great! I'd be happy to help.\n\nCould you tell me what type of business or project the website is for?`
  }

  // J. Empathy: Don't know which package to choose
  if (/\b(don't know|dont know|not sure|confused|which package|recommend package)\b/i.test(queryLower)) {
    return `No worries! I'd be happy to help.\n\nCould you tell me a little about your business and what you'd like your website to achieve? That will help me recommend the most suitable option.`
  }

  // K. Industry Personalization: Restaurant
  if (/\b(restaurant|food|cafe|dining|bakery)\b/i.test(queryLower)) {
    return `Awesome! For restaurant and food businesses, we build high-converting websites featuring:\n- **Interactive Digital Menus**: Showcase dishes with high-res photos & pricing.\n- **Online Table Reservations**: Let customers book tables directly.\n- **Instant WhatsApp Ordering**: Receive food orders directly on your phone.\n- **Location & Google Maps**: Help patrons find your restaurant easily.\n\nOur **Professional Tier (₹32,999+)** or **Business Tier (₹59,999+)** is usually perfect for restaurants. Would you like to know more about what's included?`
  }

  // L. Industry Personalization: Doctor / Clinic / Healthcare
  if (/\b(doctor|clinic|hospital|dental|healthcare|medical)\b/i.test(queryLower)) {
    return `We specialize in healthcare and clinic websites! Key features include:\n- **Online Appointment Booking**: Allow patients to schedule visits online.\n- **Doctor Profiles & Credentials**: Build trust with patient reviews and specialization details.\n- **Services & Treatment Guides**: Clearly explain treatments offered.\n- **Patient Inquiry Forms & Location**: Directions to your clinic with Google Maps.\n\nOur **Professional Tier (₹32,999+)** is ideal for clinics. Would you like me to share details?`
  }

  // M. Industry Personalization: Clothing / E-commerce
  if (/\b(clothing|clothes|store|shop|sell online|ecommerce|fashion|products)\b/i.test(queryLower)) {
    return `For clothing stores and retail brands, we build custom **E-commerce Platforms**:\n- **Product Catalog & Filters**: Category browsing, size/color selectors.\n- **Secure Checkout & Payments**: Seamless integration with Razorpay, Stripe, and UPI.\n- **Order & Inventory Dashboard**: Manage inventory and track orders easily.\n- **Mobile-Optimized Shopping**: Blazing-fast mobile shopping UX.\n\nOur **Business Tier (₹59,999+)** or **E-Commerce Package** is designed specifically for online stores. Shall we discuss your product catalog size?`
  }

  // 4. Quick Category Matches
  if (queryLower.includes('cost') || queryLower.includes('price') || queryLower.includes('pricing') || queryLower.includes('package') || queryLower.includes('plan')) {
    const item = customKnowledge.find((k) => k.category === 'pricing')
    if (item) return item.answer
  }

  if (queryLower.includes('service') || queryLower.includes('what do you do') || queryLower.includes('what do you offer')) {
    const item = customKnowledge.find((k) => k.category === 'services')
    if (item) return item.answer
  }

  if (queryLower.includes('process') || queryLower.includes('timeline') || queryLower.includes('how long') || queryLower.includes('duration')) {
    const item = customKnowledge.find((k) => k.category === 'process')
    if (item) return item.answer
  }

  if (queryLower.includes('contact') || queryLower.includes('email') || queryLower.includes('phone') || queryLower.includes('reach out')) {
    return `You can reach AROM STUDIO easily through any of these channels:\n\n• **Email**: aromstudio27@gmail.com\n• **WhatsApp / Call**: +91 8767990061\n• **Contact Page**: Open 'Contact' from the top navigation to submit your project form.\n\nOur team typically responds within 2 hours!`
  }

  if (queryLower.includes('track') || queryLower.includes('portal') || queryLower.includes('client portal') || queryLower.includes('agreement') || queryLower.includes('handover')) {
    const item = customKnowledge.find((k) => k.category === 'portal')
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

  // 5. Keyword Scoring Matcher
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

  // 6. Helpful Fallback
  return `I'm not completely sure about that specific detail.

I'd recommend contacting the AROM STUDIO team directly for the most accurate information.

Would you like me to explain our services, pricing packages, or how to get started?`
}
