'use client';

import { ComponentPropsWithoutRef, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';

import { cn } from '@/lib/utils';

export interface AnimatedGridPatternProps extends ComponentPropsWithoutRef<'svg'> {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  strokeDasharray?: number;
  numSquares?: number;
  maxOpacity?: number;
  duration?: number;
  repeatDelay?: number;
}

export function AnimatedGridPattern({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  strokeDasharray = 0,
  numSquares = 50,
  className,
  maxOpacity = 0.5,
  duration = 4,
  repeatDelay: _repeatDelay,
  ...props
}: AnimatedGridPatternProps) {
  const id = useId();
  const containerRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const repeatDelay = _repeatDelay ?? 1;

  // Memoize getPos to use current dimensions
  const getPos = useCallback(
    (containerWidth: number, containerHeight: number): [number, number] => {
      return [
        Math.floor((Math.random() * containerWidth) / width),
        Math.floor((Math.random() * containerHeight) / height),
      ];
    },
    [width, height]
  );

  // Memoize generateSquares to prevent infinite loop
  const generateSquares = useCallback(
    (count: number, containerWidth: number, containerHeight: number) => {
      return Array.from({ length: count }, (_, i) => ({
        id: i,
        pos: getPos(containerWidth, containerHeight) as [number, number],
      }));
    },
    [getPos]
  );

  // Initialize squares with useMemo
  const initialSquares = useMemo(
    () =>
      Array.from({ length: numSquares }, (_, i) => ({
        id: i,
        pos: [0, 0] as [number, number],
      })),
    [numSquares]
  );

  const [squares, setSquares] = useState(initialSquares);

  // Function to update a single square's position
  const updateSquarePosition = useCallback(
    (squareId: number) => {
      setSquares((currentSquares) =>
        currentSquares.map((sq) =>
          sq.id === squareId
            ? {
                ...sq,
                pos: getPos(dimensions.width, dimensions.height),
              }
            : sq
        )
      );
    },
    [dimensions.width, dimensions.height, getPos]
  );

  // Update squares when dimensions change
  useEffect(() => {
    if (dimensions.width && dimensions.height) {
      setSquares(generateSquares(numSquares, dimensions.width, dimensions.height));
    }
  }, [dimensions.width, dimensions.height, numSquares, generateSquares]);

  // Resize observer to update container dimensions
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.unobserve(container);
    };
  }, []);

  return (
    <svg
      ref={containerRef}
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 h-full w-full fill-gray-400/30 stroke-gray-400/30',
        className
      )}
      {...props}
    >
      <defs>
        <pattern id={id} width={width} height={height} patternUnits="userSpaceOnUse" x={x} y={y}>
          <path d={`M.5 ${height}V.5H${width}`} fill="none" strokeDasharray={strokeDasharray} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
