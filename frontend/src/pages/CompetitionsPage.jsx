import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Bounds } from '@react-three/drei';
import * as THREE from 'three';
import { io } from 'socket.io-client';
import {
  Trophy, RefreshCw, Swords, Crown, Shield,
  AlertCircle, CheckCircle, Clock, X, ZoomIn, ZoomOut, Maximize2,
} from 'lucide-react';
import { pageTransition, fadeInUp, staggerContainer } from '../utils/animations.js';
import {
  getTournaments, getTournament, registerTeam,
  generateBracket, updateMatchScore, resetTournament,
} from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import WebGLErrorBoundary from '../components/layout/WebGLErrorBoundary.jsx';
import { DominusModel, OctaneModel } from '../components/three/GameAssets.jsx';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// ── Game metadata ──────────────────────────────────────────────────────────────
const GAME_META = {
  lol:          { name: 'League of Legends',   short: 'LoL',     icon: '⚔️',  color: '#C89B3C' },
  cs2:          { name: 'Counter-Strike 2',    short: 'CS2',     icon: '🔫',  color: '#FF4655' },
  rocket_league:{ name: 'Rocket League',       short: 'RL',      icon: '🚀',  color: '#4FC3F7' },
  magic_tg:     { name: 'Magic: The Gathering',short: 'Magic',   icon: '🃏',  color: '#9B59B6' },
  smash_bros:   { name: 'Super Smash Bros',    short: 'Smash',   icon: '👊',  color: '#FFD700' },
  mario_kart:   { name: 'Mario Kart',          short: 'Mario K.',icon: '🏎️', color: '#27AE60' },
};

// ── Bracket layout constants ───────────────────────────────────────────────────
const CW   = 224;   // card width
const CH   = 88;    // card height
const SLOT = 112;   // vertical slot per match (card + gap)
const CGAP = 86;    // horizontal gap between columns (connector zone)
const PAD  = 44;    // bracket padding
const LH   = 48;    // label header height above cards

function getRoundName(ri, total) {
  const n = total - ri;
  if (n === 1) return 'Finale';
  if (n === 2) return 'Demi-Finale';
  if (n === 3) return 'Quart de Finale';
  if (n === 4) return '8ème de Finale';
  if (n === 5) return '16ème de Finale';
  return `Round ${ri + 1}`;
}

function computePositions(rounds) {
  const pos = {};
  if (!rounds?.length) return pos;
  const yBase = PAD + LH;
  rounds[0].matches.forEach((m, i) => {
    const y = yBase + i * SLOT;
    pos[m.id] = { x: PAD, y, cy: y + CH / 2 };
  });
  for (let ri = 1; ri < rounds.length; ri++) {
    const prev = rounds[ri - 1];
    rounds[ri].matches.forEach((m, i) => {
      const pa = prev.matches[2 * i];
      const pb = prev.matches[2 * i + 1];
      const ya = pa && pos[pa.id] ? pos[pa.id].cy : yBase + CH / 2;
      const yb = pb && pos[pb.id] ? pos[pb.id].cy : yBase + CH / 2;
      const cy = (ya + yb) / 2;
      pos[m.id] = { x: PAD + ri * (CW + CGAP), y: cy - CH / 2, cy };
    });
  }
  return pos;
}

function bracketSize(rounds) {
  if (!rounds?.length) return { w: 400, h: 300 };
  const nr = rounds.length;
  const r1 = rounds[0].matches.length;
  return {
    w: PAD * 2 + nr * CW + (nr - 1) * CGAP,
    h: PAD + LH + r1 * SLOT - (SLOT - CH) + PAD,
  };
}

// ── TeamRow ────────────────────────────────────────────────────────────────────
function TeamRow({ team, score, isWinner, color }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '7px 12px', minHeight: 33,
      background: isWinner ? `${color}14` : 'transparent',
      transition: 'background 0.2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
        {isWinner && (
          <div style={{
            width: 4, height: 4, borderRadius: '50%', flexShrink: 0,
            background: color, boxShadow: `0 0 6px ${color}, 0 0 12px ${color}60`,
          }} />
        )}
        <span style={{
          fontFamily: 'Rajdhani, sans-serif',
          fontWeight: isWinner ? 700 : 500,
          fontSize: 13,
          color: isWinner ? '#fff' : '#4a4a5e',
          textShadow: isWinner ? `0 0 10px ${color}60` : 'none',
          letterSpacing: '0.02em',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          transition: 'color 0.2s',
        }}>
          {team ? team.name : <span style={{ color: '#22222e', fontStyle: 'italic', fontSize: 11 }}>À déterminer</span>}
        </span>
      </div>
      <span style={{
        fontFamily: 'Share Tech Mono, monospace', fontSize: 15, fontWeight: 'bold',
        color: isWinner ? '#FFD700' : '#1e1e2a',
        textShadow: isWinner ? '0 0 10px rgba(255,215,0,0.7)' : 'none',
        marginLeft: 8, minWidth: 24, textAlign: 'right', flexShrink: 0,
        transition: 'color 0.2s, text-shadow 0.2s',
      }}>
        {typeof score === 'number' ? score : '—'}
      </span>
    </div>
  );
}

// ── MatchCard ──────────────────────────────────────────────────────────────────
function MatchCard({ match, color, pos, isAdmin, onEdit }) {
  const [hov, setHov] = useState(false);
  const { team1, team2, score1, score2, winner, status } = match;
  const isWin1 = winner?.id === team1?.id;
  const isWin2 = winner?.id === team2?.id;
  const done = status === 'completed';
  const canEdit = isAdmin && status === 'pending' && team1 && team2;

  return (
    <div
      style={{
        position: 'absolute', left: pos.x, top: pos.y,
        width: CW, height: CH, zIndex: hov ? 10 : 1,
        cursor: canEdit ? 'pointer' : 'default',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => canEdit && onEdit(match)}
    >
      {/* Glow border */}
      <div style={{
        position: 'absolute', inset: -1, pointerEvents: 'none',
        border: `1px solid ${done ? color + 'AA' : hov && canEdit ? color + '40' : 'rgba(255,255,255,0.06)'}`,
        boxShadow: done
          ? `0 0 10px ${color}40, 0 0 22px ${color}20, 0 0 44px ${color}0A`
          : hov && canEdit
            ? `0 0 8px ${color}20`
            : 'none',
        transition: 'box-shadow 0.3s, border-color 0.3s',
      }} />

      {/* Body */}
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden',
        background: 'linear-gradient(145deg, rgba(3,5,16,0.99) 0%, rgba(5,8,20,0.97) 100%)',
      }}>
        {/* Scanlines */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
          backgroundImage: 'repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 4px)',
        }} />

        {/* Top accent */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 1, zIndex: 3,
          background: `linear-gradient(90deg, transparent, ${color}${done ? 'CC' : '35'}, transparent)`,
          transition: 'opacity 0.3s',
        }} />

        {/* Header */}
        <div style={{
          position: 'relative', zIndex: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '4px 10px 3px',
          borderBottom: `1px solid ${done ? color + '1A' : 'rgba(255,255,255,0.04)'}`,
          background: `${color}0A`,
        }}>
          <span style={{
            fontFamily: 'Share Tech Mono, monospace', fontSize: 8,
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: done ? color : '#252535',
          }}>
            R{match.roundNumber} · M{match.matchNumber}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {done && <CheckCircle size={9} color={color} />}
            {!done && team1 && team2 && <Clock size={9} color="#252535" />}
            {canEdit && hov && (
              <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 7, color, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                éditer
              </span>
            )}
          </div>
        </div>

        {/* Teams */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          {!team1 && !team2 ? (
            <div style={{
              textAlign: 'center', padding: '13px 0',
              fontFamily: 'Share Tech Mono, monospace', fontSize: 8,
              color: '#181826', letterSpacing: '0.3em', textTransform: 'uppercase',
            }}>
              En attente
            </div>
          ) : (
            <>
              <TeamRow team={team1} score={score1} isWinner={isWin1} color={color} />
              <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', margin: '0 12px' }} />
              <TeamRow team={team2} score={score2} isWinner={isWin2} color={color} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── SVG Connectors ─────────────────────────────────────────────────────────────
function BracketSVG({ rounds, positions, color, w, h }) {
  const lines = [];
  for (let ri = 1; ri < rounds.length; ri++) {
    const prev = rounds[ri - 1];
    rounds[ri].matches.forEach((m, i) => {
      const to = positions[m.id];
      if (!to) return;
      [prev.matches[2 * i], prev.matches[2 * i + 1]].forEach(src => {
        if (!src || !positions[src.id]) return;
        const from = positions[src.id];
        const sx = from.x + CW, sy = from.cy;
        const ex = to.x, ey = to.cy;
        const mx = sx + CGAP / 2;
        const done = src.status === 'completed';
        lines.push({ key: `${src.id}-${m.id}`, sx, sy, mx, ey, ex, done });
      });
    });
  }

  return (
    <svg
      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', overflow: 'visible' }}
      width={w} height={h}
    >
      <defs>
        <filter id="ln-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {lines.map(l => (
        <g key={l.key}>
          {l.done && (
            <path d={`M${l.sx} ${l.sy} H${l.mx} V${l.ey} H${l.ex}`}
              fill="none" stroke={color} strokeWidth={3} opacity={0.22} filter="url(#ln-glow)" />
          )}
          <path d={`M${l.sx} ${l.sy} H${l.mx} V${l.ey} H${l.ex}`}
            fill="none"
            stroke={l.done ? color : '#161624'}
            strokeWidth={l.done ? 1.5 : 0.8}
            opacity={l.done ? 0.85 : 0.8}
          />
        </g>
      ))}
    </svg>
  );
}

// ── Bracket 2D Canvas (pan + zoom) ────────────────────────────────────────────
function BracketCanvas({ rounds, color, isAdmin, onEditMatch }) {
  const containerRef = useRef();
  const [tf, setTf] = useState({ x: 0, y: 0, scale: 1 });
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const pos = computePositions(rounds);
  const { w: bW, h: bH } = bracketSize(rounds);

  const fitView = useCallback(() => {
    const el = containerRef.current;
    if (!el || !rounds?.length) return;
    const cW = el.clientWidth, cH = el.clientHeight;
    const sc = Math.min(1, Math.min(cW / bW, cH / bH) * 0.88);
    setTf({
      scale: sc,
      x: Math.max(0, (cW - bW * sc) / 2),
      y: Math.max(0, (cH - bH * sc) / 2),
    });
  }, [rounds, bW, bH]);

  useEffect(() => { fitView(); }, [fitView]);

  // Wheel zoom toward cursor
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      const f = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      setTf(t => {
        const s = Math.max(0.18, Math.min(3.5, t.scale * f));
        const sf = s / t.scale;
        return { scale: s, x: mx - sf * (mx - t.x), y: my - sf * (my - t.y) };
      });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // Global mouse drag
  useEffect(() => {
    const move = (e) => {
      if (!dragging.current) return;
      setTf(t => ({ ...t, x: t.x + e.clientX - last.current.x, y: t.y + e.clientY - last.current.y }));
      last.current = { x: e.clientX, y: e.clientY };
    };
    const up = () => {
      dragging.current = false;
      if (containerRef.current) containerRef.current.style.cursor = 'grab';
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, []);

  const zoomBtn = (icon, fn) => (
    <button
      onClick={fn}
      style={{
        width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(3,5,16,0.92)', border: `1px solid ${color}30`, color, cursor: 'pointer',
        transition: 'background 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = `${color}18`; e.currentTarget.style.boxShadow = `0 0 10px ${color}40`; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(3,5,16,0.92)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {icon}
    </button>
  );

  return (
    <div style={{ position: 'relative' }}>
      {/* Controls */}
      <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 20, display: 'flex', gap: 5 }}>
        {zoomBtn(<ZoomIn size={13} />, () => setTf(t => ({ ...t, scale: Math.min(3.5, t.scale * 1.2) })))}
        {zoomBtn(<ZoomOut size={13} />, () => setTf(t => ({ ...t, scale: Math.max(0.18, t.scale / 1.2) })))}
        {zoomBtn(<Maximize2 size={13} />, fitView)}
      </div>

      {/* Scale indicator */}
      <div style={{
        position: 'absolute', bottom: 36, right: 12, zIndex: 20,
        fontFamily: 'Share Tech Mono, monospace', fontSize: 8,
        color: `${color}60`, letterSpacing: '0.2em',
      }}>
        {Math.round(tf.scale * 100)}%
      </div>

      {/* Viewport */}
      <div
        ref={containerRef}
        data-lenis-prevent
        style={{
          position: 'relative', height: 700, overflow: 'hidden',
          cursor: 'grab', userSelect: 'none',
          background: '#020408',
          border: `1px solid ${color}18`,
          boxShadow: `inset 0 0 80px rgba(0,0,0,0.95), 0 0 40px rgba(0,0,0,0.6)`,
        }}
        onMouseDown={(e) => {
          if (e.button !== 0) return;
          dragging.current = true;
          last.current = { x: e.clientX, y: e.clientY };
          e.currentTarget.style.cursor = 'grabbing';
        }}
      >
        {/* Animated grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
          backgroundImage: `linear-gradient(${color}06 1px, transparent 1px), linear-gradient(90deg, ${color}06 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          transform: `translate(${((tf.x % 50) + 50) % 50}px, ${((tf.y % 50) + 50) % 50}px)`,
        }} />

        {/* Corner glows */}
        <div style={{ position: 'absolute', top: -60, left: -60, width: 200, height: 200, pointerEvents: 'none', zIndex: 0, background: `radial-gradient(circle, ${color}08 0%, transparent 70%)` }} />
        <div style={{ position: 'absolute', bottom: -60, right: -60, width: 200, height: 200, pointerEvents: 'none', zIndex: 0, background: `radial-gradient(circle, ${color}06 0%, transparent 70%)` }} />

        {/* Vignette */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(2,4,8,0.75) 100%)',
        }} />

        {/* Bracket content */}
        <div style={{
          position: 'absolute', top: 0, left: 0, zIndex: 2,
          transformOrigin: '0 0',
          transform: `translate(${tf.x}px,${tf.y}px) scale(${tf.scale})`,
          width: bW, height: bH,
        }}>
          {/* Round labels */}
          {rounds.map((_, ri) => (
            <div key={ri} style={{
              position: 'absolute', left: PAD + ri * (CW + CGAP), top: PAD,
              width: CW, textAlign: 'center', pointerEvents: 'none',
            }}>
              <span style={{
                fontFamily: 'Cinzel, serif', fontSize: 9,
                letterSpacing: '0.35em', textTransform: 'uppercase',
                color, textShadow: `0 0 12px ${color}90, 0 0 24px ${color}50`,
              }}>
                {getRoundName(ri, rounds.length)}
              </span>
              <div style={{
                width: '75%', height: 1, margin: '5px auto 0',
                background: `linear-gradient(90deg, transparent, ${color}70, transparent)`,
              }} />
            </div>
          ))}

          {/* Connectors */}
          <BracketSVG rounds={rounds} positions={pos} color={color} w={bW} h={bH} />

          {/* Cards */}
          {rounds.flatMap(r =>
            r.matches.map(m => {
              const p = pos[m.id];
              if (!p) return null;
              return (
                <MatchCard key={m.id} match={m} color={color} pos={p} isAdmin={isAdmin} onEdit={onEditMatch} />
              );
            })
          )}
        </div>
      </div>

      {/* Hint bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20,
        padding: '7px 0 2px',
        fontFamily: 'Share Tech Mono, monospace', fontSize: 8,
        letterSpacing: '0.22em', textTransform: 'uppercase', color: '#1e1e2e',
      }}>
        <span>Molette = zoom</span>
        <span style={{ color: '#141420' }}>·</span>
        <span>Clic-glisser = déplacer</span>
        <span style={{ color: '#141420' }}>·</span>
        <span>⊡ = réinitialiser vue</span>
      </div>
    </div>
  );
}

// ── Admin Score Modal ──────────────────────────────────────────────────────────
function AdminScoreModal({ match, game, onClose, onSave }) {
  const [s1, setS1] = useState('');
  const [s2, setS2] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  const handleSave = async () => {
    const n1 = parseInt(s1, 10), n2 = parseInt(s2, 10);
    if (isNaN(n1) || isNaN(n2) || n1 === n2)
      return setErr('Les scores doivent être différents et numériques.');
    setSaving(true); setErr(null);
    try {
      await updateMatchScore(match.id, { game, score1: n1, score2: n2 });
      onSave(); onClose();
    } catch (e) { setErr(e.message); }
    finally { setSaving(false); }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-obsidian-900/85 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="w-full max-w-sm bg-obsidian-800 border border-ember-400/30 p-6"
        initial={{ scale: 0.92, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, y: 20, opacity: 0 }}
        style={{ clipPath: 'polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,14px 100%,0 calc(100% - 14px))' }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="font-mono text-ember-500 text-[10px] tracking-widest uppercase">Admin — Saisie de score</p>
            <p className="font-display text-white text-sm font-bold mt-0.5">Round {match.roundNumber} · Match {match.matchNumber}</p>
          </div>
          <button onClick={onClose} className="text-zinc-600 hover:text-white transition-colors"><X size={16} /></button>
        </div>
        <div className="space-y-3 mb-5">
          {[{ label: match.team1?.name ?? 'Équipe 1', val: s1, set: setS1 }, { label: match.team2?.name ?? 'Équipe 2', val: s2, set: setS2 }].map(({ label, val, set }) => (
            <div key={label}>
              <label className="font-mono text-zinc-500 text-[10px] tracking-widest uppercase block mb-1.5">{label}</label>
              <input type="number" min="0" value={val} onChange={e => set(e.target.value)} placeholder="0"
                className="w-full bg-obsidian-900 border border-zinc-800 focus:border-ember-400/60 text-white text-sm px-3 py-2 outline-none font-mono"
                style={{ clipPath: 'polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px))' }}
              />
            </div>
          ))}
        </div>
        {err && (
          <div className="flex items-center gap-2 text-red-400 font-mono text-[10px] bg-red-500/10 border border-red-500/20 px-3 py-2 mb-4">
            <AlertCircle size={11} /> {err}
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-zinc-800 text-zinc-500 font-mono text-xs tracking-widest uppercase hover:border-zinc-600 transition-colors">Annuler</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-ember-400 text-obsidian-900 font-display font-bold text-xs tracking-widest uppercase disabled:opacity-50 clip-diagonal">
            {saving ? '...' : 'Enregistrer'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── BracketView ────────────────────────────────────────────────────────────────
function BracketView({ game, tournament, onRefresh, isAdmin }) {
  const [editingMatch, setEditingMatch] = useState(null);
  const meta = GAME_META[game] || {};
  const color = meta.color || '#C89B3C';

  const winner = (() => {
    if (!tournament?.rounds?.length) return null;
    const last = tournament.rounds[tournament.rounds.length - 1];
    return last?.matches?.[0]?.winner ?? null;
  })();

  if (!tournament?.generated) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Swords size={40} className="text-zinc-800 mb-5" />
        <p className="font-display text-white text-lg font-bold mb-2">Bracket pas encore généré</p>
        <p className="font-body text-zinc-600 text-sm max-w-xs">Les équipes s'inscrivent. L'admin générera le bracket une fois les inscriptions fermées.</p>
      </div>
    );
  }

  return (
    <div>
      {winner && (
        <motion.div
          className="mb-4 p-3 flex items-center justify-center gap-3 border"
          style={{ borderColor: `${color}50`, background: `${color}08` }}
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        >
          <Crown size={16} style={{ color }} />
          <p className="font-display font-black text-white tracking-widest uppercase text-sm">
            Champion : <span style={{ color }}>{winner.name}</span>
          </p>
        </motion.div>
      )}

      <BracketCanvas
        rounds={tournament.rounds}
        color={color}
        isAdmin={isAdmin}
        onEditMatch={setEditingMatch}
      />

      <AnimatePresence>
        {editingMatch && (
          <AdminScoreModal
            match={editingMatch} game={game}
            onClose={() => setEditingMatch(null)} onSave={onRefresh}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Team Registration Panel ────────────────────────────────────────────────────
function TeamRegPanel({ game, onRegistered }) {
  const { user } = useAuth();
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState(null);

  if (!user) return null;
  if (done) return (
    <div className="flex items-center gap-2 px-4 py-3 border border-green-500/30 bg-green-500/5 text-green-400 font-mono text-xs">
      <CheckCircle size={13} /> Équipe inscrite ! En attente de la génération du bracket par l'admin.
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    setLoading(true); setErr(null);
    try { await registerTeam({ game, teamName: teamName.trim() }); setDone(true); onRegistered(); }
    catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3">
      <input
        type="text" value={teamName} onChange={e => setTeamName(e.target.value)}
        placeholder="Nom de ton équipe" maxLength={50}
        className="flex-1 bg-obsidian-900 border border-zinc-800 focus:border-ember-400/60 text-white text-sm px-3 py-2 outline-none font-body placeholder-zinc-700"
        style={{ clipPath: 'polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px))' }}
      />
      <motion.button type="submit" disabled={loading || !teamName.trim()}
        className="px-5 py-2 clip-diagonal bg-ember-400 text-obsidian-900 font-display font-bold text-xs tracking-widest uppercase disabled:opacity-50 whitespace-nowrap"
        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
        {loading ? '...' : '+ Inscrire'}
      </motion.button>
      {err && <p className="font-mono text-red-400 text-[10px] absolute">{err}</p>}
    </form>
  );
}

// ── Game Selector Card ─────────────────────────────────────────────────────────
function GameCard({ game, info, isSelected, onClick }) {
  const meta = GAME_META[game] || {};
  const color = meta.color || '#C89B3C';
  const label = info.generated ? 'Bracket actif' : `${info.teamsCount} équipe${info.teamsCount !== 1 ? 's' : ''}`;

  return (
    <motion.button
      className="relative text-left w-full p-4 border transition-all duration-200"
      style={{
        borderColor: isSelected ? color : 'rgba(255,255,255,0.06)',
        background: isSelected ? `${color}12` : 'rgba(5,7,18,0.7)',
        boxShadow: isSelected ? `0 0 20px ${color}25, inset 0 0 20px ${color}05` : 'none',
        clipPath: 'polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))',
      }}
      onClick={onClick} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
    >
      {isSelected && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 1,
          background: `linear-gradient(90deg, transparent, ${color}90, transparent)`,
        }} />
      )}
      <span className="text-2xl block mb-2">{meta.icon || '🎮'}</span>
      <p className="font-display font-bold text-white text-sm mb-0.5">{meta.short || game}</p>
      <p className="font-mono text-[9px] tracking-widest uppercase" style={{ color }}>
        {label}
      </p>
      {info.status === 'completed' && (
        <div className="absolute top-2 right-2"><Crown size={12} style={{ color }} /></div>
      )}
    </motion.button>
  );
}

// ── Admin Panel ────────────────────────────────────────────────────────────────
function AdminPanel({ game, tournament, onRefresh }) {
  const [generating, setGenerating] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [err, setErr] = useState(null);

  const handleGenerate = async () => {
    if (tournament.teams.length < 2) return setErr('Minimum 2 équipes requises.');
    setGenerating(true); setErr(null);
    try { await generateBracket(game); onRefresh(); }
    catch (e) { setErr(e.message); }
    finally { setGenerating(false); }
  };

  const handleReset = async () => {
    if (!window.confirm('Réinitialiser le bracket ? Tous les scores seront perdus.')) return;
    setResetting(true); setErr(null);
    try { await resetTournament(game); onRefresh(); }
    catch (e) { setErr(e.message); }
    finally { setResetting(false); }
  };

  return (
    <div className="border border-ember-400/20 bg-ember-400/5 p-4 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <Shield size={12} className="text-ember-400" />
        <p className="font-mono text-ember-500 text-[10px] tracking-widest uppercase">Panel Administrateur</p>
      </div>
      <p className="font-mono text-zinc-600 text-[9px] tracking-widest uppercase mb-3">
        {tournament.teams.length} équipe{tournament.teams.length !== 1 ? 's' : ''} inscrite{tournament.teams.length !== 1 ? 's' : ''}
      </p>
      {err && (
        <div className="flex items-center gap-2 text-red-400 font-mono text-[10px] bg-red-500/10 border border-red-500/20 px-3 py-2 mb-3">
          <AlertCircle size={11} /> {err}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {!tournament.generated ? (
          <motion.button onClick={handleGenerate} disabled={generating || tournament.teams.length < 2}
            className="flex items-center gap-2 px-4 py-2 bg-ember-400 text-obsidian-900 font-display font-bold text-xs tracking-widest uppercase clip-diagonal disabled:opacity-40"
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Swords size={12} /> {generating ? 'Génération...' : 'Générer le bracket'}
          </motion.button>
        ) : (
          <motion.button onClick={handleReset} disabled={resetting}
            className="flex items-center gap-2 px-4 py-2 border border-red-500/40 text-red-400 hover:bg-red-500/10 font-mono text-xs tracking-widest uppercase transition-colors"
            whileHover={{ scale: 1.02 }}>
            <RefreshCw size={12} /> {resetting ? '...' : 'Réinitialiser'}
          </motion.button>
        )}
        <motion.button onClick={onRefresh}
          className="flex items-center gap-1.5 px-3 py-2 border border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 font-mono text-xs tracking-widest uppercase transition-colors"
          whileHover={{ scale: 1.02 }}>
          <RefreshCw size={12} /> Rafraîchir
        </motion.button>
      </div>
      {tournament.teams.length > 0 && (
        <div className="mt-4 border-t border-ember-400/10 pt-3">
          <p className="font-mono text-zinc-600 text-[9px] tracking-widest uppercase mb-2">Équipes inscrites</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto">
            {tournament.teams.map(t => (
              <div key={t.id} className="font-mono text-zinc-400 text-[10px] px-2 py-1 border border-zinc-800/60 bg-obsidian-900/40 truncate">
                {t.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Scène 3D — Dominus contre Octane, duel dans l'arène ──────────────────────
function ArenaBattleScene() {
  const dominusRef = useRef();
  const octaneRef = useRef();
  const sparkRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (dominusRef.current) {
      dominusRef.current.position.y = -0.15 + Math.sin(t * 1.1) * 0.05;
      dominusRef.current.rotation.z = Math.sin(t * 0.8) * 0.04;
      dominusRef.current.rotation.x = Math.sin(t * 1.3) * 0.02;
    }
    if (octaneRef.current) {
      octaneRef.current.position.y = -0.15 + Math.sin(t * 1.1 + Math.PI) * 0.05;
      octaneRef.current.rotation.z = Math.sin(t * 0.8 + Math.PI) * 0.04;
      octaneRef.current.rotation.x = Math.sin(t * 1.3 + Math.PI) * 0.02;
    }
    if (sparkRef.current) {
      const pulse = 0.6 + Math.sin(t * 4) * 0.4;
      sparkRef.current.scale.setScalar(0.5 + pulse * 0.3);
      sparkRef.current.material.opacity = 0.35 + pulse * 0.4;
    }
  });

  return (
    <group>
      <group ref={dominusRef} position={[-1.1, -0.15, 0]} rotation={[0, Math.PI / 2 + 0.3, 0]}>
        <DominusModel />
      </group>
      <group ref={octaneRef} position={[1.1, -0.15, 0]} rotation={[0, -Math.PI / 2 - 0.3, 0]}>
        <OctaneModel />
      </group>
      <mesh ref={sparkRef} position={[0, -0.1, 0]}>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshBasicMaterial color="#FFD700" transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

function CompetitionsHero3D() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <WebGLErrorBoundary>
        <Canvas camera={{ fov: 45 }} dpr={[1, 1.5]} gl={{ alpha: true }}>
          <ambientLight intensity={1.3} />
          <pointLight position={[3, 2, 3]} intensity={3.4} color="#C89B3C" />
          <pointLight position={[-3, 1, 2]} intensity={2.4} color="#FF4655" />
          <pointLight position={[0, 2, -1]} intensity={1.6} color="#4FC3F7" />
          <pointLight position={[0, 1.5, 3]} intensity={1.8} color="#FFFFFF" />
          <Suspense fallback={null}>
            <Bounds fit clip observe margin={1.2}>
              <ArenaBattleScene />
            </Bounds>
          </Suspense>
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function CompetitionsPage() {
  const { user, isAdmin } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gameLoading, setGameLoading] = useState(false);

  const loadTournaments = useCallback(() => {
    getTournaments().then(r => setTournaments(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const loadTournament = useCallback((game) => {
    setGameLoading(true);
    getTournament(game).then(r => setTournament(r.data)).catch(() => setTournament(null)).finally(() => setGameLoading(false));
  }, []);

  useEffect(() => { loadTournaments(); }, [loadTournaments]);

  // ── Écoute les mises à jour de bracket en temps réel (admin → viewers) ──────
  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket'], reconnectionAttempts: 3 });
    socket.on('bracket-update', ({ game, data }) => {
      setTournaments(prev => prev.map(t => t.game === game ? { ...t, ...data } : t));
      setSelectedGame(prev => {
        if (prev === game) setTournament(data);
        return prev;
      });
    });
    return () => socket.disconnect();
  }, []);

  const handleSelectGame = (game) => { setSelectedGame(game); loadTournament(game); };
  const handleRefresh = () => { loadTournaments(); if (selectedGame) loadTournament(selectedGame); };

  const meta = selectedGame ? GAME_META[selectedGame] : null;
  const color = meta?.color || '#C89B3C';

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="min-h-screen pt-16 pb-20">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute inset-0 bg-obsidian-900" />
        {/* Neon grid */}
        <div className="absolute inset-0 opacity-[0.022]" style={{
          backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 48px,rgba(200,155,60,1) 48px,rgba(200,155,60,1) 49px),repeating-linear-gradient(90deg,transparent,transparent 48px,rgba(200,155,60,1) 48px,rgba(200,155,60,1) 49px)',
        }} />
        {/* Top neon bar */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(200,155,60,0.4),transparent)' }} />
      </div>

      {/* ── Hero 3D — Dominus vs Octane ─────────────────────────────────────── */}
      <div className="relative h-72 md:h-96 flex items-end overflow-hidden mb-10">
        <CompetitionsHero3D />
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian-900/40 via-transparent to-obsidian-900" />
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-8">
          <motion.p
            className="font-mono text-ember-500 text-xs tracking-[0.5em] uppercase mb-3"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          >
            [ Arène des tournois ]
          </motion.p>
          <motion.h1
            className="font-display text-5xl md:text-7xl font-black uppercase leading-none"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.7 }}
          >
            <span className="text-white">Entrez dans</span>{' '}
            <span style={{ WebkitTextFillColor: 'transparent', WebkitTextStroke: '2px #C89B3C' }}>
              l'arène
            </span>
          </motion.h1>
          <motion.p
            className="font-body text-zinc-500 text-sm max-w-lg mt-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
          >
            Sélectionne un jeu pour consulter le bracket, les équipes inscrites et les résultats en temps réel.
          </motion.p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">

        {/* Game Selector */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-ember-400/40 border-t-ember-400 rounded-full animate-spin" />
          </div>
        ) : (
          <motion.div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-8"
            variants={staggerContainer} initial="hidden" animate="visible">
            {tournaments.map(info => (
              <motion.div key={info.game} variants={fadeInUp}>
                <GameCard game={info.game} info={info} isSelected={selectedGame === info.game} onClick={() => handleSelectGame(info.game)} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Selected Game */}
        <AnimatePresence mode="wait">
          {selectedGame && (
            <motion.div key={selectedGame} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }}>
              {/* Game title bar */}
              <div
                className="flex items-center justify-between p-4 mb-4 border-l-2"
                style={{ borderLeftColor: color, background: `${color}08`, borderBottom: `1px solid ${color}20` }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{meta?.icon}</span>
                  <div>
                    <p className="font-display font-black text-white text-lg">{meta?.name}</p>
                    <p className="font-mono text-[9px] tracking-widest uppercase" style={{ color }}>
                      {tournament?.status === 'completed' ? 'Tournoi terminé' : tournament?.generated ? 'Bracket en cours' : 'Inscriptions ouvertes'}
                    </p>
                  </div>
                </div>
                {user && !isAdmin && tournament && !tournament.generated && (
                  <div className="hidden sm:block">
                    <TeamRegPanel game={selectedGame} onRegistered={handleRefresh} />
                  </div>
                )}
              </div>

              {user && !isAdmin && tournament && !tournament.generated && (
                <div className="sm:hidden mb-4">
                  <TeamRegPanel game={selectedGame} onRegistered={handleRefresh} />
                </div>
              )}

              {gameLoading ? (
                <div className="flex items-center justify-center py-24">
                  <div className="w-6 h-6 border-2 border-ember-400/40 border-t-ember-400 rounded-full animate-spin" />
                </div>
              ) : (
                <BracketView game={selectedGame} tournament={tournament} onRefresh={handleRefresh} isAdmin={isAdmin} />
              )}

              {isAdmin && tournament && (
                <AdminPanel game={selectedGame} tournament={tournament} onRefresh={handleRefresh} />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!selectedGame && !loading && (
          <div className="text-center py-20">
            <Trophy size={52} className="text-zinc-800 mx-auto mb-5" />
            <p className="font-display text-zinc-600 text-lg font-bold uppercase tracking-wide">Sélectionne un tournoi</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
