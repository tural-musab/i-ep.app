import React, { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cva } from 'class-variance-authority';

const trendVariants = cva('flex items-center text-xs font-medium', {
  variants: {
    trend: {
      positive: 'text-emerald-600 dark:text-emerald-400',
      negative: 'text-rose-600 dark:text-rose-400',
      neutral: 'text-gray-500 dark:text-gray-400',
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
  const trendType = trend === 0 ? 'neutral' : trend && trend > 0 ? 'positive' : 'negative';

  // Trend ikonu belirle
  const TrendIcon = trend === 0 ? Minus : trend && trend > 0 ? ArrowUp : ArrowDown;

  return (
    <Card
      className={cn(
        'overflow-hidden border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800',
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-gray-500 dark:text-gray-400">{icon}</div>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <div className="bg-muted h-8 w-28 animate-pulse rounded"></div>
            <div className="bg-muted h-4 w-20 animate-pulse rounded"></div>
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
            {(trend !== undefined || description) && (
              <div className="mt-1 flex items-center justify-between">
                {trend !== undefined && (
                  <p className={trendVariants({ trend: trendType })}>
                    <TrendIcon className="mr-1 h-3 w-3" />
                    {Math.abs(trend)}%
                    {trendLabel && (
                      <span className="ml-1 text-gray-500 dark:text-gray-400">{trendLabel}</span>
                    )}
                  </p>
                )}
                {description && !trend && (
                  <p className="text-xs text-gray-600 dark:text-gray-300">{description}</p>
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
        <Card
          key={i}
          className="overflow-hidden border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="bg-muted h-5 w-24 animate-pulse rounded dark:bg-gray-700"></div>
            <div className="bg-muted h-4 w-4 animate-pulse rounded-full dark:bg-gray-700"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="bg-muted h-8 w-28 animate-pulse rounded dark:bg-gray-700"></div>
              <div className="bg-muted h-4 w-20 animate-pulse rounded dark:bg-gray-700"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
