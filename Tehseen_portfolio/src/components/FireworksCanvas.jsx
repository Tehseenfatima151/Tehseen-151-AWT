import React, { useEffect, useRef } from 'react';

const NEON_COLORS = [
  '#ff0000', '#ff5500', '#ffaa00', '#ffff00',
  '#00ff44', '#00ffff', '#00bbff', '#0055ff',
  '#aa00ff', '#ff00cc', '#ff2fd0', '#ff0088',
];

const FireworksCanvas = () => {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const stateRef = useRef({ stars: [], rockets: [], bursts: [], nextLaunchAt: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      buildStars();
    };

    const buildStars = () => {
      stateRef.current.stars = Array.from({ length: 250 }, () => {
        const isCyan = Math.random() < 0.15; // 15% are vibrant cyan dots
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          // Very small — 1 to 2.2px max, like the reference
          r: isCyan ? Math.random() * 1.2 + 0.8 : Math.random() * 0.9 + 0.4,
          // High opacity — clearly visible, not faded
          alpha: isCyan ? 0.85 + Math.random() * 0.15 : 0.55 + Math.random() * 0.35,
          dir: Math.random() > 0.5 ? 1 : -1,
          speed: 0.003 + Math.random() * 0.005,
          // Gentle constant drift
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.18,
          isCyan,
        };
      });
    };

    // ── Rocket ────────────────────────────────────────────────
    class Rocket {
      constructor(tx, ty) {
        this.x = canvas.width * (0.15 + Math.random() * 0.7);
        this.y = canvas.height;
        this.tx = tx;
        this.ty = ty;
        const angle = Math.atan2(ty - this.y, tx - this.x);
        // Fast rocket — reaches target quickly
        const speed = 14 + Math.random() * 6;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.trail = [];
        this.done = false;
      }
      update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 6) this.trail.shift();
        this.x += this.vx;
        this.y += this.vy;
        if (Math.hypot(this.tx - this.x, this.ty - this.y) < 10) {
          this.done = true;
          spawnBurst(this.x, this.y);
        }
      }
      draw() {
        ctx.save();
        for (let i = 1; i < this.trail.length; i++) {
          ctx.globalAlpha = (i / this.trail.length) * 0.85;
          ctx.beginPath();
          ctx.moveTo(this.trail[i - 1].x, this.trail[i - 1].y);
          ctx.lineTo(this.trail[i].x, this.trail[i].y);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#aaddff';
          ctx.shadowBlur = 6;
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    // ── Burst Particle ─────────────────────────────────────────
    class BurstParticle {
      constructor(x, y, angle, color) {
        this.x = x;
        this.y = y;
        // High initial speed so particles spread OUT immediately — no white blob
        const speed = 6 + Math.random() * 8;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.gravity = 0.08;
        this.friction = 0.96;   // aggressive friction — slows fast
        this.color = color;
        this.life = 1;
        // Fast decay — disappear in ~0.8–1.2 seconds
        this.lifeDecay = 0.022 + Math.random() * 0.018;
        this.length = 10 + Math.random() * 14;
        this.width = 1.8 + Math.random() * 1.2;
      }
      update() {
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.lifeDecay;
      }
      get alpha() {
        // Full bright for first 55% then quick fade
        return this.life > 0.45 ? 1 : this.life / 0.45;
      }
      draw() {
        if (this.life <= 0) return;
        const angle = Math.atan2(this.vy, this.vx);
        const tailX = this.x - Math.cos(angle) * this.length;
        const tailY = this.y - Math.sin(angle) * this.length;

        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.lineCap = 'round';
        ctx.globalCompositeOperation = 'source-over'; // NO lighter — avoids white blob

        // Outer glow
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.width + 2;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 20;
        ctx.stroke();

        // Bright white core
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = this.width * 0.35;
        ctx.shadowBlur = 4;
        ctx.stroke();

        ctx.restore();
      }
    }

    // ── Spawn burst ───────────────────────────────────────────
    const spawnBurst = (x, y) => {
      const COUNT = 72;
      const particles = [];
      for (let i = 0; i < COUNT; i++) {
        const angle = (i / COUNT) * Math.PI * 2;
        const color = NEON_COLORS[Math.floor((i / COUNT) * NEON_COLORS.length)];
        particles.push(new BurstParticle(x, y, angle, color));
      }
      stateRef.current.bursts.push({ particles });
    };

    // ── Launch rocket ─────────────────────────────────────────
    const launchRocket = () => {
      const goLeft = Math.random() > 0.5;
      const tx = goLeft
        ? canvas.width * (0.05 + Math.random() * 0.25)
        : canvas.width * (0.70 + Math.random() * 0.25);
      const ty = canvas.height * (0.08 + Math.random() * 0.38);
      stateRef.current.rockets.push(new Rocket(tx, ty));
    };

    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      spawnBurst(e.clientX - rect.left, e.clientY - rect.top);
    };

    // ── Main loop ─────────────────────────────────────────────
    const loop = (ts) => {
      rafRef.current = requestAnimationFrame(loop);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#050816';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const s = stateRef.current;

      // Stars — tiny sharp dots, high contrast, like reference portfolio
      s.stars.forEach((star) => {
        // Gentle twinkle
        star.alpha += star.speed * star.dir;
        const maxAlpha = star.isCyan ? 1.0 : 0.92;
        const minAlpha = star.isCyan ? 0.5 : 0.2;
        if (star.alpha > maxAlpha || star.alpha < minAlpha) star.dir *= -1;
        // Drift
        star.x += star.vx;
        star.y += star.vy;
        if (star.x < 0) star.x = canvas.width;
        if (star.x > canvas.width) star.x = 0;
        if (star.y < 0) star.y = canvas.height;
        if (star.y > canvas.height) star.y = 0;

        ctx.save();
        ctx.globalAlpha = star.alpha;
        if (star.isCyan) {
          // Cyan particles: small glow bloom
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
          ctx.fillStyle = '#00f0ff';
          ctx.fill();
        } else {
          // White particles: sharp, no blur — like tiny pixels
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        }
        ctx.restore();
      });

      // Launch — max 2 at a time
      const totalActive = s.rockets.length + s.bursts.length;
      if (totalActive < 2 && ts > s.nextLaunchAt) {
        launchRocket();
        s.nextLaunchAt = ts + 1800 + Math.random() * 1200;
      }

      // Rockets
      s.rockets = s.rockets.filter((r) => { r.update(); r.draw(); return !r.done; });

      // Bursts
      s.bursts = s.bursts.filter((burst) => {
        burst.particles = burst.particles.filter((p) => {
          if (p.life > 0) { p.update(); p.draw(); return true; }
          return false;
        });
        return burst.particles.length > 0;
      });
    };

    window.addEventListener('resize', resize);
    canvas.addEventListener('click', handleClick);
    resize();
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('click', handleClick);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-0 cursor-crosshair"
    />
  );
};

export default FireworksCanvas;
