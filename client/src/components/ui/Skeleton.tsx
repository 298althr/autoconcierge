import React from 'react';
import { clsx } from 'clsx';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
    width?: number | string;
    height?: number | string;
}

export function Skeleton({ className, variant = 'rectangular', width, height }: SkeletonProps) {
    const defaultClasses = "animate-pulse bg-gray-200";

    let variantClasses = "";
    if (variant === 'circular') {
        variantClasses = "rounded-full";
    } else if (variant === 'rectangular') {
        variantClasses = "rounded-2xl";
    } else {
        variantClasses = "rounded-md";
    }

    const style = {
        width: width,
        height: height
    };

    return (
        <div style={style} className={clsx(defaultClasses, variantClasses, className)} />
    );
}
