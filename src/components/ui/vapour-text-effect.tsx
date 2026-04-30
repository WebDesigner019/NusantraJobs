"use client";
import React, { useRef, useEffect, useState, createElement, useMemo, useCallback, memo } from "react";

export enum Tag {
  H1 = "h1",
  H2 = "h2",
  H3 = "h3",
  P = "p",
}

type VaporizeTextCycleProps = {
  texts: string[];
  font?: { fontFamily?: string; fontSize?: string; fontWeight?: number };
  color?: string;
  spread?: number;
  density?: number;
  animation?: { vaporizeDuration?: number; fadeInDuration?: number; waitDuration?: number };
  direction?: "left-to-right" | "right-to-left";
  alignment?: "left" | "center" | "right";
  tag?: Tag;
};

type Particle = {
  x: number; y: number; originalX: number; originalY: number;
  color: string; opacity: number; originalAlpha: number;
  velocityX: number; velocityY: number; angle: number; speed: number;
  shouldFadeQuickly?: boolean;
};

type TextBoundaries = { left: number; right: number; width: number };

declare global {
  interface HTMLCanvasElement { textBoundaries?: TextBoundaries; }
}

function transformValue(value: number, inRange: [number, number], outRange: [number, number], clamp = false) {
  const [inMin, inMax] = inRange;
  const [outMin, outMax] = outRange;
  let result = ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
  if (clamp) result = Math.max(Math.min(result, Math.max(outMin, outMax)), Math.min(outMin, outMax));
  return result;
}

function calculateVaporizeSpread(fontSize: number) {
  return Math.max(2, fontSize / 20);
}

function parseColor(color: string): string {
  return color;
}

function useIsInView(ref: React.RefObject<HTMLElement>) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => setInView(e.isIntersecting));
    }, { threshold: 0.01 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref]);
  return inView;
}

function resetParticles(particles: Particle[]) {
  particles.forEach((p) => {
    p.x = p.originalX;
    p.y = p.originalY;
    p.opacity = p.originalAlpha;
    p.color = p.color.replace(/[\d.]+\)$/, `${p.originalAlpha})`);
    p.velocityX = 0; p.velocityY = 0; p.angle = 0; p.speed = 0;
  });
}

const updateParticles = (
  particles: Particle[], vaporizeX: number, deltaTime: number,
  MULTIPLIED_VAPORIZE_SPREAD: number, VAPORIZE_DURATION: number,
  direction: string, density: number
) => {
  let allVaporized = true;
  particles.forEach((particle) => {
    const shouldVaporize = direction === "left-to-right"
      ? particle.originalX <= vaporizeX
      : particle.originalX >= vaporizeX;

    if (shouldVaporize) {
      if (particle.speed === 0) {
        particle.angle = Math.random() * Math.PI * 2;
        particle.speed = (Math.random() * 1 + 0.5) * MULTIPLIED_VAPORIZE_SPREAD;
        particle.shouldFadeQuickly = Math.random() > density;
      }
      particle.velocityX = Math.cos(particle.angle) * particle.speed;
      particle.velocityY = Math.sin(particle.angle) * particle.speed - 0.3;
      particle.x += particle.velocityX * deltaTime * 60;
      particle.y += particle.velocityY * deltaTime * 60;
      const fadeRate = particle.shouldFadeQuickly ? 3 : 1.2;
      particle.opacity = Math.max(0, particle.opacity - deltaTime * fadeRate);
      particle.color = particle.color.replace(/[\d.]+\)$/, `${particle.opacity})`);
      if (particle.opacity > 0.01) allVaporized = false;
    } else {
      allVaporized = false;
    }
  });
  return allVaporized;
};

const renderParticles = (ctx: CanvasRenderingContext2D, particles: Particle[], dpr: number) => {
  ctx.save();
  particles.forEach((p) => {
    if (p.opacity <= 0.01) return;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, 1, 1);
  });
  ctx.restore();
};

const createParticles = (
  ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, text: string,
  textX: number, textY: number, font: string, color: string,
  alignment: "left" | "center" | "right"
) => {
  const particles: Particle[] = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = alignment;
  ctx.textBaseline = "middle";
  ctx.imageSmoothingQuality = "high";
  ctx.imageSmoothingEnabled = true;

  const metrics = ctx.measureText(text);
  let textLeft;
  const textWidth = metrics.width;
  if (alignment === "center") textLeft = textX - textWidth / 2;
  else if (alignment === "left") textLeft = textX;
  else textLeft = textX - textWidth;

  const textBoundaries = { left: textLeft, right: textLeft + textWidth, width: textWidth };

  ctx.fillText(text, textX, textY);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const currentDPR = canvas.width / parseInt(canvas.style.width);
  const sampleRate = Math.max(1, Math.round(currentDPR / 3));

  for (let y = 0; y < canvas.height; y += sampleRate) {
    for (let x = 0; x < canvas.width; x += sampleRate) {
      const index = (y * canvas.width + x) * 4;
      const alpha = data[index + 3];
      if (alpha > 0) {
        const originalAlpha = (alpha / 255) * (sampleRate / currentDPR);
        particles.push({
          x, y, originalX: x, originalY: y,
          color: `rgba(${data[index]}, ${data[index + 1]}, ${data[index + 2]}, ${originalAlpha})`,
          opacity: originalAlpha, originalAlpha,
          velocityX: 0, velocityY: 0, angle: 0, speed: 0,
        });
      }
    }
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  return { particles, textBoundaries };
};

const renderCanvas = ({
  framerProps, canvasRef, wrapperSize, particlesRef, globalDpr, currentTextIndex,
}: any) => {
  const canvas = canvasRef.current;
  if (!canvas || !wrapperSize.width || !wrapperSize.height) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { width, height } = wrapperSize;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  canvas.width = Math.floor(width * globalDpr);
  canvas.height = Math.floor(height * globalDpr);

  const fontSize = parseInt(framerProps.font?.fontSize?.replace("px", "") || "50");
  const font = `${framerProps.font?.fontWeight ?? 400} ${fontSize * globalDpr}px ${framerProps.font?.fontFamily ?? "sans-serif"}`;
  const color = parseColor(framerProps.color ?? "rgb(153,153,153)");

  let textX;
  const textY = canvas.height / 2;
  const currentText = framerProps.texts[currentTextIndex] || "";
  if (framerProps.alignment === "center") textX = canvas.width / 2;
  else if (framerProps.alignment === "left") textX = 0;
  else textX = canvas.width;

  const { particles, textBoundaries } = createParticles(
    ctx, canvas, currentText, textX, textY, font, color, framerProps.alignment || "left"
  );
  particlesRef.current = particles;
  canvas.textBoundaries = textBoundaries;
};

const SeoElement = memo(({ tag = Tag.P, texts }: { tag: Tag; texts: string[] }) => {
  const style = { position: "absolute" as const, width: "0", height: "0", overflow: "hidden", userSelect: "none" as const, pointerEvents: "none" as const };
  const safeTag = Object.values(Tag).includes(tag) ? tag : "p";
  return createElement(safeTag, { style }, texts?.join(" ") ?? "");
});

export default function VaporizeTextCycle({
  texts = ["Next.js", "React"],
  font = { fontFamily: "sans-serif", fontSize: "50px", fontWeight: 400 },
  color = "rgb(255,255,255)",
  spread = 5, density = 5,
  animation = { vaporizeDuration: 2, fadeInDuration: 1, waitDuration: 0.5 },
  direction = "left-to-right",
  alignment = "center",
  tag = Tag.P,
}: VaporizeTextCycleProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const isInView = useIsInView(wrapperRef as React.RefObject<HTMLElement>);
  const particlesRef = useRef<Particle[]>([]);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [animationState, setAnimationState] = useState<"static" | "vaporizing" | "fadingIn" | "waiting">("static");
  const vaporizeProgressRef = useRef(0);
  const fadeOpacityRef = useRef(0);
  const [wrapperSize, setWrapperSize] = useState({ width: 0, height: 0 });
  const transformedDensity = transformValue(density, [0, 10], [0.3, 1], true);

  const globalDpr = useMemo(() => (typeof window !== "undefined" ? (window.devicePixelRatio * 1.5 || 1) : 1), []);

  const animationDurations = useMemo(() => ({
    VAPORIZE_DURATION: (animation.vaporizeDuration ?? 2) * 1000,
    FADE_IN_DURATION: (animation.fadeInDuration ?? 1) * 1000,
    WAIT_DURATION: (animation.waitDuration ?? 0.5) * 1000,
  }), [animation.vaporizeDuration, animation.fadeInDuration, animation.waitDuration]);

  const fontConfig = useMemo(() => {
    const fontSize = parseInt(font.fontSize?.replace("px", "") || "50");
    const VAPORIZE_SPREAD = calculateVaporizeSpread(fontSize);
    return { fontSize, MULTIPLIED_VAPORIZE_SPREAD: VAPORIZE_SPREAD * spread };
  }, [font.fontSize, spread]);

  const memoizedUpdateParticles = useCallback((particles: Particle[], vaporizeX: number, deltaTime: number) => {
    return updateParticles(particles, vaporizeX, deltaTime, fontConfig.MULTIPLIED_VAPORIZE_SPREAD, animationDurations.VAPORIZE_DURATION, direction, transformedDensity);
  }, [fontConfig.MULTIPLIED_VAPORIZE_SPREAD, animationDurations.VAPORIZE_DURATION, direction, transformedDensity]);

  const memoizedRenderParticles = useCallback((ctx: CanvasRenderingContext2D, particles: Particle[]) => {
    renderParticles(ctx, particles, globalDpr);
  }, [globalDpr]);

  useEffect(() => {
    if (isInView) {
      const t = setTimeout(() => setAnimationState("vaporizing"), 0);
      return () => clearTimeout(t);
    } else {
      setAnimationState("static");
    }
  }, [isInView]);

  useEffect(() => {
    if (!isInView) return;
    let lastTime = performance.now();
    let frameId: number;
    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx || !particlesRef.current.length) {
        frameId = requestAnimationFrame(animate);
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      switch (animationState) {
        case "static":
          memoizedRenderParticles(ctx, particlesRef.current);
          break;
        case "vaporizing": {
          vaporizeProgressRef.current += (deltaTime * 100) / (animationDurations.VAPORIZE_DURATION / 1000);
          const tb = canvas.textBoundaries;
          if (!tb) break;
          const progress = Math.min(100, vaporizeProgressRef.current);
          const vaporizeX = direction === "left-to-right"
            ? tb.left + (tb.width * progress) / 100
            : tb.right - (tb.width * progress) / 100;
          const allVaporized = memoizedUpdateParticles(particlesRef.current, vaporizeX, deltaTime);
          memoizedRenderParticles(ctx, particlesRef.current);
          if (vaporizeProgressRef.current >= 100 && allVaporized) {
            setCurrentTextIndex((i) => (i + 1) % texts.length);
            setAnimationState("fadingIn");
            fadeOpacityRef.current = 0;
          }
          break;
        }
        case "fadingIn": {
          fadeOpacityRef.current += (deltaTime * 1000) / animationDurations.FADE_IN_DURATION;
          particlesRef.current.forEach((p) => {
            p.x = p.originalX; p.y = p.originalY;
            const opacity = Math.min(fadeOpacityRef.current, 1) * p.originalAlpha;
            const color = p.color.replace(/[\d.]+\)$/, `${opacity})`);
            ctx.fillStyle = color;
            ctx.fillRect(p.x, p.y, 1, 1);
          });
          if (fadeOpacityRef.current >= 1) {
            setAnimationState("waiting");
            setTimeout(() => {
              setAnimationState("vaporizing");
              vaporizeProgressRef.current = 0;
              resetParticles(particlesRef.current);
            }, animationDurations.WAIT_DURATION);
          }
          break;
        }
        case "waiting":
          memoizedRenderParticles(ctx, particlesRef.current);
          break;
      }
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => { if (frameId) cancelAnimationFrame(frameId); };
  }, [animationState, isInView, texts.length, direction, globalDpr, memoizedUpdateParticles, memoizedRenderParticles, animationDurations.FADE_IN_DURATION, animationDurations.WAIT_DURATION, animationDurations.VAPORIZE_DURATION]);

  useEffect(() => {
    renderCanvas({
      framerProps: { texts, font, color, alignment },
      canvasRef, wrapperSize, particlesRef, globalDpr, currentTextIndex,
    });
  }, [texts, font, color, alignment, wrapperSize, currentTextIndex, globalDpr]);

  useEffect(() => {
    const container = wrapperRef.current;
    if (!container) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const { width, height } = e.contentRect;
        setWrapperSize({ width, height });
      }
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (wrapperRef.current) {
      const r = wrapperRef.current.getBoundingClientRect();
      setWrapperSize({ width: r.width, height: r.height });
    }
  }, []);

  return (
    <div ref={wrapperRef} style={{ width: "100%", height: "100%", pointerEvents: "none" }}>
      <canvas ref={canvasRef} style={{ minWidth: "30px", minHeight: "20px", pointerEvents: "none" }} />
      <SeoElement tag={tag} texts={texts} />
    </div>
  );
}
