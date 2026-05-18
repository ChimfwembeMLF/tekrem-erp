import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Building, Mail, Phone, Printer, User } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface InvoicePrintItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface InvoicePrintPayment {
  id: number;
  paymentNumber?: string | null;
  paymentDate?: string | null;
  amount: number;
  method?: string | null;
  status?: string | null;
  account?: {
    name?: string | null;
    type?: string | null;
    number?: string | null;
  } | null;
}

interface InvoicePrintPayload {
  id: number;
  invoiceNumber: string;
  orderNumber?: string | null;
  issueDate?: string | null;
  dueDate?: string | null;
  currency: string;
  status: string;
  notes?: string | null;
  terms?: string | null;
  customer: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    taxNumber?: string | null;
  };
  company: {
    name: string;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    taxNumber?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    logoUrl?: string | null;
    bankName?: string | null;
    bankBranch?: string | null;
    accountName?: string | null;
    accountNumber?: string | null;
  };
  items: InvoicePrintItem[];
  payments: InvoicePrintPayment[];
  totals: {
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    paidAmount: number;
    balanceDue: number;
    grandTotal: number;
  };
}

interface Props {
  invoice: InvoicePrintPayload;
}

const minimumRows = 6;

function formatMoney(value: number, currency: string) {
  const amount = new Intl.NumberFormat('en-ZM', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  return currency === 'ZMW' ? `K ${amount}` : `${currency} ${amount}`;
}

export default function Print({ invoice }: Props) {
  const route = useRoute();
  const currency = invoice.currency || 'ZMW';
  const fillerRows = Math.max(minimumRows - invoice.items.length, 0);

  return (
    <>
      <Head title={`Print ${invoice.invoiceNumber}`} />

      <style>{`
        @page {
          size: A4 portrait;
          margin: 5mm;
        }

        @media print {
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

      <div className="min-h-screen bg-slate-100 px-6 py-8 print:bg-white print:px-0 print:py-0">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 pb-3 print:hidden">
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-900">Invoice Print</h1>
            <p className="text-xs text-slate-600">Print or save as PDF below.</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={route('finance.invoices.show', invoice.id)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back To Invoice
            </Link>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              <Printer className="h-4 w-4" />
              Print / Save PDF
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-[0_20px_60px_rgba(15,23,42,0.12)] print:max-w-none print:rounded-none print:border-0 print:shadow-none">
          <div className="px-3 py-3 sm:px-4 sm:py-4 print:px-3 print:py-3">
            <header className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                {invoice.company.logoUrl ? (
                  <img src={invoice.company.logoUrl} alt={invoice.company.name} className="h-16 w-auto object-contain" />
                ) : (
                  <div className="text-lg font-black text-slate-900">{invoice.company.name}</div>
                )}
              </div>

              <div className="text-right">
                <h2 className="text-lg font-black tracking-tight text-slate-900">Invoice Details</h2>
                <p className="text-xs text-slate-500">Breakdown of charges and services</p>
              </div>
            </header>

            <section className="mt-3 grid grid-cols-1 gap-3 border-b border-slate-200 pb-3 md:grid-cols-2 print:grid-cols-2 print:gap-6">
              <div>
                <h3 className="mb-1 flex items-center gap-1 text-sm font-bold text-slate-900">
                  <Building className="h-4 w-4" />
                  From
                </h3>
                <div className="space-y-0.5 text-xs leading-5 text-slate-700">
                  <p className="font-medium text-slate-900">{invoice.company.name}</p>
                  {invoice.company.address ? <p>{invoice.company.address}</p> : null}
                  {invoice.company.city ? <p>{invoice.company.city}</p> : null}
                  {invoice.company.country ? <p>{invoice.company.country}</p> : null}
                  <p className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {invoice.company.email || '—'}
                  </p>
                  <p className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {invoice.company.phone || '—'}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="mb-1 flex items-center gap-1 text-sm font-bold text-slate-900">
                  <User className="h-4 w-4" />
                  Bill To
                </h3>
                <div className="space-y-0.5 text-xs leading-5 text-slate-700">
                  <p className="font-medium text-slate-900">{invoice.customer.name || 'No client'}</p>
                  <p className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {invoice.customer.email || 'No email'}
                  </p>
                  {invoice.customer.phone ? (
                    <p className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {invoice.customer.phone}
                    </p>
                  ) : null}
                  {invoice.customer.address ? <p>{invoice.customer.address}</p> : null}
                </div>
              </div>
            </section>

            <section className="mt-3">
              <h3 className="mb-2 text-sm font-bold text-slate-900">Items</h3>

              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <table className="w-full table-fixed border-collapse text-left">
                  <thead>
                    <tr className="bg-slate-100 text-[10px] uppercase tracking-[0.12em] text-slate-600">
                      <th className="w-[58%] px-2 py-1.5 font-semibold">Description</th>
                      <th className="w-[10%] px-2 py-1.5 text-right font-semibold">Qty</th>
                      <th className="w-[16%] px-2 py-1.5 text-right font-semibold">Unit</th>
                      <th className="w-[16%] px-2 py-1.5 text-right font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item) => (
                      <tr key={item.id} className="border-t border-slate-200 text-[12px] text-slate-800">
                        <td className="px-2 py-1 leading-5">{item.description}</td>
                        <td className="px-2 py-1 text-right">{item.quantity}</td>
                        <td className="px-2 py-1 text-right">{formatMoney(item.unitPrice, currency)}</td>
                        <td className="px-2 py-1 text-right font-medium">{formatMoney(item.totalPrice, currency)}</td>
                      </tr>
                    ))}
                    {Array.from({ length: fillerRows }).map((_, index) => (
                      <tr key={`empty-${index}`} className="border-t border-slate-100 text-[12px] text-transparent">
                        <td className="px-2 py-1">.</td>
                        <td className="px-2 py-1 text-right">.</td>
                        <td className="px-2 py-1 text-right">.</td>
                        <td className="px-2 py-1 text-right">.</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-3 flex justify-end">
              <div className="w-full max-w-[280px] space-y-1 text-xs text-slate-800">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>{formatMoney(invoice.totals.subtotal, currency)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>VAT (16%)</span>
                  <span>{formatMoney(invoice.totals.taxAmount, currency)}</span>
                </div>
                {invoice.totals.discountAmount > 0 ? (
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Discount</span>
                    <span>-{formatMoney(invoice.totals.discountAmount, currency)}</span>
                  </div>
                ) : null}

                <div className="border-t border-slate-200 pt-1">
                  <div className="flex items-center justify-between text-sm font-bold text-slate-900">
                    <span>Total</span>
                    <span>{formatMoney(invoice.totals.grandTotal, currency)}</span>
                  </div>
                </div>

                {invoice.totals.paidAmount > 0 ? (
                  <div className="flex items-center justify-between text-emerald-500">
                    <span>Paid</span>
                    <span>-{formatMoney(invoice.totals.paidAmount, currency)}</span>
                  </div>
                ) : null}

                <div className="border-t border-slate-200 pt-1">
                  <div className="flex items-center justify-between text-sm font-bold text-slate-900">
                    <span>Balance Due</span>
                    <span className={invoice.totals.balanceDue > 0 ? 'text-red-500' : 'text-emerald-500'}>
                      {formatMoney(invoice.totals.balanceDue, currency)}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {(invoice.notes || invoice.terms) ? (
              <section className="mt-3 border-t border-slate-200 pt-3 text-slate-800">
                {invoice.notes ? (
                  <div className="mb-2">
                    <h3 className="mb-1 text-sm font-bold text-slate-900">Notes</h3>
                    <p className="text-xs leading-4 text-slate-500 line-clamp-2">{invoice.notes}</p>
                  </div>
                ) : null}

                {invoice.terms ? (
                  <div>
                    <h3 className="mb-1 text-sm font-bold text-slate-900">Terms & Conditions</h3>
                    <p className="whitespace-pre-wrap text-xs leading-4 text-slate-500 line-clamp-2">{invoice.terms}</p>
                  </div>
                ) : null}
              </section>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
