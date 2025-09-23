// Production Types for better type safety

export interface User {
  id: number;
  id_code: string;
  name: string;
}

export interface Machine {
  id: number;
  machine_code: string;
  machine_name: string;
}

export interface ProductionRoom {
  id: number;
  room_code: string;
  room_name: string;
}

export interface ProductionItem {
  id: string;
  production_date: string;
  job_code: string;
  job_name: string;
  start_time?: string;
  end_time?: string;
  operators: string | string[]; // รองรับทั้ง string และ array
  machine_code?: string;
  machine_id?: string; // รองรับ property เก่า
  room_code?: string;
  production_room?: string; // รองรับ property เก่า
  note?: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  work_plan_id?: string;
  is_draft?: boolean;
  isDraft?: boolean; // รองรับ property เก่า
  is_special?: boolean | number; // รองรับ special jobs (boolean หรือ number)
  is_special_job?: number; // รองรับ special job number
  workflow_status_id?: number; // รองรับ workflow status ID
}

export interface ProductionLog {
  id: string;
  production_date: string;
  job_code: string;
  job_name: string;
  operator_name: string;
  machine_code?: string;
  room_code?: string;
  input_quantity?: number;
  output_quantity?: number;
  start_time?: string;
  end_time?: string;
  duration_seconds?: number;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface DraftWorkPlan {
  id: string;
  production_date: string;
  job_code: string;
  job_name: string;
  start_time?: string;
  end_time?: string;
  operators: string[];
  machine_code?: string;
  room_code?: string;
  note?: string;
  created_at: string;
  updated_at: string;
}

export interface JobOption {
  job_code: string;
  job_name: string;
  category?: string;
  iconUrl?: string;
}

export interface TimeSlot {
  start: string;
  end: string;
  label: string;
}

export interface DailySummary {
  date: string;
  totalJobs: number;
  completedJobs: number;
  draftJobs: number;
  totalOperators: number;
  totalMachines: number;
}

export interface WeeklySummary {
  weekStart: string;
  weekEnd: string;
  totalJobs: number;
  completedJobs: number;
  draftJobs: number;
  dailySummaries: DailySummary[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  message?: string;
}

// Standardized API Response Types
export interface ApiErrorResponse {
  success: false;
  message: string;
  error: string;
  statusCode: number;
  timestamp: string;
}

export interface ApiSuccessResponse<T = any> {
  success: true;
  message: string;
  data: T;
  timestamp: string;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;