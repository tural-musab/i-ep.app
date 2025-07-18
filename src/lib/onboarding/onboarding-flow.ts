import { createClient } from '@/lib/supabase/client';
import { environmentManager } from '@/lib/config/environment';

export type OnboardingStep =
  | 'welcome'
  | 'school_setup'
  | 'user_profile'
  | 'class_setup'
  | 'integration_setup'
  | 'completion';

export interface OnboardingProgress {
  id: string;
  user_id: string;
  tenant_id: string;
  current_step: OnboardingStep;
  completed_steps: OnboardingStep[];
  step_data: Record<string, any>;
  started_at: string;
  completed_at?: string;
  estimated_completion_time: number;
  actual_completion_time?: number;
  user_preferences: {
    skip_tutorial: boolean;
    preferred_language: string;
    role_specific_guidance: boolean;
    advanced_features_interest: boolean;
  };
}

export interface OnboardingStepConfig {
  id: OnboardingStep;
  title: string;
  description: string;
  estimated_time: number;
  required: boolean;
  role_specific: string[];
  prerequisites: OnboardingStep[];
  components: Array<{
    type: 'form' | 'tutorial' | 'demo' | 'checklist' | 'video';
    config: Record<string, any>;
  }>;
  validation: {
    required_fields: string[];
    validation_rules: Record<string, any>;
  };
}

export interface OnboardingTemplate {
  id: string;
  name: string;
  description: string;
  target_role: 'admin' | 'teacher' | 'student' | 'parent';
  steps: OnboardingStepConfig[];
  estimated_total_time: number;
  success_criteria: string[];
}

export interface OnboardingMetrics {
  total_users_onboarded: number;
  average_completion_time: number;
  completion_rate: number;
  most_common_exit_step: OnboardingStep;
  step_completion_rates: Record<OnboardingStep, number>;
  user_satisfaction_score: number;
  support_requests_during_onboarding: number;
}

export class OnboardingFlowManager {
  private supabase: any;
  private tenantId: string;
  private userId: string;

  constructor(tenantId: string, userId: string) {
    this.supabase = createClient();
    this.tenantId = tenantId;
    this.userId = userId;
  }

  /**
   * Start onboarding process
   */
  async startOnboarding(userRole: string, preferences: any = {}): Promise<OnboardingProgress> {
    try {
      // Get appropriate template for user role
      const template = this.getOnboardingTemplate(userRole);

      // Check if user already has onboarding in progress
      const existingProgress = await this.getOnboardingProgress();
      if (existingProgress && !existingProgress.completed_at) {
        return existingProgress;
      }

      // Create new onboarding progress
      const { data, error } = await this.supabase
        .from('onboarding_progress')
        .insert({
          user_id: this.userId,
          tenant_id: this.tenantId,
          current_step: 'welcome',
          completed_steps: [],
          step_data: {},
          started_at: new Date().toISOString(),
          estimated_completion_time: template.estimated_total_time,
          user_preferences: {
            skip_tutorial: preferences.skip_tutorial || false,
            preferred_language: preferences.preferred_language || 'tr',
            role_specific_guidance: preferences.role_specific_guidance !== false,
            advanced_features_interest: preferences.advanced_features_interest || false,
          },
        })
        .select()
        .single();

      if (error) throw error;

      // Record onboarding start event
      await this.recordOnboardingEvent('started', 'welcome', {
        user_role: userRole,
        template_id: template.id,
        preferences,
      });

      return data;
    } catch (error) {
      console.error('Error starting onboarding:', error);
      throw new Error('Failed to start onboarding process');
    }
  }

  /**
   * Get current onboarding progress
   */
  async getOnboardingProgress(): Promise<OnboardingProgress | null> {
    try {
      const { data, error } = await this.supabase
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', this.userId)
        .eq('tenant_id', this.tenantId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Error getting onboarding progress:', error);
      throw new Error('Failed to get onboarding progress');
    }
  }

  /**
   * Complete onboarding step
   */
  async completeStep(
    step: OnboardingStep,
    stepData: Record<string, any> = {}
  ): Promise<OnboardingProgress> {
    try {
      const progress = await this.getOnboardingProgress();
      if (!progress) {
        throw new Error('No onboarding progress found');
      }

      // Validate step completion
      const template = this.getOnboardingTemplate(
        progress.user_preferences.role_specific_guidance ? 'admin' : 'teacher'
      );
      const stepConfig = template.steps.find((s) => s.id === step);
      if (!stepConfig) {
        throw new Error(`Invalid step: ${step}`);
      }

      const validationResult = this.validateStepData(stepConfig, stepData);
      if (!validationResult.valid) {
        throw new Error(`Step validation failed: ${validationResult.errors.join(', ')}`);
      }

      // Update progress
      const completedSteps = [...progress.completed_steps, step];
      const nextStep = this.getNextStep(completedSteps, template);

      const { data, error } = await this.supabase
        .from('onboarding_progress')
        .update({
          current_step: nextStep,
          completed_steps: completedSteps,
          step_data: {
            ...progress.step_data,
            [step]: stepData,
          },
          completed_at: nextStep === 'completion' ? new Date().toISOString() : null,
          actual_completion_time:
            nextStep === 'completion'
              ? Math.round((Date.now() - new Date(progress.started_at).getTime()) / 1000)
              : null,
        })
        .eq('id', progress.id)
        .select()
        .single();

      if (error) throw error;

      // Record step completion event
      await this.recordOnboardingEvent('step_completed', step, stepData);

      // If onboarding is complete, trigger completion actions
      if (nextStep === 'completion') {
        await this.handleOnboardingCompletion(data);
      }

      return data;
    } catch (error) {
      console.error('Error completing step:', error);
      throw new Error('Failed to complete onboarding step');
    }
  }

  /**
   * Skip onboarding step
   */
  async skipStep(step: OnboardingStep, reason: string = ''): Promise<OnboardingProgress> {
    try {
      const progress = await this.getOnboardingProgress();
      if (!progress) {
        throw new Error('No onboarding progress found');
      }

      // Check if step can be skipped
      const template = this.getOnboardingTemplate('admin');
      const stepConfig = template.steps.find((s) => s.id === step);
      if (stepConfig?.required) {
        throw new Error('Cannot skip required step');
      }

      // Record skip event
      await this.recordOnboardingEvent('step_skipped', step, { reason });

      // Continue to next step
      const completedSteps = [...progress.completed_steps, step];
      const nextStep = this.getNextStep(completedSteps, template);

      const { data, error } = await this.supabase
        .from('onboarding_progress')
        .update({
          current_step: nextStep,
          completed_steps: completedSteps,
          step_data: {
            ...progress.step_data,
            [step]: { skipped: true, reason },
          },
        })
        .eq('id', progress.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error skipping step:', error);
      throw new Error('Failed to skip onboarding step');
    }
  }

  /**
   * Get step configuration
   */
  getStepConfig(step: OnboardingStep, userRole: string = 'admin'): OnboardingStepConfig | null {
    const template = this.getOnboardingTemplate(userRole);
    return template.steps.find((s) => s.id === step) || null;
  }

  /**
   * Get onboarding metrics
   */
  async getOnboardingMetrics(): Promise<OnboardingMetrics> {
    try {
      // Get all onboarding progress records
      const { data: progressRecords } = await this.supabase
        .from('onboarding_progress')
        .select('*')
        .eq('tenant_id', this.tenantId);

      // Get onboarding events
      const { data: events } = await this.supabase
        .from('onboarding_events')
        .select('*')
        .eq('tenant_id', this.tenantId);

      const totalUsers = progressRecords?.length || 0;
      const completedUsers = progressRecords?.filter((p) => p.completed_at).length || 0;
      const completionRate = totalUsers > 0 ? (completedUsers / totalUsers) * 100 : 0;

      const averageCompletionTime =
        completedUsers > 0
          ? progressRecords
              .filter((p) => p.actual_completion_time)
              .reduce((sum, p) => sum + p.actual_completion_time, 0) / completedUsers
          : 0;

      // Calculate step completion rates
      const stepCompletionRates = {} as Record<OnboardingStep, number>;
      const steps: OnboardingStep[] = [
        'welcome',
        'school_setup',
        'user_profile',
        'class_setup',
        'integration_setup',
        'completion',
      ];

      steps.forEach((step) => {
        const usersWhoReachedStep =
          progressRecords?.filter(
            (p) => p.completed_steps.includes(step) || p.current_step === step
          ).length || 0;
        stepCompletionRates[step] = totalUsers > 0 ? (usersWhoReachedStep / totalUsers) * 100 : 0;
      });

      // Find most common exit step
      const exitSteps =
        progressRecords?.filter((p) => !p.completed_at).map((p) => p.current_step) || [];
      const mostCommonExitStep = exitSteps.reduce(
        (acc, step) => {
          acc[step] = (acc[step] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      const mostCommonExit =
        (Object.entries(mostCommonExitStep).reduce((a, b) =>
          mostCommonExitStep[a[0]] > mostCommonExitStep[b[0]] ? a : b
        )?.[0] as OnboardingStep) || 'welcome';

      return {
        total_users_onboarded: totalUsers,
        average_completion_time: Math.round(averageCompletionTime),
        completion_rate: Math.round(completionRate),
        most_common_exit_step: mostCommonExit,
        step_completion_rates: stepCompletionRates,
        user_satisfaction_score: 4.2, // Would be calculated from feedback
        support_requests_during_onboarding:
          events?.filter((e) => e.event_type === 'support_requested').length || 0,
      };
    } catch (error) {
      console.error('Error getting onboarding metrics:', error);
      throw new Error('Failed to get onboarding metrics');
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(
    preferences: Partial<OnboardingProgress['user_preferences']>
  ): Promise<void> {
    try {
      const progress = await this.getOnboardingProgress();
      if (!progress) return;

      const { error } = await this.supabase
        .from('onboarding_progress')
        .update({
          user_preferences: {
            ...progress.user_preferences,
            ...preferences,
          },
        })
        .eq('id', progress.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw new Error('Failed to update onboarding preferences');
    }
  }

  /**
   * Get personalized recommendations
   */
  async getPersonalizedRecommendations(): Promise<
    Array<{
      type: 'feature' | 'tutorial' | 'resource' | 'integration';
      title: string;
      description: string;
      action_url: string;
      priority: 'high' | 'medium' | 'low';
    }>
  > {
    try {
      const progress = await this.getOnboardingProgress();
      if (!progress) return [];

      const recommendations = [];

      // Role-specific recommendations
      if (progress.user_preferences.role_specific_guidance) {
        recommendations.push({
          type: 'feature',
          title: 'Öğrenci Takip Sistemi',
          description: 'Öğrencilerinizin performansını detaylı şekilde izleyin',
          action_url: '/dashboard/students',
          priority: 'high',
        });
      }

      // Advanced features for interested users
      if (progress.user_preferences.advanced_features_interest) {
        recommendations.push({
          type: 'feature',
          title: 'Gelişmiş Analitik',
          description: 'Sınıf performansını ve trendleri analiz edin',
          action_url: '/dashboard/analytics',
          priority: 'medium',
        });
      }

      // Integration recommendations
      if (!progress.completed_steps.includes('integration_setup')) {
        recommendations.push({
          type: 'integration',
          title: 'Google Classroom Entegrasyonu',
          description: 'Mevcut Google Classroom derslerinizi senkronize edin',
          action_url: '/dashboard/integrations',
          priority: 'medium',
        });
      }

      // Tutorial recommendations for incomplete steps
      const incompleteSteps = ['school_setup', 'user_profile', 'class_setup'].filter(
        (step) => !progress.completed_steps.includes(step as OnboardingStep)
      );

      incompleteSteps.forEach((step) => {
        recommendations.push({
          type: 'tutorial',
          title: `${step.replace('_', ' ')} Tamamlama`,
          description: `${step} adımını tamamlayarak sistemi tam olarak kurun`,
          action_url: `/onboarding?step=${step}`,
          priority: 'high',
        });
      });

      return recommendations;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }

  // Private helper methods

  private getOnboardingTemplate(userRole: string): OnboardingTemplate {
    const baseTemplate: OnboardingTemplate = {
      id: 'default_onboarding',
      name: 'Varsayılan Onboarding',
      description: 'İ-EP.APP için genel onboarding süreci',
      target_role: 'admin',
      estimated_total_time: 900, // 15 minutes
      success_criteria: [
        'Okul bilgileri tamamlandı',
        'Kullanıcı profili oluşturuldu',
        'En az bir sınıf kuruldu',
        'Temel ayarlar yapıldı',
      ],
      steps: [
        {
          id: 'welcome',
          title: 'Hoş Geldiniz',
          description: "İ-EP.APP'e hoş geldiniz! Sizi sisteme hızlıca alıştıralım.",
          estimated_time: 60,
          required: true,
          role_specific: ['admin', 'teacher', 'student', 'parent'],
          prerequisites: [],
          components: [
            {
              type: 'tutorial',
              config: {
                video_url: '/videos/welcome.mp4',
                slides: [
                  { title: 'İ-EP.APP Nedir?', content: 'Kapsamlı okul yönetim sistemi' },
                  {
                    title: 'Özellikler',
                    content: 'Not yönetimi, devamsızlık takibi, veli iletişimi',
                  },
                  { title: 'Başlayalım', content: 'İlk kurulum adımlarını birlikte yapalım' },
                ],
              },
            },
          ],
          validation: {
            required_fields: ['tutorial_completed'],
            validation_rules: {},
          },
        },
        {
          id: 'school_setup',
          title: 'Okul Kurulumu',
          description: 'Okul bilgilerinizi girin ve temel ayarları yapın.',
          estimated_time: 240,
          required: true,
          role_specific: ['admin'],
          prerequisites: ['welcome'],
          components: [
            {
              type: 'form',
              config: {
                fields: [
                  { name: 'school_name', type: 'text', required: true },
                  { name: 'school_type', type: 'select', options: ['İlkokul', 'Ortaokul', 'Lise'] },
                  { name: 'address', type: 'textarea', required: true },
                  { name: 'phone', type: 'tel', required: true },
                  { name: 'email', type: 'email', required: true },
                  { name: 'academic_year', type: 'select', required: true },
                  { name: 'timezone', type: 'select', default: 'Europe/Istanbul' },
                ],
              },
            },
          ],
          validation: {
            required_fields: ['school_name', 'school_type', 'address', 'phone', 'email'],
            validation_rules: {
              email: { format: 'email' },
              phone: { format: 'phone' },
            },
          },
        },
        {
          id: 'user_profile',
          title: 'Kullanıcı Profili',
          description: 'Kişisel bilgilerinizi tamamlayın ve hesap ayarlarını yapın.',
          estimated_time: 180,
          required: true,
          role_specific: ['admin', 'teacher', 'student', 'parent'],
          prerequisites: ['welcome'],
          components: [
            {
              type: 'form',
              config: {
                fields: [
                  { name: 'display_name', type: 'text', required: true },
                  { name: 'avatar', type: 'file', accept: 'image/*' },
                  { name: 'bio', type: 'textarea' },
                  {
                    name: 'notifications',
                    type: 'checkbox-group',
                    options: ['email', 'sms', 'push'],
                  },
                  { name: 'language', type: 'select', options: ['tr', 'en'], default: 'tr' },
                ],
              },
            },
          ],
          validation: {
            required_fields: ['display_name'],
            validation_rules: {},
          },
        },
        {
          id: 'class_setup',
          title: 'Sınıf Kurulumu',
          description: 'İlk sınıfınızı oluşturun ve öğrencileri ekleyin.',
          estimated_time: 300,
          required: false,
          role_specific: ['admin', 'teacher'],
          prerequisites: ['school_setup'],
          components: [
            {
              type: 'form',
              config: {
                fields: [
                  { name: 'class_name', type: 'text', required: true },
                  { name: 'grade_level', type: 'select', required: true },
                  { name: 'subject', type: 'select', required: true },
                  { name: 'student_capacity', type: 'number', default: 30 },
                ],
              },
            },
            {
              type: 'tutorial',
              config: {
                title: 'Öğrenci Ekleme',
                steps: [
                  'Öğrenci listesini hazırlayın',
                  'Toplu öğrenci ekleme özelliğini kullanın',
                  'Öğrenci davetlerini gönderin',
                ],
              },
            },
          ],
          validation: {
            required_fields: ['class_name', 'grade_level', 'subject'],
            validation_rules: {},
          },
        },
        {
          id: 'integration_setup',
          title: 'Entegrasyon Kurulumu',
          description: 'Mevcut sistemlerinizi İ-EP.APP ile entegre edin.',
          estimated_time: 120,
          required: false,
          role_specific: ['admin', 'teacher'],
          prerequisites: ['class_setup'],
          components: [
            {
              type: 'checklist',
              config: {
                items: [
                  { id: 'google_classroom', label: 'Google Classroom', optional: true },
                  { id: 'microsoft_teams', label: 'Microsoft Teams', optional: true },
                  { id: 'email_notifications', label: 'E-posta Bildirimleri', optional: false },
                ],
              },
            },
          ],
          validation: {
            required_fields: [],
            validation_rules: {},
          },
        },
        {
          id: 'completion',
          title: 'Tamamlandı',
          description:
            "Onboarding süreci tamamlandı! Artık İ-EP.APP'i kullanmaya başlayabilirsiniz.",
          estimated_time: 60,
          required: true,
          role_specific: ['admin', 'teacher', 'student', 'parent'],
          prerequisites: ['user_profile'],
          components: [
            {
              type: 'demo',
              config: {
                features: [
                  { name: 'Dashboard', description: 'Ana kontrol paneli' },
                  { name: 'Assignments', description: 'Ödev yönetimi' },
                  { name: 'Grades', description: 'Not takibi' },
                  { name: 'Communication', description: 'Veli iletişimi' },
                ],
              },
            },
          ],
          validation: {
            required_fields: ['completion_acknowledged'],
            validation_rules: {},
          },
        },
      ],
    };

    return baseTemplate;
  }

  private getNextStep(
    completedSteps: OnboardingStep[],
    template: OnboardingTemplate
  ): OnboardingStep {
    const orderedSteps: OnboardingStep[] = [
      'welcome',
      'school_setup',
      'user_profile',
      'class_setup',
      'integration_setup',
      'completion',
    ];

    for (const step of orderedSteps) {
      if (!completedSteps.includes(step)) {
        return step;
      }
    }

    return 'completion';
  }

  private validateStepData(
    stepConfig: OnboardingStepConfig,
    stepData: Record<string, any>
  ): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check required fields
    for (const field of stepConfig.validation.required_fields) {
      if (!stepData[field]) {
        errors.push(`${field} is required`);
      }
    }

    // Apply validation rules
    Object.entries(stepConfig.validation.validation_rules).forEach(([field, rules]) => {
      if (stepData[field] && rules) {
        // Add specific validation logic here
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private async handleOnboardingCompletion(progress: OnboardingProgress): Promise<void> {
    try {
      // Award completion badge
      await this.supabase.from('user_achievements').insert({
        user_id: this.userId,
        tenant_id: this.tenantId,
        achievement_type: 'onboarding_complete',
        earned_at: new Date().toISOString(),
        metadata: {
          completion_time: progress.actual_completion_time,
          steps_completed: progress.completed_steps.length,
        },
      });

      // Send completion notification
      await this.recordOnboardingEvent('completed', 'completion', {
        completion_time: progress.actual_completion_time,
        total_steps: progress.completed_steps.length,
      });

      // Update user onboarding status
      await this.supabase
        .from('users')
        .update({
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq('id', this.userId);
    } catch (error) {
      console.error('Error handling onboarding completion:', error);
    }
  }

  private async recordOnboardingEvent(
    eventType: string,
    step: OnboardingStep,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    try {
      await this.supabase.from('onboarding_events').insert({
        user_id: this.userId,
        tenant_id: this.tenantId,
        event_type: eventType,
        step,
        metadata,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error recording onboarding event:', error);
    }
  }
}

// Factory function
export function createOnboardingFlow(tenantId: string, userId: string): OnboardingFlowManager {
  return new OnboardingFlowManager(tenantId, userId);
}

// Utility functions
export function calculateOnboardingProgress(
  completed: OnboardingStep[],
  total: number = 6
): number {
  return Math.round((completed.length / total) * 100);
}

export function getStepTitle(step: OnboardingStep): string {
  const titles: Record<OnboardingStep, string> = {
    welcome: 'Hoş Geldiniz',
    school_setup: 'Okul Kurulumu',
    user_profile: 'Kullanıcı Profili',
    class_setup: 'Sınıf Kurulumu',
    integration_setup: 'Entegrasyon Kurulumu',
    completion: 'Tamamlandı',
  };
  return titles[step] || step;
}

export function getStepIcon(step: OnboardingStep): string {
  const icons: Record<OnboardingStep, string> = {
    welcome: '👋',
    school_setup: '🏫',
    user_profile: '👤',
    class_setup: '📚',
    integration_setup: '🔗',
    completion: '✅',
  };
  return icons[step] || '📋';
}

export function estimateTimeRemaining(
  currentStep: OnboardingStep,
  template: OnboardingTemplate
): number {
  const currentIndex = template.steps.findIndex((s) => s.id === currentStep);
  if (currentIndex === -1) return 0;

  return template.steps.slice(currentIndex).reduce((total, step) => total + step.estimated_time, 0);
}
