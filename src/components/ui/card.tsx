import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
export function Card({ className, ...props }: ComponentProps<'div'>) { return <div data-slot="card" className={cn('rounded-2xl border bg-card text-card-foreground shadow-sm shadow-primary/[0.025]', className)} {...props} />; }
export function CardHeader({ className, ...props }: ComponentProps<'div'>) { return <div data-slot="card-header" className={cn('flex flex-col gap-2 p-5', className)} {...props} />; }
export function CardTitle({ className, ...props }: ComponentProps<'div'>) { return <div data-slot="card-title" className={cn('font-semibold leading-none', className)} {...props} />; }
export function CardDescription({ className, ...props }: ComponentProps<'div'>) { return <div data-slot="card-description" className={cn('text-sm text-muted-foreground', className)} {...props} />; }
export function CardContent({ className, ...props }: ComponentProps<'div'>) { return <div data-slot="card-content" className={cn('px-5 pb-5', className)} {...props} />; }
