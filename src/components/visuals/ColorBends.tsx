"use client";

import { useEffect, useRef } from "react";
import { Clock, Mesh, OrthographicCamera, PlaneGeometry, SRGBColorSpace, Scene, ShaderMaterial, Vector2, Vector3, WebGLRenderer } from "three";
import { cn } from "@/lib/cn";

/**
 * ColorBends, from React Bits (reactbits.dev, JS + CSS variant), ported to TypeScript.
 * A WebGL shader of soft, warping colour bands. Changes from the original, for use as a page
 * backdrop: named three imports; the pointer is read from the window (the layer sits behind the
 * content, so it never receives pointer events itself); one still frame under reduced motion;
 * the container styles inline instead of ColorBends.css. Performance: renderScale draws the shader
 * at a fraction of the screen resolution (the bands are soft, so the upscale is invisible; "auto"
 * = 0.5 on laptops, 0.35 on phones) and maxFps caps how often it renders.
 */
const MAX_COLORS = 8;

const frag = `
#define MAX_COLORS ${MAX_COLORS}
uniform vec2 uCanvas;
uniform float uTime;
uniform float uSpeed;
uniform vec2 uRot;
uniform int uColorCount;
uniform vec3 uColors[MAX_COLORS];
uniform int uTransparent;
uniform float uScale;
uniform float uFrequency;
uniform float uWarpStrength;
uniform vec2 uPointer; // in NDC [-1,1]
uniform float uMouseInfluence;
uniform float uParallax;
uniform float uNoise;
uniform int uIterations;
uniform float uIntensity;
uniform float uBandWidth;
varying vec2 vUv;

void main() {
  float t = uTime * uSpeed;
  vec2 p = vUv * 2.0 - 1.0;
  p += uPointer * uParallax * 0.1;
  vec2 rp = vec2(p.x * uRot.x - p.y * uRot.y, p.x * uRot.y + p.y * uRot.x);
  vec2 q = vec2(rp.x * (uCanvas.x / uCanvas.y), rp.y);
  q /= max(uScale, 0.0001);
  q /= 0.5 + 0.2 * dot(q, q);
  q += 0.2 * cos(t) - 7.56;
  vec2 shift = vec2(0.2 * cos(t) - 7.56);
  vec2 toward = (uPointer - rp);
  q += toward * uMouseInfluence * 0.2;

    for (int j = 0; j < 5; j++) {
      if (j >= uIterations - 1) break;
      vec2 rr = sin(1.5 * (q.yx * uFrequency) + 2.0 * cos(q * uFrequency));
      q += (rr - q) * 0.15;
      shift *= 0.85;
    }

    vec3 col = vec3(0.0);
    float a = 1.0;

    if (uColorCount > 0) {
      vec2 s = q;
      vec3 sumCol = vec3(0.0);
      float cover = 0.0;
      for (int i = 0; i < MAX_COLORS; ++i) {
            if (i >= uColorCount) break;
            s -= 0.01;
            vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
            float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(i)) / 4.0);
            float kBelow = clamp(uWarpStrength, 0.0, 1.0);
            float kMix = pow(kBelow, 0.3);
            float gain = 1.0 + max(uWarpStrength - 1.0, 0.0);
            vec2 disp = (r - s) * kBelow;
            vec2 warped = s + disp * gain;
            float spare = 1.0 - kBelow * gain;
            if (spare != 0.0) warped -= shift * spare;
            float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(i)) / 4.0);
            float m = mix(m0, m1, kMix);
            float w = 1.0 - exp(-uBandWidth / exp(uBandWidth * m));
            sumCol += uColors[i] * w;
            cover = max(cover, w);
      }
      col = clamp(sumCol, 0.0, 1.0);
      a = uTransparent > 0 ? cover : 1.0;
    } else {
        vec2 s = q;
        for (int k = 0; k < 3; ++k) {
            s -= 0.01;
            vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
            float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(k)) / 4.0);
            float kBelow = clamp(uWarpStrength, 0.0, 1.0);
            float kMix = pow(kBelow, 0.3);
            float gain = 1.0 + max(uWarpStrength - 1.0, 0.0);
            vec2 disp = (r - s) * kBelow;
            vec2 warped = s + disp * gain;
            float spare = 1.0 - kBelow * gain;
            if (spare != 0.0) warped -= shift * spare;
            float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(k)) / 4.0);
            float m = mix(m0, m1, kMix);
            col[k] = 1.0 - exp(-uBandWidth / exp(uBandWidth * m));
        }
        a = uTransparent > 0 ? max(max(col.r, col.g), col.b) : 1.0;
    }

    col *= uIntensity;

    if (uNoise > 0.0001) {
      float n = fract(sin(dot(gl_FragCoord.xy + vec2(uTime), vec2(12.9898, 78.233))) * 43758.5453123);
      col += (n - 0.5) * uNoise;
      col = clamp(col, 0.0, 1.0);
    }

    vec3 rgb = (uTransparent > 0) ? col * a : col;
    gl_FragColor = vec4(rgb, a);
}
`;

const vert = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

export type ColorBendsProps = {
  className?: string;
  style?: React.CSSProperties;
  rotation?: number;
  speed?: number;
  colors?: string[];
  transparent?: boolean;
  autoRotate?: number;
  scale?: number;
  frequency?: number;
  warpStrength?: number;
  mouseInfluence?: number;
  parallax?: number;
  noise?: number;
  iterations?: number;
  intensity?: number;
  bandWidth?: number;
  /** Fraction of the screen resolution to render at, or "auto" (0.5, or 0.35 on small / touch screens). */
  renderScale?: number | "auto";
  /** Upper limit on renders per second; time still advances smoothly between them. */
  maxFps?: number;
};

type Uniforms = {
  uCanvas: { value: Vector2 };
  uTime: { value: number };
  uSpeed: { value: number };
  uRot: { value: Vector2 };
  uColorCount: { value: number };
  uColors: { value: Vector3[] };
  uTransparent: { value: number };
  uScale: { value: number };
  uFrequency: { value: number };
  uWarpStrength: { value: number };
  uPointer: { value: Vector2 };
  uMouseInfluence: { value: number };
  uParallax: { value: number };
  uNoise: { value: number };
  uIterations: { value: number };
  uIntensity: { value: number };
  uBandWidth: { value: number };
};

const toVec3 = (hex: string) => {
  const h = hex.replace("#", "").trim();
  const v =
    h.length === 3
      ? [parseInt(h[0] + h[0], 16), parseInt(h[1] + h[1], 16), parseInt(h[2] + h[2], 16)]
      : [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  return new Vector3(v[0] / 255, v[1] / 255, v[2] / 255);
};

export default function ColorBends({
  className,
  style,
  rotation = 90,
  speed = 0.2,
  colors = [],
  transparent = true,
  autoRotate = 0,
  scale = 1,
  frequency = 1,
  warpStrength = 1,
  mouseInfluence = 1,
  parallax = 0.5,
  noise = 0.15,
  iterations = 1,
  intensity = 1.5,
  bandWidth = 6,
  renderScale = 1,
  maxFps = 60,
}: ColorBendsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const materialRef = useRef<ShaderMaterial | null>(null);
  const renderOnceRef = useRef<(() => void) | null>(null);
  const rotationRef = useRef(rotation);
  const autoRotateRef = useRef(autoRotate);
  const pointerTargetRef = useRef(new Vector2(0, 0));
  const pointerCurrentRef = useRef(new Vector2(0, 0));
  const settingsRef = useRef({ speed, scale, frequency, warpStrength, mouseInfluence, parallax, noise, iterations, intensity, bandWidth, transparent });

  useEffect(() => {
    settingsRef.current = { speed, scale, frequency, warpStrength, mouseInfluence, parallax, noise, iterations, intensity, bandWidth, transparent };
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const initial = settingsRef.current;
    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const geometry = new PlaneGeometry(2, 2);
    const uniforms: Uniforms = {
      uCanvas: { value: new Vector2(1, 1) },
      uTime: { value: 0 },
      uSpeed: { value: initial.speed },
      uRot: { value: new Vector2(1, 0) },
      uColorCount: { value: 0 },
      uColors: { value: Array.from({ length: MAX_COLORS }, () => new Vector3(0, 0, 0)) },
      uTransparent: { value: initial.transparent ? 1 : 0 },
      uScale: { value: initial.scale },
      uFrequency: { value: initial.frequency },
      uWarpStrength: { value: initial.warpStrength },
      uPointer: { value: new Vector2(0, 0) },
      uMouseInfluence: { value: initial.mouseInfluence },
      uParallax: { value: initial.parallax },
      uNoise: { value: initial.noise },
      uIterations: { value: initial.iterations },
      uIntensity: { value: initial.intensity },
      uBandWidth: { value: initial.bandWidth },
    };
    const material = new ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms, premultipliedAlpha: true, transparent: true });
    materialRef.current = material;
    scene.add(new Mesh(geometry, material));

    const renderer = new WebGLRenderer({ antialias: false, powerPreference: "high-performance", alpha: true });
    rendererRef.current = renderer;
    renderer.outputColorSpace = SRGBColorSpace;
    const small = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
    const scale = renderScale === "auto" ? (small ? 0.35 : 0.5) : renderScale;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2) * scale);
    renderer.setClearColor(0x000000, initial.transparent ? 0 : 1);
    Object.assign(renderer.domElement.style, { width: "100%", height: "100%", display: "block" });
    container.appendChild(renderer.domElement);

    const clock = new Clock();
    const renderOnce = () => renderer.render(scene, camera);
    renderOnceRef.current = renderOnce;

    const setRotation = (elapsed: number) => {
      const deg = (rotationRef.current % 360) + autoRotateRef.current * elapsed;
      const rad = (deg * Math.PI) / 180;
      uniforms.uRot.value.set(Math.cos(rad), Math.sin(rad));
    };

    const handleResize = () => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      renderer.setSize(w, h, false);
      uniforms.uCanvas.value.set(w, h);
      setRotation(0);
      renderOnce();
    };
    handleResize();
    const ro = new ResizeObserver(handleResize);
    ro.observe(container);

    let raf: number | null = null;
    let elapsed = 0;
    let visible = true;
    let resumed = false;
    let sinceRender = Infinity;
    const frameGap = 1 / Math.max(1, maxFps);

    const loop = () => {
      raf = null;
      if (!visible || document.hidden) return;
      const delta = clock.getDelta();
      const dt = resumed ? 0 : delta;
      resumed = false;
      elapsed += dt;
      sinceRender += dt;
      if (sinceRender >= frameGap - 0.002) {
        const step = Math.min(sinceRender, 0.1);
        sinceRender = 0;
        uniforms.uTime.value = elapsed;
        setRotation(elapsed);
        const cur = pointerCurrentRef.current;
        cur.lerp(pointerTargetRef.current, Math.min(1, step * 8));
        uniforms.uPointer.value.copy(cur);
        renderOnce();
      }
      raf = requestAnimationFrame(loop);
    };

    const wake = () => {
      if (reduce || raf !== null || !visible || document.hidden) return;
      resumed = true;
      raf = requestAnimationFrame(loop);
    };
    const handleVisibility = () => {
      if (!document.hidden) wake();
    };
    const io = new IntersectionObserver((entries) => {
      visible = entries.some((e) => e.isIntersecting);
      wake();
    });
    io.observe(container);
    document.addEventListener("visibilitychange", handleVisibility);

    // The layer sits behind the page, so follow the pointer across the whole window
    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / (rect.width || 1)) * 2 - 1;
      const y = -(((e.clientY - rect.top) / (rect.height || 1)) * 2 - 1);
      pointerTargetRef.current.set(x, y);
    };
    if (!reduce) window.addEventListener("pointermove", handlePointerMove, { passive: true });

    if (!reduce) raf = requestAnimationFrame(loop);

    return () => {
      if (raf !== null) cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pointermove", handlePointerMove);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentElement === container) container.removeChild(renderer.domElement);
      materialRef.current = null;
      rendererRef.current = null;
      renderOnceRef.current = null;
    };
  }, [renderScale, maxFps]);

  useEffect(() => {
    const material = materialRef.current;
    if (!material) return;
    const u = material.uniforms as unknown as Uniforms;
    rotationRef.current = rotation;
    autoRotateRef.current = autoRotate;
    u.uSpeed.value = speed;
    u.uScale.value = scale;
    u.uFrequency.value = frequency;
    u.uWarpStrength.value = warpStrength;
    u.uMouseInfluence.value = mouseInfluence;
    u.uParallax.value = parallax;
    u.uNoise.value = noise;
    u.uIterations.value = iterations;
    u.uIntensity.value = intensity;
    u.uBandWidth.value = bandWidth;

    const arr = colors.filter(Boolean).slice(0, MAX_COLORS).map(toVec3);
    for (let i = 0; i < MAX_COLORS; i++) {
      const vec = u.uColors.value[i];
      if (i < arr.length) vec.copy(arr[i]);
      else vec.set(0, 0, 0);
    }
    u.uColorCount.value = arr.length;
    u.uTransparent.value = transparent ? 1 : 0;
    rendererRef.current?.setClearColor(0x000000, transparent ? 0 : 1);
    renderOnceRef.current?.();
  }, [rotation, autoRotate, speed, scale, frequency, warpStrength, mouseInfluence, parallax, noise, iterations, intensity, bandWidth, colors, transparent]);

  return <div ref={containerRef} className={cn("relative h-full w-full overflow-hidden", className)} style={style} />;
}
