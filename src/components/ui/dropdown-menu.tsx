import React from 'react';
import { cn } from '@/lib/utils';

interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export function DropdownMenu({ trigger, children, align = 'left', className }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <div
        onClick={() => setOpen(!open)}
        className="cursor-pointer"
      >
        {trigger}
      </div>
      {open && (
        <div 
          className={cn(
            "absolute z-10 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5",
            align === 'right' ? 'right-0' : 'left-0',
            className
          )}
        >
          <div className="py-1">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

export function DropdownMenuTrigger({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("cursor-pointer", className)} {...props}>
      {children}
    </div>
  );
}

export function DropdownMenuContent({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn(
        "py-1 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({ children, className, onClick, ...props }: React.HTMLAttributes<HTMLDivElement> & { onClick?: () => void }) {
  return (
    <div 
      className={cn(
        "px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer",
        className
      )} 
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

export function DropdownMenuSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn("h-px my-1 bg-gray-200", className)}
      {...props}
    />
  );
}

export function DropdownMenuGroup({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
}

export function DropdownMenuLabel({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn("px-4 py-2 text-xs font-semibold text-gray-500 uppercase", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function DropdownMenuRadioGroup({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
}

export function DropdownMenuRadioItem({
  children,
  className,
  checked,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { checked?: boolean }) {
  return (
    <div 
      className={cn(
        "px-4 py-2 text-sm flex items-center cursor-pointer",
        checked ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
        className
      )} 
      {...props}
    >
      {checked && (
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {children}
    </div>
  );
}

export function DropdownMenuCheckboxItem({
  children,
  className,
  checked,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { checked?: boolean }) {
  return (
    <div 
      className={cn(
        "px-4 py-2 text-sm flex items-center cursor-pointer",
        checked ? "text-blue-600" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
        className
      )} 
      {...props}
    >
      <div className={cn(
        "mr-2 h-4 w-4 border rounded flex items-center justify-center",
        checked ? "bg-blue-600 border-blue-600" : "border-gray-300"
      )}>
        {checked && (
          <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      {children}
    </div>
  );
}

export function DropdownMenuShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span 
      className={cn("ml-auto text-xs text-gray-500", className)}
      {...props}
    />
  );
} 