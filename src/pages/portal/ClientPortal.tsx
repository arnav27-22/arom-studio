import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Upload, Clock, Palette, RefreshCw,
  Download, Handshake, ChevronLeft, ChevronRight, Menu, X,
  PenSquare, FileCheck, ScrollText
} from 'lucide-react'
import { cn } from '../../lib/cn'

const sidebarLinks = [
  { label: 'Dashboard', href: '/portal/dashboard', icon: LayoutDashboard },
  { label: 'Client Inquiry Form', href: '/portal/inquiry', icon: PenSquare },
  { label: 'Project Proposal', href: '/portal/proposal', icon: FileCheck },
  { label: 'Website Agreement', href: '/portal/agreement', icon: ScrollText },
  { label: 'Project Timeline', href: '/portal/timeline', icon: Clock },
  { label: 'Design Approval', href: '/portal/design', icon: Palette },
  { label: 'Assets Upload', href: '/portal/assets', icon: Upload },
  { label: 'Revision Requests', href: '/portal/revisions', icon: RefreshCw },
  { label: 'Downloads', href: '/portal/downloads', icon: Download },
  { label: 'Handover', href: '/portal/handover', icon: Handshake },
]

export default function ClientPortal() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-bg text-white font-body pt-16">
      <div className="flex">
        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-20 left-4 z-50 md:hidden glass rounded-full p-2.5"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Mobile sidebar */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-16 bottom-0 z-50 w-72 md:hidden overflow-y-auto glass-strong border-r border-white/10"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                  <span className="font-heading text-lg">Client Portal</span>
                  <button onClick={() => setMobileOpen(false)} className="glass rounded-full p-1.5">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {renderSidebarLinks(true)}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Desktop sidebar */}
        <aside
          className={cn(
            'hidden md:block sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto transition-all duration-300 border-r border-white/5',
            sidebarOpen ? 'w-60' : 'w-16',
          )}
          style={{ scrollbarWidth: 'thin' }}
        >
          <div className="p-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="glass rounded-full p-1.5 mb-4 mx-auto block"
            >
              {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            {sidebarLinks.map((link) => {
              const Icon = link.icon
              return (
                <NavLink
                  key={link.href}
                  to={link.href}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm font-body font-light transition-all duration-200 mb-0.5',
                      isActive
                        ? 'glass-strong text-white'
                        : 'text-white/50 hover:text-white hover:bg-white/5',
                    )
                  }
                  title={link.label}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {sidebarOpen && <span className="truncate">{link.label}</span>}
                </NavLink>
              )
            })}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function renderSidebarLinks(mobile: boolean) {
  return sidebarLinks.map((link) => {
    const Icon = link.icon
    return (
      <NavLink
        key={link.href}
        to={link.href}
        onClick={() => { if (mobile) document.querySelector<HTMLButtonElement>('button[class*="X"]')?.click() }}
        className={({ isActive }) =>
          cn(
            'flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm font-body font-light transition-all duration-200 mb-0.5',
            isActive ? 'glass-strong text-white' : 'text-white/50 hover:text-white hover:bg-white/5',
          )
        }
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{link.label}</span>
      </NavLink>
    )
  })
}
