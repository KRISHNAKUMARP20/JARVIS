import React, { useEffect, useRef } from 'react';

export interface BackgroundProps {
  color?: string;
  pulseTrigger?: number;
}

// Convert protocol hex color to rgba string for smooth alpha fading
function hexToRgba(hex: string, alpha: number): string {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('');
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return `rgba(255, 26, 64, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Secondary Comet Particle System
interface CometParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  initialSize: number;
  life: number;
  maxLife: number;
  alpha: number;
  twinkle: number;
  twinkleSpeed: number;
  isSpark: boolean;
}

// Continuous tapered comet ribbon trail node
interface CometRibbonNode {
  x: number;
  y: number;
  age: number;
  maxAge: number;
  width: number;
}

// Background Plasma-Pulse Effect Types
interface PlasmaPulseWave {
  id: number;
  radius: number;
  maxRadius: number;
  speed: number;
  thickness: number;
  alpha: number;
  color: string;
  harmonicOffsets: number[];
}

interface PlasmaCenterFlash {
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
  color: string;
}

interface PlasmaEmber {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  color: string;
}

export const Background: React.FC<BackgroundProps> = ({ color = '#ff1a40', pulseTrigger = 0 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorRef = useRef(color);
  colorRef.current = color;

  const triggerPulseRef = useRef<((col?: string) => void) | null>(null);

  // Trigger plasma pulse whenever pulseTrigger updates
  useEffect(() => {
    if (pulseTrigger > 0 && triggerPulseRef.current) {
      triggerPulseRef.current(colorRef.current);
    }
  }, [pulseTrigger]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Floating quantum particles
    const particleCount = 75;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      baseX: Math.random() * width,
      baseY: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4 - 0.08,
      size: Math.random() * 2.2 + 0.8,
      alpha: Math.random() * 0.55 + 0.25,
      pulse: Math.random() * Math.PI * 2,
    }));

    // Secondary Comet Particle System & Luminous Ribbon Trail
    const cometParticles: CometParticle[] = [];
    const cometRibbon: CometRibbonNode[] = [];

    // Background Plasma-Pulse State (Ripples from center of screen)
    const plasmaWaves: PlasmaPulseWave[] = [];
    const centerFlashes: PlasmaCenterFlash[] = [];
    const plasmaEmbers: PlasmaEmber[] = [];

    const spawnPlasmaPulse = (pulseColor?: string) => {
      const activeColor = pulseColor || colorRef.current;
      const maxRadius = Math.hypot(width, height) * 0.75;

      // 1. Primary concentric shockwave with trailing harmonic ripple rings
      plasmaWaves.push({
        id: Date.now() + Math.random(),
        radius: 12,
        maxRadius,
        speed: 19,
        thickness: 24,
        alpha: 1.0,
        color: activeColor,
        harmonicOffsets: [0, -32, -68, -108],
      });

      // 2. Luminous center core flash that blooms outward
      centerFlashes.push({
        radius: 18,
        maxRadius: 240,
        alpha: 0.95,
        speed: 15,
        color: activeColor,
      });

      // 3. Radial high-velocity plasma spark embers bursting from center
      const emberCount = 36;
      for (let i = 0; i < emberCount; i++) {
        const angle = (Math.PI * 2 * i) / emberCount + (Math.random() - 0.5) * 0.25;
        const speed = 7 + Math.random() * 8;
        plasmaEmbers.push({
          x: width / 2,
          y: height / 2,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 3.0 + 1.2,
          alpha: 1.0,
          life: 1.0,
          maxLife: 26 + Math.random() * 20,
          color: activeColor,
        });
      }
    };

    triggerPulseRef.current = spawnPlasmaPulse;

    // Listen to custom window event for component-independent triggers
    const handleCustomPulse = (e: Event) => {
      const customEvent = e as CustomEvent<{ color?: string }>;
      spawnPlasmaPulse(customEvent.detail?.color || colorRef.current);
    };
    window.addEventListener('jarvis-plasma-pulse', handleCustomPulse);

    // Initial subtle calibration pulse on mount
    const bootTimer = setTimeout(() => {
      spawnPlasmaPulse(colorRef.current);
    }, 450);

    // Data pulse streamers across the perspective grid
    let streamX = 0;

    let mouseX = -1000;
    let mouseY = -1000;
    let lastMouseX = -1000;
    let lastMouseY = -1000;
    let mouseSpeed = 0;
    let targetReticleAngle = 0;

    const handlePointerMove = (e: MouseEvent) => {
      const currentX = e.clientX;
      const currentY = e.clientY;

      if (lastMouseX > -500 && lastMouseY > -500) {
        const dx = currentX - lastMouseX;
        const dy = currentY - lastMouseY;
        const dist = Math.hypot(dx, dy);
        mouseSpeed = Math.min(dist, 50);

        if (dist > 1.5) {
          const travelAngle = Math.atan2(dy, dx);

          // Add continuous path node for the luminous comet plasma ribbon
          cometRibbon.push({
            x: currentX,
            y: currentY,
            age: 0,
            maxAge: 22,
            width: Math.min(6 + mouseSpeed * 0.28, 16),
          });
          if (cometRibbon.length > 45) {
            cometRibbon.shift();
          }

          // Interpolate and spawn secondary comet stardust particles smoothly along movement path
          const numSteps = Math.min(Math.ceil(dist / 6), 12);
          const particlesPerStep = mouseSpeed > 12 ? 2 : 1;

          for (let s = 0; s <= numSteps; s++) {
            const t = s / numSteps;
            const px = lastMouseX + dx * t;
            const py = lastMouseY + dy * t;

            for (let k = 0; k < particlesPerStep; k++) {
              if (cometParticles.length >= 150) break;

              // Backward ejection (opposite to travel angle, creating an authentic comet tail)
              const sprayAngle = travelAngle + Math.PI + (Math.random() - 0.5) * 1.1;
              const spraySpeed = (mouseSpeed * 0.08 + Math.random() * 2.0) * (0.6 + Math.random() * 0.8);
              const initialSize = Math.random() * 3.0 + 1.2;

              cometParticles.push({
                x: px + (Math.random() - 0.5) * 4,
                y: py + (Math.random() - 0.5) * 4,
                vx: Math.cos(sprayAngle) * spraySpeed,
                vy: Math.sin(sprayAngle) * spraySpeed,
                size: initialSize,
                initialSize,
                life: 1.0,
                maxLife: 26 + Math.random() * 20,
                alpha: 0.9 + Math.random() * 0.1,
                twinkle: Math.random() * Math.PI * 2,
                twinkleSpeed: 0.18 + Math.random() * 0.25,
                isSpark: Math.random() > 0.65,
              });
            }
          }
        }
      }

      lastMouseX = currentX;
      lastMouseY = currentY;
      mouseX = currentX;
      mouseY = currentY;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
      lastMouseX = -1000;
      lastMouseY = -1000;
      cometRibbon.length = 0;
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const render = () => {
      animId = requestAnimationFrame(render);
      ctx.clearRect(0, 0, width, height);

      // Render subtle perspective grid on bottom half with gentle mouse-tilt reaction
      const horizonY = height * 0.70;
      const mouseGridTilt = mouseX > 0 ? ((mouseX / width) - 0.5) * 40 : 0;
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.07)';
      ctx.lineWidth = 1;

      // Horizontal perspective grid lines
      for (let y = horizonY; y < height; y += (y - horizonY) * 0.22 + 9) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Vertical perspective fan lines radiating from center horizon with dynamic horizon shift
      const centerX = width / 2 + mouseGridTilt;
      const fanLines = 16;
      for (let i = -fanLines; i <= fanLines; i++) {
        const spreadX = centerX + (i / fanLines) * (width * 0.96);
        ctx.beginPath();
        ctx.moveTo(centerX, horizonY);
        ctx.lineTo(spreadX, height);
        ctx.stroke();
      }

      // High-speed digital light beam sweeping across horizon
      streamX = (streamX + 8) % (width + 200);
      const gradient = ctx.createLinearGradient(streamX - 140, horizonY, streamX, horizonY);
      gradient.addColorStop(0, 'rgba(0, 240, 255, 0)');
      gradient.addColorStop(0.5, 'rgba(0, 240, 255, 0.4)');
      gradient.addColorStop(1, 'rgba(0, 240, 255, 0)');
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(Math.max(0, streamX - 140), horizonY);
      ctx.lineTo(Math.min(width, streamX), horizonY);
      ctx.stroke();

      // Render constellation filaments between close particles
      ctx.lineWidth = 0.6;
      for (let i = 0; i < particleCount; i++) {
        for (let j = i + 1; j < particleCount; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 115) {
            const filamentAlpha = (1 - dist / 115) * 0.18;
            ctx.strokeStyle = color;
            ctx.globalAlpha = filamentAlpha;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }

        // Draw interactive energy filaments connecting particles directly to the mouse cursor
        if (mouseX > 0) {
          const mdx = particles[i].x - mouseX;
          const mdy = particles[i].y - mouseY;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 140) {
            const cursorFilamentAlpha = (1 - mdist / 140) * 0.35;
            ctx.strokeStyle = color;
            ctx.globalAlpha = cursorFilamentAlpha;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouseX, mouseY);
            ctx.stroke();
          }
        }
      }

      // Render and update particles
      ctx.fillStyle = color;
      particles.forEach((p) => {
        p.pulse += 0.03;
        p.x += p.vx;
        p.y += p.vy;

        // Interactive mouse physics: vortex gravitational pull + repulsive shockwave boundary
        if (mouseX > 0) {
          const mdx = p.x - mouseX;
          const mdy = p.y - mouseY;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

          if (mdist < 160 && mdist > 0) {
            const force = (1 - mdist / 160);
            // Tangential vortex rotation around cursor
            const angle = Math.atan2(mdy, mdx);
            const tangentX = -Math.sin(angle);
            const tangentY = Math.cos(angle);

            // Close proximity pushes out, mid proximity swirls in orbit
            if (mdist < 60) {
              p.x += Math.cos(angle) * force * 3.5;
              p.y += Math.sin(angle) * force * 3.5;
            } else {
              p.x += tangentX * force * 1.8 - Math.cos(angle) * force * 0.5;
              p.y += tangentY * force * 1.8 - Math.sin(angle) * force * 0.5;
            }
          }
        }

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const pulseSize = p.size + Math.sin(p.pulse) * 0.4;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.4, pulseSize), 0, Math.PI * 2);
        ctx.fill();
      });

      // =========================================================
      // Background Plasma-Pulse Effect (Ripples from Center of Screen)
      // =========================================================
      const cx = width / 2;
      const cy = height / 2;

      // 1. Center plasma core flashes (instant bloom)
      for (let i = centerFlashes.length - 1; i >= 0; i--) {
        const flash = centerFlashes[i];
        flash.radius += flash.speed;
        flash.speed *= 0.93;
        flash.alpha -= 0.032;

        if (flash.alpha <= 0 || flash.radius >= flash.maxRadius) {
          centerFlashes.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, flash.radius);
        grad.addColorStop(0, `rgba(255, 255, 255, ${flash.alpha * 0.95})`);
        grad.addColorStop(0.22, hexToRgba(flash.color, flash.alpha * 0.8));
        grad.addColorStop(0.65, hexToRgba(flash.color, flash.alpha * 0.22));
        grad.addColorStop(1, hexToRgba(flash.color, 0));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, flash.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 2. Concentric expanding plasma ripple shockwaves
      for (let i = plasmaWaves.length - 1; i >= 0; i--) {
        const wave = plasmaWaves[i];
        wave.radius += wave.speed;
        wave.speed = Math.max(6.5, wave.speed * 0.991);
        const progress = wave.radius / wave.maxRadius;

        if (progress >= 1) {
          plasmaWaves.splice(i, 1);
          continue;
        }

        const baseFade = Math.max(0, Math.sin((1 - progress) * Math.PI * 0.5));
        const waveAlpha = wave.alpha * baseFade;

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        // Draw primary wave and trailing harmonic echoes
        wave.harmonicOffsets.forEach((offset, idx) => {
          const r = wave.radius + offset;
          if (r <= 0 || r > wave.maxRadius) return;

          const ringProgress = r / wave.maxRadius;
          const ringFade = Math.max(0, (1 - ringProgress) ** 1.35);
          const isPrimary = idx === 0;

          // Outer plasma energy aura
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.strokeStyle = hexToRgba(wave.color, ringFade * waveAlpha * (isPrimary ? 0.8 : 0.35));
          ctx.lineWidth = Math.max(1.2, (wave.thickness * (isPrimary ? 1.0 : 0.5)) * (1 - ringProgress * 0.45));
          ctx.stroke();

          // Intense core filament for primary shockwave
          if (isPrimary && ringProgress < 0.88) {
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 255, 255, ${ringFade * waveAlpha * 0.95})`;
            ctx.lineWidth = Math.max(0.8, 2.4 * (1 - ringProgress));
            ctx.stroke();

            // Tactile telemetry tick marks orbiting along the leading shockwave front
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
            ctx.setLineDash([12, 34]);
            ctx.strokeStyle = hexToRgba(wave.color, ringFade * waveAlpha * 0.55);
            ctx.lineWidth = 1.2;
            ctx.stroke();
            ctx.restore();
          }
        });

        ctx.restore();
      }

      // 3. Radiating plasma spark embers emanating outward from center
      for (let i = plasmaEmbers.length - 1; i >= 0; i--) {
        const ember = plasmaEmbers[i];
        ember.x += ember.vx;
        ember.y += ember.vy;
        ember.vx *= 0.955;
        ember.vy *= 0.955;
        ember.life -= 1 / ember.maxLife;

        if (ember.life <= 0) {
          plasmaEmbers.splice(i, 1);
          continue;
        }

        const curAlpha = ember.alpha * ember.life;
        const curSize = ember.size * (0.3 + ember.life * 0.7);

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        // Outer soft glow
        ctx.beginPath();
        ctx.arc(ember.x, ember.y, curSize * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(ember.color, curAlpha * 0.35);
        ctx.fill();

        // Core white-hot spark
        ctx.beginPath();
        ctx.arc(ember.x, ember.y, curSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${curAlpha * 0.9})`;
        ctx.fill();

        ctx.restore();
      }

      // 1. Age and render continuous luminous comet plasma ribbon tail
      for (let i = cometRibbon.length - 1; i >= 0; i--) {
        cometRibbon[i].age++;
        if (cometRibbon[i].age >= cometRibbon[i].maxAge) {
          cometRibbon.splice(i, 1);
        }
      }

      if (cometRibbon.length > 1) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        // Draw smooth tapered comet tail ribbon
        for (let i = 0; i < cometRibbon.length - 1; i++) {
          const n1 = cometRibbon[i];
          const n2 = cometRibbon[i + 1];
          const progress = 1 - (n1.age / n1.maxAge);
          if (progress <= 0) continue;

          // Outer protocol plasma glow ribbon
          ctx.beginPath();
          ctx.moveTo(n1.x, n1.y);
          ctx.lineTo(n2.x, n2.y);
          ctx.strokeStyle = hexToRgba(color, progress * 0.55);
          ctx.lineWidth = Math.max(1, n1.width * progress);
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();

          // Intense inner white-hot core filament
          ctx.beginPath();
          ctx.moveTo(n1.x, n1.y);
          ctx.lineTo(n2.x, n2.y);
          ctx.strokeStyle = `rgba(255, 255, 255, ${progress * 0.8})`;
          ctx.lineWidth = Math.max(0.6, (n1.width * 0.28) * progress);
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();
        }
        ctx.restore();
      }

      // 2. Update and render secondary comet stardust particles
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      for (let i = cometParticles.length - 1; i >= 0; i--) {
        const p = cometParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.vy -= 0.04; // Atmospheric upward ion draft
        p.life -= 1 / p.maxLife;
        p.twinkle += p.twinkleSpeed;

        if (p.life <= 0) {
          cometParticles.splice(i, 1);
          continue;
        }

        const currentSize = p.initialSize * (0.25 + p.life * 0.75);
        const currentAlpha = p.alpha * p.life * (0.8 + Math.sin(p.twinkle) * 0.2);

        // Soft atmospheric ion aura
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentSize * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(color, currentAlpha * 0.28);
        ctx.fill();

        // Core particle: bright spark or protocol color stardust
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = p.isSpark
          ? `rgba(255, 255, 255, ${currentAlpha * 0.95})`
          : hexToRgba(color, currentAlpha * 0.9);
        ctx.fill();

        // Fine sparkle cross flare on prominent spark flecks
        if (p.isSpark && p.life > 0.45 && currentSize > 1.8) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${currentAlpha * 0.75})`;
          ctx.lineWidth = 0.75;
          const flare = currentSize * 2.2;
          ctx.beginPath();
          ctx.moveTo(p.x - flare, p.y);
          ctx.lineTo(p.x + flare, p.y);
          ctx.moveTo(p.x, p.y - flare);
          ctx.lineTo(p.x, p.y + flare);
          ctx.stroke();
        }
      }
      ctx.restore();

      // 3. Radiant Comet Nucleus Head at cursor position
      if (mouseX > 0 && mouseSpeed > 0.5) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const nucleusRadius = Math.min(20 + mouseSpeed * 0.4, 36);
        const headGrad = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, nucleusRadius);
        headGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        headGrad.addColorStop(0.25, hexToRgba(color, 0.7));
        headGrad.addColorStop(0.65, hexToRgba(color, 0.18));
        headGrad.addColorStop(1, hexToRgba(color, 0));

        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, nucleusRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Render interactive holographic cockpit cursor tracking reticle
      if (mouseX > 0) {
        targetReticleAngle += 0.02;
        ctx.save();
        ctx.translate(mouseX, mouseY);

        // Rotating dashed reticle ring
        ctx.rotate(targetReticleAngle);
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.28;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.arc(0, 0, 24, 0, Math.PI * 2);
        ctx.stroke();

        // Counter-rotating outer bracket notches
        ctx.rotate(-targetReticleAngle * 2);
        ctx.setLineDash([]);
        ctx.globalAlpha = 0.4;
        const bracketSize = 32;
        // Top-left
        ctx.beginPath();
        ctx.moveTo(-bracketSize, -bracketSize + 8);
        ctx.lineTo(-bracketSize, -bracketSize);
        ctx.lineTo(-bracketSize + 8, -bracketSize);
        ctx.stroke();
        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(bracketSize, bracketSize - 8);
        ctx.lineTo(bracketSize, bracketSize);
        ctx.lineTo(bracketSize - 8, bracketSize);
        ctx.stroke();

        ctx.restore();
      }

      ctx.globalAlpha = 1.0;
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(bootTimer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('jarvis-plasma-pulse', handleCustomPulse);
      triggerPulseRef.current = null;
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#090204]">
      {/* Radial atmospheric glows */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[140px] opacity-25 transition-colors duration-1000"
        style={{ backgroundColor: color }}
      />
      <div className="absolute top-0 right-0 w-[450px] h-[450px] rounded-full blur-[120px] bg-red-950/25" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] rounded-full blur-[120px] bg-rose-950/20" />

      {/* Particle & Grid Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Holographic Scanline Overlay */}
      <div className="absolute inset-0 scanlines opacity-40 pointer-events-none" />

      {/* Vignette border */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.85)_100%)] pointer-events-none" />
    </div>
  );
};
