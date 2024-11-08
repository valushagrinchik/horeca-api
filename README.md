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

## Вопросы
1 Finished - статус после deliveryTime до review - не отображен на ui
export const HorecaRequestStatus: {
  Pending: 'Pending',
  Active: 'Active',
  Finished: 'Finished',   
  CompletedSuccessfully: 'CompletedSuccessfully',
  CompletedUnsuccessfully: 'CompletedUnsuccessfully'
};

