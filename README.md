# Калькулятор производства

Пользователь вводит план выпуска (какую продукцию и сколько), приложение считает, **сколько материалов нужно закупить**, и показывает расчёт по шагам с формулами.

## Модель данных

| Таблица        | Что хранит                                                                     |
| -------------- | ------------------------------------------------------------------------------ |
| `materials`    | материал, ед. изм., размер упаковки, цена упаковки (опц.), остаток на складе   |
| `products`     | продукция и её ед. изм.                                                        |
| `recipe_items` | рецептура (BOM): норма расхода материала на 1 ед. продукции + % потерь         |

## Формулы

Для каждого материала по всем позициям плана:

```
потребность  = Σ количество × норма × (1 + потери% / 100)
не хватает   = max(0, потребность − остаток на складе)
упаковок     = ⌈не хватает ÷ размер упаковки⌉
закупить     = упаковок × размер упаковки
сумма        = упаковок × цена упаковки
```

Пример: 20 полок (доска 2,4 м, потери 8 %) + 10 табуретов (доска 1,2 м, потери 10 %), на складе 30 м, доска продаётся по 6 м:
`20×2,4×1,08 + 10×1,2×1,1 = 51,84 + 13,2 = 65,04 м` → не хватает `35,04 м` → `⌈35,04 ÷ 6⌉ = 6` досок (36 м).

Логика — чистая функция в [`src/lib/calc.ts`](src/lib/calc.ts), покрыта тестами.

## Стек

Next.js 16 (App Router, Server Components, Server Actions, Route Handler), React 19, Tailwind CSS v4, TypeScript strict, Drizzle ORM + postgres.js, PostgreSQL 17, Zod, Vitest, ESLint 9, Docker.

## Структура

```
src/
  app/                    страницы (RSC) + /api/calculate (REST)
  components/             формы и поля
  db/schema.ts            схема Drizzle
  db/seed.ts              демо-данные
  lib/calc.ts             расчёт (без зависимостей от БД)
  lib/types.ts            публичные DTO
  server/loaders.ts       чтение из БД → mappers.ts → DTO
  server/actions.ts       Server Actions (CRUD) с валидацией
  server/validation.ts    Zod-схемы
drizzle/                  SQL-миграции
scripts/migrate.mjs       применение миграций в Docker
```

## Запуск локально

```bash
cp .env.example .env
docker compose up -d db      # только PostgreSQL
npm install
npm run db:migrate
npm run db:seed              # демо: табурет и полка
npm run dev                  # http://localhost:3000
```

## Запуск целиком в Docker

```bash
docker compose --profile app up -d --build   # db → migrate → app на 127.0.0.1:3000
```

## Скрипты

| Команда               | Что делает                              |
| --------------------- | --------------------------------------- |
| `npm run dev`         | dev-сервер                              |
| `npm run build`       | production-сборка (standalone)          |
| `npm test`            | тесты расчёта и валидации               |
| `npm run lint`        | ESLint                                  |
| `npm run typecheck`   | `tsc --noEmit`                          |
| `npm run db:generate` | новая миграция после изменения схемы    |
| `npm run db:migrate`  | применить миграции                      |
| `npm run db:studio`   | Drizzle Studio                          |

## API

`POST /api/calculate`

```json
{ "lines": [{ "productId": 1, "quantity": 20 }, { "productId": 2, "quantity": 10 }] }
```

Возвращает потребность по каждому материалу (`required`, `shortage`, `packs`, `purchaseQty`, `cost`) с разбивкой по продуктам и итоговую сумму. Rate limit — 60 запросов/мин на IP (учитывает `CF-Connecting-IP`).

## Безопасность

CSP и security-заголовки (`next.config.ts`), валидация всех входных данных Zod-схемами, параметризованные запросы через Drizzle, ограничения `CHECK`/`UNIQUE`/`FK` на уровне БД, контейнер от non-root пользователя.
