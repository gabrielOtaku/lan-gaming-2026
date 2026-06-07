import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send } from "lucide-react";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Salutations. Je suis l'IA de support de la LAN 2026. Comment puis-je t'aider ?",
    },
  ]);
  const [input, setInput] = useState("");
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsgs = [...messages, { sender: "user", text: input }];
    setMessages(newMsgs);
    setInput("");

    try {
      const res = await fetch(`${apiUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      setMessages([...newMsgs, { sender: "bot", text: data.reply }]);
    } catch {
      setMessages([
        ...newMsgs,
        { sender: "bot", text: "Connexion au serveur perdue." },
      ]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 w-80 bg-[#0D1117] border border-[#C89B3C]/30 rounded shadow-[0_0_15px_rgba(200,155,60,0.3)] overflow-hidden flex flex-col"
          >
            <div className="bg-[#030508] border-b border-[#C89B3C]/20 p-3 flex justify-between items-center">
              <span className="text-[#FFD700] text-sm font-bold tracking-widest uppercase">
                Nexus IA Support
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-[#FFD700]"
              >
                <X size={16} />
              </button>
            </div>
            <div className="h-64 p-4 overflow-y-auto flex flex-col gap-3 scroll-smooth">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-2 rounded text-sm ${
                    msg.sender === "user"
                      ? "bg-[#C89B3C]/20 text-white ml-auto border border-[#C89B3C]/30"
                      : "bg-[#030508] text-gray-300 mr-auto border border-gray-700"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>
            <form
              onSubmit={sendMessage}
              className="p-2 border-t border-[#C89B3C]/20 flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-[#030508] text-white px-3 py-2 text-sm border border-gray-700 focus:border-[#C89B3C] outline-none"
                placeholder="Transmission..."
              />
              <button
                type="submit"
                className="bg-[#C89B3C] text-[#030508] px-3 flex items-center justify-center hover:bg-[#FFD700] transition-colors"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-14 h-14 bg-gradient-to-br from-[#FFD700] to-amber-600 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(200,155,60,0.3)] border-2 border-[#030508]"
      >
        {isOpen ? (
          <X className="text-[#030508]" />
        ) : (
          <MessageSquare className="text-[#030508]" />
        )}
      </motion.button>
    </div>
  );
}
