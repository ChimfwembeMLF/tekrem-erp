import React from 'react';
import { cn } from '@/lib/utils';
import BarcodeDisplay from '@/Components/Inventory/BarcodeDisplay';
import QrCodeDisplay from '@/Components/Codes/QrCodeDisplay';
import { BarcodeFormat, detectBarcodeFormat } from '@/lib/barcodeFormat';

interface Props {
  label: string;
  value: string;
  /** QR payload — defaults to `value`. Use a URL for scannable links. */
  qrValue?: string;
  showBarcode?: boolean;
  showQr?: boolean;
  barcodeFormat?: BarcodeFormat | 'auto';
  barcodeHeight?: number;
  qrSize?: number;
  layout?: 'row' | 'stack';
  className?: string;
  mono?: boolean;
}

export default function DocumentCodeStrip({
  label,
  value,
  qrValue,
  showBarcode = true,
  showQr = true,
  barcodeFormat = 'auto',
  barcodeHeight = 48,
  qrSize = 96,
  layout = 'row',
  className,
  mono = true,
}: Props) {
  if (!value) {
    return null;
  }

  const format =
    barcodeFormat === 'auto' ? detectBarcodeFormat(value) : barcodeFormat;

  return (
    <div
      className={cn(
        'rounded-lg border border-dashed border-border/80 bg-muted/20 p-3',
        layout === 'row' ? 'flex flex-wrap items-center justify-between gap-4' : 'flex flex-col items-center gap-3',
        className,
      )}
    >
      <div className={cn('min-w-0', layout === 'stack' && 'text-center')}>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className={cn('mt-0.5 text-sm font-semibold text-foreground', mono && 'font-mono')}>{value}</p>
      </div>

      <div className={cn('flex flex-wrap items-end gap-3', layout === 'stack' && 'justify-center')}>
        {showBarcode && (
          <BarcodeDisplay
            value={value}
            format={format}
            height={barcodeHeight}
            displayValue={false}
            className="shrink-0"
          />
        )}
        {showQr && (
          <QrCodeDisplay
            value={qrValue ?? value}
            size={qrSize}
            caption={qrValue && qrValue !== value ? 'Scan to open' : 'Scan code'}
          />
        )}
      </div>
    </div>
  );
}
