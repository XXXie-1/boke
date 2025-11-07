import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Vercel + Supabase Starter',
  description: 'A modern full-stack web application starter kit',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}