import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  circle?: boolean;
}

export function Skeleton({ className, width, height, borderRadius, circle, style, ...props }: SkeletonProps) {
  const customStyles: React.CSSProperties = {
    ...(width ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
    ...(height ? { height: typeof height === 'number' ? `${height}px` : height } : {}),
    ...(borderRadius ? { borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius } : {}),
    ...(circle ? { borderRadius: '50%' } : {}),
    ...style,
  };

  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted/60', className)}
      style={customStyles}
      {...props}
    />
  );
}
