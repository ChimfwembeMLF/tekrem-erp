import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { cn } from '@/lib/utils';
import { detectBarcodeFormat, type BarcodeFormat } from '@/lib/barcodeFormat';

interface Props {
  value: string;
  format?: BarcodeFormat | 'auto';
  height?: number;
  displayValue?: boolean;
  className?: string;
}

export default function BarcodeDisplay({
  value,
  format = 'auto',
  height = 56,
  displayValue = true,
  className,
}: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !value) {
      return;
    }

    const barcodeFormat = format === 'auto' ? detectBarcodeFormat(value) : format;

    try {
      JsBarcode(svgRef.current, value, {
        format: barcodeFormat,
        height,
        displayValue,
        fontSize: 14,
        margin: 8,
        background: '#ffffff',
        lineColor: '#111827',
      });
    } catch {
      JsBarcode(svgRef.current, value, {
        format: 'CODE128',
        height,
        displayValue,
        fontSize: 14,
        margin: 8,
      });
    }
  }, [value, format, height, displayValue]);

  if (!value) {
    return null;
  }

  return (
    <div className={cn('inline-flex rounded-md border bg-white p-2', className)}>
      <svg ref={svgRef} role="img" aria-label={`Barcode ${value}`} />
    </div>
  );
}
