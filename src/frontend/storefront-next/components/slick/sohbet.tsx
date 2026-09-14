"use client";

/**
 * Basit yardım asistanı (chatbot).
 *
 * Yapay zekâ yok, bir dil modeline bağlı değil. İki şey yapıyor:
 *  1. Sık sorulan konuları (sipariş takibi, kargo, iade, kullanım, toptan,
 *     insanla görüşme) anahtar kelimeyle tanıyıp sitenin ilgili sayfasına
 *     yönlendiriyor. Politika metni UYDURMUYOR: kargo süresi, iade süresi gibi
 *     bilgileri kendisi söylemek yerine o bilgilerin yazdığı sayfaya götürüyor.
 *  2. Tanıyamadığı her mesajı ürün araması olarak Shopify'a soruyor
 *     (/api/search) ve ilk sonuçları kart olarak gösteriyor.
 *
 * Neden Shopify Inbox değil: Inbox sohbet penceresi Shopify temalarına
 * eklenen bir uygulama; bu site tema kullanmıyor (headless), Shopify'ın
 * dokümanında headless mağazaya ekleme yolu yok.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { COMPANY } from "@/lib/legal-content";
import { formatMoney } from "@/lib/money";
import { useT } from "@/lib/i18n/dil";

type Oneri = { handle: string; title: string; price: number; currencyCode: string; imageUrl: string | null; availableForSale: boolean };
type Baglanti = { etiket: string; href: string };
type Mesaj =
  | { kim: "bot"; metin: string; baglantilar?: Baglanti[]; urunler?: Oneri[] }
  | { kim: "sen"; metin: string };

type Konu = { id: string; dugme: string; kelimeler: RegExp; cevap: string; baglantilar: Baglanti[] };

/* Kelimeler İngilizce + İspanyolca (+ Türkçe, TR mağazası için). */
const KONULAR: Konu[] = [
  {
    id: "takip",
    dugme: "Track my order",
    kelimeler: /track|where is my order|order status|tracking|rastrear|seguimiento|mi pedido|sipariş(im)? nerede|takip/i,
    cevap: "You'll find your orders and their status in your account. Tracking details are also emailed to you when the parcel ships.",
    baglantilar: [{ etiket: "My account", href: "/account?section=orders" }, { etiket: "Contact us", href: "/iletisim" }],
  },
  {
    id: "kargo",
    dugme: "Shipping & delivery",
    kelimeler: /ship|deliver|carrier|how long|envío|envio|entrega|kargo|teslimat/i,
    cevap: "Shipping rates, carriers and delivery times depend on where you order from and are shown at checkout before you pay.",
    baglantilar: [{ etiket: "Shipping & delivery", href: "/kargo-ve-teslimat" }],
  },
  {
    id: "iade",
    dugme: "Returns",
    kelimeler: /return|refund|exchange|devoluci|reembolso|cambio|iade|değişim/i,
    cevap: "Unopened products in their original packaging can be returned. Opened cosmetics can't be returned unless they're faulty. The full conditions are here:",
    baglantilar: [{ etiket: "Returns & exchanges", href: "/iade-ve-degisim" }],
  },
  {
    id: "kullanim",
    dugme: "How to use a product",
    kelimeler: /how (do i|to) use|apply|instructions|cómo (se )?usa|aplicar|nasıl kullan/i,
    cevap: "Every product's instructions are collected on one page, grouped by type.",
    baglantilar: [{ etiket: "How to use", href: "/how-to-use" }],
  },
  {
    id: "toptan",
    dugme: "Wholesale & pros",
    kelimeler: /wholesale|distribut|bulk|trade|stockist|barber registration|mayoreo|distribuidor|profesional|toptan|bayi/i,
    cevap: "Shops and distributors can apply for wholesale; barbers can register for trade access.",
    baglantilar: [{ etiket: "Wholesale", href: "/wholesale" }, { etiket: "Barber registration", href: "/professional" }],
  },
  {
    id: "insan",
    dugme: "Talk to a person",
    kelimeler: /human|person|agent|someone|contact|email|phone|persona|humano|contacto|insan|iletişim|müşteri hizmet/i,
    cevap: "Send us a message and the team will get back to you by email.",
    baglantilar: [{ etiket: "Contact us", href: "/iletisim" }],
  },
];

const SELAM = /^(hi|hello|hey|hola|buenas|merhaba|selam)\b/i;

export function Sohbet() {
  const t = useT();
  const yol = usePathname();
  const [acik, setAcik] = useState(false);
  const [girdi, setGirdi] = useState("");
  const [bekliyor, setBekliyor] = useState(false);
  const [mesajlar, setMesajlar] = useState<Mesaj[]>([]);
  const listeRef = useRef<HTMLDivElement | null>(null);
  const girdiRef = useRef<HTMLInputElement | null>(null);

  // İlk açılışta karşılama (dil o an neyse onunla)
  useEffect(() => {
    if (acik && mesajlar.length === 0) {
      setMesajlar([{ kim: "bot", metin: "Hi! I can help with orders, shipping, returns — or find a product for you. What do you need?" }]);
    }
  }, [acik, mesajlar.length]);

  useEffect(() => {
    listeRef.current?.scrollTo({ top: listeRef.current.scrollHeight, behavior: "smooth" });
  }, [mesajlar, bekliyor]);

  useEffect(() => {
    if (!acik) return;
    girdiRef.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAcik(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [acik]);

  async function cevapla(soru: string, konu?: Konu) {
    const temiz = soru.trim();
    if (!temiz) return;
    setMesajlar((m) => [...m, { kim: "sen", metin: temiz }]);
    setGirdi("");

    const bulunan = konu ?? KONULAR.find((k) => k.kelimeler.test(temiz));
    if (bulunan) {
      setMesajlar((m) => [...m, { kim: "bot", metin: bulunan.cevap, baglantilar: bulunan.baglantilar }]);
      return;
    }
    if (SELAM.test(temiz) && temiz.split(/\s+/).length <= 3) {
      setMesajlar((m) => [...m, { kim: "bot", metin: "Hello! Ask me about an order, shipping or returns, or type a product you're looking for." }]);
      return;
    }

    // Konu değilse ürün araması
    setBekliyor(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(temiz)}`);
      const veri = (await res.json()) as { products?: Oneri[] };
      const urunler = (veri.products ?? []).slice(0, 3);
      setMesajlar((m) => [
        ...m,
        urunler.length
          ? { kim: "bot", metin: "Here's what I found:", urunler, baglantilar: [{ etiket: "See all results", href: `/search?q=${encodeURIComponent(temiz)}` }] }
          : { kim: "bot", metin: "I couldn't find anything for that. You can browse the range or ask the team directly.", baglantilar: [{ etiket: "All products", href: "/products" }, { etiket: "Contact us", href: "/iletisim" }] },
      ]);
    } catch {
      setMesajlar((m) => [...m, { kim: "bot", metin: "Something went wrong on my side. Please try again, or contact us.", baglantilar: [{ etiket: "Contact us", href: "/iletisim" }] }]);
    } finally {
      setBekliyor(false);
    }
  }

  // Ürün sayfasında telefonda alttaki "sepete ekle" çubuğunun üstüne binmesin
  const altBosluk = yol?.startsWith("/products/") ? "lx-sohbet--pdp" : "";

  return (
    <div className={`lx-sohbet ${altBosluk}`}>
      {acik ? (
        <div className="lx-sohbet-panel" role="dialog" aria-label={t("Help assistant")}>
          <div className="flex items-center justify-between px-5 pb-3 pt-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <div>
              <p className="uppercase text-white" style={{ fontFamily: "var(--font-owners-black)", fontSize: 16 }}>
                {t("Need a hand?")}
              </p>
              <p className="text-[11px] uppercase tracking-[0.14em]" style={{ color: "rgba(255,255,255,0.5)" }}>
                {t("Marmara Barber assistant")}
              </p>
            </div>
            <button type="button" onClick={() => setAcik(false)} aria-label={t("Close")} className="text-[11px] uppercase tracking-[0.16em]" style={{ color: "rgba(255,255,255,0.6)" }}>
              {t("Close")}
            </button>
          </div>

          <div ref={listeRef} className="lx-sohbet-liste" aria-live="polite">
            {mesajlar.map((m, i) =>
              m.kim === "sen" ? (
                <p key={i} className="lx-sohbet-balon lx-sohbet-balon--sen">{m.metin}</p>
              ) : (
                <div key={i} className="max-w-[92%]">
                  <p className="lx-sohbet-balon">{t(m.metin)}</p>
                  {m.urunler?.length ? (
                    <ul className="mt-2 m-0 list-none space-y-2 p-0">
                      {m.urunler.map((u) => (
                        <li key={u.handle}>
                          <Link href={`/products/${u.handle}`} onClick={() => setAcik(false)} className="lx-sohbet-urun">
                            <span className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-white">
                              {u.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={u.imageUrl} alt="" className="h-full w-full object-contain p-1" />
                              ) : null}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[12px] uppercase" style={{ fontFamily: "var(--font-owners-black)" }}>{u.title}</span>
                              <span className="block text-[11px]" style={{ color: "rgba(255,255,255,0.55)" }}>
                                {u.availableForSale ? formatMoney(u.price, u.currencyCode) : t("Sold out")}
                              </span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {m.baglantilar?.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {m.baglantilar.map((b) => (
                        <Link key={b.href} href={b.href} onClick={() => setAcik(false)} className="lx-sohbet-bag">
                          {t(b.etiket)} →
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              ),
            )}
            {bekliyor ? <p className="lx-sohbet-balon lx-sohbet-yaziyor" aria-label={t("Searching…")}><span /><span /><span /></p> : null}

            {/* Hazır sorular: yalnızca henüz bir şey sorulmamışken */}
            {mesajlar.length <= 1 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {KONULAR.map((k) => (
                  <button key={k.id} type="button" onClick={() => cevapla(t(k.dugme), k)} className="lx-sohbet-hazir">
                    {t(k.dugme)}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <form
            className="flex items-center gap-2 px-3 pb-3 pt-2"
            style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
            onSubmit={(e) => {
              e.preventDefault();
              if (!bekliyor) cevapla(girdi);
            }}
          >
            <input
              ref={girdiRef}
              value={girdi}
              onChange={(e) => setGirdi(e.target.value)}
              placeholder={t("Ask a question or search a product…")}
              aria-label={t("Your message")}
              className="min-w-0 flex-1 bg-transparent px-3 py-3 text-[14px] text-white outline-none placeholder:text-white/40"
              maxLength={200}
            />
            <button type="submit" disabled={!girdi.trim() || bekliyor} className="lx-sohbet-gonder" aria-label={t("Send")}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </form>
          <p className="px-5 pb-3 text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
            {t("Automated assistant. For anything else:")} <a href={`mailto:${COMPANY.email}`} className="underline">{COMPANY.email}</a>
          </p>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setAcik((a) => !a)}
        aria-expanded={acik}
        aria-label={acik ? t("Close help") : t("Open help")}
        className={`lx-sohbet-dugme ${acik ? "lx-sohbet-dugme--acik" : ""}`}
      >
        {acik ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4h0A1.5 1.5 0 0 1 4 14.5z" />
            <path d="M8.5 9.5h.01M12 9.5h.01M15.5 9.5h.01" />
          </svg>
        )}
      </button>
    </div>
  );
}
