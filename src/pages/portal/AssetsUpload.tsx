import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, CheckCircle2, Link2, Download, Mail, Share2 } from 'lucide-react'
import Button from '../../components/ui/Button'
import { generateAssetsPDF } from '../../lib/professionalPDF'

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="12" r="12" fill="#25D366" />
      <path fill="white" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

const assetCategories = [
  'Logo', 'Images', 'Videos', 'Brand Guidelines', 'Fonts',
  'PDF Files', 'Documents', 'Social Media Assets', 'Other Resources',
]

export default function AssetsUpload() {
  const [folderLink, setFolderLink] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState('')

  const handleSubmit = () => {
    if (!folderLink.trim()) {
      setErrors('Please paste your Google Drive folder link.')
      return
    }
    if (!folderLink.includes('drive.google.com')) {
      setErrors('Please enter a valid Google Drive link.')
      return
    }
    setErrors('')
    setSubmitted(true)
  }

  const clientName = 'Your Company'
  const projectName = 'Website Project'

  const handleDownloadPDF = () => {
    generateAssetsPDF({
      clientName,
      projectName,
      folderLink,
      categories: assetCategories,
    })
  }

  const driveLink = 'https://drive.google.com/drive/folders/1UHPy0RLioixUn2N-Jpa375bkKKYTqyVb?usp=sharing'

  const shareText = encodeURIComponent(
    `Hi Arnav,\n\nI have uploaded the project assets.\n\nClient: ${clientName}\nProject: ${projectName}\nFolder: ${folderLink || driveLink}`
  )

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-3xl md:text-4xl text-white tracking-[-1px]">Assets Upload</h1>
        <p className="text-sm text-white/50 font-body font-light mt-1">Upload your brand assets via Google Drive.</p>
      </div>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-[32px] p-8 md:p-12 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 className="h-10 w-10 text-green-400" />
            </motion.div>
            <h2 className="font-heading text-3xl text-white mb-3">Upload Received!</h2>
            <p className="text-sm text-white/60 font-body font-light mb-6">Thank you. Your assets have been noted for review.</p>

            <div className="glass rounded-[20px] p-5 mb-6 text-left">
              <h3 className="font-heading text-lg text-white mb-3">Summary</h3>
              <div className="space-y-2 text-sm text-white/60 font-body">
                <p><span className="text-white/80">Client:</span> {clientName}</p>
                <p><span className="text-white/80">Project:</span> {projectName}</p>
                <p><span className="text-white/80">Folder Link:</span> <a href={folderLink} target="_blank" rel="noopener noreferrer" className="text-accent underline break-all">{folderLink}</a></p>
                <p><span className="text-white/80">Date:</span> {new Date().toLocaleDateString('en-IN')}</p>
                <div>
                  <p className="text-white/80 mb-1">Assets Checklist:</p>
                  {assetCategories.map((c) => (
                    <p key={c} className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-400" /> {c}</p>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="secondary" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4" /> Download Summary
              </Button>
              <a
                href={`https://wa.me/918767990061?text=${shareText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-whatsapp/20 hover:bg-whatsapp/30 text-whatsapp text-sm font-body font-medium rounded-full px-6 py-3 transition-all"
              >
                <WhatsAppIcon className="h-5 w-5" /> Share on WhatsApp
              </a>
              <a
                href={`mailto:aromstudio27@gmail.com?subject=${encodeURIComponent(`Assets Upload - ${clientName}`)}&body=${shareText}`}
                className="inline-flex items-center justify-center gap-2 bg-accent/10 hover:bg-accent/20 text-accent text-sm font-body font-medium rounded-full px-6 py-3 transition-all"
              >
                <Mail className="h-4 w-4" /> Share via Email
              </a>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-[32px] p-8 md:p-10"
          >
            <h2 className="font-heading text-2xl text-white mb-6">Step-by-Step Instructions</h2>

            <div className="glass rounded-[20px] p-5 mb-4">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-accent/20 text-accent text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                <div>
                  <h3 className="font-heading text-lg text-white mb-1">Create a folder in Google Drive</h3>
                  <p className="text-sm text-white/60 font-body">Name it <span className="text-accent font-medium">ClientName_ProjectName</span></p>
                  <p className="text-xs text-white/40 font-body mt-1">Example: <span className="text-white/60">ABCCompany_BusinessWebsite</span></p>
                </div>
              </div>
            </div>

            <div className="glass rounded-[20px] p-5 mb-4">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-accent/20 text-accent text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                <div>
                  <h3 className="font-heading text-lg text-white mb-2">Upload your assets</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {assetCategories.map((cat) => (
                      <div key={cat} className="flex items-center gap-1.5 text-xs text-white/50 font-body">
                        <Upload className="h-3 w-3 text-accent" /> {cat}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="glass rounded-[20px] p-5 mb-6">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-accent/20 text-accent text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                <div>
                  <h3 className="font-heading text-lg text-white mb-2">Share the folder link below</h3>
                  <p className="text-sm text-white/60 font-body">Make sure the link is <span className="text-accent font-medium">public</span> (Anyone with the link can view).</p>
                  <p className="text-xs text-white/40 font-body mt-1">You can also share this link via WhatsApp or Email using the buttons below.</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="text-sm text-white/70 font-body block mb-2">Google Drive Folder Link</label>
              <div className="flex items-center gap-2 glass rounded-[18px] px-4 py-1 border border-white/10 focus-within:border-accent/40 transition-colors">
                <Link2 className="h-4 w-4 text-white/30 shrink-0" />
                <input type="url" value={folderLink} onChange={(e) => { setFolderLink(e.target.value); setErrors('') }} placeholder="Paste your public Google Drive link here..." className="w-full bg-transparent text-sm text-white placeholder:text-white/20 py-3 focus:outline-none font-body" />
              </div>
              {errors && <p className="text-xs text-red-400 mt-1 font-body">{errors}</p>}
            </div>

            <Button variant="secondary" size="lg" onClick={handleSubmit} className="w-full mb-4">
              <CheckCircle2 className="h-4 w-4" /> I've Uploaded Everything
            </Button>

            <div className="border-t border-white/10 pt-5">
              <p className="text-xs text-white/40 font-body mb-3 flex items-center gap-1.5"><Share2 className="h-3 w-3" /> Or share the folder link directly:</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={`https://wa.me/918767990061?text=${encodeURIComponent(`Hi Arnav,\n\nI have uploaded the project assets.\n\nClient: ${clientName}\nProject: ${projectName}\nFolder: ${folderLink || 'Paste your folder link here'}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-whatsapp/20 hover:bg-whatsapp/30 text-whatsapp text-sm font-body font-medium rounded-full px-5 py-2.5 transition-all flex-1"
                >
                  <WhatsAppIcon className="h-4 w-4" /> Share on WhatsApp
                </a>
                <a
                  href={`mailto:aromstudio27@gmail.com?subject=${encodeURIComponent(`Assets Upload - ${clientName}`)}&body=${encodeURIComponent(`Hi Arnav,\n\nI have uploaded the project assets.\n\nClient: ${clientName}\nProject: ${projectName}\nFolder: ${folderLink || 'Paste your folder link here'}`)}`}
                  className="flex items-center justify-center gap-2 bg-accent/10 hover:bg-accent/20 text-accent text-sm font-body font-medium rounded-full px-5 py-2.5 transition-all flex-1"
                >
                  <Mail className="h-4 w-4" /> Share via Email
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
