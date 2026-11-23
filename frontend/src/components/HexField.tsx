"use client";

import { useEffect, useRef } from "react";

const R = 24;
const W = Math.sqrt(3) * R;
const H = 1.5 * R;
const REACH = 95;
const DECAY = 0.9;

type Cell = { x: number; y: number; e: number };

function hexPath(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    const px = x + r * Math.cos(a);
    const py = y + r * Math.sin(a);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

export function HexField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const base = document.createElement("canvas");
    const baseCtx = base.getContext("2d")!;
    let cells: Cell[] = [];
    let colors = { line: "", accent: "", accent2: "" };
    let frame = 0;
    let running = false;

    function readColors() {
      const css = getComputedStyle(document.documentElement);
      colors = {
        line: css.getPropertyValue("--hex-line").trim(),
        accent: css.getPropertyValue("--accent").trim(),
        accent2: css.getPropertyValue("--accent-2").trim(),
      };
    }

    function layout() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      for (const c of [canvas!, base]) {
        c.width = w * dpr;
        c.height = h * dpr;
      }
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      baseCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cells = [];
      for (let row = -1; row * H < h + R; row++) {
        const offset = row % 2 === 0 ? 0 : W / 2;
        for (let x = -W + offset; x < w + W; x += W) cells.push({ x, y: row * H, e: 0 });
      }

      baseCtx.clearRect(0, 0, w, h);
      baseCtx.strokeStyle = colors.line;
      baseCtx.lineWidth = 1;
      for (const c of cells) {
        hexPath(baseCtx, c.x, c.y, R - 1);
        baseCtx.stroke();
      }
      draw();
    }

    function draw() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx!.clearRect(0, 0, w, h);
      ctx!.drawImage(base, 0, 0, w, h);
      let active = false;
      for (const c of cells) {
        if (c.e < 0.01) {
          c.e = 0;
          continue;
        }
        active = true;
        const r = (R - 1) * (0.85 + 0.15 * c.e);
        hexPath(ctx!, c.x, c.y, r);
        ctx!.globalAlpha = c.e * 0.06;
        ctx!.fillStyle = c.e > 0.6 ? colors.accent2 : colors.accent;
        ctx!.fill();
        ctx!.globalAlpha = c.e * 0.4;
        ctx!.strokeStyle = c.e > 0.6 ? colors.accent2 : colors.accent;
        ctx!.lineWidth = 1;
        ctx!.stroke();
        c.e *= DECAY;
      }
      ctx!.globalAlpha = 1;
      return active;
    }

    function tick() {
      running = draw();
      frame = running ? requestAnimationFrame(tick) : 0;
    }

    function onMove(event: PointerEvent) {
      if (event.pointerType === "touch") return;
      for (const c of cells) {
        const d = Math.hypot(c.x - event.clientX, c.y - event.clientY);
        if (d < REACH) c.e = Math.max(c.e, 1 - d / REACH);
      }
      if (!running) {
        running = true;
        frame = requestAnimationFrame(tick);
      }
    }

    readColors();
    layout();

    const themeWatch = new MutationObserver(() => {
      readColors();
      layout();
    });
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    window.addEventListener("resize", layout);
    if (!still) window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      themeWatch.disconnect();
      window.removeEventListener("resize", layout);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 -z-10" />;
}
