import { cn } from '@/lib/utils'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Montserrat } from 'next/font/google'
import { ReactNode } from 'react'
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { Toaster } from 'react-hot-toast'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'

const montserrat = Montserrat({ subsets: ['latin'] })

export const metadata = {
  title: 'Aura AI - Creative Chatbot',
  description: 'A creative AI chatbot powered by GPT-4o-mini.',
}

export default async function Layout({ children }: { children: ReactNode }) {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'flex min-h-screen flex-col bg-gradient-to-br from-background to-background-secondary text-foreground antialiased',
          montserrat.className
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex-1 flex flex-col">
            <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
              <div className="container flex h-14 sm:h-16 items-center justify-between px-2 sm:px-4 md:px-8">
                <Link href="/" className="flex items-center space-x-2">
                  <span className="font-bold text-lg sm:text-xl md:text-2xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                    Aura AI
                  </span>
                </Link>
                <nav className="flex items-center space-x-4">
                  <Link href="/" className="text-sm sm:text-base hover:text-purple-500 transition-colors">
                    Home
                  </Link>
                  {session && (
                    <Link href="/history" className="text-sm sm:text-base hover:text-purple-500 transition-colors">
                      History
                    </Link>
                  )}
                  {session ? (
                    <Link href="/profile" className="text-sm sm:text-base hover:text-purple-500 transition-colors">
                      Profile
                    </Link>
                  ) : (
                    <Link href="/login" className="text-sm sm:text-base hover:text-purple-500 transition-colors">
                      Login
                    </Link>
                  )}
                  <a
                    href="https://github.com/yourusername/aura-ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm sm:text-base text-gray-600 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 transition-colors"
                  >
                    GitHub
                  </a>
                  <ThemeToggle />
                </nav>
              </div>
            </header>
            <main className="flex-1">
              <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
            </main>
            <footer className="border-t border-border bg-background/80 backdrop-blur-sm py-2 sm:py-4">
              <div className="container text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Powered by GPT-4o-mini and the AI SDK | &copy; {new Date().getFullYear()} Aura AI
              </div>
            </footer>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

