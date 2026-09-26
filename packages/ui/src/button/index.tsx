import { cva, VariantProps } from 'class-variance-authority';
import React from 'react';
import { cn } from '../utils';

const classes = cva(
  'rounded text-white dark:text-white inline-flex items-center justify-center whitespace-nowrap font-medium transition',
  {
    variants: {
      variant: {
        primary: ['bg-blue-500'],
        ghost: ['bg-transparent hover:bg-neutral-200 hover:dark:bg-neutral-800'],
      },
      size: {
        sm: 'px-2 py-1.5 text-sm',
        md: 'h-10 px-4 py-2 text-base',
        lg: 'px-4 py-2',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'primary',
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof classes>;

// forwardRef so a Tooltip (or anything else that needs the DOM node) can wrap it.
export const NPWDButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, size, variant, className, ...props }, ref) => {
    return (
      <button ref={ref} {...props} className={cn(classes({ size, variant, className }))}>
        {children}
      </button>
    );
  },
);
NPWDButton.displayName = 'NPWDButton';
