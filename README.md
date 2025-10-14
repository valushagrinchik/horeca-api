# HORECA API

```
<!-- docker -->
pnpm run docker

<!-- pm2 -->
pnpm run db:seed
pnpm run build
pm2 start dist/src/main.js --name horeca-api

```

### Authentication


#### Provider

provider@test.com
provider!

#### Horeca

horeca@test.com
horeca!

#### Admin

admin@test.com
admin!

## Tests

# Start only the database
docker compose -f docker-compose.test.yml up -d

# Run tests (Redis is automatically mocked)
<!-- Run users-admin tests -->
npm run test:e2e -- --testPathPattern=users-admin

<!-- Run all tests -->
npm run test:e2e