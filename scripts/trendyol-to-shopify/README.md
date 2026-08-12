# Trendyol → Shopify ürün aktarımı (Dominant)

Trendyol mağaza sayfası Cloudflare bot koruması kullandığı için **bu ortamdan doğrudan scrape edilemiyor** (HTTP 403).  
Aşağıdaki araçları **kendi bilgisayarınızda** çalıştırmanız gerekiyor; gerçek tarayıcı oturumu Cloudflare’i geçer.

## Gereksinimler

- Node.js 20+
- Shopify Admin API token (`shpat_…`) — `write_products`, `read_products`, `read_locations`
- `.env` veya `src/frontend/storefront-next/.env.local`:

```env
SHOPIFY_STORE_URL=ovowebtest.myshopify.com
SHOPIFY_ADMIN_TOKEN=shpat_...
```

## Kurulum

```bash
cd scripts/trendyol-to-shopify
npm install
npx playwright install chromium
```

## 1. Trendyol’dan çek (scrape)

```bash
# Tarayıcı penceresi açılır — Cloudflare çıkarsa elle doğrulayın
npm run scrape

# Sadece test (ilk 2 sayfa, max 10 ürün)
npm run scrape -- --max-pages 2 --max-products 10

# Kaldığı yerden devam
npm run scrape -- --resume

# Arka planda (Cloudflare riski yüksek)
npm run scrape -- --headless
```

Çıktı: `data/trendyol-products.json`  
Ürün detayı API’si varyantları (renk/beden), fiyatları ve görselleri toplar.

## 2. Shopify’a yükle

```bash
# Önce kontrol
npm run import -- --dry-run --limit 5

# Tümünü aktar
npm run import

# Parça parça
npm run import -- --offset 0 --limit 50
```

- Görseller Trendyol CDN URL’lerinden Shopify’a `productSet` ile çekilir.
- Aynı SKU varsa ürün atlanır.
- `trendyol.source_id` ve `trendyol.source_url` metafield’ları eklenir.

## Alternatif: CSV ile panelden import (Admin API gerekmez)

Admin API / custom app izni yoksa en pratik yol budur.

### Adımlar

1. **Trendyol verisini çek** (veya elindeki JSON’u kullan):
   ```bash
   npm run scrape
   ```

2. **Shopify CSV üret**:
   ```bash
   npm run csv
   ```
   Çıktı: `data/shopify-products-import.csv` (UTF-8 BOM, Türkçe karakter uyumlu)

3. **Panelden yükle**:
   - Shopify Admin → **Products** → **Import**
   - *Download sample CSV* ile örnek indirebilirsin (zorunlu değil)
   - `shopify-products-import.csv` dosyasını seç
   - *Upload and preview* → sütunlar eşleşmezse dropdown’dan düzelt
   - *Import products*

4. **Kendi şablonun varsa** (panelden indirdiğin örnek CSV):
   ```bash
   npm run csv -- --template ./ornek-shopify.csv
   ```
   Script, şablonun ilk satırındaki sütun başlıklarını kullanır.

### CSV’de neler var?

| Alan | Kaynak |
|------|--------|
| Handle, Title, Vendor | Ürün adı / Dominant |
| Body (HTML) | Açıklama (boşsa Trendyol linki) |
| Option1–3 | Beden / Renk varyantları |
| Variant Price, SKU | Trendyol fiyat & SKU |
| Image Src | CDN görselleri (yüksek çözünürlük, tekilleştirilmiş) |

Sahte varyant etiketleri (`Kazan`, `Kuponun Ürünleri` vb.) otomatik filtrelenir.

### Notlar

- Görseller URL ile import edilir; Shopify ilk yüklemede CDN’den çeker.
- Stok miktarı boş bırakıldı (panelden veya ikinci CSV ile güncelleyebilirsin).
- 46+ ürün için tek dosya yeterli; çok büyük kataloglarda Shopify 15 MB limitine dikkat.


## Sorun giderme

- **403 / Cloudflare**: `--headless` kullanmayın; normal Chrome penceresinde çalıştırın.
- **Boş liste**: Trendyol API yanıt formatı değişmiş olabilir — `scrape-trendyol.mjs` içindeki parser’ı güncelleyin.
- **Görsel yüklenmedi**: Trendyol URL’leri hotlink engelliyorsa görselleri önce indirip staged upload gerekir (ileride eklenebilir).
