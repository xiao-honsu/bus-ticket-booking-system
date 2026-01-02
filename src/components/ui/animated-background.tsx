'use client';

import { AnimatedGridPattern } from '@/components/ui/animated-grid-pattern';
import { cn } from '@/lib/utils';

interface AnimatedBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'subtle' | 'none';
}

/**
 * Reusable animated background component for consistent design across the app
 * Uses Shadcn design tokens and MagicUI AnimatedGridPattern
 */
export function AnimatedBackground({ children, className, variant = 'default' }: AnimatedBackgroundProps) {
  if (variant === 'none') {
    return <div className={cn('relative', className)}>{children}</div>;
  }

  return (
    <div className={cn('relative min-h-screen bg-background', className)}>
      {/* Animated grid pattern background */}
      {variant === 'default' && (
        <AnimatedGridPattern
          numSquares={30}
          maxOpacity={0.1}
          duration={3}
          repeatDelay={1}
          className={cn(
            'mask-[radial-gradient(500px_circle_at_center,white,transparent)]',
            'inset-x-0 inset-y-[-30%] h-[200%] skew-y-12'
          )}
        />
      )}

      {/* Subtle variant with less animation */}
      {variant === 'subtle' && (
        <AnimatedGridPattern
          numSquares={20}
          maxOpacity={0.05}
          duration={5}
          repeatDelay={2}
          className={cn('mask-[radial-gradient(400px_circle_at_center,white,transparent)]')}
        />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
