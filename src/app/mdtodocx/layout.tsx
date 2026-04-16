import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import ClientLayout from './client-layout'

export const metadata: Metadata = {
  title: 'MdtoDocx - Milkdown Editor',
  description: 'Markdown to DOCX converter with Milkdown WYSIWYG editor',
}

export default function MdtodocxLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Next.js will automatically inject these into the document head */}
      <link rel="stylesheet" href="https://unpkg.com/prism-themes/themes/prism-nord.css" />
      <link href="https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300..900;1,300..900&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap" rel="stylesheet" />
      
      <ClientLayout>{children}</ClientLayout>
    </>
  )
}
