DELETE FROM public.study_sessions;

INSERT INTO public.study_sessions
  (book_slug, day_number, title, setup, reference, book, chapter, verse_start, verse_end,
   highlight_word, insight_title, insight_body, insight_author, insight_year, context_body,
   divides, divide_question, divide_readings, divide_common, question, art_tone)
VALUES
 ('john', 1, '[PLACEHOLDER] In the beginning, and what that claims', '[PLACEHOLDER] One sentence of setup goes here.', 'John 1:1-5', 'John', 1, 1, 5,
  'light', '[PLACEHOLDER] The insight is stated as a claim', '[PLACEHOLDER] Two or three sentences of the condensed insight go here. Replace on import.', 'Matthew Henry', '1710',
  '[PLACEHOLDER] First paragraph of what it meant then.

[PLACEHOLDER] Second paragraph of what it meant then.',
  false, NULL, NULL, NULL, '[PLACEHOLDER] One question, centred, with space around it.', 'teal'),
 ('john', 2, '[PLACEHOLDER] The witness who refuses the title', '[PLACEHOLDER] One sentence of setup goes here.', 'John 1:19-23', 'John', 1, 19, 23,
  'voice', '[PLACEHOLDER] The insight is stated as a claim', '[PLACEHOLDER] Two or three sentences of the condensed insight go here. Replace on import.', 'John Gill', '1746',
  '[PLACEHOLDER] First paragraph of what it meant then.

[PLACEHOLDER] Second paragraph of what it meant then.',
  false, NULL, NULL, NULL, '[PLACEHOLDER] One question, centred, with space around it.', 'terra'),
 ('john', 3, '[PLACEHOLDER] Water, and the party that nearly failed', '[PLACEHOLDER] One sentence of setup goes here.', 'John 2:1-11', 'John', 2, 1, 11,
  'hour', '[PLACEHOLDER] The insight is stated as a claim', '[PLACEHOLDER] Two or three sentences of the condensed insight go here. Replace on import.', 'Albert Barnes', '1834',
  '[PLACEHOLDER] First paragraph of what it meant then.

[PLACEHOLDER] Second paragraph of what it meant then.',
  true, '[PLACEHOLDER] What is actually at stake in this passage?',
  '[{"tradition":"Catholic","reading":"[PLACEHOLDER] One sentence for this tradition.","verses":"John 2:5"},{"tradition":"Orthodox","reading":"[PLACEHOLDER] One sentence for this tradition.","verses":"John 2:4"},{"tradition":"Protestant","reading":"[PLACEHOLDER] One sentence for this tradition.","verses":"John 2:11"}]'::jsonb,
  '[PLACEHOLDER] One line on what they all agree about.', '[PLACEHOLDER] One question, centred, with space around it.', 'indigo'),
 ('john', 4, '[PLACEHOLDER] A night visit and an impossible instruction', '[PLACEHOLDER] One sentence of setup goes here.', 'John 3:1-8', 'John', 3, 1, 8,
  'wind', '[PLACEHOLDER] The insight is stated as a claim', '[PLACEHOLDER] Two or three sentences of the condensed insight go here. Replace on import.', 'Matthew Henry', '1710',
  '[PLACEHOLDER] First paragraph of what it meant then.

[PLACEHOLDER] Second paragraph of what it meant then.',
  false, NULL, NULL, NULL, '[PLACEHOLDER] One question, centred, with space around it.', 'olive'),
 ('john', 5, '[PLACEHOLDER] Light, and the people who avoid it', '[PLACEHOLDER] One sentence of setup goes here.', 'John 3:16-21', 'John', 3, 16, 21,
  'light', '[PLACEHOLDER] The insight is stated as a claim', '[PLACEHOLDER] Two or three sentences of the condensed insight go here. Replace on import.', 'Albert Barnes', '1834',
  '[PLACEHOLDER] First paragraph of what it meant then.

[PLACEHOLDER] Second paragraph of what it meant then.',
  false, NULL, NULL, NULL, '[PLACEHOLDER] One question, centred, with space around it.', 'teal'),
 ('john', 6, '[PLACEHOLDER] The conversation nobody expected him to have', '[PLACEHOLDER] One sentence of setup goes here.', 'John 4:7-14', 'John', 4, 7, 14,
  'water', '[PLACEHOLDER] The insight is stated as a claim', '[PLACEHOLDER] Two or three sentences of the condensed insight go here. Replace on import.', 'John Gill', '1746',
  '[PLACEHOLDER] First paragraph of what it meant then.

[PLACEHOLDER] Second paragraph of what it meant then.',
  true, '[PLACEHOLDER] What is actually at stake in this passage?',
  '[{"tradition":"Catholic","reading":"[PLACEHOLDER] One sentence for this tradition.","verses":"John 4:14"},{"tradition":"Protestant","reading":"[PLACEHOLDER] One sentence for this tradition.","verses":"John 4:10"}]'::jsonb,
  '[PLACEHOLDER] One line on what they all agree about.', '[PLACEHOLDER] One question, centred, with space around it.', 'terra'),
 ('john', 7, '[PLACEHOLDER] Healing at a distance, on someone else''s word', '[PLACEHOLDER] One sentence of setup goes here.', 'John 4:46-53', 'John', 4, 46, 53,
  'believed', '[PLACEHOLDER] The insight is stated as a claim', '[PLACEHOLDER] Two or three sentences of the condensed insight go here. Replace on import.', 'Matthew Henry', '1710',
  '[PLACEHOLDER] First paragraph of what it meant then.

[PLACEHOLDER] Second paragraph of what it meant then.',
  false, NULL, NULL, NULL, '[PLACEHOLDER] One question, centred, with space around it.', 'indigo');