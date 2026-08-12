# Deployment

## Docker Compose (Local / Staging)

```bash
cp .env.example .env
# Fill in Shopify tokens
docker compose -f docker/docker-compose.yml up --build
```

| Service | Port |
|---------|------|
| Frontend | 3000 |
| BFF API | 8080 |
| SQL Server | 1433 |
| Redis | 6379 |

## Production Checklist

1. Set strong `MSSQL_SA_PASSWORD` and `JWT_SIGNING_KEY`
2. Configure Shopify webhook URL to production BFF domain
3. Enable EF Core migrations instead of `EnsureCreated` (production)
4. Configure OTLP endpoint for observability backend (Grafana, Datadog, etc.)
5. Use managed SQL Server and Redis (Azure SQL, ElastiCache, etc.)

## GitHub Actions

CI pipeline at `.github/workflows/ci.yml`:
- Backend: restore, build, test
- Frontend: npm ci, build

## Environment Variables

See `.env.example` for full list.

## Database Migrations

```bash
dotnet ef migrations add InitialCreate \
  --project src/backend/Persistence \
  --startup-project src/backend/Gateway.Api

dotnet ef database update \
  --project src/backend/Persistence \
  --startup-project src/backend/Gateway.Api
```

## Scaling

- **BFF:** Horizontal scale behind load balancer (stateless except workers)
- **Workers:** Run as separate deployment for independent scaling
- **Redis:** Required for shared cache across BFF instances
