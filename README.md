# Mecenate — лента публикаций

Мобильное приложение (React Native + Expo) с экраном ленты постов от авторов для тестового задания Mecenate.

## Требования

- Node.js 20+ (LTS)
- [Yarn](https://yarnpkg.com/) (Classic или Berry)
- Приложение [Expo Go](https://expo.dev/go) на телефоне (iOS / Android) для запуска без нативной сборки

## Переменные окружения

Скопируйте пример и при необходимости измените значения:

```bash
cp .env.example .env
```

| Переменная | Описание |
|------------|----------|
| `EXPO_PUBLIC_API_BASE_URL` | Базовый URL API (по умолчанию `https://k8s.mectest.ru/test-app`) |
| `EXPO_PUBLIC_USER_ID` | UUID для заголовка `Authorization: Bearer` (тестовый API принимает любой валидный UUID) |

Если `.env` нет, в коде используются те же значения по умолчанию.

## Запуск

```bash
yarn install
yarn expo start
```

Дальше:

- Отсканируйте QR-код в терминале приложением **Expo Go** (Android) или камерой (iOS).
- Либо нажмите `a` / `i` для эмулятора Android / iOS (при установленной среде).

## Стек

- TypeScript, Expo Router
- TanStack Query (лента, курсорная пагинация, обновление)
- MobX (стор сессии / `userId`)
- Стили на дизайн-токенах (`src/theme/tokens.ts`)

## API

Спецификация: [OpenAPI](https://k8s.mectest.ru/test-app/openapi.json).

## Скрипты

| Команда | Действие |
|---------|----------|
| `yarn start` | Metro + меню Expo |
| `yarn android` | Запуск на Android |
| `yarn ios` | Запуск на iOS (нужен macOS для симулятора) |
| `yarn web` | Веб-версия |
