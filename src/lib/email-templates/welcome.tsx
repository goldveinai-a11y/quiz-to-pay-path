import * as React from 'react'
import { Text } from '@react-email/components'
import { Shell, paragraph } from './_layout'
import type { TemplateEntry } from './registry'

interface Props {
  name?: string | null
  bookTitle?: string
  signInUrl?: string
}

const Email = ({ name, bookTitle = 'your plan', signInUrl = '#' }: Props) => (
  <Shell
    preview="Day 1 is open."
    title={name ? `${name}, Day 1 is open` : 'Day 1 is open'}
    cta={{ label: 'Open Day 1', href: signInUrl }}
  >
    <Text style={paragraph}>
      Your plan is {bookTitle}. One session a day, about ten minutes, six short steps.
    </Text>
    <Text style={paragraph}>
      This link is how you get back in — no password, ever. Keep this email.
    </Text>
  </Shell>
)

export const template = {
  component: Email,
  subject: 'Day 1 is open — Plainly',
  displayName: 'Welcome — Day 1 is open',
  previewData: { bookTitle: 'The Gospel of John', signInUrl: 'https://www.bibleroutine.app/plan/1' },
} satisfies TemplateEntry