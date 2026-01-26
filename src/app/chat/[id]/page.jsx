"use client"
import React, { useEffect, useLayoutEffect, useMemo, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Send } from 'lucide-react';
import Header from '@/components/Header';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import ReactMarkdown from "react-markdown"
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import PDFEmptyState from '@/components/PDFEmptyState';
import remarkBreaks from 'remark-breaks';
import { cleanContent } from '@/utiils/CleanContent';

export default function Chat() {
    const {id} = useParams()
    const [userInput, setUserInput] = useState("")
    const session = useSession()
    const [messages, setMessages] = useState([])
    const [progress, setProgess] = useState(false)

    const MarkdownComponent = useMemo( () => ( 
        {
            // 1. Code Block & Inline Code Handling
            code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                    // BLOCK CODE (```js ...)
                    <div className="relative my-4 overflow-hidden rounded-md border border-white/10 bg-black/50">
                        <div className="flex items-center justify-between bg-zinc-900/50 px-4 py-1.5 border-b border-white/5">
                            <span className="text-xs text-zinc-400 font-mono">{match[1]}</span>
                        </div>
                        <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{ margin: 0, borderRadius: 0, background: 'transparent', fontSize: '13px' }}
                            {...props}
                        >
                            {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                    </div>
                ) : (
                    // INLINE CODE (`const x`)
                    <code className="bg-zinc-700/50 text-zinc-200 px-1.5 py-0.5 rounded text-sm font-mono border border-white/5" {...props}>
                        {children}
                    </code>
                );
            },
            // 2. General Formatting Overrides
            ul: ({ children }) => <ul className="list-disc ml-4 my-2 space-y-1">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal ml-4 my-2 space-y-1">{children}</ol>,
            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
            p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
            strong: ({ children }) => <span className="font-semibold text-white">{children}</span>,
            a: ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{children}</a>,
            h1: ({ children }) => <h1 className="text-3xl font-bold text-white mt-10 mb-4">{children}</h1>,
            h2: ({ children }) => <h2 className="text-2xl font-bold text-white mt-10 mb-3 border-b border-white/40 pb-2">{children}</h2>,
            h3: ({ children }) => <h3 className="text-lg font-semibold text-zinc-200 mt-6 mb-2">{children}</h3>,
            h4: ({ children }) => <h4 className="text-base font-semibold text-zinc-200 mt-6 mb-2">{children}</h4>,
        }
    ), [])

    const messagesEndRef = useRef(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const getConversation = async() => {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/message/get/${id}`)
        if(res.status == 200){
            setMessages(res.data.data)
        }
    }

    useEffect( () => {
        scrollToBottom()
    }, [messages] )

    useLayoutEffect( () => {
        getConversation()
    }, [] )

    const HandleUserInput = async (e) => {
        e.preventDefault();
        if (!userInput.trim()) return;

        setProgess(true);
        
        // 1. Capture input and clear immediately
        let tempUserInput = userInput; 
        setUserInput("");

        // 2. Add User Message
        setMessages((prev) => [
            ...prev, 
            { role: "user", content: tempUserInput }
        ]);

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_SERVER_URL}/api/bot/${id}`,
                {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ content: tempUserInput })
                }
            );

            if (!res.body) throw new Error("No response body");

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let AIRes = ""; // Accumulator for final save

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                // FIX 1: Do NOT trim() chunks! It destroys spaces and newlines.
                const actualValue = decoder.decode(value, { stream: true });
                AIRes += actualValue;

                setProgess(false);

                // FIX 2: Immutable State Update
                setMessages((prev) => {
                    const lastMsg = prev[prev.length - 1];

                    // If the last message is already the assistant, update it immutably
                    if (lastMsg.role === "assistant") {
                        return [
                            ...prev.slice(0, -1), // All messages except last
                            { ...lastMsg, content: lastMsg.content + actualValue } // New object with appended content
                        ];
                    } else {
                        // If last was user, add new assistant message
                        return [
                            ...prev,
                            { role: "assistant", content: actualValue }
                        ];
                    }
                });
            }

            // 3. Save to DB (Optional: trim ONLY at the very end)
            await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/message/create/${id}`, {
                role: "assistant",
                content: AIRes // OK to trim here if you want
            });

        } catch (error) {
            setProgess(false);
            console.log("ERROR :: User Input :: ", error.message);
        }
    };

  return (
    <div className='h-screen w-screen bg-linear-to-b from-black via-black to-red-900/10 relative'>
    
        <Header session={session} />
        <div className='absolute bottom-26 left-1/2 -translate-x-1/2 h-[76%] w-full md:w-3/4 xl:w-1/2 flex flex-col gap-6 overflow-y-auto px-4 pb-4 no-scrollbar text-white/80'>
            
        {/* {messages && messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                
                <div 
                markdown={1}
                className={`rounded-2xl px-5 py-3 text-md max-w-[80%] ${
                    msg.role === 'user' 
                    ? 'bg-zinc-800 text-white rounded-tr-sm' 
                    : ' text-zinc-300 rounded-tl-sm'
                }`}>
                    <ReactMarkdown>
                        {msg.content}
                    </ReactMarkdown>
                </div>
            </div>
        ))}  */}
        {messages.length ? messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                
                <div className={`rounded-2xl px-5 py-3 text-md max-w-[80%] overflow-hidden ${
                    msg.role === 'user' 
                    ? 'bg-zinc-800 text-white rounded-tr-sm max-w-[80%' 
                    : 'text-zinc-300 rounded-tl-sm bg-transparent min-w-full'
                }`}>
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkBreaks ]}
                        components={MarkdownComponent}
                    >
                        {cleanContent(msg.content)}
                    </ReactMarkdown>
                </div>
            </div>
        )) : (
            <PDFEmptyState setInput={setUserInput} />
        ) }

        {progress && <span className="loading loading-dots loading-sm"></span>}
        <div ref={messagesEndRef} />
        </div>
            

        {/* USER INPUT (Unchanged) */}
            
        <form action="submit" onSubmit={HandleUserInput} >
            <div className='absolute bottom-10 left-1/2 -translate-x-1/2 flex rounded-full border border-white/50 px-6 justify-between items-center w-[90%] md:w-3/4 xl:w-1/2 '>
                <input 
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className=' h-16 border-0 bg-transparent outline-0 text-white placeholder-zinc-500 w-full' 
                    type="input" 
                    placeholder='start chatting...' 
                />
                <button
                    type='submit'
                    disabled={!userInput.length} 
                    className={`btn btn-soft btn-circle p-1 hover:cursor-pointer btn-success`}
                >
                    <Send size={20} />
                </button>
            </div>
        </form>
        
    </div>
  );
}

