import * as React from 'react'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

const INK = '#1c1917'
const PAPER = '#f6f1e7'
const MUTED = '#6b6257'
const TERRA = '#b4521f'

export const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif', margin: 0 }
const container = { maxWidth: '520px', backgroundColor: PAPER, padding: '28px 24px' }
const kicker = {
  margin: '0 0 20px',
  fontSize: '12px',
  letterSpacing: '.18em',
  textTransform: 'uppercase' as const,
  color: MUTED,
}
const heading = {
  margin: '0 0 16px',
  fontFamily: 'Georgia, serif',
  fontSize: '26px',
  lineHeight: '1.25',
  color: INK,
  fontWeight: 600,
}
export const paragraph = { margin: '0 0 14px', fontSize: '15px', lineHeight: '1.65', color: INK }
const quoteBox = {
  margin: '22px 0',
  padding: '16px 18px',
  borderLeft: `3px solid ${TERRA}`,
  backgroundColor: '#ffffff',
}
const quoteText = {
  margin: 0,
  fontFamily: 'Georgia, serif',
  fontSize: '17px',
  lineHeight: '1.6',
  color: INK,
}
const quoteRef = {
  margin: '8px 0 0',
  fontSize: '12px',
  letterSpacing: '.08em',
  textTransform: 'uppercase' as const,
  color: MUTED,
}
const button = {
  display: 'inline-block',
  backgroundColor: INK,
  color: PAPER,
  textDecoration: 'none',
  padding: '14px 26px',
  borderRadius: '12px',
  fontSize: '15px',
  fontWeight: 600,
}

export interface ShellProps {
  preview: string
  title: string
  children: React.ReactNode
  quote?: { text: string; reference: string }
  cta?: { label: string; href: string }
}

export const Shell = ({ preview, title, children, quote, cta }: ShellProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{preview}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={kicker}>BibleRoutine</Text>
        <Heading style={heading}>{title}</Heading>
        {children}
        {quote ? (
          <Section style={quoteBox}>
            <Text style={quoteText}>{quote.text}</Text>
            <Text style={quoteRef}>{quote.reference}</Text>
          </Section>
        ) : null}
        {cta ? (
          <Section style={{ marginTop: '26px' }}>
            <Button href={cta.href} style={button}>
              {cta.label}
            </Button>
          </Section>
        ) : null}
      </Container>
    </Body>
  </Html>
)