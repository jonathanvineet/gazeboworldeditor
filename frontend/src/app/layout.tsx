import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Gazebo Studio',
  description: 'Professional browser-based robotics simulation IDE',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-[#1e1e1e] text-[#cccccc]">{children}</body>
    </html>
  )
}
