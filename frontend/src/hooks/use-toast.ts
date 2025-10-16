// Import React for hooks and state management
import * as React from "react";

// Import toast component types
import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

// Maximum number of toasts to display simultaneously
const TOAST_LIMIT = 1;

// Delay before removing dismissed toast from state (in milliseconds)
const TOAST_REMOVE_DELAY = 1000000;

// Extended toast type with unique ID and optional content
type ToasterToast = ToastProps & {
  id: string; // Unique identifier for each toast
  title?: React.ReactNode; // Toast title content
  description?: React.ReactNode; // Toast description content
  action?: ToastActionElement; // Optional action element
};

// Action types for toast state management
const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

// Counter for generating unique toast IDs
let count = 0;

// Generate unique ID for toasts
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

// Type definitions for action types and actions
type ActionType = typeof actionTypes;

type Action =
  | {
      type: ActionType["ADD_TOAST"];
      toast: ToasterToast;
    }
  | {
      type: ActionType["UPDATE_TOAST"];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ActionType["DISMISS_TOAST"];
      toastId?: ToasterToast["id"];
    }
  | {
      type: ActionType["REMOVE_TOAST"];
      toastId?: ToasterToast["id"];
    };

// State interface for toast management
interface State {
  toasts: ToasterToast[];
}

// Map to store timeout IDs for toast removal
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

// Add toast to removal queue with delay
const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return; // Already queued for removal
  }

  // Set timeout to remove toast after delay
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

// Reducer function for managing toast state
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      // Add new toast to the beginning, limit total toasts
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case "UPDATE_TOAST":
      // Update existing toast by ID
      return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t)),
      };

    case "DISMISS_TOAST": {
      const { toastId } = action;

      // Queue dismissed toasts for removal (side effect)
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        // Dismiss all toasts if no specific ID provided
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
        });
      }

      // Mark toasts as closed (not open)
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t,
        ),
      };
    }
    case "REMOVE_TOAST":
      // Remove toast from state completely
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

// Array of state change listeners
const listeners: Array<(state: State) => void> = [];

// In-memory state for toast management
let memoryState: State = { toasts: [] };

// Dispatch function to update state and notify listeners
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

// Toast input type (without generated ID)
type Toast = Omit<ToasterToast, "id">;

// Main toast function to create and display toasts
function toast({ ...props }: Toast) {
  const id = genId(); // Generate unique ID

  // Function to update existing toast
  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    });

  // Function to dismiss current toast
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });

  // Dispatch action to add new toast
  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss(); // Auto-dismiss when closed
      },
    },
  });

  // Return toast control functions
  return {
    id: id,
    dismiss,
    update,
  };
}

// Custom hook for toast management
function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    // Subscribe to state changes
    listeners.push(setState);
    return () => {
      // Unsubscribe on cleanup
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  // Return state and toast functions
  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

// Export hook and toast function
export { useToast, toast };
