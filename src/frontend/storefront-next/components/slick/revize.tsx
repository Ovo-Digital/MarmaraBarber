"use client";

/**
 * Revize Modu — ekibin site üzerinde not bırakması için.
 *
 * Açıkken imleç bir öğenin üzerine gelince o öğe çerçeveleniyor; tıklanınca
 * "kalsın / kaldır / değiştir / ekle" seçimi, öncelik, serbest not ve görsel
 * eklenebiliyor. Notlar tarayıcıda birikiyor (localStorage), "Gönder"
 * denince /api/revize'ye gidip GitHub issue'suna dönüşüyor.
 *
 * Neden yalnızca açıkken dinliyoruz: kapalıyken hiçbir olay bağlanmıyor,
 * site normal çalışıyor. Mod kapalıysa bu bileşen sadece düğmeyi çiziyor.
 *
 * Yayına çıkarken NEXT_PUBLIC_REVIZE tanımsız bırakılır; o zaman bileşen
 * hiç çizilmez ve müşteri bu düğmeyi görmez.
 */

import { useCallback, useEffect, useRef, useState } from "react";

const DEPO = "marmara-revize-v1";
const EN_FAZLA_GORSEL = 3;

/* Not bırakılabilecek öğeler. Listedekine en yakın ata seçiliyor;
   böylece bir kelimeye değil, anlamlı bir bloğa not düşülüyor. */
const SECILEBILIR = [
  "header", "footer", "section", "article", "nav",
  "button", "a", "input", "select", "textarea", "form",
  "h1", "h2", "h3", "img", "picture", "table", "li", "p",
].join(",");

/* Revize arayüzünün kendi parçaları tıklanınca not açılmamalı */
const KENDI = "[data-revize]";

type Eylem = "kalsin" | "kaldir" | "degistir" | "ekle";

const EYLEMLER: { kod: Eylem; ad: string }[] = [
  { kod: "kalsin", ad: "Kalsın" },
  { kod: "kaldir", ad: "Kaldırılsın" },
  { kod: "degistir", ad: "Değiştirilsin" },
  { kod: "ekle", ad: "Buraya eklensin" },
];

type Gorsel = { onizleme: string; url?: string };
type Not = {
  id: string;
  eylem: Eylem;
  oncelik: "yuksek" | "normal";
  not: string;
  yol: string;
  sayfa: string;
  hedef: { tur: string; metin: string; secici: string };
  gorseller: Gorsel[];
};
type Kisi = { ad: string; rol: string };
type Depo = { kisi: Kisi | null; notlar: Not[] };

function depoOku(): Depo {
  if (typeof window === "undefined") return { kisi: null, notlar: [] };
  try {
    const ham = localStorage.getItem(DEPO);
    if (!ham) return { kisi: null, notlar: [] };
    const d = JSON.parse(ham) as Depo;
    return { kisi: d.kisi ?? null, notlar: Array.isArray(d.notlar) ? d.notlar : [] };
  } catch {
    return { kisi: null, notlar: [] };
  }
}

/** Öğeyi insanın tanıyacağı şekilde adlandır */
function hedefBilgisi(el: HTMLElement) {
  const etiket = el.tagName.toLowerCase();
  const tur =
    el.getAttribute("aria-label") ||
    ({ h1: "başlık", h2: "başlık", h3: "başlık", button: "düğme", a: "bağlantı",
       img: "görsel", input: "alan", select: "seçim", textarea: "alan",
       section: "bölüm", header: "üst bilgi", footer: "alt bilgi", nav: "menü",
       table: "tablo", li: "liste öğesi", p: "paragraf", form: "form" } as Record<string, string>)[etiket] ||
    etiket;
  const metin = (el.innerText || el.getAttribute("alt") || "").replace(/\s+/g, " ").trim().slice(0, 160);
  return { tur, metin, secici: secici(el) };
}

/** Öğeye giden kısa bir CSS yolu — issue'da yeri bulmak için */
function secici(el: HTMLElement): string {
  const parcalar: string[] = [];
  let n: HTMLElement | null = el;
  for (let i = 0; n && i < 4; i++) {
    let p = n.tagName.toLowerCase();
    if (n.id) { parcalar.unshift(`#${n.id}`); break; }
    const sinif = [...n.classList].filter((c) => !c.startsWith("lx-hap")).slice(0, 2).join(".");
    if (sinif) p += "." + sinif;
    parcalar.unshift(p);
    n = n.parentElement;
  }
  return parcalar.join(" > ").slice(0, 200);
}

export function RevizeModu() {
  const [acik, setAcik] = useState(false);
  const [kisi, setKisi] = useState<Kisi | null>(null);
  const [notlar, setNotlar] = useState<Not[]>([]);
  const [secilen, setSecilen] = useState<{ bilgi: ReturnType<typeof hedefBilgisi>; x: number; y: number } | null>(null);
  const [liste, setListe] = useState(false);
  const [durum, setDurum] = useState<string | null>(null);
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const vurgulu = useRef<HTMLElement | null>(null);

  // Taslak formu
  const [eylem, setEylem] = useState<Eylem>("degistir");
  const [oncelik, setOncelik] = useState<"yuksek" | "normal">("normal");
  const [metin, setMetin] = useState("");
  const [gorseller, setGorseller] = useState<Gorsel[]>([]);

  useEffect(() => {
    const d = depoOku();
    setKisi(d.kisi);
    setNotlar(d.notlar);
  }, []);

  const kaydet = useCallback((k: Kisi | null, n: Not[]) => {
    try { localStorage.setItem(DEPO, JSON.stringify({ kisi: k, notlar: n })); } catch { /* kota dolu olabilir */ }
  }, []);

  const vurguTemizle = useCallback(() => {
    vurgulu.current?.classList.remove("rv-vurgu");
    vurgulu.current = null;
  }, []);

  /* Dinleyiciler yalnızca mod açıkken bağlanıyor */
  useEffect(() => {
    if (!acik) { vurguTemizle(); return; }

    const uzerinde = (e: MouseEvent) => {
      const h = e.target as HTMLElement | null;
      if (!h || h.closest(KENDI)) return;
      const el = h.closest(SECILEBILIR) as HTMLElement | null;
      if (el === vurgulu.current) return;
      vurguTemizle();
      if (el) { el.classList.add("rv-vurgu"); vurgulu.current = el; }
    };

    const tikla = (e: MouseEvent) => {
      const h = e.target as HTMLElement | null;
      if (!h || h.closest(KENDI)) return;
      const el = h.closest(SECILEBILIR) as HTMLElement | null;
      if (!el) return;
      e.preventDefault();
      e.stopPropagation();
      setSecilen({ bilgi: hedefBilgisi(el), x: e.clientX, y: e.clientY });
      setEylem("degistir"); setOncelik("normal"); setMetin(""); setGorseller([]);
    };

    document.addEventListener("mouseover", uzerinde, true);
    document.addEventListener("click", tikla, true);
    document.body.classList.add("rv-acik");
    return () => {
      document.removeEventListener("mouseover", uzerinde, true);
      document.removeEventListener("click", tikla, true);
      document.body.classList.remove("rv-acik");
      vurguTemizle();
    };
  }, [acik, vurguTemizle]);

  const gorselEkle = useCallback((dosyalar: File[] | FileList) => {
    setGorseller((mevcut) => {
      const kalan = EN_FAZLA_GORSEL - mevcut.length;
      for (const d of [...dosyalar].slice(0, Math.max(0, kalan))) {
        const fr = new FileReader();
        fr.onload = () =>
          setGorseller((g) => [...g, { onizleme: String(fr.result) }].slice(0, EN_FAZLA_GORSEL));
        fr.readAsDataURL(d);
      }
      return mevcut;
    });
  }, []);

  /* Ekran görüntüsünü yapıştırma */
  useEffect(() => {
    if (!secilen) return;
    const yapistir = (e: ClipboardEvent) => {
      const dosyalar = [...(e.clipboardData?.items ?? [])]
        .filter((i) => i.type.startsWith("image/"))
        .map((i) => i.getAsFile())
        .filter(Boolean) as File[];
      if (dosyalar.length) { e.preventDefault(); gorselEkle(dosyalar); }
    };
    document.addEventListener("paste", yapistir);
    return () => document.removeEventListener("paste", yapistir);
  }, [secilen, gorselEkle]);


  function notEkle() {
    if (!secilen) return;
    const yeni: Not = {
      id: Math.random().toString(36).slice(2),
      eylem, oncelik, not: metin.trim(),
      yol: location.pathname + location.search,
      sayfa: document.title.replace(/\s*[|·—].*$/, "").trim() || location.pathname,
      hedef: secilen.bilgi,
      gorseller,
    };
    const sonraki = [...notlar, yeni];
    setNotlar(sonraki); kaydet(kisi, sonraki); setSecilen(null);
  }

  function notSil(id: string) {
    const sonraki = notlar.filter((n) => n.id !== id);
    setNotlar(sonraki); kaydet(kisi, sonraki);
  }

  async function gonder() {
    if (!kisi || !notlar.length) return;
    setGonderiliyor(true); setDurum(null);
    try {
      /* Görseller önce yükleniyor; yüklenemeyen not metinsiz gitmesin diye
         hata yutulmuyor, kullanıcıya söyleniyor. */
      const hazir: Not[] = [];
      for (const n of notlar) {
        const yuklenen: { url: string }[] = [];
        for (const g of n.gorseller) {
          const r = await fetch("/api/revize/gorsel", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: g.onizleme }),
          });
          const j = await r.json();
          if (!r.ok) throw new Error(j.error || "Görsel yüklenemedi");
          yuklenen.push({ url: j.url });
        }
        hazir.push({ ...n, gorseller: yuklenen as unknown as Gorsel[] });
      }

      const r = await fetch("/api/revize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kisi: { ad: kisi.ad, rol: kisi.rol }, notlar: hazir }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Gönderilemedi");
      setNotlar([]); kaydet(kisi, []);
      setDurum(`Gönderildi — ${j.acilan} kayıt açıldı.`);
    } catch (e) {
      setDurum(String((e as Error).message || e));
    } finally {
      setGonderiliyor(false);
    }
  }

  return (
    <div data-revize>
      {/* Açma düğmesi */}
      <button
        type="button"
        className={`rv-fab ${acik ? "rv-fab--acik" : ""}`}
        onClick={() => { setAcik((a) => !a); setSecilen(null); setListe(false); }}
      >
        {acik ? "Revize modu açık" : "Revize modu"}
        {notlar.length ? <span className="rv-rozet">{notlar.length}</span> : null}
      </button>

      {/* Kimlik */}
      {acik && !kisi ? (
        <div className="rv-panel rv-panel--orta">
          <p className="rv-baslik">Kimsiniz?</p>
          <p className="rv-aciklama">Notlarınız sizin adınızla iletilecek.</p>
          <KimlikFormu
            onTamam={(k) => { setKisi(k); kaydet(k, notlar); }}
          />
        </div>
      ) : null}

      {/* Seçilen öğe için not */}
      {acik && kisi && secilen ? (
        <div className="rv-panel rv-panel--orta">
          <p className="rv-baslik">{secilen.bilgi.tur}</p>
          {secilen.bilgi.metin ? <p className="rv-alinti">“{secilen.bilgi.metin}”</p> : null}

          <div className="rv-eylemler">
            {EYLEMLER.map((e) => (
              <button
                key={e.kod}
                type="button"
                className={`rv-sec ${eylem === e.kod ? "rv-sec--aktif" : ""}`}
                onClick={() => setEylem(e.kod)}
              >
                {e.ad}
              </button>
            ))}
          </div>

          <label className="rv-satir">
            <input type="checkbox" checked={oncelik === "yuksek"} onChange={(e) => setOncelik(e.target.checked ? "yuksek" : "normal")} />
            Olmazsa olmaz
          </label>

          <textarea
            className="rv-metin"
            rows={3}
            placeholder="Ne olsun? (isteğe bağlı)"
            value={metin}
            onChange={(e) => setMetin(e.target.value)}
          />

          {gorseller.length ? (
            <div className="rv-gorseller">
              {gorseller.map((g, i) => (
                <span key={i} className="rv-gorsel">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.onizleme} alt="" />
                  <button type="button" onClick={() => setGorseller((x) => x.filter((_, j) => j !== i))}>×</button>
                </span>
              ))}
            </div>
          ) : null}

          {gorseller.length < EN_FAZLA_GORSEL ? (
            <label className="rv-gorsel-ekle">
              Görsel ekle
              <input type="file" accept="image/*" multiple hidden onChange={(e) => { if (e.target.files) gorselEkle(e.target.files); e.target.value = ""; }} />
              <span className="rv-ipucu">ya da ekran görüntüsünü yapıştırın</span>
            </label>
          ) : null}

          <div className="rv-dugmeler">
            <button type="button" className="rv-btn rv-btn--sade" onClick={() => setSecilen(null)}>Vazgeç</button>
            <button type="button" className="rv-btn" onClick={notEkle}>Not ekle</button>
          </div>
        </div>
      ) : null}

      {/* Not listesi */}
      {acik && kisi && !secilen ? (
        <div className="rv-cubuk">
          <span className="rv-cubuk-yazi">
            {notlar.length ? `${notlar.length} not` : "Bir öğeye tıklayın"}
          </span>
          {notlar.length ? (
            <button type="button" className="rv-btn rv-btn--sade" onClick={() => setListe((l) => !l)}>
              {liste ? "Gizle" : "Göster"}
            </button>
          ) : null}
          <button type="button" className="rv-btn" disabled={!notlar.length || gonderiliyor} onClick={gonder}>
            {gonderiliyor ? "Gönderiliyor…" : "Gönder"}
          </button>
        </div>
      ) : null}

      {acik && liste && !secilen ? (
        <div className="rv-panel rv-panel--liste">
          {notlar.map((n) => (
            <div key={n.id} className="rv-kayit">
              <span>
                <b>{EYLEMLER.find((e) => e.kod === n.eylem)?.ad}</b> · {n.sayfa} › {n.hedef.tur}
                {n.not ? <em> — {n.not}</em> : null}
              </span>
              <button type="button" onClick={() => notSil(n.id)}>×</button>
            </div>
          ))}
        </div>
      ) : null}

      {durum ? (
        <div className="rv-durum" onClick={() => setDurum(null)}>{durum}</div>
      ) : null}
    </div>
  );
}

function KimlikFormu({ onTamam }: { onTamam: (k: Kisi) => void }) {
  const [ad, setAd] = useState("");
  const [rol, setRol] = useState("");
  const hazir = ad.trim().length > 1 && rol.trim().length > 1;
  return (
    <>
      <input className="rv-alan" placeholder="Ad soyad" value={ad} onChange={(e) => setAd(e.target.value)} />
      <input className="rv-alan" placeholder="Göreviniz" value={rol} onChange={(e) => setRol(e.target.value)} />
      <div className="rv-dugmeler">
        <button type="button" className="rv-btn" disabled={!hazir} onClick={() => onTamam({ ad: ad.trim(), rol: rol.trim() })}>
          Başla
        </button>
      </div>
    </>
  );
}
