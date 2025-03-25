import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return '--';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '--';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue);
}

export function formatPercentage(value: number | null | undefined, decimals = 2): string {
  if (value === null || value === undefined) return '--';
  
  if (isNaN(value)) return '--';
  
  return `${value.toFixed(decimals)}%`;
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '--';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'MMM d, yyyy');
  } catch (e) {
    return '--';
  }
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '--';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'MMM d, yyyy h:mm a');
  } catch (e) {
    return '--';
  }
}

export function formatDateForInput(date: Date | string | null | undefined): string {
  if (!date) return new Date().toISOString().slice(0, 16);
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) {
      console.error('Invalid date provided to formatDateForInput:', date);
      return new Date().toISOString().slice(0, 16);
    }
    return dateObj.toISOString().slice(0, 16);
  } catch (error) {
    console.error('Error formatting date for input:', error);
    return new Date().toISOString().slice(0, 16);
  }
}

export function formatDateForAPI(date: Date | string | null | undefined): string {
  if (!date) return new Date().toISOString();
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) {
      console.error('Invalid date provided to formatDateForAPI:', date);
      return new Date().toISOString();
    }
    return dateObj.toISOString();
  } catch (error) {
    console.error('Error formatting date for API:', error);
    return new Date().toISOString();
  }
}

export function calculatePnL(
  entryPrice: number,
  exitPrice: number,
  quantity: number,
  direction: string,
  fees: number = 0
): number {
  let pnl: number;
  
  try {
    if (direction === 'long') {
      pnl = (exitPrice - entryPrice) * quantity;
    } else {
      pnl = (entryPrice - exitPrice) * quantity;
    }
    
    // Subtract fees
    pnl -= fees;
    
    return pnl;
  } catch (error) {
    console.error('Error calculating PnL:', error);
    return 0;
  }
}

export function generateDateRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
}

export function getProgressColor(percentage: number): string {
  if (percentage >= 70) return 'bg-emerald-500';
  if (percentage >= 40) return 'bg-amber-500';
  return 'bg-red-500';
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}
