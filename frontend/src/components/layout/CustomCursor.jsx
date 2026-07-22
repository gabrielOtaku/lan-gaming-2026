import React, { useEffect, useRef } from 'react';

// ── Among Us style crewmate cursor ──────────────────────────────────────────
// Body/visor drawn in canvas so it composites with the existing particle
// trail. On click, an arm winds up and swings down for an open-hand slap.
function drawCrewmate(ctx, x, y, scale, tilt, slapT, isHov) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  ctx.scale(scale, scale);

  const bodyFill = 'rgba(0,0,0,0)';
  ctx.lineJoin = 'round';

  // Squash slightly on slap impact
  const squashY = 1 - slapT * 0.12;
  const squashX = 1 + slapT * 0.08;
  ctx.save();
  ctx.scale(squashX, squashY);

  // Backpack (behind body, opposite the visor side)
  ctx.beginPath();
  ctx.roundRect(-13, -9, 7, 15, 3.5);
  ctx.fillStyle = '#5C0D0D';
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.85)';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  // Legs
  ctx.beginPath();
  ctx.roundRect(-8, 8, 5, 8, 2);
  ctx.roundRect(3, 8, 5, 8, 2);
  ctx.fillStyle = '#7A1015';
  ctx.fill();
  ctx.stroke();

  // Main body (pill shape)
  const bodyGrad = ctx.createLinearGradient(0, -17, 0, 12);
  bodyGrad.addColorStop(0, isHov ? '#FF5A5A' : '#D7263D');
  bodyGrad.addColorStop(1, '#7A1015');
  ctx.beginPath();
  ctx.roundRect(-10, -17, 21, 28, 10);
  ctx.fillStyle = bodyGrad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.85)';
  ctx.lineWidth = 1.6;
  ctx.stroke();

  // Gold trim (LAN Gaming accent)
  ctx.beginPath();
  ctx.moveTo(-9, 6.5);
  ctx.lineTo(10, 6.5);
  ctx.strokeStyle = 'rgba(255,215,0,0.55)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Visor
  ctx.beginPath();
  ctx.ellipse(3.5, -8.5, 7.5, 5.5, -0.12, 0, Math.PI * 2);
  const visorGrad = ctx.createLinearGradient(-3, -13, 10, -4);
  visorGrad.addColorStop(0, '#DFF7FF');
  visorGrad.addColorStop(1, '#5FB9DC');
  ctx.fillStyle = visorGrad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.85)';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0.5, -10.5, 2.2, 1.1, -0.3, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fill();

  ctx.restore(); // squash

  // Slapping arm — winds up above the shoulder, then swings down (click)
  if (slapT > 0.01) {
    const sx = 6, sy = -2; // shoulder
    const armLen = 15;
    const angleStart = -1.5; // wound up, hand near the head
    const angleEnd = 1.05;   // swept down-right, slap landed
    const angle = angleStart + (angleEnd - angleStart) * slapT;
    const wx = sx + Math.cos(angle) * armLen; // wrist
    const wy = sy + Math.sin(angle) * armLen;

    // Swoosh trail — peaks mid-swing, fades at both ends
    const swoosh = Math.sin(Math.min(slapT, 1) * Math.PI);
    if (swoosh > 0.05) {
      ctx.save();
      ctx.strokeStyle = `rgba(255,255,255,${swoosh * 0.35})`;
      ctx.lineWidth = 1.4;
      ctx.lineCap = 'round';
      for (let k = 0; k < 3; k++) {
        const a0 = angleStart + (angle - angleStart) * (0.15 + k * 0.12);
        const a1 = angle - (k * 0.16);
        ctx.beginPath();
        ctx.arc(sx, sy, armLen * (0.72 + k * 0.14), a0, a1);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Forearm
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(wx, wy);
    ctx.lineCap = 'round';
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#D7263D';
    ctx.stroke();
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.globalCompositeOperation = 'destination-over';
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';

    // Open palm + fanned fingers, oriented along the swing direction
    ctx.save();
    ctx.translate(wx, wy);
    ctx.rotate(angle);
    ctx.fillStyle = '#D7263D';
    ctx.strokeStyle = 'rgba(0,0,0,0.85)';
    ctx.lineWidth = 1.1;

    // Palm
    ctx.beginPath();
    ctx.roundRect(-3.2, -4.2, 7.5, 8.4, 2.6);
    ctx.fill();
    ctx.stroke();

    // Fingers, fanned around the forward direction
    [-0.42, -0.16, 0.12, 0.4].forEach((off) => {
      ctx.save();
      ctx.translate(4.2, off * 6.5);
      ctx.rotate(off * 0.7);
      ctx.beginPath();
      ctx.roundRect(0, -1.05, 4.8, 2.1, 1.05);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });
    ctx.restore();

    // Impact flash at full extension
    if (slapT > 0.55) {
      const impact = (slapT - 0.55) / 0.45;
      ctx.save();
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 14 * impact;
      ctx.globalAlpha = impact;
      ctx.beginPath();
      const ix = wx + Math.cos(angle) * 6;
      const iy = wy + Math.sin(angle) * 6;
      [0, 1, 2, 3].forEach((k) => {
        const a = angle + (k - 1.5) * 0.5;
        ctx.moveTo(ix + Math.cos(a) * 2, iy + Math.sin(a) * 2);
        ctx.lineTo(ix + Math.cos(a) * 6, iy + Math.sin(a) * 6);
      });
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 1.4;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.restore();
    }
  }

  ctx.restore();
}

export default function CustomCursor() {
  const canvasRef = useRef();

  useEffect(() => {
    // Only activate on pointer devices (not touch)
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const mouse = { x: -200, y: -200 };
    const body = { x: -200, y: -200 };
    let isHov = false;
    let isClick = false;
    let slapT = 0; // spring toward 1 while the hand swings in
    let slapImpactFired = false;
    let scaleCur = 1;
    let tilt = 0;
    const particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const spawnBurst = (x, y) => {
      for (let i = 0; i < 16; i++) {
        const angle = (Math.PI * 2 * i) / 16 + Math.random() * 0.3;
        const speed = 1.2 + Math.random() * 1.8;
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: 0.03 + Math.random() * 0.02,
          size: 1.5 + Math.random() * 2,
          hov: true,
        });
        if (particles.length > 220) particles.shift();
      }
    };

    const onMove = (e) => {
      const prevX = mouse.x;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      tilt = Math.max(-0.25, Math.min(0.25, (mouse.x - prevX) * 0.02));
      const count = isHov ? 3 : 1;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.6 + 0.2;
        particles.push({
          x: e.clientX + (Math.random() - 0.5) * 5,
          y: e.clientY + (Math.random() - 0.5) * 5,
          vx: Math.cos(angle) * speed * 0.4,
          vy: Math.sin(angle) * speed * 0.4 - 0.5,
          life: 1,
          decay: 0.028 + Math.random() * 0.025,
          size: 1.5 + Math.random() * 2.5,
          hov: isHov,
        });
        if (particles.length > 220) particles.shift();
      }
    };

    const onOver = (e) => {
      const t = e.target;
      isHov = !!(
        t.tagName === 'A' || t.tagName === 'BUTTON' ||
        t.closest('a') || t.closest('button') || t.dataset.hover
      );
    };
    const onDown = () => {
      isClick = true;
      slapImpactFired = false;
    };
    const onUp = () => { isClick = false; };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onOver);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);

    let rafId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Body follows mouse with a light spring (snappy but smoothed)
      body.x += (mouse.x - body.x) * 0.38;
      body.y += (mouse.y - body.y) * 0.38;

      const targetScale = isHov ? 1.2 : 1;
      scaleCur += (targetScale - scaleCur) * 0.15;
      slapT += ((isClick ? 1 : 0) - slapT) * (isClick ? 0.4 : 0.22);

      // Fire the impact burst the moment the swing lands
      if (isClick && !slapImpactFired && slapT > 0.6) {
        slapImpactFired = true;
        spawnBurst(body.x + 14, body.y + 6);
      }

      // Particles — additive blending for neon glow
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy -= 0.012;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.life -= p.decay;
        if (p.life <= 0) { particles.splice(i, 1); continue; }

        const r = p.size * p.life;
        const a = p.life * 0.65;
        const [rc, gc, bc] = p.hov ? [255, 215, 0] : [220, 165, 45];

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4);
        grad.addColorStop(0,   `rgba(${rc},${gc},${bc},${a})`);
        grad.addColorStop(0.4, `rgba(${rc},${gc},${bc},${a * 0.35})`);
        grad.addColorStop(1,   `rgba(${rc},${gc},${bc},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Soft glow behind the crewmate on hover
      if (isHov) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const glow = ctx.createRadialGradient(body.x, body.y, 0, body.x, body.y, 34);
        glow.addColorStop(0, 'rgba(255,215,0,0.28)');
        glow.addColorStop(1, 'rgba(255,215,0,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(body.x, body.y, 34, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      drawCrewmate(ctx, body.x, body.y, scaleCur, tilt * 0.6, slapT, isHov);

      rafId = requestAnimationFrame(draw);
    };
    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100vw', height: '100vh',
        pointerEvents: 'none',
        zIndex: 99999,
      }}
    />
  );
}
