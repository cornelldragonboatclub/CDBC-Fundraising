import React, { useEffect, useRef } from 'react';

const TriangleGrid = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let startTime: number | null = null;
    let resizeTimeout: NodeJS.Timeout;

    // Keep the original small size (46)
    const W = 46;
    const H = 39.837; // W * sqrt(3)/2

    type Triangle = {
      isUp: boolean;
      x: number;
      y: number;
      cx: number;
      cy: number;
      delay: number;
      duration: number;
    };

    let triangles: Triangle[] = [];

    const initGrid = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Handle high-DPI displays for crisp rendering
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      ctx.scale(dpr, dpr);

      const cols = Math.ceil(width / (W / 2)) + 2;
      const rows = Math.ceil(height / H) + 2;

      triangles = [];
      const centerX = width / 2;
      const centerY = height / 2;

      for (let r = -1; r < rows; r++) {
        for (let c = -1; c < cols; c++) {
          const isUp = (r + c) % 2 === 0;
          const x = c * (W / 2);
          const y = r * H;

          const cx = x + W / 2;
          const cy = y + (isUp ? H * 0.666 : H * 0.333);

          // Center-out ripple delay
          const dist = Math.sqrt(Math.pow(cx - centerX, 2) + Math.pow(cy - centerY, 2));
          const D_adj = W * 0.57735; 
          const duration = 400; // ms
          const delay = (dist / D_adj) * 40; // ms (ripple speed)

          triangles.push({
            isUp, x, y, cx, cy, delay, duration
          });
        }
      }
      startTime = performance.now();
    };

    const draw = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      // Clear the canvas for the next frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let allDone = true;

      for (const t of triangles) {
        let progress = 0;
        if (elapsed > t.delay) {
          progress = Math.min((elapsed - t.delay) / t.duration, 1);
        }
        if (progress < 1) allDone = false;

        // Easing: ease-in (starts slow, accelerates)
        const easeProgress = progress * progress * progress; 
        
        // Scale from 1.05 (to prevent sub-pixel gaps) down to 0
        const scale = Math.max(0, 1.05 - easeProgress * 1.05);
        const opacity = Math.max(0, 1 - easeProgress);

        if (opacity <= 0 || scale <= 0) continue;

        ctx.save();
        
        // Transform around the center of the triangle
        ctx.translate(t.cx, t.cy);
        ctx.scale(scale, scale);
        ctx.translate(-t.cx, -t.cy);

        ctx.beginPath();
        if (t.isUp) {
          ctx.moveTo(t.x + W/2, t.y);
          ctx.lineTo(t.x, t.y + H);
          ctx.lineTo(t.x + W, t.y + H);
        } else {
          ctx.moveTo(t.x, t.y);
          ctx.lineTo(t.x + W, t.y);
          ctx.lineTo(t.x + W/2, t.y + H);
        }
        ctx.closePath();

        ctx.fillStyle = `rgba(220, 38, 38, ${opacity})`; // #dc2626 (red-600)
        ctx.fill();
        
        ctx.strokeStyle = `rgba(127, 29, 29, ${opacity})`; // #7f1d1d (red-900)
        ctx.lineWidth = 1;
        ctx.lineJoin = 'round';
        ctx.stroke();

        ctx.restore();
      }

      if (!allDone) {
        animationFrameId = requestAnimationFrame(draw);
      }
    };

    initGrid();
    animationFrameId = requestAnimationFrame(draw);

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        cancelAnimationFrame(animationFrameId);
        initGrid();
        animationFrameId = requestAnimationFrame(draw);
      }, 150);
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-50">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};

export default TriangleGrid;
