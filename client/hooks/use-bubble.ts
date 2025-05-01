import { showNotification } from "@/components/ui/notification-bubble"

type BubbleProps = {
  title?: string
  description: string
  variant?: "default" | "destructive" | "success"
  duration?: number
}

// Add default values to ensure toasts always have proper styling
function showBubble(props: BubbleProps) {
  // Set defaults if not provided
  const enhancedProps = {
    ...props,
    title: props.title || (props.variant === "destructive" ? "Error" : 
                         props.variant === "success" ? "Success" : "Notification"),
    variant: props.variant || "default",
    duration: props.duration || (props.variant === "destructive" ? 5000 : 3000)
  };
  
  return showNotification(enhancedProps)
}

export function useBubble() {
  return {
    toast: (props: BubbleProps) => showBubble(props)
  }
}

// For direct usage without the hook
export { showBubble as toast } 