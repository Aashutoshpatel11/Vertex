"use client"
import React from 'react'

function AIChat({content="", key}) {
  return (
    <div key={key} className="flex justify-start">
        <div className="flex max-w-[80%] flex-col gap-1">
            <div className=" px-5 py-3 text-sm leading-relaxed text-zinc-300 shadow-sm backdrop-blur-sm">
                {content}
            </div>
        </div>
    </div>
  )
}

export default AIChat