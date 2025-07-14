import * as React from "react"
import { cn } from "@/lib/utils"
import { Check, X, AlertCircle, Info, Heart, Star, ThumbsUp } from "lucide-react"

interface AnimatedIconProps {
  icon: React.ComponentType<{ className?: string }>
  className?: string
  animate?: boolean
}

export function AnimatedIcon({ icon: Icon, className, animate = true }: AnimatedIconProps) {
  return (
    <div className={cn(
      "inline-flex items-center justify-center",
      animate && "transition-all duration-200 hover:scale-110 active:scale-95",
      className
    )}>
      <Icon className="h-5 w-5" />
    </div>
  )
}

interface FadeInProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function FadeIn({ children, className, delay = 0 }: FadeInProps) {
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={cn(
        "transition-all duration-500 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className
      )}
    >
      {children}
    </div>
  )
}

interface SlideInProps {
  children: React.ReactNode
  direction?: "left" | "right" | "up" | "down"
  className?: string
  delay?: number
}

export function SlideIn({ 
  children, 
  direction = "left", 
  className, 
  delay = 0 
}: SlideInProps) {
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  const directionClasses = {
    left: isVisible ? "translate-x-0" : "-translate-x-4",
    right: isVisible ? "translate-x-0" : "translate-x-4",
    up: isVisible ? "translate-y-0" : "-translate-y-4",
    down: isVisible ? "translate-y-0" : "translate-y-4"
  }

  return (
    <div
      className={cn(
        "transition-all duration-500 ease-out",
        isVisible ? "opacity-100" : "opacity-0",
        directionClasses[direction],
        className
      )}
    >
      {children}
    </div>
  )
}

interface HoverGrowProps {
  children: React.ReactNode
  className?: string
  scale?: number
}

export function HoverGrow({ children, className, scale = 1.05 }: HoverGrowProps) {
  return (
    <div
      className={cn(
        "transition-transform duration-200 ease-out hover:scale-105 active:scale-95",
        className
      )}
      style={{ '--scale': scale } as React.CSSProperties}
    >
      {children}
    </div>
  )
}

interface FloatingActionButtonProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left"
}

export function FloatingActionButton({ 
  children, 
  className, 
  onClick,
  position = "bottom-right"
}: FloatingActionButtonProps) {
  const positionClasses = {
    "bottom-right": "fixed bottom-6 right-6",
    "bottom-left": "fixed bottom-6 left-6",
    "top-right": "fixed top-6 right-6",
    "top-left": "fixed top-6 left-6"
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl active:scale-95 z-50",
        positionClasses[position],
        className
      )}
    >
      {children}
    </button>
  )
}

interface RippleProps {
  className?: string
  color?: string
}

export function Ripple({ className, color = "rgba(255, 255, 255, 0.5)" }: RippleProps) {
  const [ripples, setRipples] = React.useState<Array<{ x: number; y: number; id: number }>>([])

  const addRipple = React.useCallback((event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const newRipple = { x, y, id: Date.now() }
    
    setRipples(prev => [...prev, newRipple])
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id))
    }, 600)
  }, [])

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      onMouseDown={addRipple}
    >
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full animate-ripple pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            backgroundColor: color,
            transform: 'translate(-50%, -50%)',
            animation: 'ripple 0.6s linear'
          }}
        />
      ))}
    </div>
  )
}

interface PulseIndicatorProps {
  className?: string
  color?: "primary" | "success" | "warning" | "error"
  size?: "sm" | "md" | "lg"
}

export function PulseIndicator({ 
  className, 
  color = "primary", 
  size = "md" 
}: PulseIndicatorProps) {
  const colorClasses = {
    primary: "bg-primary",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    error: "bg-red-500"
  }

  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4"
  }

  return (
    <div className={cn("relative inline-flex", className)}>
      <div className={cn(
        "rounded-full animate-ping absolute inline-flex opacity-75",
        colorClasses[color],
        sizeClasses[size]
      )} />
      <div className={cn(
        "rounded-full relative inline-flex",
        colorClasses[color],
        sizeClasses[size]
      )} />
    </div>
  )
}

interface NotificationToastProps {
  message: string
  type?: "success" | "error" | "warning" | "info"
  visible?: boolean
  onClose?: () => void
  duration?: number
}

export function NotificationToast({ 
  message, 
  type = "info", 
  visible = true, 
  onClose,
  duration = 3000
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = React.useState(visible)

  React.useEffect(() => {
    setIsVisible(visible)
  }, [visible])

  React.useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onClose?.()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  const typeConfig = {
    success: { icon: Check, bgColor: "bg-green-500", textColor: "text-white" },
    error: { icon: X, bgColor: "bg-red-500", textColor: "text-white" },
    warning: { icon: AlertCircle, bgColor: "bg-yellow-500", textColor: "text-white" },
    info: { icon: Info, bgColor: "bg-blue-500", textColor: "text-white" }
  }

  const config = typeConfig[type]
  const Icon = config.icon

  if (!isVisible) return null

  return (
    <div className={cn(
      "fixed top-4 right-4 z-50 flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ease-out",
      config.bgColor,
      config.textColor,
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
    )}>
      <Icon className="h-5 w-5" />
      <span className="font-medium">{message}</span>
      {onClose && (
        <button
          onClick={() => {
            setIsVisible(false)
            onClose()
          }}
          className="ml-2 hover:opacity-70 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

interface LikeButtonProps {
  liked?: boolean
  count?: number
  onToggle?: (liked: boolean) => void
  className?: string
}

export function LikeButton({ 
  liked = false, 
  count = 0, 
  onToggle, 
  className 
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = React.useState(liked)
  const [isAnimating, setIsAnimating] = React.useState(false)

  const handleClick = () => {
    setIsAnimating(true)
    const newLiked = !isLiked
    setIsLiked(newLiked)
    onToggle?.(newLiked)
    
    setTimeout(() => setIsAnimating(false), 300)
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "inline-flex items-center space-x-2 px-3 py-1 rounded-full transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800",
        className
      )}
    >
      <Heart
        className={cn(
          "h-5 w-5 transition-all duration-200",
          isLiked ? "fill-red-500 text-red-500" : "text-gray-500",
          isAnimating && "animate-bounce"
        )}
      />
      <span className="text-sm font-medium">{count}</span>
    </button>
  )
}

interface StarRatingProps {
  rating: number
  maxRating?: number
  onRatingChange?: (rating: number) => void
  readonly?: boolean
  className?: string
}

export function StarRating({ 
  rating, 
  maxRating = 5, 
  onRatingChange, 
  readonly = false,
  className 
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = React.useState(0)

  const handleClick = (clickedRating: number) => {
    if (!readonly) {
      onRatingChange?.(clickedRating)
    }
  }

  return (
    <div className={cn("flex items-center space-x-1", className)}>
      {Array.from({ length: maxRating }, (_, index) => {
        const starRating = index + 1
        const filled = starRating <= (hoverRating || rating)
        
        return (
          <button
            key={index}
            onClick={() => handleClick(starRating)}
            onMouseEnter={() => !readonly && setHoverRating(starRating)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
            disabled={readonly}
            className={cn(
              "transition-all duration-200",
              !readonly && "hover:scale-110 active:scale-95",
              readonly && "cursor-default"
            )}
          >
            <Star
              className={cn(
                "h-5 w-5 transition-colors duration-200",
                filled ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
              )}
            />
          </button>
        )
      })}
    </div>
  )
}

// Add required CSS animations to globals.css
export const microInteractionStyles = `
@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

@keyframes pulse-slow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes pulse-fast {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.animate-ripple {
  animation: ripple 0.6s linear;
}

.animate-pulse-slow {
  animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-pulse-fast {
  animation: pulse-fast 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
`