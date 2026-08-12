"use client";

import { useState } from "react";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <p className="text-[13px] text-[#444] border border-[#e5e5e5] p-6">
        Mesajınız alındı. En kısa sürede size dönüş yapacağız.
      </p>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <input
        type="text"
        required
        placeholder="Ad Soyad"
        className="w-full border border-[#e5e5e5] px-4 py-3 text-[12px] outline-none focus:border-black"
      />
      <input
        type="email"
        required
        placeholder="E-posta"
        className="w-full border border-[#e5e5e5] px-4 py-3 text-[12px] outline-none focus:border-black"
      />
      <textarea
        required
        rows={5}
        placeholder="Mesajınız"
        className="w-full border border-[#e5e5e5] px-4 py-3 text-[12px] outline-none focus:border-black resize-none"
      />
      <button type="submit" className="pf-btn-primary w-full sm:w-auto sm:px-12">
        Gönder
      </button>
    </form>
  );
}
