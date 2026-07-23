import { useState } from 'react'
import jsPDF from 'jspdf'
import { Plus, Download, Eye, Trash2, FileText, CheckCircle2, DollarSign } from 'lucide-react'
import { getAdminStore, saveAdminStore, formatIST, recordAdminInvoice, type AdminInvoice } from '../adminStore'
import { StatCard } from '../components/StatCard'

export function InvoicesPage() {
  const [store, setStore] = useState(getAdminStore())
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<AdminInvoice | null>(null)

  // Invoice Form State
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientCompany, setClientCompany] = useState('')
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR')
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10))
  const [taxRate, setTaxRate] = useState(18)
  const [discountRate, setDiscountRate] = useState(0)
  const [notes, setNotes] = useState('Payment due within 7 days. Thank you for choosing AROM STUDIO.')
  const [items, setItems] = useState([
    { id: '1', description: 'Custom Web Design & Development Phase 1', quantity: 1, unitPrice: 32999 },
  ])

  const reloadStore = () => setStore(getAdminStore())

  // Calculations
  const subtotal = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0)
  const discountAmount = (subtotal * discountRate) / 100
  const taxable = subtotal - discountAmount
  const taxAmount = (taxable * taxRate) / 100
  const totalAmount = taxable + taxAmount

  const currencySymbol = currency === 'INR' ? '₹' : '$'

  const handleAddItem = () => {
    setItems([
      ...items,
      { id: Math.random().toString(), description: 'New Service Line Item', quantity: 1, unitPrice: 5000 },
    ])
  }

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((i) => i.id !== id))
    }
  }

  const handleItemChange = (id: string, field: string, value: any) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
  }

  const generatePDFDoc = (inv: AdminInvoice) => {
    const doc = new jsPDF('p', 'mm', 'a4')
    const sym = inv.currency === 'INR' ? 'Rs. ' : '$'

    // Header
    doc.setFillColor(30, 30, 35)
    doc.rect(0, 0, 210, 45, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(22)
    doc.text('AROM STUDIO', 15, 20)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(78, 133, 191)
    doc.text('PREMIUM DIGITAL AGENCY', 15, 26)

    doc.setTextColor(200, 200, 210)
    doc.setFontSize(9)
    doc.text('aromstudio27@gmail.com | +91 8767990061 | https://aromstudio.vercel.app', 15, 34)

    // Invoice Badge
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text('INVOICE', 160, 22)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(78, 133, 191)
    doc.text(inv.invoiceNumber, 160, 29)

    // Client Info Section
    doc.setTextColor(40, 40, 50)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('BILLED TO:', 15, 58)
    doc.setFont('helvetica', 'normal')
    doc.text(inv.clientName, 15, 64)
    if (inv.clientCompany) doc.text(inv.clientCompany, 15, 70)
    doc.text(inv.clientEmail, 15, inv.clientCompany ? 76 : 70)
    if (inv.clientPhone) doc.text(inv.clientPhone, 15, inv.clientCompany ? 82 : 76)

    // Invoice Meta
    doc.setFont('helvetica', 'bold')
    doc.text('INVOICE DETAILS:', 130, 58)
    doc.setFont('helvetica', 'normal')
    doc.text(`Date: ${formatIST(inv.createdAt)}`, 130, 64)
    doc.text(`Due Date: ${inv.dueDate}`, 130, 70)
    doc.text(`Status: ${inv.status.toUpperCase()}`, 130, 76)

    // Table Header
    let y = 95
    doc.setFillColor(240, 243, 248)
    doc.rect(15, y, 180, 8, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(60, 60, 70)
    doc.text('DESCRIPTION', 18, y + 5.5)
    doc.text('QTY', 120, y + 5.5)
    doc.text('PRICE', 145, y + 5.5)
    doc.text('TOTAL', 175, y + 5.5)

    y += 12
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(50, 50, 60)

    inv.items.forEach((item) => {
      const lineTotal = item.quantity * item.unitPrice
      doc.text(item.description, 18, y)
      doc.text(item.quantity.toString(), 122, y)
      doc.text(`${sym}${item.unitPrice.toLocaleString('en-IN')}`, 145, y)
      doc.text(`${sym}${lineTotal.toLocaleString('en-IN')}`, 175, y)
      y += 8
    })

    // Line Divider
    doc.setDrawColor(220, 220, 230)
    doc.line(15, y, 195, y)
    y += 10

    // Summary Box
    doc.setFont('helvetica', 'normal')
    doc.text(`Subtotal: ${sym}${inv.subtotal.toLocaleString('en-IN')}`, 135, y)
    y += 6
    if (inv.discountAmount > 0) {
      doc.text(`Discount (${inv.discountRate}%): -${sym}${inv.discountAmount.toLocaleString('en-IN')}`, 135, y)
      y += 6
    }
    doc.text(`GST/Tax (${inv.taxRate}%): +${sym}${inv.taxAmount.toLocaleString('en-IN')}`, 135, y)
    y += 8

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(78, 133, 191)
    doc.text(`Total Due: ${sym}${inv.totalAmount.toLocaleString('en-IN')}`, 135, y)

    // Footer Notes
    y = Math.max(y + 20, 240)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(120, 120, 130)
    doc.text(`Notes: ${inv.notes || 'Thank you for your business.'}`, 15, y)
    doc.text('AROM STUDIO • Crafting Precision Digital Products', 15, y + 6)

    return doc
  }

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientName || !clientEmail) return

    const invNum = `AROM-INV-2026-${String(store.invoices.length + 1).padStart(3, '0')}`
    const newInvoice: Omit<AdminInvoice, 'id' | 'createdAt'> = {
      invoiceNumber: invNum,
      dueDate,
      clientName,
      clientEmail,
      clientPhone,
      clientCompany,
      currency,
      items,
      taxRate,
      discountRate,
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount,
      status: 'Pending',
      notes,
    }

    recordAdminInvoice(newInvoice)
    reloadStore()
    setShowCreateModal(false)

    // Reset Form
    setClientName('')
    setClientEmail('')
    setClientPhone('')
    setClientCompany('')
  }

  const handleDownloadInvoicePDF = (inv: AdminInvoice) => {
    const doc = generatePDFDoc(inv)
    doc.save(`${inv.invoiceNumber}_${inv.clientName.replace(/\s+/g, '_')}.pdf`)
  }

  const handlePreviewInvoicePDF = (inv: AdminInvoice) => {
    const doc = generatePDFDoc(inv)
    const url = doc.output('datauristring')
    setPreviewPdfUrl(url)
    setSelectedInvoice(inv)
  }

  const handleDeleteInvoice = (id: string) => {
    if (confirm('Delete this invoice record?')) {
      const s = getAdminStore()
      s.invoices = s.invoices.filter((i) => i.id !== id)
      saveAdminStore(s)
      reloadStore()
    }
  }

  const totalCollected = store.invoices
    .filter((i) => i.status === 'Paid')
    .reduce((acc, i) => acc + i.totalAmount, 0)

  const totalPending = store.invoices
    .filter((i) => i.status === 'Pending')
    .reduce((acc, i) => acc + i.totalAmount, 0)

  return (
    <div className="space-y-6">
      {/* Header Metrics */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 w-full">
          <StatCard label="Total Invoices" value={store.invoices.length} icon={<FileText className="h-4 w-4" />} />
          <StatCard label="Collected (Paid)" value={`₹${totalCollected.toLocaleString('en-IN')}`} icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />} />
          <StatCard label="Pending Receivables" value={`₹${totalPending.toLocaleString('en-IN')}`} icon={<DollarSign className="h-4 w-4 text-amber-400" />} />
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent/90 text-white font-medium text-xs rounded-xl shadow-lg shadow-accent/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" /> Create New Invoice
        </button>
      </div>

      {/* Invoice Table */}
      <div className="glass rounded-[24px] p-6 border border-white/10">
        <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-4">Invoice History</h3>
        {store.invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-body">
              <thead>
                <tr className="border-b border-white/10 text-white/40 uppercase tracking-wider text-[10px]">
                  <th className="text-left py-3 px-2">Invoice #</th>
                  <th className="text-left py-3 px-2">Client</th>
                  <th className="text-left py-3 px-2">Date (IST)</th>
                  <th className="text-left py-3 px-2">Due Date</th>
                  <th className="text-right py-3 px-2">Amount</th>
                  <th className="text-center py-3 px-2">Status</th>
                  <th className="text-right py-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {store.invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-2 font-mono text-accent font-medium">{inv.invoiceNumber}</td>
                    <td className="py-3 px-2">
                      <p className="text-white font-medium">{inv.clientName}</p>
                      <p className="text-white/40 text-[10px]">{inv.clientEmail}</p>
                    </td>
                    <td className="py-3 px-2 text-white/60">{formatIST(inv.createdAt)}</td>
                    <td className="py-3 px-2 text-white/60 font-mono">{inv.dueDate}</td>
                    <td className="py-3 px-2 text-right font-mono font-medium text-white">
                      {inv.currency === 'INR' ? '₹' : '$'}{inv.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                        inv.status === 'Paid' ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' :
                        inv.status === 'Overdue' ? 'bg-red-400/10 text-red-400 border border-red-400/20' :
                        'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handlePreviewInvoicePDF(inv)}
                          className="p-1.5 text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                          title="View PDF"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDownloadInvoicePDF(inv)}
                          className="p-1.5 text-accent hover:text-accent/80 bg-accent/10 hover:bg-accent/20 rounded-lg transition-colors"
                          title="Download PDF"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteInvoice(inv.id)}
                          className="p-1.5 text-red-400 hover:text-red-300 bg-red-400/10 rounded-lg transition-colors"
                          title="Delete Invoice"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-white/40 font-body py-4 text-center">No invoices generated yet</p>
        )}
      </div>

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="glass rounded-[24px] p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10 my-8">
            <h2 className="text-lg font-heading text-white mb-4 pb-2 border-b border-white/10 flex items-center justify-between">
              <span>Create Client Invoice</span>
              <span className="text-xs text-accent font-mono">AROM-INV-2026-{String(store.invoices.length + 1).padStart(3, '0')}</span>
            </h2>

            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs font-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-white/50 block mb-1">Client Full Name *</label>
                  <input required value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="e.g. Rajesh Mehta" className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white" />
                </div>
                <div>
                  <label className="text-white/50 block mb-1">Client Email *</label>
                  <input required type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="rajesh@nexusfin.com" className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white" />
                </div>
                <div>
                  <label className="text-white/50 block mb-1">Company Name</label>
                  <input value={clientCompany} onChange={(e) => setClientCompany(e.target.value)} placeholder="Nexus Financial Services" className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white" />
                </div>
                <div>
                  <label className="text-white/50 block mb-1">Phone Number</label>
                  <input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="+91 98230 11223" className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white" />
                </div>
                <div>
                  <label className="text-white/50 block mb-1">Currency</label>
                  <select value={currency} onChange={(e) => setCurrency(e.target.value as any)} className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white bg-bg">
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
                <div>
                  <label className="text-white/50 block mb-1">Payment Due Date</label>
                  <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white bg-bg" />
                </div>
              </div>

              {/* Line Items */}
              <div className="pt-3 border-t border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-accent font-semibold uppercase tracking-wider text-[10px]">Service Line Items</label>
                  <button type="button" onClick={handleAddItem} className="text-accent hover:underline text-[11px] flex items-center gap-1">
                    <Plus className="h-3 w-3" /> Add Item
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-6">
                        <input value={item.description} onChange={(e) => handleItemChange(item.id, 'description', e.target.value)} placeholder="Item description" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white" />
                      </div>
                      <div className="col-span-2">
                        <input type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))} placeholder="Qty" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-center" />
                      </div>
                      <div className="col-span-3">
                        <input type="number" min="0" value={item.unitPrice} onChange={(e) => handleItemChange(item.id, 'unitPrice', Number(e.target.value))} placeholder="Price" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-right font-mono" />
                      </div>
                      <div className="col-span-1 text-center">
                        <button type="button" onClick={() => handleRemoveItem(item.id)} className="text-red-400 hover:text-red-300 p-1">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tax / Discount */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-white/50 block mb-1">GST / Tax Rate (%)</label>
                  <input type="number" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white" />
                </div>
                <div>
                  <label className="text-white/50 block mb-1">Discount Rate (%)</label>
                  <input type="number" value={discountRate} onChange={(e) => setDiscountRate(Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white" />
                </div>
              </div>

              {/* Summary Calculation */}
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1 font-mono text-right text-xs">
                <div>Subtotal: {currencySymbol}{subtotal.toLocaleString('en-IN')}</div>
                {discountAmount > 0 && <div className="text-amber-400">Discount ({discountRate}%): -{currencySymbol}{discountAmount.toLocaleString('en-IN')}</div>}
                <div>Tax ({taxRate}%): +{currencySymbol}{taxAmount.toLocaleString('en-IN')}</div>
                <div className="text-sm text-accent font-bold pt-1 border-t border-white/10">Total: {currencySymbol}{totalAmount.toLocaleString('en-IN')}</div>
              </div>

              <div>
                <label className="text-white/50 block mb-1">Payment Notes / Terms</label>
                <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white resize-none" />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-white/50 hover:text-white">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-accent text-white font-medium rounded-xl hover:bg-accent/90 transition-colors">
                  Save &amp; Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF View Modal */}
      {previewPdfUrl && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setPreviewPdfUrl(null)}>
          <div className="glass rounded-[24px] p-6 max-w-4xl w-full h-[85vh] flex flex-col border border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
              <h3 className="font-heading text-white text-base">Invoice PDF — {selectedInvoice.invoiceNumber}</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadInvoicePDF(selectedInvoice)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white text-xs font-medium rounded-lg hover:bg-accent/90"
                >
                  <Download className="h-3.5 w-3.5" /> Download PDF
                </button>
                <button onClick={() => setPreviewPdfUrl(null)} className="text-white/50 hover:text-white px-2 py-1 text-xs">Close</button>
              </div>
            </div>
            <iframe src={previewPdfUrl} className="w-full flex-1 rounded-xl bg-white" title="Invoice PDF Preview" />
          </div>
        </div>
      )}
    </div>
  )
}
