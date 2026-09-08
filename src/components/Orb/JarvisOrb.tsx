import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { AssistantState } from '../../types';
import { sfx } from '../../audio/sfx';

interface JarvisOrbProps {
  state: AssistantState;
  color?: string;
  intensity?: number;
  onClick?: () => void;
}

// Generate smooth soft radial glow texture for holographic volumetric light halo
function createSoftGlowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.25, 'rgba(255, 255, 255, 0.75)');
    gradient.addColorStop(0.55, 'rgba(255, 255, 255, 0.22)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export const JarvisOrb: React.FC<JarvisOrbProps> = ({
  state,
  color = '#ff1a40',
  intensity = 1.0,
  onClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);
  const colorRef = useRef(color);
  const intensityRef = useRef(intensity);
  const onClickRef = useRef(onClick);
  const isHoveredRef = useRef(false);

  // 200ms Chromatic Aberration Glitch Burst State
  const [isChromaticActive, setIsChromaticActive] = useState(false);
  const chromaticTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerChromaticBurst = () => {
    if (chromaticTimeoutRef.current) {
      clearTimeout(chromaticTimeoutRef.current);
    }
    setIsChromaticActive(true);
    chromaticTimeoutRef.current = setTimeout(() => {
      setIsChromaticActive(false);
    }, 200);
  };

  const triggerChromaticBurstRef = useRef<(() => void) | null>(triggerChromaticBurst);
  triggerChromaticBurstRef.current = triggerChromaticBurst;

  useEffect(() => {
    onClickRef.current = onClick;
  }, [onClick]);

  useEffect(() => {
    stateRef.current = state;
    if (state === 'SPEAKING' || state === 'COMPUTING') {
      triggerChromaticBurst();
    }
  }, [state]);

  useEffect(() => {
    colorRef.current = color;
  }, [color]);

  useEffect(() => {
    intensityRef.current = intensity;
  }, [intensity]);

  useEffect(() => {
    return () => {
      if (chromaticTimeoutRef.current) {
        clearTimeout(chromaticTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 360;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 7;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Group for mouse tilt
    const orbGroup = new THREE.Group();
    scene.add(orbGroup);

    // 1a. Outer Core Geodesic Wireframe (Icosahedron)
    const coreGeometry = new THREE.IcosahedronGeometry(1.4, 2);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      wireframe: true,
      transparent: true,
      opacity: 0.65,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    orbGroup.add(coreMesh);

    // 1b. Inner Nested Counter-Rotating Core (Dodecahedron)
    const innerCoreGeo = new THREE.DodecahedronGeometry(1.05, 1);
    const innerCoreMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      wireframe: true,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const innerCoreMesh = new THREE.Mesh(innerCoreGeo, innerCoreMat);
    orbGroup.add(innerCoreMesh);

    // 2. High-density Core Nodes (Points)
    const pointsGeometry = new THREE.IcosahedronGeometry(1.39, 3);
    const pointsMaterial = new THREE.PointsMaterial({
      color: new THREE.Color(color),
      size: 0.045,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const pointsMesh = new THREE.Points(pointsGeometry, pointsMaterial);
    orbGroup.add(pointsMesh);

    // 3. Inner Solid Glow Sphere
    const innerGlowGeo = new THREE.SphereGeometry(0.95, 32, 32);
    const innerGlowMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
    });
    const innerGlowMesh = new THREE.Mesh(innerGlowGeo, innerGlowMat);
    orbGroup.add(innerGlowMesh);

    // 3b. Dynamic Electric Plasma Arc Tendrils inside the Core
    const arcCount = 18;
    const arcGeo = new THREE.BufferGeometry();
    const arcPositions = new Float32Array(arcCount * 2 * 3); // 2 points per line
    arcGeo.setAttribute('position', new THREE.BufferAttribute(arcPositions, 3));
    const arcMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      linewidth: 2,
    });
    const arcLines = new THREE.LineSegments(arcGeo, arcMat);
    orbGroup.add(arcLines);

    // 4. Orbital Ring 1 (X-axis incline)
    const ring1Geo = new THREE.TorusGeometry(2.05, 0.016, 16, 140);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    orbGroup.add(ring1);

    // 5. Orbital Ring 2 (Y-axis incline)
    const ring2Geo = new THREE.TorusGeometry(2.28, 0.018, 16, 140);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.y = Math.PI / 4;
    orbGroup.add(ring2);

    // 5b. Orbital Ring 3 (Z-axis equatorial gyroscope gimbal)
    const ring3Geo = new THREE.TorusGeometry(2.5, 0.013, 16, 140);
    const ring3Mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.z = Math.PI / 6;
    ring3.rotation.x = Math.PI / 5;
    orbGroup.add(ring3);

    // 5c. Segmented Telemetry Calibration Outer Ring
    const calibRingGeo = new THREE.TorusGeometry(2.72, 0.009, 16, 80);
    const calibRingMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
    });
    const calibRing = new THREE.Mesh(calibRingGeo, calibRingMat);
    calibRing.rotation.x = Math.PI / 2.2;
    orbGroup.add(calibRing);

    // 5d. Dual Expanding Energy Shockwave Wave Rings
    const shockwaveGeo = new THREE.RingGeometry(0.5, 0.6, 64);
    const shockwaveMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const shockwaveMesh = new THREE.Mesh(shockwaveGeo, shockwaveMat);
    orbGroup.add(shockwaveMesh);

    const shockwave2Geo = new THREE.RingGeometry(0.35, 0.42, 64);
    const shockwave2Mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const shockwaveMesh2 = new THREE.Mesh(shockwave2Geo, shockwave2Mat);
    orbGroup.add(shockwaveMesh2);

    // 5e. Orbiting Energy Satellite Nodes
    const satelliteCount = 4;
    const satelliteGeo = new THREE.BufferGeometry();
    const satellitePos = new Float32Array(satelliteCount * 3);
    satelliteGeo.setAttribute('position', new THREE.BufferAttribute(satellitePos, 3));
    const satelliteMat = new THREE.PointsMaterial({
      color: new THREE.Color('#ffffff'),
      size: 0.09,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });
    const satelliteMesh = new THREE.Points(satelliteGeo, satelliteMat);
    orbGroup.add(satelliteMesh);

    // 6. Dynamic Magnetic Vortex Swarm (420 Particles with fluid physics)
    const particleCount = 420;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleBaseR = new Float32Array(particleCount);
    const particleAngles = new Float32Array(particleCount);
    const particleSpeeds = new Float32Array(particleCount);
    const particleHeights = new Float32Array(particleCount);
    const particlePhases = new Float32Array(particleCount);
    const particleInclinations = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particleBaseR[i] = 1.55 + Math.random() * 1.65;
      particleAngles[i] = Math.random() * Math.PI * 2;
      particleSpeeds[i] = (0.006 + Math.random() * 0.016) * (Math.random() > 0.4 ? 1 : -1);
      particleHeights[i] = (Math.random() - 0.5) * 1.8;
      particlePhases[i] = Math.random() * Math.PI * 2;
      particleInclinations[i] = (Math.random() - 0.5) * 0.85;

      const r = particleBaseR[i];
      particlePos[i * 3] = r * Math.cos(particleAngles[i]);
      particlePos[i * 3 + 1] = particleHeights[i];
      particlePos[i * 3 + 2] = r * Math.sin(particleAngles[i]);
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: new THREE.Color(color),
      size: 0.052,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    orbGroup.add(particleSystem);

    // 7. Subtle Ambient & Dynamic Floating Light System for Holographic 3D Presence
    const ambientLight = new THREE.AmbientLight(new THREE.Color(color), 0.35);
    scene.add(ambientLight);

    const corePointLight = new THREE.PointLight(new THREE.Color(color), 2.2, 10, 1.2);
    orbGroup.add(corePointLight);

    const glowTexture = createSoftGlowTexture();

    // 8. Primary Floating Ambient Light Node (orbits and lags behind orb movement)
    const floatingLightGroup = new THREE.Group();
    scene.add(floatingLightGroup);

    const floatingPointLight = new THREE.PointLight(new THREE.Color(color), 2.6, 9, 1.4);
    floatingLightGroup.add(floatingPointLight);

    const glowSpriteMat = new THREE.SpriteMaterial({
      map: glowTexture,
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const glowSprite = new THREE.Sprite(glowSpriteMat);
    glowSprite.scale.set(1.9, 1.9, 1.9);
    floatingLightGroup.add(glowSprite);

    const haloGeo = new THREE.SphereGeometry(0.32, 14, 14);
    const haloMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      wireframe: true,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    floatingLightGroup.add(haloMesh);

    // 9. Secondary Counter-Floating Ambient Light (provides complementary depth)
    const counterLightGroup = new THREE.Group();
    scene.add(counterLightGroup);

    const counterPointLight = new THREE.PointLight(new THREE.Color(color), 1.2, 6, 1.8);
    counterLightGroup.add(counterPointLight);

    const counterSpriteMat = new THREE.SpriteMaterial({
      map: glowTexture,
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const counterSprite = new THREE.Sprite(counterSpriteMat);
    counterSprite.scale.set(1.4, 1.4, 1.4);
    counterLightGroup.add(counterSprite);

    // 10. Volumetric Backdrop Ambient Hologram Glow (moves smoothly with orb parallax)
    const backdropGlowMat = new THREE.SpriteMaterial({
      map: glowTexture,
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const backdropGlow = new THREE.Sprite(backdropGlowMat);
    backdropGlow.scale.set(5.5, 5.5, 1);
    backdropGlow.position.set(0, 0, -1.5);
    scene.add(backdropGlow);

    // Mouse Parallax & Hover Tracking
    let targetRotationX = 0;
    let targetRotationY = 0;
    let hoverProgress = 0;
    let surgeEnergy = 0; // Triggered on click / state change

    const triggerSurge = () => {
      surgeEnergy = 1.0;
      sfx.playConfirmation();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      // Parallax
      targetRotationY = x * 0.6;
      targetRotationX = y * 0.6;

      // Radial distance to center of the orb
      const dist = Math.sqrt(x * x + y * y);
      const isInside = dist < 0.45;

      if (isInside !== isHoveredRef.current) {
        isHoveredRef.current = isInside;
        if (isInside) {
          sfx.playHudTick();
        }
      }
    };

    const handleMouseEnter = () => {
      isHoveredRef.current = true;
      sfx.playHudTick();
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
      targetRotationX = 0;
      targetRotationY = 0;
    };

    const handleClick = () => {
      triggerSurge();
      triggerChromaticBurstRef.current?.();
      window.dispatchEvent(
        new CustomEvent('jarvis-plasma-pulse', {
          detail: { color: colorRef.current },
        })
      );
      onClickRef.current?.();
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('click', handleClick);

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      const currentState = stateRef.current;
      const currentColor = new THREE.Color(colorRef.current);

      // Smooth hover progress transition (0 -> 1)
      const targetHover = isHoveredRef.current ? 1.0 : 0.0;
      hoverProgress += (targetHover - hoverProgress) * 0.08;

      // Dissipate surge energy
      surgeEnergy *= 0.94;
      if (surgeEnergy < 0.001) surgeEnergy = 0;

      // Dynamic color with extra luminescence when hovered or surging
      const brightenedColor = currentColor
        .clone()
        .lerp(new THREE.Color(1, 1, 1), hoverProgress * 0.25 + surgeEnergy * 0.5);

      // Interpolate colors
      coreMaterial.color.lerp(brightenedColor, 0.08);
      innerCoreMat.color.lerp(brightenedColor, 0.08);
      pointsMaterial.color.lerp(brightenedColor, 0.08);
      innerGlowMat.color.lerp(brightenedColor, 0.08);
      arcMat.color.lerp(brightenedColor, 0.12);
      ring1Mat.color.lerp(brightenedColor, 0.08);
      ring2Mat.color.lerp(brightenedColor, 0.08);
      ring3Mat.color.lerp(brightenedColor, 0.08);
      calibRingMat.color.lerp(brightenedColor, 0.08);
      shockwaveMat.color.lerp(brightenedColor, 0.1);
      shockwave2Mat.color.lerp(brightenedColor, 0.1);
      particleMat.color.lerp(brightenedColor, 0.08);

      // Interpolate ambient lights & halo colors
      ambientLight.color.lerp(brightenedColor, 0.08);
      corePointLight.color.lerp(brightenedColor, 0.08);
      floatingPointLight.color.lerp(brightenedColor, 0.08);
      counterPointLight.color.lerp(brightenedColor, 0.08);
      glowSpriteMat.color.lerp(brightenedColor, 0.08);
      counterSpriteMat.color.lerp(brightenedColor, 0.08);
      backdropGlowMat.color.lerp(brightenedColor, 0.08);
      haloMat.color.lerp(brightenedColor, 0.08);

      // Opacity brightening when cursor is over the core or surging
      coreMaterial.opacity = 0.65 + hoverProgress * 0.3 + surgeEnergy * 0.35;
      innerCoreMat.opacity = 0.45 + hoverProgress * 0.3 + surgeEnergy * 0.35;
      innerGlowMat.opacity = 0.28 + hoverProgress * 0.35 + surgeEnergy * 0.45;
      pointsMaterial.opacity = 0.85 + hoverProgress * 0.15;
      pointsMaterial.size = 0.045 + hoverProgress * 0.02 + surgeEnergy * 0.03;
      ring1Mat.opacity = 0.55 + hoverProgress * 0.3 + surgeEnergy * 0.3;
      ring2Mat.opacity = 0.4 + hoverProgress * 0.3 + surgeEnergy * 0.3;
      ring3Mat.opacity = 0.35 + hoverProgress * 0.25 + surgeEnergy * 0.3;
      calibRingMat.opacity = 0.25 + hoverProgress * 0.2 + surgeEnergy * 0.25;

      // Dynamics based on assistant state & hover & surge
      let rotSpeed = 0.45 + hoverProgress * 0.35 + surgeEnergy * 1.5;
      let pulseFreq = 2.0 + hoverProgress * 2.5 + surgeEnergy * 6.0;
      let pulseAmp = 0.06 + hoverProgress * 0.05 + surgeEnergy * 0.18;

      if (currentState === 'LISTENING') {
        rotSpeed = 0.85 + hoverProgress * 0.3;
        pulseFreq = 5.0 + hoverProgress * 2.0;
        pulseAmp = 0.12 + hoverProgress * 0.04;
      } else if (currentState === 'COMPUTING') {
        rotSpeed = 2.6 + hoverProgress * 0.5;
        pulseFreq = 8.5 + hoverProgress * 3.0;
        pulseAmp = 0.16 + hoverProgress * 0.06;
      } else if (currentState === 'SPEAKING') {
        // Dramatic Vocal Resonance Physics when JARVIS is replying
        rotSpeed = 1.5 + hoverProgress * 0.4;
        pulseFreq = 8.0 + hoverProgress * 2.5;
        pulseAmp = 0.28 + Math.sin(elapsedTime * 12) * 0.08;
      }

      // 1. Dynamic Electric Plasma Lightning Arcs
      const arcPos = arcGeo.attributes.position.array as Float32Array;
      const isSpeaking = currentState === 'SPEAKING';
      const arcActivity = 0.35 + (isHoveredRef.current ? 0.75 : 0) + (isSpeaking ? 1.05 : 0) + surgeEnergy * 1.3;
      arcMat.opacity = 0.45 + arcActivity * 0.5;

      for (let i = 0; i < arcCount; i++) {
        const speedMultiplier = isSpeaking ? 18 : 9;
        const seed1 = elapsedTime * speedMultiplier + i * 2.3;
        const r1 = 0.28 + Math.sin(seed1 * 1.5) * 0.2;
        arcPos[i * 6] = Math.cos(seed1) * r1;
        arcPos[i * 6 + 1] = Math.sin(seed1 * 1.3) * r1;
        arcPos[i * 6 + 2] = Math.sin(seed1 * 0.7) * r1;

        const seed2 = elapsedTime * (speedMultiplier * 1.25) + i * 4.1;
        const r2 = (isSpeaking ? 1.55 : 1.2) + Math.cos(seed2) * 0.25;
        arcPos[i * 6 + 3] = Math.sin(seed2) * r2;
        arcPos[i * 6 + 4] = Math.cos(seed2 * 1.1) * r2;
        arcPos[i * 6 + 5] = Math.cos(seed2 * 0.8) * r2;
      }
      arcGeo.attributes.position.needsUpdate = true;

      // 2. Dual Concentric Energy Shockwave Wave Ring Expansion
      const shockwaveCycle = (elapsedTime * (isSpeaking ? 2.8 : 0.85) + surgeEnergy * 2.0) % 1.0;
      const shockScale = 1.0 + shockwaveCycle * (isSpeaking ? 4.8 : 4.0);
      shockwaveMesh.scale.set(shockScale, shockScale, shockScale);
      shockwaveMat.opacity = Math.max(0, (1 - shockwaveCycle) * (isSpeaking ? 0.9 : 0.65) + surgeEnergy * 0.45);
      shockwaveMesh.rotation.z += isSpeaking ? 0.02 : 0.006;

      const shockwaveCycle2 = ((elapsedTime * (isSpeaking ? 2.8 : 0.85) + surgeEnergy * 2.0) + 0.45) % 1.0;
      const shockScale2 = 1.0 + shockwaveCycle2 * (isSpeaking ? 4.2 : 3.5);
      shockwaveMesh2.scale.set(shockScale2, shockScale2, shockScale2);
      shockwave2Mat.opacity = Math.max(0, (1 - shockwaveCycle2) * (isSpeaking ? 0.75 : 0.45) + surgeEnergy * 0.35);
      shockwaveMesh2.rotation.z -= isSpeaking ? 0.016 : 0.005;

      // 3. Orbiting Energy Satellite Nodes
      const satPosArr = satelliteGeo.attributes.position.array as Float32Array;
      for (let s = 0; s < satelliteCount; s++) {
        const satAngle = elapsedTime * (1.2 + s * 0.4) * rotSpeed + (s * Math.PI) / 2;
        const satR = 2.05 + s * 0.2;
        satPosArr[s * 3] = satR * Math.cos(satAngle);
        satPosArr[s * 3 + 1] = Math.sin(satAngle * 1.3) * 0.7;
        satPosArr[s * 3 + 2] = satR * Math.sin(satAngle);
      }
      satelliteGeo.attributes.position.needsUpdate = true;

      // 4. Dynamic Magnetic Vortex Particle Swarm Physics
      const pPos = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        particleAngles[i] += particleSpeeds[i] * rotSpeed * (1 + surgeEnergy * 1.5);
        const dynamicR =
          particleBaseR[i] *
          (1 + Math.sin(elapsedTime * 2.2 + particlePhases[i]) * 0.12 + surgeEnergy * 0.35);
        const inc = particleInclinations[i];
        const x = dynamicR * Math.cos(particleAngles[i]);
        const z = dynamicR * Math.sin(particleAngles[i]);
        const y = particleHeights[i] + Math.sin(elapsedTime * 2.5 + particlePhases[i]) * 0.22;

        pPos[i * 3] = x * Math.cos(inc) - y * Math.sin(inc);
        pPos[i * 3 + 1] = x * Math.sin(inc) + y * Math.cos(inc);
        pPos[i * 3 + 2] = z;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Rotations & Gyroscopic Counter-Rotations
      const vocalWobble = isSpeaking ? Math.sin(elapsedTime * 8) * 0.15 : 0;
      coreMesh.rotation.y += 0.009 * rotSpeed;
      coreMesh.rotation.x += 0.004 * rotSpeed;

      innerCoreMesh.rotation.y -= 0.014 * rotSpeed;
      innerCoreMesh.rotation.z += 0.007 * rotSpeed;

      pointsMesh.rotation.y += 0.009 * rotSpeed;
      pointsMesh.rotation.x += 0.004 * rotSpeed;

      ring1.rotation.z += 0.015 * rotSpeed;
      ring1.rotation.x = Math.PI / 3 + vocalWobble;
      ring2.rotation.z -= 0.013 * rotSpeed;
      ring2.rotation.y = Math.PI / 4 + vocalWobble * 0.7;
      ring3.rotation.y += 0.012 * rotSpeed;
      ring3.rotation.z += 0.009 * rotSpeed;
      ring3.rotation.x = Math.PI / 5 - vocalWobble * 0.5;
      calibRing.rotation.z += 0.006 * rotSpeed;
      particleSystem.rotation.y += 0.003 * rotSpeed;

      // Pulse & Expansion calculation
      const vocalBreath = isSpeaking ? Math.sin(elapsedTime * 10) * 0.14 + Math.cos(elapsedTime * 6) * 0.08 : 0;
      const pulse = 1 + Math.sin(elapsedTime * pulseFreq) * pulseAmp + vocalBreath;
      const hoverScaleMultiplier = 1 + hoverProgress * 0.2 + surgeEnergy * 0.3;
      const finalCoreScale = pulse * hoverScaleMultiplier;

      coreMesh.scale.set(finalCoreScale, finalCoreScale, finalCoreScale);
      innerCoreMesh.scale.set(finalCoreScale * 0.95, finalCoreScale * 0.95, finalCoreScale * 0.95);
      pointsMesh.scale.set(finalCoreScale, finalCoreScale, finalCoreScale);
      innerGlowMesh.scale.set(
        finalCoreScale * (1.1 + hoverProgress * 0.15),
        finalCoreScale * (1.1 + hoverProgress * 0.15),
        finalCoreScale * (1.1 + hoverProgress * 0.15)
      );

      // Rings slightly expand outward on hover / surge
      const ringScale = 1 + hoverProgress * 0.08 + surgeEnergy * 0.18;
      ring1.scale.set(ringScale, ringScale, ringScale);
      ring2.scale.set(ringScale, ringScale, ringScale);
      ring3.scale.set(ringScale, ringScale, ringScale);
      calibRing.scale.set(ringScale, ringScale, ringScale);

      // Organic gentle floating drift for the entire orb in 3D space
      const orbFloatX = Math.sin(elapsedTime * 1.1) * 0.06;
      const orbFloatY = Math.cos(elapsedTime * 1.3) * 0.09;
      orbGroup.position.set(orbFloatX, orbFloatY, 0);

      // Smooth mouse tilt
      orbGroup.rotation.y += (targetRotationY - orbGroup.rotation.y) * 0.06;
      orbGroup.rotation.x += (targetRotationX - orbGroup.rotation.x) * 0.06;

      // Floating ambient light dynamics and tracking in 3D space
      const curIntensity = intensityRef.current;
      const floatOrbitSpeed = 0.85 + (currentState === 'COMPUTING' ? 1.3 : currentState === 'SPEAKING' ? 0.7 : 0);
      const floatRadiusX = 2.2 + Math.sin(elapsedTime * 0.75) * 0.3;
      const floatRadiusY = 1.6 + Math.cos(elapsedTime * 0.95) * 0.25;
      const floatRadiusZ = 1.1 + Math.sin(elapsedTime * 1.15) * 0.35;

      const targetLightX = orbGroup.position.x + Math.sin(elapsedTime * floatOrbitSpeed) * floatRadiusX + targetRotationY * 1.6;
      const targetLightY = orbGroup.position.y + Math.cos(elapsedTime * floatOrbitSpeed * 0.75) * floatRadiusY - targetRotationX * 1.6;
      const targetLightZ = orbGroup.position.z + Math.sin(elapsedTime * floatOrbitSpeed * 0.6) * floatRadiusZ + 0.85;

      floatingLightGroup.position.lerp(new THREE.Vector3(targetLightX, targetLightY, targetLightZ), 0.055);

      const counterTargetX = orbGroup.position.x - Math.sin(elapsedTime * floatOrbitSpeed * 0.8 + 1.4) * (floatRadiusX * 0.8) + targetRotationY * 0.8;
      const counterTargetY = orbGroup.position.y - Math.cos(elapsedTime * floatOrbitSpeed * 0.6 + 1.4) * (floatRadiusY * 0.8) - targetRotationX * 0.8;
      const counterTargetZ = orbGroup.position.z - Math.sin(elapsedTime * floatOrbitSpeed * 0.7) * floatRadiusZ - 0.5;

      counterLightGroup.position.lerp(new THREE.Vector3(counterTargetX, counterTargetY, counterTargetZ), 0.04);

      backdropGlow.position.x += (orbGroup.position.x + targetRotationY * 0.9 - backdropGlow.position.x) * 0.045;
      backdropGlow.position.y += (orbGroup.position.y - targetRotationX * 0.9 - backdropGlow.position.y) * 0.045;

      const ambientPulse = 1 + Math.sin(elapsedTime * pulseFreq) * (pulseAmp * 1.2);
      floatingPointLight.intensity = (2.6 + hoverProgress * 1.2 + surgeEnergy * 3.2) * curIntensity * ambientPulse;
      corePointLight.intensity = (2.2 + hoverProgress * 1.0 + surgeEnergy * 2.8) * curIntensity * ambientPulse;
      counterPointLight.intensity = (1.2 + hoverProgress * 0.6 + surgeEnergy * 1.4) * curIntensity;

      const glowScale = (1.9 + hoverProgress * 0.4 + surgeEnergy * 0.8) * ambientPulse;
      glowSprite.scale.set(glowScale, glowScale, glowScale);
      glowSpriteMat.opacity = 0.48 + hoverProgress * 0.2 + surgeEnergy * 0.28;

      counterSprite.scale.setScalar(1.4 * ambientPulse);
      backdropGlow.scale.setScalar(5.5 + (isSpeaking ? 0.8 : 0) + hoverProgress * 0.5);
      backdropGlowMat.opacity = 0.22 + (isSpeaking ? 0.1 : 0) + hoverProgress * 0.08;

      haloMesh.rotation.x += 0.018;
      haloMesh.rotation.y += 0.024;
      const haloScale = 0.9 + Math.sin(elapsedTime * 3) * 0.15 + hoverProgress * 0.2;
      haloMesh.scale.set(haloScale, haloScale, haloScale);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('click', handleClick);
      resizeObserver.disconnect();
      renderer.dispose();
      coreGeometry.dispose();
      coreMaterial.dispose();
      innerCoreGeo.dispose();
      innerCoreMat.dispose();
      pointsGeometry.dispose();
      pointsMaterial.dispose();
      innerGlowGeo.dispose();
      innerGlowMat.dispose();
      arcGeo.dispose();
      arcMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      ring3Geo.dispose();
      ring3Mat.dispose();
      calibRingGeo.dispose();
      calibRingMat.dispose();
      shockwaveGeo.dispose();
      shockwaveMat.dispose();
      shockwave2Geo.dispose();
      shockwave2Mat.dispose();
      satelliteGeo.dispose();
      satelliteMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      glowTexture.dispose();
      glowSpriteMat.dispose();
      counterSpriteMat.dispose();
      backdropGlowMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
    };
  }, []);

  return (
    <div
      className={`relative flex items-center justify-center w-full h-full min-h-screen min-w-[100vw] pointer-events-auto cursor-pointer group select-none transition-transform duration-300 ${
        isChromaticActive ? 'orb-chromatic-aberration' : ''
      }`}
      onClick={triggerChromaticBurst}
    >
      {/* Dynamic Floating Ambient Hologram Under-glow */}
      <div
        className="absolute inset-6 rounded-full pointer-events-none transition-all duration-700 blur-3xl opacity-35 group-hover:opacity-55"
        style={{
          background: `radial-gradient(circle, ${color}66 0%, ${color}22 45%, transparent 72%)`,
          transform: `scale(${state === 'SPEAKING' ? 1.3 : state === 'COMPUTING' ? 1.2 : 1})`,
        }}
      />

      {/* Holographic Arc Reactor HUD Framing Rings */}
      <div className="absolute inset-2 sm:inset-4 pointer-events-none flex items-center justify-center">
        {/* Outer Rotating Segmented Compass Ring */}
        <svg
          className="w-full h-full animate-[spin_60s_linear_infinite] opacity-40 group-hover:opacity-75 transition-opacity duration-500"
          viewBox="0 0 200 200"
        >
          <circle
            cx="100"
            cy="100"
            r="94"
            fill="none"
            stroke={color}
            strokeWidth="0.8"
            strokeDasharray="4 8"
          />
          <circle
            cx="100"
            cy="100"
            r="89"
            fill="none"
            stroke={color}
            strokeWidth="0.4"
            strokeDasharray="16 28"
          />
          {/* Degree Tick Markers */}
          <line x1="100" y1="2" x2="100" y2="8" stroke={color} strokeWidth="1.2" />
          <line x1="100" y1="192" x2="100" y2="198" stroke={color} strokeWidth="1.2" />
          <line x1="2" y1="100" x2="8" y2="100" stroke={color} strokeWidth="1.2" />
          <line x1="192" y1="100" x2="198" y2="100" stroke={color} strokeWidth="1.2" />
        </svg>

        {/* Counter-Rotating Inner Holographic Ring */}
        <svg
          className="absolute inset-6 sm:inset-8 w-[calc(100%-3rem)] h-[calc(100%-3rem)] animate-[spin_40s_linear_infinite_reverse] opacity-25 group-hover:opacity-50 transition-opacity duration-500"
          viewBox="0 0 160 160"
        >
          <circle
            cx="80"
            cy="80"
            r="74"
            fill="none"
            stroke={color}
            strokeWidth="0.6"
            strokeDasharray="2 12"
          />
        </svg>

        {/* Tactical Corner HUD Reticles */}
        <div
          className="absolute top-2 left-2 w-4 h-4 border-t border-l opacity-30 group-hover:opacity-80 transition-opacity duration-300"
          style={{ borderColor: color }}
        />
        <div
          className="absolute top-2 right-2 w-4 h-4 border-t border-r opacity-30 group-hover:opacity-80 transition-opacity duration-300"
          style={{ borderColor: color }}
        />
        <div
          className="absolute bottom-2 left-2 w-4 h-4 border-b border-l opacity-30 group-hover:opacity-80 transition-opacity duration-300"
          style={{ borderColor: color }}
        />
        <div
          className="absolute bottom-2 right-2 w-4 h-4 border-b border-r opacity-30 group-hover:opacity-80 transition-opacity duration-300"
          style={{ borderColor: color }}
        />

        {/* Holographic Telemetry Status Badge */}
        <div
          className="absolute -bottom-6 flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/20 bg-black/60 backdrop-blur-md text-[10px] font-mono tracking-widest uppercase transition-all duration-300 group-hover:border-red-400/50 group-hover:scale-105"
          style={{ color }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-ping"
            style={{ backgroundColor: color }}
          />
          <span>SYS::MK85 // {state}</span>
        </div>
      </div>

      <div ref={containerRef} className="w-full h-full relative z-10" />
    </div>
  );
};

