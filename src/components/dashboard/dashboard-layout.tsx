'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Home,
  Users,
  Calendar,
  FileText,
  BarChart3,
  Settings,
  GraduationCap,
  BookOpen,
  Bell,
  LogOut,
  User,
  ChevronDown,
  Menu,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: {
    name?: string;
    email: string;
    role: string;
    avatar?: string;
  };
}

// Rol bazlı menü yapılandırması
const getMenuItems = (role: string) => {
  const baseItems = [
    {
      title: 'Ana Sayfa',
      icon: Home,
      href: '/dashboard',
    },
  ];

  switch (role) {
    case 'admin':
      return [
        ...baseItems,
        {
          title: 'Kullanıcılar',
          icon: Users,
          href: '/dashboard/users',
        },
        {
          title: 'Sınıflar',
          icon: GraduationCap,
          href: '/dashboard/classes',
        },
        {
          title: 'Dersler',
          icon: BookOpen,
          href: '/dashboard/courses',
        },
        {
          title: 'Raporlar',
          icon: BarChart3,
          href: '/dashboard/reports',
        },
        {
          title: 'Ayarlar',
          icon: Settings,
          href: '/dashboard/settings',
        },
      ];
    case 'teacher':
      return [
        ...baseItems,
        {
          title: 'Sınıflarım',
          icon: GraduationCap,
          href: '/dashboard/my-classes',
        },
        {
          title: 'Derslerim',
          icon: BookOpen,
          href: '/dashboard/my-courses',
        },
        {
          title: 'Ödevler',
          icon: FileText,
          href: '/dashboard/assignments',
        },
        {
          title: 'Takvim',
          icon: Calendar,
          href: '/dashboard/calendar',
        },
      ];
    case 'student':
      return [
        ...baseItems,
        {
          title: 'Derslerim',
          icon: BookOpen,
          href: '/dashboard/my-courses',
        },
        {
          title: 'Ödevlerim',
          icon: FileText,
          href: '/dashboard/my-assignments',
        },
        {
          title: 'Takvim',
          icon: Calendar,
          href: '/dashboard/calendar',
        },
        {
          title: 'Notlarım',
          icon: BarChart3,
          href: '/dashboard/grades',
        },
      ];
    default:
      return baseItems;
  }
};

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const menuItems = getMenuItems(user.role);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/auth/giris');
    } catch (err) {
      console.error('Çıkış hatası:', err);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        {/* Sidebar */}
        <Sidebar>
          <SidebarHeader className="border-b">
            <div className="flex items-center gap-2 px-2 py-4">
              <Image
                src="/logo.webp"
                alt="Iqra"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="font-semibold">Iqra Portal</span>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href}
                      >
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          
          <SidebarFooter className="border-t">
            <div className="p-4">
              <p className="text-xs text-muted-foreground">
                © 2024 Iqra Portal
              </p>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="border-b bg-background">
            <div className="flex h-16 items-center justify-between px-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <h1 className="text-lg font-semibold">Dashboard</h1>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Bildirimler */}
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
                    3
                  </span>
                </Button>
                
                {/* Kullanıcı Menüsü */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>
                          {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:inline-block">
                        {user.name || user.email}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Hesabım</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Ayarlar</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Çıkış Yap</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>
          
          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
} 