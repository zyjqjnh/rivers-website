"use client";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const AlertDialog = AlertDialogPrimitive.Root;
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
const AlertDialogPortal = AlertDialogPrimitive.Portal;
function AlertDialogOverlay({ className, ...props }) { return <AlertDialogPrimitive.Overlay className={cn("fixed inset-0 z-50 bg-black/70", className)} {...props} />; }
function AlertDialogContent({ className, ...props }) {
  return <AlertDialogPortal><AlertDialogOverlay /><AlertDialogPrimitive.Content className={cn("fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border bg-background p-6 shadow-lg", className)} {...props} /></AlertDialogPortal>;
}
function AlertDialogHeader({ className, ...props }) { return <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />; }
function AlertDialogFooter({ className, ...props }) {
  return <div className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end", className)} {...props} />;
}
function AlertDialogTitle({ className, ...props }) { return <AlertDialogPrimitive.Title className={cn("text-lg font-semibold", className)} {...props} />; }
function AlertDialogDescription({ className, ...props }) { return <AlertDialogPrimitive.Description className={cn("text-sm text-muted-foreground", className)} {...props} />; }
function AlertDialogAction({ className, ...props }) { return <AlertDialogPrimitive.Action className={cn(buttonVariants({ variant: "destructive" }), className)} {...props} />; }
function AlertDialogCancel({ className, ...props }) { return <AlertDialogPrimitive.Cancel className={cn(buttonVariants({ variant: "outline" }), className)} {...props} />; }
export { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel };
