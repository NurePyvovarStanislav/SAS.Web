# SAS.Web — Soil Analytics System

Веб-клієнт для системи аналітики ґрунту **Soil Analytics System (SAS)**. Працює з реальним backend `SAS.Backend` через REST API з action-based маршрутизацією.

## Призначення

SAS.Web надає зручний інтерфейс для моніторингу полів, датчиків, вимірювань і попереджень. Підтримує дві ролі: звичайного користувача та адміністратора.

## Можливості користувача (User)

- Перегляд призначеного поля та зведеної статистики
- Перегляд датчиків поля
- Перегляд вимірювань з фільтрами дат і графіком
- Перегляд і вирішення активних попереджень
- Українська та англійська локалізація

## Можливості адміністратора (Administrator)

- Повний CRUD користувачів, полів, датчиків
- Керування вимірюваннями (редагування, видалення)
- Керування попередженнями (resolve/unresolve, видалення)
- Експорт JSON/CSV, імпорт JSON, резервне копіювання
- Панель зі статистикою та діаграмами

## Стек

- **React 19** + **TypeScript** + **Vite**
- **React Router** — маршрутизація
- **TanStack Query** — серверний стан
- **Axios** — HTTP-клієнт з JWT refresh
- **Mantine UI** — компоненти інтерфейсу
- **i18next** — локалізація (uk/en)
- **React Hook Form + Zod** — форми та валідація
- **Recharts** — графіки

## Архітектура

```
SAS.Web (localhost:5173)  →  SAS.Backend API (localhost:5206)
         JWT Bearer                    PostgreSQL
```

Frontend — окремий SPA-проект. Backend змінено мінімально (CORS, enum serialization, role-based access, administration API).

## Структура папок

```
src/
├── api/           # HTTP-клієнти (action-based routes)
├── app/           # App, router, theme, queryClient
├── auth/          # JWT, context, guards
├── components/    # UI-компоненти
├── i18n/          # Локалізація uk/en
├── layouts/       # UserLayout, AdminLayout
├── pages/         # Сторінки user/ та admin/
├── types/         # TypeScript DTO
└── utils/         # dateFormat, localeSort, apiError
```

## Взаємодія з backend

Маршрути мають формат `/api/[Controller]/[Action]`, наприклад:

- `POST /api/Auth/Login`
- `GET /api/Fields/GetField/{id}`
- `GET /api/Sensors/GetSensorsByField/{fieldId}`
- `GET /api/Administration/CreateBackup`

## Змінні оточення

Скопіюйте `.env.example` у `.env`:

```env
VITE_API_URL=http://localhost:5206
```

## Команди запуску

### Backend

```bash
cd SAS.Backend/SAS.Backend.API
dotnet run
```

Backend: http://localhost:5206 (Swagger у режимі Development)

### Frontend

```bash
cd SAS.Web
npm install
npm run dev
```

Frontend: http://localhost:5173

### Збірка та lint

```bash
npm run build
npm run lint
```

## Тестові маршрути

| Роль | URL після входу |
|------|-----------------|
| User | `/app`, `/app/field`, `/app/sensors`, `/app/alerts` |
| Administrator | `/admin`, `/admin/users`, `/admin/data` |

## Локалізація

- Мови: **uk** (за замовчуванням), **en**
- Збереження: `localStorage` ключ `sas.language`
- `document.lang` та `document.dir` оновлюються автоматично
- Дати/числа форматуються через `Intl` (`uk-UA` / `en-US`)
- Сортування таблиць через `Intl.Collator`

## Import / Export / Backup

Доступно лише адміністратору на `/admin/data`:

- **Backup** — повний JSON snapshot
- **Export JSON** — entity: all, users, fields, sensors, measurements, alerts
- **Export CSV** — одна entity (не `all`)
- **Import** — multipart JSON до 10 МБ

## Демонстраційний сценарій

1. Запустіть backend і frontend
2. Увійдіть як **Administrator** → перевірте CRUD користувачів/полів
3. Створіть користувача з роллю User і призначте поле
4. Увійдіть як User → перегляньте дашборд, датчики, вимірювання
5. Перемкніть мову uk ↔ en
6. Як admin: створіть backup, експорт JSON, імпорт файлу
7. Перевірте logout і повторний login

## Backend репозиторій

<!-- GitHub URL backend: https://github.com/NurePyvovarStanislav/SAS.Backend -->

---

© Soil Analytics System — лабораторна робота АПЗ
