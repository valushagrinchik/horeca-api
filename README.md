# HORECA API

## Запуск 

### Запуск всех сервисов в докере `pnpm run docker`

### Для удобства разработки лучше остановить horeca_api процесс в докере и запустить его локально `pnpm start:dev`

### Проверить доступность API и документации по ссылке `http://localhost:3001/doc`


## Авторизация

### Provider

provider@test.com
provider!

### Horeca

horeca@test.com
horeca!

### Admin

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