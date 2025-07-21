/**
 * Assignment Create Form Component
 * Sprint 3: Assignment System Development
 * İ-EP.APP - Ödev Oluşturma Formu
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { CalendarIcon, X, Plus, Clock, FileText, Settings, Save, Send, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { FileUpload } from '@/components/ui/file-upload';

const assignmentSchema = z.object({
  title: z.string().min(3, 'Başlık en az 3 karakter olmalıdır'),
  description: z.string().optional(),
  type: z.enum(['homework', 'exam', 'project', 'quiz', 'presentation']),
  subject: z.string().min(1, 'Ders seçimi zorunludur'),
  classId: z.string().min(1, 'Sınıf seçimi zorunludur'),
  dueDate: z.date({
    required_error: 'Son teslim tarihi zorunludur',
  }),
  maxScore: z.number().min(1, 'Maksimum puan en az 1 olmalıdır'),
  instructions: z.string().optional(),
  isGraded: z.boolean().default(true),
  allowLateSubmission: z.boolean().default(false),
  showResultsToStudents: z.boolean().default(true),
  attachments: z.array(z.string()).optional(),
  rubric: z
    .array(
      z.object({
        criteria: z.string(),
        points: z.number(),
        description: z.string(),
      })
    )
    .optional(),
});

type AssignmentFormData = z.infer<typeof assignmentSchema>;

export function AssignmentCreateForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [rubricCriteria, setRubricCriteria] = useState([
    { criteria: '', points: 0, description: '' },
  ]);

  const form = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'homework',
      subject: '',
      classId: '',
      maxScore: 100,
      instructions: '',
      isGraded: true,
      allowLateSubmission: false,
      showResultsToStudents: true,
      attachments: [],
      rubric: [],
    },
  });

  const handleFileUpload = async (files: File[]) => {
    try {
      const uploadedFiles: string[] = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'assignment');
        formData.append('category', 'teacher-material');

        const response = await fetch('/api/storage/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const result = await response.json();
        uploadedFiles.push(result.file.id);
      }

      setAttachments((prev) => [...prev, ...uploadedFiles]);
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  };

  const onSubmit = async (data: AssignmentFormData) => {
    setIsSubmitting(true);

    try {
      const submissionData = {
        ...data,
        attachments,
        rubric: rubricCriteria.filter((item) => item.criteria.trim() !== ''),
      };

      // Real API call to create assignment
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create assignment');
      }

      const createdAssignment = await response.json();
      console.log('Assignment created successfully:', createdAssignment);

      router.push('/dashboard/assignments');
    } catch (error) {
      console.error('Error creating assignment:', error);
      // TODO: Show proper error toast/notification to user
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveDraft = async () => {
    const data = form.getValues();
    console.log('Saving draft:', data);
  };

  const addRubricCriteria = () => {
    setRubricCriteria([...rubricCriteria, { criteria: '', points: 0, description: '' }]);
  };

  const removeRubricCriteria = (index: number) => {
    setRubricCriteria(rubricCriteria.filter((_, i) => i !== index));
  };

  // const getTypeLabel = (type: string) => {
  //   const types = {
  //     homework: 'Ödev',
  //     exam: 'Sınav',
  //     project: 'Proje',
  //     quiz: 'Quiz',
  //     presentation: 'Sunum'
  //   };
  //   return types[type as keyof typeof types] || type;
  // };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ödev Başlığı</FormLabel>
                <FormControl>
                  <Input placeholder="Ödev başlığını girin" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ödev Türü</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Ödev türünü seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="homework">Ödev</SelectItem>
                    <SelectItem value="exam">Sınav</SelectItem>
                    <SelectItem value="project">Proje</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="presentation">Sunum</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ders</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Ders seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="matematik">Matematik</SelectItem>
                    <SelectItem value="fen">Fen Bilgisi</SelectItem>
                    <SelectItem value="turkce">Türkçe</SelectItem>
                    <SelectItem value="sosyal">Sosyal Bilgiler</SelectItem>
                    <SelectItem value="ingilizce">İngilizce</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="classId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sınıf</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sınıf seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="5-a">5-A</SelectItem>
                    <SelectItem value="5-b">5-B</SelectItem>
                    <SelectItem value="6-a">6-A</SelectItem>
                    <SelectItem value="6-b">6-B</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Son Teslim Tarihi</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP', { locale: tr })
                        ) : (
                          <span>Tarih seçin</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxScore"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maksimum Puan</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="100"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Açıklama</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ödev hakkında kısa bir açıklama yazın..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>Öğrencilerin göreceği genel açıklama</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Instructions */}
        <FormField
          control={form.control}
          name="instructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Talimatlar</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ödev için detaylı talimatlar yazın..."
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Öğrencilere ödev nasıl yapılacağı konusunda rehberlik eden detaylı talimatlar
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* File Attachments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Dosya Ekleri
            </CardTitle>
            <CardDescription>Öğrencilerin görmesi gereken dosyaları ekleyin</CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload
              onUpload={handleFileUpload}
              type="assignment"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar"
              maxSize={50 * 1024 * 1024} // 50MB
              maxFiles={5}
              multiple={true}
              disabled={isSubmitting}
            />
            {attachments.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">{attachments.length} dosya yüklendi</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Ödev Ayarları
            </CardTitle>
            <CardDescription>Ödevin davranışını kontrol eden ayarlar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="isGraded"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Notlandırılacak</FormLabel>
                    <FormDescription>Bu ödev notlandırılacak mı?</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allowLateSubmission"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Geç Teslim</FormLabel>
                    <FormDescription>Son tarihten sonra teslim edilebilir mi?</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="showResultsToStudents"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Sonuçları Göster</FormLabel>
                    <FormDescription>Öğrenciler notlarını görebilsin mi?</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Rubric */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Değerlendirme Rubrigi
            </CardTitle>
            <CardDescription>Ödevin değerlendirilme kriterlerini belirleyin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {rubricCriteria.map((criterion, index) => (
              <div key={index} className="flex items-start gap-4 rounded-lg border p-4">
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="Kriter adı"
                    value={criterion.criteria}
                    onChange={(e) => {
                      const newCriteria = [...rubricCriteria];
                      newCriteria[index].criteria = e.target.value;
                      setRubricCriteria(newCriteria);
                    }}
                  />
                  <Input
                    type="number"
                    placeholder="Puan"
                    value={criterion.points}
                    onChange={(e) => {
                      const newCriteria = [...rubricCriteria];
                      newCriteria[index].points = parseInt(e.target.value) || 0;
                      setRubricCriteria(newCriteria);
                    }}
                  />
                  <Textarea
                    placeholder="Kriter açıklaması"
                    value={criterion.description}
                    onChange={(e) => {
                      const newCriteria = [...rubricCriteria];
                      newCriteria[index].description = e.target.value;
                      setRubricCriteria(newCriteria);
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRubricCriteria(index)}
                  disabled={rubricCriteria.length === 1}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addRubricCriteria} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Yeni Kriter Ekle
            </Button>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between pt-6">
          <Button type="button" variant="outline" onClick={saveDraft} disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            Taslak Kaydet
          </Button>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Ödev Oluştur
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
