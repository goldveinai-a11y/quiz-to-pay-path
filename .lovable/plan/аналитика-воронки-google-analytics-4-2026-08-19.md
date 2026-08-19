# Аналитика воронки: Google Analytics 4

## Что получим
Сквозная воронка от главной страницы до оплаты и первых дней пользования продуктом — с событиями на каждом шаге, а не только просмотрами страниц.

## Подключение
GA4 подключается как коннектор Lovable: вы выбираете аккаунт Google, я привязываю поток данных к проекту. Под этот проект нужен отдельный Data Stream (Web) в вашем GA-аккаунте — его создаёте вы в GA (Admin → Data Streams → Web, домен bibleroutine.app), а measurement ID подтягивается через коннектор. Ключ хранится как переменная окружения, в код не попадает.

## События воронки

Верх воронки
- `page_view` при каждой смене маршрута (SPA-роутинг сам по себе события не шлёт)
- `landing_cta_click` — нажатие Start на главной, с указанием какой именно кнопки

Квиз
- `quiz_start`
- `quiz_step_view` и `quiz_step_complete` с номером и id шага — покажет, на каком вопросе отваливаются
- `quiz_email_submit`
- `quiz_complete`

Пейволл и оплата
- `paywall_view`
- `plan_select` (1-week / 1-month / 3-month)
- `begin_checkout` с ценой и планом
- `checkout_email_submit`
- `purchase` — стандартное GA-событие с value и currency, шлётся на экране checkout-complete по подтверждённой сессии, один раз (защита от повторной отправки при перезагрузке)

Продукт после оплаты
- `login_link_request` и `login_success`
- `plan_view`
- `session_start` (день N) и `session_complete` (день N)
- `quiz_answer_correct` / `quiz_answer_wrong` в дневном квизе
- `note_saved`, `highlight_created`, `ask_question`
- `day2_return` — ключевой сигнал удержания

## Техническая часть
- `src/lib/analytics.ts`: инициализация gtag через measurement ID из `import.meta.env`, безопасная функция `track(name, params)`, которая молча ничего не делает, если ID не задан (локальная разработка)
- Инициализация один раз в корневом маршруте; подписка на события роутера TanStack для `page_view`
- Вызовы `track(...)` расставляются точечно в существующих обработчиках квиза, пейволла, чекаута и экранов продукта — без изменения бизнес-логики
- Никаких email и персональных данных в параметрах событий, только id планов, шагов и книг
- UTM-метки GA собирает сам; текущее сохранение UTM в квизе остаётся как есть

## После внедрения
В GA нужно будет один раз пометить `purchase`, `quiz_complete` и `session_complete` как ключевые события и собрать отчёт Funnel Exploration по цепочке: landing → quiz_start → quiz_complete → paywall_view → begin_checkout → purchase → session_complete. Подскажу пошагово.
