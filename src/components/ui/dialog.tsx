import type { ComponentProps } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export function DialogContent({ className, children, ...props }: ComponentProps<typeof DialogPrimitive.Content>) {
  return <DialogPrimitive.Portal><DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/35 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
    <DialogPrimitive.Content data-slot="dialog-content" className={cn('fixed left-1/2 top-1/2 z-50 grid max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-5 overflow-y-auto rounded-2xl border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95', className)} {...props}>
      {children}<DialogPrimitive.Close className="absolute right-3 top-3 inline-flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary focus-visible:outline-2 focus-visible:outline-primary"><X className="size-4" /><span className="sr-only">Close</span></DialogPrimitive.Close>
    </DialogPrimitive.Content></DialogPrimitive.Portal>;
}
export function DialogHeader({ className, ...props }: ComponentProps<'div'>) { return <div className={cn('flex flex-col gap-2 pr-6', className)} {...props} />; }
export function DialogTitle({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) { return <DialogPrimitive.Title className={cn('text-xl font-semibold tracking-tight', className)} {...props} />; }
export function DialogDescription({ className, ...props }: ComponentProps<typeof DialogPrimitive.Description>) { return <DialogPrimitive.Description className={cn('text-sm leading-relaxed text-muted-foreground', className)} {...props} />; }
