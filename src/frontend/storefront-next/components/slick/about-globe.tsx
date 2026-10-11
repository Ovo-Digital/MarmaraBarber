"use client";

/**
 * Sürüklenebilir dünya küresi (About sayfası).
 *
 * d3-geo ile ortografik izdüşüm, <canvas> üzerine çiziliyor. SVG yerine canvas:
 * 177 ülke sınırı her karede yeniden çizildiğinde SVG'de yüzlerce DOM düğümü
 * güncelleniyor ve telefonda takılıyordu.
 *
 * Etkileşim:
 *  - Fareyle / parmakla sürükleyince dönüyor, bırakınca hızını koruyup yavaşlıyor.
 *  - Boştayken kendi kendine yavaşça dönüyor (hareket azaltma tercihi açıksa dönmüyor).
 *  - Vurgulu ülkenin ya da noktanın üzerine gelince adı ve notu çıkıyor.
 *  - `hedef` değişince küre o noktaya yumuşakça dönüyor (yandaki listeden seçim).
 */

import { useEffect, useRef, useState } from "react";
import { geoContains, geoDistance, geoGraticule10, geoOrthographic, geoPath, geoInterpolate } from "d3-geo";
import { feature } from "topojson-client";
import type { FeatureCollection, Geometry } from "geojson";
import { MERKEZLER, PAZARLAR } from "@/lib/about-presence";
import { useT } from "@/lib/i18n/dil";

type Ulke = { id?: string | number; properties: { name: string }; geometry: Geometry; type: "Feature" };

const KIRMIZI = "#e10600";

export function AboutGlobe({
  hedef,
  secili,
  seciliAd,
}: {
  hedef?: [number, number] | null;
  /** Listede seçili olanın kodu (pazar) ya da id'si (merkez) */
  secili?: string | null;
  /** Etikette yazacak ad — çevrilmiş hâliyle sayfadan geliyor */
  seciliAd?: string | null;
}) {
  const t = useT();
  /* useT her render'da yeni fonksiyon döndürüyor. Çizim döngüsü onu ref'ten
     okuyor; yoksa her ipucu değişiminde küre baştan kurulurdu. */
  const tRef = useRef(t);
  tRef.current = t;
  const kutuRef = useRef<HTMLDivElement | null>(null);
  const tuvalRef = useRef<HTMLCanvasElement | null>(null);
  const [ipucu, setIpucu] = useState<{ x: number; y: number; baslik: string; not: string } | null>(null);
  const [hazir, setHazir] = useState(false);

  // Dönüş durumu React state'inde değil ref'te: her karede render tetiklemesin
  const durum = useRef({
    rot: [-30, -25] as [number, number], // [boylam, enlem] — başlangıçta Türkiye önde
    hiz: [0, 0] as [number, number],
    surukleniyor: false,
    son: null as null | { x: number; y: number; zaman: number },
    bosta: 0,
    animasyon: null as null | { bas: [number, number]; son: [number, number]; baslangic: number },
    ulkeler: [] as Ulke[],
  });

  // Vurgulu ülke kodları hızlı arama için
  const vurgulu = useRef(new Map(PAZARLAR.map((p) => [p.kod, p])));

  /* Çizim döngüsü seçimi ref'ten okuyor; state'e bağlasak her seçimde
     küre baştan kurulur, dönüş animasyonu kesilirdi. */
  const seciliRef = useRef<string | null>(null);
  seciliRef.current = secili ?? null;
  const hedefRef = useRef<[number, number] | null>(null);
  hedefRef.current = hedef ?? null;
  const adRef = useRef<string | null>(null);
  adRef.current = seciliAd ?? null;
  /* Seçimin ne zaman değiştiği: halkalar ve logo o andan itibaren açılıyor */
  const secimAni = useRef(0);

  /* Marka logosu beyaza boyanmış hâlde bir kez hazırlanıyor.
     Dosya siyah çizim; her karede filtre uygulamak pahalı, bu yüzden
     tek seferlik ayrı bir tuvale beyaz olarak basılıyor. */
  const logo = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const img = new Image();
    img.src = "/brand/marmara-logo.png";
    img.onload = () => {
      const en = 180;
      const boy = Math.round((img.height / img.width) * en);
      const c = document.createElement("canvas");
      c.width = en;
      c.height = boy;
      const x = c.getContext("2d");
      if (!x) return;
      x.drawImage(img, 0, 0, en, boy);
      x.globalCompositeOperation = "source-in";
      x.fillStyle = "#ffffff";
      x.fillRect(0, 0, en, boy);
      logo.current = c;
    };
  }, []);

  // Harita verisi: ~100 KB, sayfa ilk açılışında değil küre görünümde yükleniyor
  useEffect(() => {
    let iptal = false;
    import("world-atlas/countries-110m.json").then((mod) => {
      if (iptal) return;
      const topo = (mod as unknown as { default: Parameters<typeof feature>[0] }).default ?? mod;
      const fc = feature(topo as never, (topo as never as { objects: { countries: never } }).objects.countries) as unknown as FeatureCollection;
      durum.current.ulkeler = fc.features as unknown as Ulke[];
      setHazir(true);
    });
    return () => {
      iptal = true;
    };
  }, []);

  useEffect(() => {
    secimAni.current = performance.now();
  }, [secili]);

  // Listeden seçilen noktaya dön
  useEffect(() => {
    if (!hedef) return;
    const d = durum.current;
    d.animasyon = { bas: [...d.rot], son: [-hedef[0], -hedef[1] * 0.85], baslangic: performance.now() };
    d.hiz = [0, 0];
  }, [hedef]);

  useEffect(() => {
    const tuval = tuvalRef.current;
    const kutu = kutuRef.current;
    if (!tuval || !kutu || !hazir) return;
    const ctx = tuval.getContext("2d");
    if (!ctx) return;

    const hareketAz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const projeksiyon = geoOrthographic().clipAngle(90).precision(0.5);
    const yol = geoPath(projeksiyon, ctx);
    const izgara = geoGraticule10();
    let boyut = 0;
    let dpr = 1;

    const olc = () => {
      const r = kutu.getBoundingClientRect();
      boyut = Math.min(r.width, 640);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      tuval.width = boyut * dpr;
      tuval.height = boyut * dpr;
      tuval.style.width = `${boyut}px`;
      tuval.style.height = `${boyut}px`;
      projeksiyon.scale(boyut / 2 - 6).translate([boyut / 2, boyut / 2]);
    };
    olc();
    const gozcu = new ResizeObserver(olc);
    gozcu.observe(kutu);

    let kare = 0;
    const d = durum.current;

    const ciz = (zaman: number) => {
      // Dönüş: animasyon > sürükleme hızı (sönümlü) > kendi kendine dönüş
      if (d.animasyon) {
        const k = Math.min(1, (zaman - d.animasyon.baslangic) / 1100);
        const e = 1 - Math.pow(1 - k, 3);
        const ara = geoInterpolate(
          [-d.animasyon.bas[0], -d.animasyon.bas[1]],
          [-d.animasyon.son[0], -d.animasyon.son[1]],
        )(e);
        d.rot = [-ara[0], -ara[1]];
        if (k >= 1) {
          d.animasyon = null;
          d.bosta = zaman + 2500;
        }
      } else if (!d.surukleniyor) {
        if (Math.abs(d.hiz[0]) > 0.01 || Math.abs(d.hiz[1]) > 0.01) {
          d.rot = [d.rot[0] + d.hiz[0], Math.max(-70, Math.min(70, d.rot[1] + d.hiz[1]))];
          d.hiz = [d.hiz[0] * 0.94, d.hiz[1] * 0.94];
        } else if (!hareketAz && zaman > d.bosta) {
          d.rot = [d.rot[0] + 0.12, d.rot[1]];
        }
      }
      projeksiyon.rotate([d.rot[0], d.rot[1]]);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, boyut, boyut);

      // Kürenin gövdesi: kenara doğru hafif koyulaşan zemin
      const merkez = boyut / 2;
      const yaricap = projeksiyon.scale();
      const zemin = ctx.createRadialGradient(merkez - yaricap * 0.35, merkez - yaricap * 0.4, yaricap * 0.1, merkez, merkez, yaricap);
      zemin.addColorStop(0, "#2a2522");
      zemin.addColorStop(1, "#0f0d0c");
      ctx.beginPath();
      yol({ type: "Sphere" });
      ctx.fillStyle = zemin;
      ctx.fill();

      ctx.beginPath();
      yol(izgara);
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 0.6;
      ctx.stroke();

      const sec = seciliRef.current;
      let seciliUlke: Ulke | null = null;
      for (const u of d.ulkeler) {
        const kod = String(u.id).padStart(3, "0");
        const pazar = vurgulu.current.get(kod);
        const secildi = Boolean(sec) && kod === sec;
        if (secildi) seciliUlke = u;
        ctx.beginPath();
        yol(u as never);
        ctx.fillStyle = secildi
          ? "rgba(255,52,38,0.95)"
          : pazar
            ? "rgba(225,6,0,0.82)"
            : "rgba(255,255,255,0.13)";
        ctx.fill();
        /* Seçili ülkenin çevresi kalın beyaz: hangi ülke olduğu kürenin
           uzağından da okunsun. */
        ctx.strokeStyle = secildi
          ? "rgba(255,255,255,0.95)"
          : pazar
            ? "rgba(255,120,110,0.9)"
            : "rgba(255,255,255,0.22)";
        ctx.lineWidth = secildi ? 1.8 : 0.5;
        ctx.stroke();
      }

      /* Seçili ülkenin etrafında ışıma. Ayrı bir geçişte çiziliyor çünkü
         gölge ayarı açıkken bütün ülkeleri çizmek her karede pahalı. */
      if (seciliUlke) {
        const nabiz = (Math.sin(zaman / 520) + 1) / 2;
        ctx.save();
        ctx.shadowColor = "rgba(255,70,55,0.95)";
        ctx.shadowBlur = 18 + nabiz * 16;
        ctx.beginPath();
        yol(seciliUlke as never);
        ctx.strokeStyle = "rgba(255,255,255,0.95)";
        ctx.lineWidth = 1.8;
        /* Aynı yol üst üste çizilince hale güçleniyor */
        ctx.stroke();
        ctx.stroke();
        ctx.restore();
      }

      // Kenar parıltısı
      ctx.beginPath();
      yol({ type: "Sphere" });
      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Merkez ve üretim noktaları — görünen yüzdeyse nabız gibi atıyor
      const onYuz: [number, number] = [-d.rot[0], -d.rot[1]];
      for (const m of MERKEZLER) {
        if (geoDistance(m.koordinat, onYuz) > Math.PI / 2 - 0.05) continue;
        const p = projeksiyon(m.koordinat);
        if (!p) continue;
        const nabiz = (Math.sin(zaman / 420 + (m.id === "hq" ? 0 : 1.6)) + 1) / 2;
        ctx.beginPath();
        ctx.arc(p[0], p[1], 6 + nabiz * 9, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.22 * (1 - nabiz)})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p[0], p[1], 4.5, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = KIRMIZI;
        ctx.stroke();
      }

      /* Seçili yerin üstünde: açılan halkalar + marka logosu.
         Nokta kürenin arka yüzündeyse hiç çizilmiyor, yoksa logo
         dünyanın öbür tarafında havada duruyormuş gibi görünürdü. */
      const nokta = hedefRef.current;
      if (nokta && geoDistance(nokta, onYuz) < Math.PI / 2 - 0.05) {
        const p = projeksiyon(nokta);
        if (p) {
          /* Seçim anı bir efektte yazılıyor, bu kare ondan önce
             zamanlanmış olabiliyor; eksiye düşerse yarıçap negatif
             çıkıp çizim hata veriyordu. Sıfırın altına indirmiyoruz. */
          const gecen = Math.max(0, (zaman - secimAni.current) / 1000);
          const giris = Math.max(0, Math.min(1, gecen / 0.5)); // 0→1 yarım saniyede

          // Küçük işaret noktası — vurgu artık ülkenin etrafındaki ışımada
          ctx.beginPath();
          ctx.arc(p[0], p[1], 5 * giris, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = KIRMIZI;
          ctx.stroke();

          /* Etiket: solda daire içinde logo, sağında yer adı — hap biçiminde.
             Ülkenin ÜST kenarının üzerinde duruyor; sabit yükseklik
             verilince Avustralya gibi büyük ülkelerde ortaya düşüp
             okunmuyordu, bu yüzden sınırı ölçüp üstüne koyuyoruz. */
          const l = logo.current;
          const ad = (adRef.current ?? "").toLocaleUpperCase("tr");
          if (l && ad) {
            /* Hap yüksekliği: marka işareti yazı biçiminde olduğu için
               küçük dairede okunmuyor, bu yüzden Kozabiat'takinden biraz
               daha iri tutuluyor. */
            const h = Math.max(44, Math.min(58, boyut * 0.125));
            const dolgu = h * 0.13;
            const cap = h - dolgu * 2;
            const bosluk = h * 0.28;
            ctx.font = `900 ${Math.round(h * 0.38)}px "Owners Narrow Black", "Owners", sans-serif`;
            ctx.textBaseline = "middle";
            const yazi = ctx.measureText(ad).width;
            const en = dolgu + cap + bosluk + yazi + h * 0.46;

            /* Etiket ülkenin üst kenarının hemen üstünde durur.
               AMA sınır kutusu yanıltıcı olabiliyor: ABD'de Alaska yüzünden
               kutunun tepesi çok yukarıda kalıyor ve etiket kürenin tepesine
               fırlıyordu. Bu yüzden işaretten yukarı çıkabileceği mesafe
               bir hap boyu civarıyla sınırlı. */
            const sinir = seciliUlke ? yol.bounds(seciliUlke as never) : null;
            const enYukari = p[1] - h * 1.3;
            const ustY = sinir ? Math.max(Math.min(sinir[0][1], p[1]), enYukari) : p[1] - h * 0.6;
            const hedefY = ustY - 14 - h;
            const ly = p[1] + (hedefY - p[1]) * giris;
            const lx = p[0] - en / 2;

            // Noktadan etikete ince çizgi
            ctx.beginPath();
            ctx.moveTo(p[0], p[1] - 7);
            ctx.lineTo(p[0], ly + h + 7);
            ctx.strokeStyle = `rgba(255,255,255,${0.4 * giris})`;
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.globalAlpha = giris;

            // Hap gövdesi
            ctx.beginPath();
            if (typeof ctx.roundRect === "function") ctx.roundRect(lx, ly, en, h, h / 2);
            else ctx.rect(lx, ly, en, h);
            ctx.fillStyle = "rgba(10,9,8,0.92)";
            ctx.fill();
            ctx.strokeStyle = "rgba(255,255,255,0.3)";
            ctx.lineWidth = 1.2;
            ctx.stroke();

            // Hapın altında aşağı bakan küçük kuyruk — hangi yere ait olduğu belli olsun
            const ku = h * 0.22;
            ctx.beginPath();
            ctx.moveTo(p[0] - ku, ly + h - 1);
            ctx.lineTo(p[0] + ku, ly + h - 1);
            ctx.lineTo(p[0], ly + h + ku * 1.1);
            ctx.closePath();
            ctx.fillStyle = "rgba(10,9,8,0.92)";
            ctx.fill();
            ctx.strokeStyle = "rgba(255,255,255,0.3)";
            ctx.lineWidth = 1.2;
            ctx.stroke();
            /* Kuyruğun hapla birleştiği yerdeki çizgiyi kapat */
            ctx.beginPath();
            ctx.moveTo(p[0] - ku + 1, ly + h - 1);
            ctx.lineTo(p[0] + ku - 1, ly + h - 1);
            ctx.strokeStyle = "rgba(10,9,8,0.92)";
            ctx.lineWidth = 2;
            ctx.stroke();

            // Soldaki daire + içinde logo
            const cx = lx + dolgu + cap / 2;
            const cy = ly + h / 2;
            ctx.beginPath();
            ctx.arc(cx, cy, cap / 2, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255,255,255,0.08)";
            ctx.fill();
            ctx.strokeStyle = "rgba(255,255,255,0.22)";
            ctx.lineWidth = 1;
            ctx.stroke();

            const lw = cap * 0.9;
            const lh = (l.height / l.width) * lw;
            ctx.drawImage(l, cx - lw / 2, cy - lh / 2, lw, lh);

            // Yer adı
            ctx.fillStyle = "#ffffff";
            ctx.fillText(ad, lx + dolgu + cap + bosluk, cy + 1);

            ctx.globalAlpha = 1;
          }
        }
      }

      kare = requestAnimationFrame(ciz);
    };
    kare = requestAnimationFrame(ciz);

    // ── İmleç / parmak ─────────────────────────────────────────────────
    const konum = (e: PointerEvent) => {
      const r = tuval.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    const bas = (e: PointerEvent) => {
      d.surukleniyor = true;
      d.animasyon = null;
      d.son = { ...konum(e), zaman: performance.now() };
      d.hiz = [0, 0];
      tuval.setPointerCapture(e.pointerId);
      setIpucu(null);
    };

    const oynat = (e: PointerEvent) => {
      const k = konum(e);
      if (d.surukleniyor && d.son) {
        // Kürenin yarıçapına göre ölçekle: küçük kürede de aynı hissettirsin
        const olcek = 180 / (Math.PI * projeksiyon.scale());
        const dx = (k.x - d.son.x) * olcek * 2.2;
        const dy = (k.y - d.son.y) * olcek * 2.2;
        d.rot = [d.rot[0] + dx, Math.max(-70, Math.min(70, d.rot[1] - dy))];
        d.hiz = [dx, -dy];
        d.son = { ...k, zaman: performance.now() };
        return;
      }
      if (e.pointerType !== "mouse") return;

      // Üzerine gelinen yeri bul: önce noktalar, sonra vurgulu ülkeler
      const yer = projeksiyon.invert?.([k.x, k.y]);
      const kureUstunde = Math.hypot(k.x - boyut / 2, k.y - boyut / 2) <= projeksiyon.scale();
      if (!yer || !kureUstunde) {
        setIpucu(null);
        return;
      }
      for (const m of MERKEZLER) {
        const p = projeksiyon(m.koordinat);
        if (p && Math.hypot(p[0] - k.x, p[1] - k.y) < 12 && geoDistance(m.koordinat, [-d.rot[0], -d.rot[1]]) < Math.PI / 2) {
          setIpucu({ x: k.x, y: k.y, baslik: m.sehir, not: tRef.current(m.rol) });
          return;
        }
      }
      for (const u of d.ulkeler) {
        const pazar = vurgulu.current.get(String(u.id).padStart(3, "0"));
        if (pazar && geoContains(u as never, yer)) {
          setIpucu({ x: k.x, y: k.y, baslik: tRef.current(pazar.ulke), not: tRef.current(pazar.not) });
          return;
        }
      }
      setIpucu(null);
    };

    const birak = (e: PointerEvent) => {
      d.surukleniyor = false;
      d.bosta = performance.now() + 2500;
      if (tuval.hasPointerCapture(e.pointerId)) tuval.releasePointerCapture(e.pointerId);
    };

    tuval.addEventListener("pointerdown", bas);
    tuval.addEventListener("pointermove", oynat);
    tuval.addEventListener("pointerup", birak);
    tuval.addEventListener("pointercancel", birak);
    const cik = () => setIpucu(null);
    tuval.addEventListener("pointerleave", cik);

    return () => {
      cancelAnimationFrame(kare);
      gozcu.disconnect();
      tuval.removeEventListener("pointerdown", bas);
      tuval.removeEventListener("pointermove", oynat);
      tuval.removeEventListener("pointerup", birak);
      tuval.removeEventListener("pointercancel", birak);
      tuval.removeEventListener("pointerleave", cik);
    };
  }, [hazir]);

  return (
    <div ref={kutuRef} className="relative mx-auto aspect-square w-full max-w-[640px]">
      {!hazir ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="lx-yukleniyor-cubuk" aria-hidden="true" />
        </div>
      ) : null}
      <canvas
        ref={tuvalRef}
        className="lx-kure mx-auto block touch-none"
        role="img"
        aria-label={t("Interactive globe showing where Marmara Barber is based and sold")}
      />
      {ipucu ? (
        <div
          className="pointer-events-none absolute z-10 whitespace-nowrap px-3 py-2"
          style={{
            left: ipucu.x + 14,
            top: ipucu.y + 14,
            background: "rgba(16,14,13,0.94)",
            border: "1px solid rgba(255,255,255,0.14)",
            color: "#fff",
          }}
        >
          <span className="block uppercase" style={{ fontFamily: "var(--font-owners-black)", fontSize: 14 }}>
            {ipucu.baslik}
          </span>
          <span className="block text-[11px] uppercase tracking-[0.12em]" style={{ color: "rgba(255,255,255,0.6)" }}>
            {ipucu.not}
          </span>
        </div>
      ) : null}
    </div>
  );
}
