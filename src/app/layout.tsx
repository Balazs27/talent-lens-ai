import "./globals.css"
import type { ReactNode } from "react"
import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "TalentLens AI",
  description: "AI-powered talent matching for both sides of the hiring table",
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en" className={`${fontSans.variable} scroll-smooth`}>
      <body className={`${fontSans.className} min-h-screen antialiased`}>
        {children}
      </body>
    </html>
  )
}
