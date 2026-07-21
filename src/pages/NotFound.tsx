import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { SEO } from '../components/ui/SEO'

export default function NotFound() {
  return (
    <>
      <SEO
        title="404 - Page Not Found"
        description="The page you're looking for doesn't exist or has been moved. Return to AROM STUDIO homepage."
      />
      <div className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="relative z-10">
          <span className="text-[120px] sm:text-[180px] md:text-[220px] font-black text-white/10 leading-none tracking-tighter select-none">
            404
          </span>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-white leading-tight mt-[-0.5em]">
            Page not found
          </h1>
          <p className="mt-4 text-base md:text-lg text-white/50 font-body font-light max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link
            to="/"
            className="mt-8 inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white text-sm font-body font-medium rounded-full px-6 py-3 transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </>
  )
}
