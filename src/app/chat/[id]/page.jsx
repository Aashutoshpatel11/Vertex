"use client"
import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Send } from 'lucide-react';
import Header from '@/components/Header';
import { useSession } from 'next-auth/react';
import AIChat from '@/components/AIChat';
import HumanChat from '@/components/HumanChat';

export default function Chat() {
    const {id} = useParams()
    const [userInput, setUserInput] = useState("")
    const session = useSession()

  return (
    <div className='h-screen w-screen bg-linear-to-b from-black via-black to-zinc-900 relative'>
    
        {/* HEADER (Unchanged) */}
        <Header session={session} />

        {/* --- CONVERSATIONS (IMPROVED) --- */}
        <div className='absolute bottom-26 left-1/2 -translate-x-1/2 h-[76%] w-full md:w-3/4 xl:w-1/2 flex flex-col gap-6 overflow-y-auto px-4 pb-4 no-scrollbar text-white/80'>
            
            {/* <AIChat key={'sfdhfbsjdkhf'} content={"Hello. I am ready. How can I help you today?"}  />
            <HumanChat key={"djhsdbvf"} content={"I need help designing a dark mode dashboard."} /> */}

            {/* Dynamic Mapping (Connect this to your state) */}
            {/* {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`rounded-2xl px-5 py-3 text-sm max-w-[80%] ${
                        msg.role === 'user' 
                        ? 'bg-zinc-800 text-white rounded-tr-sm' 
                        : 'bg-zinc-900/80 border border-white/10 text-zinc-300 rounded-tl-sm'
                    }`}>
                        {msg.content}
                    </div>
                </div>
            ))} 
            */}

        </div>

        {/* USER INPUT (Unchanged) */}
        <div className='absolute bottom-10 left-1/2 -translate-x-1/2 flex rounded-full border border-white/50 px-6 justify-between items-center w-[90%] md:w-3/4 xl:w-1/2 '>
            <input 
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className=' h-16 border-0 bg-transparent outline-0 text-white placeholder-zinc-500 w-full' 
                type="input" 
                placeholder='start chatting...' 
            />
            <button
                disabled={!userInput.length} 
                className={`btn btn-soft btn-circle p-1 hover:cursor-pointer btn-success`}
            >
                <Send size={20} />
            </button>
        </div>

    </div>
  );
}