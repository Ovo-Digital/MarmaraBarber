# ovowebtest — Hızlı Başlangıç Checklist

Mağaza: **https://ovowebtest.myshopify.com**  
Partner uygulama: **TestProject**  
İstemci ID: Partner Dashboard → Ayarlar → Kimlik bilgileri

> Gizli anahtar (`shpss_...`) vitrin için **yeterli değil**. Storefront API **access token** şart.

---

## Adım 1 — Uygulamayı mağazaya yükle (EKSİK — screenshot'ta 0 yükleme)

1. [Partner Dev Dashboard](https://dev.shopify.com/dashboard) → **TestProject**
2. Sağ panel → **Yüklemeler** → **Uygulamayı yükle**
3. **ovowebtest** development store'unu seç → Yükle

Yükleme sonrası "Yüklemeler: 1" görünmeli.

---

## Adım 2 — API scope'larını aç (sürüm testv1)

1. **Sürümler** → **testv1** (Aktif) → Düzenle
2. **Admin API** — örnek scope'lar:
   - `read_products`, `read_orders`, `read_customers`
   - `write_products` (stok güncelleme için)
3. **Storefront API** — örnek scope'lar:
   - `unauthenticated_read_product_listings`
   - `unauthenticated_read_product_inventory`
   - `unauthenticated_read_checkouts`
   - `unauthenticated_write_checkouts`
4. Kaydet / yeni sürüm yayınla (gerekirse)

---

## Adım 3 — Token al (2 seçenek)

### Seçenek A — En kolay (headless vitrin için önerilir)

Mağaza admin'de Headless kanalı:

1. https://ovowebtest.myshopify.com/admin
2. **Settings → Apps and sales channels → Headless**
3. **Add storefront** → isim ver → **Storefront API access token** kopyala

Bu token → `SHOPIFY_STOREFRONT_TOKEN`

### Seçenek B — Mağaza içi Custom App (Admin token + Storefront)

1. https://ovowebtest.myshopify.com/admin/settings/apps/development
2. **Create an app** → Configure Admin API + Storefront API scope'ları
3. **Install** → iki token'ı kopyala:
   - Admin API access token → `SHOPIFY_ADMIN_TOKEN`
   - Storefront API access token → `SHOPIFY_STOREFRONT_TOKEN`

### Seçenek C — Partner app + Shopify CLI

```bash
npm install -g @shopify/cli@latest
cd /path/to/TestProject  # CLI ile oluşturduğunuz app klasörü
shopify app dev --store ovowebtest.myshopify.com
```

CLI oturum token'larını `.env` dosyasına yazar.

---

## Adım 4 — Proje `.env` dosyası

Proje kökünde:

```bash
cp .env.example .env
```

```env
SHOPIFY_STORE_URL=ovowebtest.myshopify.com
SHOPIFY_STOREFRONT_TOKEN=buraya_storefront_token
SHOPIFY_ADMIN_TOKEN=buraya_admin_token
SHOPIFY_CLIENT_ID=2865273f837834ec8f21a121c15e6ba0
SHOPIFY_CLIENT_SECRET=buraya_yenilediginiz_secret

NEXT_PUBLIC_SHOPIFY_STORE_URL=ovowebtest.myshopify.com
NEXT_PUBLIC_DATA_SOURCE=direct
```

---

## Adım 5 — Lokal test

```bash
cd src/frontend/storefront-next
npm install
npm run dev
```

Tarayıcı: http://localhost:3000

> Mağaza şifre korumalı — Storefront API yine çalışır. Online Store önizlemesi için şifre gerekir.

---

## Adım 6 — Vercel (ücretsiz)

1. GitHub'a push
2. vercel.com → Import → Root: `src/frontend/storefront-next`
3. Environment variables (Adım 4 ile aynı)
4. Deploy

---

## Kimlik bilgileri özeti

| Bilgi | Ne için | Sende var mı? |
|-------|---------|---------------|
| İstemci ID | OAuth / CLI | Evet |
| Gizli anahtar | OAuth / CLI | Evet (rotate önerilir) |
| Storefront token | Vitrin + sepet | **Alman lazım** |
| Admin token | BFF, webhook | BFF için lazım |
| Uygulama yüklü mü? | Token / erişim | **Hayır — yükle** |

Detay: [09-magaza-baglantisi-ve-deploy.md](./09-magaza-baglantisi-ve-deploy.md)
