"use client"

import React, { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"

// Form şeması
const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "İsim en az 2 karakter olmalıdır.",
  }),
  email: z.string().email({
    message: "Geçerli bir e-posta adresi girin.",
  }),
  phone: z.string().optional(),
  bio: z.string().max(500, {
    message: "Biyografi en fazla 500 karakter olabilir.",
  }).optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

// Şifre form şeması
const passwordFormSchema = z.object({
  currentPassword: z.string().min(8, {
    message: "Mevcut şifre en az 8 karakter olmalıdır.",
  }),
  newPassword: z.string().min(8, {
    message: "Yeni şifre en az 8 karakter olmalıdır.",
  }),
  confirmPassword: z.string().min(8, {
    message: "Şifre onayı en az 8 karakter olmalıdır.",
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
})

type PasswordFormValues = z.infer<typeof passwordFormSchema>

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile")
  const [isSaving, setIsSaving] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Örnek kullanıcı verisi
  const [user, setUser] = useState({
    name: "Admin Kullanıcı",
    email: "admin@example.com",
    phone: "+90 555 123 4567",
    bio: "Sistem yöneticisi olarak görev yapıyorum.",
    role: "Super Admin",
    lastLogin: "25.03.2025 12:45",
    createdAt: "01.01.2025",
    avatar: "",
  })

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      phone: user.phone,
      bio: user.bio,
    },
  })

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  function onProfileSubmit(data: ProfileFormValues) {
    setIsSaving(true)
    // Profil güncelleme işlemi burada yapılacak
    console.log(data)
    setTimeout(() => {
      setUser({
        ...user,
        name: data.name,
        email: data.email,
        phone: data.phone || "",
        bio: data.bio || "",
      })
      setIsSaving(false)
    }, 1000)
  }

  function onPasswordSubmit(data: PasswordFormValues) {
    setIsChangingPassword(true)
    // Şifre değiştirme işlemi burada yapılacak
    console.log(data)
    setTimeout(() => {
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setIsChangingPassword(false)
    }, 1000)
  }

  function onDeleteAccount() {
    // Hesap silme işlemi burada yapılacak
    console.log("Hesap siliniyor")
    setShowDeleteDialog(false)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Profil Yönetimi</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sol sütun - Kullanıcı kartı */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profil Bilgileri</CardTitle>
            <CardDescription>Hesap bilgilerinizi görüntüleyin</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Avatar className="h-32 w-32">
              <AvatarImage src={user.avatar || ""} alt={user.name} />
              <AvatarFallback className="text-2xl">{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="text-xl font-semibold">{user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <Badge className="mt-2" variant="secondary">{user.role}</Badge>
            </div>
            <div className="w-full space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Son Giriş:</span>
                <span>{user.lastLogin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kayıt Tarihi:</span>
                <span>{user.createdAt}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sağ sütun - Formlar */}
        <div className="md:col-span-3">
          <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="profile">Profil Bilgileri</TabsTrigger>
              <TabsTrigger value="security">Güvenlik</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profil Bilgileri</CardTitle>
                  <CardDescription>
                    Profil bilgilerinizi güncelleyin. E-posta adresiniz giriş için kullanılacaktır.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                      <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ad Soyad</FormLabel>
                            <FormControl>
                              <Input placeholder="Ad Soyad" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>E-posta</FormLabel>
                            <FormControl>
                              <Input placeholder="E-posta adresi" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefon</FormLabel>
                            <FormControl>
                              <Input placeholder="Telefon numarası" {...field} />
                            </FormControl>
                            <FormDescription>
                              İsteğe bağlı. Telefon numaranız kimseyle paylaşılmaz.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" disabled={isSaving}>
                        {isSaving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Şifre Değiştir</CardTitle>
                  <CardDescription>
                    Hesabınızın şifresini güncelleyin. Güvenliğiniz için güçlü bir şifre oluşturmanızı öneririz.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mevcut Şifre</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Yeni Şifre</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormDescription>
                              Şifreniz en az 8 karakter olmalıdır.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Şifre Onayı</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" disabled={isChangingPassword}>
                        {isChangingPassword ? "Şifre Değiştiriliyor..." : "Şifre Değiştir"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <Separator className="my-4" />
                <CardFooter className="flex flex-col items-start">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Hesap Yönetimi</h3>
                    <p className="text-sm text-muted-foreground">
                      Bu işlem geri alınamaz. Hesabınızı sildiğinizde, tüm verileriniz kalıcı olarak silinecektir.
                    </p>
                  </div>
                  <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="mt-4">
                        Hesabımı Sil
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hesabınızı silmek istediğinizden emin misiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bu işlem geri alınamaz. Hesabınızı sildiğinizde, tüm verileriniz kalıcı olarak silinecektir.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction onClick={onDeleteAccount} className="bg-destructive text-destructive-foreground">
                          Hesabımı Sil
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
} 