import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, ChevronDown, Zap } from 'lucide-react';

const QUICK_QUESTIONS = [
  "Quand a lieu l'événement?",
  'Prix des billets?',
  'Quels tournois?',
  'Où se déroule le LAN?',
];

// ── Holographic NEXUS avatar ─────────────────────────────────────────────────
function NexusAvatar({ isLoading, isSpeaking }) {
  const speed = isLoading ? 1.2 : isSpeaking ? 2 : 6;
  const pulseSpeed = isLoading ? 0.5 : isSpeaking ? 0.8 : 2.5;

  return (
    <div className="relative w-14 h-14 flex-shrink-0">
      {/* Outer orbit ring */}
      <motion.div
        className="absolute inset-0 rounded-full border border-ember-400/35"
        animate={{ rotate: 360 }}
        transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
      />
      {/* Inner orbit ring (opposite) */}
      <motion.div
        className="absolute inset-1.5 rounded-full border border-ember-300/20"
        animate={{ rotate: -360 }}
        transition={{ duration: speed * 0.7, repeat: Infinity, ease: 'linear' }}
      />
      {/* Dashed scan ring */}
      <motion.div
        className="absolute inset-3 rounded-full"
        style={{ border: '1px dashed rgba(200,155,60,0.25)' }}
        animate={{ rotate: 360 }}
        transition={{ duration: speed * 1.8, repeat: Infinity, ease: 'linear' }}
      />
      {/* Central core */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="w-6 h-6 clip-hex bg-gradient-to-br from-obsidian-800 to-obsidian-900 border border-ember-400/60 flex items-center justify-center"
          animate={{ scale: isLoading ? [1, 1.18, 1] : isSpeaking ? [1, 1.1, 1] : 1 }}
          transition={{ duration: pulseSpeed, repeat: Infinity }}
        >
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-ember-300"
            animate={{
              boxShadow: isLoading
                ? ['0 0 3px #C89B3C', '0 0 18px #FFD700', '0 0 3px #C89B3C']
                : isSpeaking
                  ? ['0 0 4px #C89B3C', '0 0 12px #FFD700', '0 0 4px #C89B3C']
                  : ['0 0 4px #C89B3C', '0 0 7px #C89B3C', '0 0 4px #C89B3C'],
            }}
            transition={{ duration: pulseSpeed, repeat: Infinity }}
          />
        </motion.div>
      </div>
      {/* Horizontal scan line */}
      <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
        <motion.div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-ember-400/40 to-transparent"
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: isLoading ? 0.9 : 2.5, repeat: Infinity, ease: 'linear' }}
        />
      </div>
      {/* Orbit dot */}
      <motion.div
        className="absolute"
        style={{ top: '50%', left: '50%', width: 0, height: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: speed * 0.5, repeat: Infinity, ease: 'linear' }}
      >
        <div
          className="absolute w-1.5 h-1.5 rounded-full bg-ember-400"
          style={{
            top: -22, left: -3,
            boxShadow: '0 0 6px #C89B3C, 0 0 12px #C89B3C40',
          }}
        />
      </motion.div>
    </div>
  );
}

// ── Waveform bars (speaking animation) ───────────────────────────────────────
function WaveformBars({ active }) {
  return (
    <div className="flex items-center gap-0.5 h-4">
      {[0.4, 0.7, 1, 0.85, 0.6, 0.9, 0.5].map((h, i) => (
        <motion.div
          key={i}
          className="w-0.5 rounded-full bg-ember-400"
          animate={active
            ? { height: [`${h * 16}px`, `${Math.random() * 14 + 2}px`, `${h * 16}px`] }
            : { height: '2px' }
          }
          transition={{ duration: 0.4 + i * 0.07, repeat: Infinity, ease: 'easeInOut', delay: i * 0.06 }}
        />
      ))}
    </div>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────
function Message({ msg }) {
  const isBot = msg.sender === 'bot';
  return (
    <motion.div
      initial={{ opacity: 0, x: isBot ? -12 : 12, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
      className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-2.5`}
    >
      <div
        style={{
          maxWidth: '82%',
          padding: '8px 12px',
          fontSize: 11,
          lineHeight: 1.6,
          fontFamily: 'var(--font-body, sans-serif)',
          background: isBot
            ? 'linear-gradient(135deg, rgba(10,14,28,0.95), rgba(15,20,38,0.9))'
            : 'linear-gradient(135deg, rgba(200,155,60,0.18), rgba(200,155,60,0.08))',
          border: isBot
            ? '1px solid rgba(200,155,60,0.12)'
            : '1px solid rgba(200,155,60,0.45)',
          color: isBot ? 'rgba(212,212,216,0.95)' : 'rgba(255,243,200,0.95)',
          clipPath: isBot
            ? 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
            : 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
          boxShadow: isBot
            ? 'inset 0 0 20px rgba(0,0,0,0.3)'
            : '0 0 16px rgba(200,155,60,0.08)',
        }}
      >
        {msg.text}
        {/* Blinking cursor while streaming */}
        {msg.streaming && (
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.7, repeat: Infinity }}
            style={{ color: '#C89B3C', marginLeft: 2 }}
          >▌</motion.span>
        )}
      </div>
    </motion.div>
  );
}

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-ember-400"
          animate={{ opacity: [0.2, 1, 0.2], y: [0, -5, 0] }}
          transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.14 }}
          style={{ boxShadow: '0 0 6px rgba(200,155,60,0.8)' }}
        />
      ))}
    </div>
  );
}

// ── Main Chatbot ──────────────────────────────────────────────────────────────
export default function Chatbot() {
  const [isOpen, setIsOpen]       = useState(false);
  const [messages, setMessages]   = useState([
    { sender: 'bot', text: 'NEXUS en ligne. Joueur, quelle est ta question sur LAN Gaming 2026?' },
  ]);
  const [input, setInput]         = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasNew, setHasNew]       = useState(false);
  const [glitch, setGlitch]       = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setHasNew(false);
      setTimeout(() => inputRef.current?.focus(), 320);
    }
  }, [isOpen]);

  const sendMessage = useCallback(async (text) => {
    const msg = text || input.trim();
    if (!msg || isLoading) return;
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: msg }]);
    setIsLoading(true);

    // Placeholder streaming message
    setMessages((prev) => [...prev, { sender: 'bot', text: '', streaming: true }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: msg }),
      });

      if (!res.ok || !res.body) throw new Error('no_stream');

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let   buffer  = '';
      let   accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep incomplete last line

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6).trim();
          if (payload === '[DONE]') {
            // Glitch flash + speaking animation on completion
            setGlitch(true);
            setTimeout(() => setGlitch(false), 120);
            setIsSpeaking(true);
            setTimeout(() => setIsSpeaking(false), 2200);
            if (!isOpen) setHasNew(true);
            break;
          }
          try {
            const { text: chunk } = JSON.parse(payload);
            if (chunk) {
              accumulated += chunk;
              setMessages((prev) => {
                const next = [...prev];
                next[next.length - 1] = { sender: 'bot', text: accumulated, streaming: true };
                return next;
              });
            }
          } catch {}
        }
      }

      // Finalize — remove streaming cursor
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = { sender: 'bot', text: accumulated || 'Erreur de connexion à NEXUS.', streaming: false };
        return next;
      });
    } catch {
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = { sender: 'bot', text: 'Signal perdu. Contacte-nous à comiteetuinfo@cegepstfe.ca.', streaming: false };
        return next;
      });
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, isOpen]);

  return (
    <div className="fixed bottom-5 right-5 z-[9000] flex flex-col items-end gap-3">
      {/* ── Chat panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 16 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            style={{
              width: 360,
              background: 'linear-gradient(160deg, rgba(3,5,16,0.98) 0%, rgba(5,8,22,0.97) 100%)',
              border: '1px solid rgba(200,155,60,0.25)',
              boxShadow: '0 0 60px rgba(200,155,60,0.12), 0 30px 80px rgba(0,0,0,0.85)',
              clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))',
              overflow: 'hidden',
            }}
          >
            {/* Animated background scanlines */}
            <div
              style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                backgroundImage: 'repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(200,155,60,0.02) 3px, rgba(200,155,60,0.02) 4px)',
                zIndex: 0,
              }}
            />

            {/* ── Header with avatar ── */}
            <motion.div
              animate={glitch ? { x: [-2, 2, -1, 0], filter: ['none', 'hue-rotate(20deg)', 'none'] } : {}}
              transition={{ duration: 0.1 }}
              style={{
                position: 'relative', zIndex: 1,
                padding: '12px 14px',
                background: 'linear-gradient(90deg, rgba(200,155,60,0.06) 0%, transparent 100%)',
                borderBottom: '1px solid rgba(200,155,60,0.15)',
                display: 'flex', alignItems: 'center', gap: 12,
              }}
            >
              <NexusAvatar isLoading={isLoading} isSpeaking={isSpeaking} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontFamily: 'monospace', color: '#C89B3C', fontSize: 13, fontWeight: 700, letterSpacing: '0.2em' }}>
                    NEXUS
                  </span>
                  <motion.span
                    style={{ fontFamily: 'monospace', fontSize: 8, color: '#10B981', letterSpacing: '0.3em', textTransform: 'uppercase' }}
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ● EN LIGNE
                  </motion.span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <WaveformBars active={isLoading || isSpeaking} />
                  <span style={{ fontFamily: 'monospace', fontSize: 8, color: 'rgba(113,113,122,0.8)', letterSpacing: '0.25em' }}>
                    {isLoading ? 'TRAITEMENT...' : isSpeaking ? 'RÉPONSE' : 'LAN 2026 AI'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                style={{ color: 'rgba(113,113,122,0.7)', padding: 4, transition: 'color 0.2s' }}
                onMouseEnter={(e) => e.target.style.color = '#C89B3C'}
                onMouseLeave={(e) => e.target.style.color = 'rgba(113,113,122,0.7)'}
              >
                <X size={14} />
              </button>
            </motion.div>

            {/* ── Messages ── */}
            <div
              style={{
                position: 'relative', zIndex: 1,
                height: 280, overflowY: 'auto',
                padding: '12px 12px 6px',
              }}
              className="scrollbar-thin scrollbar-thumb-ember-400/20 scrollbar-track-transparent"
            >
              {messages.map((m, i) => <Message key={i} msg={m} />)}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex mb-2.5"
                >
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(10,14,28,0.95), rgba(15,20,38,0.9))',
                    border: '1px solid rgba(200,155,60,0.12)',
                    clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
                  }}>
                    <TypingDots />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ── Quick questions ── */}
            <AnimatePresence>
              {messages.length <= 1 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ position: 'relative', zIndex: 1, padding: '0 12px 8px' }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {QUICK_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        style={{
                          fontFamily: 'monospace', fontSize: 9, padding: '4px 8px',
                          border: '1px solid rgba(113,113,122,0.3)',
                          color: 'rgba(113,113,122,0.9)', background: 'transparent',
                          letterSpacing: '0.05em', cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.borderColor = 'rgba(200,155,60,0.5)';
                          e.target.style.color = '#C89B3C';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.borderColor = 'rgba(113,113,122,0.3)';
                          e.target.style.color = 'rgba(113,113,122,0.9)';
                        }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Input ── */}
            <div style={{
              position: 'relative', zIndex: 1,
              borderTop: '1px solid rgba(200,155,60,0.1)',
              padding: '10px 12px 12px',
              display: 'flex', gap: 8,
            }}>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Envoie ta question..."
                maxLength={500}
                style={{
                  flex: 1, minWidth: 0,
                  background: 'rgba(5,8,20,0.9)',
                  border: '1px solid rgba(200,155,60,0.2)',
                  color: 'white', fontSize: 11,
                  padding: '8px 12px', outline: 'none',
                  fontFamily: 'monospace',
                  letterSpacing: '0.03em',
                  clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(200,155,60,0.5)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(200,155,60,0.2)'}
              />
              <motion.button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                style={{
                  width: 36, height: 36, flexShrink: 0,
                  background: 'rgba(200,155,60,1)',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
                  opacity: (!input.trim() || isLoading) ? 0.3 : 1,
                }}
                whileTap={{ scale: 0.92 }}
              >
                <Send size={13} color="#030508" />
              </motion.button>
            </div>

            {/* Footer */}
            <div style={{
              position: 'relative', zIndex: 1,
              textAlign: 'center', padding: '0 12px 10px',
              fontFamily: 'monospace', fontSize: 8,
              color: 'rgba(39,39,42,0.9)', letterSpacing: '0.3em',
              textTransform: 'uppercase',
            }}>
              LAN Gaming 2026 · IA Support System
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toggle button ── */}
      <motion.button
        onClick={() => setIsOpen((o) => !o)}
        style={{
          position: 'relative',
          width: 56, height: 56,
          background: isOpen
            ? 'linear-gradient(135deg, #030508, #07090F)'
            : 'linear-gradient(135deg, #C89B3C, #FFD700)',
          border: isOpen ? '1px solid rgba(200,155,60,0.4)' : 'none',
          clipPath: 'polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        animate={{
          boxShadow: isOpen
            ? '0 0 0px rgba(200,155,60,0)'
            : [
              '0 0 12px rgba(200,155,60,0.35)',
              '0 0 28px rgba(200,155,60,0.65)',
              '0 0 12px rgba(200,155,60,0.35)',
            ],
        }}
        transition={{ duration: 2.2, repeat: isOpen ? 0 : Infinity }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <ChevronDown size={20} color={isOpen ? '#C89B3C' : '#030508'} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <Zap size={20} color="#030508" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* New message dot */}
        <AnimatePresence>
          {hasNew && !isOpen && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              style={{
                position: 'absolute', top: -3, right: -3,
                width: 13, height: 13, borderRadius: '50%',
                background: '#EF4444',
                border: '2px solid #030508',
              }}
            />
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
