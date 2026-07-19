import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Section, Container, SectionHeader } from '../components/ui/Section'
import { SEO } from '../components/ui/SEO'
import { GlassCard } from '../components/ui/GlassCard'
import { CTABanner } from '../components/sections/shared/CTABanner'
import { portfolioItems } from '../data/portfolio'

const categories = ['All', ...new Set(portfolioItems.map((p) => p.category))]

export default function Portfolio() {
  const [active, setActive] = useState('All')

  const filtered = active === 'All' ? portfolioItems : portfolioItems.filter((p) => p.category === active)

  return (
    <main className="pt-32">
      <SEO
        title="Portfolio"
        description="View our portfolio of premium websites and applications. See how AROM STUDIO delivers high-performance digital experiences for Indian businesses."
      />
      <Section>
        <Container>
          <SectionHeader
            badge="Our Work"
            title="Selected"
            highlightWord="projects"
            description="A showcase of websites and applications we've designed and developed."
          />

          {/* Filters */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`text-sm font-body rounded-full px-4 py-2 transition-all duration-200 ${
                  active === cat
                    ? 'bg-accent text-white'
                    : 'glass text-white/60 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Results Message */}
          <div className="max-w-3xl mx-auto text-center mb-12 p-6 md:p-8 rounded-[24px] glass">
            <p className="font-heading text-2xl md:text-3xl text-white leading-tight">
              A website from <span className="text-accent">AROM STUDIO</span> doesn't just look good —
            </p>
            <p className="font-heading text-2xl md:text-3xl text-white leading-tight mt-1">
              it brings you <span className="text-accent">more clients</span> and{' '}
              <span className="text-accent">more customers</span>.
            </p>
            <div className="w-12 h-[1.5px] bg-accent/40 mx-auto mt-5 mb-4" />
            <p className="text-sm text-white/50 font-body font-light">
              Every project is built to drive real business results — not just beautiful interfaces.
            </p>
          </div>

          {/* Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {filtered.map((item) => (
                <Link key={item.slug} to={`/portfolio/${item.slug}`} className="block group">
                  <GlassCard className="flex flex-col min-h-[300px]">
                    <div className="flex items-start justify-between mb-4">
                      <span className="glass text-[11px] text-white/70 font-body px-3 py-1 rounded-full">
                        {item.category}
                      </span>
                    </div>
                    <div className="flex-1" />
                    <h3 className="font-heading text-2xl md:text-3xl text-white tracking-[-1px] leading-none mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-white/50 font-body font-light mb-4">{item.client}</p>
                    <p className="text-xs text-white/40 font-body mb-4 line-clamp-2">{item.description}</p>
                    <div className="flex items-center gap-1.5 text-xs text-accent font-medium group-hover:gap-2.5 transition-all duration-300">
                      View Case Study <ArrowUpRight className="h-3.5 w-3.5" />
                    </div>
                  </GlassCard>
                </Link>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Client Privacy & Confidentiality */}
          <div className="max-w-4xl mx-auto mt-16 p-8 md:p-10 rounded-[24px] glass">
            <div className="flex items-start gap-4">
              <svg className="h-6 w-6 text-accent shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <div>
                <h2 className="font-heading text-2xl md:text-3xl text-white mb-4">Client Privacy &amp; Confidentiality</h2>
                <div className="space-y-4 text-sm text-white/55 font-body font-light leading-relaxed">
                  <p>
                    Every project at AROM STUDIO is built with professionalism and trust. To protect our clients' privacy,
                    confidential business information, and intellectual property, we do not publicly share live website
                    links unless we have explicit permission to do so.
                  </p>
                  <p>
                    The portfolio showcased here focuses on our design process, technical expertise, and the results we
                    deliver while respecting client confidentiality.
                  </p>
                  <p>
                    If you're interested in work similar to your industry, we'd be happy to discuss relevant case studies
                    during a <span className="text-accent font-medium">private consultation</span> where disclosure is permitted.
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <svg className="h-4 w-4 text-accent/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    <p className="text-sm text-accent/80 font-body font-medium">
                      Your privacy is treated with the same level of care we expect for our own business.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>
      <CTABanner />
    </main>
  )
}
