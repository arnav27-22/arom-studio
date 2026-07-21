import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { WhatsAppButton } from './components/ui/WhatsAppButton'
import { SiteBackground } from './components/ui/SiteBackground'
import { Particles } from './components/ui/ParticleBackground'
import Home from './pages/Home'
import Services from './pages/Services'
import ServiceDetail from './pages/ServiceDetail'
import CityService from './pages/CityService'
import Pricing from './pages/Pricing'
import About from './pages/About'
import Contact from './pages/Contact'
import FAQ from './pages/FAQ'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Refund from './pages/Refund'
import Brand from './pages/Brand'
import NotFound from './pages/NotFound'
import Inquiry from './pages/pre-portal/Inquiry'
import Questionnaire from './pages/pre-portal/Questionnaire'
import Proposal from './pages/pre-portal/Proposal'
import ClientPortal from './pages/portal/ClientPortal'
import ClientInquiry from './pages/portal/ClientInquiry'
import ProjectProposal from './pages/portal/ProjectProposal'
import Agreement from './pages/portal/Agreement'
import DiscoveryQuestionnaire from './pages/portal/DiscoveryQuestionnaire'
import AssetsUpload from './pages/portal/AssetsUpload'
import ProjectTimeline from './pages/portal/ProjectTimeline'
import Handover from './pages/portal/Handover'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen bg-bg text-white font-body overflow-x-hidden relative">
        <SiteBackground />
        <Particles quantity={55} color="#4e85bf" size={1.2} vx={0.03} vy={0.03} />
        <Navbar />
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
          <Route path="/inquiry" element={<Inquiry />} />
          <Route path="/questionnaire" element={<Questionnaire />} />
          <Route path="/proposal" element={<Proposal />} />
          <Route path="/portal" element={<ClientPortal />}>
            <Route index element={<ClientInquiry />} />
            <Route path="inquiry" element={<ClientInquiry />} />
            <Route path="proposal" element={<ProjectProposal />} />
            <Route path="agreement" element={<Agreement />} />
            <Route path="questionnaire" element={<DiscoveryQuestionnaire />} />
            <Route path="timeline" element={<ProjectTimeline />} />
            <Route path="assets" element={<AssetsUpload />} />
            <Route path="handover" element={<Handover />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
        <WhatsAppButton />
      </div>
    </>
  )
}
