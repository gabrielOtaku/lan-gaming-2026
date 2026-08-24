import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { Menu, X, Sword, Zap, Ticket, Mail, Shield, LogOut, AlertCircle, Heart, Trophy, Crown, Info, Radio } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const NAV_LINKS = [
  { to: '/', label: 'Accueil', icon: Zap, code: 'HOME' },
  { to: '/calendrier', label: 'Calendrier', icon: Sword, code: 'SCHED' },
  { to: '/billetterie', label: 'Billetterie', icon: Ticket, code: 'TICKET' },
  { to: '/competitions', label: 'Compétitions', icon: Trophy, code: 'COMP' },
  { to: '/live', label: 'Live', icon: Radio, code: 'LIVE' },
  { to: '/invites-vip', label: 'Invités VIP', icon: Crown, code: 'VIP' },
  { to: '/cagnotte', label: 'Cagnotte', icon: Heart, code: 'DON' },
  { to: '/infos-pratiques', label: 'Infos pratiques', icon: Info, code: 'INFO' },
  { to: '/contact', label: 'Contact', icon: Mail, code: 'CONTACT' },
];

function GoogleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#F25022" d="M11 11H0V0h11z"/>
      <path fill="#7FBA00" d="M24 11H13V0h11z"/>
      <path fill="#00A4EF" d="M11 24H0V13h11z"/>
      <path fill="#FFB900" d="M24 24H13V13h11z"/>
    </svg>
  );
}

// ── Login Modal ───────────────────────────────────────────────────────────────
function LoginModal({ onClose }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Use Vite proxy (/api) so the HttpOnly cookie is set on the same origin
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        login(data.user);
        onClose();
      } else {
        setError(data.error || 'Identifiants incorrects.');
      }
    } catch {
      setError('Erreur de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-obsidian-900/80 backdrop-blur-md" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-sm bg-obsidian-800 border border-ember-400/30 shadow-[0_0_60px_rgba(200,155,60,0.2)]"
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ember-400/20">
          <div>
            <p className="font-display text-ember-300 text-sm font-bold tracking-widest">CONNEXION ADMIN</p>
            <p className="font-mono text-zinc-600 text-[9px] tracking-widest mt-0.5">LAN Gaming 2026 · Accès Privilégié</p>
          </div>
          <button onClick={onClose} className="text-zinc-600 hover:text-ember-300 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* OAuth Buttons */}
        <div className="px-6 pt-5 pb-3 space-y-2.5">
          <a
            href={`${API_URL}/api/auth/google`}
            className="flex items-center gap-3 px-4 py-2.5 border border-zinc-700 hover:border-zinc-500 bg-zinc-900/60 hover:bg-zinc-800 transition-all duration-200 w-full"
          >
            <GoogleIcon />
            <span className="font-body text-zinc-300 text-sm">Continuer avec Google</span>
          </a>
          <a
            href={`${API_URL}/api/auth/microsoft`}
            className="flex items-center gap-3 px-4 py-2.5 border border-zinc-700 hover:border-zinc-500 bg-zinc-900/60 hover:bg-zinc-800 transition-all duration-200 w-full"
          >
            <MicrosoftIcon />
            <span className="font-body text-zinc-300 text-sm">Continuer avec Microsoft</span>
          </a>
        </div>

        <div className="flex items-center gap-3 px-6 py-2">
          <div className="h-px flex-1 bg-zinc-800" />
          <span className="font-mono text-zinc-700 text-[9px] tracking-widest">OU</span>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>

        {/* Email + Password form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-3">
          <div>
            <label className="font-mono text-ember-500 text-[10px] tracking-widest uppercase block mb-1.5">Email admin</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@cegepstfe.ca"
              required
              className="w-full bg-obsidian-900 border border-zinc-800 focus:border-ember-400/60 text-white text-sm px-3 py-2.5 outline-none transition-colors font-body placeholder-zinc-700"
              style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}
            />
          </div>
          <div>
            <label className="font-mono text-ember-500 text-[10px] tracking-widest uppercase block mb-1.5">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-obsidian-900 border border-zinc-800 focus:border-ember-400/60 text-white text-sm px-3 py-2.5 outline-none transition-colors font-body placeholder-zinc-700"
              style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 text-red-400 font-mono text-[10px] bg-red-500/10 border border-red-500/20 px-3 py-2"
              >
                <AlertCircle size={11} /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full py-3 clip-diagonal bg-ember-400 hover:bg-ember-300 disabled:opacity-50 transition-colors font-display font-bold text-obsidian-900 text-xs tracking-widest uppercase"
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Connexion...' : 'Se connecter →'}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function Navbar() {
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    const unsub = scrollY.on('change', (y) => setScrolled(y > 60));
    return () => unsub();
  }, [scrollY]);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-[1000]"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className={`transition-all duration-500 ${
            scrolled
              ? 'bg-glass-strong border-b border-ember-400/20 shadow-[0_0_30px_rgba(200,155,60,0.1)]'
              : 'bg-transparent'
          }`}
        >
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
              <motion.div
                className="w-9 h-9 sm:w-10 sm:h-10 clip-hex bg-gradient-to-br from-ember-300 to-ember-600 flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                animate={{ boxShadow: ['0 0 10px rgba(200,155,60,0.4)', '0 0 25px rgba(255,215,0,0.7)', '0 0 10px rgba(200,155,60,0.4)'] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="font-rune text-obsidian-900 text-xs font-bold">LG</span>
              </motion.div>
              <div className="hidden sm:block">
                <p className="font-display text-ember-300 text-sm font-bold tracking-widest leading-none">LAN Gaming</p>
                <p className="font-mono text-ember-500 text-[10px] tracking-[0.4em] leading-none mt-0.5">2026 · CSF</p>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-0.5">
              {NAV_LINKS.map(({ to, label, icon: Icon, code }) => {
                const isActive = location.pathname === to;
                return (
                  <Link key={to} to={to}>
                    <motion.div className="relative px-3 py-2 group" whileHover="hover" initial="rest">
                      <motion.span
                        className="absolute bottom-0 left-0 h-px bg-gradient-to-r from-transparent via-ember-300 to-transparent"
                        animate={{ width: isActive ? '100%' : '0%' }}
                        variants={{ rest: { width: isActive ? '100%' : '0%' }, hover: { width: '100%' } }}
                        transition={{ duration: 0.3 }}
                      />
                      <div className="flex items-center gap-1.5">
                        <Icon size={13} className={`transition-colors ${isActive ? 'text-ember-300' : 'text-ember-500 group-hover:text-ember-300'}`} />
                        <span className={`font-body font-semibold text-xs tracking-widest uppercase transition-colors ${isActive ? 'text-ember-200 text-ember-glow' : 'text-zinc-400 group-hover:text-ember-200'}`}>
                          {label}
                        </span>
                      </div>
                      <span className={`absolute top-0 right-0.5 font-mono text-[7px] tracking-widest transition-opacity ${isActive ? 'opacity-40 text-ember-400' : 'opacity-0 group-hover:opacity-30 text-ember-500'}`}>
                        [{code}]
                      </span>
                    </motion.div>
                  </Link>
                );
              })}

              {/* Auth section */}
              <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-zinc-800">
                {user ? (
                  /* Logged in — show user + admin link */
                  <>
                    {isAdmin && (
                      <Link to="/admin">
                        <motion.div
                          className="flex items-center gap-1.5 px-2.5 py-1.5 border border-ember-400/40 bg-ember-400/10 hover:bg-ember-400/20 transition-all rounded-sm"
                          whileHover={{ scale: 1.05 }}
                        >
                          <Shield size={12} className="text-ember-300" />
                          <span className="font-mono text-ember-300 text-[9px] tracking-wide hidden lg:block">Admin</span>
                        </motion.div>
                      </Link>
                    )}
                    <div className="flex items-center gap-2 px-2">
                      {user.picture ? (
                        <img src={user.picture} alt={user.name} className="w-6 h-6 rounded-full" />
                      ) : (
                        <div className="w-6 h-6 clip-hex bg-ember-400/20 border border-ember-400/40 flex items-center justify-center">
                          <span className="font-mono text-ember-300 text-[9px] font-bold">{user.name?.[0] || 'A'}</span>
                        </div>
                      )}
                      <span className="font-mono text-zinc-400 text-[9px] tracking-wide hidden lg:block max-w-[80px] truncate">{user.name}</span>
                    </div>
                    <motion.button
                      onClick={logout}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 border border-zinc-800 hover:border-red-500/40 bg-zinc-900/40 hover:bg-red-500/10 transition-all duration-200 rounded-sm"
                      whileHover={{ scale: 1.05 }}
                      title="Déconnexion"
                    >
                      <LogOut size={12} className="text-zinc-500 group-hover:text-red-400" />
                    </motion.button>
                  </>
                ) : (
                  /* Not logged in — show Google + Microsoft buttons */
                  <>
                    <motion.button
                      onClick={() => setLoginOpen(true)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 border border-zinc-800 hover:border-zinc-600 bg-zinc-900/40 hover:bg-zinc-800/60 transition-all duration-200 rounded-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="Connexion Google"
                    >
                      <GoogleIcon />
                      <span className="font-mono text-zinc-500 text-[9px] tracking-wide hidden lg:block">Google</span>
                    </motion.button>
                    <motion.button
                      onClick={() => setLoginOpen(true)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 border border-zinc-800 hover:border-zinc-600 bg-zinc-900/40 hover:bg-zinc-800/60 transition-all duration-200 rounded-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="Connexion Microsoft"
                    >
                      <MicrosoftIcon />
                      <span className="font-mono text-zinc-500 text-[9px] tracking-wide hidden lg:block">Microsoft</span>
                    </motion.button>
                  </>
                )}
              </div>

              {/* CTA */}
              <Link to="/billetterie">
                <motion.button
                  className="ml-2 px-5 py-2 clip-diagonal bg-ember-400 text-obsidian-900 font-display font-bold text-xs tracking-widest uppercase"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  animate={{ boxShadow: ['0 0 10px rgba(200,155,60,0.4)', '0 0 25px rgba(255,215,0,0.7)', '0 0 10px rgba(200,155,60,0.4)'] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  Billets
                </motion.button>
              </Link>
            </div>

            {/* Mobile burger */}
            <motion.button
              className="md:hidden p-2 text-ember-300"
              onClick={() => setMenuOpen(!menuOpen)}
              whileTap={{ scale: 0.9 }}
              aria-label="Ouvrir le menu"
            >
              <AnimatePresence mode="wait">
                {menuOpen ? (
                  <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <X size={24} />
                  </motion.span>
                ) : (
                  <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Menu size={24} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </nav>
        </div>
      </motion.header>

      {/* Mobile Right-Sidebar Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[998] md:hidden bg-obsidian-900/80 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.aside
              className="fixed top-0 right-0 bottom-0 z-[999] md:hidden w-72 bg-obsidian-800 border-l border-ember-400/20 flex flex-col"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-ember-400/10">
                <div>
                  <p className="font-display text-ember-300 text-sm font-bold tracking-widest">LAN Gaming</p>
                  <p className="font-mono text-ember-600 text-[10px] tracking-[0.4em]">2026 · CSF</p>
                </div>
                <button onClick={() => setMenuOpen(false)} className="text-zinc-600 hover:text-ember-300 transition-colors p-1" aria-label="Fermer">
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto py-2">
                {NAV_LINKS.map(({ to, label, icon: Icon, code }, i) => {
                  const isActive = location.pathname === to;
                  return (
                    <motion.div key={to} initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.07 + 0.05, type: 'spring', damping: 25 }}>
                      <Link to={to} className={`flex items-center justify-between px-6 py-4 border-b border-ember-400/10 transition-colors ${isActive ? 'bg-ember-600/10' : 'hover:bg-obsidian-700/40'}`}>
                        <div className="flex items-center gap-3">
                          <Icon size={16} className={isActive ? 'text-ember-300' : 'text-ember-600'} />
                          <span className={`font-body font-semibold text-base tracking-widest uppercase ${isActive ? 'text-ember-200' : 'text-zinc-300'}`}>{label}</span>
                        </div>
                        <span className="font-mono text-ember-700 text-[10px]">[{code}]</span>
                      </Link>
                    </motion.div>
                  );
                })}
                {isAdmin && (
                  <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-6 py-4 border-b border-ember-400/20 bg-ember-400/5 hover:bg-ember-400/10 transition-colors">
                    <Shield size={16} className="text-ember-400" />
                    <span className="font-body font-semibold text-base tracking-widest uppercase text-ember-300">Admin</span>
                  </Link>
                )}
              </nav>

              <div className="p-5 border-t border-ember-400/10 space-y-2.5">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-2.5">
                      {user.picture ? (
                        <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 clip-hex bg-ember-400/20 border border-ember-400/40 flex items-center justify-center">
                          <span className="font-mono text-ember-300 text-xs font-bold">{user.name?.[0] || 'A'}</span>
                        </div>
                      )}
                      <div>
                        <p className="font-body text-zinc-300 text-sm">{user.name}</p>
                        <p className="font-mono text-ember-600 text-[9px] tracking-widest uppercase">{user.role}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { logout(); setMenuOpen(false); }}
                      className="flex items-center gap-3 px-4 py-2.5 w-full border border-red-500/20 hover:border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut size={14} />
                      <span className="font-body text-sm">Déconnexion</span>
                    </button>
                  </>
                ) : (
                  <>
                    <p className="font-mono text-zinc-700 text-[9px] tracking-[0.4em] uppercase mb-3">Connexion Admin</p>
                    <button
                      onClick={() => { setMenuOpen(false); setLoginOpen(true); }}
                      className="flex items-center gap-3 px-4 py-2.5 border border-zinc-800 hover:border-zinc-600 transition-colors w-full"
                    >
                      <GoogleIcon />
                      <span className="font-body text-zinc-400 text-sm">Continuer avec Google</span>
                    </button>
                    <button
                      onClick={() => { setMenuOpen(false); setLoginOpen(true); }}
                      className="flex items-center gap-3 px-4 py-2.5 border border-zinc-800 hover:border-zinc-600 transition-colors w-full"
                    >
                      <MicrosoftIcon />
                      <span className="font-body text-zinc-400 text-sm">Continuer avec Microsoft</span>
                    </button>
                  </>
                )}
                <div className="pt-2">
                  <Link to="/billetterie" onClick={() => setMenuOpen(false)}>
                    <motion.div
                      className="py-3 clip-diagonal bg-ember-400 text-obsidian-900 font-display font-bold text-sm tracking-widest uppercase text-center"
                      whileTap={{ scale: 0.97 }}
                    >
                      Obtenir mes billets
                    </motion.div>
                  </Link>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <AnimatePresence>
        {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
