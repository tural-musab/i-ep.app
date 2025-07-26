import { createHash, randomBytes } from 'crypto';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

/**
 * MFA Types supported by the system
 */
export enum MFAType {
  TOTP = 'totp',
  BACKUP_CODES = 'backup_codes',
  SMS = 'sms', // Future implementation
  EMAIL = 'email', // Future implementation
}

/**
 * MFA Factor interface
 */
export interface MFAFactor {
  id: string;
  userId: string;
  type: MFAType;
  secret?: string;
  backupCodes?: string[];
  isEnabled: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt?: Date;
}

/**
 * MFA Setup Response
 */
export interface MFASetupResponse {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

/**
 * MFA Manager for handling all MFA operations
 */
export class MFAManager {
  private static readonly APP_NAME = 'i-EP.APP';
  private static readonly BACKUP_CODE_COUNT = 10;
  private static readonly BACKUP_CODE_LENGTH = 8;

  /**
   * Generate TOTP secret for a user
   */
  static generateTOTPSecret(): string {
    return authenticator.generateSecret();
  }

  /**
   * Generate QR code for TOTP setup
   */
  static async generateQRCode(
    userEmail: string,
    secret: string
  ): Promise<string> {
    const otpauth = authenticator.keyuri(
      userEmail,
      this.APP_NAME,
      secret
    );
    
    try {
      return await QRCode.toDataURL(otpauth);
    } catch (error) {
      console.error('QR code generation failed:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Generate backup codes
   */
  static generateBackupCodes(): string[] {
    const codes: string[] = [];
    
    for (let i = 0; i < this.BACKUP_CODE_COUNT; i++) {
      const code = randomBytes(this.BACKUP_CODE_LENGTH / 2)
        .toString('hex')
        .toUpperCase();
      codes.push(code);
    }
    
    return codes;
  }

  /**
   * Hash backup codes for storage
   */
  static hashBackupCodes(codes: string[]): string[] {
    return codes.map(code => 
      createHash('sha256').update(code).digest('hex')
    );
  }

  /**
   * Verify TOTP token
   */
  static verifyTOTP(token: string, secret: string): boolean {
    try {
      return authenticator.verify({
        token,
        secret,
        window: 1, // Allow 1 step before/after for clock skew
      });
    } catch (error) {
      console.error('TOTP verification error:', error);
      return false;
    }
  }

  /**
   * Verify backup code
   */
  static verifyBackupCode(
    inputCode: string,
    hashedCodes: string[]
  ): { valid: boolean; codeIndex: number } {
    const inputHash = createHash('sha256').update(inputCode).digest('hex');
    const codeIndex = hashedCodes.indexOf(inputHash);
    
    return {
      valid: codeIndex !== -1,
      codeIndex,
    };
  }

  /**
   * Setup MFA for a user
   */
  static async setupMFA(
    userId: string,
    userEmail: string,
    type: MFAType
  ): Promise<MFASetupResponse> {
    if (type !== MFAType.TOTP) {
      throw new Error(`MFA type ${type} not yet implemented`);
    }

    const secret = this.generateTOTPSecret();
    const qrCode = await this.generateQRCode(userEmail, secret);
    const backupCodes = this.generateBackupCodes();

    return {
      secret,
      qrCode,
      backupCodes,
    };
  }

  /**
   * Check if user has MFA enabled
   */
  static async checkMFARequired(
    userId: string,
    supabaseClient: any
  ): Promise<boolean> {
    const { data, error } = await supabaseClient
      .from('user_mfa_factors')
      .select('id')
      .eq('user_id', userId)
      .eq('is_enabled', true)
      .eq('is_verified', true)
      .single();

    if (error) {
      console.error('MFA check error:', error);
      return false;
    }

    return !!data;
  }

  /**
   * Get available MFA factors for a user
   */
  static async getUserMFAFactors(
    userId: string,
    supabaseClient: any
  ): Promise<MFAFactor[]> {
    const { data, error } = await supabaseClient
      .from('user_mfa_factors')
      .select('*')
      .eq('user_id', userId)
      .eq('is_enabled', true);

    if (error) {
      console.error('Get MFA factors error:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Save MFA factor to database
   */
  static async saveMFAFactor(
    userId: string,
    type: MFAType,
    secret: string,
    backupCodes: string[],
    supabaseClient: any
  ): Promise<void> {
    const hashedBackupCodes = this.hashBackupCodes(backupCodes);

    const { error } = await supabaseClient
      .from('user_mfa_factors')
      .insert({
        user_id: userId,
        type,
        secret, // In production, encrypt this
        backup_codes: hashedBackupCodes,
        is_enabled: false,
        is_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Save MFA factor error:', error);
      throw new Error('Failed to save MFA configuration');
    }
  }

  /**
   * Enable MFA factor after verification
   */
  static async enableMFAFactor(
    userId: string,
    factorId: string,
    supabaseClient: any
  ): Promise<void> {
    const { error } = await supabaseClient
      .from('user_mfa_factors')
      .update({
        is_enabled: true,
        is_verified: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', factorId)
      .eq('user_id', userId);

    if (error) {
      console.error('Enable MFA factor error:', error);
      throw new Error('Failed to enable MFA');
    }
  }

  /**
   * Disable MFA factor
   */
  static async disableMFAFactor(
    userId: string,
    factorId: string,
    supabaseClient: any
  ): Promise<void> {
    const { error } = await supabaseClient
      .from('user_mfa_factors')
      .update({
        is_enabled: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', factorId)
      .eq('user_id', userId);

    if (error) {
      console.error('Disable MFA factor error:', error);
      throw new Error('Failed to disable MFA');
    }
  }

  /**
   * Record MFA usage
   */
  static async recordMFAUsage(
    factorId: string,
    supabaseClient: any
  ): Promise<void> {
    const { error } = await supabaseClient
      .from('user_mfa_factors')
      .update({
        last_used_at: new Date().toISOString(),
      })
      .eq('id', factorId);

    if (error) {
      console.error('Record MFA usage error:', error);
    }
  }

  /**
   * Invalidate used backup code
   */
  static async invalidateBackupCode(
    userId: string,
    factorId: string,
    codeIndex: number,
    remainingCodes: string[],
    supabaseClient: any
  ): Promise<void> {
    const { error } = await supabaseClient
      .from('user_mfa_factors')
      .update({
        backup_codes: remainingCodes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', factorId)
      .eq('user_id', userId);

    if (error) {
      console.error('Invalidate backup code error:', error);
      throw new Error('Failed to invalidate backup code');
    }
  }
}

/**
 * MFA Middleware for protected routes
 */
export async function requireMFA(
  userId: string,
  sessionToken: string,
  supabaseClient: any
): Promise<{ 
  mfaRequired: boolean; 
  mfaVerified: boolean;
  factors?: MFAFactor[];
}> {
  // Check if user has MFA enabled
  const mfaRequired = await MFAManager.checkMFARequired(userId, supabaseClient);
  
  if (!mfaRequired) {
    return { mfaRequired: false, mfaVerified: true };
  }

  // Check if current session has MFA verification
  const { data: session } = await supabaseClient
    .from('user_sessions')
    .select('mfa_verified')
    .eq('user_id', userId)
    .eq('session_token', sessionToken)
    .single();

  if (session?.mfa_verified) {
    return { mfaRequired: true, mfaVerified: true };
  }

  // Get available factors
  const factors = await MFAManager.getUserMFAFactors(userId, supabaseClient);

  return {
    mfaRequired: true,
    mfaVerified: false,
    factors,
  };
}
