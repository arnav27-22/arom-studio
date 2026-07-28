import { useState, useEffect } from 'react'
import { StatCard } from '../components/StatCard'
import { BarChart3, TrendingUp, Globe, MessageSquare, Brain, Package, Wallet, Clock, Hash } from 'lucide-react'
import { getAiConversationStats, loadAiConversationsFromServer, type AiConversation } from '../../lib/aiStore'

export function AIAnalytics() {
  const [conversations, setConversations] = useState<AiConversation[]>([])

  useEffect(() => {
    loadAiConversationsFromServer().then((convs) => setConversations(convs))
  }, [])

  const stats = getAiConversationStats()

  const totalWithProject = conversations.filter(c => c.context?.projectType).length
  const totalWithPackage = conversations.filter(c => c.context?.preferredPackage).length
  const totalWithBudget = conversations.filter(c => c.context?.budget).length
  const totalWithTimeline = conversations.filter(c => c.context?.timeline).length

  const languageCount = { en: 0, mr: 0, hi: 0 }
  conversations.forEach(c => {
    const lang = c.context?.language || 'en'
    if (lang === 'en') languageCount.en++
    else if (lang === 'mr') languageCount.mr++
    else if (lang === 'hi') languageCount.hi++
  })

  const projectTypeCount: Record<string, number> = {}
  conversations.forEach(c => {
    const pt = c.context?.projectType
    if (pt) projectTypeCount[pt] = (projectTypeCount[pt] || 0) + 1
  })
  const projectTypes = Object.entries(projectTypeCount).sort((a, b) => b[1] - a[1])

  const packageCount: Record<string, number> = {}
  conversations.forEach(c => {
    const pkg = c.context?.preferredPackage
    if (pkg) packageCount[pkg] = (packageCount[pkg] || 0) + 1
  })
  const packages = Object.entries(packageCount).sort((a, b) => b[1] - a[1])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-accent" /> AROM AI Deep Analytics
        </h2>
        <p className="text-xs text-white/50">Comprehensive insights into AI assistant usage, user behavior, and conversation patterns</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Conversations" value={stats.totalConversations} icon={<MessageSquare className="h-4 w-4 text-accent" />} />
        <StatCard label="Total Messages" value={stats.totalMessages} icon={<Brain className="h-4 w-4 text-accent" />} />
        <StatCard label="Avg Msgs / Chat" value={stats.averageMessagesPerChat} icon={<Hash className="h-4 w-4 text-accent" />} />
        <StatCard label="Avg Response Time" value={stats.averageResponseTime} icon={<Clock className="h-4 w-4 text-emerald-400" />} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Projects Identified" value={totalWithProject} icon={<Globe className="h-4 w-4 text-accent" />} />
        <StatCard label="Package Preferences" value={totalWithPackage} icon={<Package className="h-4 w-4 text-accent" />} />
        <StatCard label="Budgets Shared" value={totalWithBudget} icon={<Wallet className="h-4 w-4 text-emerald-400" />} />
        <StatCard label="Timelines Shared" value={totalWithTimeline} icon={<TrendingUp className="h-4 w-4 text-accent" />} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass rounded-[24px] p-6 border border-white/10">
          <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-4">Language Distribution</h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-white/80">English</span>
                <span className="text-white/60">{languageCount.en}</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2">
                <div className="bg-accent h-2 rounded-full" style={{ width: `${conversations.length ? (languageCount.en / conversations.length) * 100 : 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-white/80">Marathi</span>
                <span className="text-white/60">{languageCount.mr}</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2">
                <div className="bg-purple-400 h-2 rounded-full" style={{ width: `${conversations.length ? (languageCount.mr / conversations.length) * 100 : 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-white/80">Hindi</span>
                <span className="text-white/60">{languageCount.hi}</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2">
                <div className="bg-amber-400 h-2 rounded-full" style={{ width: `${conversations.length ? (languageCount.hi / conversations.length) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="glass rounded-[24px] p-6 border border-white/10">
          <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-4">Project Types</h3>
          {projectTypes.length > 0 ? (
            <div className="space-y-2">
              {projectTypes.map(([type, count], i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                  <span className="text-xs text-white/80 capitalize">{type}</span>
                  <span className="text-[10px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded-full">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-white/40 py-4">No project types identified yet.</p>
          )}
        </div>

        <div className="glass rounded-[24px] p-6 border border-white/10">
          <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-4">Package Preferences</h3>
          {packages.length > 0 ? (
            <div className="space-y-2">
              {packages.map(([pkg, count], i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                  <span className="text-xs text-white/80">{pkg}</span>
                  <span className="text-[10px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded-full">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-white/40 py-4">No package preferences recorded yet.</p>
          )}
        </div>
      </div>

      <div className="glass rounded-[24px] p-6 border border-white/10">
        <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-4">Top Questions (All Time)</h3>
        {stats.topQuestions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {stats.topQuestions.slice(0, 12).map(([q, count], i) => (
              <div key={i} className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-xs text-white/80 truncate max-w-[80%]">{q}</span>
                <span className="text-[10px] font-mono text-accent ml-2 shrink-0">{count}x</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-white/40 py-4">No questions recorded yet.</p>
        )}
      </div>

      <div className="glass rounded-[24px] p-6 border border-white/10">
        <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-4">Key Metrics Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
            <p className="text-2xl font-bold text-accent">{stats.returningUsers}</p>
            <p className="text-[10px] text-white/40 mt-1">Returning Users</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
            <p className="text-2xl font-bold text-white">{stats.memoryEnabled}</p>
            <p className="text-[10px] text-white/40 mt-1">Users with Memory</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
            <p className="text-2xl font-bold text-white">{stats.dailyConversations}</p>
            <p className="text-[10px] text-white/40 mt-1">Today's Chats</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
            <p className="text-2xl font-bold text-white">{stats.weeklyConversations}</p>
            <p className="text-[10px] text-white/40 mt-1">This Week</p>
          </div>
        </div>
      </div>
    </div>
  )
}
