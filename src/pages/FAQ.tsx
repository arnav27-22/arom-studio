import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Section, Container, SectionHeader } from '../components/ui/Section'
import { SEO } from '../components/ui/SEO'
import { CTABanner } from '../components/sections/shared/CTABanner'
import { faqCategories } from '../data/faq'

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState<string>(faqCategories[0].category)
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const currentCategory = faqCategories.find((c) => c.category === activeCategory)
  const items = currentCategory?.items ?? []

  return (
    <main className="pt-32">
      <SEO
        title="FAQ"
        description="Frequently asked questions about AROM STUDIO's services, pricing, process, and support. Everything you need to know before starting your project."
      />
      <Section>
        <Container>
          <SectionHeader
            badge="FAQ"
            title="Frequently asked"
            highlightWord="questions"
            description="Everything you need to know about working with AROM STUDIO."
          />

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {faqCategories.map((cat) => (
              <button
                key={cat.category}
                onClick={() => { setActiveCategory(cat.category); setOpenIndex(null) }}
                className={`text-sm font-body rounded-full px-4 py-2 transition-all duration-200 ${
                  activeCategory === cat.category
                    ? 'text-white bg-white/10'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat.category}
              </button>
            ))}
          </div>

          {/* FAQ Items */}
          <div className="max-w-3xl mx-auto space-y-3">
            {items.map((faq, i) => (
              <div
                key={i}
                className="rounded-[20px] transition-all duration-300"
                style={{
                  background: openIndex === i
                    ? 'rgba(255,255,255,0.02)'
                    : 'rgba(255,255,255,0.01)',
                  backdropFilter: 'blur(4px)',
                  WebkitBackdropFilter: 'blur(4px)',
                  boxShadow: openIndex === i
                    ? 'inset 0 1px 1px rgba(255,255,255,0.15), 0 0 30px rgba(78,133,191,0.04)'
                    : 'inset 0 1px 1px rgba(255,255,255,0.1)',
                }}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 md:p-6 text-left gap-4"
                >
                  <span className="text-sm md:text-base text-white/80 font-body font-medium leading-snug">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className="h-4 w-4 text-white/30 shrink-0 transition-transform duration-300"
                    style={{ transform: openIndex === i ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  />
                </button>

                <div
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                  style={{
                    maxHeight: openIndex === i ? '400px' : '0px',
                    opacity: openIndex === i ? 1 : 0,
                  }}
                >
                  <div className="px-5 md:px-6 pb-5 md:pb-6 pt-0">
                    <div className="w-8 h-[1.5px] bg-accent/30 mb-4" />
                    <p className="text-sm text-white/55 font-body font-light leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Still have questions */}
          <div className="text-center mt-12">
            <p className="text-sm text-white/40 font-body mb-2">Still have questions?</p>
            <a
              href="mailto:aromstudio27@gmail.com"
              className="text-sm text-accent font-body font-medium hover:text-white transition-colors duration-200"
            >
              aromstudio27@gmail.com
            </a>
          </div>
        </Container>
      </Section>
      <CTABanner />
    </main>
  )
}
