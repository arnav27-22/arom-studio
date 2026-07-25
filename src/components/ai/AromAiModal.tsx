import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Send, X, Plus, Trash2, Edit2, History, Maximize2, Minimize2, Sparkles, User, Check, Search } from 'lucide-react'
import {
  getAiConversations,
  saveAiConversation,
  deleteAiConversation,
  renameAiConversation,
  getVisitorId,
  detectDeviceAndBrowser,
  getAiKnowledge,
  type AiConversation,
  type AiMessage,
} from '../../lib/aiStore'
import { generateAiResponse } from '../../lib/aiEngine'

const SUGGESTED_QUESTIONS = [
  'How much does a website cost?',
  'What services do you offer?',
  'How long does development take?',
  'How does your process work?',
  'Can I track my project?',
  'Do you build ecommerce websites?',
  'What technologies do you use?',
  'Do you provide SEO?',
  'Do you provide maintenance?',
]

interface AromAiModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AromAiModal({ isOpen, onClose }: AromAiModalProps) {
  const [conversations, setConversations] = useState<AiConversation[]>([])
  const [currentConvId, setCurrentConvId] = useState<string>('')
  const [messages, setMessages] = useState<AiMessage[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchHistory, setSearchHistory] = useState('')
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null)
  const [tempTitle, setTempTitle] = useState('')

  const chatEndRef = useRef<HTMLDivElement>(null)

  const reloadConversations = () => {
    const list = getAiConversations()
    setConversations(list)
    return list
  }

  // Initialize or load conversation
  useEffect(() => {
    if (isOpen) {
      const list = reloadConversations()
      if (list.length > 0 && !currentConvId) {
        setCurrentConvId(list[0].id)
        setMessages(list[0].messages)
      } else if (list.length === 0) {
        handleNewChat()
      }
    }
  }, [isOpen])

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleNewChat = () => {
    const { device, browser } = detectDeviceAndBrowser()
    const visitorId = getVisitorId()
    const now = new Date().toISOString()

    const newConv: AiConversation = {
      id: 'conv_' + Math.random().toString(36).slice(2, 9),
      visitorId,
      title: 'New AROM AI Chat',
      messages: [],
      createdAt: now,
      lastActiveAt: now,
      device,
      browser,
      status: 'Active',
    }

    saveAiConversation(newConv)
    setCurrentConvId(newConv.id)
    setMessages([])
    reloadConversations()
    setShowHistory(false)
  }

  const handleSelectConversation = (conv: AiConversation) => {
    setCurrentConvId(conv.id)
    setMessages(conv.messages)
    setShowHistory(false)
  }

  const handleDeleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteAiConversation(id)
    const remaining = reloadConversations()
    if (remaining.length > 0) {
      setCurrentConvId(remaining[0].id)
      setMessages(remaining[0].messages)
    } else {
      handleNewChat()
    }
  }

  const handleStartRename = (conv: AiConversation, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingTitleId(conv.id)
    setTempTitle(conv.title)
  }

  const handleSaveRename = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (tempTitle.trim()) {
      renameAiConversation(id, tempTitle.trim())
      reloadConversations()
    }
    setEditingTitleId(null)
  }

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim()
    if (!text) return

    const now = new Date().toISOString()
    const userMsg: AiMessage = {
      id: 'm_' + Math.random().toString(36).slice(2, 9),
      sender: 'user',
      text,
      timestamp: now,
    }

    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setIsTyping(true)

    // Save active chat state
    let conv = conversations.find((c) => c.id === currentConvId)
    if (!conv) {
      const { device, browser } = detectDeviceAndBrowser()
      conv = {
        id: currentConvId || 'conv_' + Math.random().toString(36).slice(2, 9),
        visitorId: getVisitorId(),
        title: text.slice(0, 30) + '...',
        messages: updatedMessages,
        createdAt: now,
        lastActiveAt: now,
        device,
        browser,
        status: 'Active',
      }
    } else {
      if (conv.messages.length === 0) {
        conv.title = text.slice(0, 32) + (text.length > 32 ? '...' : '')
      }
      conv.messages = updatedMessages
      conv.lastActiveAt = now
    }

    saveAiConversation(conv)
    reloadConversations()

    // Simulate AI response delay
    setTimeout(() => {
      const knowledge = getAiKnowledge()
      const aiReplyText = generateAiResponse(text, knowledge)

      const aiMsg: AiMessage = {
        id: 'm_' + Math.random().toString(36).slice(2, 9),
        sender: 'ai',
        text: aiReplyText,
        timestamp: new Date().toISOString(),
      }

      const finalMessages = [...updatedMessages, aiMsg]
      setMessages(finalMessages)
      setIsTyping(false)

      if (conv) {
        conv.messages = finalMessages
        conv.lastActiveAt = new Date().toISOString()
        saveAiConversation(conv)
        reloadConversations()
      }
    }, 600)
  }

  // Format Simple Markdown Text into JSX
  const renderFormattedMarkdown = (content: string) => {
    const lines = content.split('\n')
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="font-heading font-bold text-accent text-sm mt-2 mb-1">{line.replace('### ', '')}</h3>
      }
      if (line.startsWith('- ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-white/90 text-xs my-0.5">
            {renderBoldText(line.replace('- ', ''))}
          </li>
        )
      }
      if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ') || line.startsWith('5. ')) {
        return (
          <li key={idx} className="ml-4 list-decimal text-white/90 text-xs my-0.5">
            {renderBoldText(line.replace(/^\d+\.\s+/, ''))}
          </li>
        )
      }
      if (!line.trim()) return <div key={idx} className="h-1.5" />

      return (
        <p key={idx} className="text-xs text-white/90 leading-relaxed my-1">
          {renderBoldText(line)}
        </p>
      )
    })
  }

  const renderBoldText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g)
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-semibold text-white">{part.slice(2, -2)}</strong>
      }
      return part
    })
  }

  const filteredHistory = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchHistory.toLowerCase()) ||
    c.messages.some((m) => m.text.toLowerCase().includes(searchHistory.toLowerCase()))
  )

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end p-2 sm:p-6 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={`pointer-events-auto glass rounded-[28px] border border-accent/30 shadow-[0_0_50px_rgba(78,133,191,0.25)] bg-bg/95 backdrop-blur-2xl flex flex-col overflow-hidden transition-all duration-300 ${
            isExpanded
              ? 'w-full max-w-4xl h-[90vh]'
              : 'w-full max-w-lg md:max-w-xl h-[660px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.03] shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-accent/40 via-blue-500/20 to-accent/80 p-[1.5px] flex items-center justify-center shadow-lg shadow-accent/20">
                  <div className="w-full h-full rounded-[14px] bg-bg flex items-center justify-center">
                    <Bot className="h-5 w-5 text-accent animate-pulse" />
                  </div>
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-bg rounded-full shadow-[0_0_8px_#34d399]" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading font-bold text-white text-sm tracking-wide">AROM AI</h2>
                  <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.2 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Online
                  </span>
                </div>
                <p className="text-[11px] text-white/50 font-body">Your AI Website Consultant</p>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`p-2 rounded-xl transition-all ${
                  showHistory
                    ? 'bg-accent/20 text-accent border border-accent/30'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
                title="Chat History"
              >
                <History className="h-4 w-4" />
              </button>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all hidden sm:block"
                title={isExpanded ? 'Minimize Window' : 'Expand Window'}
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>

              <button
                onClick={onClose}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
                title="Close AROM AI"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Main Body */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* History Drawer */}
            {showHistory && (
              <motion.div
                initial={{ x: -250, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -250, opacity: 0 }}
                className="w-full sm:w-64 border-r border-white/10 bg-bg/98 flex flex-col p-3 z-20 shrink-0 absolute sm:relative inset-0 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-accent uppercase tracking-wider">Chat History</span>
                  <button
                    onClick={handleNewChat}
                    className="p-1.5 rounded-lg bg-accent text-black font-semibold text-[11px] hover:bg-accent/90 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> New Chat
                  </button>
                </div>

                <div className="relative mb-3">
                  <Search className="h-3.5 w-3.5 text-white/40 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={searchHistory}
                    onChange={(e) => setSearchHistory(e.target.value)}
                    placeholder="Search history..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-accent/40"
                  />
                </div>

                <div className="flex-1 overflow-y-auto space-y-1 pr-1">
                  {filteredHistory.map((c) => {
                    const isActive = c.id === currentConvId
                    return (
                      <div
                        key={c.id}
                        onClick={() => handleSelectConversation(c)}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between group ${
                          isActive
                            ? 'bg-accent/15 border-accent/30 text-white font-medium'
                            : 'bg-white/5 border-transparent text-white/70 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <div className="flex-1 truncate mr-2">
                          {editingTitleId === c.id ? (
                            <input
                              type="text"
                              value={tempTitle}
                              onChange={(e) => setTempTitle(e.target.value)}
                              className="bg-black/50 text-white px-1.5 py-0.5 rounded border border-accent text-xs w-full"
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <p className="truncate">{c.title}</p>
                          )}
                          <p className="text-[9px] text-white/40 font-mono mt-0.5">
                            {new Date(c.lastActiveAt).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {editingTitleId === c.id ? (
                            <button onClick={(e) => handleSaveRename(c.id, e)} className="text-emerald-400 hover:text-emerald-300">
                              <Check className="h-3.5 w-3.5" />
                            </button>
                          ) : (
                            <button onClick={(e) => handleStartRename(c, e)} className="text-white/40 hover:text-white">
                              <Edit2 className="h-3 w-3" />
                            </button>
                          )}
                          <button onClick={(e) => handleDeleteChat(c.id, e)} className="text-red-400/60 hover:text-red-400">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* Chat Area */}
            <div className="flex-1 flex flex-col overflow-hidden p-4 space-y-4">
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {/* Welcome Card */}
                {messages.length === 0 && (
                  <div className="glass rounded-[24px] p-5 border border-accent/20 bg-accent/5 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-accent/20 border border-accent/40 flex items-center justify-center shrink-0">
                        <Sparkles className="h-5 w-5 text-accent animate-pulse" />
                      </div>
                      <div>
                        <h3 className="font-heading text-sm text-white font-bold">Hello 👋 I'm AROM AI</h3>
                        <p className="text-xs text-white/70 leading-relaxed mt-1">
                          I'm your official AI consultant for AROM STUDIO. I can help you understand our services, pricing, website development process, technologies, timeline, proposal process, client portal, admin panel, SEO, maintenance, support, and much more.
                        </p>
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-accent uppercase tracking-wider block mb-2">Suggested Questions</span>
                      <div className="flex flex-wrap gap-2">
                        {SUGGESTED_QUESTIONS.map((q, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(q)}
                            className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-accent/20 border border-white/10 hover:border-accent/40 text-xs text-white/80 hover:text-white transition-all text-left cursor-pointer"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Messages Stream */}
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.sender === 'ai' && (
                      <div className="w-8 h-8 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0 mt-1">
                        <Bot className="h-4 w-4 text-accent" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-[20px] p-3.5 shadow-md ${
                        msg.sender === 'user'
                          ? 'bg-accent/20 border border-accent/30 text-white rounded-br-none'
                          : 'glass border border-white/10 text-white/90 rounded-bl-none'
                      }`}
                    >
                      {msg.sender === 'user' ? (
                        <p className="text-xs text-white leading-relaxed">{msg.text}</p>
                      ) : (
                        <div>{renderFormattedMarkdown(msg.text)}</div>
                      )}
                      <span className="text-[9px] text-white/30 font-mono block text-right mt-1.5">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {msg.sender === 'user' && (
                      <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 mt-1">
                        <User className="h-4 w-4 text-white/80" />
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-accent animate-pulse" />
                    </div>
                    <div className="glass rounded-[18px] px-4 py-3 border border-white/10 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
                      <span className="w-2 h-2 rounded-full bg-accent/80 animate-ping delay-100" />
                      <span className="w-2 h-2 rounded-full bg-accent/60 animate-ping delay-200" />
                      <span className="text-xs text-white/50 font-mono ml-2">AROM AI is thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="pt-2 border-t border-white/10 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSendMessage()
                  }}
                  className="flex items-center gap-2 bg-white/5 border border-white/15 rounded-2xl p-2 focus-within:border-accent/50 transition-all shadow-lg"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask AROM AI anything about AROM STUDIO..."
                    className="flex-1 bg-transparent px-3 text-xs text-white placeholder:text-white/30 focus:outline-none font-body"
                  />

                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="p-2.5 rounded-xl bg-accent text-black font-semibold hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
