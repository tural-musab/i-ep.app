"use client"

import { createContext, useContext, useMemo, useState, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useViewport } from "@/hooks/use-mobile"
import { TouchButton } from "@/components/ui/touch-button"
import {
  ChevronRight,
  Home,
  MoreHorizontal,
  ArrowLeft,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface BreadcrumbItem {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
}

interface BreadcrumbNavigationProps {
  items?: BreadcrumbItem[]
  className?: string
  showBack?: boolean
}

// Route mapping for automatic breadcrumb generation
const routeMap: Record<string, BreadcrumbItem> = {
  '/dashboard': { label: 'Ana Sayfa', href: '/dashboard', icon: Home },
  '/dashboard/students': { label: 'Öğrenciler', href: '/dashboard/students' },
  '/dashboard/courses': { label: 'Dersler', href: '/dashboard/courses' },
  '/dashboard/assignments': { label: 'Ödevler', href: '/dashboard/assignments' },
  '/dashboard/assignments/create': { label: 'Ödev Oluştur', href: '/dashboard/assignments/create' },
  '/dashboard/attendance': { label: 'Yoklama', href: '/dashboard/attendance' },
  '/dashboard/attendance/daily': { label: 'Günlük Yoklama', href: '/dashboard/attendance/daily' },
  '/dashboard/attendance/reports': { label: 'Yoklama Raporları', href: '/dashboard/attendance/reports' },
  '/dashboard/grades': { label: 'Notlar', href: '/dashboard/grades' },
  '/dashboard/schedule': { label: 'Ders Programı', href: '/dashboard/schedule' },
  '/dashboard/parent-communication': { label: 'Veli İletişim', href: '/dashboard/parent-communication' },
  '/dashboard/settings': { label: 'Ayarlar', href: '/dashboard/settings' },
}

export function BreadcrumbNavigation({ 
  items, 
  className, 
  showBack = false 
}: BreadcrumbNavigationProps) {
  const pathname = usePathname()
  const viewport = useViewport()

  // Generate breadcrumbs from current path if items not provided
  const breadcrumbs = useMemo(() => {
    if (items) return items

    const pathSegments = pathname.split('/').filter(Boolean)
    const generatedItems: BreadcrumbItem[] = []

    let currentPath = ''
    for (const segment of pathSegments) {
      currentPath += `/${segment}`
      const routeInfo = routeMap[currentPath]
      if (routeInfo) {
        generatedItems.push(routeInfo)
      } else {
        // Generate item for unknown routes
        generatedItems.push({
          label: segment.charAt(0).toUpperCase() + segment.slice(1),
          href: currentPath
        })
      }
    }

    return generatedItems
  }, [pathname, items])

  // Mobile breadcrumb strategy
  const getMobileBreadcrumbs = () => {
    if (breadcrumbs.length <= 2) return breadcrumbs

    const first = breadcrumbs[0]
    const last = breadcrumbs[breadcrumbs.length - 1]
    const middle = breadcrumbs.slice(1, -1)

    return [first, { label: '...', href: '', isCollapsed: true }, last]
  }

  // Tablet breadcrumb strategy
  const getTabletBreadcrumbs = () => {
    if (breadcrumbs.length <= 4) return breadcrumbs

    const first = breadcrumbs[0]
    const last = breadcrumbs[breadcrumbs.length - 1]
    const secondLast = breadcrumbs[breadcrumbs.length - 2]
    const middle = breadcrumbs.slice(1, -2)

    return [first, { label: '...', href: '', isCollapsed: true }, secondLast, last]
  }

  const getResponsiveBreadcrumbs = () => {
    if (viewport.isMobile) return getMobileBreadcrumbs()
    if (viewport.isTablet) return getTabletBreadcrumbs()
    return breadcrumbs
  }

  const responsiveBreadcrumbs = getResponsiveBreadcrumbs()
  const collapsedItems = breadcrumbs.slice(1, -1)

  // Get parent route for back button
  const parentRoute = breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 2] : null

  return (
    <nav className={cn("flex items-center space-x-2", className)}>
      {/* Back Button for Mobile */}
      {showBack && viewport.isMobile && parentRoute && (
        <Link href={parentRoute.href}>
          <TouchButton
            variant="ghost"
            size="sm"
            className="p-1 h-8 w-8"
            touchTarget="comfortable"
          >
            <ArrowLeft className="h-4 w-4" />
          </TouchButton>
        </Link>
      )}

      {/* Breadcrumb Items */}
      <ol className="flex items-center space-x-1 text-sm">
        {responsiveBreadcrumbs.map((item, index) => {
          const isLast = index === responsiveBreadcrumbs.length - 1
          const isCollapsed = 'isCollapsed' in item && item.isCollapsed

          return (
            <li key={item.href || index} className="flex items-center">
              {/* Separator */}
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
              )}

              {/* Collapsed Items Dropdown */}
              {isCollapsed ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <TouchButton
                      variant="ghost"
                      size="sm"
                      className="p-1 h-8 w-8 text-gray-500"
                      touchTarget="comfortable"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </TouchButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {collapsedItems.map((collapsedItem) => (
                      <DropdownMenuItem key={collapsedItem.href} asChild>
                        <Link href={collapsedItem.href}>
                          {collapsedItem.icon && (
                            <collapsedItem.icon className="h-4 w-4 mr-2" />
                          )}
                          {collapsedItem.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                /* Regular Breadcrumb Item */
                <div className="flex items-center">
                  {isLast ? (
                    <span className="text-gray-900 dark:text-gray-100 font-medium truncate max-w-[150px] md:max-w-[200px]">
                      {item.icon && (
                        <item.icon className="h-4 w-4 mr-1 inline" />
                      )}
                      {item.label}
                    </span>
                  ) : (
                    <Link
                      href={item.href}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors truncate max-w-[120px] md:max-w-[150px]"
                    >
                      {item.icon && (
                        <item.icon className="h-4 w-4 mr-1 inline" />
                      )}
                      {item.label}
                    </Link>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ol>

      {/* Current Page Title for Mobile */}
      {viewport.isMobile && breadcrumbs.length > 0 && (
        <div className="flex-1 text-right">
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {breadcrumbs[breadcrumbs.length - 1].label}
          </span>
        </div>
      )}
    </nav>
  )
}

// Context for breadcrumb management
interface BreadcrumbContextValue {
  setBreadcrumbs: (items: BreadcrumbItem[]) => void
  addBreadcrumb: (item: BreadcrumbItem) => void
  removeBreadcrumb: (href: string) => void
}

const BreadcrumbContext = createContext<BreadcrumbContextValue | undefined>(undefined)

export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([])

  const addBreadcrumb = useCallback((item: BreadcrumbItem) => {
    setBreadcrumbs(prev => {
      const exists = prev.some(b => b.href === item.href)
      if (exists) return prev
      return [...prev, item]
    })
  }, [])

  const removeBreadcrumb = useCallback((href: string) => {
    setBreadcrumbs(prev => prev.filter(b => b.href !== href))
  }, [])

  const value = useMemo(() => ({
    setBreadcrumbs,
    addBreadcrumb,
    removeBreadcrumb,
  }), [addBreadcrumb, removeBreadcrumb])

  return (
    <BreadcrumbContext.Provider value={value}>
      {children}
    </BreadcrumbContext.Provider>
  )
}

export function useBreadcrumb() {
  const context = useContext(BreadcrumbContext)
  if (!context) {
    throw new Error('useBreadcrumb must be used within a BreadcrumbProvider')
  }
  return context
}