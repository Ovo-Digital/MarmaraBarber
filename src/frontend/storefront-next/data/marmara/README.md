# Marmara Barber katalog aynası

Kaynak: https://marmarabarber.com (Shopify public JSON)
Tarih: 2026-08-01T12:09:32.014586+00:00

## İçerik
- `catalog.json` — tüm ürün + koleksiyon (normalize)
- `index.json` — hafif indeks (liste ekranları için)
- `products/*.json` — ürün başına dosya
- `collections/*.json` — koleksiyon başına dosya
- `raw/` — ham Shopify JSON
- `../../public/catalog/marmara/` — ürün görselleri (yerel)

## İstatistik
- Ürün: 199
- Koleksiyon: 32
- Görsel: 328/328
- Stokta: 159

## Yenileme
```bash
# JSON + görseller
node scripts/scrape-marmara-catalog.mjs
# veya curl tabanlı pipeline (rate-limit durumunda)
```

Not: Bu veri sunum / tasarım önizlemesi içindir. Canlı mağaza bağlanınca Shopify Storefront API kullanılacak.
