// Arayüzde t("...") / <T k="..."> ile kullanılan her İngilizce metnin
// lib/i18n/es.ts içinde İspanyolca karşılığı var mı? Eksikleri listeler.
//   node scripts/i18n-kontrol.mjs
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const kok = new URL("..", import.meta.url).pathname;
const es = readFileSync(join(kok, "lib/i18n/es.ts"), "utf8");
const sozluk = new Set([...es.matchAll(/^\s*("(?:[^"\\\n]|\\.)*")\s*:/gm)].map((m) => JSON.parse(m[1])));

const kullanilan = new Map();
function tara(dir) {
  for (const ad of readdirSync(dir)) {
    const yol = join(dir, ad);
    if (ad === "node_modules" || ad.startsWith(".") || ad.includes("yedek")) continue;
    if (statSync(yol).isDirectory()) { tara(yol); continue; }
    if (!/\.(tsx?|mjs)$/.test(ad)) continue;
    const kod = readFileSync(yol, "utf8");
    // t(...)/<T k> çağrıları + çalışma anında t(x.label) ile çevrilen yapılandırma metinleri
    const desen = /\bt\(\s*("(?:[^"\\\n]|\\.)*")|<T\s+k=("(?:[^"\\\n]|\\.)*")|\b(?:etiket|ipucu|baslik|ozet|kosul|rozet|metin|cevap|dugme|cevrilecek):\s*("(?:[^"\\\n]|\\.)*")/g;
    const ekDesen = /slick-theme\.ts$/.test(yol) ? /\b(?:label|title):\s*("(?:[^"\\\n]|\\.)*")/g : null;
    const bulunanlar = [...kod.matchAll(desen), ...(ekDesen ? kod.matchAll(ekDesen) : [])];
    for (const m of bulunanlar) {
      let s;
      if (!(m[1] ?? m[2] ?? m[3]) || (m[1] ?? m[2] ?? m[3]) === "\"\"") continue;
      try { s = JSON.parse(m[1] ?? m[2] ?? m[3]); } catch { continue; }
      if (yol.endsWith("i18n/dil.tsx")) continue; // yorumlardaki örnekler
      if (!kullanilan.has(s)) kullanilan.set(s, yol.replace(kok, ""));
    }
  }
}
["app", "components", "lib"].forEach((d) => tara(join(kok, d)));

const eksik = [...kullanilan].filter(([s]) => !sozluk.has(s));
const fazla = [...sozluk].filter((s) => !kullanilan.has(s));
console.log(`kullanılan: ${kullanilan.size}  ·  sözlükte: ${sozluk.size}  ·  eksik: ${eksik.length}`);
for (const [s, f] of eksik) console.log(`  EKSİK  ${JSON.stringify(s)}   (${f})`);
if (fazla.length) console.log(`kullanılmayan çeviri: ${fazla.length}`);
process.exit(eksik.length ? 1 : 0);
