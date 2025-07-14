import * as React from "react"
import { cn } from "@/lib/utils"
import { Loader2, RefreshCw } from "lucide-react"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  }

  return (
    <Loader2 
      className={cn(
        "animate-spin text-primary",
        sizeClasses[size],
        className
      )} 
    />
  )
}

interface LoadingDotsProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingDots({ size = "md", className }: LoadingDotsProps) {
  const sizeClasses = {
    sm: "h-1 w-1",
    md: "h-2 w-2",
    lg: "h-3 w-3"
  }

  return (
    <div className={cn("flex space-x-1", className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            "bg-primary rounded-full animate-bounce",
            sizeClasses[size]
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: "0.6s"
          }}
        />
      ))}
    </div>
  )
}

interface LoadingSkeletonProps {
  className?: string
  rows?: number
  avatar?: boolean
}

export function LoadingSkeleton({ 
  className, 
  rows = 3, 
  avatar = false 
}: LoadingSkeletonProps) {
  return (
    <div className={cn("animate-pulse", className)}>
      {avatar && (
        <div className="flex items-center space-x-3 mb-4">
          <div className="h-10 w-10 bg-gray-300 rounded-full" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-300 rounded w-1/2" />
            <div className="h-3 bg-gray-300 rounded w-1/3" />
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-gray-300 rounded" />
            <div className="h-4 bg-gray-300 rounded w-5/6" />
          </div>
        ))}
      </div>
    </div>
  )
}

interface LoadingCardProps {
  className?: string
  showImage?: boolean
}

export function LoadingCard({ className, showImage = false }: LoadingCardProps) {
  return (
    <div className={cn("animate-pulse p-4 border rounded-lg", className)}>
      {showImage && (
        <div className="h-48 bg-gray-300 rounded mb-4" />
      )}
      
      <div className="space-y-3">
        <div className="h-6 bg-gray-300 rounded w-3/4" />
        <div className="h-4 bg-gray-300 rounded" />
        <div className="h-4 bg-gray-300 rounded w-5/6" />
        
        <div className="flex space-x-2 mt-4">
          <div className="h-8 bg-gray-300 rounded w-20" />
          <div className="h-8 bg-gray-300 rounded w-24" />
        </div>
      </div>
    </div>
  )
}

interface LoadingTableProps {
  rows?: number
  columns?: number
  className?: string
}

export function LoadingTable({ 
  rows = 5, 
  columns = 4, 
  className 
}: LoadingTableProps) {
  return (
    <div className={cn("animate-pulse", className)}>
      {/* Header */}
      <div className="border-b">
        <div className="grid gap-4 p-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-300 rounded w-3/4" />
          ))}
        </div>
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="border-b">
          <div className="grid gap-4 p-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="h-4 bg-gray-300 rounded" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

interface LoadingButtonProps {
  children: React.ReactNode
  loading?: boolean
  disabled?: boolean
  className?: string
  size?: "sm" | "md" | "lg"
  variant?: "default" | "outline" | "ghost"
  onClick?: () => void
}

export function LoadingButton({ 
  children, 
  loading = false, 
  disabled = false,
  className,
  size = "md",
  variant = "default",
  onClick
}: LoadingButtonProps) {
  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
  
  const sizeClasses = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-8 text-base"
  }
  
  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground"
  }

  return (
    <button
      className={cn(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && (
        <LoadingSpinner size="sm" className="mr-2" />
      )}
      {children}
    </button>
  )
}

interface LoadingOverlayProps {
  loading?: boolean
  children: React.ReactNode
  className?: string
  message?: string
}

export function LoadingOverlay({ 
  loading = false, 
  children, 
  className,
  message = "Yükleniyor..."
}: LoadingOverlayProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      
      {loading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {message}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

interface PulseProps {
  className?: string
  intensity?: "low" | "medium" | "high"
}

export function Pulse({ className, intensity = "medium" }: PulseProps) {
  const intensityClasses = {
    low: "animate-pulse-slow",
    medium: "animate-pulse",
    high: "animate-pulse-fast"
  }

  return (
    <div className={cn(
      "rounded-full bg-primary/20",
      intensityClasses[intensity],
      className
    )} />
  )
}

interface ProgressBarProps {
  progress: number
  className?: string
  size?: "sm" | "md" | "lg"
  animated?: boolean
}

export function ProgressBar({ 
  progress, 
  className, 
  size = "md",
  animated = true
}: ProgressBarProps) {
  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3"
  }

  return (
    <div className={cn(
      "w-full bg-gray-200 rounded-full overflow-hidden",
      sizeClasses[size],
      className
    )}>
      <div
        className={cn(
          "h-full bg-primary transition-all duration-500 ease-out",
          animated && "animate-pulse"
        )}
        style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
      />
    </div>
  )
}

interface RefreshButtonProps {
  onRefresh?: () => void
  loading?: boolean
  className?: string
  size?: "sm" | "md" | "lg"
}

export function RefreshButton({ 
  onRefresh, 
  loading = false, 
  className,
  size = "md"
}: RefreshButtonProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12"
  }

  return (
    <button
      onClick={onRefresh}
      disabled={loading}
      className={cn(
        "inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        sizeClasses[size],
        className
      )}
    >
      <RefreshCw className={cn(
        "h-4 w-4",
        loading && "animate-spin"
      )} />
    </button>
  )
}