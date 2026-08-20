# GA4: отдельный property для BibleRoutine + воронка

## Коротко: да, отдельный property — правильно

Сейчас measurement ID `G-KS3BLY2V4G` относится к чужому проекту (на скриншоте открыт property GoldVein.ai, отчёт отфильтрован по Stream ID и данных нет). Смешивать BibleRoutine с другим бизнесом не стоит: конверсии, воронки, аудитории и ключевые события настраиваются на уровне property — при общем property отчёты по обоим продуктам будут перемешаны.

Рекомендация: новый GA4 property «BibleRoutine» + один Web Data Stream на `bibleroutine.app`. Отдельный поток внутри старого property даёт изоляцию только по данным, но не по ключевым событиям и воронкам.

## Что делаете вы в GA (5 минут)

1. Admin → Create → Property, имя «BibleRoutine», часовой пояс и валюта USD.
2. Data Streams → Web → URL `https://www.bibleroutine.app`, имя потока «BibleRoutine Web».
3. Скопировать новый Measurement ID вида `G-XXXXXXXXXX` и прислать его сюда.
4. В настройках потока включить Enhanced measurement (page views можно оставить — наш код шлёт свои, дубли исключены флагом `send_page_view: false`).

## Что делаю я

- Перепривязываю коннектор Google Analytics на новый measurement ID (переменная окружения, в код не попадает).
- Проверяю живьём в браузере обе среды: прогоняю путь landing → quiz → result → checkout → checkout-complete и продуктовый экран, снимаю запросы к `google-analytics.com/g/collect` и подтверждаю, что уходят именно те события с нужными параметрами.
- Добавляю в трекинг `debug_mode` на превью-домене, чтобы события были видны в GA DebugView мгновенно, а прод оставался чистым.
- Ставлю `send_to`-совместимую конфигурацию так, чтобы события с превью не пачкали прод: превью помечается параметром `env: preview`, в GA создаётся фильтр по нему.

## Почему «данных нет за 2 дня»

Три возможные причины, проверю по порядку:
1. События уходят в property, отчёт по которому вы смотрите с фильтром по чужому Stream ID — самое вероятное.
2. Отчёты Events/Explorations обрабатываются с задержкой до 24-48 часов; живой сигнал смотрится в Realtime и DebugView, а не в Events.
3. На проде реального трафика могло не быть — проверю по нашим данным покупок и заходов.

Итог диагностики скажу до того, как что-то менять.

## Воронка в GA4 после перепривязки

Ключевые события (Admin → Events → Mark as key event):
`quiz_start`, `quiz_complete`, `begin_checkout`, `purchase`, `session_complete`.

Funnel exploration, шаги по порядку:

```text
page_view (/)  →  landing_cta_click  →  quiz_start  →  quiz_complete
   →  paywall_view  →  begin_checkout  →  purchase  →  session_complete
```

Второй отчёт — отвал внутри квиза: разбивка `quiz_step_view` по параметру `step_index`, чтобы видеть, на каком из 22 вопросов уходят.

Для параметров `plan`, `step_index`, `step_id`, `day` регистрирую custom dimensions в GA — без этого они не попадают в отчёты, только в DebugView. Это делаю я по списку, вам останется подтвердить.

## Техническая часть

- `src/lib/analytics.ts`: добавляется `debug_mode` и параметр окружения; остальная логика (`track`, `trackOnce`, `trackPageView`, `trackReturnVisit`) не меняется.
- Разметка уже стоит во всей воронке — лендинг, 22 шага квиза, email-шаг, пейволл, выбор плана, чекаут, `purchase` с суммой и защитой от дублей по session_id, логин, дневная сессия, квиз дня, заметки, хайлайты, вопросы ИИ, возвраты. Новые вызовы не потребуются.
- Проверка — Playwright по реальному прогону, а не «по коду».

## Что нужно от вас прямо сейчас

Новый Measurement ID нового property. Без него перепривязка невозможна.
