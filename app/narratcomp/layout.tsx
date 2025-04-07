import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Narrative Comprehension',
}

export default function NarrativeCompLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
} 