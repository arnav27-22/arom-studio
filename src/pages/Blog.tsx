import { Link } from 'react-router-dom'
import { Section, Container } from '../components/ui/Section'
import { SEO } from '../components/ui/SEO'
import { GlassCard } from '../components/ui/GlassCard'
import { FadeIn } from '../components/motion/FadeIn'
import { BLOG_POSTS } from '../data/blog'
import { Clock, Calendar, ArrowRight } from 'lucide-react'

export default function Blog() {
  return (
    <main id="main-content" className="pt-32">
      <SEO
        title="Insights & Engineering Blog"
        description="Articles on web development, React architecture, Core Web Vitals, UX design, and AI SEO by AROM STUDIO."
      />
      <Section>
        <Container>
          <div className="max-w-3xl mb-12">
            <span className="text-xs text-accent font-body uppercase tracking-[0.2em]">Insights</span>
            <h1 className="font-heading text-5xl md:text-7xl text-white leading-[0.9] tracking-[-2px] mt-3 mb-4">
              Engineering &amp; Design
            </h1>
            <p className="text-[17px] text-white/50 font-body font-light max-w-xl">
              Articles and technical guides on modern web development, performance optimization, and digital strategy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BLOG_POSTS.map((post, index) => (
              <FadeIn key={post.slug} delay={index * 0.05}>
                <GlassCard className="h-full flex flex-col justify-between p-6">
                  <div>
                    <div className="flex items-center justify-between text-xs text-white/40 font-body mb-3">
                      <span className="text-accent font-medium px-2.5 py-0.5 rounded-full bg-accent/10 border border-accent/20">
                        {post.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {post.readTime}
                      </span>
                    </div>
                    <h2 className="font-heading text-xl text-white mb-2 line-clamp-2 hover:text-accent transition-colors">
                      <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                    </h2>
                    <p className="text-sm text-white/60 font-body font-light line-clamp-3 mb-6">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs text-white/40 font-body">
                      <Calendar className="h-3 w-3" /> {post.date}
                    </span>
                    <Link
                      to={`/blog/${post.slug}`}
                      className="text-xs text-accent font-body font-medium flex items-center gap-1 hover:text-accent-light transition-colors"
                    >
                      Read Article <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </GlassCard>
              </FadeIn>
            ))}
          </div>
        </Container>
      </Section>
    </main>
  )
}
