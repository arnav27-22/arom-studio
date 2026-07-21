import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Lock, Bell, Save, CheckCircle2 } from 'lucide-react'
import Button from '../../components/ui/Button'
import { cn } from '../../lib/cn'

export default function Settings() {
  const [profile, setProfile] = useState({ name: '', company: '', email: '', phone: '' })
  const [password, setPassword] = useState({ current: '', new: '', confirm: '' })
  const [notifications, setNotifications] = useState({ email: true, whatsapp: true, sms: false })
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-3xl md:text-4xl text-white tracking-[-1px]">Settings</h1>
        <p className="text-sm text-white/50 font-body font-light mt-1">Manage your profile and preferences.</p>
      </div>

      <div className="space-y-6">
        {/* Profile */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-[28px] p-6 md:p-8">
          <h3 className="font-heading text-xl text-white mb-5">Profile</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Full Name', value: profile.name, key: 'name' as const, icon: User, placeholder: 'John Doe' },
              { label: 'Company', value: profile.company, key: 'company' as const, icon: User, placeholder: 'ABC Pvt Ltd' },
              { label: 'Email', value: profile.email, key: 'email' as const, icon: Mail, placeholder: 'john@company.com', type: 'email' },
              { label: 'Phone', value: profile.phone, key: 'phone' as const, icon: Phone, placeholder: '+1 234 567 890', type: 'tel' },
            ].map((field) => {
              const Icon = field.icon
              return (
                <div key={field.key}>
                  <label className="text-xs text-white/50 font-body block mb-1.5">{field.label}</label>
                  <div className="flex items-center gap-2 glass rounded-[14px] px-3 border border-white/10 focus-within:border-accent/40 transition-colors">
                    <Icon className="h-4 w-4 text-white/30 shrink-0" />
                    <input
                      type={field.type || 'text'}
                      value={field.value}
                      onChange={(e) => setProfile((p) => ({ ...p, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full bg-transparent text-sm text-white placeholder:text-white/20 py-2.5 focus:outline-none font-body"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Password */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-[28px] p-6 md:p-8">
          <h3 className="font-heading text-xl text-white mb-5">Change Password</h3>
          <div className="space-y-4">
            {[
              { label: 'Current Password', key: 'current' as const, placeholder: '••••••••' },
              { label: 'New Password', key: 'new' as const, placeholder: '••••••••' },
              { label: 'Confirm Password', key: 'confirm' as const, placeholder: '••••••••' },
            ].map((field) => (
              <div key={field.key}>
                <label className="text-xs text-white/50 font-body block mb-1.5">{field.label}</label>
                <div className="flex items-center gap-2 glass rounded-[14px] px-3 border border-white/10 focus-within:border-accent/40 transition-colors">
                  <Lock className="h-4 w-4 text-white/30 shrink-0" />
                  <input
                    type="password"
                    value={password[field.key]}
                    onChange={(e) => setPassword((p) => ({ ...p, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full bg-transparent text-sm text-white placeholder:text-white/20 py-2.5 focus:outline-none font-body"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-[28px] p-6 md:p-8">
          <h3 className="font-heading text-xl text-white mb-5">Notifications</h3>
          <div className="space-y-4">
            {[
              { label: 'Email Notifications', key: 'email' as const, desc: 'Receive updates via email' },
              { label: 'WhatsApp Notifications', key: 'whatsapp' as const, desc: 'Receive updates via WhatsApp' },
              { label: 'SMS Notifications', key: 'sms' as const, desc: 'Receive updates via SMS' },
            ].map((item) => (
              <label key={item.key} className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <Bell className="h-4 w-4 text-white/40" />
                  <div>
                    <p className="text-sm text-white/80 font-body">{item.label}</p>
                    <p className="text-[10px] text-white/40 font-body">{item.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                  className={cn(
                    'w-10 h-6 rounded-full transition-colors relative',
                    notifications[item.key] ? 'bg-accent' : 'bg-white/10',
                  )}
                >
                  <div className={cn(
                    'w-4 h-4 rounded-full bg-white absolute top-1 transition-transform',
                    notifications[item.key] ? 'translate-x-5' : 'translate-x-1',
                  )} />
                </button>
              </label>
            ))}
          </div>
        </motion.div>

        {/* Save */}
        <div className="flex justify-end">
          <Button variant="secondary" onClick={handleSave}>
            {saved ? <><CheckCircle2 className="h-4 w-4" /> Saved!</> : <><Save className="h-4 w-4" /> Save Changes</>}
          </Button>
        </div>
      </div>
    </div>
  )
}
