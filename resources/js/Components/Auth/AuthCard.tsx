import React, { PropsWithChildren } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import ApplicationLogo from '@/Components/ApplicationLogo';
import GoogleAuthButton from './GoogleAuthButton';

interface AuthCardProps {
  title?: string;
  description?: string;
  footer?: React.ReactNode;
}

export default function AuthCard({
  children,
  title,
  description,
  footer,
}: PropsWithChildren<AuthCardProps>) {
  return (
    <Card className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-white dark:bg-gray-800">
      <div className="mb-6">
        <ApplicationLogo />
      </div>

      <Card className="w-full sm:max-w-md bg-white dark:bg-gray-800 shadow-none border-none">
        {(title || description) && (
          <CardHeader>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription className='dark:text-gray-200'>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>
          {children}
          {/* <div style={{ margin: '24px 0', textAlign: 'center' }}>
            <GoogleAuthButton />
          </div> */}
        </CardContent>
        {footer && (
          <CardFooter className='dark:text-gray-800'>
            {footer}
          </CardFooter>
        )}
      </Card>
    </Card>
  );
}
