/**
 * Domain Ekleme Dialog Komponenti
 * Yeni subdomain veya özel domain eklemek için dialog
 * Referans: docs/domain-management.md
 */

"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

// Form şema validasyonları
const customDomainSchema = z.object({
  domain: z
    .string()
    .min(3, { message: "Domain en az 3 karakter olmalıdır" })
    .regex(/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/, {
      message: "Geçerli bir domain adresi girin (örn: example.com)",
    }),
  isPrimary: z.boolean().default(false),
  tenantId: z.string().min(1, { message: "Tenant ID gereklidir" }),
});

const subdomainSchema = z.object({
  subdomain: z
    .string()
    .min(2, { message: "Subdomain en az 2 karakter olmalıdır" })
    .max(63, { message: "Subdomain en fazla 63 karakter olabilir" })
    .regex(/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/, {
      message: "Sadece küçük harf, rakam ve tire kullanabilirsiniz",
    }),
  tenantId: z.string().min(1, { message: "Tenant ID gereklidir" }),
});

// Props tanımlaması
interface AddDomainDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDomainAdded: () => void;
  defaultTenantId?: string;
}

export function AddDomainDialog({
  open,
  onOpenChange,
  onDomainAdded,
  defaultTenantId = "",
}: AddDomainDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"subdomain" | "custom">("subdomain");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Custom domain form
  const customDomainForm = useForm<z.infer<typeof customDomainSchema>>({
    resolver: zodResolver(customDomainSchema),
    defaultValues: {
      domain: "",
      isPrimary: false,
      tenantId: defaultTenantId,
    },
  });

  // Subdomain form
  const subdomainForm = useForm<z.infer<typeof subdomainSchema>>({
    resolver: zodResolver(subdomainSchema),
    defaultValues: {
      subdomain: "",
      tenantId: defaultTenantId,
    },
  });

  // Özel domain ekleme işlemi
  const handleCustomDomainSubmit = async (values: z.infer<typeof customDomainSchema>) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/domains/custom", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          domain: values.domain,
          isPrimary: values.isPrimary,
          tenantId: values.tenantId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Başarılı",
          description: "Özel domain başarıyla eklendi, doğrulama gerekiyor",
        });
        customDomainForm.reset();
        onDomainAdded();
      } else {
        toast({
          title: "Hata",
          description: result.error || "Domain eklenirken bir hata oluştu",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Domain ekleme hatası:", error);
      toast({
        title: "Hata",
        description: "Domain eklenirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Subdomain ekleme işlemi
  const handleSubdomainSubmit = async (values: z.infer<typeof subdomainSchema>) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/domains/subdomain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subdomain: values.subdomain,
          tenantId: values.tenantId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Başarılı",
          description: "Subdomain başarıyla oluşturuldu",
        });
        subdomainForm.reset();
        onDomainAdded();
      } else {
        toast({
          title: "Hata",
          description: result.error || "Subdomain oluşturulurken bir hata oluştu",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Subdomain oluşturma hatası:", error);
      toast({
        title: "Hata",
        description: "Subdomain oluşturulurken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Domain Ekle</DialogTitle>
        </DialogHeader>

        <Tabs
          defaultValue="subdomain"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "subdomain" | "custom")}
          className="mt-4"
        >
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="subdomain">Subdomain</TabsTrigger>
            <TabsTrigger value="custom">Özel Domain</TabsTrigger>
          </TabsList>

          {/* Subdomain Ekleme Formu */}
          <TabsContent value="subdomain">
            <Form {...subdomainForm}>
              <form onSubmit={subdomainForm.handleSubmit(handleSubdomainSubmit)} className="space-y-4">
                <FormField
                  control={subdomainForm.control}
                  name="tenantId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tenant ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Tenant ID girin"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={subdomainForm.control}
                  name="subdomain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subdomain</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <Input
                            placeholder="okul-adi"
                            {...field}
                          />
                          <span className="ml-2 text-muted-foreground">.i-ep.app</span>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Subdomain sadece küçük harf, rakam ve tire içerebilir.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Subdomain Oluştur
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>

          {/* Özel Domain Ekleme Formu */}
          <TabsContent value="custom">
            <Form {...customDomainForm}>
              <form onSubmit={customDomainForm.handleSubmit(handleCustomDomainSubmit)} className="space-y-4">
                <FormField
                  control={customDomainForm.control}
                  name="tenantId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tenant ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Tenant ID girin"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={customDomainForm.control}
                  name="domain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Özel Domain</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="örn: okul-adi.com"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Tam domain adresini girin.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={customDomainForm.control}
                  name="isPrimary"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Öncelik</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) => field.onChange(value === "true")}
                          defaultValue={field.value ? "true" : "false"}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="false" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Secondary Domain
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="true" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Primary Domain (doğrulandıktan sonra)
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Özel Domain Ekle
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 