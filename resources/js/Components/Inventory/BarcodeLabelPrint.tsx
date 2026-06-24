import React from 'react';
import { Button } from '@/Components/ui/button';
import { Printer } from 'lucide-react';
import BarcodeDisplay from '@/Components/Inventory/BarcodeDisplay';

interface Props {
  productName: string;
  sku: string;
  barcode: string;
  price?: string;
}

export default function BarcodeLabelPrint({ productName, sku, barcode, price }: Props) {
  const printLabel = () => {
    const printWindow = window.open('', '_blank', 'width=480,height=320');

    if (!printWindow) {
      return;
    }

    const priceLine = price ? `<p style="margin:4px 0;font-size:14px;">ZMW ${Number(price).toFixed(2)}</p>` : '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Label — ${productName}</title>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"><\/script>
          <style>
            body { font-family: system-ui, sans-serif; text-align: center; padding: 16px; }
            h1 { font-size: 16px; margin: 0 0 4px; }
            p { margin: 0; color: #555; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>${productName}</h1>
          <p>SKU: ${sku}</p>
          ${priceLine}
          <svg id="barcode"></svg>
          <script>
            JsBarcode('#barcode', ${JSON.stringify(barcode)}, {
              format: ${/^\d{13}$/.test(barcode) ? "'EAN13'" : "'CODE128'"},
              height: 60,
              displayValue: true,
              fontSize: 14,
              margin: 6
            });
            window.onload = function() { window.print(); };
          <\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-3">
      <BarcodeDisplay value={barcode} />
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-mono text-sm text-muted-foreground">{barcode}</p>
        <Button type="button" variant="outline" size="sm" onClick={printLabel}>
          <Printer className="mr-2 h-4 w-4" />
          Print label
        </Button>
      </div>
    </div>
  );
}
