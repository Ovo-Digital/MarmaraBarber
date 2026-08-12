# Architecture Overview

Enterprise headless commerce platform with **Clean Architecture**, **DDD**, and **CQRS**.

## System Context

```mermaid
flowchart TB
    subgraph Clients
        Browser[Browser / Mobile]
    end

    subgraph Frontend
        NextJS[Next.js Storefront]
    end

    subgraph BFF
        Gateway[ASP.NET Core Gateway.Api]
        App[Application Layer - MediatR]
        Workers[Background Workers]
    end

    subgraph Data
        SQL[(SQL Server)]
        Redis[(Redis Cache)]
    end

    subgraph External
        Shopify[Shopify APIs]
        ERP[ERP Systems]
        CRM[CRM Systems]
        MKT[Marketing Platforms]
    end

    Browser --> NextJS
    NextJS --> Gateway
    Gateway --> App
    App --> Shopify
    App --> Redis
    App --> SQL
    Shopify -->|Webhooks| Gateway
    Gateway --> Workers
    Workers --> ERP
    Workers --> CRM
    Workers --> MKT
```

## Layer Responsibilities

| Layer | Project | Responsibility |
|-------|---------|----------------|
| Presentation | `Gateway.Api` | HTTP, auth, webhooks, health, Swagger |
| Application | `Application` | CQRS use-cases, validation, orchestration |
| Domain | `Domain` | Entities, value objects, domain events |
| Infrastructure | `Infrastructure` | Cache, logging, DI wiring |
| Persistence | `Persistence` | EF Core, repositories, unit of work |
| Integrations | `Integrations/*` | Shopify, ERP, CRM, Marketing adapters |
| Workers | `Workers` | Background sync + webhook processing |

## Request Flow (Product Detail)

```mermaid
sequenceDiagram
    participant U as User
    participant N as Next.js
    participant B as BFF API
    participant M as MediatR
    participant C as Redis
    participant S as Shopify Storefront

    U->>N: GET /products/handle
    N->>B: GET /api/v1/products/{handle}
    B->>M: GetProductByHandleQuery
    M->>C: cache get
    alt cache miss
        M->>S: GraphQL GetProduct
        M->>C: cache set
    end
    M-->>B: Product DTO
    B-->>N: JSON response
    N-->>U: Rendered page
```

## Multi-Store Support

- `StoreId` column on domain entities enables per-store data isolation
- Shopify settings can be extended to a multi-tenant configuration provider
- Future decomposition: extract `Integrations.Shopify` and `Workers` into separate services

## Microservice Migration Path

1. **Phase 1 (current):** Modular monolith with clear bounded contexts
2. **Phase 2:** Extract webhook processor + workers to dedicated worker service
3. **Phase 3:** Extract ERP/CRM/Marketing integrations as independent services
4. **Phase 4:** Event bus (Azure Service Bus / RabbitMQ) replaces in-memory queue
