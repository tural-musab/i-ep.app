export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  planType: 'free' | 'standard' | 'premium';
  createdAt: Date;
  settings: TenantSettings;
  isActive: boolean;
}

export interface TenantSettings {
  allowParentRegistration: boolean;
  allowTeacherRegistration: boolean;
  languagePreference: 'tr' | 'en';
  timeZone: string;
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  favIconUrl?: string;
  customCss?: string;
  smsProvider?: 'netgsm' | 'twilio' | 'none';
  emailProvider?: 'smtp' | 'aws' | 'none';
  notificationSettings?: {
    enableSmsNotifications: boolean;
    enableEmailNotifications: boolean;
    enablePushNotifications: boolean;
  };
}
