import { Section, Container, SectionHeader } from '../../ui/Section'
import { StaggerContainer, StaggerItem } from '../../motion/FadeIn'

const technologies = [
  { name: 'Next.js', category: 'Frontend' },
  { name: 'React', category: 'Frontend' },
  { name: 'TypeScript', category: 'Frontend' },
  { name: 'Tailwind CSS', category: 'Frontend' },
  { name: 'Framer Motion', category: 'Frontend' },
  { name: 'GSAP', category: 'Frontend' },
  { name: 'Node.js', category: 'Backend' },
  { name: 'PostgreSQL', category: 'Backend' },
  { name: 'Supabase', category: 'Backend' },
  { name: 'Vercel', category: 'Deployment' },
  { name: 'Cloudflare', category: 'Deployment' },
  { name: 'Figma', category: 'Design' },
]

const categories = ['Frontend', 'Backend', 'Deployment', 'Design']

export function TechStackSection() {
  return (
    <Section>
      <Container>
        <SectionHeader
          badge="Technology"
          title="Modern tech"
          highlightWord="stack"
          description="We use industry-leading technologies to build fast, scalable, and maintainable digital products."
        />

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <StaggerItem key={cat}>
              <div className="glass rounded-[24px] p-6">
                <h3 className="text-xs text-accent font-body font-semibold uppercase tracking-wider mb-4">{cat}</h3>
                <div className="space-y-2.5">
                  {technologies
                    .filter((t) => t.category === cat)
                    .map((tech) => (
                      <div key={tech.name} className="text-sm text-white/70 font-body font-light">
                        {tech.name}
                      </div>
                    ))}
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Container>
    </Section>
  )
}
