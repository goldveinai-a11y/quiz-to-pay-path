import * as React from 'react'
import { Text } from '@react-email/components'
import { Shell, paragraph } from './_layout'
import type { TemplateEntry } from './registry'

interface Props {
  day?: number
  title?: string
  quote?: string
  reference?: string
  planUrl?: string
}

const Email = ({ day = 1, quote = '', reference = '', planUrl = '#' }: Props) => (
  <Shell
    preview="Your place is kept."
    title="Your place is kept"
    {...(quote ? { quote: { text: quote, reference } } : {})}
    cta={{ label: `Pick up Day ${day}`, href: planUrl }}
  >
    <Text style={paragraph}>
      Day {day} is still waiting — nothing expired, nothing reset.
    </Text>
    <Text style={paragraph}>Here is one line from the session you left.</Text>
  </Shell>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `Day ${data['day'] ?? 1} is still waiting — ${data['title'] ?? 'Plainly'}`,
  displayName: 'Win-back nudge',
  previewData: {
    day: 5,
    title: 'Born again',
    quote: 'The wind blows where it wants to, and you hear its sound.',
    reference: 'John 3:8',
    planUrl: 'https://www.bibleroutine.app/plan/5',
  },
} satisfies TemplateEntry