"use client"
import { useSession, signIn, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useLayoutEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LandingView from "@/components/LandingView";
import axios from "axios";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { UploadIcon, ChevronRight, PlusCircleIcon } from "lucide-react";
import { TimeAgo } from "@/utiils/TimeAgo";
import KeyModal from "@/components/KeyModal";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-linear-to-t from-black via-black to-red-900/20 flex flex-col font-sans overflow-x-hidden  ">
      <Header session={session} />
      <main className="grow container mx-auto px-4 py-8  ">
        {session ? <DashboardView session={session} /> : <LandingView />}
      </main>
      <Footer />
    </div>
  );
}


function DashboardView({ session }) {
  const modalRef = useRef(null);
  const [chats, setChats] = useState([]);
  const router = useRouter()

  const path = usePathname()
  console.log("URL PATH :: ", path);

  const searchParams = useSearchParams()
  console.log("SEARCH PARAMS :: ", searchParams.toString());
  

  const getAllChats = async() => {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/chat/get`)
    if( res.status == 200 ){
      setChats(res.data.data)
    }
  }

  useLayoutEffect( () => {
    getAllChats()
  }, [] )
  

  const openModal = () => {
    modalRef.current.showModal();
  }

  return (
    <>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8 bg-transparent md:px-10"
      >
        {/* Welcome Section */}
        <motion.div variants={itemVariants} className="text-center space-y-2">
          <h1 className="text-2xl text-base-content/70">
            Welcome back, <span className="text-3xl text-white">{session.user?.name || "User"}</span>
          </h1>
          <p className="text-base-content/70 font-extralight text-sm">Ready to chat with your documents?</p>
        </motion.div>

        {/* Action Bar */}
        <motion.div variants={itemVariants} className="flex flex-col justify-center items-center gap-5">
          <button onClick={openModal} className="btn btn-wide btn-lg btn-soft btn-circle btn-error shadow-lg group">
            <span className="">Upload</span>
            <UploadIcon />
          </button>
          <button onClick={openKeyAddedModal} className="btn btn-wide btn-lg btn-soft btn-circle btn-error shadow-lg group">
            <span className="">Gemini Key</span>
            <PlusCircleIcon />
          </button>
        </motion.div>

        {/* Chat Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chats.map((chat) => (
            <motion.div 
              key={chat._id}
              variants={itemVariants}
              whileHover={{ scale: 1.03 }}
              onClick={ () => router.push(`/chat/${chat._id}`) }
              className={`card border border-white/10 bg-linear-to-r from-red-900/10 via-black to-black p-6 backdrop-blur-sm transition-all shadow-xl border-l-8 hover:border-white/30 cursor-pointer hover:shadow-2xl`}
            >
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <h2 className="card-title text-lg truncate">{chat.title}</h2>
                  <div className="badge badge-soft badge-success text-xs">pdf</div>
                </div>
                <p className="text-sm text-base-content/60 truncate">File: {chat.storeId}</p>
                <div className="card-actions justify-end mt-4">
                  <span className="text-xs opacity-50 mr-auto self-center">{TimeAgo(chat.createdAt)}</span>
                  <button className="btn btn-sm btn-circle btn-ghost">
                    <ChevronRight />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          
          {/* Create New Ghost Card */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            onClick={openModal}
            className="card border-2 border-dashed border-base-content/20 bg-transparent flex items-center justify-center min-h-40 cursor-pointer hover:border-primary hover:bg-base-100/50 transition-colors group"
          >
            <div className="text-center opacity-50 group-hover:opacity-100 transition-opacity">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mx-auto mb-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span className="font-semibold">Create New Chat</span>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* --- NEW CHAT MODAL --- */}
      <NewChatModal 
      modalRef={modalRef}
      refetchChat={getAllChats}
      />
      
    </>
  );
}

function NewChatModal({ modalRef, refetchChat }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef()

  const handleSubmit = async(e) => {
    e.preventDefault();

    setIsSubmitting(true);

    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData.entries())

    try {
      const res = await axios.post(`http://localhost:3000/api/chat/create`, formData)

      if( res.status == 200 ){  
        await refetchChat()
        setIsSubmitting(false);
        modalRef.current.close();
      }

    } catch (error) {
      setIsSubmitting(false);
      alert("Error creating chat. Please try again.")
      console.log("Create Chat :: Error :: ", error.message)
    }

  };

  return (
    <dialog ref={modalRef} className="modal modal-bottom sm:modal-middle backdrop-blur-xl ">
      <div className="modal-box bg-black border border-white/10 shadow-2xl shadow-black ">
        <h3 className=" text-lg mb-4">Create Chat</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-light text-sm">Chat Title</span>
            </label>
            <input 
              name="title"
              type="text" 
              placeholder="e.g. Marketing Strategy" 
              className="input input-bordered w-full focus:input-ghost bg-black" 
              required
            />
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-light text-sm">Description</span>
            </label>
            <textarea 
              name="description"
              type="text" 
              placeholder="What is this chat about?" 
              className="bg-black textarea h-36 textarea-bordered w-full focus:textarea-ghost" 
              required
            />
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-light text-sm">Upload PDF</span>
            </label>
            <input 
              name="file"
              type="file" 
              accept=".pdf"
              className="file-input file-input-bordered file-input-ghost w-full" 
              required
            />
            <label className="label">
              <span className="label-text-alt text-base-content/50 font-extralight text-xs">Max size: 5MB</span>
            </label>
          </div>

          <div className="modal-action">
            <button 
              type="button" 
              className="btn btn-ghost"
              onClick={() => modalRef.current.close()}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            
            <button 
              type="submit" 
              className="btn btn-soft btn-success"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Processing...
                </>
              ) : (
                "Create Chat"
              )}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}





