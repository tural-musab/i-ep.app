import * as React from "react"
import { cn } from "@/lib/utils"

interface VisuallyHiddenProps {
  children: React.ReactNode
  className?: string
}

export function VisuallyHidden({ children, className }: VisuallyHiddenProps) {
  return (
    <span
      className={cn(
        "absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0",
        "clip-[rect(0,0,0,0)]",
        className
      )}
    >
      {children}
    </span>
  )
}

interface SkipLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export function SkipLink({ href, children, className }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        "absolute left-0 top-0 z-[9999] px-4 py-2 bg-primary text-primary-foreground font-medium",
        "transform -translate-y-full focus:translate-y-0 transition-transform duration-150",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        className
      )}
    >
      {children}
    </a>
  )
}

interface AriaLiveRegionProps {
  children: React.ReactNode
  politeness?: "polite" | "assertive" | "off"
  atomic?: boolean
  relevant?: "all" | "text" | "additions" | "removals"
  className?: string
}

export function AriaLiveRegion({ 
  children, 
  politeness = "polite", 
  atomic = false,
  relevant = "all",
  className 
}: AriaLiveRegionProps) {
  return (
    <div
      aria-live={politeness}
      aria-atomic={atomic}
      aria-relevant={relevant}
      className={cn("sr-only", className)}
    >
      {children}
    </div>
  )
}

interface FocusTrapProps {
  children: React.ReactNode
  active?: boolean
  restoreFocus?: boolean
  className?: string
}

export function FocusTrap({ 
  children, 
  active = true, 
  restoreFocus = true,
  className 
}: FocusTrapProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const previousFocusRef = React.useRef<HTMLElement | null>(null)

  React.useEffect(() => {
    if (!active) return

    const container = containerRef.current
    if (!container) return

    // Store previously focused element
    previousFocusRef.current = document.activeElement as HTMLElement

    // Get all focusable elements
    const getFocusableElements = () => {
      const selector = [
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        'a[href]',
        '[tabindex]:not([tabindex="-1"])',
        '[contenteditable="true"]'
      ].join(', ')

      return Array.from(container.querySelectorAll(selector)) as HTMLElement[]
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const focusableElements = getFocusableElements()
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    // Focus first element
    const focusableElements = getFocusableElements()
    if (focusableElements.length > 0) {
      focusableElements[0].focus()
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      
      // Restore focus
      if (restoreFocus && previousFocusRef.current) {
        previousFocusRef.current.focus()
      }
    }
  }, [active, restoreFocus])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: "primary" | "secondary" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
  loading?: boolean
  ariaLabel?: string
  ariaDescribedBy?: string
}

export function AccessibleButton({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  ariaLabel,
  ariaDescribedBy,
  className,
  disabled,
  ...props
}: AccessibleButtonProps) {
  const variantClasses = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground"
  }

  const sizeClasses = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-8 text-base"
  }

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:pointer-events-none",
        "min-h-[44px] min-w-[44px]", // WCAG touch target size
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  )
}

interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  description?: string
  required?: boolean
  showRequiredIndicator?: boolean
}

export function AccessibleInput({
  label,
  error,
  description,
  required = false,
  showRequiredIndicator = true,
  className,
  id,
  ...props
}: AccessibleInputProps) {
  const inputId = id || React.useId()
  const descriptionId = description ? `${inputId}-description` : undefined
  const errorId = error ? `${inputId}-error` : undefined

  return (
    <div className="space-y-2">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && showRequiredIndicator && (
          <span className="ml-1 text-red-500" aria-hidden="true">*</span>
        )}
      </label>
      
      {description && (
        <p id={descriptionId} className="text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      
      <input
        id={inputId}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
          "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500 focus-visible:ring-red-500",
          className
        )}
        aria-describedby={cn(descriptionId, errorId)}
        aria-invalid={!!error}
        aria-required={required}
        {...props}
      />
      
      {error && (
        <p id={errorId} className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

interface AccessibleSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
  description?: string
  options: Array<{ value: string; label: string }>
  placeholder?: string
  required?: boolean
}

export function AccessibleSelect({
  label,
  error,
  description,
  options,
  placeholder,
  required = false,
  className,
  id,
  ...props
}: AccessibleSelectProps) {
  const selectId = id || React.useId()
  const descriptionId = description ? `${selectId}-description` : undefined
  const errorId = error ? `${selectId}-error` : undefined

  return (
    <div className="space-y-2">
      <label
        htmlFor={selectId}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && (
          <span className="ml-1 text-red-500" aria-hidden="true">*</span>
        )}
      </label>
      
      {description && (
        <p id={descriptionId} className="text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      
      <select
        id={selectId}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
          "ring-offset-background focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500 focus-visible:ring-red-500",
          className
        )}
        aria-describedby={cn(descriptionId, errorId)}
        aria-invalid={!!error}
        aria-required={required}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p id={errorId} className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

interface KeyboardShortcutProps {
  keys: string[]
  description: string
  onActivate?: () => void
  className?: string
}

export function KeyboardShortcut({ 
  keys, 
  description, 
  onActivate,
  className 
}: KeyboardShortcutProps) {
  React.useEffect(() => {
    if (!onActivate) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const modifierKeys = {
        ctrl: e.ctrlKey,
        cmd: e.metaKey,
        alt: e.altKey,
        shift: e.shiftKey
      }

      const pressedKeys = keys.every(key => {
        const lowerKey = key.toLowerCase()
        
        if (lowerKey === 'ctrl') return modifierKeys.ctrl
        if (lowerKey === 'cmd') return modifierKeys.cmd
        if (lowerKey === 'alt') return modifierKeys.alt
        if (lowerKey === 'shift') return modifierKeys.shift
        
        return e.key.toLowerCase() === lowerKey
      })

      if (pressedKeys) {
        e.preventDefault()
        onActivate()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [keys, onActivate])

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {description}
      </span>
      <div className="flex items-center space-x-1">
        {keys.map((key, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span className="text-xs text-gray-400">+</span>}
            <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded border">
              {key}
            </kbd>
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

interface AccessibilityAnnouncementProps {
  message: string
  priority?: "low" | "medium" | "high"
  delay?: number
}

export function AccessibilityAnnouncement({ 
  message, 
  priority = "medium",
  delay = 0 
}: AccessibilityAnnouncementProps) {
  const [announced, setAnnounced] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setAnnounced(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  if (!announced) return null

  return (
    <AriaLiveRegion politeness={priority === "high" ? "assertive" : "polite"}>
      {message}
    </AriaLiveRegion>
  )
}

// Hook for managing focus
export function useFocusManagement() {
  const focusRef = React.useRef<HTMLElement | null>(null)

  const setFocus = React.useCallback((element: HTMLElement | null) => {
    if (element) {
      focusRef.current = element
      element.focus()
    }
  }, [])

  const restoreFocus = React.useCallback(() => {
    if (focusRef.current) {
      focusRef.current.focus()
    }
  }, [])

  return { setFocus, restoreFocus }
}

// Hook for keyboard navigation
export function useKeyboardNavigation(
  items: Array<{ id: string; element?: HTMLElement }>,
  options: {
    loop?: boolean
    orientation?: "horizontal" | "vertical"
    onSelect?: (id: string) => void
  } = {}
) {
  const [focusedIndex, setFocusedIndex] = React.useState(0)
  const { loop = true, orientation = "vertical", onSelect } = options

  const handleKeyDown = React.useCallback((e: KeyboardEvent) => {
    const nextKey = orientation === "vertical" ? "ArrowDown" : "ArrowRight"
    const prevKey = orientation === "vertical" ? "ArrowUp" : "ArrowLeft"

    if (e.key === nextKey) {
      e.preventDefault()
      setFocusedIndex(prev => {
        const next = prev + 1
        if (next >= items.length) {
          return loop ? 0 : prev
        }
        return next
      })
    } else if (e.key === prevKey) {
      e.preventDefault()
      setFocusedIndex(prev => {
        const next = prev - 1
        if (next < 0) {
          return loop ? items.length - 1 : prev
        }
        return next
      })
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      const currentItem = items[focusedIndex]
      if (currentItem && onSelect) {
        onSelect(currentItem.id)
      }
    }
  }, [items, focusedIndex, loop, orientation, onSelect])

  React.useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  React.useEffect(() => {
    const currentItem = items[focusedIndex]
    if (currentItem?.element) {
      currentItem.element.focus()
    }
  }, [focusedIndex, items])

  return { focusedIndex, setFocusedIndex }
}