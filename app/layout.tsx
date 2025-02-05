import "./globals.css"
import { Inter } from "next/font/google"
import Link from "next/link"
import { AuthButton } from "./auth-button"
import { ThemeProvider } from "next-themes"
import { DarkModeToggle } from "./components/DarkModeToggle"
import { Sidebar } from "./components/Sidebar"
import { Toaster } from "@/components/ui/toaster"
import type { Metadata } from "next"
import type React from "react" // Added import for React

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Professional Blog",
  description: "A professional blog built with Next.js and Supabase",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-between h-16">
                    <div className="flex">
                      <div className="flex-shrink-0 flex items-center">
                        <Link href="/">
                          <img
                            className="h-8 w-auto"
                            src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
                            alt="Workflow"
                          />
                        </Link>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <DarkModeToggle />
                      <AuthButton />
                    </div>
                  </div>
                </div>
              </header>
              <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>
              </main>
              <footer className="bg-white dark:bg-gray-800 shadow-sm">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                  <p className="text-center text-sm text-gray-500">© 2023 Professional Blog. All rights reserved.</p>
                </div>
              </footer>
            </div>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

