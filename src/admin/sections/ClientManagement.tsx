import { useState, useEffect } from 'react'
import { StatCard } from '../components/StatCard'
import { DataTable } from '../components/DataTable'
import { UserCheck, Search, Plus, ExternalLink, Mail, Phone, DollarSign, Briefcase, Eye, Trash2, X, Clock, Download, MessageCircle, MapPin, Hash, FileText, Globe, Users } from 'lucide-react'
import { getAdminStore, moveToRecycleBin, syncFromCloud, formatIST, recordAdminClient, updateAdminClient, type AdminClient } from '../adminStore'
import { exportSectionReportPDF } from '../../lib/professionalPDF'

type ProfileTab = 'overview' | 'timeline' | 'meetings' | 'files' | 'payments'

export function ClientManagement() {
  const [store, setStore] = useState(getAdminStore())
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [selectedClient, setSelectedClient] = useState<AdminClient | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingClient, setEditingClient] = useState<AdminClient | null>(null)
  const [profileTab, setProfileTab] = useState<ProfileTab>('overview')

  const [form, setForm] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    website: '',
    status: 'Active' as string,
    notes: '',
    revenue: 0,
    whatsapp: '',
    address: '',
    gst: '',
    leadSource: '',
    industry: '',
    tags: '',
  })

  useEffect(() => { syncFromCloud().then(s => setStore(s)) }, [])

  const clients = store.clients || []

  const filteredClients = clients.filter((c) => {
    const meta = c.metadata || {}
    const tags = meta.tags || []
    const searchStr = [c.companyName, c.contactPerson, c.email, meta.whatsapp, meta.gst, meta.leadSource, ...tags].filter(Boolean).join(' ').toLowerCase()
    const matchesSearch = searchStr.includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalClients = clients.length
  const activeClients = clients.filter((c) => c.status === 'Active').length
  const onboardingClients = clients.filter((c) => c.status === 'Onboarding').length
  const totalRevenue = clients.reduce((acc, c) => acc + (c.totalRevenue || 0), 0)

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.companyName || !form.email) return

    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)
    const common = {
      companyName: form.companyName,
      contactPerson: form.contactPerson || 'Primary Contact',
      email: form.email,
      phone: form.phone || 'N/A',
      website: form.website || 'https://',
      status: form.status as 'Active' | 'Completed' | 'Onboarding' | 'Inactive',
      totalRevenue: Number(form.revenue) || 0,
      notes: form.notes || '',
      metadata: {
        whatsapp: form.whatsapp || undefined,
        address: form.address || undefined,
        gst: form.gst || undefined,
        leadSource: form.leadSource || undefined,
        industry: form.industry || undefined,
        tags: tags.length > 0 ? tags : undefined,
      },
    }

    if (editingClient) {
      const updated = await updateAdminClient(editingClient.id, common)
      if (updated) {
        syncFromCloud().then(s => setStore(s))
      }
    } else {
      const created = await recordAdminClient({
        ...common,
        activeProjectsCount: 1,
        timeline: [{ date: new Date().toISOString().slice(0, 10), event: 'Client Account Created' }],
        metadata: {
          ...common.metadata,
          socialLinks: [],
          meetingHistory: [],
          files: [],
          paymentHistory: [],
        },
      })
      if (created) {
        syncFromCloud().then(s => setStore(s))
      }
    }
    setShowAddModal(false)
    setEditingClient(null)
    setForm({ companyName: '', contactPerson: '', email: '', phone: '', website: '', status: 'Active', notes: '', revenue: 0, whatsapp: '', address: '', gst: '', leadSource: '', industry: '', tags: '' })
  }

  const handleEditClient = (client: AdminClient) => {
    setEditingClient(client)
    setForm({
      companyName: client.companyName,
      contactPerson: client.contactPerson,
      email: client.email,
      phone: client.phone,
      website: client.website,
      status: client.status,
      notes: client.notes || '',
      revenue: client.totalRevenue || 0,
      whatsapp: client.metadata?.whatsapp || '',
      address: client.metadata?.address || '',
      gst: client.metadata?.gst || '',
      leadSource: client.metadata?.leadSource || '',
      industry: client.metadata?.industry || '',
      tags: (client.metadata?.tags || []).join(', '),
    })
    setShowAddModal(true)
  }
  const handleDeleteClient = (id: string) => {
    const c = store.clients.find((x) => x.id === id)
    moveToRecycleBin('clients', id, c?.companyName, c?.email)
    syncFromCloud().then(s => setStore(s))
    if (selectedClient?.id === id) setSelectedClient(null)
  }

  const columns = [
    {
      key: 'companyName',
      label: 'Company & Contact',
      render: (v: string, row: AdminClient) => {
        const meta = row.metadata || {}
        const tags = meta.tags || []
        return (
          <div>
            <div className="text-white font-bold text-xs flex items-center gap-2">
              {v}
              {meta.industry && <span className="text-[10px] text-white/40 font-mono">({meta.industry})</span>}
            </div>
            <div className="text-[11px] text-accent font-medium">{row.contactPerson}</div>
            {tags.length > 0 && (
              <div className="flex gap-1 mt-1">
                {tags.slice(0, 3).map(t => <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/50">{t}</span>)}
              </div>
            )}
          </div>
        )
      },
    },
    {
      key: 'email',
      label: 'Contact Info',
      render: (v: string, row: AdminClient) => {
        const meta = row.metadata || {}
        return (
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs text-white/80"><Mail className="h-3 w-3 text-accent" /> {v}</div>
            <div className="flex items-center gap-1.5 text-[10px] text-white/50 font-mono"><Phone className="h-3 w-3" /> {row.phone}</div>
            {meta.whatsapp && <div className="flex items-center gap-1.5 text-[10px] text-emerald-400/70 font-mono"><MessageCircle className="h-3 w-3" /> {meta.whatsapp}</div>}
          </div>
        )
      },
    },
    {
      key: 'metadata',
      label: 'Location & GST',
      render: (_: any, row: AdminClient) => {
        const meta = row.metadata || {}
        return (
          <div className="space-y-0.5">
            {meta.address && <div className="flex items-center gap-1.5 text-[10px] text-white/50"><MapPin className="h-3 w-3" /> {meta.address}</div>}
            {meta.gst && <div className="flex items-center gap-1.5 text-[10px] text-white/50 font-mono"><Hash className="h-3 w-3" /> GST: {meta.gst}</div>}
            {meta.leadSource && <div className="flex items-center gap-1.5 text-[10px] text-amber-400/70"><Users className="h-3 w-3" /> {meta.leadSource}</div>}
          </div>
        )
      },
    },
    {
      key: 'activeProjectsCount',
      label: 'Projects',
      render: (v: number) => (
        <span className="px-2.5 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent font-bold text-xs font-mono">{v} Active</span>
      ),
    },
    {
      key: 'totalRevenue',
      label: 'Revenue',
      render: (v: number) => (
        <span className="text-emerald-400 font-bold text-xs font-mono">₹{(v || 0).toLocaleString()}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (v: string) => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border capitalize ${
          v === 'Active' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
          v === 'Onboarding' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
          v === 'Completed' ? 'bg-accent/10 border-accent/30 text-accent' : 'bg-white/5 border-white/10 text-white/40'
        }`}>{v}</span>
      ),
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_: string, row: AdminClient) => (
        <div className="flex items-center gap-2">
          <button onClick={() => { setSelectedClient(row); setProfileTab('overview') }} className="p-1.5 rounded-lg bg-white/5 hover:bg-accent/20 hover:text-accent text-white/60 transition-colors cursor-pointer" title="View Profile"><Eye className="h-3.5 w-3.5" /></button>
          <button onClick={() => handleEditClient(row)} className="p-1.5 rounded-lg bg-white/5 hover:bg-accent/20 hover:text-accent text-white/60 transition-colors cursor-pointer" title="Edit"><Plus className="h-3.5 w-3.5 rotate-45" /></button>
          <button onClick={() => handleDeleteClient(row.id)} className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white/60 transition-colors cursor-pointer" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2"><UserCheck className="h-5 w-5 text-accent" /> Client CRM</h2>
          <p className="text-xs text-white/50">Full CRM with lead tracking, meetings, files & payment history</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => {
            const headers = ['Company', 'Contact', 'Email', 'Phone', 'WhatsApp', 'GST', 'Source', 'Status', 'Revenue']
            const rows = clients.map(c => [c.companyName, c.contactPerson, c.email, c.phone, c.metadata?.whatsapp || '', c.metadata?.gst || '', c.metadata?.leadSource || '', c.status, `₹${(c.totalRevenue || 0).toLocaleString()}`])
            exportSectionReportPDF('Client CRM Report', 'AROM Studio Full Client Directory', headers, rows, 'CRM_Report')
          }} className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-accent text-black font-semibold text-xs hover:bg-accent/90 transition-all shadow-lg cursor-pointer"><Download className="h-4 w-4" /> Export CRM</button>
          <button onClick={() => setShowAddModal(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white font-semibold text-xs hover:bg-white/20 transition-all border border-white/10 cursor-pointer"><Plus className="h-4 w-4" /> Add Client</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Clients" value={totalClients} icon={<UserCheck className="h-4 w-4 text-accent" />} />
        <StatCard label="Active Retainers" value={activeClients} icon={<Briefcase className="h-4 w-4 text-emerald-400" />} />
        <StatCard label="In Onboarding" value={onboardingClients} icon={<Clock className="h-4 w-4 text-amber-400" />} />
        <StatCard label="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} icon={<DollarSign className="h-4 w-4 text-emerald-400" />} />
      </div>

      <div className="glass rounded-[24px] p-6 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input type="text" placeholder="Search name, email, phone, GST, tags, source..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-accent" />
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {['All', 'Active', 'Onboarding', 'Completed', 'Inactive'].map((st) => (
              <button key={st} onClick={() => setStatusFilter(st)} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${statusFilter === st ? 'bg-accent/20 border border-accent/40 text-accent' : 'text-white/50 hover:text-white bg-white/5'}`}>{st}</button>
            ))}
          </div>
        </div>
        <DataTable columns={columns} data={filteredClients} />
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass rounded-[28px] border border-white/10 p-6 w-full max-w-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 sticky top-0 bg-black/50 backdrop-blur-md z-10">
              <h3 className="text-base font-bold text-white font-heading">{editingClient ? 'Edit Client' : 'Add New Client'}</h3>
              <button onClick={() => { setShowAddModal(false); setEditingClient(null) }} className="text-white/40 hover:text-white cursor-pointer"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSaveClient} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 block mb-1 font-medium">Company Name *</label>
                  <input required type="text" placeholder="e.g. Acme Corp" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="text-white/60 block mb-1 font-medium">Contact Person</label>
                  <input type="text" placeholder="e.g. John Doe" value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 block mb-1 font-medium">Email *</label>
                  <input required type="email" placeholder="john@acme.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="text-white/60 block mb-1 font-medium">Phone</label>
                  <input type="text" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 block mb-1 font-medium">WhatsApp</label>
                  <input type="text" placeholder="+91 98765 43210" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="text-white/60 block mb-1 font-medium">Website</label>
                  <input type="text" placeholder="https://acme.com" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 block mb-1 font-medium">Address</label>
                  <input type="text" placeholder="Mumbai, India" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="text-white/60 block mb-1 font-medium">GST Number</label>
                  <input type="text" placeholder="27AABCU9603R1ZX" value={form.gst} onChange={(e) => setForm({ ...form, gst: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 block mb-1 font-medium">Lead Source</label>
                  <select value={form.leadSource} onChange={(e) => setForm({ ...form, leadSource: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white focus:outline-none focus:border-accent">
                    <option value="">Select source</option>
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Instagram">Instagram</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Google">Google</option>
                    <option value="Upwork">Upwork</option>
                    <option value="Fiverr">Fiverr</option>
                    <option value="Email Campaign">Email Campaign</option>
                    <option value="Event">Event / Conference</option>
                    <option value="Cold Outreach">Cold Outreach</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-white/60 block mb-1 font-medium">Industry</label>
                  <input type="text" placeholder="e.g. E-commerce, Healthcare" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent" />
                </div>
              </div>
              <div>
                <label className="text-white/60 block mb-1 font-medium">Tags (comma-separated)</label>
                <input type="text" placeholder="e.g. premium, urgent, retainer" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 block mb-1 font-medium">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })} className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white focus:outline-none focus:border-accent">
                    <option value="Active">Active</option>
                    <option value="Onboarding">Onboarding</option>
                    <option value="Completed">Completed</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="text-white/60 block mb-1 font-medium">Current Revenue (₹)</label>
                  <input type="number" placeholder="50000" value={form.revenue} onChange={(e) => setForm({ ...form, revenue: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent" />
                </div>
              </div>
              <div>
                <label className="text-white/60 block mb-1 font-medium">Notes</label>
                <textarea rows={3} placeholder="Key details, preferences, project scope..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent" />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => { setShowAddModal(false); setEditingClient(null) }} className="px-4 py-2 rounded-xl bg-white/5 text-white/70 hover:text-white cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-accent text-black font-semibold shadow cursor-pointer">Save Client</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client Profile Drawer */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass rounded-[28px] border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-black/50 backdrop-blur-md z-10 p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white font-heading">{selectedClient.companyName}</h3>
                  <p className="text-xs text-accent">{selectedClient.contactPerson} · {selectedClient.email}</p>
                </div>
                <button onClick={() => setSelectedClient(null)} className="text-white/40 hover:text-white cursor-pointer"><X className="h-5 w-5" /></button>
              </div>
              <div className="flex gap-2 mt-4 border-b border-white/5 pb-0">
                {(['overview', 'timeline', 'meetings', 'files', 'payments'] as ProfileTab[]).map(tab => (
                  <button key={tab} onClick={() => setProfileTab(tab)} className={`px-3 py-2 text-xs font-medium capitalize rounded-t-lg transition-colors cursor-pointer ${profileTab === tab ? 'text-accent border-b-2 border-accent' : 'text-white/50 hover:text-white'}`}>{tab}</button>
                ))}
              </div>
            </div>

            <div className="p-6 space-y-4">
              {profileTab === 'overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <InfoBox label="Phone" value={selectedClient.phone} />
                    <InfoBox label="WhatsApp" value={selectedClient.metadata?.whatsapp || '—'} />
                    <InfoBox label="Address" value={selectedClient.metadata?.address || '—'} />
                    <InfoBox label="GST" value={selectedClient.metadata?.gst || '—'} />
                    <InfoBox label="Lead Source" value={selectedClient.metadata?.leadSource || '—'} />
                    <InfoBox label="Industry" value={selectedClient.metadata?.industry || '—'} />
                    <InfoBox label="Status" value={selectedClient.status} />
                    <InfoBox label="Revenue" value={`₹${(selectedClient.totalRevenue || 0).toLocaleString()}`} />
                    <InfoBox label="Website" value={selectedClient.website} />
                    <InfoBox label="Created" value={formatIST(selectedClient.createdAt)} />
                  </div>
                  {(selectedClient.metadata?.tags || []).length > 0 && (
                    <div>
                      <h4 className="text-xs text-white/40 mb-2 uppercase tracking-wider font-medium">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedClient.metadata!.tags!.map(t => <span key={t} className="px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-mono">{t}</span>)}
                      </div>
                    </div>
                  )}
                  {(selectedClient.metadata?.socialLinks || []).length > 0 && (
                    <div>
                      <h4 className="text-xs text-white/40 mb-2 uppercase tracking-wider font-medium">Social Links</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedClient.metadata!.socialLinks!.map((s, i) => (
                          <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-[10px] hover:text-accent"><Globe className="h-3 w-3" /> {s.platform}</a>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs text-white/40 mb-2 uppercase tracking-wider font-medium">Notes</h4>
                    <p className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white/80 leading-relaxed">{selectedClient.notes || 'No notes.'}</p>
                  </div>
                </div>
              )}

              {profileTab === 'timeline' && (
                <div className="space-y-2">
                  {(selectedClient.timeline || []).length > 0 ? (
                    (selectedClient.timeline || []).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs p-3 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-white/90">{item.event}</span>
                        <span className="text-[10px] font-mono text-accent">{item.date}</span>
                      </div>
                    ))
                  ) : <p className="text-xs text-white/40 text-center py-4">No timeline events recorded.</p>}
                </div>
              )}

              {profileTab === 'meetings' && (
                <div className="space-y-2">
                  {(selectedClient.metadata?.meetingHistory || []).length > 0 ? (
                    (selectedClient.metadata!.meetingHistory || []).map((m, i) => (
                      <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs space-y-1">
                        <div className="flex items-center justify-between"><span className="text-white font-medium">{m.title}</span><span className="text-accent font-mono">{m.date}</span></div>
                        <p className="text-white/50">{m.notes}</p>
                      </div>
                    ))
                  ) : <p className="text-xs text-white/40 text-center py-4">No meetings recorded.</p>}
                </div>
              )}

              {profileTab === 'files' && (
                <div className="space-y-2">
                  {(selectedClient.metadata?.files || []).length > 0 ? (
                    (selectedClient.metadata!.files || []).map((f, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-xs">
                        <div className="flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-accent" /><span className="text-white">{f.name}</span><span className="text-white/40 text-[10px]">({f.type})</span></div>
                        <div className="flex items-center gap-2"><span className="text-white/40 font-mono">{f.uploadedAt}</span><a href={f.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline"><ExternalLink className="h-3 w-3" /></a></div>
                      </div>
                    ))
                  ) : <p className="text-xs text-white/40 text-center py-4">No files attached.</p>}
                </div>
              )}

              {profileTab === 'payments' && (
                <div className="space-y-2">
                  {(selectedClient.metadata?.paymentHistory || []).length > 0 ? (
                    (selectedClient.metadata!.paymentHistory || []).map((p, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-xs">
                        <div><span className="text-emerald-400 font-bold">₹{p.amount.toLocaleString()}</span><span className="text-white/50 ml-2">via {p.method}</span></div>
                        <div className="flex items-center gap-2"><span className="text-white/40 font-mono">{p.date}</span><span className="text-white/40">#{p.invoiceId}</span></div>
                      </div>
                    ))
                  ) : <p className="text-xs text-white/40 text-center py-4">No payment history recorded.</p>}
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-black/50 backdrop-blur-md p-4 border-t border-white/10 flex justify-end">
              <button onClick={() => setSelectedClient(null)} className="px-5 py-2 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 cursor-pointer text-xs">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
      <span className="text-white/40 text-[10px] block mb-0.5">{label}</span>
      <span className="text-white text-xs font-mono">{value}</span>
    </div>
  )
}