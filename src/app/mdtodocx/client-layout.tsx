'use client'

import '@milkdown/crepe/theme/common/style.css'
import '@/styles/milkdown/crepe.css'
import '@/styles/milkdown/globals.css'
import '@/styles/milkdown/playground.css'
import '@/styles/milkdown/prosemirror.css'
import '@/styles/milkdown/toast.css'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { DarkModeProvider } from '@/providers/milkdown/DarkModeProvider'
import { ToastProvider } from '@/components/milkdown/toast'

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <DarkModeProvider>
      <ToastProvider>
        <main className="h-[100dvh] flex flex-col bg-white dark:bg-[#1b1c1d]">
          <header className="shrink-0 h-10 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151b2b] flex items-center justify-between px-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 px-2 py-1.5 rounded-lg transition-colors duration-200"
            >
              <span className="material-icons-outlined text-lg">arrow_back</span>
              <span className="text-sm font-medium">Back to Home</span>
            </Link>
            <span className="text-sm font-semibold text-slate-800 dark:text-white">MdtoDocx</span>
          </header>
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        </main>
      </ToastProvider>
    </DarkModeProvider>
  )
}