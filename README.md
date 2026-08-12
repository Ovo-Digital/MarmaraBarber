# Marmara Barber

**Marmara Barber** resmi headless commerce projesi — Ovo Digital.

Online mağaza: kolonya, saç şekillendirme, cilt bakımı, parfüm ve berber aksesuarları.

## Stack

- **Shopify** — commerce kaynağı (Storefront + Admin GraphQL)
- **Next.js (App Router)** — storefront
- **ASP.NET Core 9** — BFF (Gateway.Api) + entegrasyon katmanı
- **Clean Architecture + CQRS** (MediatR)
- **SQL Server** + **Redis**
- **Webhooks** + background workers
- Docker / GitHub Actions / Vercel / Render

## Monorepo

```
src/
  frontend/
    storefront-next/        # Next.js vitrin (Marmara Barber)
  backend/
    Gateway.Api/            # BFF HTTP + webhooks
    Application/            # CQRS use-cases
    Domain/
    Infrastructure/
    Persistence/
    Contracts/
    Integrations/           # Shopify, ERP, CRM, Marketing adapters
    Workers/
    SharedKernel/
docker/
docs/
scripts/
```

## Quick start

### Prerequisites
- .NET SDK 9+
- Node.js 20.x
- Docker (opsiyonel: SQL Server + Redis)

### 1. Env
```bash
cp .env.example .env
# Shopify store URL + Storefront token doldur
```

### 2. Frontend
```bash
cd src/frontend/storefront-next
npm ci
npm run dev
```

### 3. Backend (opsiyonel)
```bash
dotnet restore src/backend/HeadlessCommerce.sln
dotnet run --project src/backend/Gateway.Api
```

## Deploy

- **Frontend:** Vercel (`vercel.json`)
- **BFF:** Render (`render.yaml`)

## Org

GitHub: [Ovo-Digital/MarmaraBarber](https://github.com/Ovo-Digital/MarmaraBarber)
