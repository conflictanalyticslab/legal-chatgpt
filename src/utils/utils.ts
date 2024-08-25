import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
/**
 * Returns the string message of an error
 *
 * @param error
 * @returns
 */
export function errorResponse(error: unknown) {
  console.log(error);
  // Safely convert the error to a string for the ApiResponse
  return error instanceof Error ? error.message : String(error);
}


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


/**
 * Returns a basic formatted message for api errors
 *
 * @param error
 * @returns
 */
export function apiErrorResponse(error: unknown) {
  console.log(error)
  // Safely convert the error to a string for the ApiResponse
  const errorMessage = error instanceof Error ? error.message : String(error);

  return {
    success: false,
    error: errorMessage,
    data: null,
  };
}

export type ApiResponse<T> = {
  success: boolean;
  error?: string | null;
  data: T | null 
};



