import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot } from 'lucide-react';
import { Card } from './ui/Card';
import { ChatMessage } from '../types';
import { generateTradingResponse } from '../services/geminiService';

export const ChatInterface: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Greetings, trader. I am Megatron Solbot. I analyze market inefficiencies and execute logic. Ask me about the current SOL trends or the DIAMOND token metrics.',
      timestamp: Date.now()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Provide context about the current "mock" market state
      const context = "SOL Price: $145. Trend: Bullish. DIAMOND Volume: High. VPOC: 124.5.";
      const aiResponseText = await generateTradingResponse(userMsg.content, context);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Card className="h-[600px] flex flex-col" title="MEGATRON AI ORACLE">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] p-4 rounded-lg border ${
              msg.role === 'user' 
                ? 'bg-cyber-purple/10 border-cyber-purple/30 text-white rounded-br-none' 
                : 'bg-cyber-cyan/10 border-cyber-cyan/30 text-gray-200 rounded-bl-none'
            }`}>
              <div className="flex items-center gap-2 mb-1 opacity-50 text-xs font-display">
                {msg.role === 'assistant' && <Bot className="h-3 w-3" />}
                <span>{msg.role === 'user' ? 'YOU' : 'SOLBOT'}</span>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
             <div className="bg-cyber-cyan/10 border border-cyber-cyan/30 p-4 rounded-lg rounded-bl-none">
               <div className="flex gap-1">
                 <div className="w-2 h-2 bg-cyber-cyan rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-cyber-cyan rounded-full animate-bounce delay-100"></div>
                 <div className="w-2 h-2 bg-cyber-cyan rounded-full animate-bounce delay-200"></div>
               </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about market data or strategy..."
          className="w-full bg-cyber-black border border-cyber-gray rounded-lg py-3 pl-4 pr-12 text-white focus:outline-none focus:border-cyber-cyan transition-colors"
        />
        <button 
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-cyber-cyan hover:text-white transition-colors"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </Card>
  );
};