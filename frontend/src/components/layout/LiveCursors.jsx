import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function LiveCursors() {
  const canvasRef = useRef(document.createElement('canvas'));
  const cursors = useRef({}); // id → { name, color, x, y, sx, sy }

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:9998';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Socket
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on('users', (users) => {
      Object.entries(users).forEach(([id, u]) => {
        cursors.current[id] = { ...u, sx: u.x, sy: u.y };
      });
    });

    socket.on('user-join', ({ id, name, color }) => {
      cursors.current[id] = { name, color, x: -500, y: -500, sx: -500, sy: -500 };
    });

    socket.on('cursor', ({ id, x, y }) => {
      const c = cursors.current[id];
      if (c) { c.x = x; c.y = y; }
    });

    socket.on('user-leave', (id) => {
      delete cursors.current[id];
    });

    // Throttled cursor broadcast — max 20fps
    let lastEmit = 0;
    const onMove = (e) => {
      const now = Date.now();
      if (now - lastEmit < 50) return;
      lastEmit = now;
      socket.emit('cursor', { x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', onMove);

    // Draw loop — spring interpolation on remote cursor positions
    let rafId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      Object.values(cursors.current).forEach((c) => {
        // Spring toward target position
        c.sx = c.sx + (c.x - c.sx) * 0.14;
        c.sy = c.sy + (c.y - c.sy) * 0.14;
        const x = c.sx, y = c.sy;
        if (x < -100) return;

        ctx.save();

        // Cursor arrow with neon glow
        ctx.shadowColor = c.color;
        ctx.shadowBlur = 14;
        ctx.fillStyle = c.color + 'CC';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 16);
        ctx.lineTo(x + 4, y + 11.5);
        ctx.lineTo(x + 7, y + 18);
        ctx.lineTo(x + 9, y + 17);
        ctx.lineTo(x + 6, y + 10.5);
        ctx.lineTo(x + 11, y + 10.5);
        ctx.closePath();
        ctx.fill();

        // Name tag
        ctx.shadowBlur = 0;
        ctx.font = 'bold 9px "Share Tech Mono", monospace';
        const tw = ctx.measureText(c.name).width;
        const tx = x + 13, ty = y + 17;

        ctx.fillStyle = 'rgba(2,4,8,0.85)';
        ctx.strokeStyle = c.color + '70';
        ctx.lineWidth = 1;
        ctx.fillRect(tx, ty, tw + 10, 14);
        ctx.strokeRect(tx, ty, tw + 10, 14);

        ctx.fillStyle = c.color;
        ctx.fillText(c.name, tx + 5, ty + 10);

        ctx.restore();
      });

      rafId = requestAnimationFrame(draw);
    };
    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', resize);
      socket.disconnect();
      canvas.remove();
    };
  }, []);

  return null;
}
