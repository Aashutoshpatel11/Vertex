"use client"
import React from 'react'
import { PlusCircle } from 'lucide-react';

function KeyModal({setIsKeyModalOpen}) {
    const [apiKey, setApiKey] = React.useState("")

    const handleSubmit = (e) => {
        e.preventDefault();
        localStorage.setItem("geminiApiKey", apiKey);
        setApiKey("")
        setIsKeyModalOpen(false)
    }

  return (
    <div className='fixed top-0 left-0 h-screen w-screen flex flex-col justify-center items-center backdrop-blur' >
        <form 
        action="submit" 
        onSubmit={handleSubmit}
        className='p-6 bg-zinc-900/90 rounded-xl border border-white/10 w-[90%] md:w-1/2 flex justify-between items-center '
        >
           <input 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value.trim())}
                className=' h-16 border-0 bg-transparent outline-0 text-white placeholder-zinc-500 w-full' 
                type="input" 
                placeholder='Add Gemini API Key...' 
            />
            <button
                type='submit'
                disabled={!apiKey.length} 
                className={`btn btn-soft btn-circle p-1 hover:cursor-pointer btn-success`}
            >
                <PlusCircle size={20} />
            </button>
        </form>
        <div className='w-[90%] md:w-1/2 flex justify-end' >
            <button
            onClick={ () => setIsKeyModalOpen(false) }
            className='btn btn-ghost mt-2 font-extralight' >close</button>
        </div>
    </div>
  )
}

export default KeyModal