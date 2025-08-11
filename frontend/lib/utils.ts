import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility functions for common operations

import type { ProductionItem } from '../types/production';

// Helper function to get operators as array
export const getOperatorsArray = (operators: string | string[]): string[] => {
  if (Array.isArray(operators)) {
    return operators;
  }
  return operators ? operators.split(', ').filter(op => op.trim()) : [];
};

// Helper function to get operators as string
export const getOperatorsString = (operators: string | string[]): string => {
  if (Array.isArray(operators)) {
    return operators.join(', ');
  }
  return operators || '';
};

// Helper function to check if item is draft
export const isDraftItem = (item: ProductionItem): boolean => {
  return item.is_draft === true || item.isDraft === true || item.status === 'draft';
};

// Helper function to check if item is special
export const isSpecialItem = (item: ProductionItem): boolean => {
  return item.is_special === true || item.is_special === 1 || item.is_special_job === 1 || item.workflow_status_id === 10;
};

// Helper function to get machine code
export const getMachineCode = (item: ProductionItem): string | undefined => {
  return item.machine_code || item.machine_id;
};

// Helper function to normalize string
export const normalizeString = (str: string): string => {
  return str.trim().toLowerCase().replace(/\s+/g, '');
};

// Helper function to check if time is valid
export const isValidTime = (time: string): boolean => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

// Helper function to compare times
export const isTimeAfter = (time1: string, time2: string): boolean => {
  const [hours1, minutes1] = time1.split(':').map(Number);
  const [hours2, minutes2] = time2.split(':').map(Number);
  
  const totalMinutes1 = hours1 * 60 + minutes1;
  const totalMinutes2 = hours2 * 60 + minutes2;
  
  return totalMinutes1 > totalMinutes2;
};

// Helper function to format duration
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}ชม. ${minutes}นาที`;
  }
  return `${minutes}นาที`;
};

// Helper function to debounce
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Helper function to throttle
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastExecuted = 0;
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastExecuted > delay) {
      func(...args);
      lastExecuted = now;
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecuted = Date.now();
      }, delay - (now - lastExecuted));
    }
  };
};
