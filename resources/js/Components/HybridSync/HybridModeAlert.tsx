import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/Components/ui/alert';
import { Zap, Info } from 'lucide-react';

interface HybridModeAlertProps {
  variant?: 'info' | 'warning';
  title?: string;
  message?: string;
  showIcon?: boolean;
}

export default function HybridModeAlert({ 
  variant = 'info',
  title = 'Hybrid Mode Active',
  message = 'This project uses both Milestones and Agile Boards. Tasks and Cards can be linked for synchronized tracking.',
  showIcon = true 
}: HybridModeAlertProps) {
  return (
    <Alert className={variant === 'info' ? 'bg-purple-50 border-purple-200' : 'bg-yellow-50 border-yellow-200'}>
      {showIcon && (
        variant === 'info' 
          ? <Zap className="h-5 w-5 text-purple-600" />
          : <Info className="h-5 w-5 text-yellow-600" />
      )}
      <AlertTitle className={variant === 'info' ? 'text-purple-900' : 'text-yellow-900'}>
        {title}
      </AlertTitle>
      <AlertDescription className={variant === 'info' ? 'text-purple-700' : 'text-yellow-700'}>
        {message}
      </AlertDescription>
    </Alert>
  );
}
