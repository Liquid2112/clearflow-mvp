import '@/app/globals.css'
import type { Metadata } from 'next'
import { Inter, Fraunces } from 'next/font/google'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

// Clean, highly legible body sans.
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

// Characterful display serif for headlines — gives the product an editorial,
// human feel instead of the default all-sans template look.
const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
})

export const metadata: Metadata = {
  title: 'ClearFlow — Know your water. Grade it. Improve it.',
  description:
    'ClearFlow turns public EPA water-system data into a personalized water grade and a shippable treatment plan you can iterate on.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="min-h-screen flex flex-col antialiased">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
