# Stop generation, build the product, define the seed contract

Content generation is off. No model writes sessions — not the 7 John days already in the database, not the remaining 83. Those 7 generated rows get deleted and replaced with obvious placeholders.

## What changes now

- Delete the 7 generated John rows. Insert 7 placeholder rows in their place, every text field prefixed `[PLACEHOLDER]` so they cannot be mistaken for real content and are trivial to replace.
- Drop the generation script from the workflow. Keep only an importer: one command reads the seed file and upserts on `(book_slug, day_number)`, so delivering the file replaces placeholders in one pass.
- Verse text stays as is: WEB only, already imported (John 879, Mark 678, Psalms 2461 verses). Verses never come from the seed file — the seed names a passage, the app reads the words from the `verses` table. A session whose reference does not resolve is rejected at import.

## What gets built (unchanged from the approved plan)

1. Schema and access rules — already in place; verified, not rebuilt.
2. Stripe checkout with the intro amount charged immediately. On a successful charge the plan is frozen as one `user_plans` record; nothing afterwards recalculates from quiz answers, and a user who never took the quiz gets sensible defaults.
3. Account created from the paid email, signed in in the same tab, landing straight on My Plan. One email: the charge confirmation carrying the sign-in link.
4. Sign-in-link form at `/auth` — no passwords, works on any device.
5. My Plan — hero card with cropped public-domain engraving, today's session title, progress bar, Continue; all 30 days listed, past open and done, today highlighted, future visible but locked by date.
6. The session — six steps, full screen: passage, the one insight, what it meant then, where traditions differ (only when the seed marks it), one question, take it with you. Reopening returns to the exact step.
7. One-click cancel, no retention flow.

Placeholder rows cover every step type, including a tradition-divergence block on two of them, so all screen states are testable before your file lands.

## The seed file

One JSON file, one array, one object per session. Ninety objects when complete; partial files import fine.

```text
seed.json
└── [ session, session, … ]
      ├── passage      → which verses the app pulls from its own database
      ├── insight      → exactly one, with its public-domain source
      ├── context      → two short paragraphs
      ├── divergence   → optional; omit or null when the passage does not divide
      └── question     → one string
```

### Session object

| Field | Type | Required | Notes |
|---|---|---|---|
| `book_slug` | `"john"` \| `"mark"` \| `"psalms"` | yes | which 30-day plan |
| `day_number` | integer 1–30 | yes | unique within the book |
| `title` | string | yes | the idea, never a reference: "Light, and the people who avoid it" |
| `setup` | string, ≤ 25 words | yes | one sentence under the title |
| `passage` | object | yes | see below |
| `highlight_word` | string \| null | no | one word, must appear verbatim in the passage; dropped if it doesn't |
| `insight` | object | yes | exactly one |
| `context` | string | yes | two paragraphs separated by `\n\n` |
| `divergence` | object \| null | no | omit or `null` → the session is five steps |
| `question` | string | yes | one open question |
| `art_tone` | `"teal"` \| `"terra"` \| `"indigo"` \| `"olive"` | no | defaults to `teal` |

### `passage`

| Field | Type | Required | Notes |
|---|---|---|---|
| `book` | `"John"` \| `"Mark"` \| `"Psalms"` | yes | as spelled in the verses table |
| `chapter` | integer | yes | single chapter per session |
| `verse_start` | integer | yes | 4–8 verses is the target |
| `verse_end` | integer | yes | inclusive |
| `reference` | string | no | display form, e.g. `"John 3:16-21"`; generated if omitted |

No verse text in the seed. Anything supplied there is ignored.

### `insight`

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | yes | the insight as a claim, 5–11 words |
| `body` | string | yes | two or three sentences |
| `author` | `"Matthew Henry"` \| `"John Gill"` \| `"Albert Barnes"` | yes | public domain only |
| `year` | `"1710"` \| `"1746"` \| `"1834"` | yes | must match the author |

### `divergence` (optional)

| Field | Type | Required | Notes |
|---|---|---|---|
| `question` | string | yes | what is at stake |
| `readings` | array of objects | yes | 2–4 entries |
| `readings[].tradition` | string | yes | e.g. `"Catholic"`, `"Orthodox"`, `"Protestant"` |
| `readings[].reading` | string | yes | one sentence |
| `readings[].verses` | string | no | the verses it rests on, e.g. `"John 6:53"` |
| `common` | string | yes | one line on what they agree about |

No verdict field. The app never picks a side.

### Example

```json
[
  {
    "book_slug": "john",
    "day_number": 6,
    "title": "Light, and the people who avoid it",
    "setup": "A night conversation turns into the sharpest sentence in the gospel.",
    "passage": { "book": "John", "chapter": 3, "verse_start": 16, "verse_end": 21 },
    "highlight_word": "light",
    "insight": {
      "title": "Judgment here is a preference, not a sentence",
      "body": "The verdict described is not handed down later. It is the choice already made when a person turns from what would expose them.",
      "author": "Albert Barnes",
      "year": "1834"
    },
    "context": "Nicodemus comes at night…\n\nJohn writes decades later…",
    "divergence": null,
    "question": "What would you rather not have looked at closely?",
    "art_tone": "indigo"
  }
]
```

### Import rules

- Upsert on `(book_slug, day_number)` — re-delivering a file overwrites.
- Reject a session whose passage returns no verses from the WEB table.
- Reject an author/year mismatch or an author outside the three permitted.
- Reject `NIV`, `ESV`, `NLT`, `NASB`, `CSB`, `NKJV`, `NABRE`, `The Message` anywhere in the file.
- Report every rejected day by number; import the rest.

## Order of work

1. Replace the 7 generated rows with marked placeholders.
2. Importer plus validation, ready for your file.
3. Stripe checkout, account creation, the one email.
4. My Plan.
5. The session, six steps, resumable.
6. Cancel, sign-in-link form, dark mode pass.