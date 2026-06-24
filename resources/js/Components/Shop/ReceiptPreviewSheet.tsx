import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/Components/ui/sheet';
import { Button } from '@/Components/ui/button';
import { Loader2, Printer } from 'lucide-react';
import ReceiptForm, { ReceiptPayload } from '@/Components/Commerce/ReceiptForm';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  receipt: ReceiptPayload | null;
}

export default function ReceiptPreviewSheet({ open, onOpenChange, loading, receipt }: Props) {
  const printReceipt = () => {
    if (!receipt) {
      return;
    }
    window.open(route('shop.order.receipt', receipt.id), '_blank');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="z-[1100] flex w-full flex-col gap-0 p-0 sm:max-w-xl">
        <SheetHeader className="border-b px-4 py-4 text-left">
          <SheetTitle>Receipt preview</SheetTitle>
          <SheetDescription>
            {receipt ? receipt.receiptNumber : 'Loading receipt...'}
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto bg-slate-100 p-4">
            {loading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : receipt ? (
              <ReceiptForm receipt={receipt} compact />
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">Receipt unavailable.</p>
            )}
          </div>

          {receipt && (
            <div className="border-t bg-background px-4 py-4">
              <Button className="w-full" variant="outline" onClick={printReceipt}>
                <Printer className="mr-2 h-4 w-4" />
                Print / Save PDF
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
