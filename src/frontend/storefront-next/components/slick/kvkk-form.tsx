"use client";

import { useState } from "react";

export function KvkkApplicationForm() {
  const [done, setDone] = useState(false);
  const [reply, setReply] = useState<"address" | "email" | "pickup">("email");

  if (done) {
    return (
      <div className="border border-black/10 bg-[var(--sg-off)] p-6">
        <p className="sg-nav text-[12px]">Başvurunuz alındı</p>
        <p className="sg-body mt-3 text-[14px] text-[#444]">
          Talebiniz kaydedildi. Niteliğine göre en geç 30 gün içinde size dönüş yapılacaktır.
          Yazılı / KEP başvuruları için formun çıktısını imzalayıp genel merkez adresimize de
          iletebilirsiniz.
        </p>
      </div>
    );
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
      }}
    >
      <h2 className="sg-nav-bold text-[12px]">KVKK Başvuru Formu</h2>

      <label className="block">
        <span className="sg-nav mb-2 block text-[10px] text-[#666]">Talep konusu</span>
        <textarea
          required
          rows={6}
          className="w-full border border-black/20 px-3 py-3 text-[14px] outline-none focus:border-black"
          placeholder="KVKK kapsamındaki talebinizi detaylı olarak yazınız…"
        />
      </label>

      <fieldset>
        <legend className="sg-nav mb-3 text-[10px] text-[#666]">Yanıt bildirim yöntemi</legend>
        <div className="space-y-2 text-[14px]">
          {(
            [
              ["address", "Adresime gönderilmesini istiyorum"],
              ["email", "E-posta adresime gönderilmesini istiyorum"],
              ["pickup", "Elden teslim almak istiyorum"],
            ] as const
          ).map(([value, label]) => (
            <label key={value} className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="reply"
                checked={reply === value}
                onChange={() => setReply(value)}
                className="accent-black"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Adı Soyadı" required />
        <Field label="Telefon Numarası" type="tel" required />
        <Field label="T.C. Kimlik Numarası" required />
        <Field label="E-Mail" type="email" required />
      </div>

      <label className="block">
        <span className="sg-nav mb-2 block text-[10px] text-[#666]">Tebligat Adresi</span>
        <textarea
          required
          rows={3}
          className="w-full border border-black/20 px-3 py-3 text-[14px] outline-none focus:border-black"
        />
      </label>

      <Field label="Başvuru Tarihi" type="date" required />

      <button type="submit" className="sg-btn">
        Başvuruyu Gönder
      </button>
    </form>
  );
}

function Field({
  label,
  type = "text",
  required,
}: {
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="sg-nav mb-2 block text-[10px] text-[#666]">{label}</span>
      <input
        type={type}
        required={required}
        className="w-full border border-black/20 px-3 py-3 text-[14px] outline-none focus:border-black"
      />
    </label>
  );
}
