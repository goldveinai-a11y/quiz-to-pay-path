# Импорт обогащения для 90 сессий

## Goal
Загрузить готовый `sessions_enriched.json` (John, Mark, Psalms — 30 дней каждая) в базу, заполнив поля `word_study`, `cross_reference`, `application`, `voices` и `quiz`.

## Steps
1. **Validate the file**
   - Exactly 90 objects.
   - `book_slug` ∈ {john, mark, psalms}; `day_number` 1–30 без пропусков в каждой книге.
   - Присутствуют все пять полей обогащения (`word_study`, `cross_reference`, `application`, `voices`, `quiz`) или явный null.
   - `quiz.options` ≥ 2, `answer_index` внутри диапазона.
   - Проверка на запрещённые переводы: отсутствие NIV, ESV, NLT, NASB, CSB, NKJV, NABRE, The Message.

2. **Import**
   - Запустить `bun scripts/import-enrichment.ts /mnt/user-uploads/sessions_enriched.json`.
   - Скрипт обновит `study_sessions` и сделает upsert в `session_quiz`.

3. **Verify in database**
   - Подтвердить, что 90 сессий обновлены.
   - Проверить отсутствие rejected-строк в выводе скрипта.
   - Сделать выборку: для John/Mark/Psalms посчитать заполненность полей.

4. **Check real session duration**
   - Пересчитать `estimateMinutes` для нескольких старых и новых сессий.
   - Убедиться, что сессии теперь занимают ~6–7 минут, а не 2–3.

5. **Report**
   - Сообщить итоги: сколько обновлено, сколько rejected, средняя длительность, следующий шаг.

## Notes
- Никаких изменений в схеме или UI в этом плане не требуется — только импорт и проверка.
- Если валидация найдёт ошибки, импорт не запускаем, пока не согласуем правки.
