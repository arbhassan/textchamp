import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Non-Narrative Comprehension',
}

export default function NonNarrativeCompLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
} 