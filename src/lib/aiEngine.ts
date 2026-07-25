// AROM STUDIO — UNIVERSAL QUESTION UNDERSTANDING ENGINE (v3)

export interface AiKnowledgeItem {
  id: string
  category: 'company' | 'services' | 'pricing' | 'process' | 'portal' | 'policies' | 'faq'
  question: string
  answer: string
  keywords: string[]
  updatedAt: string
}

export const UNIVERSAL_ENGINE_SYSTEM_PROMPT = `
# ==========================================================
# AROM AI – UNIVERSAL QUESTION UNDERSTANDING ENGINE (v3)
# ==========================================================
1. Never rely only on exact keyword matching.
2. Always identify underlying intent regardless of phrasing variations.
3. Combine relevant public information across categories when answering complex queries.
4. Never say "I don't have that information" if public knowledge exists.
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
    keywords: ['founder', 'arnav', 'mission', 'about', 'company', 'guarantee', 'ownership', 'who', 'overview'],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'k_2',
    category: 'pricing',
    question: 'What is your pricing structure and packages?',
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
    keywords: ['cost', 'price', 'pricing', 'package', 'plan', 'starter', 'professional', 'business', 'premium', 'enterprise', 'rate', 'budget', 'estimate', 'quotation'],
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
    keywords: ['service', 'services', 'offer', 'build', 'ecommerce', 'saas', 'web app', 'ui/ux', 'design', 'seo', 'performance', 'redesign', 'portfolio'],
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
    keywords: ['process', 'workflow', 'timeline', 'long', 'duration', 'time', 'step', 'stages', 'how it works', 'completion', 'delivery'],
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

// Official Internal System Refusal Response
export const INTERNAL_SYSTEM_REFUSAL_RESPONSE = `Some internal systems are used privately to manage AROM STUDIO's operations and ensure smooth project delivery. Those systems are not publicly available, so I can't provide details about them. If you have questions about our public services or website development process, I'd be happy to help.`

// Standard Public Unknown Response
export const PUBLIC_UNKNOWN_RESPONSE = `I couldn't find any public information about that. If you'd like, I can help you with another question about AROM STUDIO.`

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

export function generateAiResponse(userQuery: string, customKnowledge: AiKnowledgeItem[] = INITIAL_AI_KNOWLEDGE): string {
  const queryTrimmed = userQuery.trim()
  const queryLower = queryTrimmed.toLowerCase()

  if (!queryLower) {
    return `Hi! 👋\n\nI'm AROM AI.\nNice to meet you.\nHow can I help you today?`
  }

  // 1. Zero Trust Security & Prompt Injection Check (HIGHEST PRIORITY 1A)
  if (RESTRICTED_PATTERNS.some((pattern) => pattern.test(queryLower))) {
    return SECURITY_RESTRICTED_RESPONSE
  }

  // 2. Forbidden Internal Systems Check (PUBLIC ACCESS POLICY - HIGHEST PRIORITY 1B)
  if (INTERNAL_SYSTEM_PATTERNS.some((pattern) => pattern.test(queryLower))) {
    return INTERNAL_SYSTEM_REFUSAL_RESPONSE
  }

  // 3. Unrelated / Out-of-Scope Questions (HIGHEST PRIORITY 1C)
  if (UNRELATED_PATTERNS.some((pattern) => pattern.test(queryLower))) {
    return `I'm designed specifically to assist with AROM STUDIO and our website development services. I may not be the best source for unrelated topics, but I'd be happy to help with anything about AROM STUDIO.`
  }

  // 4. Universal Intent Understanding Engine (v3)

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

  // D. Ask about AI Identity / Purpose ("Who are you?", "Tell me about yourself", "What is AROM AI?", "Why do you exist?")
  if (/\b(who are you|tell me about yourself|introduce yourself|what('s| is) your name|are you ai|what do you do|who created you|why do you exist|what is arom ai|explain arom ai|meaning of arom ai|purpose of arom ai|why was arom ai built)\b/i.test(queryLower) && !queryLower.includes('arom studio')) {
    return `Hello! 👋\n\nI'm AROM AI, the official AI assistant of AROM STUDIO.\n\nI'm here to help visitors learn about our services, guide them through the website, answer questions, and assist them throughout their journey.\n\nI can:\n• Answer questions about AROM STUDIO\n• Help you choose services & pricing packages\n• Explain our website development process\n• Guide you through the website & navigation\n• Help you start a project\n\nHow can I help you today?`
  }

  // E. Ask about AI Capabilities ("What can you do?")
  if (/\b(what can you do|what are your capabilities|how can you help me|what do you do)\b/i.test(queryLower) && !queryLower.includes('arom studio')) {
    return `I can:\n\n• Answer questions about AROM STUDIO\n• Help you choose services\n• Explain pricing\n• Guide you through the website\n• Help you start a project\n• Answer FAQs\n• Assist with navigation\n\nIs there a specific topic you'd like to explore?`
  }

  // F. Ask about Company Overview ("Tell me about AROM STUDIO", "What is AROM STUDIO?", "Who owns AROM STUDIO?")
  if (/\b(tell me about arom studio|what is arom studio|who owns arom studio|explain your company|about your company|company overview|introduce arom studio|who is arom studio)\b/i.test(queryLower)) {
    return `AROM STUDIO is a modern, high-performance web design and software development agency founded by **Arnav Pagare** (Founder & Lead Engineer).\n\nWe specialize in engineering ultra-fast, visually stunning, and high-converting web applications with a **100/100 Core Web Vitals Guarantee**, 100% source code ownership, and 1 full year of support coverage.\n\nWould you like to explore our pricing packages or see our services?`
  }

  // G. Ask about Founder ("Tell me about your founder", "Who founded AROM STUDIO?")
  if (/\b(founder|who founded|tell me about your founder|who created arom studio)\b/i.test(queryLower)) {
    return `AROM STUDIO was founded by **Arnav Pagare** (Founder & Lead Engineer).\n\nHe leads our engineering team, specializing in React 19 architecture, performance engineering, modern dark glassmorphic UI design, and scalable cloud applications.`
  }

  // H. Universal Pricing Intent ("How much does a website cost?", "Website pricing?", "Plans?", "Packages?", "Price list?", "Cost?", "Budget?", "Estimate?", "Quotation?")
  if (/\b(how much does a website cost|website pricing|plans|packages|price list|cost|budget|estimate|quotation|rates|pricing|how much)\b/i.test(queryLower)) {
    const item = customKnowledge.find((k) => k.category === 'pricing')
    if (item) return item.answer
  }

  // I. Universal Services Intent ("What services do you provide?", "What can you build?", "What do you offer?", "Can you build an eCommerce website?", "Can you create a portfolio website?")
  if (/\b(what services do you provide|what can you build|what do you offer|can you build an ecommerce|can you create a portfolio|do you develop custom web apps|services|what services|capabilities|build a site|build website)\b/i.test(queryLower) && !queryLower.includes('start') && !queryLower.includes('cost')) {
    const item = customKnowledge.find((k) => k.category === 'services')
    if (item) return item.answer
  }

  // J. Universal Process & Timeline Intent ("How long will my project take?", "Timeline?", "Delivery?", "Project duration?", "Completion time?", "Launch time?")
  if (/\b(how long will my project take|timeline|delivery|project duration|completion time|launch time|process|workflow|how long)\b/i.test(queryLower)) {
    const item = customKnowledge.find((k) => k.category === 'process')
    if (item) return item.answer
  }

  // K. Universal Start Project / Onboarding Intent ("How do I start?", "How can I work with you?", "I want a website", "Let's begin", "Start my project", "Hire AROM STUDIO")
  if (/\b(how do i start|how can i work with you|i want a website|let's begin|start my project|hire arom studio|start a project|begin project)\b/i.test(queryLower)) {
    return `Awesome! Here is how you can start your project with AROM STUDIO step-by-step:

1. **Submit Requirements**: Open the **Contact** or **Discovery Questionnaire** page from the top menu and tell us about your project.
2. **Kickoff Consultation**: Our team reviews your request and connects with you to discuss design and features.
3. **Design & Build**: We build your site with clean code, modern UI, and 100/100 performance guarantee.
4. **Launch**: Production deployment and full source code handover.

Could you tell me what type of business or project your website is for?`
  }

  // L. Universal Navigation Intent ("Take me to pricing", "Open the contact page", "Where is the services page?", "Go to plans", "Navigate to about")
  if (/\b(take me to|open the|where is the|go to|navigate to)\b/i.test(queryLower)) {
    if (queryLower.includes('pricing') || queryLower.includes('plan') || queryLower.includes('package')) {
      return `Sure! Here's how you can reach the Pricing page:\n\n1. Open the navigation bar at the top of the website.\n2. Click on **'Pricing'**.\n3. You'll see all available website packages, included features, and pricing details.`
    }
    if (queryLower.includes('contact') || queryLower.includes('touch') || queryLower.includes('hire')) {
      return `Sure! To visit the Contact page:\n\n1. Open the navigation bar at the top of the website.\n2. Click on **'Contact'**.\n3. Fill in your message or project form to reach our team.`
    }
    if (queryLower.includes('service') || queryLower.includes('about')) {
      return `Sure! You can open the navigation bar at the top of the website and click on **'Services'** or **'About'** to explore details.`
    }
  }

  // M. Empathy: Don't know which package to choose
  if (/\b(don't know|dont know|not sure|confused|which package|recommend package)\b/i.test(queryLower)) {
    return `No worries! I'd be happy to help.\n\nCould you tell me a little about your business and what you'd like your website to achieve? That will help me recommend the most suitable option.`
  }

  // N. Industry Personalization: Restaurant
  if (/\b(restaurant|food|cafe|dining|bakery)\b/i.test(queryLower)) {
    return `Awesome! For restaurant and food businesses, we build high-converting websites featuring:\n- **Interactive Digital Menus**: Showcase dishes with high-res photos & pricing.\n- **Online Table Reservations**: Let customers book tables directly.\n- **Instant WhatsApp Ordering**: Receive food orders directly on your phone.\n- **Location & Google Maps**: Help patrons find your restaurant easily.\n\nOur **Professional Tier (₹32,999+)** or **Business Tier (₹59,999+)** is usually perfect for restaurants. Would you like to know more about what's included?`
  }

  // O. Industry Personalization: Doctor / Clinic / Healthcare
  if (/\b(doctor|clinic|hospital|dental|healthcare|medical)\b/i.test(queryLower)) {
    return `We specialize in healthcare and clinic websites! Key features include:\n- **Online Appointment Booking**: Allow patients to schedule visits online.\n- **Doctor Profiles & Credentials**: Build trust with patient reviews and specialization details.\n- **Services & Treatment Guides**: Clearly explain treatments offered.\n- **Patient Inquiry Forms & Location**: Directions to your clinic with Google Maps.\n\nOur **Professional Tier (₹32,999+)** is ideal for clinics. Would you like me to share details?`
  }

  // P. Industry Personalization: Clothing / E-commerce
  if (/\b(clothing|clothes|store|shop|sell online|ecommerce|fashion|products)\b/i.test(queryLower)) {
    return `For clothing stores and retail brands, we build custom **E-commerce Platforms**:\n- **Product Catalog & Filters**: Category browsing, size/color selectors.\n- **Secure Checkout & Payments**: Seamless integration with Razorpay, Stripe, and UPI.\n- **Order & Inventory Dashboard**: Manage inventory and track orders easily.\n- **Mobile-Optimized Shopping**: Blazing-fast mobile shopping UX.\n\nOur **Business Tier (₹59,999+)** or **E-Commerce Package** is designed specifically for online stores. Shall we discuss your product catalog size?`
  }

  // Q. Contact & Channels
  if (queryLower.includes('contact') || queryLower.includes('email') || queryLower.includes('phone') || queryLower.includes('reach out')) {
    return `You can reach AROM STUDIO easily through any of these channels:\n\n• **Email**: aromstudio27@gmail.com\n• **WhatsApp / Call**: +91 8767990061\n• **Contact Page**: Open 'Contact' from the top navigation to submit your project form.\n\nOur team typically responds within 2 hours!`
  }

  // R. Policies & Refunds
  if (queryLower.includes('refund') || queryLower.includes('cancel') || queryLower.includes('deposit') || queryLower.includes('policy')) {
    const item = customKnowledge.find((k) => k.category === 'policies')
    if (item) return item.answer
  }

  // S. Client Portal Tracking
  if (queryLower.includes('track') || queryLower.includes('portal') || queryLower.includes('client portal') || queryLower.includes('agreement') || queryLower.includes('handover')) {
    const item = customKnowledge.find((k) => k.category === 'portal')
    if (item) return item.answer
  }

  // 5. Keyword Scoring & Knowledge Fusion Matcher
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

  // 6. Standard Public Unknown Response (Fallback)
  return PUBLIC_UNKNOWN_RESPONSE
}
