"use client"
import React from 'react';
import { FileText, Search, List, Zap, HelpCircle } from 'lucide-react';

export default function PDFEmptyState({ setInput}) {
  
  const suggestions = [
    { 
      label: "Summarize", 
      desc: "Get a quick overview", 
      icon: <List size={18} />, 
      prompt: "Give me a 5-bullet summary of this document." 
    },
    { 
      label: "Key Insights", 
      desc: "Extract main points", 
      icon: <Zap size={18} />, 
      prompt: "What are the top 3 key takeaways from this file?" 
    },
    { 
      label: "Find Details", 
      desc: "Locate specific info", 
      icon: <Search size={18} />, 
      prompt: "Find and quote the section that discusses..." 
    },
    { 
      label: "Simplify", 
      desc: "Explain clearly", 
      icon: <HelpCircle size={18} />, 
      prompt: "Explain the technical concepts in this document like I'm 5." 
    },
  ];

  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-8">
      
      {/* 1. PDF File Visual */}
      <div className="relative mb-8 group">
        {/* Glow effect */}
        <div className="absolute -inset-1 rounded-2xl bg-linear-to-r from-red-500/20 to-orange-500/20 blur-lg opacity-50 transition-opacity group-hover:opacity-75" />
        
        <div className="relative flex h-20 w-16 flex-col items-center justify-center rounded-xl border border-white/10 bg-zinc-900 shadow-2xl">
          <FileText size={32} className="text-zinc-200" strokeWidth={1} />
          <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-md">
            PDF
          </div>
        </div>
      </div>

      {/* 2. Welcome Text */}
      <div className="mb-10 text-center max-w-md">
        <h2 className="text-xl font-semibold text-white">
          Ready to <span className="text-red-400">Chat</span>
        </h2>
        <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
          I've analyzed the document. You can ask me to summarize, find specific quotes, or explain complex sections.
        </p>
      </div>

      {/* 3. Suggestion Grid */}
      <div className="grid w-full max-w-2xl grid-cols-1 gap-3 md:grid-cols-2">
        {suggestions.map((item, i) => (
          <button 
            key={i}
            onClick={() => setInput(item.prompt)}
            className="group flex items-center gap-4 rounded-xl border border-white/5 bg-white/5 px-4 py-4 text-left transition-all hover:bg-white/10 hover:border-white/10 hover:shadow-lg hover:shadow-black/20"
          >
            {/* Icon Box */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-black/50 text-zinc-400 group-hover:text-red-400 transition-colors border border-white/5">
              {item.icon}
            </div>
            
            {/* Text */}
            <div className="flex flex-col">
              <span className="text-sm font-medium text-zinc-200 group-hover:text-white">
                {item.label}
              </span>
              <span className="text-xs text-zinc-500 group-hover:text-zinc-400">
                {item.desc}
              </span>
            </div>
          </button>
        ))}
      </div>

    </div>
  );
}