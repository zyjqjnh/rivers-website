"use client";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
function DropdownMenuContent({ className, sideOffset = 4, ...props }) {
  return <DropdownMenuPrimitive.Portal><DropdownMenuPrimitive.Content sideOffset={sideOffset} className={cn("z-50 min-w-[10rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md", className)} {...props} /></DropdownMenuPrimitive.Portal>;
}
function DropdownMenuItem({ className, inset, ...props }) {
  return <DropdownMenuPrimitive.Item className={cn("relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none transition-colors focus:bg-accent/20 data-[disabled]:pointer-events-none data-[disabled]:opacity-50", inset && "pl-8", className)} {...props} />;
}
function DropdownMenuSeparator({ className, ...props }) { return <DropdownMenuPrimitive.Separator className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />; }
export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator };
