import * as React from "react"
import { cn } from "@/lib/utils"
import { useViewport } from "@/hooks/use-mobile"

interface ResponsiveGridProps {
  children: React.ReactNode
  className?: string
  cols?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    '2xl'?: number
  }
  gap?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    '2xl'?: number
  }
  auto?: boolean // Auto-fit columns based on content
}

const ResponsiveGrid = React.forwardRef<HTMLDivElement, ResponsiveGridProps>(
  ({ children, className, cols = {}, gap = {}, auto = false, ...props }, ref) => {
    const viewport = useViewport()
    
    // Default column configuration
    const defaultCols = {
      xs: 1,
      sm: 2,
      md: 2,
      lg: 3,
      xl: 4,
      '2xl': 4,
      ...cols
    }

    // Default gap configuration
    const defaultGap = {
      xs: 4,
      sm: 4,
      md: 6,
      lg: 6,
      xl: 8,
      '2xl': 8,
      ...gap
    }

    // Generate responsive classes
    const gridClasses = React.useMemo(() => {
      const classes = ["grid"]
      
      // Add column classes
      if (auto) {
        classes.push("grid-cols-[repeat(auto-fit,minmax(280px,1fr))]")
      } else {
        Object.entries(defaultCols).forEach(([breakpoint, colCount]) => {
          if (breakpoint === 'xs') {
            classes.push(`grid-cols-${colCount}`)
          } else {
            classes.push(`${breakpoint}:grid-cols-${colCount}`)
          }
        })
      }

      // Add gap classes
      Object.entries(defaultGap).forEach(([breakpoint, gapSize]) => {
        if (breakpoint === 'xs') {
          classes.push(`gap-${gapSize}`)
        } else {
          classes.push(`${breakpoint}:gap-${gapSize}`)
        }
      })

      return classes.join(" ")
    }, [defaultCols, defaultGap, auto])

    return (
      <div
        ref={ref}
        className={cn(gridClasses, className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
ResponsiveGrid.displayName = "ResponsiveGrid"

interface ResponsiveGridItemProps {
  children: React.ReactNode
  className?: string
  span?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    '2xl'?: number
  }
  start?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    '2xl'?: number
  }
}

const ResponsiveGridItem = React.forwardRef<HTMLDivElement, ResponsiveGridItemProps>(
  ({ children, className, span = {}, start = {}, ...props }, ref) => {
    // Generate responsive span classes
    const spanClasses = React.useMemo(() => {
      const classes: string[] = []
      
      Object.entries(span).forEach(([breakpoint, spanCount]) => {
        if (breakpoint === 'xs') {
          classes.push(`col-span-${spanCount}`)
        } else {
          classes.push(`${breakpoint}:col-span-${spanCount}`)
        }
      })

      Object.entries(start).forEach(([breakpoint, startPos]) => {
        if (breakpoint === 'xs') {
          classes.push(`col-start-${startPos}`)
        } else {
          classes.push(`${breakpoint}:col-start-${startPos}`)
        }
      })

      return classes.join(" ")
    }, [span, start])

    return (
      <div
        ref={ref}
        className={cn(spanClasses, className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
ResponsiveGridItem.displayName = "ResponsiveGridItem"

export { ResponsiveGrid, ResponsiveGridItem }