import { useState, useEffect } from 'react'
import { DataTable } from '../components/DataTable'
import { MousePointer2, Download } from 'lucide-react'
import { generateAdminReportPDF } from '../../lib/professionalPDF'

export function LinkClicks() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch('/api/admin/clicks', { credentials: 'include' })
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
  }, [])

  if (!data) return <div className="text-sm text-white/50">Loading link click telemetry...</div>

  const columns = [
    { key: 'createdAt', label: 'Time', render: (v: string) => new Date(v).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) },
    { key: 'type', label: 'Type', render: (v: string) => <span className="capitalize">{v}</span> },
    { key: 'label', label: 'Label' },
    { key: 'page', label: 'Page' },
  ]

  const handleExportClicksPDF = () => {
    const clicksList = data.clicks || []
    generateAdminReportPDF({
      sectionTitle: 'Link Clicks & Call-to-Action Analytics',
      subtitle: `${data.total || 0} Total Recorded CTA Interactions`,
      headers: ['Time (IST)', 'Type', 'Button / Link Label', 'Source Page Route'],
      rows: clicksList.map((c: any) => [
        new Date(c.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        c.type || 'click',
        c.label || 'CTA Button',
        c.page || '/',
      ]),
      summaryLines: [
        `Total CTA Interactions: ${data.total || 0}`,
        `Top CTA Button: ${Object.entries(data.byLabel || {}).sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0] || 'Contact Us'}`,
      ],
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="glass rounded-[24px] p-4 flex items-center gap-3 border border-white/10">
          <MousePointer2 className="h-5 w-5 text-accent" />
          <div>
            <p className="text-2xl font-bold text-white">{data.total}</p>
            <p className="text-[11px] text-white/50">Total Clicks</p>
          </div>
        </div>

        <button
          onClick={handleExportClicksPDF}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 text-white font-semibold text-xs hover:bg-white/20 transition-all border border-white/10 cursor-pointer"
        >
          <Download className="h-4 w-4 text-accent" /> Export PDF Clicks Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass rounded-[--radius-card] p-4">
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Click Count by Label</h3>
          <div className="space-y-1.5">
            {Object.entries(data.byLabel || {}).sort(([,a], [,b]) => (b as number) - (a as number)).map(([label, count]) => (
              <div key={label} className="flex items-center gap-3 text-xs">
                <span className="text-text-secondary w-48 truncate">{label}</span>
                <div className="flex-1 h-4 bg-surface-light rounded-full overflow-hidden">
                  <div className="h-full bg-accent/40 rounded-full" style={{ width: `${((count as number) / data.total) * 100}%` }} />
                </div>
                <span className="text-text-secondary w-8 text-right">{count as number}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass rounded-[--radius-card] p-4">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">All Clicks</h3>
        <DataTable columns={columns} data={data.clicks || []} />
      </div>
    </div>
  )
}
