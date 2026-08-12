"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { COMPANY } from "@/lib/legal-content";

const HELP_WIDE = [
  { label: "Return / Refund?", href: "/iade-ve-degisim" },
  { label: "Issue with order placed or received?", href: "/iletisim#contact-form" },
];

const HELP_GRID = [
  { label: "Track order", href: "/account", icon: TrackIcon },
  { label: "Return order", href: "/iade-ve-degisim", icon: ReturnIcon },
  { label: "Cancel order", href: "/iletisim#contact-form", icon: CancelIcon },
  { label: "Report issue", href: "/iletisim#contact-form", icon: ReportIcon },
];

const SUBJECTS = [
  "Order issue",
  "Return / Refund",
  "Product question",
  "Wholesale / Partner",
  "Other",
];

export function SlickContactPage() {
  const [sent, setSent] = useState(false);
  const [fileCount, setFileCount] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="bg-[#fafafa]">
      <div className="mx-auto max-w-[720px] px-4 py-10 sm:px-6 md:py-14">
        {/* Self-service cards */}
        <div className="grid gap-3 sm:grid-cols-2">
          {HELP_WIDE.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center justify-between rounded-xl border border-[#e5e5e5] bg-white px-5 py-4 text-[15px] font-semibold text-black transition hover:border-black/40"
            >
              <span>{item.label}</span>
              <span className="text-[#999]" aria-hidden>
                ›
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {HELP_GRID.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center justify-center gap-3 rounded-xl border border-[#e5e5e5] bg-white px-3 py-6 text-center transition hover:border-black/40"
            >
              <item.icon />
              <span className="text-[13px] font-semibold text-black">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Title */}
        <h1 className="mt-12 text-[32px] font-bold tracking-tight text-black sm:text-[36px]">
          Contact us
        </h1>
        <div className="mt-5 border-b border-[#e5e5e5]" />

        {/* Form */}
        <div id="contact-form" className="scroll-mt-28 pt-8">
          {sent ? (
            <div className="rounded-lg border border-[#e5e5e5] bg-white p-8 text-center">
              <p className="text-[16px] font-semibold text-black">Message sent</p>
              <p className="mt-2 text-[14px] text-[#666]">
                We&apos;ll get back to you as soon as possible.
              </p>
              <p className="mt-4 text-[13px] text-[#888]">{COMPANY.email}</p>
            </div>
          ) : (
            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <Field label="Full name">
                <input
                  type="text"
                  required
                  className="sg-contact-input"
                  autoComplete="name"
                />
              </Field>

              <Field label="Email">
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  className="sg-contact-input"
                  autoComplete="email"
                />
              </Field>

              <Field label="Subject">
                <div className="relative">
                  <select required defaultValue="" className="sg-contact-input appearance-none pr-10">
                    <option value="" disabled>
                      Select a subject
                    </option>
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-[#666]">
                    ▼
                  </span>
                </div>
              </Field>

              <Field label="Message">
                <textarea required rows={7} className="sg-contact-input resize-y" />
              </Field>

              <div>
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={(e) => setFileCount(e.target.files?.length ?? 0)}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#e5e5e5] bg-[#f3f3f3] px-4 py-3.5 text-[14px] font-medium text-black transition hover:bg-[#ececec]"
                >
                  <PaperclipIcon />
                  Attach Files
                  {fileCount > 0 ? (
                    <span className="text-[#666]">({fileCount})</span>
                  ) : null}
                </button>
                <p className="mt-2 text-[12px] text-[#888]">
                  Attach up to 10 files. The maximum allowed size per file is 10 MB.
                </p>
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-black px-6 py-3.5 text-[15px] font-bold text-white transition hover:opacity-90"
              >
                Send
              </button>

              <p className="text-[12px] leading-relaxed text-[#888]">
                This site is protected by reCAPTCHA. For more information, please refer to{" "}
                <Link href="/gizlilik-politikasi" className="text-[#2563eb] underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[14px] font-bold text-black">
        {label} <span className="text-[var(--sg-red)]">*</span>
      </span>
      {children}
    </label>
  );
}

function TrackIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 8h12v10H4z" />
      <path d="M16 11h3l1 2v5h-4v-7z" />
      <circle cx="8" cy="19.5" r="1.5" />
      <circle cx="18" cy="19.5" r="1.5" />
      <circle cx="11" cy="12" r="2.5" />
      <path d="M13 14.5 15 16.5" strokeLinecap="round" />
    </svg>
  );
}
function ReturnIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 8h10v9H5z" />
      <path d="M9 5v3M11 5v3" strokeLinecap="round" />
      <path d="M15 14a4 4 0 1 0-1.2 2.8" strokeLinecap="round" />
      <path d="M13.5 15.5H16v-2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CancelIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 8h12v10H5z" />
      <path d="M9 5v3M13 5v3" strokeLinecap="round" />
      <path d="M9 13.5 13 17.5M13 13.5 9 17.5" strokeLinecap="round" />
    </svg>
  );
}
function ReportIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 8h12v10H5z" />
      <path d="M12 11v3.5" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r="0.8" fill="currentColor" stroke="none" />
      <path d="M12 4.5 14.5 8H9.5L12 4.5z" />
    </svg>
  );
}
function PaperclipIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path
        d="M21 12.5 12.2 21a5 5 0 0 1-7.1-7.1l9.2-9.2a3.2 3.2 0 0 1 4.5 4.5l-9.2 9.2a1.4 1.4 0 1 1-2-2l8.1-8.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
