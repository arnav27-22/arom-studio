import { useState, useEffect } from 'react'
import { StatCard } from '../components/StatCard'
import { DataTable } from '../components/DataTable'
import { Bot, MessageSquare, Users, Clock, Brain, UserCheck, TrendingUp, BarChart3 } from 'lucide-react'
import { getAiConversationStats, loadAiConversationsFromServer, type AiConversation } from '../../lib/aiStore'

export function AIOverview() {
  const [, setConversations] = useState<AiConversation[]>([])
  const [recentActivity, setRecentActivity] = useState<AiConversation[]>([])

  const reload = (convs: AiConversation[]) => {
    setConversations(convs)
    setRecentActivity(convs.slice(0, 10))
  }

  useEffect(() => {
    loadAiConversationsFromServer().then(reload)
    const timer = setInterval(() => {
      loadAiConversationsFromServer().then(reload)
    }, 15000)
    return () => clearInterval(timer)
  }, [])

  const stats = getAiConversationStats()

  const activityColumns = [
    {
      key: 'title',
      label: 'Conversation',
      render: (_: string, row: AiConversation) => (
        <div>
          <p className="text-white font-medium text-xs line-clamp-1">{row.title}</p>
          <p className="text-white/40 text-[10px] font-mono mt-0.5">{row.visitorId}</p>
        </div>
      ),
    },
    {
      key: 'user',
      label: 'User',
      render: (_: any, row: AiConversation) => (
        <span className="text-xs text-white/80">{row.context?.userName || 'Anonymous'}</span>
      ),
    },
    {
      key: 'messages',
      label: 'Msgs',
      render: (_: any, row: AiConversation) => (
        <span className="text-xs font-mono text-accent">{row.messages.length}</span>
      ),
    },
    {
      key: 'lastActiveAt',
      label: 'Last Active',
      render: (v: string) => <span className="text-xs text-white/60">{new Date(v).toLocaleString()}</span>,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
          <Bot className="h-5 w-5 text-accent" /> AROM AI Management Overview
        </h2>
        <p className="text-xs text-white/50">Real-time AI assistant performance, memory usage, and conversation analytics</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total AI Chats" value={stats.totalConversations} icon={<MessageSquare className="h-4 w-4 text-accent" />} />
        <StatCard label="Today's Chats" value={stats.dailyConversations} icon={<TrendingUp className="h-4 w-4 text-emerald-400" />} trend="up" />
        <StatCard label="Avg Response Time" value={stats.averageResponseTime} icon={<Clock className="h-4 w-4 text-emerald-400" />} />
        <StatCard label="Avg Msgs / Chat" value={stats.averageMessagesPerChat} icon={<BarChart3 className="h-4 w-4 text-accent" />} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Returning Users" value={stats.returningUsers} icon={<Users className="h-4 w-4 text-accent" />} />
        <StatCard label="Users with Memory" value={stats.memoryEnabled} icon={<UserCheck className="h-4 w-4 text-accent" />} />
        <StatCard label="Total Messages" value={stats.totalMessages} icon={<Brain className="h-4 w-4 text-accent" />} />
        <StatCard label="Weekly Chats" value={stats.weeklyConversations} icon={<TrendingUp className="h-4 w-4 text-accent" />} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass rounded-[24px] p-6 border border-white/10">
          <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-4">Top Questions Asked</h3>
          {stats.topQuestions.length > 0 ? (
            <div className="space-y-2">
              {stats.topQuestions.slice(0, 8).map(([q, count], i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                  <span className="text-xs text-white/80 truncate max-w-[80%]">{q}</span>
                  <span className="text-[10px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded-full">{count}x</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-white/40 py-4">No questions recorded yet.</p>
          )}
        </div>

        <div className="glass rounded-[24px] p-6 border border-white/10">
          <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-4">Popular Topics Discussed</h3>
          {stats.popularServices.length > 0 ? (
            <div className="space-y-2">
              {stats.popularServices.slice(0, 8).map(([topic, count], i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                  <span className="text-xs text-white/80">{topic}</span>
                  <span className="text-[10px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded-full">{count} mentions</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-white/40 py-4">No topics recorded yet.</p>
          )}
        </div>
      </div>

      <div className="glass rounded-[24px] p-6 border border-white/10">
        <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-4">Recent Conversation Activity</h3>
        {recentActivity.length > 0 ? (
          <DataTable columns={activityColumns} data={recentActivity} />
        ) : (
          <div className="text-center py-8 text-white/40 text-xs font-body">
            No AI conversations recorded yet.
          </div>
        )}
      </div>
    </div>
  )
}
