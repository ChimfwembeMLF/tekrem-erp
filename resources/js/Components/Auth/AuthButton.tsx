import React, { PropsWithChildren } from 'react';
import { Button, ButtonProps } from '@/Components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface AuthButtonProps extends ButtonProps {
  isLoading?: boolean;
  loadingText?: string;
  type?: string;
  className?: string;
  disabled?: boolean;
}

export default function AuthButton({
  children,
  isLoading,
  loadingText = 'Please wait',
  className,
  disabled,
  type,
  ...props
}: PropsWithChildren<AuthButtonProps>) {
  // Map 'type' to Button 'variant' for styling
  let variant: string | undefined;
  switch (type) {
    case 'primary':
      variant = 'default';
      break;
    case 'secondary':
      variant = 'secondary';
      break;
    case 'danger':
      variant = 'destructive';
      break;
    case 'outline':
      variant = 'outline';
      break;
    case 'ghost':
      variant = 'ghost';
      break;
    case 'link':
      variant = 'link';
      break;
    default:
      variant = 'default';
  }
  return (
    <Button
      className={cn("w-full", className)}
      disabled={isLoading || disabled}
      variant={variant}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
