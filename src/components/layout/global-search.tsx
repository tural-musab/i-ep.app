"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useViewport } from "@/hooks/use-mobile"
import { TouchButton } from "@/components/ui/touch-button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Search,
  Users,
  BookOpen,
  FileText,
  Calendar,
  ClipboardCheck,
  Star,
  MessageCircle,
  Settings,
  Clock,
  TrendingUp,
} from "lucide-react"

interface SearchResult {
  id: string
  title: string
  description?: string
  type: 'student' | 'course' | 'assignment' | 'grade' | 'attendance' | 'message' | 'page'
  href: string
  icon: React.ComponentType<{ className?: string }>
  metadata?: {
    class?: string
    date?: string
    status?: string
  }
}

interface GlobalSearchProps {
  className?: string
}

// Mock search data - replace with actual API calls
const mockSearchResults: SearchResult[] = [
  {
    id: '1',
    title: 'Ahmet Yılmaz',
    description: '7-A sınıfı',
    type: 'student',
    href: '/dashboard/students/1',
    icon: Users,
    metadata: { class: '7-A' }
  },
  {
    id: '2',
    title: 'Matematik',
    description: 'Temel matematik dersi',
    type: 'course',
    href: '/dashboard/courses/2',
    icon: BookOpen,
    metadata: { class: '7-A' }
  },
  {
    id: '3',
    title: 'Matematik Ödevi #1',
    description: 'Teslim tarihi: 15 Temmuz',
    type: 'assignment',
    href: '/dashboard/assignments/3',
    icon: FileText,
    metadata: { date: '15 Temmuz', status: 'active' }
  },
  {
    id: '4',
    title: 'Veli Toplantısı',
    description: 'Ayşe Demir ile görüşme',
    type: 'message',
    href: '/dashboard/parent-communication/4',
    icon: MessageCircle,
    metadata: { date: '16 Temmuz' }
  },
  {
    id: '5',
    title: 'Yoklama Raporu',
    description: 'Haziran ayı devamsızlık raporu',
    type: 'attendance',
    href: '/dashboard/attendance/reports/5',
    icon: ClipboardCheck,
    metadata: { date: 'Haziran 2025' }
  },
  {
    id: '6',
    title: 'Ders Programı',
    description: 'Haftalık ders programı',
    type: 'page',
    href: '/dashboard/schedule',
    icon: Calendar,
  },
  {
    id: '7',
    title: 'Notlar',
    description: 'Öğrenci notları ve değerlendirmeler',
    type: 'page',
    href: '/dashboard/grades',
    icon: Star,
  },
  {
    id: '8',
    title: 'Ayarlar',
    description: 'Sistem ayarları ve konfigürasyon',
    type: 'page',
    href: '/dashboard/settings',
    icon: Settings,
  }
]

const typeConfig = {
  student: { label: 'Öğrenciler', icon: Users },
  course: { label: 'Dersler', icon: BookOpen },
  assignment: { label: 'Ödevler', icon: FileText },
  grade: { label: 'Notlar', icon: Star },
  attendance: { label: 'Yoklama', icon: ClipboardCheck },
  message: { label: 'Mesajlar', icon: MessageCircle },
  page: { label: 'Sayfalar', icon: Calendar }
}

export function GlobalSearch({ className }: GlobalSearchProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const [results, setResults] = React.useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [recentSearches, setRecentSearches] = React.useState<SearchResult[]>([])
  
  const router = useRouter()
  const viewport = useViewport()

  // Search function with debouncing
  const performSearch = React.useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([])
        return
      }

      setIsLoading(true)
      
      // Simulate API call with debouncing
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const filtered = mockSearchResults.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      
      setResults(filtered)
      setIsLoading(false)
    },
    []
  )

  // Debounced search effect
  React.useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, performSearch])

  // Handle result selection
  const handleSelect = React.useCallback((result: SearchResult) => {
    // Add to recent searches
    setRecentSearches(prev => {
      const filtered = prev.filter(item => item.id !== result.id)
      return [result, ...filtered].slice(0, 5)
    })
    
    setOpen(false)
    setQuery('')
    router.push(result.href)
  }, [router])

  // Group results by type
  const groupedResults = React.useMemo(() => {
    const groups: Record<string, SearchResult[]> = {}
    
    results.forEach(result => {
      if (!groups[result.type]) {
        groups[result.type] = []
      }
      groups[result.type].push(result)
    })
    
    return groups
  }, [results])

  // Keyboard shortcut
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <TouchButton
          variant="outline"
          className={cn(
            "relative w-full justify-start text-sm text-muted-foreground sm:pr-12",
            viewport.isMobile ? "w-10 h-10 p-0" : "w-64",
            className
          )}
          touchTarget="comfortable"
        >
          <Search className="h-4 w-4" />
          {!viewport.isMobile && (
            <>
              <span className="ml-2 flex-1 text-left">Ara...</span>
              <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </>
          )}
        </TouchButton>
      </DialogTrigger>
      
      <DialogContent className={cn(
        "p-0",
        viewport.isMobile ? "h-[90vh] w-[95vw]" : "max-w-2xl"
      )}>
        <DialogHeader className="sr-only">
          <DialogTitle>Arama</DialogTitle>
        </DialogHeader>
        
        <Command className="rounded-lg border-none shadow-md">
          <CommandInput
            placeholder="Öğrenci, ders, ödev ara..."
            value={query}
            onValueChange={setQuery}
            className="border-none"
          />
          
          <CommandList className={cn(
            "max-h-[300px] overflow-y-auto",
            viewport.isMobile && "max-h-[60vh]"
          )}>
            {isLoading && (
              <div className="flex items-center justify-center py-6">
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                  <span className="text-sm text-gray-500">Aranıyor...</span>
                </div>
              </div>
            )}
            
            {!isLoading && !query && recentSearches.length > 0 && (
              <CommandGroup heading="Son Aramalar">
                {recentSearches.map((result) => {
                  const Icon = result.icon
                  return (
                    <CommandItem
                      key={result.id}
                      value={result.title}
                      onSelect={() => handleSelect(result)}
                      className="flex items-center space-x-3 p-3 cursor-pointer"
                    >
                      <Icon className="h-4 w-4 text-gray-500" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {result.title}
                        </div>
                        {result.description && (
                          <div className="text-xs text-gray-500 truncate">
                            {result.description}
                          </div>
                        )}
                      </div>
                      <Clock className="h-3 w-3 text-gray-400" />
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            )}
            
            {!isLoading && query && results.length === 0 && (
              <CommandEmpty>
                <div className="text-center py-6">
                  <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    "{query}" için sonuç bulunamadı
                  </p>
                </div>
              </CommandEmpty>
            )}
            
            {!isLoading && results.length > 0 && (
              <>
                {Object.entries(groupedResults).map(([type, items], index) => {
                  const config = typeConfig[type as keyof typeof typeConfig]
                  if (!config) return null
                  
                  return (
                    <React.Fragment key={type}>
                      {index > 0 && <CommandSeparator />}
                      <CommandGroup heading={config.label}>
                        {items.map((result) => {
                          const Icon = result.icon
                          return (
                            <CommandItem
                              key={result.id}
                              value={result.title}
                              onSelect={() => handleSelect(result)}
                              className="flex items-center space-x-3 p-3 cursor-pointer"
                            >
                              <Icon className="h-4 w-4 text-gray-500" />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">
                                  {result.title}
                                </div>
                                {result.description && (
                                  <div className="text-xs text-gray-500 truncate">
                                    {result.description}
                                  </div>
                                )}
                                {result.metadata && (
                                  <div className="flex items-center space-x-2 mt-1">
                                    {result.metadata.class && (
                                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                        {result.metadata.class}
                                      </span>
                                    )}
                                    {result.metadata.date && (
                                      <span className="text-xs text-gray-400">
                                        {result.metadata.date}
                                      </span>
                                    )}
                                    {result.metadata.status && (
                                      <span className={cn(
                                        "text-xs px-2 py-0.5 rounded",
                                        result.metadata.status === 'active' 
                                          ? "bg-green-100 text-green-800"
                                          : "bg-gray-100 text-gray-800"
                                      )}>
                                        {result.metadata.status}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                              <TrendingUp className="h-3 w-3 text-gray-400" />
                            </CommandItem>
                          )
                        })}
                      </CommandGroup>
                    </React.Fragment>
                  )
                })}
              </>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}