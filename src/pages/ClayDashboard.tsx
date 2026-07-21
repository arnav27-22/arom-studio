import { useState } from 'react'

// ─── Claymorphism dark theme tokens ───────────────────────────────────────
const c = {
  ground: '#1a1f18',
  surface: '#252b22',
  surfaceLight: '#2d3429',
  ink: '#e8ede3',
  muted: '#8a9482',
  teal: '#1a9e8a',
  tealDim: 'rgba(26,158,138,0.15)',
  rust: '#c4643f',
  brass: '#cf9b34',
  navy: '#2a3a5c',
  green: '#3f8f4a',
  shadowDark: 'rgba(0,0,0,0.6)',
  shadowLight: 'rgba(255,255,255,0.06)',
}


// ─── SVG chart paths ──────────────────────────────────────────────────────
const chartPath = 'M0,120 C40,100 80,140 120,90 C160,40 200,70 240,50 C280,30 320,60 360,40 C400,20 440,45 480,35'
const areaPath = chartPath + ' L480,150 L0,150 Z'

const donutSegments = [
  { pct: 42, color: c.teal, label: 'Organic' },
  { pct: 27, color: c.rust, label: 'Direct' },
  { pct: 19, color: c.brass, label: 'Referral' },
  { pct: 12, color: c.navy, label: 'Social' },
]

const campaigns = [
  { name: 'Q4 Holiday Push', channel: 'Search', status: 'Active', spend: '$12,400', conversions: '842', roas: '4.2x', roasPct: 84 },
  { name: 'Retargeting V2', channel: 'Display', status: 'Paused', spend: '$6,200', conversions: '318', roas: '2.8x', roasPct: 56 },
  { name: 'Black Friday Email', channel: 'Email', status: 'Completed', spend: '$3,800', conversions: '524', roas: '6.1x', roasPct: 100 },
  { name: 'IG Story Promo', channel: 'Social', status: 'Active', spend: '$2,100', conversions: '156', roas: '3.5x', roasPct: 70 },
]

const channelColors: Record<string, string> = { Search: c.teal, Display: c.navy, Email: c.rust, Social: c.brass }
const statusDots: Record<string, string> = { Active: '●', Paused: '◐', Completed: '✓' }

export default function ClayDashboard() {
  const [activeNav, setActiveNav] = useState('Dashboard')
  const [dateRange, setDateRange] = useState('30D')

  const navGroups = [
    { label: 'OVERVIEW', items: ['Dashboard', 'Reports', 'Audience', 'Campaigns', 'Revenue'] },
    { label: 'WORKSPACE', items: ['Data Library', 'Integrations', 'Automations', 'Settings'] },
  ]

  const kpis = [
    { label: 'Total Revenue', value: '$84,320', delta: '+12.4%', up: true, icon: '$' },
    { label: 'Active Users', value: '12,847', delta: '+8.1%', up: true, icon: 'U' },
    { label: 'Conversion Rate', value: '3.92%', delta: '+5.3%', up: true, icon: '%' },
    { label: 'Avg. Session', value: '4m 38s', delta: '-1.6%', up: false, icon: 'T' },
  ]

  const NavItem = ({ label }: { label: string }) => {
    const isActive = label === activeNav
    return (
      <button
        onClick={() => setActiveNav(label)}
        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all ${
          isActive
            ? `bg-[${c.surface}] text-[${c.teal}] shadow-[inset_3px_4px_8px_rgba(0,0,0,0.5),inset_-2px_-3px_7px_rgba(255,255,255,0.05)]`
            : `text-[${c.muted}] hover:text-[${c.ink}]`
        }`}
        style={{
          backgroundColor: isActive ? c.surface : 'transparent',
          color: isActive ? c.teal : c.muted,
          boxShadow: isActive ? 'inset 3px 4px 8px rgba(0,0,0,0.5), inset -2px -3px 7px rgba(255,255,255,0.05)' : 'none',
        }}
      >
        {label}
      </button>
    )
  }

  return (
    <div
      className="min-h-screen flex font-[Figtree]"
      style={{ backgroundColor: c.ground, color: c.ink }}
    >
      {/* ─── SIDEBAR ─────────────────────────────────────────────────── */}
      <aside
        className="w-[260px] shrink-0 m-4 rounded-3xl p-5 flex flex-col"
        style={{
          backgroundColor: c.surface,
          boxShadow: `12px 14px 30px ${c.shadowDark}, -8px -10px 22px ${c.shadowLight}`,
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
            style={{
              backgroundColor: c.teal,
              boxShadow: `6px 7px 16px ${c.shadowDark}, -4px -5px 12px ${c.shadowLight}`,
            }}
          >
            A
          </div>
          <span className="font-['Baloo_2'] text-lg font-bold" style={{ color: c.ink }}>AROM</span>
        </div>

        {/* Nav */}
        {navGroups.map((group) => (
          <div key={group.label} className="mb-6">
            <p className="text-[10px] tracking-[0.15em] mb-3 px-4" style={{ color: c.muted }}>{group.label}</p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavItem key={item} label={item} />
              ))}
            </div>
          </div>
        ))}

        {/* Data credits */}
        <div className="mt-auto mb-4 px-4">
          <div className="flex justify-between text-xs mb-2" style={{ color: c.muted }}>
            <span>Data credits</span>
            <span>68%</span>
          </div>
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{
              backgroundColor: c.ground,
              boxShadow: 'inset 3px 3px 6px rgba(0,0,0,0.5), inset -2px -2px 5px rgba(255,255,255,0.05)',
            }}
          >
            <div className="h-full rounded-full transition-all" style={{ width: '68%', backgroundColor: c.teal }} />
          </div>
        </div>

        {/* Account */}
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{
            backgroundColor: c.surfaceLight,
            boxShadow: `6px 7px 16px ${c.shadowDark}, -4px -5px 12px ${c.shadowLight}`,
          }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: c.tealDim, color: c.teal }}
          >
            AP
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: c.ink }}>Arnav Pagare</p>
            <p className="text-xs truncate" style={{ color: c.muted }}>arnav@arom.studio</p>
          </div>
          <button className="text-xs" style={{ color: c.muted }}>⋯</button>
        </div>
      </aside>

      {/* ─── MAIN ────────────────────────────────────────────────────── */}
      <main className="flex-1 p-4 pl-0 overflow-hidden">
        <div className="space-y-4">
          {/* Topbar */}
          <div
            className="rounded-3xl px-6 py-4 flex flex-wrap items-center justify-between gap-4"
            style={{
              backgroundColor: c.surface,
              boxShadow: `12px 14px 30px ${c.shadowDark}, -8px -10px 22px ${c.shadowLight}`,
            }}
          >
            <div>
              <h1 className="font-['Baloo_2'] text-2xl font-bold" style={{ color: c.ink }}>Dashboard</h1>
              <p className="text-sm" style={{ color: c.muted }}>Last 30 days — updated 4 min ago</p>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="rounded-full px-4 py-2 text-sm hidden md:block"
                style={{
                  backgroundColor: c.surface,
                  color: c.muted,
                  boxShadow: 'inset 3px 3px 8px rgba(0,0,0,0.5), inset -2px -2px 6px rgba(255,255,255,0.05)',
                }}
              >
                🔍 Search
              </div>
              <button
                className="w-10 h-10 rounded-full flex items-center justify-center relative"
                style={{
                  backgroundColor: c.surfaceLight,
                  boxShadow: `6px 7px 16px ${c.shadowDark}, -4px -5px 12px ${c.shadowLight}`,
                }}
              >
                🔔
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ backgroundColor: c.rust }} />
              </button>
              <button
                className="rounded-full px-5 py-2.5 text-sm font-medium flex items-center gap-2"
                style={{
                  backgroundColor: c.teal,
                  color: '#fff',
                  boxShadow: `6px 7px 16px ${c.shadowDark}, -4px -5px 12px ${c.shadowLight}`,
                }}
              >
                <span>+</span> New report
              </button>
            </div>
          </div>

          {/* KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi) => (
              <div
                key={kpi.label}
                className="rounded-2xl p-5"
                style={{
                  backgroundColor: c.surface,
                  boxShadow: `12px 14px 30px ${c.shadowDark}, -8px -10px 22px ${c.shadowLight}`,
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold mb-3"
                  style={{ backgroundColor: c.tealDim, color: c.teal }}
                >
                  {kpi.icon}
                </div>
                <p className="text-[10px] tracking-[0.12em] mb-1" style={{ color: c.muted }}>{kpi.label}</p>
                <p className="font-['Baloo_2'] text-2xl font-bold" style={{ color: c.ink }}>{kpi.value}</p>
                <span
                  className="inline-flex items-center gap-1 text-xs mt-1 rounded-full px-2 py-0.5"
                  style={{
                    color: kpi.up ? c.green : c.rust,
                    backgroundColor: kpi.up ? 'rgba(63,143,74,0.15)' : 'rgba(196,100,63,0.15)',
                  }}
                >
                  {kpi.up ? '▲' : '▼'} {kpi.delta}
                </span>
              </div>
            ))}
          </div>

          {/* Chart + Donut */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Revenue chart */}
            <div
              className="lg:col-span-2 rounded-2xl p-6"
              style={{
                backgroundColor: c.surface,
                boxShadow: `12px 14px 30px ${c.shadowDark}, -8px -10px 22px ${c.shadowLight}`,
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div>
                  <h3 className="font-['Baloo_2'] text-lg font-bold" style={{ color: c.ink }}>Revenue over time</h3>
                  <p className="text-xs" style={{ color: c.muted }}>Daily revenue — Sep 15 to Oct 14</p>
                </div>
                <div
                  className="flex rounded-full p-1 gap-1"
                  style={{
                    backgroundColor: c.ground,
                    boxShadow: 'inset 3px 3px 8px rgba(0,0,0,0.5), inset -2px -2px 6px rgba(255,255,255,0.05)',
                  }}
                >
                  {['12M', '30D', '7D'].map((r) => (
                    <button
                      key={r}
                      onClick={() => setDateRange(r)}
                      className="px-3 py-1 rounded-full text-xs transition-all"
                      style={{
                        backgroundColor: r === dateRange ? c.teal : 'transparent',
                        color: r === dateRange ? '#fff' : c.muted,
                        boxShadow: r === dateRange ? 'inset 2px 2px 6px rgba(0,0,0,0.3)' : 'none',
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* SVG chart */}
              <svg viewBox="0 0 480 150" className="w-full h-36" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={c.teal} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={c.teal} stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                {/* Grid lines */}
                {[0, 1, 2, 3].map((i) => (
                  <line key={i} x1="0" y1={30 + i * 30} x2="480" y2={30 + i * 30} stroke={c.muted} strokeOpacity="0.15" strokeDasharray="4 4" />
                ))}
                {/* Area */}
                <path d={areaPath} fill="url(#areaGrad)" />
                {/* Line */}
                <path d={chartPath} fill="none" stroke={c.teal} strokeWidth="2.5" strokeLinecap="round" />
                {/* Marker */}
                <circle cx="360" cy="40" r="5" fill={c.surface} stroke={c.teal} strokeWidth="2.5" />
                {/* Tooltip */}
                <rect x="332" y="10" width="56" height="24" rx="8" fill={c.surfaceLight} stroke={c.teal} strokeWidth="0.5" />
                <text x="360" y="26" textAnchor="middle" fill={c.teal} fontSize="10" fontWeight="bold">$9,820</text>
                <line x1="360" y1="34" x2="360" y2="35" stroke={c.teal} strokeWidth="1" />
                {/* Y-axis labels */}
                <text x="0" y="28" fill={c.muted} fontSize="9">$12k</text>
                <text x="0" y="58" fill={c.muted} fontSize="9">$8k</text>
                <text x="0" y="88" fill={c.muted} fontSize="9">$4k</text>
              </svg>

              {/* X-axis */}
              <div className="flex justify-between text-[9px] mt-1" style={{ color: c.muted }}>
                <span>Sep 15</span>
                <span>Sep 22</span>
                <span>Oct 1</span>
                <span>Oct 7</span>
                <span>Oct 14</span>
              </div>
            </div>

            {/* Traffic donut */}
            <div
              className="rounded-2xl p-6"
              style={{
                backgroundColor: c.surface,
                boxShadow: `12px 14px 30px ${c.shadowDark}, -8px -10px 22px ${c.shadowLight}`,
              }}
            >
              <h3 className="font-['Baloo_2'] text-lg font-bold mb-1" style={{ color: c.ink }}>Traffic Sources</h3>
              <div className="flex flex-col items-center py-4">
                {/* Donut SVG */}
                <svg viewBox="0 0 120 120" className="w-28 h-28">
                  <circle cx="60" cy="60" r="40" fill="none" stroke={c.ground} strokeWidth="16" />
                  {(() => {
                    const segments = [
                      { pct: 42, color: c.teal, offset: 0 },
                      { pct: 27, color: c.rust, offset: 42 },
                      { pct: 19, color: c.brass, offset: 69 },
                      { pct: 12, color: c.navy, offset: 88 },
                    ]
                    const r = 40, circ = 2 * Math.PI * r
                    return segments.map((s) => {
                      const dashLen = (s.pct / 100) * circ
                      const dashOff = (s.offset / 100) * circ
                      return (
                        <circle
                          key={s.color}
                          cx="60" cy="60" r={r}
                          fill="none"
                          stroke={s.color}
                          strokeWidth="16"
                          strokeDasharray={`${dashLen} ${circ - dashLen}`}
                          strokeDashoffset={-dashOff}
                          transform="rotate(-90 60 60)"
                          strokeLinecap="round"
                        />
                      )
                    })
                  })()}
                  <text x="60" y="56" textAnchor="middle" fill={c.ink} fontSize="16" fontWeight="bold" fontFamily="Baloo 2">12.8k</text>
                  <text x="60" y="70" textAnchor="middle" fill={c.muted} fontSize="7">sessions</text>
                </svg>
              </div>
              <div className="space-y-2.5">
                {donutSegments.map((seg) => (
                  <div key={seg.label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
                      <span style={{ color: c.muted }}>{seg.label}</span>
                    </div>
                    <span className="font-medium" style={{ color: c.ink }}>{seg.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Campaigns table */}
          <div
            className="rounded-2xl p-6"
            style={{
              backgroundColor: c.surface,
              boxShadow: `12px 14px 30px ${c.shadowDark}, -8px -10px 22px ${c.shadowLight}`,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-['Baloo_2'] text-lg font-bold" style={{ color: c.ink }}>
                Recent campaigns <span className="text-xs font-normal ml-1" style={{ color: c.muted }}>(4)</span>
              </h3>
              <div className="flex gap-2">
                <button className="text-xs px-3 py-1.5 rounded-full" style={{ backgroundColor: c.surfaceLight, color: c.muted }}>Export</button>
                <button className="text-xs px-3 py-1.5 rounded-full" style={{ color: c.teal }}>View all</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm">
                <thead>
                  <tr
                    className="text-left text-xs rounded-xl"
                    style={{
                      color: c.muted,
                      boxShadow: 'inset 3px 3px 8px rgba(0,0,0,0.4), inset -2px -2px 6px rgba(255,255,255,0.04)',
                    }}
                  >
                    {['Campaign', 'Channel', 'Status', 'Spend', 'Conversions', 'ROAS'].map((h) => (
                      <th key={h} className="px-4 py-3 font-medium first:rounded-l-xl last:rounded-r-xl">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((row, i) => (
                    <tr key={row.name} style={{ backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                      <td className="px-4 py-3 font-medium" style={{ color: c.ink }}>{row.name}</td>
                      <td className="px-4 py-3">
                        <span
                          className="text-[11px] px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: `${channelColors[row.channel]}20`, color: channelColors[row.channel] }}
                        >
                          {row.channel}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 text-xs" style={{ color: c.muted }}>
                          <span style={{ color: statusDots[row.status] === '●' ? c.green : statusDots[row.status] === '◐' ? c.brass : c.teal }}>
                            {statusDots[row.status]}
                          </span>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-3" style={{ color: c.ink }}>{row.spend}</td>
                      <td className="px-4 py-3" style={{ color: c.ink }}>{row.conversions}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium" style={{ color: c.ink }}>{row.roas}</span>
                          <div
                            className="w-16 h-1.5 rounded-full overflow-hidden"
                            style={{
                              backgroundColor: c.ground,
                              boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.4)',
                            }}
                          >
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${row.roasPct}%`, backgroundColor: c.teal }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ─── Document links ───────────────────────────────────────── */}
          <div
            className="rounded-2xl p-6"
            style={{
              backgroundColor: c.surface,
              boxShadow: `12px 14px 30px ${c.shadowDark}, -8px -10px 22px ${c.shadowLight}`,
            }}
          >
            <h3 className="font-['Baloo_2'] text-lg font-bold mb-4" style={{ color: c.ink }}>Documents & Forms</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs">
              {[
                '01 Client Inquiry', '02 Discovery Questionnaire', '03 Project Proposal', '04 Project Acceptance', '05 Website Agreement',
                '06 Invoice', '07 Payment Receipt', '08 Payment Request', '09 Quotation', '10 Onboarding Checklist',
                '11 Asset Checklist', '12 Content Collection', '13 Brand Information', '14 Domain & Hosting', '15 Wireframe Approval',
                '16 UI Design Approval', '17 Design Approval', '18 Color Approval', '19 Typography Approval', '20 Project Timeline',
                '21 Status Report', '22 Revision Request', '23 Change Request', '24 Bug Report', '25 Pre-Launch Checklist',
                '26 Handover Document', '27 Source Code Delivery', '28 Website Credentials', '29 User Guide', '30 Maintenance Guide',
                '31 Client Feedback', '32 Completion Report', '33 Portfolio Permission', '34 Testimonial Request', '35 Support Request',
                '36 Dev Agreement', '37 Privacy Policy', '38 Terms & Conditions', '39 NDA', '40 Maintenance Agreement',
                '41 Client Profile', '42 Project Notes', '43 Task Checklist', '44 Time Log', '45 Project Archive',
              ].map((doc) => (
                <button
                  key={doc}
                  className="text-left px-3 py-2 rounded-xl transition-all hover:scale-[1.02]"
                  style={{
                    backgroundColor: c.surfaceLight,
                    color: c.muted,
                    boxShadow: `4px 5px 12px ${c.shadowDark}, -3px -4px 10px ${c.shadowLight}`,
                  }}
                >
                  {doc}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs py-4" style={{ color: c.muted }}>
            AROM STUDIO — Claymorphism Analytics Dashboard
          </p>
        </div>
      </main>
    </div>
  )
}
