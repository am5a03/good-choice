import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
export function Input({ className, type, ...props }: ComponentProps<'input'>) {
  return <input data-slot="input" type={type} className={cn('flex h-11 w-full min-w-0 rounded-lg border border-input bg-white px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:opacity-50 file:border-0 file:bg-transparent file:font-medium', className)} {...props} />;
}
