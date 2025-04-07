import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Visual Text Comprehension',
}

export default function VisualTextCompLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
} 