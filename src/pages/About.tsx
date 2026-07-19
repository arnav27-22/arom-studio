import { Target, Eye, Heart, Shield, Zap, Users, Accessibility, RefreshCw, Code2, Globe, Star, Clock } from 'lucide-react'
import { Section, Container, SectionHeader } from '../components/ui/Section'
import { SEO } from '../components/ui/SEO'
import { GlassCard } from '../components/ui/GlassCard'
import { FadeIn, StaggerContainer, StaggerItem } from '../components/motion/FadeIn'
import { CTABanner } from '../components/sections/shared/CTABanner'

const values = [
  { icon: <Heart className="h-5 w-5" />, title: 'Quality Over Quantity', description: 'We take on fewer projects to deliver exceptional results for each client. Every detail matters.' },
  { icon: <Shield className="h-5 w-5" />, title: 'Honest Communication', description: 'Transparent, clear, and timely communication throughout every project phase.' },
  { icon: <Zap className="h-5 w-5" />, title: 'Performance-First', description: 'Every website targets Lighthouse 95+ scores. Speed is a feature, not an afterthought.' },
  { icon: <Users className="h-5 w-5" />, title: 'User-Centered Design', description: 'Design decisions are driven by user needs, behavior data, and business goals.' },
  { icon: <RefreshCw className="h-5 w-5" />, title: 'Continuous Learning', description: 'We stay at the forefront of modern web technologies and evolving best practices.' },
  { icon: <Accessibility className="h-5 w-5" />, title: 'Accessibility for All', description: 'WCAG 2.2 AA compliance is built into every project. The web should work for everyone.' },
  { icon: <Target className="h-5 w-5" />, title: 'Long-Term Partnerships', description: 'We build relationships, not just websites. Every project includes 1 Year Support.' },
  { icon: <Shield className="h-5 w-5" />, title: 'Security by Design', description: 'Security best practices are integrated from day one — HTTPS, input validation, CSP headers.' },
]

const skills = [
  { name: 'Next.js / React', level: 95 },
  { name: 'TypeScript', level: 90 },
  { name: 'Tailwind CSS', level: 95 },
  { name: 'UI/UX Design', level: 85 },
  { name: 'Supabase / PostgreSQL', level: 80 },
  { name: 'Framer Motion / GSAP', level: 85 },
  { name: 'Node.js / API Dev', level: 80 },
  { name: 'SEO / Performance', level: 85 },
]

export default function About() {
  return (
    <main className="pt-32">
      <SEO
        title="About"
        description="AROM STUDIO was founded by Arnav Pagare — a premium web design and development agency based in India. Learn our story, mission, and values."
      />
      {/* Hero */}
      <Section>
        <Container>
          <div className="max-w-3xl">
            <span className="text-xs text-accent font-body uppercase tracking-[0.2em]">About</span>
            <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl text-white leading-[0.9] tracking-[-3px] mt-3 mb-6">
              The story behind
              <br />
              <span className="text-accent">AROM STUDIO</span>
            </h1>
            <p className="text-base text-white/60 font-body font-light max-w-2xl leading-relaxed">
              AROM STUDIO was founded with a simple belief: every business deserves a premium digital presence. 
              We combine technical excellence with creative vision to build websites that don't just look good — they deliver results.
            </p>
          </div>
        </Container>
      </Section>

      {/* Founder */}
      <Section>
        <Container>
          <FadeIn>
            <div className="glass rounded-[32px] p-8 md:p-12 lg:p-16 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px]" />
              <div className="relative z-10 flex flex-col lg:flex-row items-start gap-8 lg:gap-16">
                <div className="shrink-0">
                  <div className="w-28 h-28 md:w-36 md:h-36 rounded-full glass flex items-center justify-center">
                    <span className="font-heading text-4xl md:text-5xl text-accent">AP</span>
                  </div>
                </div>
                <div className="flex-1">
                  <span className="text-xs text-white/40 font-body uppercase tracking-[0.2em]">Founder & Solo Developer</span>
                  <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl text-white tracking-[-1px] leading-none mt-2 mb-1">
                    Arnav Pagare
                  </h2>
                  <p className="text-sm text-accent font-body font-medium mb-6">Founder & Solo Developer</p>
                  
                  <div className="space-y-4 text-base text-white/60 font-body font-light leading-relaxed max-w-3xl">
                    <p>
                      AROM STUDIO was founded by Arnav Pagare, a web developer and digital designer passionate about
                      creating premium websites that help businesses establish a strong online presence. Every project
                      is built with a focus on quality, performance, and long-term value.
                    </p>
                    <p>
                      As the founder, Arnav personally oversees every stage of the development process — from strategy,
                      planning, and UI/UX design to frontend development, backend integration, performance optimization,
                      deployment, and post-launch support. This hands-on approach ensures every project receives the
                      attention to detail it deserves.
                    </p>
                    <p>
                      Believing that exceptional websites are created where design, engineering, and business strategy
                      come together, Arnav focuses on building digital experiences that are not only visually refined
                      but also fast, accessible, scalable, SEO-ready, and conversion-focused.
                    </p>
                    <p>
                      Whether working with startups, local businesses, or growing brands, the goal remains the same:
                      deliver websites that inspire confidence, strengthen brands, and support measurable business growth.
                    </p>
                  </div>

                  {/* Quick Facts */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
                    {[
                      { icon: <Star className="h-4 w-4" />, label: '3+ Years', desc: 'Experience' },
                      { icon: <Code2 className="h-4 w-4" />, label: '50+', desc: 'Projects Delivered' },
                      { icon: <Globe className="h-4 w-4" />, label: 'India', desc: 'Serving Clients Across' },
                      { icon: <Clock className="h-4 w-4" />, label: '1 Year', desc: 'Premium Support' },
                    ].map((fact) => (
                      <div key={fact.label} className="glass rounded-[16px] p-3 text-center">
                        <span className="text-accent flex justify-center mb-1">{fact.icon}</span>
                        <p className="font-heading text-lg text-white">{fact.label}</p>
                        <p className="text-[10px] text-white/40 font-body">{fact.desc}</p>
                      </div>
                    ))}
                  </div>

                  {/* Quote */}
                  <div className="mt-8 pt-6 border-t border-white/5">
                    <div className="flex items-start gap-3">
                      <span className="text-accent/30 font-heading text-3xl leading-none leading-[0.8]">"</span>
                      <p className="text-base text-white/70 font-heading leading-relaxed">
                        I don't just build websites — I build digital experiences that help businesses earn trust,
                        attract customers, and grow with confidence.
                      </p>
                      <span className="text-accent/30 font-heading text-3xl leading-none self-end leading-[0.8]">"</span>
                    </div>
                    <p className="text-xs text-white/40 font-body mt-3 text-right">— Arnav Pagare</p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </Container>
      </Section>

      {/* Skills */}
      <Section>
        <Container>
          <SectionHeader title="Technical" highlightWord="expertise" description="Core skills and technologies I work with daily." align="left" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            {skills.map((skill) => (
              <GlassCard key={skill.name} hover={false} className="!rounded-[16px]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/80 font-body">{skill.name}</span>
                  <span className="text-xs text-accent font-body font-medium">{skill.level}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent to-accent-light rounded-full transition-all duration-1000"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
              </GlassCard>
            ))}
          </div>
        </Container>
      </Section>

      {/* Mission & Vision */}
      <Section>
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FadeIn>
              <GlassCard hover={false}>
                <Target className="h-8 w-8 text-accent mb-4" />
                <h2 className="font-heading text-3xl text-white mb-3">Our Mission</h2>
                <p className="text-sm text-white/60 font-body font-light leading-relaxed">
                  To help businesses succeed online by building premium, high-performance websites and digital products
                  that combine exceptional design, modern technology, and measurable business results. Every project includes 
                  1 Year Support and Free Domain to ensure long-term success.
                </p>
              </GlassCard>
            </FadeIn>
            <FadeIn delay={0.1}>
              <GlassCard hover={false}>
                <Eye className="h-8 w-8 text-accent mb-4" />
                <h2 className="font-heading text-3xl text-white mb-3">Our Vision</h2>
                <p className="text-sm text-white/60 font-body font-light leading-relaxed">
                  To establish AROM STUDIO as one of India's most trusted premium digital agencies, recognized for
                  craftsmanship, innovation, reliability, and long-term client partnerships. We're building a studio that 
                  clients recommend without hesitation.
                </p>
              </GlassCard>
            </FadeIn>
          </div>
        </Container>
      </Section>

      {/* Values */}
      <Section>
        <Container>
          <SectionHeader title="Core" highlightWord="values" description="The principles that guide every project and decision we make." />
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {values.map((v) => (
              <StaggerItem key={v.title}>
                <GlassCard className="h-full">
                  <div className="w-10 h-10 rounded-[10px] glass flex items-center justify-center text-accent mb-4">
                    {v.icon}
                  </div>
                  <h3 className="font-heading text-lg text-white mb-2">{v.title}</h3>
                  <p className="text-xs text-white/55 font-body font-light leading-relaxed">{v.description}</p>
                </GlassCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </Section>

      {/* What Sets Us Apart */}
      <Section>
        <Container>
          <SectionHeader title="What sets us" highlightWord="apart" description="Why clients choose AROM STUDIO over other agencies." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: <Code2 className="h-6 w-6" />, title: 'Modern Tech Stack', desc: 'Built with Next.js, TypeScript, and Tailwind CSS — not outdated CMS platforms. Faster, more secure, and easier to maintain.' },
              { icon: <Zap className="h-6 w-6" />, title: 'Performance Obsessed', desc: 'We target Lighthouse 95+ scores. Every image, font, and script is optimized for speed. Your users deserve fast websites.' },
              { icon: <Heart className="h-6 w-6" />, title: '1 Year Support', desc: 'We don\'t disappear after launch. Every project includes 1 Year of priority support, updates, and performance monitoring.' },
            ].map((item) => (
              <GlassCard key={item.title}>
                <div className="w-11 h-11 rounded-[12px] glass flex items-center justify-center text-accent mb-5">{item.icon}</div>
                <h3 className="font-heading text-xl text-white mb-2">{item.title}</h3>
                <p className="text-sm text-white/55 font-body font-light leading-relaxed">{item.desc}</p>
              </GlassCard>
            ))}
          </div>
        </Container>
      </Section>

      <CTABanner />
    </main>
  )
}
