# Подключаем новый GA4 property (G-N9C5ENM381)

## Что делаем
Переводим весь трекинг с чужого потока GoldVein (`G-KS3BLY2V4G`) на собственный поток BibleRoutine `G-N9C5ENM381`, проверяем что события реально долетают, и настраиваем воронку в GA.

## Изменения в коде
- `src/lib/analytics.ts`: measurement ID берётся из нового собственного значения `G-N9C5ENM381` (это публичный ID, его безопасно держать в коде), с возможностью переопределить через переменную окружения коннектора. Так превью и прод перестают зависеть от того, какой поток подтянул коннектор.
- Остальная разметка событий (`landing_cta_click`, `quiz_*`, `paywall_view`, `plan_select`, `begin_checkout`, `purchase`, `session_*`, `product_return`) не меняется — она уже расставлена.
- Логика сред остаётся: на превью-доменах события уходят с `debug_mode: true` и параметром `env: preview`, на `bibleroutine.app` — как продовые.

## Проверка
Прогоняю в браузере воронку на превью: главная → `quiz_start` → несколько шагов → `quiz_complete` → пейволл → `begin_checkout`, и смотрю сетевые запросы к `google-analytics.com/g/collect` — проверяю, что в них уходит `tid=G-N9C5ENM381` и правильные имена событий. Покажу список пойманных событий.

## Что нужно будет сделать в GA (подскажу пошагово после проверки)
1. Admin → Data display → Events: пометить `purchase`, `quiz_complete`, `session_complete` как key events.
2. Explore → Funnel exploration с шагами: `page_view` (/) → `quiz_start` → `quiz_complete` → `paywall_view` → `begin_checkout` → `purchase` → `session_complete`.
3. Для отладки превью: Admin → DebugView (события с `debug_mode` появляются там сразу); в отчётах прода можно отфильтровать `env = preview`.
