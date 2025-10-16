// Import React for hooks
import * as React from "react";

// Mobile breakpoint width in pixels (matches Tailwind's md breakpoint)
const MOBILE_BREAKPOINT = 768;

// Custom hook to detect if the current viewport is mobile-sized
export function useIsMobile() {
  // State to track mobile status, undefined initially to avoid hydration mismatch
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    // Create media query for mobile breakpoint
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    // Handler function to update mobile state
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Add event listener for media query changes
    mql.addEventListener("change", onChange);

    // Set initial mobile state
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    // Cleanup: remove event listener on unmount
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // Return boolean value (converts undefined to false initially)
  return !!isMobile;
}
