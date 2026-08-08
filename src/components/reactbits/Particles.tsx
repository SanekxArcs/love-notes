/* biome-ignore-all lint/correctness/useExhaustiveDependencies: legacy vendored effect logic */
"use client";
import type React from "react";
import { useEffect, useRef } from "react";
import { Renderer, Camera, Geometry, Program, Mesh } from "ogl";

interface ParticlesProps {
  particleCount?: number;
  particleSpread?: number;
  speed?: number;
  particleColors?: string[];
  moveParticlesOnHover?: boolean;
  particleHoverFactor?: number;
  alphaParticles?: boolean;
  particleBaseSize?: number;
  sizeRandomness?: number;
  cameraDistance?: number;
  disableRotation?: boolean;
  className?: string;
}

const defaultColors: string[] = ["#ffffff", "#ffffff", "#ffffff"];

const hexToRgb = (hex: string): [number, number, number] => {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const int = parseInt(hex, 16);
  const r = ((int >> 16) & 255) / 255;
  const g = ((int >> 8) & 255) / 255;
  const b = (int & 255) / 255;
  return [r, g, b];
};

const vertex = /* glsl */ `
  attribute vec3 position;
  attribute vec4 random;
  attribute vec3 color;
  
  uniform mat4 modelMatrix;
  uniform mat4 viewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uTime;
  uniform float uSpread;
  uniform float uBaseSize;
  uniform float uSizeRandomness;
  
  varying vec4 vRandom;
  varying vec3 vColor;
  
  void main() {
    vRandom = random;
    vColor = color;
    
    vec3 pos = position * uSpread;
    pos.z *= 10.0;
    
    vec4 mPos = modelMatrix * vec4(pos, 1.0);
    float t = uTime;
    mPos.x += sin(t * random.z + 6.28 * random.w) * mix(0.1, 1.5, random.x);
    mPos.y += sin(t * random.y + 6.28 * random.x) * mix(0.1, 1.5, random.w);
    mPos.z += sin(t * random.w + 6.28 * random.y) * mix(0.1, 1.5, random.z);
    
    vec4 mvPos = viewMatrix * mPos;
    gl_PointSize = (uBaseSize * (1.0 + uSizeRandomness * (random.x - 0.5))) / length(mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  
  uniform float uTime;
  uniform float uAlphaParticles;
  varying vec4 vRandom;
  varying vec3 vColor;
  
  void main() {
    vec2 uv = gl_PointCoord.xy;
    float d = length(uv - vec2(0.5));
    
    if(uAlphaParticles < 0.5) {
      if(d > 0.5) {
        discard;
      }
      gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), 1.0);
    } else {
      float circle = smoothstep(0.5, 0.4, d) * 0.8;
      gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), circle);
    }
  }
`;

const Particles: React.FC<ParticlesProps> = ({
  particleCount = 200,
  particleSpread = 10,
  speed = 0.1,
  particleColors,
  moveParticlesOnHover = false,
  particleHoverFactor = 1,
  alphaParticles = false,
  particleBaseSize = 100,
  sizeRandomness = 1,
  cameraDistance = 20,
  disableRotation = false,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const mobileQuery = window.matchMedia("(max-width: 767px), (pointer: coarse)");
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const renderer = new Renderer({
      depth: false,
      alpha: true,
      dpr: Math.min(window.devicePixelRatio || 1, 1.5),
    });
    const gl = renderer.gl;
    container.appendChild(gl.canvas);
    gl.clearColor(0, 0, 0, 0);

    const camera = new Camera(gl, { fov: 15 });
    camera.position.set(0, 0, cameraDistance);

    let containerRect = container.getBoundingClientRect();
    let renderWhenPaused: (() => void) | undefined;
    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (!width || !height) return;
      containerRect = container.getBoundingClientRect();
      renderer.setSize(width, height);
      camera.perspective({ aspect: width / height });
      renderWhenPaused?.();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const refreshContainerRect = () => {
      containerRect = container.getBoundingClientRect();
    };
    const handlePointerMove = (e: PointerEvent) => {
      if (!containerRect.width || !containerRect.height) return;
      const x = ((e.clientX - containerRect.left) / containerRect.width) * 2 - 1;
      const y = -(
        ((e.clientY - containerRect.top) / containerRect.height) * 2 -
        1
      );
      mouseRef.current = { x, y };
    };

    if (moveParticlesOnHover) {
      container.addEventListener("pointerenter", refreshContainerRect);
      container.addEventListener("pointermove", handlePointerMove);
    }

    const count = mobileQuery.matches
      ? Math.min(particleCount, 150)
      : particleCount;
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count * 4);
    const colors = new Float32Array(count * 3);
    const palette =
      particleColors && particleColors.length > 0
        ? particleColors
        : defaultColors;

    for (let i = 0; i < count; i++) {
      let x: number, y: number, z: number, len: number;
      do {
        x = Math.random() * 2 - 1;
        y = Math.random() * 2 - 1;
        z = Math.random() * 2 - 1;
        len = x * x + y * y + z * z;
      } while (len > 1 || len === 0);
      const r = Math.cbrt(Math.random());
      positions.set([x * r, y * r, z * r], i * 3);
      randoms.set(
        [Math.random(), Math.random(), Math.random(), Math.random()],
        i * 4
      );
      const col = hexToRgb(palette[Math.floor(Math.random() * palette.length)]);
      colors.set(col, i * 3);
    }

    const geometry = new Geometry(gl, {
      position: { size: 3, data: positions },
      random: { size: 4, data: randoms },
      color: { size: 3, data: colors },
    });

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uSpread: { value: particleSpread },
        uBaseSize: { value: particleBaseSize },
        uSizeRandomness: { value: sizeRandomness },
        uAlphaParticles: { value: alphaParticles ? 1 : 0 },
      },
      transparent: true,
      depthTest: false,
    });

    const particles = new Mesh(gl, { mode: gl.POINTS, geometry, program });

    let animationFrameId = 0;
    let lastTime = performance.now();
    let lastRenderedAt = 0;
    let elapsed = 0;
    let isRunning = false;
    let isIntersecting = true;
    let isDocumentVisible = document.visibilityState === "visible";
    let prefersReducedMotion = reducedMotionQuery.matches;
    const frameInterval = mobileQuery.matches ? 1000 / 30 : 1000 / 60;

    const render = () => {
      program.uniforms.uTime.value = elapsed * 0.001;

      if (moveParticlesOnHover) {
        particles.position.x = -mouseRef.current.x * particleHoverFactor;
        particles.position.y = -mouseRef.current.y * particleHoverFactor;
      } else {
        particles.position.x = 0;
        particles.position.y = 0;
      }

      if (!disableRotation) {
        particles.rotation.x = Math.sin(elapsed * 0.0002) * 0.1;
        particles.rotation.y = Math.cos(elapsed * 0.0005) * 0.15;
        particles.rotation.z += 0.01 * speed;
      }

      renderer.render({ scene: particles, camera });
    };
    renderWhenPaused = () => {
      if (!isRunning) render();
    };

    const update = (t: number) => {
      animationFrameId = requestAnimationFrame(update);
      if (t - lastRenderedAt < frameInterval) return;

      const delta = Math.min(t - lastTime, 50);
      lastTime = t;
      lastRenderedAt = t;
      elapsed += delta * speed;
      render();
    };

    const syncAnimation = () => {
      const shouldRun =
        isDocumentVisible && isIntersecting && !prefersReducedMotion;

      if (shouldRun && !isRunning) {
        isRunning = true;
        lastTime = performance.now();
        lastRenderedAt = 0;
        animationFrameId = requestAnimationFrame(update);
      } else if (!shouldRun && isRunning) {
        isRunning = false;
        cancelAnimationFrame(animationFrameId);
      }

      if (!shouldRun && isDocumentVisible && isIntersecting) render();
    };

    const handleVisibilityChange = () => {
      isDocumentVisible = document.visibilityState === "visible";
      syncAnimation();
    };
    const handleReducedMotionChange = (event: MediaQueryListEvent) => {
      prefersReducedMotion = event.matches;
      syncAnimation();
    };
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isIntersecting = entry?.isIntersecting ?? false;
      syncAnimation();
    });

    document.addEventListener("visibilitychange", handleVisibilityChange);
    reducedMotionQuery.addEventListener("change", handleReducedMotionChange);
    intersectionObserver.observe(container);
    render();
    syncAnimation();

    return () => {
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      reducedMotionQuery.removeEventListener(
        "change",
        handleReducedMotionChange,
      );
      if (moveParticlesOnHover) {
        container.removeEventListener("pointerenter", refreshContainerRect);
        container.removeEventListener("pointermove", handlePointerMove);
      }
      cancelAnimationFrame(animationFrameId);
      renderWhenPaused = undefined;
      if (container.contains(gl.canvas)) {
        container.removeChild(gl.canvas);
      }
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [
    particleCount,
    particleSpread,
    speed,
    moveParticlesOnHover,
    particleHoverFactor,
    alphaParticles,
    particleBaseSize,
    sizeRandomness,
    cameraDistance,
    disableRotation,
  ]);

  return (
    <div ref={containerRef} className={`relative w-full h-full ${className}`} />
  );
};

export default Particles;
