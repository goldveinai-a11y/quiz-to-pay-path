import * as React from 'react'
import { Text } from '@react-email/components'
import { Shell, paragraph } from './_layout'
import type { TemplateEntry } from './registry'

interface Props {
  bookTitle?: string
  sessions?: number
  notes?: number
  reviewUrl?: string
}

const Email = ({ bookTitle = 'your plan', sessions = 30, notes = 0, reviewUrl = '#' }: Props) => (
  <Shell
    preview="Thirty days, finished."
    title="Thirty days, finished"
    cta={{ label: 'Leave a line', href: reviewUrl }}
  >
    <Text style={paragraph}>
      You read {bookTitle} — {sessions} sessions, {notes} notes in your own words.
    </Text>
    <Text style={paragraph}>
      If it was worth the ten minutes a day, one line from you helps someone else start.
    </Text>
  </Shell>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) => `You finished ${data['bookTitle'] ?? 'your plan'}`,
  displayName: 'Plan finished',
  previewData: {
    bookTitle: 'The Gospel of John',
    sessions: 30,
    notes: 18,
    reviewUrl: 'https://www.bibleroutine.app/plan?review=1',
  },
} satisfies TemplateEntry