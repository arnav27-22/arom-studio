import { Section, Container, SectionHeader } from '../../ui/Section'
import { StaggerContainer, StaggerItem } from '../../motion/FadeIn'
import { Search, PenTool, Code2, TestTube, Rocket, HeartHandshake, Clock, Users, Shield } from 'lucide-react'

const steps = [
  { icon: <Search className="h-5 w-5" />, title: 'Discovery', description: 'Understanding your business, goals, competitors, and target audience through in-depth research.', time: '1 Week' },
  { icon: <PenTool className="h-5 w-5" />, title: 'Design', description: 'Crafting a bespoke visual identity with wireframes, prototypes, and high-fidelity mockups in Figma.', time: '1-2 Weeks' },
  { icon: <Code2 className="h-5 w-5" />, title: 'Development', description: 'Building with Next.js, TypeScript, and Tailwind CSS — clean, scalable, and performance-optimized code.', time: '2-4 Weeks' },
  { icon: <TestTube className="h-5 w-5" />, title: 'Testing', description: 'Rigorous QA across devices, browsers, performance benchmarking, and accessibility compliance (WCAG).', time: '1 Week' },
  { icon: <Rocket className="h-5 w-5" />, title: 'Launch', description: 'Deploying with zero downtime, CDN setup, SSL configuration, analytics, and SEO finalization.', time: '3 Days' },
  { icon: <HeartHandshake className="h-5 w-5" />, title: 'Support', description: '1 Year priority support included. Ongoing maintenance, updates, performance monitoring, and content changes.', time: '1 Year Included' },
]

export function ProcessSection() {
  return (
    <Section>
      <Container>
        <SectionHeader
          badge="How We Work"
          title="Our development"
          highlightWord="process"
          description="A proven 6-step methodology that ensures every project is delivered on time, on budget, and beyond expectations. Timeline varies by project scope."
        />

        <div className="mb-10 flex flex-wrap items-center justify-center gap-4 text-xs text-white/40 font-body">
          <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-accent" /> Typical timeline: 3-8 weeks</span>
          <span className="text-white/20">|</span>
          <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-accent" /> Weekly progress updates</span>
          <span className="text-white/20">|</span>
          <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-accent" /> Quality guaranteed</span>
        </div>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <StaggerItem key={i} className="h-full">
              <div className="glass rounded-[24px] p-6 relative group hover:shadow-[0_0_30px_0_rgba(78,133,191,0.08)] transition-all duration-500 flex flex-col h-full">
                <span className="font-heading text-6xl text-white/5 absolute -top-2 -right-2 leading-none select-none">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="w-10 h-10 rounded-[10px] glass flex items-center justify-center text-accent mb-4">
                  {step.icon}
                </div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-heading text-xl md:text-2xl text-white tracking-[-0.5px]">
                    {step.title}
                  </h3>
                  <span className="text-[10px] text-accent/80 font-body font-medium whitespace-nowrap ml-2 mt-1">{step.time}</span>
                </div>
                <p className="text-sm md:text-base text-white/55 font-body font-light leading-relaxed flex-1">
                  {step.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Container>
    </Section>
  )
}
