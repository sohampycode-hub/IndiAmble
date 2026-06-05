import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Send, Sparkles, User, Bot, RefreshCw } from 'lucide-react';

export default function AiAgent() {
  const location = useLocation();
  const messagesEndRef = useRef(null);

  const hasFired = useRef(false);

  // Initialize your chat logging structures
  const [messages, setMessages] = useState([
    { 
      sender: 'bot', 
      text: "Namaste! I am your WanderIndia AI Guide. Let's customize your dream holiday! Specify your companions (Solo, Family, Group) or tell me which specific region you'd like an itinerary for!" 
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Auto-scroll logic: pushes the viewport down cleanly whenever a message pops up
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // UPDATED AUTOMATED CONTEXT CAPTURE WITH SAFETY LATCH
  useEffect(() => {
    if (location.state && location.state.targetLocationContext) {
      // If the flag is already true, stop and exit the function completely!
      if (hasFired.current) return;

      const regionName = location.state.targetLocationContext;
      const initialPrompt = `Create a highly comprehensive, step-by-step travel itinerary for exploring ${regionName}. Break down the schedule day by day and include tips for visiting its popular attractions.`;
      
      // Flip the flag to true right before running the code so it can never run again
      hasFired.current = true;
      executeChatExchange(initialPrompt);
    }
  }, [location.state]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage;
    setInputMessage('');
    executeChatExchange(userText);
  };

  const executeChatExchange = async (userText) => {
    // Append user's chat bubble onto the screen right away
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setIsSending(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/ai/chat`, {
        message: userText
      });
      
      setMessages((prev) => [...prev, { sender: 'bot', text: response.data.reply }]);
    } catch (err) {
      console.error("AI Assistant connection dropped:", err);
      setMessages((prev) => [...prev, { 
        sender: 'bot', 
        text: "I experienced a minor connection latency anomaly while organizing regional maps. I suggest checking out our catalog details grids!" 
      }]);
    } finally {
      setIsSending(false);
    }
  };

  const clearChatHistory = () => {
    setMessages([
      { sender: 'bot', text: "Chat logs reset! Where shall we head next? Tell me your budget or travel duration choices." }
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col h-[85vh]">
      
      {/* Bot Window Header Card */}
      <div className="bg-travelGreen text-white p-4 rounded-t-xl shadow-md flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-travelOrange/30">
            <Sparkles className="text-travelOrange animate-pulse" size={20} />
          </div>
          <div>
            <h2 className="font-bold font-heading text-base tracking-wide text-white">WanderIndia AI Travel Assistant</h2>
            <p className="text-[11px] text-emerald-300">Live Custom Itinerary Generator</p>
          </div>
        </div>
        
        {/* Reset Button */}
        <button 
          onClick={clearChatHistory}
          className="text-xs bg-emerald-950/60 border border-emerald-800/40 hover:bg-emerald-900 px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors text-white font-medium cursor-pointer"
          title="Clear Conversation History"
        >
          <RefreshCw size={12} />
          <span>Reset</span>
        </button>
      </div>

      {/* Main Messaging Hub Container */}
      <div className="flex-1 bg-white border-x border-gray-100 p-6 overflow-y-auto space-y-4 shadow-inner flex flex-col">
        {messages.map((msg, index) => (
          <div 
            key={index}
            className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
          >
            {/* Avatar Circles */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs shadow-sm text-white font-bold
              ${msg.sender === 'user' ? 'bg-travelOrange' : 'bg-travelGreen'}`}
            >
              {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>
            
            {/* Text Bubble */}
            <div className={`p-4 rounded-xl text-sm font-normal leading-relaxed whitespace-pre-wrap shadow-xs border
              ${msg.sender === 'user' 
                ? 'bg-travelOrange border-orange-600 text-white rounded-tr-none' 
                : 'bg-gray-50 border-gray-100 text-travelSlate rounded-tl-none'}`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        
        {/* Animated Loading Skeleton Block while response stream resolves */}
        {isSending && (
          <div className="flex gap-3 max-w-[80%] self-start animate-pulse">
            <div className="w-8 h-8 rounded-full bg-travelGreen text-white flex items-center justify-center">
              <Bot size={14} />
            </div>
            <div className="p-3.5 bg-gray-50 text-gray-400 text-xs italic rounded-xl border border-gray-100">
              Agent is compiling seasonal constraints and routing coordinates...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Attachment Toolbar Dock */}
      <form onSubmit={handleFormSubmit} className="bg-gray-50 p-3 rounded-b-xl border-x border-b border-gray-100 flex gap-2 shadow-xs">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask something (e.g., Make a budget 3-day plan for Leh)..."
          className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-travelGreen text-travelSlate"
          disabled={isSending}
        />
        <button
          type="submit"
          disabled={isSending || !inputMessage.trim()}
          className="bg-travelGreen text-white px-6 py-3 rounded-lg font-bold hover:bg-opacity-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>Ask</span>
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}