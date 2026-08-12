# Mağaza Bağlantısı ve Deploy Rehberi

## Önemli: Credential türleri

Paylaştığınız **İstemci Kimliği + Gizli Anahtar** (`shpss_...`) Shopify **uygulama (OAuth)** kimlik bilgisidir.
Storefront'un çalışması için ayrıca şunlar gerekir:

| Değişken | Ne işe yarar | Nereden alınır |
|----------|--------------|----------------|
| `SHOPIFY_STORE_URL` | Mağaza adresi | `testovo.myshopify.com` formatında |
| `SHOPIFY_STOREFRONT_TOKEN` | Vitrin + sepet API | Admin → Uygulama → Storefront API |
| `SHOPIFY_ADMIN_TOKEN` | Sipariş, stok (BFF) | Admin → Uygulama → Admin API |
| `SHOPIFY_CLIENT_ID` / `SECRET` | OAuth app kurulumu | Partner / Dev Dashboard |

> **Güvenlik:** Gizli anahtarı sohbette paylaştıysanız Partner Dashboard'dan **yenileyin (rotate)**.

## Domain: `testovo.shopify.com` değil

Shopify mağaza adresi varsayılan olarak:

```
https://testovo.myshopify.com
```

`*.shopify.com` değil `*.myshopify.com` kullanılır. Özel alan adı (ör. `testovo.com`) Shopify Admin → Settings → Domains üzerinden bağlanır.

---

## Adım 1 — Shopify'da token alma

1. Mağaza admin: `https://testovo.myshopify.com/admin`
2. **Settings → Apps and sales channels → Develop apps**
3. **Create an app** (veya mevcut custom app)
4. **Configure Storefront API** — örnek scope'lar:
   - `unauthenticated_read_product_listings`
   - `unauthenticated_read_product_inventory`
   - `unauthenticated_write_checkouts`
   - `unauthenticated_read_checkouts`
5. **Configure Admin API** (BFF için) — sipariş, müşteri, envanter scope'ları
6. **Install app** → token'ları kopyala:
   - Storefront API access token
   - Admin API access token

---

## Adım 2 — Lokal `.env`

```bash
cp .env.example .env
```

`.env` içinde (örnek):

```env
SHOPIFY_STORE_URL=testovo.myshopify.com
SHOPIFY_STOREFRONT_TOKEN=shpat_... veya storefront token
SHOPIFY_ADMIN_TOKEN=shpat_...
SHOPIFY_CLIENT_ID=2865273f837834ec8f21a121c15e6ba0
SHOPIFY_CLIENT_SECRET=shpss_...  # yeniledikten sonra

NEXT_PUBLIC_SHOPIFY_STORE_URL=testovo.myshopify.com
NEXT_PUBLIC_DATA_SOURCE=direct
SHOPIFY_STOREFRONT_TOKEN=...  # server-side (önerilen)
```

Lokal vitrin:

```bash
cd src/frontend/storefront-next
npm install && npm run dev
```

---

## Adım 3 — Vercel (ücretsiz vitrin)

**Vercel yalnızca Next.js vitrinini host eder.** ASP.NET BFF Vercel'de çalışmaz.

### Seçenek A — Sadece vitrin (önerilen başlangıç)

`NEXT_PUBLIC_DATA_SOURCE=direct` → doğrudan Shopify Storefront API.

1. [vercel.com](https://vercel.com) → GitHub repo bağla
2. **Root Directory:** `src/frontend/storefront-next`
3. Environment Variables:

| Key | Value |
|-----|-------|
| `SHOPIFY_STORE_URL` | `testovo.myshopify.com` |
| `SHOPIFY_STOREFRONT_TOKEN` | Storefront token |
| `NEXT_PUBLIC_SHOPIFY_STORE_URL` | `testovo.myshopify.com` |
| `NEXT_PUBLIC_DATA_SOURCE` | `direct` |

4. Deploy

CLI ile (Vercel hesabı gerekir):

```bash
npm i -g vercel
cd src/frontend/storefront-next
vercel login
vercel --prod
```

### Seçenek B — Vitrin + BFF (tam mimari)

| Bileşen | Host | Ücretsiz seçenek |
|---------|------|------------------|
| Storefront | Vercel | Hobby plan |
| BFF (.NET) | Render / Railway / Fly.io | Render free tier |
| SQL + Redis | Render / Upstash | Upstash Redis free |

BFF deploy sonrası Vercel'de:

```
NEXT_PUBLIC_DATA_SOURCE=bff
NEXT_PUBLIC_BFF_URL=https://your-bff.onrender.com
```

---

## Adım 4 — Headless kanal (isteğe bağlı)

Shopify Admin → **Settings → Apps and sales channels → Headless**  
Vercel domain'inizi (ör. `xxx.vercel.app`) izin verilen domain'lere ekleyin.

---

## Kontrol listesi (senden gerekenler)

- [ ] Mağaza URL'si doğrulama: `testovo.myshopify.com` mi?
- [ ] **Storefront API access token** (Admin'den app install sonrası)
- [ ] **Admin API access token** (BFF / webhook için)
- [ ] Vercel hesabı + GitHub repo push yetkisi
- [ ] (İsteğe bağlı) Render hesabı BFF için

İstemci ID/Secret tek başına vitrin çalıştırmaz — mutlaka Storefront token gerekir.
