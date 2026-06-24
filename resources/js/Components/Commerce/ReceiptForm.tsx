import React from 'react';

export interface ReceiptItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ReceiptPayload {
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
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-ZM', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function CheckBox({ checked }: { checked: boolean }) {
  return (
    <span className="inline-flex h-4 w-4 items-center justify-center border border-slate-700 text-[10px] font-bold leading-none">
      {checked ? '✓' : ''}
    </span>
  );
}

interface Props {
  receipt: ReceiptPayload;
  copyLabel?: string;
  compact?: boolean;
}

export default function ReceiptForm({ receipt, copyLabel, compact = false }: Props) {
  const footerPhones = receipt.company.phones.length
    ? receipt.company.phones
    : receipt.company.phone.split('/').map((p) => p.trim()).filter(Boolean);

  return (
    <div
      className={`receipt-copy border-2 border-slate-800 bg-white text-slate-900 ${
        compact ? 'p-3 text-[10px] leading-snug' : 'p-4 text-[11px] leading-snug'
      }`}
    >
      {copyLabel && (
        <div className="mb-2 text-center text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          {copyLabel}
        </div>
      )}

      <header className="flex items-start justify-between gap-3 border-b border-slate-300 pb-3">
        <div className="flex items-center gap-3">
          {receipt.company.logoUrl ? (
            <img src={receipt.company.logoUrl} alt={receipt.company.name} className="w-44 object-contain" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-700 text-base font-black text-white">
              T
            </div>
          )}h
          {/* <div>
            <div className="text-base font-black tracking-wide">{receipt.company.name.split(' ')[0] || 'Tekrem'}</div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-600">
              {receipt.company.tagline}
            </div>
          </div> */}
        </div>

        <div className="text-right">
          <div className="text-xs font-black uppercase tracking-wide">Receipt No.</div>
          <div className="mt-1 min-w-[100px] border-b border-slate-700 pb-1 font-mono text-xs font-bold">
            {receipt.receiptNumber}
          </div>
        </div>
      </header>

      <div className="mt-3 grid grid-cols-2 gap-4">
        <div>
          <div className="text-[10px] font-bold uppercase">Date</div>
          <div className="border-b border-slate-500 py-1 font-medium">{receipt.date}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase">PGN</div>
          <div className="border-b border-slate-500 py-1 font-mono text-[10px]">{receipt.pgn}</div>
        </div>
      </div>

      <div className="mt-3">
        <div className="text-[10px] font-bold uppercase">Received from</div>
        <div className="min-h-[24px] border-b border-slate-500 py-1 font-medium">{receipt.receivedFrom}</div>
      </div>

      <div className="mt-3">
        <div className="text-[10px] font-bold uppercase">The Sum of</div>
        <div className="min-h-[32px] border-b border-slate-500 py-1 italic">{receipt.amountInWords}</div>
      </div>

      <div className="mt-3">
        <div className="text-[10px] font-bold uppercase">In respect of</div>
        <div className="min-h-[24px] border-b border-slate-500 py-1">{receipt.inRespectOf}</div>
      </div>

      {receipt.items.length > 0 && (
        <table className="mt-3 w-full border-collapse text-[10px]">
          <thead>
            <tr className="border-y border-slate-400 bg-slate-50">
              <th className="px-1 py-1 text-left font-bold">Item</th>
              <th className="px-1 py-1 text-right font-bold">Qty</th>
              <th className="px-1 py-1 text-right font-bold">Price</th>
              <th className="px-1 py-1 text-right font-bold">Total</th>
            </tr>
          </thead>
          <tbody>
            {receipt.items.map((item, index) => (
              <tr key={index} className="border-b border-slate-200">
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
            <CheckBox checked={receipt.payment.online} />
            <span className="font-semibold">Online</span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] font-bold uppercase">Kwacha</div>
          <div className="mt-1 min-w-[100px] border-2 border-slate-800 px-3 py-2 text-base font-black">
            {formatMoney(receipt.amount)}
          </div>
        </div>
      </div>

      <footer className="mt-4 border-t border-slate-300 pt-3 text-center text-[9px] leading-relaxed text-slate-700">
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
      </footer>
    </div>
  );
}
