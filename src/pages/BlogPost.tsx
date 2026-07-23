import { useParams, Link, Navigate } from 'react-router-dom'
import { Section, Container } from '../components/ui/Section'
import { SEO } from '../components/ui/SEO'
import { GlassCard } from '../components/ui/GlassCard'
import { BLOG_POSTS } from '../data/blog'
import { Clock, Calendar, ArrowLeft, User } from 'lucide-react'

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const post = BLOG_POSTS.find((p) => p.slug === slug)

  if (!post) {
    return <Navigate to="/blog" replace />
  }

  const relatedPosts = BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, 3)

  return (
    <main id="main-content" className="pt-32">
      <SEO title={post.title} description={post.excerpt} />

      {/* BlogPosting JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.excerpt,
            datePublished: post.date,
            author: {
              '@type': 'Person',
              name: post.author.name,
              jobTitle: post.author.role,
            },
            publisher: {
              '@type': 'Organization',
              name: 'AROM STUDIO',
              url: 'https://aromstudio.vercel.app',
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `https://aromstudio.vercel.app/blog/${post.slug}`,
            },
          }),
        }}
      />

      <Section>
        <Container>
          <div className="max-w-3xl mx-auto mb-8">
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 text-xs text-accent font-body font-medium mb-6 hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Insights
            </Link>

            <div className="flex items-center gap-3 text-xs text-white/40 font-body mb-4">
              <span className="text-accent font-medium px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
                {post.category}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" /> {post.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {post.readTime}
              </span>
            </div>

            <h1 className="font-heading text-4xl md:text-6xl text-white leading-[1.1] mb-6">
              {post.title}
            </h1>

            {/* Author */}
            <div className="flex items-center gap-3 pt-4 border-t border-white/10 mb-8">
              <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-heading text-white">{post.author.name}</p>
                <p className="text-xs text-white/50 font-body">{post.author.role}</p>
              </div>
            </div>
          </div>

          {/* Article Body */}
          <div className="max-w-3xl mx-auto">
            <GlassCard hover={false} className="p-8 md:p-12">
              <div
                className="prose prose-invert max-w-none text-white/80 font-body text-base leading-relaxed space-y-6"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </GlassCard>
          </div>

          {/* Related Articles */}
          <div className="max-w-4xl mx-auto mt-16 pt-12 border-t border-white/10">
            <h2 className="font-heading text-2xl text-white mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((rel) => (
                <GlassCard key={rel.slug} className="p-5 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-accent font-medium px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20">
                      {rel.category}
                    </span>
                    <h3 className="font-heading text-base text-white mt-2 line-clamp-2 hover:text-accent transition-colors">
                      <Link to={`/blog/${rel.slug}`}>{rel.title}</Link>
                    </h3>
                  </div>
                  <Link
                    to={`/blog/${rel.slug}`}
                    className="text-xs text-accent font-body font-medium flex items-center gap-1 mt-4"
                  >
                    Read <ArrowLeft className="h-3 w-3 rotate-180" />
                  </Link>
                </GlassCard>
              ))}
            </div>
          </div>
        </Container>
      </Section>
    </main>
  )
}
