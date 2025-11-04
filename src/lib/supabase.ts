import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with security and performance configurations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // Recommended for web apps
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Client-Info': 'nextjs-app/1.0.0',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10, // Limit real-time events for performance
    },
  },
});

// Server-side Supabase client (for API routes)
export function createServerSupabaseClient() {
  return createClient(
    process.env.SUPABASE_URL || supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      db: {
        schema: 'public',
      },
    }
  );
}

// Database types (you can generate these with Supabase CLI)
export interface Database {
  public: {
    Tables: {
      // Define your table types here
      // Example:
      // users: {
      //   Row: { id: string; email: string; created_at: string; }
      //   Insert: { email: string; }
      //   Update: { email?: string; }
      // }
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Security utilities for Supabase operations
export class SupabaseSecurity {
  static async validateUserSession(sessionToken: string): Promise<boolean> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser(sessionToken);
      return !error && !!user;
    } catch {
      return false;
    }
  }

  static async getUserPermissions(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('user_permissions')
        .select('permission')
        .eq('user_id', userId);
      
      if (error) throw error;
      return data?.map(item => item.permission) || [];
    } catch {
      return [];
    }
  }

  static async hasPermission(userId: string, permission: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissions.includes(permission) || permissions.includes('admin');
  }

  static sanitizeQuery(input: string): string {
    // Basic SQL injection prevention
    return input
      .replace(/['"\\;]/g, '')
      .replace(/--/g, '')
      .replace(/\/\*/g, '')
      .replace(/\*\//g, '')
      .trim();
  }

  static validateRowAccess(userId: string, rowUserId: string): boolean {
    return userId === rowUserId;
  }
}

// Performance monitoring for Supabase operations
export class SupabasePerformance {
  private static operationTimes: Map<string, number[]> = new Map();

  static async trackOperation<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await fn();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.recordOperationTime(operation, duration);
      
      // Log slow operations
      if (duration > 1000) {
        console.warn(`Slow Supabase operation: ${operation} took ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.error(`Failed Supabase operation: ${operation} after ${duration.toFixed(2)}ms`, error);
      throw error;
    }
  }

  private static recordOperationTime(operation: string, duration: number): void {
    if (!this.operationTimes.has(operation)) {
      this.operationTimes.set(operation, []);
    }
    
    const times = this.operationTimes.get(operation)!;
    times.push(duration);
    
    // Keep only last 100 operations
    if (times.length > 100) {
      times.splice(0, times.length - 100);
    }
  }

  static getOperationStats(operation: string): {
    count: number;
    average: number;
    min: number;
    max: number;
  } | null {
    const times = this.operationTimes.get(operation);
    if (!times || times.length === 0) return null;
    
    return {
      count: times.length,
      average: times.reduce((a, b) => a + b, 0) / times.length,
      min: Math.min(...times),
      max: Math.max(...times),
    };
  }

  static getAllStats(): Record<string, ReturnType<typeof SupabasePerformance.getOperationStats>> {
    const stats: Record<string, ReturnType<typeof SupabasePerformance.getOperationStats>> = {};
    
    this.operationTimes.forEach((_, operation) => {
      stats[operation] = this.getOperationStats(operation);
    });
    
    return stats;
  }
}

// Utility functions for common Supabase operations
export const supabaseUtils = {
  async uploadFile(
    bucket: string,
    path: string,
    file: File,
    options: { cacheControl?: string; upsert?: boolean } = {}
  ) {
    return SupabasePerformance.trackOperation(`upload-${bucket}`, async () => {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: options.cacheControl || '3600',
          upsert: options.upsert || false,
        });
      
      if (error) throw error;
      return data;
    });
  },

  async getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  },

  async createRow<T>(
    table: string,
    data: Partial<T>,
    options: { onConflict?: string } = {}
  ) {
    return SupabasePerformance.trackOperation(`create-${table}`, async () => {
      let query = supabase.from(table).insert(data);
      
      if (options.onConflict) {
        query = (query as any).onConflict(options.onConflict);
      }
      
      const response = await query.select();
      const result = response.data;
      const error = response.error;
      
      if (error) throw error;
      return result;
    });
  },

  async getRow<T>(
    table: string,
    id: string,
    columns: string = '*'
  ) {
    return SupabasePerformance.trackOperation(`get-${table}`, async () => {
      const { data, error } = await supabase
        .from(table)
        .select(columns)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as T;
    });
  },

  async updateRow<T>(
    table: string,
    id: string,
    data: Partial<T>
  ) {
    return SupabasePerformance.trackOperation(`update-${table}`, async () => {
      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return result;
    });
  },

  async deleteRow(table: string, id: string) {
    return SupabasePerformance.trackOperation(`delete-${table}`, async () => {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    });
  }
};