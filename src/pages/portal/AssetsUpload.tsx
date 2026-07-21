import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, CheckCircle2, Link2, Download, ArrowUpRight } from 'lucide-react'
import Button from '../../components/ui/Button'
import { generatePDF } from '../../lib/generatePDF'

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
    generatePDF({
      filename: `Assets_Summary_${new Date().toISOString().split('T')[0]}.pdf`,
      title: 'Assets Upload Summary',
      sections: [
        { title: 'Project Details', content: [`Client: ${clientName}`, `Project: ${projectName}`, `Folder Link: ${folderLink}`, `Date: ${new Date().toLocaleDateString('en-IN')}`] },
        { title: 'Uploaded Assets Checklist', content: assetCategories.map((c) => `\u2610  ${c}`) },
      ],
    })
  }

  const driveLink = 'https://drive.google.com/drive/folders/1UHPy0RLioixUn2N-Jpa375bkKKYTqyVb?usp=sharing'

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
            <p className="text-sm text-white/60 font-body font-light mb-6">
              Thank you. Your assets have been noted for review.
            </p>

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
                href="https://wa.me/918767990061"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-body font-medium text-white glass-strong rounded-full px-6 py-3"
              >
                Send via WhatsApp <ArrowUpRight className="h-4 w-4" />
              </a>
              <a
                href="mailto:aromstudio27@gmail.com"
                className="inline-flex items-center gap-2 text-sm font-body font-medium text-white glass rounded-full px-6 py-3"
              >
                Send via Email <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
            <p className="text-xs text-white/40 font-body mt-4">
              Please also send this PDF through WhatsApp or Email for confirmation.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-[32px] p-8 md:p-10"
          >
            <h2 className="font-heading text-2xl text-white mb-6">Step-by-Step Instructions</h2>

            {/* Step 1 */}
            <div className="glass rounded-[20px] p-5 mb-4">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-accent/20 text-accent text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                <div>
                  <h3 className="font-heading text-lg text-white mb-1">Create a folder</h3>
                  <p className="text-sm text-white/60 font-body">Name it <span className="text-accent font-medium">ClientName_ProjectName</span></p>
                  <p className="text-xs text-white/40 font-body mt-1">Example: <span className="text-white/60">ABCCompany_BusinessWebsite</span></p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
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

            {/* Step 3 */}
            <div className="glass rounded-[20px] p-5 mb-6">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-accent/20 text-accent text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                <div>
                  <h3 className="font-heading text-lg text-white mb-2">Share the folder</h3>
                  <p className="text-sm text-white/60 font-body">
                    Share with: <span className="text-accent font-medium">aromstudio27@gmail.com</span>
                  </p>
                  <p className="text-xs text-white/40 font-body mt-1">Or paste your Google Drive link below.</p>
                </div>
              </div>
            </div>

            {/* Google Drive link input */}
            <div className="mb-6">
              <label className="text-sm text-white/70 font-body block mb-2">Google Drive Folder Link</label>
              <div className="flex items-center gap-2 glass rounded-[18px] px-4 py-1 border border-white/10 focus-within:border-accent/40 transition-colors">
                <Link2 className="h-4 w-4 text-white/30 shrink-0" />
                <input
                  type="url"
                  value={folderLink}
                  onChange={(e) => { setFolderLink(e.target.value); setErrors('') }}
                  placeholder={driveLink}
                  className="w-full bg-transparent text-sm text-white placeholder:text-white/20 py-3 focus:outline-none font-body"
                />
              </div>
              {errors && <p className="text-xs text-red-400 mt-1 font-body">{errors}</p>}
            </div>

            <Button variant="secondary" size="lg" onClick={handleSubmit} className="w-full">
              <CheckCircle2 className="h-4 w-4" /> I've Uploaded Everything
            </Button>

            <p className="text-xs text-white/30 font-body text-center mt-4">
              Already uploaded?{' '}
              <a href={driveLink} target="_blank" rel="noopener noreferrer" className="text-accent underline">Open Google Drive</a>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
