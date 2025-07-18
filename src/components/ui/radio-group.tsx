'use client';

import { createContext, useContext, useState, useCallback, forwardRef, type JSX } from 'react';
import { cn } from '@/lib/utils';

type RadioGroupContextValue = {
  value?: string;
  onValueChange: (value: string) => void;
};

const RadioGroupContext = createContext<RadioGroupContextValue | undefined>(undefined);

const useRadioGroup = () => {
  const context = useContext(RadioGroupContext);
  if (!context) {
    throw new Error('useRadioGroup must be used within a RadioGroup');
  }
  return context;
};

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, defaultValue, onValueChange, ...props }, ref): JSX.Element => {
    const [localValue, setLocalValue] = useState(defaultValue || '');

    const currentValue = value !== undefined ? value : localValue;

    const handleValueChange = useCallback(
      (newValue: string) => {
        setLocalValue(newValue);
        onValueChange?.(newValue);
      },
      [onValueChange]
    );

    return (
      <RadioGroupContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
        <div ref={ref} className={cn('grid gap-2', className)} {...props} />
      </RadioGroupContext.Provider>
    );
  }
);
RadioGroup.displayName = 'RadioGroup';

interface RadioGroupItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const RadioGroupItem = forwardRef<HTMLDivElement, RadioGroupItemProps>(
  ({ className, value, children, ...props }, ref): JSX.Element => {
    const { value: groupValue, onValueChange } = useRadioGroup();
    const checked = value === groupValue;

    return (
      <div
        ref={ref}
        className={cn('flex items-center space-x-2', className)}
        onClick={() => onValueChange(value)}
        {...props}
      >
        <div
          className={cn(
            'flex h-4 w-4 items-center justify-center rounded-full border',
            checked ? 'border-primary bg-white' : 'border-gray-300'
          )}
        >
          {checked && <div className="bg-primary h-2 w-2 rounded-full" />}
        </div>
        {children && <div>{children}</div>}
      </div>
    );
  }
);
RadioGroupItem.displayName = 'RadioGroupItem';

export { RadioGroup, RadioGroupItem };
