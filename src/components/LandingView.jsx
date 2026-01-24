import React from 'react'
import { signIn } from 'next-auth/react';

function LandingView() {
  return (
    <div className="hero min-h-[50vh] bg-transparent md:p-10">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">Chat with PDFs</h1>
          <p className="py-6">Login to start chatting with your documents.</p>
          <button onClick={() => signIn()} className="btn btn-success btn-soft">Get Started</button>
        </div>
      </div>
    </div>
  );
}

export default LandingView