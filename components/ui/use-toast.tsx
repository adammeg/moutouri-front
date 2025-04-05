import * as React from "react"

import type {
    ToastActionElement,
    ToastProps,
} from "./toast"
import { toast } from "sonner";
import { useToast } from "../../hooks/use-toast";

// Add at top of file
console.log('Loading components/ui/use-toast.tsx');
const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 5000

export { useToast, toast } 