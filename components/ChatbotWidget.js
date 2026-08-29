"use client";

import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';

export default function ChatbotWidget({ chatbotUrl }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!chatbotUrl) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end chatbot-widget">
      {/* Chat Window Panel */}
      {isOpen && (
        <div className="mb-4 flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl transition-all duration-300 w-[calc(100vw-2rem)] sm:w-[380px] h-[500px] max-h-[75vh]">
          {/* Header */}
          <div className="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              <span className="font-display text-sm font-semibold">Cornerstone Assistant</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close chat"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Iframe content */}
          <div className="flex-1 bg-background relative">
            <iframe
              src={chatbotUrl}
              title="Cornerstone Admissions Chatbot"
              className="w-full h-full border-none"
              allow="microphone; camera; clipboard-write"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        </div>
      )}

      {/* Floating Chat Bubble Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:bg-primary-hover active:scale-95 transition-all duration-200"
        aria-label="Open support chat"
        title="Chat with us"
      >
        {isOpen ? (
          <X className="h-6 w-6 animate-in fade-in zoom-in duration-300" />
        ) : (
          <MessageSquare className="h-6 w-6 animate-in fade-in zoom-in duration-300" />
        )}
      </button>
    </div>
  );
}
