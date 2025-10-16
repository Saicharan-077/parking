// Import utility functions for conditional class names
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility function to merge and conditionally apply CSS classes
// Combines clsx for conditional classes with tailwind-merge for proper Tailwind CSS class merging
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
