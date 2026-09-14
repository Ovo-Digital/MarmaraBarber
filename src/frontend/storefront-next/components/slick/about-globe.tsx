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

export function AboutGlobe({ hedef }: { hedef?: [number, number] | null }) {
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

      for (const u of d.ulkeler) {
        const pazar = vurgulu.current.get(String(u.id).padStart(3, "0"));
        ctx.beginPath();
        yol(u as never);
        ctx.fillStyle = pazar ? "rgba(225,6,0,0.82)" : "rgba(255,255,255,0.13)";
        ctx.fill();
        ctx.strokeStyle = pazar ? "rgba(255,120,110,0.9)" : "rgba(255,255,255,0.22)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
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
