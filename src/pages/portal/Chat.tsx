import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Paperclip, Smile, Image as ImageIcon } from 'lucide-react'
import { cn } from '../../lib/cn'

interface Message {
  id: number
  text: string
  sender: 'client' | 'arom'
  time: string
  date: string
}

const initialMessages: Message[] = [
  { id: 1, text: 'Welcome to your project chat! Use this space to communicate with the AROM Studio team.', sender: 'arom', time: '10:00 AM', date: 'Today' },
  { id: 2, text: 'Hi! Looking forward to working on this project.', sender: 'client', time: '10:05 AM', date: 'Today' },
]

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return
    const now = new Date()
    const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    const date = 'Today'
    setMessages((prev) => [...prev, { id: Date.now(), text: input, sender: 'client', time, date }])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        text: 'Thanks for your message! We\'ll get back to you shortly.',
        sender: 'arom',
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        date: 'Today',
      }])
    }, 2000)
  }

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-10rem)] flex flex-col">
      <div className="mb-6">
        <h1 className="font-heading text-3xl md:text-4xl text-white tracking-[-1px]">Chat</h1>
        <p className="text-sm text-white/50 font-body font-light mt-1">Messages with the AROM Studio team.</p>
      </div>

      <div className="flex-1 glass rounded-[24px] overflow-hidden flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ scrollbarWidth: 'thin' }}>
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={cn('flex', msg.sender === 'client' ? 'justify-end' : 'justify-start')}
            >
              <div className={cn(
                'max-w-[80%] rounded-[18px] px-4 py-3',
                msg.sender === 'client'
                  ? 'bg-accent/30 text-white rounded-br-[4px]'
                  : 'glass text-white/90 rounded-bl-[4px]',
              )}>
                <p className="text-sm font-body font-light">{msg.text}</p>
                <p className="text-[10px] text-white/40 font-body mt-1.5">{msg.time}</p>
              </div>
            </motion.div>
          ))}
          {typing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="glass rounded-[18px] rounded-bl-[4px] px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <button className="p-2 text-white/30 hover:text-white/60 transition-colors">
              <Paperclip className="h-5 w-5" />
            </button>
            <button className="p-2 text-white/30 hover:text-white/60 transition-colors">
              <ImageIcon className="h-5 w-5" />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Type a message..."
              className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/40 font-body"
            />
            <button className="p-2 text-white/30 hover:text-white/60 transition-colors">
              <Smile className="h-5 w-5" />
            </button>
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="p-2.5 bg-accent/20 text-accent rounded-full hover:bg-accent/30 transition-colors disabled:opacity-30"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
