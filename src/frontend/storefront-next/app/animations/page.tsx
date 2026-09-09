"use client";

import { useState } from "react";
import { SprayDefs } from "@/components/slick/spray-defs";
import {
  BuildUp,
  Drips,
  SprayPass,
  Splatter,
  Stencil,
  TagStroke,
} from "@/components/slick/spray-variants";

/**
 * Sprey boya animasyonu denemeleri — seçim yapmak için iç sayfa.
 * Menüde yok, siteden bağlantı verilmiyor.
 */
const DENEMELER = [
  {
    ad: "01 — Spray pass",
    aciklama: "The can travels left to right, spray cone from the nozzle, three overlapping passes reveal the logo. Overspray haze stays behind.",
    Govde: SprayPass,
  },
  {
    ad: "02 — Stencil",
    aciklama: "Paint is sprayed through a stencil, then the card lifts away to reveal the logo.",
    Govde: Stencil,
  },
  {
    ad: "03 — Drips",
    aciklama: "The spray passes, excess paint runs down from the bottom edge, pooling at the tip of each drip.",
    Govde: Drips,
  },
  {
    ad: "04 — Splatter",
    aciklama: "An irregular blot bursts from the centre to reveal the logo, flicking paint specks outward.",
    Govde: Splatter,
  },
  {
    ad: "05 — Tag stroke",
    aciklama: "A single thick red stroke, graffiti style, then the logo steps forward.",
    Govde: TagStroke,
  },
  {
    ad: "06 — Build-up",
    aciklama: "Three quick passes; paint builds with each one until the logo is solid.",
    Govde: BuildUp,
  },
];

export default function AnimationsPage() {
  /** Artınca bileşenler yeniden kurulur, animasyonlar baştan başlar */
  const [tur, setTur] = useState(0);

  return (
    <div className="bg-white">
      <SprayDefs />
      <div
        className="sg-container"
        style={{ paddingTop: "clamp(48px,5vw,80px)", paddingBottom: "clamp(64px,7vw,110px)" }}
      >
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="lx-eyebrow mb-3">Internal preview</p>
            <h1
              className="uppercase"
              style={{
                fontFamily: "var(--font-owners-black)",
                fontWeight: 900,
                fontSize: "clamp(28px,3vw,40px)",
                lineHeight: 1.02,
                color: "var(--lx-ink)",
              }}
            >
              Spray paint animations
            </h1>
            <p className="mt-3 max-w-[64ch] text-[14px]" style={{ color: "rgba(20,17,15,0.6)" }}>
              Six options. The grainy, irregular edges come from SVG turbulence filters — no video,
              no GIF, no library, just the logo file.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setTur((t) => t + 1)}
            className="uppercase tracking-[0.14em]"
            style={{
              minHeight: 46,
              padding: "0 24px",
              background: "var(--sg-red)",
              color: "#fff",
              fontFamily: "var(--font-owners)",
              fontSize: "12px",
            }}
          >
            Replay all
          </button>
        </div>

        <div className="grid gap-x-8 gap-y-12 lg:grid-cols-2">
          {DENEMELER.map(({ ad, aciklama, Govde }) => (
            <div key={ad}>
              <div className="sp-sahne">
                <Govde key={tur} />
              </div>
              <p
                className="mt-4 uppercase"
                style={{ fontFamily: "var(--font-owners-black)", fontSize: "15px", color: "var(--lx-ink)" }}
              >
                {ad}
              </p>
              <p className="mt-1.5 max-w-[52ch] text-[13px]" style={{ color: "rgba(20,17,15,0.6)" }}>
                {aciklama}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
