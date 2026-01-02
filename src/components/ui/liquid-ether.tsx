'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

interface LiquidEtherProps {
  className?: string;
  colors?: {
    light: [string, string, string, string];
    dark: [string, string, string, string];
  };
  speed?: number;
  intensity?: number;
}

export default function LiquidEther({
  className = '',
  colors = {
    light: ['#a855f7', '#6366f1', '#3b82f6', '#ec4899'],
    dark: ['#7c3aed', '#4f46e5', '#2563eb', '#db2777'],
  },
  speed = 0.002,
  intensity = 0.7,
}: LiquidEtherProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    const currentColors = resolvedTheme === 'dark' ? colors.dark : colors.light;

    // Convert hex to rgba for proper alpha channel handling
    const hexToRgba = (hex: string, alpha: number): string => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const draw = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      // Clear with a subtle fade for trail effect
      ctx.fillStyle = resolvedTheme === 'dark' ? 'rgba(23, 23, 23, 0.05)' : 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(0, 0, width, height);

      // Draw flowing gradients
      for (let i = 0; i < 4; i++) {
        const x = width * (0.3 + 0.4 * Math.sin(time * (1 + i * 0.3) + i * Math.PI * 0.5));
        const y = height * (0.3 + 0.4 * Math.cos(time * (1.2 + i * 0.2) + i * Math.PI * 0.3));
        const radius = Math.min(width, height) * (0.3 + 0.2 * Math.sin(time + i));

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        // Use rgba format with proper alpha values (0-1 range)
        gradient.addColorStop(0, hexToRgba(currentColors[i], intensity * 0.4));
        gradient.addColorStop(0.5, hexToRgba(currentColors[i], intensity * 0.2));
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }

      time += speed;
      animationId = requestAnimationFrame(draw);
    };

    resize();
    draw();

    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [resolvedTheme, colors, speed, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ filter: 'blur(80px)' }}
    />
  );
}
