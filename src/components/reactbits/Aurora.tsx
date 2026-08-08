/* biome-ignore-all lint/correctness/useExhaustiveDependencies: legacy vendored effect logic */
"use client"
import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Color, Triangle } from "ogl";

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;

uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;

out vec4 fragColor;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v){
  const vec4 C = vec4(
      0.211324865405187, 0.366025403784439,
      -0.577350269189626, 0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);

  vec3 p = permute(
      permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0)
  );

  vec3 m = max(
      0.5 - vec3(
          dot(x0, x0),
          dot(x12.xy, x12.xy),
          dot(x12.zw, x12.zw)
      ), 
      0.0
  );
  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

struct ColorStop {
  vec3 color;
  float position;
};

#define COLOR_RAMP(colors, factor, finalColor) {              \
  int index = 0;                                            \
  for (int i = 0; i < 2; i++) {                               \
     ColorStop currentColor = colors[i];                    \
     bool isInBetween = currentColor.position <= factor;    \
     index = int(mix(float(index), float(i), float(isInBetween))); \
  }                                                         \
  ColorStop currentColor = colors[index];                   \
  ColorStop nextColor = colors[index + 1];                  \
  float range = nextColor.position - currentColor.position; \
  float lerpFactor = (factor - currentColor.position) / range; \
  finalColor = mix(currentColor.color, nextColor.color, lerpFactor); \
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  
  ColorStop colors[3];
  colors[0] = ColorStop(uColorStops[0], 0.0);
  colors[1] = ColorStop(uColorStops[1], 0.5);
  colors[2] = ColorStop(uColorStops[2], 1.0);
  
  vec3 rampColor;
  COLOR_RAMP(colors, uv.x, rampColor);
  
  float height = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
  height = exp(height);
  height = (uv.y * 2.0 - height + 0.2);
  float intensity = 0.6 * height;
  
  float midPoint = 0.20;
  float auroraAlpha = smoothstep(midPoint - uBlend * 0.5, midPoint + uBlend * 0.5, intensity);
  
  vec3 auroraColor = intensity * rampColor;
  
  // Calculate luminance (brightness) using perception-based weights
  float luminance = dot(auroraColor, vec3(0.299, 0.587, 0.114));
  
  // Adjust alpha based on luminance - darker colors become more transparent
  float finalAlpha = auroraAlpha * smoothstep(0.0, 0.4, luminance);
  
  fragColor = vec4(auroraColor, finalAlpha);
}
`;

interface AuroraProps {
  colorStops?: string[];
  amplitude?: number;
  blend?: number;
  time?: number;
  speed?: number;
}

export default function Aurora(props: AuroraProps) {
  const {
    colorStops = ["#00d8ff", "#7cff67", "#00d8ff"],
    amplitude = 1.0,
    blend = 0.5,
  } = props;
  const propsRef = useRef<AuroraProps>(props);
  propsRef.current = props;

  const ctnDom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctn = ctnDom.current;
    if (!ctn) return;

    const renderer = new Renderer({
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      dpr: Math.min(window.devicePixelRatio || 1, 1.5),
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.canvas.style.backgroundColor = "transparent";

    const mobileQuery = window.matchMedia("(max-width: 767px), (pointer: coarse)");
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    const geometry = new Triangle(gl);
    if (geometry.attributes.uv) {
      // Define an interface that matches the geometry attributes structure
      interface GeometryAttributes {
        [key: string]: unknown;
        uv?: unknown;
      }
      delete (geometry.attributes as GeometryAttributes).uv;
    }

    const colorStopsArray = colorStops.map((hex) => {
      const c = new Color(hex);
      return [c.r, c.g, c.b];
    });

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uAmplitude: { value: amplitude },
        uColorStops: { value: colorStopsArray },
        uResolution: { value: [ctn.offsetWidth, ctn.offsetHeight] },
        uBlend: { value: blend },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });
    ctn.appendChild(gl.canvas);

    let cachedStopsKey = colorStops.join("|");
    let animateId = 0;
    let isRunning = false;
    let isIntersecting = true;
    let isDocumentVisible = document.visibilityState === "visible";
    let prefersReducedMotion = reducedMotionQuery.matches;
    let lastRenderedAt = 0;
    const frameInterval = mobileQuery.matches ? 1000 / 30 : 1000 / 60;

    const syncUniforms = () => {
      program.uniforms.uAmplitude.value = propsRef.current.amplitude ?? 1.0;
      program.uniforms.uBlend.value = propsRef.current.blend ?? 0.5;

      const stops = propsRef.current.colorStops ?? colorStops;
      const stopsKey = stops.join("|");
      if (stopsKey !== cachedStopsKey) {
        cachedStopsKey = stopsKey;
        program.uniforms.uColorStops.value = stops.map((hex: string) => {
          const color = new Color(hex);
          return [color.r, color.g, color.b];
        });
      }
    };

    const render = (t: number) => {
      const { time = t * 0.01, speed = 1.0 } = propsRef.current;
      program.uniforms.uTime.value = time * speed * 0.1;
      syncUniforms();
      renderer.render({ scene: mesh });
    };

    const resize = () => {
      const width = ctn.clientWidth;
      const height = ctn.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height);
      program.uniforms.uResolution.value = [gl.canvas.width, gl.canvas.height];
      if (!isRunning) render(0);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(ctn);

    const update = (t: number) => {
      animateId = requestAnimationFrame(update);
      if (t - lastRenderedAt < frameInterval) return;
      lastRenderedAt = t;
      render(t);
    };

    const syncAnimation = () => {
      const shouldRun =
        isDocumentVisible && isIntersecting && !prefersReducedMotion;

      if (shouldRun && !isRunning) {
        isRunning = true;
        lastRenderedAt = 0;
        animateId = requestAnimationFrame(update);
      } else if (!shouldRun && isRunning) {
        isRunning = false;
        cancelAnimationFrame(animateId);
      }

      if (!shouldRun && isDocumentVisible && isIntersecting) render(0);
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
    intersectionObserver.observe(ctn);

    resize();
    syncAnimation();

    return () => {
      cancelAnimationFrame(animateId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      reducedMotionQuery.removeEventListener(
        "change",
        handleReducedMotionChange,
      );
      if (ctn && gl.canvas.parentNode === ctn) {
        ctn.removeChild(gl.canvas);
      }
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [amplitude]);

  return <div ref={ctnDom} className="absolute inset-0 -z-10 w-full h-1/2 md:h-full" />;
}
