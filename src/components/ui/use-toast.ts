import React from 'react';

type ToastProps = {
  title?: string;
  description?: string;
  duration?: number;
  variant?: 'default' | 'destructive';
  action?: React.ReactNode;
};

// Basit bir toast fonksiyonu
export function useToast() {
  const toast = (props: ToastProps) => {
    console.log('Toast:', props);
    // Basit bir alert gösterimi için
    if (typeof window !== 'undefined') {
      console.log(`Toast: ${props.title || ''} ${props.description || ''}`);
    }
  };

  return {
    toast
  };
} 