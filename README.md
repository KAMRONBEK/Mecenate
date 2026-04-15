# Mecenate — лента и публикации

Мобильное приложение (React Native + Expo) для тестового задания Mecenate: лента постов с фильтром по типу, экран публикации с лайками и комментариями, real-time обновления через WebSocket.

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

## Возможности

- **Лента**: аватар, имя, превью/обложка, фильтры «Все / Бесплатные / Платные», бесконечная прокрутка и pull-to-refresh
- **Публикация**: полный текст, обложка, лайк с анимацией (Reanimated) и тактильной отдачей (Haptics), комментарии с подгрузкой страниц, отправка комментария
- **Real-time**: события `like_updated` и `comment_added` с бэкенда (WebSocket), обновление счётчиков и списка без перезагрузки

## Стек

- TypeScript, Expo Router
- TanStack Query (лента и деталь, мутации, кэш при WS-событиях)
- MobX (идентичность пользователя / `userId` из env)
- React Native Reanimated, Expo Haptics
- Стили на дизайн-токенах (`src/theme/tokens.ts`)

## API и WebSocket

- REST: [OpenAPI](https://k8s.mectest.ru/test-app/openapi.json)
- WebSocket: тот же хост, что и `EXPO_PUBLIC_API_BASE_URL`, путь `/ws`, query `token=<UUID>` (как Bearer). Подключение реализовано в `src/realtime/RealtimeSync.tsx`.

## Скрипты

| Команда | Действие |
|---------|----------|
| `yarn start` | Metro + меню Expo |
| `yarn android` | Запуск на Android |
| `yarn ios` | Запуск на iOS (нужен macOS для симулятора) |
| `yarn web` | Веб-версия |
