import { useState, useRef, useEffect } from 'react'
import { MessageSquare, Send, Sparkles, Loader2, Bot, User } from 'lucide-react'
import api from '../../services/api'
import Card from '../ui/Card'

export default function AIChat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Halo! Saya HydroBot 🤖. Ada yang ingin kamu tanyakan seputar hidrasi atau air minum hari ini?' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const history = messages.filter(m => m.role !== 'system')
      const response = await api.post('/api/chat/', {
        message: userMessage.content,
        history: history.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', content: m.content }))
      })
      
      setMessages(prev => [...prev, { role: 'assistant', content: response.reply }])
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Maaf, HydroBot sedang mengalami gangguan koneksi. Coba lagi nanti ya! 💧' }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="flex flex-col h-[500px] animate-fade-in border-sky-200/60 p-0 overflow-hidden relative">
      <div className="p-4 border-b border-sky-100/60 bg-gradient-to-r from-sky-50 to-blue-50/50 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center border border-sky-200">
          <Bot className="w-5 h-5 text-sky-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-800 flex items-center gap-1.5">
            HydroBot <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </h3>
          <p className="text-xs text-sky-600 font-medium">Asisten AI Cerdas</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/40">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-100' : 'bg-sky-100'}`}>
              {msg.role === 'user' ? <User className="w-4 h-4 text-blue-600" /> : <Bot className="w-4 h-4 text-sky-600" />}
            </div>
            <div className={`p-3 rounded-2xl text-sm leading-relaxed
              ${msg.role === 'user' 
                ? 'bg-blue-500 text-white rounded-tr-sm shadow-sm' 
                : 'bg-white border border-sky-100 shadow-sm rounded-tl-sm text-gray-700'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 max-w-[85%]">
            <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-sky-600" />
            </div>
            <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-sm rounded-tl-sm text-gray-700 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-sky-500" />
              <span className="text-xs text-gray-500">HydroBot sedang mengetik...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-sky-100/60 bg-white">
        <div className="relative flex items-center">
          <input
            type="text"
            className="w-full pl-4 pr-12 py-3 rounded-xl border border-sky-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all outline-none text-sm text-gray-700"
            placeholder="Tanya soal hidrasi..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSend(); } }}
            disabled={isLoading}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 rounded-lg bg-sky-500 text-white hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:hover:bg-sky-500"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  )
}
