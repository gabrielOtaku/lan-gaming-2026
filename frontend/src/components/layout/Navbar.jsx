import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, useScroll, AnimatePresence } from "framer-motion";
import { Menu, X, Sword, Zap, Ticket, Mail } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

const NAV_LINKS = [
  { to: "/", label: "Accueil", icon: Zap },
  { to: "/calendrier", label: "Calendrier", icon: Sword },
  { to: "/billetterie", label: "Billetterie", icon: Ticket },
  { to: "/contact", label: "Contact", icon: Mail },
];

export default function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    const unsub = scrollY.on("change", (y) => setScrolled(y > 60));
    return () => unsub();
  }, [scrollY]);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-[1000]"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.7 }}
      >
        <div
          className={`transition-all duration-500 ${
            scrolled
              ? "bg-[#0D1117]/90 backdrop-blur-md border-b border-[#C89B3C]/20 shadow-[0_0_15px_rgba(200,155,60,0.3)]"
              : "bg-transparent"
          }`}
        >
          <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16 md:h-20">
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div className="w-10 h-10 clip-hex bg-gradient-to-br from-[#FFD700] to-amber-600 flex items-center justify-center">
                <span className="text-[#030508] text-xs font-bold">LG</span>
              </motion.div>
              <div className="hidden sm:block">
                <p className="text-[#FFD700] text-sm font-bold tracking-widest leading-none">
                  LAN Gaming
                </p>
                <p className="text-[#C89B3C] text-[10px] tracking-[0.4em] leading-none mt-0.5">
                  2026 · CSF
                </p>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ to, label, icon: Icon }) => {
                const isActive = location.pathname === to;
                return (
                  <Link key={to} to={to} className="relative px-5 py-2 group">
                    <div className="flex items-center gap-2">
                      <Icon
                        size={14}
                        className={`transition-colors ${
                          isActive
                            ? "text-[#FFD700]"
                            : "text-[#C89B3C] group-hover:text-[#FFD700]"
                        }`}
                      />
                      <span
                        className={`font-semibold text-sm tracking-widest uppercase transition-colors ${
                          isActive
                            ? "text-[#FFD700]"
                            : "text-gray-400 group-hover:text-[#FFD700]"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  </Link>
                );
              })}

              <div className="ml-6 flex items-center gap-3 border-l border-[#C89B3C]/20 pl-6">
                {user ? (
                  <div className="flex items-center gap-4">
                    <span className="text-[#FFD700] text-xs tracking-widest uppercase">
                      {user.name}
                    </span>
                    <button
                      onClick={logout}
                      className="text-gray-500 text-xs uppercase hover:text-[#C89B3C] transition-colors"
                    >
                      Déconnexion
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <a
                      href={`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/auth/google`}
                      className="px-3 py-1.5 border border-blue-500/50 text-blue-400 text-[10px] tracking-widest hover:bg-blue-500/10 transition-colors uppercase"
                    >
                      Google
                    </a>
                    <a
                      href={`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/auth/microsoft`}
                      className="px-3 py-1.5 border border-cyan-500/50 text-cyan-400 text-[10px] tracking-widest hover:bg-cyan-500/10 transition-colors uppercase"
                    >
                      Microsoft
                    </a>
                  </div>
                )}
              </div>
            </div>

            <button
              className="md:hidden p-2 text-[#FFD700]"
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
          </nav>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1001] md:hidden"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 right-0 h-screen w-64 bg-[#0D1117] border-l border-[#C89B3C]/20 shadow-[-10px_0_20px_rgba(0,0,0,0.5)] z-[1002] flex flex-col p-6 md:hidden"
            >
              <button
                className="self-end text-[#FFD700] mb-8"
                onClick={() => setMenuOpen(false)}
              >
                <X size={24} />
              </button>
              <div className="flex flex-col gap-6">
                {NAV_LINKS.map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    className="flex items-center gap-4 text-gray-300 hover:text-[#FFD700] transition-colors"
                  >
                    <Icon size={20} />
                    <span className="font-semibold tracking-widest uppercase">
                      {label}
                    </span>
                  </Link>
                ))}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
