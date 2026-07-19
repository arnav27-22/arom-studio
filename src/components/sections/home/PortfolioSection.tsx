import { Link, useNavigate } from 'react-router-dom'
import { ArrowUpRight, TrendingUp } from 'lucide-react'
import { Section, Container, SectionHeader } from '../../ui/Section'
import { FadeIn, StaggerContainer, StaggerItem } from '../../motion/FadeIn'
import { portfolioItems } from '../../../data/portfolio'

export function PortfolioSection() {
  const featured = portfolioItems.slice(0, 3)
  const navigate = useNavigate()

  return (
    <Section>
      <Container>
        <SectionHeader
          badge="Our Work"
          title="Featured"
          highlightWord="projects"
          description="A selection of projects we've delivered — from concept to launch. Each project includes 1 Year Support and ongoing maintenance."
        />

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {featured[0] && (
            <StaggerItem className="md:col-span-2 lg:col-span-1">
              <div
                className="glass rounded-[24px] p-6 md:p-8 h-full flex flex-col relative overflow-hidden min-h-[350px] group cursor-pointer transition-all duration-300 hover:shadow-[0_0_30px_0_rgba(78,133,191,0.1)]"
                onClick={() => navigate(`/portfolio/${featured[0].slug}`)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <span className="glass text-[11px] text-white/70 font-body px-3 py-1 rounded-full">
                      {featured[0].category}
                    </span>
                    <span className="text-[11px] text-white/40 font-body">{featured[0].industry}</span>
                  </div>
                  <div className="flex-1" />
                  <h3 className="font-heading text-3xl md:text-4xl text-white tracking-[-1px] leading-none mb-2">
                    {featured[0].title}
                  </h3>
                  <p className="text-sm text-white/50 font-body font-light mb-3">{featured[0].client}</p>
                  <p className="text-xs text-white/40 font-body mb-4 line-clamp-2">{featured[0].description}</p>

                  {/* Results Preview */}
                  <div className="flex flex-wrap gap-3 mb-4">
                    {featured[0].results.slice(0, 2).map((r) => (
                      <span key={r.metric} className="flex items-center gap-1 text-[11px] text-accent font-body">
                        <TrendingUp className="h-3 w-3" /> {r.value} {r.metric}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-accent font-medium group-hover:gap-3 transition-all duration-300">
                    View Case Study <ArrowUpRight className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {featured[0].technologies.slice(0, 4).map((tech) => (
                      <span key={tech} className="text-[10px] text-white/40 font-body border border-white/10 px-2 py-0.5 rounded-full">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </StaggerItem>
          )}

          {featured.slice(1).map((item) => (
            <StaggerItem key={item.slug}>
              <div
                className="glass rounded-[24px] p-6 md:p-8 h-full flex flex-col min-h-[300px] group cursor-pointer transition-all duration-300 hover:shadow-[0_0_30px_0_rgba(78,133,191,0.1)]"
                onClick={() => navigate(`/portfolio/${item.slug}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="glass text-[11px] text-white/70 font-body px-3 py-1 rounded-full">{item.category}</span>
                  <span className="text-[11px] text-white/40 font-body">{item.industry}</span>
                </div>
                <div className="flex-1" />
                <h3 className="font-heading text-2xl md:text-3xl text-white tracking-[-1px] leading-none mb-2">{item.title}</h3>
                <p className="text-sm text-white/50 font-body font-light mb-2">{item.client}</p>
                <p className="text-xs text-white/40 font-body mb-4 line-clamp-2">{item.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {item.results.slice(0, 2).map((r) => (
                    <span key={r.metric} className="flex items-center gap-1 text-[11px] text-accent font-body">
                      <TrendingUp className="h-3 w-3" /> {r.value}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-accent font-medium group-hover:gap-2.5 transition-all duration-300">
                  View Case Study <ArrowUpRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <FadeIn delay={0.3} className="text-center mt-10">
          <Link
            to="/portfolio"
            className="glass inline-flex items-center gap-2 text-sm font-body font-medium text-white rounded-full px-6 py-3 hover:shadow-[0_0_20px_2px_rgba(255,255,255,0.07)] transition-all duration-300 hover:scale-[1.02]"
          >
            View All Projects
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </FadeIn>
      </Container>
    </Section>
  )
}
