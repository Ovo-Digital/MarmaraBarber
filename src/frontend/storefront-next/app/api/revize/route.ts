/**
 * Revize Modu'ndan gelen notları GitHub issue olarak yazar.
 *
 * Ortam değişkenleri:
 *   GITHUB_TOKEN  (zorunlu) — yalnızca revize reposuna Issues + Contents yazma izni
 *   REVIZE_REPO   (ops.)    — "kullanici/repo"
 *
 * Token yoksa uç nokta 503 döner ve arayüz "gönderilemedi" der; sessizce
 * başarılı görünmez.
 */

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REPO = process.env.REVIZE_REPO || "volkankockan-ovo/marmara-b2c-revizeler";

const EYLEM = {
  kalsin: { etiket: null, baslik: "Kalsın", metin: "Kalsın" },
  kaldir: { etiket: "kaldir", baslik: "Kaldır", metin: "Kaldırılsın" },
  degistir: { etiket: "degistir", baslik: "Değiştir", metin: "Değiştirilsin" },
  ekle: { etiket: "ekle", baslik: "Ekle", metin: "Buraya eklensin" },
} as const;

type EylemKodu = keyof typeof EYLEM;

type Not = {
  id: string;
  eylem: EylemKodu;
  oncelik?: "yuksek" | "normal";
  not?: string;
  yol?: string;
  sayfa?: string;
  hedef?: { tur?: string; metin?: string; secici?: string };
  gorseller?: { url?: string }[];
};

/** Serbest yazılan rolden bölüm etiketi çıkar */
function bolum(rol = ""): string {
  const r = rol.toLocaleLowerCase("tr");
  if (/satış|satis|sales|export|ihracat/.test(r)) return "satis";
  if (/pazarlama|marketing|reklam|sosyal/.test(r)) return "pazarlama";
  if (/tasarım|tasarim|design|grafik/.test(r)) return "tasarim";
  if (/yazılım|yazilim|developer|geliştirici|gelistirici/.test(r)) return "yazilim";
  if (/yönetim|yonetim|müdür|mudur|genel|ceo|kurucu|sahip|direkt/.test(r)) return "yonetim";
  return "diger";
}

/* Kullanıcı metni issue gövdesine giriyor: @ ile kimse etiketlenmesin,
   markdown bozulmasın, uzunluk sınırlı kalsın. */
const temiz = (s = "", max = 2000) =>
  String(s).replace(/@/g, "@​").replace(/\r/g, "").slice(0, max).trim();
const alinti = (s: string) => temiz(s).split("\n").map((l) => "> " + l).join("\n");
/* Yalnızca kendi yüklediğimiz GitHub adresleri gömülür */
const gorselMd = (liste: { url?: string }[] = []) =>
  liste
    .filter((x) => x?.url && /^https:\/\/github\.com\//.test(x.url))
    .map((x, i) => `![görsel ${i + 1}](${x.url})`)
    .join("\n");

export async function POST(req: Request) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "Sunucuda GITHUB_TOKEN tanımlı değil." }, { status: 503 });
  }

  let govde: { kisi?: { ad?: string; rol?: string }; notlar?: Not[] } | null = null;
  try {
    govde = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz veri." }, { status: 400 });
  }
  if (!govde || JSON.stringify(govde).length > 300_000) {
    return NextResponse.json({ error: "Geçersiz veri." }, { status: 400 });
  }

  const kim = temiz(govde.kisi?.ad, 80);
  const rol = temiz(govde.kisi?.rol, 60);
  const notlar = Array.isArray(govde.notlar) ? govde.notlar : [];
  if (!kim) return NextResponse.json({ error: "İsim zorunlu." }, { status: 400 });
  if (!notlar.length) return NextResponse.json({ error: "Gönderilecek not yok." }, { status: 400 });

  const bolumEtiketi = bolum(rol);
  const zaman = new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });

  const gh = async (yol: string, veri: unknown) => {
    const r = await fetch(`https://api.github.com/repos/${REPO}${yol}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "marmara-b2c-revize",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(veri),
    });
    if (!r.ok) throw new Error(`GitHub ${r.status}: ${(await r.text()).slice(0, 200)}`);
    return (await r.json()) as { number: number };
  };

  /* "Kalsın" dışındakiler ayrı issue olur; kalsın notları özet issue'da kalır. */
  const issuelar = notlar
    .filter((n) => EYLEM[n.eylem]?.etiket)
    .map((n) => {
      const e = EYLEM[n.eylem] ?? EYLEM.degistir;
      const hedefMetin = n.hedef?.metin ? ` — "${temiz(n.hedef.metin, 40)}"` : "";
      return {
        title: `[${e.baslik}] ${temiz(n.sayfa, 60)} › ${temiz(n.hedef?.tur, 50)}${hedefMetin}`,
        labels: [e.etiket as string, bolumEtiketi, ...(n.oncelik === "yuksek" ? ["oncelik-yuksek"] : [])],
        body: [
          `**Sayfa:** ${temiz(n.sayfa, 100)} — \`${temiz(n.yol, 120)}\``,
          `**Öğe:** ${temiz(n.hedef?.tur, 40)}${n.hedef?.metin ? ` · metin: "${temiz(n.hedef.metin, 160)}"` : ""}`,
          `**İstek:** ${e.metin}`,
          `**Öncelik:** ${n.oncelik === "yuksek" ? "Olmazsa olmaz" : "Olsa iyi olur"}`,
          n.not ? `**Not:**\n${alinti(n.not)}` : "**Not:** —",
          n.gorseller?.length ? `**Görseller:**\n${gorselMd(n.gorseller)}` : "",
          `**Kimden:** ${kim} (${rol || "—"}) · ${zaman}`,
          `<sub>seçici: \`${temiz(n.hedef?.secici, 200)}\`</sub>`,
        ]
          .filter(Boolean)
          .join("\n\n"),
      };
    });

  const kalsin = notlar.filter((n) => n.eylem === "kalsin");
  const ozet = [
    `**Kimden:** ${kim} (${rol || "—"}) · ${zaman}`,
    `**Toplam:** ${notlar.length} not · ${issuelar.length} aksiyon · ${kalsin.length} "kalsın"`,
    kalsin.length
      ? `### Kalsın dedikleri\n${kalsin
          .map(
            (n) =>
              `- ${temiz(n.sayfa, 60)} › ${temiz(n.hedef?.tur, 60)}${
                n.hedef?.metin ? ` — "${temiz(n.hedef.metin, 40)}"` : ""
              }${n.not ? ` — _${temiz(n.not, 200)}_` : ""}`,
          )
          .join("\n")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  try {
    const o = await gh("/issues", {
      title: `Revize gönderimi — ${kim} (${rol || "—"}) — ${zaman}`,
      labels: ["ozet", bolumEtiketi],
      body: ozet,
    });
    let acilan = 0;
    for (const i of issuelar) {
      await gh("/issues", { ...i, body: `${i.body}\n\n_Özet: #${o.number}_` });
      acilan++;
    }
    return NextResponse.json({ ok: true, ozet: o.number, acilan });
  } catch (e) {
    return NextResponse.json({ error: String((e as Error).message || e) }, { status: 502 });
  }
}
