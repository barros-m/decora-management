"use client";

import { useActionState, useState, useMemo } from "react";
import Link from "next/link";
import type { Inquiry } from "@prisma/client";

import {
  createProposalAction,
  type CreateProposalFormState,
} from "./actions";

/* ─── Types ─────────────────────────────────────────────────────────────── */

type LineItem = {
  id: string;
  title: string;
  description: string;
  quantity: number;
  unitDollars: string;
};

type Option = {
  id: string;
  name: string;
  description: string;
  items: LineItem[];
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */

let _id = 0;
function uid() {
  return String(++_id);
}

function parseDollars(val: string): number {
  const n = parseFloat(val.replace(/[^0-9.]/g, ""));
  return isNaN(n) ? 0 : Math.round(n * 100);
}

function formatMoney(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

function optionSubtotal(opt: Option): number {
  return opt.items.reduce(
    (s, item) => s + item.quantity * parseDollars(item.unitDollars),
    0,
  );
}

function makeItem(): LineItem {
  return { id: uid(), title: "", description: "", quantity: 1, unitDollars: "" };
}

function makeOption(): Option {
  return { id: uid(), name: "", description: "", items: [makeItem()] };
}

const OPTION_COLORS = [
  "border-primary/30 bg-primary/5",
  "border-violet-200 bg-violet-50/50",
  "border-cyan-200 bg-cyan-50/50",
  "border-amber-200 bg-amber-50/50",
];

const OPTION_BADGE_COLORS = [
  "bg-primary/10 text-primary",
  "bg-violet-100 text-violet-700",
  "bg-cyan-100 text-cyan-700",
  "bg-amber-100 text-amber-700",
];

/* ─── Shared input styles ────────────────────────────────────────────────── */

const inputCls =
  "w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 placeholder:text-stone-300 transition focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-100";

/* ─── Line Item Row ──────────────────────────────────────────────────────── */

function LineItemRow({
  item,
  index,
  onChange,
  onRemove,
  canRemove,
}: {
  item: LineItem;
  index: number;
  onChange: (u: LineItem) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const lineCents = item.quantity * parseDollars(item.unitDollars);
  const [showNotes, setShowNotes] = useState(!!item.description);

  return (
    <div className="group rounded-xl border border-stone-100 bg-white p-3">
      {/* Main row */}
      <div className="flex items-center gap-2">
        {/* Index */}
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-stone-100 text-[10px] font-semibold text-stone-400">
          {index + 1}
        </span>

        {/* Description */}
        <input
          type="text"
          placeholder="Item description *"
          value={item.title}
          onChange={(e) => onChange({ ...item, title: e.target.value })}
          required
          className="min-w-0 flex-1 rounded-lg border border-stone-200 bg-transparent px-3 py-1.5 text-sm text-stone-800 placeholder:text-stone-300 transition focus:border-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-100"
        />

        {/* Qty */}
        <div className="flex shrink-0 items-center gap-1">
          <span className="text-xs text-stone-400">Qty</span>
          <input
            type="number"
            min={1}
            value={item.quantity}
            onChange={(e) =>
              onChange({ ...item, quantity: Math.max(1, parseInt(e.target.value) || 1) })
            }
            className="w-14 rounded-lg border border-stone-200 bg-transparent px-2 py-1.5 text-center text-sm text-stone-800 transition focus:border-stone-400 focus:bg-white focus:outline-none"
          />
        </div>

        {/* Unit price */}
        <div className="relative shrink-0">
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-stone-400">
            $
          </span>
          <input
            type="number"
            min={0}
            step={0.01}
            placeholder="0.00"
            value={item.unitDollars}
            onChange={(e) => onChange({ ...item, unitDollars: e.target.value })}
            className="w-28 rounded-lg border border-stone-200 bg-transparent py-1.5 pl-6 pr-3 text-sm text-stone-800 placeholder:text-stone-300 transition focus:border-stone-400 focus:bg-white focus:outline-none"
          />
        </div>

        {/* Line total */}
        <span className="w-20 shrink-0 text-right text-sm font-semibold text-stone-700">
          {lineCents > 0 ? formatMoney(lineCents) : <span className="text-stone-300">—</span>}
        </span>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition group-hover:opacity-100">
          <button
            type="button"
            onClick={() => {
              setShowNotes((v) => !v);
              if (showNotes) onChange({ ...item, description: "" });
            }}
            title={showNotes ? "Remove notes" : "Add notes"}
            className="rounded-md p-1 text-stone-300 hover:bg-stone-100 hover:text-stone-600 transition"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          {canRemove && (
            <button
              type="button"
              onClick={onRemove}
              title="Remove item"
              className="rounded-md p-1 text-stone-300 hover:bg-red-50 hover:text-red-400 transition"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Notes row */}
      {showNotes && (
        <div className="mt-2 pl-7">
          <input
            type="text"
            placeholder="Additional notes for this item…"
            value={item.description}
            onChange={(e) => onChange({ ...item, description: e.target.value })}
            className="w-full rounded-lg border border-dashed border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-500 placeholder:text-stone-300 focus:border-stone-300 focus:bg-white focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}

/* ─── Option Card ────────────────────────────────────────────────────────── */

function OptionCard({
  option,
  index,
  onChange,
  onRemove,
  canRemove,
}: {
  option: Option;
  index: number;
  onChange: (u: Option) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const colorBorder = OPTION_COLORS[index % OPTION_COLORS.length];
  const colorBadge = OPTION_BADGE_COLORS[index % OPTION_BADGE_COLORS.length];
  const subtotal = optionSubtotal(option);

  const updateItem = (itemId: string, updated: LineItem) =>
    onChange({ ...option, items: option.items.map((i) => (i.id === itemId ? updated : i)) });

  const removeItem = (itemId: string) =>
    onChange({ ...option, items: option.items.filter((i) => i.id !== itemId) });

  const addItem = () =>
    onChange({ ...option, items: [...option.items, makeItem()] });

  return (
    <div className={`rounded-2xl border-2 p-5 ${colorBorder}`}>
      {/* Header */}
      <div className="mb-4 flex items-start gap-3">
        <span className={`mt-1 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${colorBadge}`}>
          Option {index + 1}
        </span>
        <div className="flex-1 space-y-2">
          <input
            type="text"
            placeholder="Option name — e.g. Decoração Completa *"
            value={option.name}
            onChange={(e) => onChange({ ...option, name: e.target.value })}
            required
            className={inputCls + " font-semibold"}
          />
          <input
            type="text"
            placeholder="Short description of what's included (optional)"
            value={option.description}
            onChange={(e) => onChange({ ...option, description: e.target.value })}
            className={inputCls + " text-stone-500"}
          />
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 rounded-lg border border-red-100 bg-white px-2.5 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-50 hover:text-red-600"
          >
            Remove
          </button>
        )}
      </div>

      {/* Column labels */}
      <div className="mb-2 flex items-center gap-2 px-1">
        <div className="w-5" />
        <p className="flex-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Description</p>
        <p className="w-[4.5rem] text-right text-[10px] font-semibold uppercase tracking-wider text-stone-400">Qty</p>
        <p className="w-28 text-right text-[10px] font-semibold uppercase tracking-wider text-stone-400">Unit price</p>
        <p className="w-20 text-right text-[10px] font-semibold uppercase tracking-wider text-stone-400">Total</p>
        <div className="w-[3.75rem]" />
      </div>

      {/* Items */}
      <div className="space-y-2">
        {option.items.map((item, idx) => (
          <LineItemRow
            key={item.id}
            item={item}
            index={idx}
            onChange={(u) => updateItem(item.id, u)}
            onRemove={() => removeItem(item.id)}
            canRemove={option.items.length > 1}
          />
        ))}
      </div>

      {/* Footer: add item + subtotal */}
      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-stone-400 transition hover:bg-white hover:text-stone-700"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add item
        </button>
        <div className="text-right">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Subtotal</p>
          <p className={`text-xl font-bold ${subtotal > 0 ? "text-stone-900" : "text-stone-300"}`}>
            {formatMoney(subtotal)}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── OR Divider ─────────────────────────────────────────────────────────── */

function OrDivider() {
  return (
    <div className="flex items-center gap-4">
      <div className="h-px flex-1 bg-stone-200" />
      <span className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-bold tracking-wider text-stone-400">
        OR
      </span>
      <div className="h-px flex-1 bg-stone-200" />
    </div>
  );
}

/* ─── Main Form ──────────────────────────────────────────────────────────── */

const initialState: CreateProposalFormState = {};

export function ProposalForm({
  inquiryId,
  inquiry,
}: {
  inquiryId: string;
  inquiry: Pick<Inquiry, "contactName" | "eventType" | "eventDate">;
}) {
  const [options, setOptions] = useState<Option[]>([makeOption()]);
  const [expiresInDays, setExpiresInDays] = useState(30);
  const [state, formAction, isPending] = useActionState(createProposalAction, initialState);

  const updateOption = (optId: string, updated: Option) =>
    setOptions((prev) => prev.map((o) => (o.id === optId ? updated : o)));
  const removeOption = (optId: string) =>
    setOptions((prev) => prev.filter((o) => o.id !== optId));
  const addOption = () => setOptions((prev) => [...prev, makeOption()]);

  const totals = options.map(optionSubtotal);
  const multipleOptions = options.length > 1;

  const payload = useMemo(
    () =>
      JSON.stringify({
        inquiryId,
        expiresInDays,
        packages: options.map((opt) => ({
          name: opt.name,
          description: opt.description || undefined,
          items: opt.items.map((item, idx) => ({
            title: item.title,
            description: item.description || undefined,
            quantity: item.quantity,
            unitCents: parseDollars(item.unitDollars),
            sortOrder: idx,
          })),
        })),
      }),
    [inquiryId, expiresInDays, options],
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="payload" value={payload} />

      {/* Context + validity strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-5 py-3">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold text-stone-700">{inquiry.contactName}</span>
          <span className="text-stone-300">·</span>
          <span className="text-stone-500">{inquiry.eventType}</span>
          {inquiry.eventDate && (
            <>
              <span className="text-stone-300">·</span>
              <span className="text-stone-500">
                {new Intl.DateTimeFormat("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                }).format(inquiry.eventDate)}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-stone-400">Valid for</label>
          <select
            value={expiresInDays}
            onChange={(e) => setExpiresInDays(Number(e.target.value))}
            className="rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs text-stone-700 focus:border-stone-400 focus:outline-none"
          >
            <option value={15}>15 days</option>
            <option value={30}>30 days</option>
            <option value={45}>45 days</option>
            <option value={60}>60 days</option>
          </select>
        </div>
      </div>

      {/* Hint */}
      <div className="flex items-center gap-2.5 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-2.5">
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01" />
        </svg>
        <p className="text-xs text-blue-700">
          Each option is a pricing alternative — your client will choose <strong>one</strong>.
          Add multiple options to offer tiers (e.g. Basic, Standard, Premium).
        </p>
      </div>

      {/* Error */}
      {state.error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      {/* Options */}
      <div className="space-y-4">
        {options.map((opt, idx) => (
          <div key={opt.id} className="space-y-4">
            <OptionCard
              option={opt}
              index={idx}
              onChange={(u) => updateOption(opt.id, u)}
              onRemove={() => removeOption(opt.id)}
              canRemove={options.length > 1}
            />
            {idx < options.length - 1 && <OrDivider />}
          </div>
        ))}

        <button
          type="button"
          onClick={addOption}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-stone-200 py-3.5 text-sm font-medium text-stone-400 transition hover:border-stone-300 hover:bg-stone-50 hover:text-stone-600"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add another option
        </button>
      </div>

      {/* Summary footer */}
      <div className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-5">
        <div>
          {multipleOptions ? (
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                Totals by option
              </p>
              <div className="space-y-1">
                {options.map((opt, idx) => (
                  <div key={opt.id} className="flex items-center gap-3">
                    <span className="text-sm text-stone-500">
                      {opt.name || `Option ${idx + 1}`}
                    </span>
                    <span className="text-sm font-bold text-stone-800">
                      {totals[idx] > 0 ? formatMoney(totals[idx]) : <span className="text-stone-300">—</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                Grand total
              </p>
              <p className={`text-2xl font-bold ${totals[0] > 0 ? "text-stone-900" : "text-stone-300"}`}>
                {formatMoney(totals[0])}
              </p>
              {totals[0] > 0 && (
                <p className="text-xs text-stone-400">
                  50% deposit: {formatMoney(Math.ceil(totals[0] / 2))}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/inquiries/${inquiryId}`}
            className="text-sm text-stone-400 transition hover:text-stone-700"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Saving…
              </>
            ) : (
              "Save as draft"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
