export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  date: string
  category: string
  readTime: string
  author: {
    name: string
    role: string
    avatar: string
    bio: string
  }
  content: string
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'react-vs-nextjs-saas-2025',
    title: 'React vs Next.js for SaaS Platforms in 2025',
    excerpt: 'An in-depth technical analysis comparing pure React client applications and Next.js server-side platforms for building scalable SaaS products.',
    date: '2026-07-15',
    category: 'Engineering',
    readTime: '6 min read',
    author: {
      name: 'Arnav Pagare',
      role: 'Founder & Lead Engineer',
      avatar: '/favicon.svg',
      bio: 'Arnav Pagare is the founder of AROM STUDIO, specializing in modern web development, React architecture, and performance engineering.',
    },
    content: `
      <h2>Introduction</h2>
      <p>When engineering a modern SaaS platform, selecting the right architecture impacts rendering speed, SEO discoverability, and developer productivity.</p>

      <h2>React Single Page Applications (SPAs)</h2>
      <p>Pure React SPAs bundle logic onto the client, offering instantaneous interactive transitions once loaded. They excel for private client portals and dashboard interfaces where search engine indexing is irrelevant.</p>

      <h2>Next.js Server-Driven Applications</h2>
      <p>Next.js combines Server Components, Server-Side Rendering (SSR), and Static Site Generation (SSG) to deliver pre-rendered HTML to the browser. This delivers superior Core Web Vitals, immediate LCP, and optimal SEO indexability for marketing and public SaaS pages.</p>

      <h2>Conclusion & Recommendations</h2>
      <p>At AROM STUDIO, we recommend a hybrid architecture: Next.js for public marketing pages and documentation, coupled with optimized React modules for dashboard management.</p>
    `,
  },
  {
    slug: 'custom-website-vs-templates',
    title: 'Why Your Business Needs a Custom Website (Not a Template)',
    excerpt: 'Discover why template-based site builders harm conversion rates, performance, and long-term brand equity compared to bespoke code.',
    date: '2026-07-10',
    category: 'Strategy',
    readTime: '5 min read',
    author: {
      name: 'Arnav Pagare',
      role: 'Founder & Lead Engineer',
      avatar: '/favicon.svg',
      bio: 'Arnav Pagare is the founder of AROM STUDIO, specializing in modern web development, React architecture, and performance engineering.',
    },
    content: `
      <h2>The Hidden Cost of Pre-made Templates</h2>
      <p>Template builders load excessive CSS and unneeded JavaScript plugins to support every conceivable layout option. This bloat degrades Google Lighthouse scores and increases bounce rates.</p>

      <h2>Bespoke Engineering Advantages</h2>
      <p>Custom websites built with Tailwind CSS and React ship only the exact code needed for your specific user journeys. This results in sub-second load times, higher conversion rates, and total design freedom.</p>
    `,
  },
  {
    slug: 'core-web-vitals-explained',
    title: 'Core Web Vitals Explained for Business Owners',
    excerpt: 'Learn how LCP, CLS, and INP metrics directly impact your Google search rankings and business revenue.',
    date: '2026-07-04',
    category: 'SEO',
    readTime: '7 min read',
    author: {
      name: 'Arnav Pagare',
      role: 'Founder & Lead Engineer',
      avatar: '/favicon.svg',
      bio: 'Arnav Pagare is the founder of AROM STUDIO, specializing in modern web development, React architecture, and performance engineering.',
    },
    content: `
      <h2>Understanding Google Core Web Vitals</h2>
      <p>Google evaluates web experience based on three measurable metrics: Largest Contentful Paint (LCP), Cumulative Layout Shift (CLS), and Interaction to Next Paint (INP).</p>

      <h2>Optimizing LCP and CLS</h2>
      <p>By code-splitting JavaScript assets, preloading font assets, and specifying explicit image dimensions, AROM STUDIO builds ensure 100/100 Core Web Vitals scores.</p>
    `,
  },
  {
    slug: 'how-we-build-at-arom-studio',
    title: 'How We Build Websites at AROM STUDIO: Our Process',
    excerpt: 'A transparent walkthrough of our 4-stage engineering lifecycle from discovery and wireframing to code deployment.',
    date: '2026-06-28',
    category: 'Agency',
    readTime: '6 min read',
    author: {
      name: 'Arnav Pagare',
      role: 'Founder & Lead Engineer',
      avatar: '/favicon.svg',
      bio: 'Arnav Pagare is the founder of AROM STUDIO, specializing in modern web development, React architecture, and performance engineering.',
    },
    content: `
      <h2>Stage 1: Discovery & Strategy</h2>
      <p>We analyze user personas, search intent, and technical requirements before touching design or code.</p>

      <h2>Stage 2: UI/UX Prototyping</h2>
      <p>High-fidelity dark mode prototypes with fluid animations created to validate user experience.</p>

      <h2>Stage 3: Production Development</h2>
      <p>Clean TypeScript implementation using React 19, Vite, and Tailwind CSS.</p>

      <h2>Stage 4: Quality Assurance & Launch</h2>
      <p>Automated linter checks, WCAG 2.1 AA accessibility verification, and zero-downtime deployment.</p>
    `,
  },
  {
    slug: 'web-design-trends-2025',
    title: 'Modern Web Design Trends for 2025',
    excerpt: 'Explore emerging trends in web design including dark glassmorphism, micro-animations, AI-assisted interfaces, and minimalist typography.',
    date: '2026-06-20',
    category: 'Design',
    readTime: '4 min read',
    author: {
      name: 'Arnav Pagare',
      role: 'Founder & Lead Engineer',
      avatar: '/favicon.svg',
      bio: 'Arnav Pagare is the founder of AROM STUDIO, specializing in modern web development, React architecture, and performance engineering.',
    },
    content: `
      <h2>Dark Glassmorphism & Kinetic Typography</h2>
      <p>Translucent backdrop blur filters paired with bold typography create immersive digital environments that capture visitor attention instantly.</p>
    `,
  },
  {
    slug: 'optimizing-conversions-landing-pages',
    title: 'Maximizing Conversions on Business Landing Pages',
    excerpt: 'Proven UX patterns, micro-copy techniques, and CTA positioning to turn website visitors into qualified leads.',
    date: '2026-06-14',
    category: 'CRO',
    readTime: '5 min read',
    author: {
      name: 'Arnav Pagare',
      role: 'Founder & Lead Engineer',
      avatar: '/favicon.svg',
      bio: 'Arnav Pagare is the founder of AROM STUDIO, specializing in modern web development, React architecture, and performance engineering.',
    },
    content: `
      <h2>Above-the-Fold Clarity</h2>
      <p>State your value proposition immediately with clear supporting micro-copy and high-visibility CTAs.</p>
    `,
  },
  {
    slug: 'accessible-web-design-guide',
    title: 'Building WCAG 2.1 AA Accessible Web Applications',
    excerpt: 'Why web accessibility is an essential engineering standard and how to implement semantic HTML and ARIA roles.',
    date: '2026-06-08',
    category: 'Accessibility',
    readTime: '6 min read',
    author: {
      name: 'Arnav Pagare',
      role: 'Founder & Lead Engineer',
      avatar: '/favicon.svg',
      bio: 'Arnav Pagare is the founder of AROM STUDIO, specializing in modern web development, React architecture, and performance engineering.',
    },
    content: `
      <h2>Semantic HTML & Keyboard Usability</h2>
      <p>Using native button tags, explicit form labels, and focus indicators ensures all users can navigate your web application seamlessly.</p>
    `,
  },
  {
    slug: 'generative-engine-optimization-geo',
    title: 'Generative Engine Optimization (GEO): SEO for AI Search',
    excerpt: 'How to optimize your website content for citation by ChatGPT, Gemini, Claude, and Perplexity.',
    date: '2026-06-01',
    category: 'AI SEO',
    readTime: '7 min read',
    author: {
      name: 'Arnav Pagare',
      role: 'Founder & Lead Engineer',
      avatar: '/favicon.svg',
      bio: 'Arnav Pagare is the founder of AROM STUDIO, specializing in modern web development, React architecture, and performance engineering.',
    },
    content: `
      <h2>The Shift to Generative AI Search</h2>
      <p>AI search models prioritize direct answer definitions, structured JSON-LD schemas, and dedicated llms.txt context documents.</p>
    `,
  },
  {
    slug: 'security-best-practices-web-apps',
    title: 'Essential Security Standards for Modern Web Applications',
    excerpt: 'Protecting your business against XSS, form spam, credential leaks, and data exposure.',
    date: '2026-05-25',
    category: 'Security',
    readTime: '5 min read',
    author: {
      name: 'Arnav Pagare',
      role: 'Founder & Lead Engineer',
      avatar: '/favicon.svg',
      bio: 'Arnav Pagare is the founder of AROM STUDIO, specializing in modern web development, React architecture, and performance engineering.',
    },
    content: `
      <h2>Security Headers & Input Validation</h2>
      <p>Implementing Content-Security-Policy (CSP), HSTS, server-side validation schemas, and rate limiting protects web applications against modern cyber threats.</p>
    `,
  },
  {
    slug: 'scaling-web-infrastructure-vercel',
    title: 'Scaling Web Infrastructure on Vercel and Cloudflare',
    excerpt: 'How modern serverless deployments deliver global high availability and sub-300ms time to first byte.',
    date: '2026-05-18',
    category: 'DevOps',
    readTime: '6 min read',
    author: {
      name: 'Arnav Pagare',
      role: 'Founder & Lead Engineer',
      avatar: '/favicon.svg',
      bio: 'Arnav Pagare is the founder of AROM STUDIO, specializing in modern web development, React architecture, and performance engineering.',
    },
    content: `
      <h2>Edge CDN Deployment Strategy</h2>
      <p>Deploying application routes to edge networks ensures static assets and API routes execute close to end users worldwide.</p>
    `,
  },
]
