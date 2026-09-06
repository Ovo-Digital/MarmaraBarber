# Marmara Barber — Proje Kuralları

## Bu proje ne?
Marmara Barber için **headless** Shopify vitrini. Next.js 15 (App Router) + Shopify
Storefront API. Çalışılan klasör: `src/frontend/storefront-next`.

## İki hedefi var (ikisi de aynı kod tabanından)
1. **ABD distribütörüne devir** — aynı marka, aynı ürünler, farklı Shopify mağazası.
   Onlar kendi belirteçlerini `.env` dosyasına yazacak, site onların ürünlerini gösterecek.
2. **Marmara Barber TR B2C** — mevcut Shopify mağazasına bağlı yeni tasarım.

## EN ÖNEMLİ KURAL: mağazaya özel hiçbir şey kodda sabit olmayacak
Ürün, fiyat, stok, koleksiyon, para birimi — hepsi Storefront API'den gelmeli.
Kodda ürün adı/handle/fiyat/tag sabitlemek devri bozar.
`data/marmara/catalog.json` 2026-08-01 tarihli donmuş bir snapshot; hedef onu tamamen
devreden çıkarmak.

## Mimari kararlar
- **Liquid/tema KULLANILMIYOR.** Headless.
- `NEXT_PUBLIC_DATA_SOURCE=direct` → doğrudan Storefront API.
  `src/backend` (ASP.NET BFF), SQL, Redis, Docker **kullanılmıyor**.
- **Admin API kullanılmıyor** ve token'ı oluşturulmadı. Canlı mağaza, gereksiz risk.
- Ödeme Shopify'da kalıyor: sepetin `checkoutUrl`'ine yönlendiriliyor.

## Storefront API — tuzaklar
- İki belirteç var ve **farklı header isterler**:
  - genel/public → `X-Shopify-Storefront-Access-Token` (tarayıcı)
  - özel/private → `Shopify-Storefront-Private-Token` (sunucu)
  - Yanlış header = 401. `lib/shopify-client.ts` içindeki `storefrontAuthHeaders()` bunu seçer.
- Kimlikler **GID** formatında: `gid://shopify/ProductVariant/123`. Düz sayı gönderilirse
  `Invalid global id` hatası verir.
- Tek endpoint: `https://{magaza}.myshopify.com/api/{versiyon}/graphql.json`
- **API sürümü 2026-07.** Shopify sürümleri ~12 ay yaşar; süresi dolmuşu istersen sessizce
  "ileri sarar" ve başka sürümle cevaplar. `X-Shopify-API-Version` yanıt başlığı hangi
  sürümün kullanıldığını söyler — istediğinle aynı değilse sürüm eskimiş demektir.
  Çeyrekte bir kontrol et.
- Hatalar HTTP 200 içinde `errors` dizisinde gelir.
- `.env*` gitignore'da — token'lar asla commit edilmez.

## Çalışma şekli
- Değişiklikleri **tek tek** yap, her adımda `localhost:3000`'de doğrula.
- "Çalışıyor" demeden önce **gerçek istek at**, kod okumasıyla yetinme.
- Dosya değiştirmeden önce `.yedek` kopyasını al.
- Anlatım Türkçe, `#dersN` formatında: ne yaptık, neden yaptık. Benzetme kullanma,
  ama teknik detaya da boğma.

## Tasarımda öğrenilen tuzak
Projede `.sg-*` sınıfları ve `a { color: inherit }` gibi kurallar **katmansız** (unlayered)
tanımlı. CSS'te katmansız kurallar, Tailwind'in katmanlı yardımcı sınıflarını **yener** —
`text-white`, `text-[22px]` gibi sınıflar sessizce ezilir. Kesin sonuç gereken yerlerde
`style={{...}}` (satır içi) kullan.

## Elimdeki araçlar
- **Playwright kurulu** (devDependency): gerçek tarayıcıda test için. Betikleri scratchpad'de
  tut, `createRequire` ile projenin node_modules'ünden yükle. Görsel/etkileşim değişikliklerinde
  "çalışıyor" demeden ÖNCE hover/wheel/scroll'u gerçekten test et ve hesaplanmış stilleri oku.
- **Shopify MCP kurulu** (`shopify` sunucusu): `learn_shopify_api` → conversationId al,
  sonra `search_docs_chunks` ile resmi dokümanı ara, `validate_graphql_codeblocks` ile
  (api: "storefront-graphql") sorguları şemaya karşı doğrula. Tahmin etme, doğrula.

## Sepet mimarisi (2026-09-05)
`store/shopify-cart-store.ts` → `/api/cart` → Shopify Cart API. Sepet kimliği
localStorage'da (`marmara-cart`), satırlar HER ZAMAN Shopify'dan gelir.
Ödeme, Shopify'ın döndürdüğü `checkoutUrl`'e yönlendirilerek kendi kasasında
tamamlanır — bizim `/checkout` sayfamız devre dışı.
**`store/local-cart-store.ts` ARTIK KULLANILMIYOR** (sadece tarayıcıda liste
tutuyordu, ödemeye geçilemiyordu). Yeni kod onu kullanmasın.
Para birimi için `lib/money.ts` → `formatMoney(amount, currencyCode)`.
`formatTry()` TRY'ye sabit, kalan yerlerden temizlenmeli.

## Bilinen açık işler
- `/collections`, `/collections/[handle]`, `/search` hâlâ `catalog.json` kullanıyor.
- `/`, `/products`, `/products/[handle]` ve sepet Shopify'a bağlandı.
- `formatTry()` para birimini TRY'ye sabitliyor — Shopify'ın `currencyCode`'u kullanılmalı.
- Ürün kartlarındaki yıldız puanı **uydurma** (Shopify'da böyle veri yok).
- Adres formu Türkiye'nin 81 iline sabit.
- `/products` ve anasayfa "THE ESSENTIALS" şeridi Shopify'a bağlandı. `/collections`,
  `/products/[handle]`, `/search` ve anasayfanın kalan bölümleri hâlâ catalog.json'da.
- **GEÇİCİ:** Hero arka planı marka logosu (siyah zemin). `app/page.tsx` içindeki
  `brandImage="/brand/marmara-logo.png"` satırı kaldırılınca koleksiyon görsellerine döner.
  Volkan "şimdilik" dedi (2026-09-01) — kalıcı değil.
- Ürün kartındaki yıldız hâlâ uydurma; yorum sayısı 0 olduğunda gizleniyor. Karar bekliyor.
- `components/parfois/` — tasarım başka bir şablondan uyarlanmış, isimlendirme öyle kalmış.
