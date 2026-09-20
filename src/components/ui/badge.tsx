import type { ComponentProps } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
const variants = cva('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium leading-none', { variants: { variant: { default: 'bg-secondary text-secondary-foreground', outline: 'border text-muted-foreground', warning: 'bg-amber-50 text-amber-800' } }, defaultVariants: { variant: 'default' } });
export function Badge({ className, variant, ...props }: ComponentProps<'span'> & VariantProps<typeof variants>) { return <span data-slot="badge" className={cn(variants({ variant }), className)} {...props} />; }
