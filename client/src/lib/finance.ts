import { addDays, format, isValid, parse, startOfMonth, subMonths, isSameMonth } from "date-fns";
import type { Payment } from "@shared/schema";

/** Days after issue before an unpaid invoice counts as overdue. */
export const PAYMENT_TERMS_DAYS = 14;

/** Sheet amounts arrive as strings like "9,500.00" or "D9,500.00". */
export function toNumber(value: string | null | undefined): number {
  if (!value) return 0;
  return parseFloat(value.replace(/[^0-9.-]+/g, "")) || 0;
}

const SHEET_FORMATS = ["d-MMM-yyyy", "d-MMM-yy", "d/M/yyyy", "yyyy-MM-dd"];

/** Parses the sheet's "23-Nov-2025" dates without relying on engine-specific Date parsing. */
export function parseSheetDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const trimmed = value.trim();
  for (const f of SHEET_FORMATS) {
    const d = parse(trimmed, f, new Date());
    if (isValid(d)) return d;
  }
  const fallback = new Date(trimmed);
  return isValid(fallback) ? fallback : null;
}

export function formatMoney(value: number, opts: { compact?: boolean; decimals?: boolean } = {}): string {
  if (opts.compact && Math.abs(value) >= 10_000) {
    return `D${value.toLocaleString("en-US", { notation: "compact", maximumFractionDigits: 1 })}`;
  }
  return `D${value.toLocaleString("en-US", {
    minimumFractionDigits: opts.decimals ? 2 : 0,
    maximumFractionDigits: opts.decimals ? 2 : 0,
  })}`;
}

export type PaymentState = "Paid" | "Pending" | "Overdue";

export interface Entry {
  id: string;
  client: string;
  project: string;
  invoiceNo: string | null;
  issued: Date | null;
  due: Date | null;
  paidOn: Date | null;
  total: number;
  paid: number;
  balance: number;
  state: PaymentState;
  method: string | null;
  raw: Payment;
}

/** Normalises a sheet row once so every screen agrees on totals and status. */
export function toEntry(p: Payment, now = new Date()): Entry {
  const total = toNumber(p.totalAmount);
  const paid = toNumber(p.amountPaid);
  const balance = toNumber(p.balance);
  const issued = parseSheetDate(p.date);
  const due = issued ? addDays(issued, PAYMENT_TERMS_DAYS) : null;
  const state: PaymentState = balance <= 0 ? "Paid" : due && now > due ? "Overdue" : "Pending";
  const invoiceNo = p.invoiceNo && /\d/.test(p.invoiceNo) ? p.invoiceNo.trim() : null;

  return {
    id: p.id,
    client: p.clientName.trim(),
    project: p.projectTitle.trim(),
    invoiceNo,
    issued,
    due,
    paidOn: parseSheetDate(p.paymentDate),
    total,
    paid,
    balance,
    state,
    method: p.paymentMethod?.trim() || null,
    raw: p,
  };
}

export function sum(entries: Entry[], key: "total" | "paid" | "balance"): number {
  return entries.reduce((acc, e) => acc + e[key], 0);
}

export interface MonthBucket {
  key: string;
  label: string;
  date: Date;
  invoiced: number;
  collected: number;
  outstanding: number;
  clients: number;
}

/**
 * Buckets entries by issue month, ending at the most recent month that has records.
 * The sheet is not always current, so "this month" is anchored to the data, not the clock.
 */
export function monthlySeries(entries: Entry[], months: number): MonthBucket[] {
  const dated = entries.filter((e) => e.issued);
  if (!dated.length) return [];
  const latest = dated.reduce((a, b) => (a.issued! > b.issued! ? a : b)).issued!;
  const end = startOfMonth(latest);

  return Array.from({ length: months }, (_, i) => {
    const date = subMonths(end, months - 1 - i);
    const inMonth = dated.filter((e) => isSameMonth(e.issued!, date));
    return {
      key: format(date, "yyyy-MM"),
      label: format(date, "MMM"),
      date,
      invoiced: sum(inMonth, "total"),
      collected: sum(inMonth, "paid"),
      outstanding: sum(inMonth, "balance"),
      clients: new Set(inMonth.map((e) => e.client)).size,
    };
  });
}

/** Percentage change, or null when there is nothing to compare against. */
export function change(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

export function formatDate(d: Date | null, pattern = "d MMM yyyy"): string {
  return d ? format(d, pattern) : "—";
}
