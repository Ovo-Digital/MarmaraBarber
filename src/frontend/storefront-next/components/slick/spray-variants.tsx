/**
 * Sprey boya denemeleri.
 *
 * Ortak yapı: bir SVG maskesi boyanın nereye değdiğini belirliyor, logo o
 * maskeden geçiyor. Maske şekli türbülans filtresiyle bozulduğu için kenar
 * boya gibi düzensiz ve taneli çıkıyor.
 */

const G = 600; // görüş alanı genişliği
const Y = 260; // görüş alanı yüksekliği

function Logo({ maske, sinif }: { maske?: string; sinif?: string }) {
  return (
    <image
      href="/brand/marmara-logo.png"
      x={G / 2 - 150}
      y={Y / 2 - 100}
      width={300}
      height={200}
      preserveAspectRatio="xMidYMid meet"
      className={`sp-logo ${sinif ?? ""}`}
      mask={maske}
    />
  );
}

function Kutu() {
  return (
    <g className="sp-kutu">
      {/* Sprey kutusu */}
      <rect x="20" y="96" width="30" height="62" rx="6" fill="#e10600" />
      <rect x="28" y="82" width="14" height="14" rx="3" fill="#f2f2f2" />
      <rect x="26" y="74" width="18" height="9" rx="4" fill="#d8d8d8" />
      <rect x="24" y="116" width="22" height="14" rx="2" fill="#fff" opacity=".9" />
      {/* Nozuldan çıkan koni */}
      <g className="sp-koni" transform="translate(50 88)">
        <path d="M0,0 L74,-30 L74,30 Z" fill="url(#sp-koni-gr)" filter="url(#sp-sis-f)" />
      </g>
    </g>
  );
}

function KoniGradyani() {
  return (
    <defs>
      <linearGradient id="sp-koni-gr" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#fff" stopOpacity=".95" />
        <stop offset="1" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
    </defs>
  );
}

/* ── 01 · Sprey darbesi ─────────────────────────────────────────────────── */
export function SprayPass() {
  return (
    <svg className="sp-svg" viewBox={`0 0 ${G} ${Y}`} aria-hidden="true">
      <KoniGradyani />
      <mask id="m-pass" maskUnits="userSpaceOnUse" x="0" y="0" width={G} height={Y}>
        <g filter="url(#sp-taneli)">
          {/* Dört darbe: birleşiminin logo kutusunu (y 30-230) tamamen örtmesi gerekiyor */}
          <path className="sp-cizgi" d={`M40,66 H${G - 40}`} stroke="#fff" strokeWidth="70" strokeLinecap="round" fill="none" pathLength={100} />
          <path className="sp-cizgi sp-cizgi--2" d={`M40,110 H${G - 40}`} stroke="#fff" strokeWidth="70" strokeLinecap="round" fill="none" pathLength={100} />
          <path className="sp-cizgi sp-cizgi--3" d={`M40,154 H${G - 40}`} stroke="#fff" strokeWidth="70" strokeLinecap="round" fill="none" pathLength={100} />
          <path className="sp-cizgi sp-cizgi--4" d={`M40,196 H${G - 40}`} stroke="#fff" strokeWidth="72" strokeLinecap="round" fill="none" pathLength={100} />
        </g>
      </mask>

      {/* Overspray izi — logonun arkasında hafif bir sis bırakıyor */}
      <g className="sp-sis" filter="url(#sp-sis-f)" opacity=".2">
        <rect x="60" y="70" width={G - 120} height="120" fill="#fff" opacity=".35" rx="40" />
      </g>

      <Logo maske="url(#m-pass)" />
      <Kutu />
    </svg>
  );
}

/* ── 02 · Şablon ────────────────────────────────────────────────────────── */
export function Stencil() {
  return (
    <svg className="sp-svg" viewBox={`0 0 ${G} ${Y}`} aria-hidden="true">
      <mask id="m-stencil" maskUnits="userSpaceOnUse" x="0" y="0" width={G} height={Y}>
        <g filter="url(#sp-taneli)">
          <path className="sp-cizgi" d={`M70,84 H${G - 70}`} stroke="#fff" strokeWidth="96" strokeLinecap="round" fill="none" pathLength={100} />
          <path className="sp-cizgi sp-cizgi--2" d={`M70,140 H${G - 70}`} stroke="#fff" strokeWidth="96" strokeLinecap="round" fill="none" pathLength={100} />
          <path className="sp-cizgi sp-cizgi--3" d={`M70,192 H${G - 70}`} stroke="#fff" strokeWidth="96" strokeLinecap="round" fill="none" pathLength={100} />
        </g>
      </mask>

      <Logo maske="url(#m-stencil)" />

      {/* Şablon kartonu: boyandıktan sonra yukarı kalkıyor */}
      <g className="sp-sablon-kalk">
        <rect x="0" y="0" width={G} height="52" fill="#151312" />
        <rect x="0" y={Y - 52} width={G} height="52" fill="#151312" />
        <rect x="0" y="0" width="46" height={Y} fill="#151312" />
        <rect x={G - 46} y="0" width="46" height={Y} fill="#151312" />
        <rect x="46" y="52" width={G - 92} height={Y - 104} fill="none" stroke="rgba(255,255,255,.16)" strokeWidth="2" />
      </g>
    </svg>
  );
}

/* ── 03 · Damlalar ──────────────────────────────────────────────────────── */
export function Drips() {
  const damlalar = [
    { x: 196, u: 46, g: 5, s: 260 },
    { x: 248, u: 74, g: 4, s: 420 },
    { x: 322, u: 58, g: 6, s: 340 },
    { x: 378, u: 88, g: 4, s: 520 },
    { x: 296, u: 34, g: 3, s: 620 },
  ];
  return (
    <svg className="sp-svg" viewBox={`0 0 ${G} ${Y}`} aria-hidden="true">
      <mask id="m-drip" maskUnits="userSpaceOnUse" x="0" y="0" width={G} height={Y}>
        <g filter="url(#sp-taneli)">
          <path className="sp-cizgi" d={`M50,74 H${G - 50}`} stroke="#fff" strokeWidth="84" strokeLinecap="round" fill="none" pathLength={100} />
          <path className="sp-cizgi sp-cizgi--2" d={`M50,128 H${G - 50}`} stroke="#fff" strokeWidth="84" strokeLinecap="round" fill="none" pathLength={100} />
          <path className="sp-cizgi sp-cizgi--3" d={`M50,184 H${G - 50}`} stroke="#fff" strokeWidth="86" strokeLinecap="round" fill="none" pathLength={100} />
        </g>
      </mask>

      <Logo maske="url(#m-drip)" />

      {/* Boyanın alt kenarından akan damlalar */}
      <g filter="url(#sp-kaba-ince)">
        {damlalar.map((d) => (
          <g key={d.x} className="sp-damla" style={{ animationDelay: `${d.s}ms` }}>
            <rect x={d.x} y={176} width={d.g} height={d.u} fill="#fff" opacity=".85" rx={d.g / 2} />
            <circle cx={d.x + d.g / 2} cy={176 + d.u} r={d.g * 1.1} fill="#fff" opacity=".85" />
          </g>
        ))}
      </g>
    </svg>
  );
}

/* ── 04 · Patlama ───────────────────────────────────────────────────────── */
export function Splatter() {
  const zerreler = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    const uz = 120 + ((i * 37) % 70);
    return { x: Math.cos(a) * uz, y: Math.sin(a) * uz * 0.6, r: 2 + ((i * 13) % 5), s: (i % 6) * 55 };
  });
  return (
    <svg className="sp-svg" viewBox={`0 0 ${G} ${Y}`} aria-hidden="true">
      <mask id="m-splat" maskUnits="userSpaceOnUse" x="0" y="0" width={G} height={Y}>
        <g filter="url(#sp-taneli)">
          <ellipse className="sp-patla" cx={G / 2} cy={Y / 2} rx="215" ry="115" fill="#fff" />
        </g>
      </mask>

      <Logo maske="url(#m-splat)" />

      <g filter="url(#sp-kaba-ince)">
        {zerreler.map((z, i) => (
          <circle
            key={i}
            className="sp-sacil"
            cx={G / 2}
            cy={Y / 2}
            r={z.r}
            fill="#fff"
            style={{ ["--x" as string]: `${z.x}px`, ["--y" as string]: `${z.y}px`, animationDelay: `${z.s}ms` }}
          />
        ))}
      </g>
    </svg>
  );
}

/* ── 05 · Etiket darbesi ────────────────────────────────────────────────── */
export function TagStroke() {
  return (
    <svg className="sp-svg" viewBox={`0 0 ${G} ${Y}`} aria-hidden="true">
      <g filter="url(#sp-taneli)">
        <path
          className="sp-cizgi"
          d={`M30,200 C170,60 430,206 ${G - 30},58`}
          stroke="var(--sg-red)"
          strokeWidth="54"
          strokeLinecap="round"
          fill="none"
          pathLength={100}
        />
      </g>
      <g className="sp-cik">
        <Logo />
      </g>
    </svg>
  );
}

/* ── 06 · Kat kat sprey ─────────────────────────────────────────────────── */
export function BuildUp() {
  return (
    <svg className="sp-svg" viewBox={`0 0 ${G} ${Y}`} aria-hidden="true">
      <KoniGradyani />
      {[1, 2, 3].map((k) => (
        <mask key={k} id={`m-kat-${k}`} maskUnits="userSpaceOnUse" x="0" y="0" width={G} height={Y}>
          <g filter="url(#sp-taneli)">
            {/* Çalışan denemelerdeki düzenin aynısı: birden fazla orta kalınlıkta
                darbe. Tek bir çok kalın çizgide filtre çıktısı boş kalıyordu. */}
            {[64, 108, 152, 196].map((yy, i) => (
              <path
                key={yy}
                d={`M${44 + k * 3},${yy + (k - 2) * 3} H${G - 44 - k * 3}`}
                stroke="#fff"
                strokeWidth={72 + i}
                strokeLinecap="round"
                fill="none"
              />
            ))}
          </g>
        </mask>
      ))}
      {/* Her geçiş bir katman ekliyor: boya koyulaşarak birikiyor */}
      <g className="sp-kat-1" opacity=".38">
        <Logo maske="url(#m-kat-1)" />
      </g>
      <g className="sp-kat-2" opacity=".62">
        <Logo maske="url(#m-kat-2)" />
      </g>
      <g className="sp-kat-3">
        <Logo maske="url(#m-kat-3)" />
      </g>
    </svg>
  );
}
