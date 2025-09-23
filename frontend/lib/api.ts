// API utility functions for better error handling and request management

import { config, getApiUrl, debugLog, debugError } from './config';
import type { 
  ApiResponse, 
  PaginatedResponse, 
  User, 
  Machine, 
  ProductionRoom, 
  ProductionItem, 
  DraftWorkPlan, 
  JobOption, 
  ProductionLog 
} from '../types/production';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  signal?: AbortSignal;
  timeout?: number;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Create fetch with timeout
const fetchWithTimeout = async (
  url: string,
  options: RequestOptions = {},
  timeout: number = config.api.timeout
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: options.signal || controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// Retry mechanism
const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  retries: number = config.api.retryAttempts
): Promise<T> => {
  try {
    return await requestFn();
  } catch (error) {
    if (retries > 0 && error instanceof ApiError && error.status >= 500) {
      debugLog(`Retrying request, ${retries} attempts left`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      return retryRequest(requestFn, retries - 1);
    }
    throw error;
  }
};

// Generic API request function
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> => {
  const url = getApiUrl(endpoint);
  
  debugLog(`API Request: ${options.method || 'GET'} ${url}`);

  return retryRequest(async () => {
    const response = await fetchWithTimeout(url, options);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: 'Unknown error' };
      }
      
      throw new ApiError(
        errorData.message || `HTTP ${response.status}`,
        response.status,
        response.statusText,
        errorData
      );
    }

    const data = await response.json();
    debugLog(`API Response: ${url}`, data);
    
    return data;
  });
};

// Specific API functions
export const api = {
  // Users
  getUsers: () => apiRequest<User[]>('/api/users'),
  
  // Machines
  getMachines: () => apiRequest<Machine[]>('/api/machines'),
  
  // Production Rooms
  getProductionRooms: () => apiRequest<ProductionRoom[]>('/api/production-rooms'),
  
  // Work Plans
  getWorkPlans: (date?: string) => 
    apiRequest<ProductionItem[]>(`/api/work-plans${date ? `?date=${date}` : ''}`),
  
  createWorkPlan: (data: Partial<ProductionItem>) =>
    apiRequest<ProductionItem>('/api/work-plans', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateWorkPlan: (id: string, data: Partial<ProductionItem>) =>
    apiRequest<ProductionItem>(`/api/work-plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  deleteWorkPlan: (id: string) =>
    apiRequest<void>(`/api/work-plans/${id}`, {
      method: 'DELETE',
    }),
  
  // Drafts
  getDrafts: () => apiRequest<DraftWorkPlan[]>('/api/work-plans/drafts'),
  
  createDraft: (data: Partial<DraftWorkPlan>) =>
    apiRequest<DraftWorkPlan>('/api/work-plans/drafts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateDraft: (id: string, data: Partial<DraftWorkPlan>) =>
    apiRequest<DraftWorkPlan>(`/api/work-plans/drafts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  deleteDraft: (id: string) =>
    apiRequest<void>(`/api/work-plans/drafts/${id}`, {
      method: 'DELETE',
    }),
  
  syncDraftsToPlans: () =>
    apiRequest<void>('/api/work-plans/sync-drafts-to-plans', {
      method: 'POST',
    }),
  
  // Process Steps
  searchProcessSteps: (query: string) =>
    apiRequest<JobOption[]>(`/api/process-steps/search?query=${encodeURIComponent(query)}`),
  
  // Production Logs
  getProductionLogs: (params?: {
    production_date?: string;
    job_code?: string;
    status?: string;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, value.toString());
      });
    }
    return apiRequest<ProductionLog[]>(`/api/production-logs?${searchParams.toString()}`);
  },
  
  // Settings
  getSettings: () => apiRequest<any>('/api/settings'),
  
  updateSettings: (data: any) =>
    apiRequest<any>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Error handling utility
export const handleApiError = (error: unknown): string => {
  if (error instanceof ApiError) {
    debugError(`API Error: ${error.message}`, error);
    return error.message;
  }
  
  if (error instanceof Error) {
    debugError(`Unexpected Error: ${error.message}`, error);
    return error.message;
  }
  
  debugError('Unknown Error', error);
  return 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
};

// Abort controller utility
export const createAbortController = (): AbortController => {
  return new AbortController();
};

// Standardized Error Response Functions
export const createErrorResponse = (
  message: string,
  error?: unknown,
  statusCode: number = 500
) => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  debugError(`API Error [${statusCode}]: ${message}`, error);
  
  return {
    success: false,
    message,
    error: errorMessage,
    statusCode,
    timestamp: new Date().toISOString()
  };
};

export const createSuccessResponse = <T>(
  data: T,
  message: string = 'Operation successful'
) => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
};

// Standard HTTP Error Responses
export const createNotFoundResponse = (resource: string = 'Resource') => {
  return createErrorResponse(`${resource} not found`, null, 404);
};

export const createValidationErrorResponse = (message: string) => {
  return createErrorResponse(`Validation Error: ${message}`, null, 400);
};

export const createUnauthorizedResponse = () => {
  return createErrorResponse('Unauthorized access', null, 401);
};

export const createForbiddenResponse = () => {
  return createErrorResponse('Forbidden access', null, 403);
};

export const createInternalServerErrorResponse = (error?: unknown) => {
  return createErrorResponse('Internal Server Error', error, 500);
};

// Export types for convenience
export type { ApiError };
