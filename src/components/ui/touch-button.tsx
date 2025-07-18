import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const touchButtonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-12 px-4 py-2', // Enhanced from h-9 to h-12 for better touch
        sm: 'h-10 rounded-md px-3 text-xs', // Enhanced from h-8 to h-10
        lg: 'h-14 rounded-md px-8', // Enhanced from h-10 to h-14
        icon: 'h-12 w-12', // Enhanced from h-9 w-9 to h-12 w-12
      },
      touchTarget: {
        minimum: 'min-h-[44px] min-w-[44px]', // iOS minimum touch target
        comfortable: 'min-h-[48px] min-w-[48px]', // Android minimum touch target
        spacious: 'min-h-[56px] min-w-[56px]', // Spacious touch target
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      touchTarget: 'comfortable',
    },
  }
);

export interface TouchButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof touchButtonVariants> {
  asChild?: boolean;
}

const TouchButton = React.forwardRef<HTMLButtonElement, TouchButtonProps>(
  ({ className, variant, size, touchTarget, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(touchButtonVariants({ variant, size, touchTarget, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
TouchButton.displayName = 'TouchButton';

export { TouchButton, touchButtonVariants };
