import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { WhatsAppButton } from './components/ui/WhatsAppButton'
import { SiteBackground } from './components/ui/SiteBackground'
import { Particles } from './components/ui/ParticleBackground'
import { CookieConsent } from './components/ui/CookieConsent'
import { MobileBottomCTA } from './components/ui/MobileBottomCTA'
import { initTracker, trackPageView } from './lib/tracker'

import Home from './pages/Home'

const Services = lazy(() => import('./pages/Services'))
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'))
const CityService = lazy(() => import('./pages/CityService'))
const Pricing = lazy(() => import('./pages/Pricing'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const FAQ = lazy(() => import('./pages/FAQ'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Terms = lazy(() => import('./pages/Terms'))
const Refund = lazy(() => import('./pages/Refund'))
const Brand = lazy(() => import('./pages/Brand'))
const Blog = lazy(() => import('./pages/Blog'))
const BlogPost = lazy(() => import('./pages/BlogPost'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Inquiry = lazy(() => import('./pages/pre-portal/Inquiry'))
const Questionnaire = lazy(() => import('./pages/pre-portal/Questionnaire'))
const Proposal = lazy(() => import('./pages/pre-portal/Proposal'))
const ClientPortal = lazy(() => import('./pages/portal/ClientPortal'))
const ClientInquiry = lazy(() => import('./pages/portal/ClientInquiry'))
const ProjectProposal = lazy(() => import('./pages/portal/ProjectProposal'))
const Agreement = lazy(() => import('./pages/portal/Agreement'))
const DiscoveryQuestionnaire = lazy(() => import('./pages/portal/DiscoveryQuestionnaire'))
const AssetsUpload = lazy(() => import('./pages/portal/AssetsUpload'))
const ProjectTimeline = lazy(() => import('./pages/portal/ProjectTimeline'))
const ContentCollection = lazy(() => import('./pages/portal/ContentCollection'))
const Handover = lazy(() => import('./pages/portal/Handover'))
const AdminApp = lazy(() => import('./admin/AdminApp'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function PageTracker() {
  const { pathname } = useLocation()
  useEffect(() => {
    trackPageView(pathname, document.referrer)
  }, [pathname])
  return null
}

export default function App() {
  useEffect(() => { initTracker() }, [])

  return (
    <>
      <ScrollToTop />
      <Analytics />
      <CookieConsent />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/admin" element={<AdminApp />} />
          <Route path="*" element={
            <div className="min-h-screen bg-bg text-white font-body overflow-x-hidden relative">
              <SiteBackground />
              <Particles quantity={55} color="#4e85bf" size={1.2} vx={0.03} vy={0.03} />
              <Navbar />
              <PageTracker />
              <Suspense fallback={null}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/services/:slug" element={<ServiceDetail />} />
                  <Route path="/services/:slug/in/:cityName" element={<CityService />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/refund" element={<Refund />} />
                  <Route path="/brand" element={<Brand />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/inquiry" element={<Inquiry />} />
                  <Route path="/questionnaire" element={<Questionnaire />} />
                  <Route path="/proposal" element={<Proposal />} />
                  <Route path="/clientportal" element={<ClientPortal />}>
                    <Route index element={<ClientInquiry />} />
                    <Route path="inquiry" element={<ClientInquiry />} />
                    <Route path="proposal" element={<ProjectProposal />} />
                    <Route path="agreement" element={<Agreement />} />
                    <Route path="questionnaire" element={<DiscoveryQuestionnaire />} />
                    <Route path="timeline" element={<ProjectTimeline />} />
                    <Route path="content" element={<ContentCollection />} />
                    <Route path="assets" element={<AssetsUpload />} />
                    <Route path="handover" element={<Handover />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <Footer />
              <WhatsAppButton />
              <MobileBottomCTA />
            </div>
          } />
        </Routes>
      </Suspense>
    </>
  )
}
