"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, HelpCircle, GraduationCap, CheckCircle2 } from 'lucide-react';

export default function MockChatbotPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Welcome to Cornerstone Pathway College Support! 👋 I am your automated admissions advisor. How can I help you with your international studies and university transfer plans today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const quickReplies = [
    { label: '💰 Course Fees & Cost', query: 'What are the tuition fees?' },
    { label: '✈️ Credit Transfer to UK', query: 'How does transfer to UK work?' },
    { label: '📚 Admission Requirements', query: 'What are the admission requirements?' },
    { label: '🎓 Scholarship Details', query: 'Are scholarships available?' }
  ];

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend) => {
    const query = textToSend.trim();
    if (!query) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Simulate bot thinking
    setTimeout(() => {
      let botReplyText = '';
      const cleanText = query.toLowerCase();

      if (cleanText.includes('fee') || cleanText.includes('cost') || cleanText.includes('tuition')) {
        botReplyText = '📚 **Tuition Fee Structure**:\n\nCornerstone pathways allow you to complete your first year locally and transfer credits to UK/US/Australian universities. This saves you up to 60% of overall international education costs!\n\n* **Academic Pathway Fees**: Starting from ₹3,50,000/year.\n* **Savings**: Average savings of ₹15,00,000 in overseas living and tuition costs.';
      } else if (cleanText.includes('transfer') || cleanText.includes('uk') || cleanText.includes('university') || cleanText.includes('credit')) {
        botReplyText = '✈️ **Credit Transfer System**:\n\nUnder our standard pathway structure, you study 1 year in India and transfer directly into the 2nd year of our UK partner universities (e.g., University of West London, University of Sunderland).\n\n* **Accreditation**: Fully recognised credits.\n* **Options**: Choose from over 15+ top destinations across the UK, USA, & Australia.';
      } else if (cleanText.includes('admission') || cleanText.includes('requirement') || cleanText.includes('eligible') || cleanText.includes('requirements')) {
        botReplyText = '📝 **Admission & Eligibility Criteria**:\n\n* **Academic**: Completion of 12th standard (HSC / CBSE / ISC) with minimum 55% marks.\n* **English Proficiency**: IELTS 5.5 equivalent (English proficiency can also be evaluated via internal college tests).\n* **Intake Periods**: Major intakes occur in January, June, and September.';
      } else if (cleanText.includes('scholarship') || cleanText.includes('discount') || cleanText.includes('waiver')) {
        botReplyText = '🎓 **Scholarships & Financial Aid**:\n\nYes! We award merit-based scholarships up to 30% off the pathway tuition fees for students securing above 80% marks in their 12th grade.\n\nWould you like me to request an eligibility check from our admissions desk?';
      } else if (cleanText.includes('hi') || cleanText.includes('hello') || cleanText.includes('hey') || cleanText.includes('help')) {
        botReplyText = 'Hello! Welcome back to the admissions help desk. Feel free to click any of the quick-reply tags below or type your question about our international pathways!';
      } else {
        botReplyText = 'Thank you for your message! ✉️ I have forwarded your inquiry to a human admissions officer. They will email or call you shortly. Is there anything else I can clarify about our programs?';
      }

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: botReplyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setIsTyping(false);
      setMessages((prev) => [...prev, botMsg]);
    }, 1000);
  };

  const onFormSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    handleSendMessage(inputValue);
    setInputValue('');
  };

  return (
    <div className="flex h-screen flex-col bg-[#071120] font-sans text-slate-100 antialiased selection:bg-[#B99750]/30 selection:text-white">
      
      {/* Enhanced Premium Header */}
      <header className="relative flex items-center justify-between border-b border-[#B99750]/20 bg-[#0E1E34] px-4 py-3 shadow-lg z-10">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#B99750]/10 text-[#B99750] border border-[#B99750]/25 shadow-inner">
            <GraduationCap className="h-5 w-5" />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-[#0E1E34]" />
          </div>
          <div>
            <h1 className="text-xs font-bold tracking-wider text-[#B99750] flex items-center gap-1.5 uppercase">
              Cornerstone Advisor <Sparkles className="h-3.5 w-3.5 animate-pulse text-[#B99750]" />
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">International Pathway Support</p>
          </div>
        </div>
        
        {/* Support Badges */}
        <div className="flex items-center gap-1.5 bg-[#071120] px-2 py-1 rounded-md border border-slate-800 text-[9px] font-bold text-slate-400">
          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
          <span>VERIFIED BOT</span>
        </div>
      </header>

      {/* Message Feed Canvas */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#071120] to-[#0A1628] scrollbar-thin">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 max-w-[88%] ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            {/* User or Bot Avatar Icon */}
            <div
              className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg text-xs font-semibold shadow transition-transform duration-200 ${
                msg.sender === 'user'
                  ? 'bg-[#B99750] text-[#0E1E34]'
                  : 'bg-[#0E1E34] text-[#B99750] border border-[#B99750]/20'
              }`}
            >
              {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>

            {/* Message bubble wrapper */}
            <div className="space-y-1">
              <div
                className={`rounded-2xl px-4 py-2.5 text-[11px] sm:text-xs leading-relaxed shadow-md whitespace-pre-line border ${
                  msg.sender === 'user'
                    ? 'bg-[#B99750] text-[#0E1E34] rounded-tr-none font-medium border-[#B99750]/20'
                    : 'bg-[#0E1E34] text-slate-200 border-[#B99750]/10 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
              <span
                className={`text-[9px] text-slate-500 font-medium block ${
                  msg.sender === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                {msg.time}
              </span>
            </div>
          </div>
        ))}

        {/* typing placeholder animation */}
        {isTyping && (
          <div className="flex items-center gap-2.5 max-w-[85%] mr-auto">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0E1E34] text-[#B99750] border border-[#B99750]/15 shadow">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-[#0E1E34] text-slate-400 border border-[#B99750]/10 rounded-2xl rounded-tl-none px-4 py-3 text-xs flex items-center gap-1 shadow-sm">
              <span className="w-1.5 h-1.5 bg-[#B99750] rounded-full animate-bounce delay-100" />
              <span className="w-1.5 h-1.5 bg-[#B99750] rounded-full animate-bounce delay-200" />
              <span className="w-1.5 h-1.5 bg-[#B99750] rounded-full animate-bounce delay-300" />
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </main>

      {/* Floating Quick Replies Container */}
      <div className="bg-[#0A1628]/95 px-3 py-2 border-t border-slate-900 overflow-x-auto flex gap-1.5 no-scrollbar z-10 shrink-0">
        {quickReplies.map((qr, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(qr.query)}
            className="shrink-0 rounded-full border border-[#B99750]/20 bg-[#0E1E34] hover:bg-[#B99750]/10 hover:border-[#B99750]/40 px-3 py-1.5 text-[10px] font-semibold text-[#B99750] transition shadow-sm active:scale-95 whitespace-nowrap"
          >
            {qr.label}
          </button>
        ))}
      </div>

      {/* Inputs Form */}
      <footer className="border-t border-slate-900 bg-[#0E1E34]/80 p-3 backdrop-blur-md shrink-0">
        <form onSubmit={onFormSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message (e.g. fees, transfer, admission)..."
            className="flex-1 rounded-xl border border-slate-800 bg-[#071120] px-4 py-2.5 text-[11px] text-slate-100 placeholder-slate-500 outline-none focus:border-[#B99750] transition-colors focus:ring-1 focus:ring-[#B99750]/30"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#B99750] text-[#0E1E34] hover:bg-[#a58442] active:scale-95 transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none shadow"
            aria-label="Send message"
          >
            <Send className="h-4.5 w-4.5" />
          </button>
        </form>
      </footer>
    </div>
  );
}
