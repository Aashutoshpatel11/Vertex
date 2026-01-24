import React from 'react'
import { signIn, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';

function Header({ session }) {
  return (
    <motion.div 
      initial={{ y: -100 }} 
      animate={{ y: 0 }} 
      transition={{ type: "spring", stiffness: 100 }}
      className="navbar md:px-10 border-b border-white/5 bg-zinc-900/60 backdrop-blur-md
      shadow-xl rounded-b-box mb-8 z-50 sticky top-0"
    >
      <div className="flex-1">
        <a className="btn btn-ghost text-2xl font-bold  text-white/50 ">
          ChatPDF<span className="text-transparent">.ai</span>
        </a>
      </div>
      <div className="flex-none gap-4">
        {session ? (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                <img alt="User Avatar" src={session.user?.image || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"} />
              </div>
            </div>
            <ul tabIndex={0} className="mt-3 z-1 p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
              <li><button onClick={() => signOut()}>Logout</button></li>
            </ul>
          </div>
        ) : (
          <button onClick={() => signIn()} className="btn btn-success btn-soft">Sign In</button>
        )}
      </div>
    </motion.div>
  );
}

export default Header