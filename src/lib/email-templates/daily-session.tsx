import * as React from 'react'
import { Text } from '@react-email/components'
import { Shell, paragraph } from './_layout'
import type { TemplateEntry } from './registry'

interface Props {
  day?: number
  title?: string
  reference?: string
  setup?: string
  streak?: number
  planUrl?: string
}

const Email = ({
  day = 1,
  title = 'Today’s session',
  reference = '',
  setup = '',
  streak = 0,
  planUrl = '#',
}: Props) => (
  <Shell
    preview={`${title}${reference ? ` — ${reference}` : ''}`}
    title={`Day ${day}: ${title}`}
    cta={{ label: `Read Day ${day}`, href: planUrl }}
  >
    {setup ? <Text style={paragraph}>{setup}</Text> : null}
    {streak >= 2 ? (
      <Text style={paragraph}>{streak} days in a row. Keep it going.</Text>
    ) : null}
  </Shell>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `Day ${data['day'] ?? 1} is open — ${data['title'] ?? 'BibleRoutine'}`,
  displayName: 'Daily session',
  previewData: {
    day: 3,
    title: 'The first sign',
    reference: 'John 2:1-11',
    setup: 'A wedding runs dry. Watch who notices first.',
    streak: 3,
    planUrl: 'https://www.bibleroutine.app/plan/3',
  },
} satisfies TemplateEntry