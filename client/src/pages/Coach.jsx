import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { aiAPI } from '../services/api'; // Make sure this path is correct

export default function Coach() {
  const [messages, setMessages] = useState([
    { id: 1, content: "Hi! I'm MindGuard AI. How is your exam preparation going today?", role: 'model' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    const newMsg = { id: Date.now(), content: userMessage, role: 'user' };
    
    // Add user message to UI immediately
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Format history exactly how your AiController.js expects it
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      
      // 🚀 Call real backend Gemini AI
      const res = await aiAPI.chat({ message: userMessage, history: history });
      
      const aiReply = { id: Date.now() + 1, content: res.data.reply, role: 'model' };
      setMessages(prev => [...prev, aiReply]);
      
    } catch (error) {
      console.error("AI Chat Error:", error);
      toast.error('Failed to get AI response');
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        content: "I'm having trouble connecting right now. Please take a deep breath and try again! 💙", 
        role: 'model' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-8rem)] flex flex-col bg-[#1e293b] border border-[#334155] rounded-2xl overflow-hidden mt-4 shadow-xl">
      
      {/* Header */}
      <div className="p-4 border-b border-[#334155] bg-[#0f172a] flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#6366f1]/20 flex items-center justify-center text-[#6366f1]">
          <Bot size={24} />
        </div>
        <div>
          <h2 className="font-bold text-slate-100">MindGuard AI Coach</h2>
          <p className="text-xs text-emerald-400">● Gemini Powered</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0f172a]">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-[#a78bfa] text-white' : 'bg-[#334155] text-[#94a3b8]'}`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-[#6366f1] text-white rounded-tr-none' : 'bg-[#1e293b] border border-[#334155] text-slate-200 rounded-tl-none whitespace-pre-wrap'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 max-w-[80%]">
            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-[#334155] text-[#94a3b8]">
              <Bot size={16} />
            </div>
            <div className="p-4 rounded-2xl text-sm bg-[#1e293b] border border-[#334155] text-slate-200 rounded-tl-none flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-[#6366f1]" /> Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-4 border-t border-[#334155] bg-[#1e293b] flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message MindGuard AI..." 
          className="flex-1 bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-3 text-slate-100 placeholder-[#94a3b8] focus:outline-none focus:border-[#6366f1]"
          disabled={isLoading}
        />
        <button type="submit" disabled={!input.trim() || isLoading} className="bg-[#6366f1] disabled:bg-[#334155] disabled:text-[#94a3b8] text-white p-3 rounded-xl transition-colors">
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}