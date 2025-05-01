import { useRouter } from "next/navigation"

/**
 * Safe Redirect Utility
 * 
 * This utility helps prevent redirection loops and ensures toasts
 * are shown before redirecting.
 * 
 * @param path The path to redirect to
 * @param delay Optional delay before redirecting in ms (default: 100ms)
 * @returns A function that safely redirects once
 */
export function safeRedirect(router: ReturnType<typeof useRouter>, path: string, delay: number = 100) {
  let hasRedirected = false;
  
  return () => {
    if (hasRedirected) return;
    
    hasRedirected = true;
    
    // Add a small delay to ensure any UI updates (like toasts) 
    // have time to render before navigation
    setTimeout(() => {
      router.push(path);
    }, delay);
  };
}

/**
 * Checks if the current path includes the given path segment
 * Useful for preventing redirection loops
 * 
 * @param pathSegment The path segment to check for
 * @returns True if the current path includes the segment
 */
export function isCurrentPath(pathSegment: string): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.location.pathname.includes(pathSegment);
} 