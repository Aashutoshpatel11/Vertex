import React from 'react'

function HumanChat({content="", key}) {
  return (
    <div className="flex justify-end">
        <div className="flex max-w-[80%] flex-col gap-1 items-end">
            <div className="rounded-2xl rounded-tr-sm bg-zinc-800 px-5 py-3 text-sm text-white shadow-sm">
                {content}
            </div>
        </div>
    </div>
  )
}

export default HumanChat