import * as React from 'react'
import { Section, Text } from '@react-email/components'
import { Shell, paragraph } from './_layout'

interface MagicLinkEmailProps {
  siteName?: string
  confirmationUrl: string
  token?: string
}

export const MagicLinkEmail = ({ confirmationUrl, token }: MagicLinkEmailProps) => (
  <Shell
    preview="Your sign-in link for BibleRoutine"
    title="Open your plan"
    cta={{ label: 'Open my plan', href: confirmationUrl }}
  >
    <Text style={paragraph}>
      No password needed. The button below signs you in on this device.
    </Text>
    {token ? (
      <Section style={codeBox}>
        <Text style={codeLabel}>Or type this code</Text>
        <Text style={codeText}>{token}</Text>
      </Section>
    ) : null}
    <Text style={footer}>
      Link and code work for 60 minutes, and only from this newest email. If you didn't ask for
      this, ignore it.
    </Text>
  </Shell>
)

export default MagicLinkEmail

const codeBox = {
  margin: '22px 0 0',
  padding: '16px 18px',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
}
const codeLabel = {
  margin: 0,
  fontSize: '12px',
  letterSpacing: '.18em',
  textTransform: 'uppercase' as const,
  color: '#6b6257',
}
const codeText = {
  margin: '6px 0 0',
  fontSize: '30px',
  letterSpacing: '.28em',
  fontWeight: 600,
  color: '#1c1917',
}
const footer = { margin: '26px 0 0', fontSize: '12px', lineHeight: '1.6', color: '#6b6257' }
