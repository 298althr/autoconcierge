import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for merging tailwind classes safely
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function Button({
    className,
    variant = 'primary',
    size = 'md',
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
    const variants = {
        primary: 'bg-burgundy text-white hover:bg-burgundy-light shadow-md hover:shadow-lg',
        secondary: 'bg-onyx text-white hover:bg-onyx-light shadow-md',
        outline: 'border-2 border-burgundy text-burgundy hover:bg-burgundy hover:text-white',
        ghost: 'bg-transparent text-onyx-light hover:bg-gray-100 hover:text-onyx',
        danger: 'bg-red-600 text-white hover:bg-red-700',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-5 py-2.5 text-sm',
        lg: 'px-8 py-3.5 text-base',
        xl: 'px-10 py-4 text-lg',
    };

    return (
        <button
            className={cn(
                'inline-flex items-center justify-center rounded-xl font-bold transition-all disabled:opacity-50 active:scale-95',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        />
    );
}

export function Badge({
    className,
    variant = 'default',
    ...props
}: React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'burgundy';
}) {
    const variants = {
        default: 'bg-gray-100 text-gray-700',
        success: 'bg-emerald/10 text-emerald border border-emerald/20',
        warning: 'bg-amber-100 text-amber-700',
        danger: 'bg-red-100 text-red-700',
        info: 'bg-blue-100 text-blue-700',
        burgundy: 'bg-burgundy/10 text-burgundy border border-burgundy/20',
    };

    return (
        <div
            className={cn(
                'px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-block',
                variants[variant],
                className
            )}
            {...props}
        />
    );
}
