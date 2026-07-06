import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Printer } from 'lucide-react';
import DocumentCodeStrip from '@/Components/Codes/DocumentCodeStrip';

interface ReceiptItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface ReceiptPayload {
  type: 'pos' | 'ecommerce';
  id: number;
  receiptNumber: string;
  pgn: string;
  date: string;
  currency: string;
  receivedFrom: string;
  amount: number;
  amountInWords: string;
  inRespectOf: string;
  payment: {
    cash: boolean;
    mobile_money: boolean;
    card: boolean;
    cheque: boolean;
    online: boolean;
  };
  paymentMethodLabel: string;
  cashier?: string | null;
  register?: string | null;
  items: ReceiptItem[];
  totals: {
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
  };
  company: {
    name: string;
    tagline: string;
    address: string;
    city?: string;
    country?: string;
    phone: string;
    phones: string[];
    email: string;
    website: string;
    logoUrl?: string;
  };
  verifyUrl?: string;
}

interface Props {
  receipt: ReceiptPayload;
  backUrl: string;
  backLabel?: string;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-ZM', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function CheckBox({ checked }: { checked: boolean }) {
  return (
    <span className="inline-flex h-4 w-4 items-center justify-center border border-dashed border-slate-700 text-[10px] font-bold leading-none">
      {checked ? '✓' : ''}
    </span>
  );
}

function ReceiptForm({ receipt, copyLabel }: { receipt: ReceiptPayload; copyLabel?: string }) {
  const footerPhones = receipt.company.phones.length
    ? receipt.company.phones
    : receipt.company.phone.split('/').map((p) => p.trim()).filter(Boolean);

  return (
    <div className="bg-white dark:bg-black p-4 text-[11px] leading-snug text-slate-900">
      {copyLabel && (
        <div className="mb-2 text-center text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          {copyLabel}
        </div>
      )}

      <div className="flex items-center justify-center py-4 gap-3">
        {receipt.company.logoUrl ? (
          <img src={receipt.company.logoUrl} alt={receipt.company.name} className="h-auto w-48 object-contain" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-700 text-lg font-black text-white">
            T
          </div>
        )}
      </div>

      <header className="flex items-start justify-between gap-3 border-b border-dashed border-slate-300 pb-3">


        <div className="text-right">
          <div className="text-sm font-black uppercase tracking-wide">Receipt No.</div>
          <div className="mt-1 min-w-[120px] border-dashed border-slate-700 pb-1 font-mono text-sm font-bold">
            {receipt.receiptNumber}
          </div>
        </div>
      </header>

      <DocumentCodeStrip
        label="Receipt reference"
        value={receipt.receiptNumber}
        qrValue={receipt.verifyUrl}
        layout="row"
        className="mt-3 border-slate-300 bg-slate-50 print:border-solid"
        barcodeHeight={40}
        qrSize={80}
      />

      <div className="mt-3 grid grid-cols-2 gap-4">
        <div>
          <div className="text-[10px] font-bold uppercase">Date</div>
          <div className="border-b border-dashed border-slate-500 py-1 font-medium">{receipt.date}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase">PGN</div>
          <div className="border-b border-dashed border-slate-500 py-1 font-mono text-[10px]">{receipt.pgn}</div>
        </div>
      </div>

      <div className="mt-3">
        <div className="text-[10px] font-bold uppercase">Received from</div>
        <div className="min-h-[24px] border-b border-dashed border-slate-500 py-1 font-medium">{receipt.receivedFrom}</div>
      </div>

      <div className="mt-3">
        <div className="text-[10px] font-bold uppercase">The Sum of</div>
        <div className="min-h-[36px] border-b border-dashed border-slate-500 py-1 italic">{receipt.amountInWords}</div>
      </div>

      <div className="mt-3">
        <div className="text-[10px] font-bold uppercase">In respect of</div>
        <div className="min-h-[24px] border-b border-dashed border-slate-500 py-1">{receipt.inRespectOf}</div>
      </div>

      {receipt.items.length > 0 && (
        <table className="mt-3 w-full border-collapse text-[10px]">
          <thead>
            <tr className="border-y border-dashed border-slate-400 bg-slate-50">
              <th className="px-1 py-1 text-left font-bold">Item</th>
              <th className="px-1 py-1 text-right font-bold">Qty</th>
              <th className="px-1 py-1 text-right font-bold">Price</th>
              <th className="px-1 py-1 text-right font-bold">Total</th>
            </tr>
          </thead>
          <tbody>
            {receipt.items.map((item, index) => (
              <tr key={index} className="border-b border-dashed border-slate-200">
                <td className="px-1 py-1">{item.description}</td>
                <td className="px-1 py-1 text-right">{item.quantity}</td>
                <td className="px-1 py-1 text-right">{formatMoney(item.unitPrice)}</td>
                <td className="px-1 py-1 text-right font-medium">{formatMoney(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="mt-4 grid grid-cols-[1fr_auto] gap-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckBox checked={receipt.payment.cash} />
            <span className="font-semibold">Cash</span>
            <span className="ml-2 inline-block min-w-[70px] border border-dashed border-slate-500 px-2 py-0.5 text-right font-mono">
              {receipt.payment.cash ? formatMoney(receipt.amount) : ''}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <CheckBox checked={receipt.payment.mobile_money} />
            <span className="font-semibold">Mobile Money</span>
          </div>

          <div className="flex items-center gap-2">
            <CheckBox checked={receipt.payment.card} />
            <span className="font-semibold">Card</span>
          </div>

          <div className="flex items-center gap-2">
            <CheckBox checked={receipt.payment.cheque} />
            <span className="font-semibold">Cheque No.</span>
            <span className="inline-block min-w-[90px] border border-slate-500 px-2 py-0.5" />
          </div>

          {receipt.payment.online && !receipt.payment.cash && !receipt.payment.mobile_money && (
            <div className="text-[10px] text-slate-600">Payment: {receipt.paymentMethodLabel}</div>
          )}
        </div>

        <div className="text-right">
          <div className="text-[10px] font-bold uppercase">Kwacha</div>
          <div className="mt-1 min-w-[110px] border-2 border-dashed border-slate-800 px-3 py-2 text-lg font-black">
            {formatMoney(receipt.amount)}
          </div>
          {receipt.totals.tax > 0 && (
            <div className="mt-2 text-[10px] text-slate-600">
              Incl. tax {formatMoney(receipt.totals.tax)}
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <div>
          <div className="text-[10px] font-bold uppercase">Authorized Signature</div>
          <div className="mt-6 border-b border-dashed border-slate-700" />
          {receipt.cashier && (
            <div className="mt-1 text-[10px] text-slate-600">{receipt.cashier}</div>
          )}
        </div>
        <div className="text-right text-[10px] text-slate-600">
          {receipt.register && <div>Terminal: {receipt.register}</div>}
          <div>{receipt.paymentMethodLabel}</div>
        </div>
      </div>

      <footer className="mt-4 border-t border-dashed border-slate-300 pt-3 text-center text-[9px] leading-relaxed text-slate-700">
        <div className="font-semibold uppercase">{receipt.company.name}</div>
        <div>{receipt.company.address}</div>
        <div>
          {footerPhones.map((phone, index) => (
            <span key={phone}>
              {index > 0 ? ' / ' : 'Cell: '}
              {phone}
            </span>
          ))}
        </div>
        <div>Email: {receipt.company.email}</div>
        <div>Website: {receipt.company.website}</div>
      </footer>
    </div>
  );
}

export default function ReceiptPrint({ receipt, backUrl, backLabel = 'Back' }: Props) {
  return (
    <>
      <Head title={`Receipt ${receipt.receiptNumber}`} />

      <style>{`
        @page {
          size: A4 portrait;
          margin: 8mm;
        }

        @media print {
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .print-toolbar {
            display: none !important;
          }

          .receipt-page {
            gap: 8mm !important;
            padding: 0 !important;
          }

          .receipt-copy {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

      <div className="min-h-screen bg-slate-100 px-4 py-6 print:bg-white print:p-0">
        <div className="print-toolbar mx-auto mb-4 flex max-w-4xl items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-black text-slate-900">Receipt</h1>
            <p className="text-xs text-slate-600">{receipt.receiptNumber}</p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={backUrl}
              className="inline-flex items-center gap-2 rounded-full border border-dashed border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
            >
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Link>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-full bg-violet-700 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-800"
            >
              <Printer className="h-4 w-4" />
              Print / Save PDF
            </button>
          </div>
        </div>

        <div className="receipt-page mx-auto flex max-w-4xl flex-col gap-6 print:max-w-none">
          <ReceiptForm receipt={receipt} copyLabel="Customer Copy" />
          {/* <ReceiptForm receipt={receipt} copyLabel="Office Copy" /> */}
        </div>
      </div>
    </>
  );
}
