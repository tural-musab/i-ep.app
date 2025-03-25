import React, { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cva } from 'class-variance-authority';

const trendVariants = cva('flex items-center text-xs font-medium', {
  variants: {
    trend: {
      positive: 'text-emerald-600',
      negative: 'text-rose-600',
      neutral: 'text-gray-500',
    },
  },
  defaultVariants: {
    trend: 'neutral',
  },
});

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: number;
  trendLabel?: string;
  description?: string;
  loading?: boolean;
  className?: string;
}

export function MetricCard({
  title,
  value,
  icon,
  trend,
  trendLabel = 'Son 30 gün',
  description,
  loading = false,
  className,
}: MetricCardProps) {
  // Trend durumunu belirle
  const trendType = trend === 0 
    ? 'neutral' 
    : trend && trend > 0 
      ? 'positive' 
      : 'negative';
  
  // Trend ikonu belirle
  const TrendIcon = trend === 0 
    ? Minus 
    : trend && trend > 0 
      ? ArrowUp 
      : ArrowDown;
  
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        {icon && (
          <div className="h-4 w-4 text-muted-foreground">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <div className="h-8 w-28 animate-pulse rounded bg-muted"></div>
            <div className="h-4 w-20 animate-pulse rounded bg-muted"></div>
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">
              {value}
            </div>
            {(trend !== undefined || description) && (
              <div className="mt-1 flex items-center justify-between">
                {trend !== undefined && (
                  <p className={trendVariants({ trend: trendType })}>
                    <TrendIcon className="mr-1 h-3 w-3" />
                    {Math.abs(trend)}%
                    {trendLabel && <span className="ml-1 text-gray-500">{trendLabel}</span>}
                  </p>
                )}
                {description && !trend && (
                  <p className="text-xs text-muted-foreground">
                    {description}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function MetricCardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-5 w-24 animate-pulse rounded bg-muted"></div>
            <div className="h-4 w-4 animate-pulse rounded-full bg-muted"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-8 w-28 animate-pulse rounded bg-muted"></div>
              <div className="h-4 w-20 animate-pulse rounded bg-muted"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
} 