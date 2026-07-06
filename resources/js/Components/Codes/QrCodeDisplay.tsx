import React from 'react';
import { cn } from '@/lib/utils';
import useRoute from '@/Hooks/useRoute';

interface Props {
  value: string;
  size?: number;
  caption?: string;
  className?: string;
  alt?: string;
}

export default function QrCodeDisplay({ value, size = 120, caption, className, alt }: Props) {
  const route = useRoute();

  if (!value) {
    return null;
  }

  const src = `${route('codes.qr')}?${new URLSearchParams({
    data: value,
    size: String(size),
  })}`;

  return (
    <div className={cn('inline-flex flex-col items-center', className)}>
      <div className="rounded-md border bg-white p-1.5">
        <img
          src={src}
          width={size}
          height={size}
          alt={alt ?? `QR code for ${value}`}
          className="block"
          loading="lazy"
        />
      </div>
      {caption && <p className="mt-1 max-w-[140px] text-center text-[10px] text-muted-foreground">{caption}</p>}
    </div>
  );
}
