# Добавить 4 недостающих сегмента в квиз-воронку

## Цель
Расширить существующую сегментную архитектуру (один лендинг + один квиз) с 3 до 6 сегментов, чтобы закрыть все барьеры и страхи, обозначенные в исследовании ментальности.

## Что уже есть
- `src/lib/quiz/segments.ts` — конфиг сегментов: `default`, `no-time`, `emergency`.
- `stepsForSegment()` заменяет первые вопросы секции 2 на сегментные.
- `SEGMENT_STEP` — self-select для органического трафика.
- Аналитика и пейволл уже читают `answers.segment`.

## 6 сегментов из исследования

| id | Сегмент | Барьер | Страх | Статус |
|---|---|---|---|---|
| no-time | Нет времени / рутина | №1, №2 по CBE | «Снова брошу на третьей неделе» | ✅ есть |
| emergency | Эмоциональная скорая | 250k запросов/мес | «Открою и станет хуже» | ✅ есть |
| curious | Bible Curious | 28% американцев, рост +9 млн | «Я не тот человек, который читает Библию» | ⬜ добавить |
| social | Социальный стыд / группа | 63% называют себя христианами | «Меня разоблачат перед теми, кто уверен, что я знаю» | ⬜ добавить |
| returning | Возвращение / church hurt | Крупный неохваченный пласт | «Будут воспитывать и спрашивать, где я был» | ⬜ добавить |
| male | Мужской трек | Gen Z муж. +15 п.п., миллениалы +19 | «Это будет мягко, эмоционально и по-церковному» | ⬜ добавить |

## Что меняем

### 1. `src/lib/quiz/segments.ts`
- Расширить `SegmentId` до 6 значений.
- Добавить 4 объекта `SegmentCopy` с landing-hero, result bullet и `firstQuestions`.
- Добавить alias-маппинг для URL (`?v=curious`, `?v=group`, `?v=returning`, `?v=men` и вариации).
- Обновить `SEGMENT_STEP`, чтобы self-select показывал все 6 вариантов.

### 2. Сегментные первые вопросы (заменяют `blockers` → `plan-history`)

**curious** — диагностика «не тот человек»:
- «How close do you feel to the Bible right now?» (never opened / curious but intimidated / read as a kid / read sometimes)
- «What's the main thing that makes it feel 'not for you'?» (language / don't know where to start / seems like a rule book / afraid of getting it wrong)
- interstitial: «Curiosity is enough. You don't have to become 'a Bible person' first.»

**social** — диагностика группового стыда:
- «Where does the question about the Bible usually come up?» (small group / family / church / work / online)
- «What would change if you could answer confidently?» (less dread / contribute / not fake it / help someone else)
- interstitial: «Nobody here is watching. You learn privately first, then decide if you ever say a word.»

**returning** — диагностика возвращения:
- «How long has it been since you read regularly?» (weeks / months / years / since childhood)
- «What brought you back today?» (miss it / hard season / don't want to give up / someone mentioned it)
- interstitial: «No lecture, no check-in. The plan just opens to the right page when you come back.»

**male** — диагностика интеллектуального входа:
- «What would make you actually want to read it?» (historical context / original languages / real arguments / clear structure)
- «Which sounds more useful?» (facts first, then meaning / meaning first, then facts / both)
- interstitial: «Built like a field guide: who wrote it, to whom, what the words meant then, and why it matters now.»

### 3. `src/lib/quiz/plan.ts`
- Добавить 4 сегментных ключа в `OBSTACLES` или использовать `blockers[0]` при отсутствии сегментного вопроса.
- Убедиться, что `obstacleKey` корректно мапит новые сегменты на плановые bullets.

### 4. `src/components/landing/Hero.tsx` и `src/routes/index.tsx`
- Hero уже читает `getSegment(segment)` — изменений не требует, только новые id из конфига.

### 5. `src/routes/result.tsx`
- Уже показывает `segmentCopy.resultBullet` — изменений не требует.

### 6. `src/routes/quiz.tsx`
- Уже передаёт `segment` в события — изменений не требует.

### 7. Аналитика
- Новые значения `segment` автоматически попадают в `quiz_start`, `quiz_step_view`, `paywall_view`, `begin_checkout`.
- Отдельных событий не добавляем.

## Чего не делаем
- Не создаём отдельные роуты под сегменты.
- Не меняем общую часть квиза (традиция, темы, темп, имя, почта, анализ).
- Не меняем продуктовую логику стрика или планов.
- Не добавляем новых компонентов шагов — используем существующие `single`/`interstitial`.

## Порядок работы
1. Обновить `src/lib/quiz/segments.ts` — типы, конфиги, alias, self-select.
2. Обновить `src/lib/quiz/plan.ts` — obstacle mapping.
3. Проверить typecheck (`tsgo`).
4. Проверить в preview: 6 URL-вариантов и self-select.
5. Проверить production build.
