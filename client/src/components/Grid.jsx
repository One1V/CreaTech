import { useEffect, useRef } from 'react';

// Grid component: draws an infinite-looking grid on a full-screen canvas.
// Props:
// - infiniteGrid: boolean (keeps drawing beyond viewport)
// - fadeDistance: number (units controlling fade strength)
// - sectionColor: CSS color for section grid lines
// - cellColor: CSS color for cell grid lines
// - sectionSize: number (multiplier for section spacing)
// - cellSize: number (multiplier for cell spacing)
export default function Grid({
  infiniteGrid = true,
  fadeDistance = 25,
  sectionColor = '#f59e0b',
  cellColor = '#222',
  sectionSize = 1,
  cellSize = 0.5,
}) {
  const ref = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const DPR = window.devicePixelRatio || 1;

    let width = 0;
    let height = 0;
    let center = { x: 0, y: 0 };
    let mouse = null;

    const base = 40; // base pixels for 1 unit size
    const sectionSpacing = Math.max(6, base * sectionSize);
    const cellSpacing = Math.max(4, base * cellSize);

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * DPR);
      canvas.height = Math.round(height * DPR);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      center = { x: width / 2, y: height / 2 };
      draw();
    }

    function onMove(e) {
      mouse = { x: e.clientX, y: e.clientY };
    }

    function clear() {
      ctx.clearRect(0, 0, width, height);
    }

    function draw() {
      clear();

      const maxFade = (fadeDistance || 25) * 20; // convert units to pixels
      const centerPoint = mouse || center;

      // draw cell lines
      ctx.lineWidth = 1;
      for (let x = 0; x <= width; x += cellSpacing) {
        const dist = Math.abs(x - centerPoint.x);
        const alpha = Math.max(0, 1 - dist / maxFade) * 0.25; // faint cell lines
        if (alpha <= 0.003) continue;
        ctx.beginPath();
        ctx.strokeStyle = hexWithAlpha(cellColor, alpha);
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, height);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y += cellSpacing) {
        const dist = Math.abs(y - centerPoint.y);
        const alpha = Math.max(0, 1 - dist / maxFade) * 0.25;
        if (alpha <= 0.003) continue;
        ctx.beginPath();
        ctx.strokeStyle = hexWithAlpha(cellColor, alpha);
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(width, y + 0.5);
        ctx.stroke();
      }

      // draw section lines (bolder)
      ctx.lineWidth = 1.6;
      for (let x = 0; x <= width; x += sectionSpacing) {
        const dist = Math.abs(x - centerPoint.x);
        const alpha = Math.max(0, 1 - dist / maxFade) * 0.65;
        if (alpha <= 0.01) continue;
        ctx.beginPath();
        ctx.strokeStyle = hexWithAlpha(sectionColor, alpha);
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, height);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y += sectionSpacing) {
        const dist = Math.abs(y - centerPoint.y);
        const alpha = Math.max(0, 1 - dist / maxFade) * 0.65;
        if (alpha <= 0.01) continue;
        ctx.beginPath();
        ctx.strokeStyle = hexWithAlpha(sectionColor, alpha);
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(width, y + 0.5);
        ctx.stroke();
      }
    }

    function tick() {
      draw();
      rafRef.current = requestAnimationFrame(tick);
    }

    function hexWithAlpha(hex, a) {
      // support #rrggbb
      try {
        const c = hex.replace('#', '');
        const r = parseInt(c.substring(0, 2), 16);
        const g = parseInt(c.substring(2, 4), 16);
        const b = parseInt(c.substring(4, 6), 16);
        return `rgba(${r},${g},${b},${a.toFixed(3)})`;
      } catch (e) {
        return hex;
      }
    }

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMove);
    resize();
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [fadeDistance, sectionColor, cellColor, sectionSize, cellSize]);

  return <canvas ref={ref} className="grid-canvas" aria-hidden="true" />;
}
