"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useViewport } from "@/hooks/use-mobile"
import { TouchButton } from "@/components/ui/touch-button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Menu,
  X,
  Home,
  Users,
  BookOpen,
  Calendar,
  FileText,
  ClipboardCheck,
  Star,
  MessageCircle,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
} from "lucide-react"

interface NavigationItem {
  id: string
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  children?: NavigationItem[]
  badge?: string | number
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Ana Sayfa',
    href: '/dashboard',
    icon: Home,
  },
  {
    id: 'students',
    label: 'Öğrenciler',
    href: '/dashboard/students',
    icon: Users,
  },
  {
    id: 'courses',
    label: 'Dersler',
    href: '/dashboard/courses',
    icon: BookOpen,
  },
  {
    id: 'schedule',
    label: 'Ders Programı',
    href: '/dashboard/schedule',
    icon: Calendar,
  },
  {
    id: 'assignments',
    label: 'Ödevler',
    href: '/dashboard/assignments',
    icon: FileText,
    badge: 3,
  },
  {
    id: 'attendance',
    label: 'Yoklama',
    href: '/dashboard/attendance',
    icon: ClipboardCheck,
  },
  {
    id: 'grades',
    label: 'Notlar',
    href: '/dashboard/grades',
    icon: Star,
  },
  {
    id: 'messages',
    label: 'Mesajlar',
    href: '/dashboard/parent-communication',
    icon: MessageCircle,
    badge: 2,
  },
  {
    id: 'notifications',
    label: 'Bildirimler',
    href: '/dashboard/notifications',
    icon: Bell,
  },
]

interface AdaptiveNavigationProps {
  className?: string
}

export function AdaptiveNavigation({ className }: AdaptiveNavigationProps) {
  const pathname = usePathname()
  const viewport = useViewport()
  const [isOpen, setIsOpen] = React.useState(false)
  const [collapsedSidebar, setCollapsedSidebar] = React.useState(false)
  const [expandedItems, setExpandedItems] = React.useState<string[]>([])

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const NavigationContent = () => (
    <nav className="flex flex-col h-full">
      <div className="flex-1 space-y-2 p-2">
        {navigationItems.map((item) => (
          <NavigationItem
            key={item.id}
            item={item}
            pathname={pathname}
            collapsed={collapsedSidebar && viewport.isDesktop}
            expanded={expandedItems.includes(item.id)}
            onToggle={() => toggleExpanded(item.id)}
            onNavigate={() => setIsOpen(false)}
          />
        ))}
      </div>
      
      <div className="p-2 border-t space-y-2">
        <NavigationItem
          item={{
            id: 'settings',
            label: 'Ayarlar',
            href: '/dashboard/settings',
            icon: Settings,
          }}
          pathname={pathname}
          collapsed={collapsedSidebar && viewport.isDesktop}
          expanded={false}
          onToggle={() => {}}
          onNavigate={() => setIsOpen(false)}
        />
        <TouchButton
          variant="ghost"
          size="default"
          className={cn(
            "w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50",
            collapsedSidebar && viewport.isDesktop && "justify-center px-2"
          )}
        >
          <LogOut className="h-5 w-5" />
          {(!collapsedSidebar || !viewport.isDesktop) && (
            <span className="ml-2">Çıkış Yap</span>
          )}
        </TouchButton>
      </div>
    </nav>
  )

  // Mobile Navigation (Sheet)
  if (viewport.isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <TouchButton
            variant="ghost"
            size="icon"
            className="md:hidden"
            touchTarget="comfortable"
          >
            <Menu className="h-6 w-6" />
          </TouchButton>
        </SheetTrigger>
        <SheetContent side="left" className="w-280 p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="text-left">İqra Eğitim Portalı</SheetTitle>
          </SheetHeader>
          <NavigationContent />
        </SheetContent>
      </Sheet>
    )
  }

  // Desktop Navigation (Sidebar)
  return (
    <div className={cn("hidden md:flex", className)}>
      <div
        className={cn(
          "flex flex-col bg-white dark:bg-gray-900 border-r transition-all duration-200",
          collapsedSidebar ? "w-16" : "w-64"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b">
          {!collapsedSidebar && (
            <h2 className="text-lg font-semibold">İqra EP</h2>
          )}
          <TouchButton
            variant="ghost"
            size="icon"
            onClick={() => setCollapsedSidebar(!collapsedSidebar)}
            touchTarget="comfortable"
          >
            {collapsedSidebar ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </TouchButton>
        </div>
        
        <NavigationContent />
      </div>
    </div>
  )
}

interface NavigationItemProps {
  item: NavigationItem
  pathname: string
  collapsed: boolean
  expanded: boolean
  onToggle: () => void
  onNavigate: () => void
}

function NavigationItem({ 
  item, 
  pathname, 
  collapsed, 
  expanded, 
  onToggle, 
  onNavigate 
}: NavigationItemProps) {
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
  const Icon = item.icon
  
  return (
    <div>
      <Link
        href={item.href}
        onClick={onNavigate}
        className={cn(
          "flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors",
          "hover:bg-gray-100 dark:hover:bg-gray-800",
          isActive && "bg-primary/10 text-primary",
          collapsed && "justify-center px-2"
        )}
      >
        <Icon className="h-5 w-5 flex-shrink-0" />
        {!collapsed && (
          <>
            <span className="ml-3 flex-1 text-left">{item.label}</span>
            {item.badge && (
              <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                {item.badge}
              </span>
            )}
          </>
        )}
      </Link>
      
      {item.children && !collapsed && (
        <div className={cn("ml-4 mt-1 space-y-1", !expanded && "hidden")}>
          {item.children.map((child) => (
            <NavigationItem
              key={child.id}
              item={child}
              pathname={pathname}
              collapsed={false}
              expanded={false}
              onToggle={() => {}}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  )
}