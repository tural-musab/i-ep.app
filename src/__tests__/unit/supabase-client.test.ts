import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

describe('Supabase Client', () => {
  const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
  });

  it('should create supabase client with correct parameters', () => {
    // Re-import to trigger client creation
    jest.isolateModules(() => {
      require('@/lib/supabase/client');
    });

    expect(mockCreateClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-anon-key'
    );
  });

  it('should handle missing environment variables', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    jest.isolateModules(() => {
      require('@/lib/supabase/client');
    });

    expect(mockCreateClient).toHaveBeenCalledWith('', '');
  });

  it('should export a valid supabase client instance', () => {
    expect(supabase).toBeDefined();
  });
});
