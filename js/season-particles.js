/**
 * Seasonal Particle Effects v3
 * 🌸 Butterflies (delicate) | ☀️ Wind + Fireflies | 🍂 Maple leaves (sparse) | ❄️ Snow
 * Continuous flow, position-aware, live season switching, improved aesthetics
 */
;(function () {
  'use strict';

  const STORAGE_KEY = 'season-theme';
  const SEASON_NAMES = ['spring', 'summer', 'autumn', 'winter'];

  // ---- Season detection (matches SeasonManager) ----
  function detectSeason() {
    const m = new Date().getMonth();
    if ([2,3,4].includes(m)) return 'spring';
    if ([5,6,7].includes(m)) return 'summer';
    if ([8,9,10].includes(m)) return 'autumn';
    return 'winter'; // 11, 0, 1
  }

  function getSeason() {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s && s !== 'auto' && SEASON_NAMES.includes(s)) return s;
    return 'auto';
  }

  function getActiveSeason() {
    const choice = getSeason();
    return choice === 'auto' ? detectSeason() : choice;
  }

  // ---- Particle counts per season ----
  const COUNTS = { spring: 20, summer: 30, autumn: 20, winter: 35 };

  // ---- Canvas ----
  const canvas = document.createElement('canvas');
  canvas.id = 'season-particles';
  Object.assign(canvas.style, {
    position:'fixed', top:'0', left:'0', width:'100%', height:'100%',
    pointerEvents:'none', zIndex:'1', opacity:'0.85',
  });
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let W, H;
  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  let season = getActiveSeason();
  let particles = [];

  // ---- Stagger helper ----
  function staggerY(fn) {
    const p = fn();
    p.y = Math.random() * (H + 60) - 30;
    return p;
  }

  // ============ FACTORIES ============

  // 🌸 SPRING — delicate butterflies, stay in upper portion
  function mkButterfly() {
    return {
      type:'butterfly',
      x: Math.random() * W,
      y: Math.random() * H * 0.3,  // upper 30% only
      vx: (Math.random()-0.5)*0.4,
      vy: (Math.random()-0.5)*0.15,
      size: 2 + Math.random()*2,    // smaller (2-4px)
      wing: 0, wingDir: 1,
      hue: Math.random()>0.5 ? 330+Math.random()*30 : 270+Math.random()*30,
      phase: Math.random()*Math.PI*2,
      alpha: 0.2 + Math.random()*0.1, // soft (0.2-0.3)
    };
  }

  // ☀️ SUMMER — wind lines + floating firefly dust
  function mkWind() {
    return {
      type:'wind',
      x: -50 - Math.random()*200,
      y: Math.random()*H,
      speed: 2.5 + Math.random()*3,
      amplitude: 25 + Math.random()*45,
      frequency: 0.004 + Math.random()*0.008,
      phase: Math.random()*Math.PI*2,
      len: 100 + Math.random()*150,
      alpha: 0.15 + Math.random()*0.1,  // 0.15-0.25
      thickness: 1.5 + Math.random()*1.0, // 1.5-2.5
    };
  }

  function mkFirefly() {
    return {
      type:'firefly',
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random()-0.5)*0.3,
      vy: (Math.random()-0.5)*0.2,
      size: 1.5 + Math.random()*2,
      phase: Math.random()*Math.PI*2,
      pulse: Math.random()*Math.PI*2,
      hue: 55 + Math.random()*30,  // warm yellow-green
      alpha: 0.3 + Math.random()*0.4,
    };
  }

  // 🍂 AUTUMN — fewer, slower, more colorful leaves
  function mkLeaf() {
    return {
      type:'leaf',
      x: Math.random()*W,
      y: -20 - Math.random()*60,
      vx: (Math.random()-0.5)*0.3,
      vy: 0.4 + Math.random()*0.4,  // 0.4-0.8 slower
      size: 5 + Math.random()*4,     // slightly smaller
      rot: Math.random()*Math.PI*2,
      rotV: (Math.random()-0.5)*0.02,
      sway: Math.random()*Math.PI*2,
      swayAmp: 0.8 + Math.random()*0.6, // more sway
      hue: [10, 20, 30, 40, 5, 35][Math.floor(Math.random()*6)], // varied colors
      alpha: 0.5 + Math.random()*0.3,
    };
  }

  // ❄️ WINTER — snow with variety
  function mkSnow() {
    const isLarge = Math.random() < 0.15; // 15% chance of large flake
    return {
      type:'snow',
      x: Math.random()*W,
      y: -10 - Math.random()*60,
      vx: (Math.random()-0.5)*0.3,
      vy: isLarge ? 0.3 + Math.random()*0.4 : 0.5 + Math.random()*1.0,
      r: isLarge ? 3 + Math.random()*2 : 1.5 + Math.random()*2.5,
      sway: Math.random()*Math.PI*2,
      alpha: isLarge ? 0.5 + Math.random()*0.3 : 0.4 + Math.random()*0.5,
      isLarge: isLarge,
    };
  }

  const FACTORIES = { spring:mkButterfly, summer:mkWind, autumn:mkLeaf, winter:mkSnow };

  // ============ INIT ============
  function initParticles() {
    particles = [];
    const count = COUNTS[season] || 35;
    const fn = FACTORIES[season] || mkSnow;

    if (season === 'summer') {
      // Mix: wind lines + fireflies
      for (let i = 0; i < 15; i++) particles.push(staggerY(mkWind));
      for (let i = 0; i < 15; i++) particles.push(staggerY(mkFirefly));
    } else {
      for (let i = 0; i < count; i++) particles.push(staggerY(fn));
    }
  }
  initParticles();

  // ============ UPDATERS ============

  function upButterfly(p) {
    p.phase += 0.03;
    p.wing += 0.15 * p.wingDir;  // faster wing beat
    if (p.wing > 1 || p.wing < -1) p.wingDir *= -1;
    p.x += p.vx + Math.sin(p.phase)*0.5;
    p.y += p.vy + Math.cos(p.phase*0.7)*0.15;
    if (p.x < -30) p.x = W+30;
    if (p.x > W+30) p.x = -30;
    if (p.y < 10) p.vy += 0.015;
    if (p.y > H*0.3) p.vy -= 0.02;  // keep in upper 30%
    if (Math.random()<0.01) p.vx = (Math.random()-0.5)*0.4;
    if (Math.random()<0.01) p.vy = (Math.random()-0.5)*0.15;
  }

  function upWind(p) {
    p.x += p.speed;
    p.phase += 0.03;
    if (p.x > W + 100) {
      p.x = -50 - Math.random()*150;
      p.y = Math.random()*H;
      p.speed = 2.5 + Math.random()*3;
    }
  }

  function upFirefly(p) {
    p.phase += 0.02;
    p.pulse += 0.04;
    p.x += p.vx + Math.sin(p.phase)*0.3;
    p.y += p.vy + Math.cos(p.phase*0.6)*0.2;
    if (p.x < -20) p.x = W+20;
    if (p.x > W+20) p.x = -20;
    if (p.y < -20) p.y = H+20;
    if (p.y > H+20) p.y = -20;
    if (Math.random()<0.005) { p.vx = (Math.random()-0.5)*0.3; p.vy = (Math.random()-0.5)*0.2; }
  }

  function upLeaf(p) {
    p.sway += 0.015;
    p.x += p.vx + Math.sin(p.sway)*p.swayAmp;
    p.y += p.vy;
    p.rot += p.rotV;
    if (p.y > H+30) { p.y = -30; p.x = Math.random()*W; }
  }

  function upSnow(p) {
    p.sway += 0.012;
    p.x += p.vx + Math.sin(p.sway)*0.3;
    p.y += p.vy;
    if (p.y > H+20) { p.y = -20; p.x = Math.random()*W; }
  }

  // ============ DRAWERS ============

  function drButterfly(p) {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.translate(p.x, p.y);
    const wa = Math.sin(p.wing)*0.5;
    const s = p.size;
    // Wings — two soft ellipses with gradient
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, s*0.7);
    grad.addColorStop(0, `hsla(${p.hue},60%,75%,${p.alpha})`);
    grad.addColorStop(1, `hsla(${p.hue},60%,75%,0)`);
    ctx.fillStyle = grad;
    ctx.save(); ctx.scale(Math.cos(wa), 1);
    ctx.beginPath(); ctx.ellipse(-s*0.4, 0, s*0.5, s*0.3, -0.3, 0, Math.PI*2); ctx.fill();
    ctx.restore();
    ctx.save(); ctx.scale(Math.cos(wa+Math.PI), 1);
    ctx.beginPath(); ctx.ellipse(s*0.4, 0, s*0.5, s*0.3, 0.3, 0, Math.PI*2); ctx.fill();
    ctx.restore();
    // Body
    ctx.fillStyle = `hsla(${p.hue},30%,30%,${p.alpha * 0.8})`;
    ctx.beginPath(); ctx.ellipse(0,0,0.6, s*0.25, 0,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }

  function drWind(p) {
    ctx.strokeStyle = `rgba(200,220,255,${p.alpha})`;
    ctx.lineWidth = p.thickness;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const steps = Math.floor(p.len / 3);
    for (let i = 0; i <= steps; i++) {
      const dx = i * 3;
      const dy = Math.sin((p.x + dx) * p.frequency + p.phase) * p.amplitude;
      if (i === 0) ctx.moveTo(p.x + dx, p.y + dy);
      else ctx.lineTo(p.x + dx, p.y + dy);
    }
    ctx.stroke();
  }

  function drFirefly(p) {
    const pulseAlpha = p.alpha * (0.5 + 0.5 * Math.sin(p.pulse));
    ctx.save();
    ctx.globalAlpha = pulseAlpha;
    // Glow effect
    const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
    grad.addColorStop(0, `hsla(${p.hue},80%,70%,${pulseAlpha})`);
    grad.addColorStop(0.5, `hsla(${p.hue},80%,60%,${pulseAlpha * 0.3})`);
    grad.addColorStop(1, `hsla(${p.hue},80%,50%,0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI*2);
    ctx.fill();
    // Core
    ctx.fillStyle = `hsla(${p.hue},90%,80%,${pulseAlpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  function drLeaf(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = `hsla(${p.hue},75%,45%,${p.alpha})`;
    ctx.beginPath();
    ctx.moveTo(0, -p.size);
    ctx.bezierCurveTo(p.size*0.6, -p.size*0.3, p.size*0.4, p.size*0.35, 0, p.size);
    ctx.bezierCurveTo(-p.size*0.4, p.size*0.35, -p.size*0.6, -p.size*0.3, 0, -p.size);
    ctx.fill();
    // Vein
    ctx.strokeStyle = `hsla(${p.hue},60%,30%,${p.alpha * 0.4})`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, -p.size * 0.8);
    ctx.lineTo(0, p.size * 0.8);
    ctx.stroke();
    ctx.restore();
  }

  function drSnow(p) {
    if (p.isLarge) {
      // Larger snowflakes with slight sparkle
      ctx.save();
      ctx.globalAlpha = p.alpha;
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      grad.addColorStop(0, `rgba(255,255,255,${p.alpha})`);
      grad.addColorStop(1, `rgba(220,230,255,${p.alpha * 0.5})`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    } else {
      ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();
    }
  }

  // ============ DISPATCH ============

  function updateAndDraw(p) {
    switch(p.type) {
      case 'butterfly': upButterfly(p); drButterfly(p); break;
      case 'wind': upWind(p); drWind(p); break;
      case 'firefly': upFirefly(p); drFirefly(p); break;
      case 'leaf': upLeaf(p); drLeaf(p); break;
      case 'snow': upSnow(p); drSnow(p); break;
    }
  }

  let running = true;
  let lastT = 0;
  const FPS = 30, IV = 1000/FPS;

  function loop(t) {
    if (!running) return;
    requestAnimationFrame(loop);
    if (t - lastT < IV) return;
    lastT = t;
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < particles.length; i++) {
      updateAndDraw(particles[i]);
    }
  }

  function start() { if (!running) { running = true; requestAnimationFrame(loop); } }
  function stop() { running = false; }

  // ---- Start after page load ----
  if (document.readyState === 'complete') requestAnimationFrame(loop);
  else window.addEventListener('load', () => requestAnimationFrame(loop));

  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) requestAnimationFrame(loop);
  });

  // ============ LIVE SEASON SWITCH ============
  window.addEventListener('storage', (e) => {
    if (e.key !== STORAGE_KEY) return;
    const ns = getActiveSeason();
    if (ns !== season) { season = ns; initParticles(); }
  });

  let lastCheck = getActiveSeason();
  setInterval(() => {
    const cur = getActiveSeason();
    if (cur !== lastCheck) {
      lastCheck = cur;
      season = cur;
      initParticles();
    }
  }, 500);

  window.SeasonParticles = { start, stop };
})();
