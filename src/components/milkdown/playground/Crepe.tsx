'use client'

import clsx from 'clsx'
import { Crepe } from '@milkdown/crepe'
import { editorViewCtx, parserCtx } from '@milkdown/kit/core'
import { listener, listenerCtx } from '@milkdown/kit/plugin/listener'
import { Slice } from '@milkdown/kit/prose/model'
import { Selection } from '@milkdown/kit/prose/state'
import { getMarkdown } from '@milkdown/kit/utils'
import { eclipse } from '@uiw/codemirror-theme-eclipse'
import { useAtomValue, useSetAtom } from 'jotai'
import { FC, MutableRefObject, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { useToast } from '@/components/milkdown/toast'
import { useDarkMode } from '@/providers/milkdown/DarkModeProvider'
import { useLinkClass } from '@/hooks/milkdown/useLinkClass'

import { crepeAPI } from './atom'

const STORAGE_KEY = 'milkdown_content'

const DEFAULT_TEMPLATE = `# Milkdown

👋 Welcome to Milkdown. We are so glad to see you here!

💭 You may wonder, what is Milkdown? Please write something here.

> ⚠️ **Not the right side!**
>
> Please try something on the left side.

![1.00](/polar.jpeg 'Hello by a polar bear')

You're seeing this editor called **🥞Crepe**, which is an editor built on top of Milkdown.

If you want to install this editor, you can run \`npm install @milkdown/crepe\`. Then you can use it like this:

\`\`\`js
import { Crepe } from '@milkdown/crepe'
import '@milkdown/crepe/theme/common/style.css'
// We have some themes for you to choose, ex.
import '@milkdown/crepe/theme/frame.css'

// Or you can create your own theme
import './your-theme.css'

const crepe = new Crepe({
  root: '#app',
  defaultValue: '# Hello, Milkdown!',
})

crepe.create().then(() => {
  console.log('Milkdown is ready!')
})

// Before unmount
crepe.destroy()
\`\`\`

---

## Structure

> 🍼 [Milkdown][repo] is a WYSIWYG markdown editor framework.
>
> Which means you can build your own markdown editor with Milkdown.

In the real world, a typical milkdown editor is built on top of 3 layers:

- [x] 🥛 Core: The core of Milkdown, which provides the plugin loading system with the editor concepts.
- [x] 🧇 Plugins: A set of plugins that can be used to extend the functionalities of the editor.
- [x] 🍮 Components: Some headless components that can be used to build your own editor.

At the start, you may find it hard to understand all these concepts.
But don't worry, we have this \`@milkdown/crepe\` editor for you to get started quickly.

---

## You can do more with Milkdown

In Milkdown, you can extend the editor in many ways:

| Feature      | Description                                          | Example                   |
| ------------ | ---------------------------------------------------- | ------------------------- |
| 🎨 Theme     | Create your own theme with CSS                       | Nord, Dracula             |
| 🧩 Plugin    | Create your own plugin to extend the editor          | Search, Collab            |
| 📦 Component | Create your own component to build your own editor   | Slash Menu, Toolbar       |
| 📚 Syntax    | Create your own syntax to extend the markdown parser | Image with Caption, LaTex |

We have provided a lot of plugins and components, with an out-of-the-box crepe editor for you to use and learn.

---

## Open Source

- Milkdown is an open-source project under the MIT license.
- Everyone is welcome to contribute to the project, and you can use it in your own project for free.
- Please let me know what you are building with Milkdown, I would be so glad to see that!

Maintaining Milkdown is a lot of work, and we are working on it in our spare time.
If you like Milkdown, please consider supporting us by [sponsoring][sponsor] the project.
We'll be so grateful for your support.

## Who built Milkdown?

Milkdown is built by [Mirone][mirone] and designed by [Meo][meo].

[repo]: https://github.com/Milkdown/milkdown
[mirone]: https://github.com/Saul-Mirone
[meo]: https://meo.cool
[sponsor]: https://github.com/sponsors/Saul-Mirone`

const getStoredContent = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(STORAGE_KEY)
}

const setStoredContent = (markdown: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, markdown)
  }
}

interface MilkdownProps {
  onChange: (markdown: string) => void
  onExpandMilkdown?: () => void
  expandedSide?: 'cm' | 'milkdown' | null
  setExpandedSide?: (side: 'cm' | 'milkdown' | null) => void
}

const CrepeEditor: FC<MilkdownProps> = ({ onChange, onExpandMilkdown, expandedSide, setExpandedSide }) => {
  const crepeRef = useRef<Crepe | null>(null)
  const mounted = useRef(false)
  const darkMode = useDarkMode()
  const divRef = useRef<HTMLDivElement>(null)
  const loading = useRef(false)
  const linkClass = useLinkClass()
  const toast = useToast()
  const setCrepeAPI = useSetAtom(crepeAPI)
  const { onExportDocx } = useAtomValue(crepeAPI)

  // Hide editor until fully initialized with final content (prevents default-template flash)
  const [ready, setReady] = useState(false)

  // Keep latest callback/toast without re-creating editor
  const onChangeRef = useRef(onChange)
  const toastRef = useRef(toast)
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])
  useEffect(() => {
    toastRef.current = toast
  }, [toast])

  // Remember what we booted with (to ignore accidental external overwrite with DEFAULT_TEMPLATE)
  const initialValueRef = useRef<string>(DEFAULT_TEMPLATE)

  const replaceEditorContent = (markdown: string) => {
    const crepe = crepeRef.current
    if (!crepe) return

    crepe.editor.action((ctx) => {
      const view = ctx.get(editorViewCtx)
      if (!view) return

      const parser = ctx.get(parserCtx)
      const doc = parser(markdown)
      if (!doc) return

      const state = view.state
      const selection = state.selection
      const { from } = selection

      let tr = state.tr
      tr = tr.replace(0, state.doc.content.size, new Slice(doc.content, 0, 0))

      const docSize = doc.content.size
      const safeFrom = Math.max(0, Math.min(from, Math.max(0, docSize - 2)))
      const pos = Math.min(safeFrom, Math.max(1, tr.doc.content.size - 1))
      tr = tr.setSelection(Selection.near(tr.doc.resolve(pos)))

      view.dispatch(tr)
    })
  }

  useLayoutEffect(() => {
    mounted.current = true

    if (!divRef.current || loading.current) return
    loading.current = true
    setReady(false)

    // Priority:
    // 1) localStorage has key -> load it
    // 2) otherwise -> DEFAULT_TEMPLATE
    const stored = getStoredContent()
    const initialValue = stored === null ? DEFAULT_TEMPLATE : stored
    initialValueRef.current = initialValue

    const crepe = new Crepe({
      root: divRef.current,
      defaultValue: initialValue,
      featureConfigs: {
        [Crepe.Feature.CodeMirror]: {
          theme: darkMode ? undefined : eclipse,
        },
        [Crepe.Feature.LinkTooltip]: {
          onCopyLink: () => {
            toastRef.current('Link copied', 'success')
          },
        },
      },
    })

    // Instant localStorage persistence
    crepe.editor
      .config((ctx) => {
        ctx.get(listenerCtx).markdownUpdated((_, markdown) => {
          setStoredContent(markdown)
          onChangeRef.current(markdown)
        })
      })
      .use(listener)

    crepe
      .create()
      .then(() => {
        if (!mounted.current) {
          crepe.destroy()
          return
        }

        ;(crepeRef as MutableRefObject<Crepe>).current = crepe
        loading.current = false

        // Extra safety: ensure the editor content is exactly initialValue before showing it
        const current = crepe.getMarkdown()
        if (current !== initialValueRef.current) {
          replaceEditorContent(initialValueRef.current)
        }

        // Sync final content to parent once (after editor is ready)
        onChangeRef.current(crepe.getMarkdown())

        // Make sure everything has painted before revealing (prevents any 1-frame flash)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (mounted.current) setReady(true)
          })
        })
      })
      .catch(() => {
        loading.current = false
        setReady(false)
      })

    setCrepeAPI({
      loaded: true,
      onExportDocx: async () => {
        const md = crepe.editor.action(getMarkdown())

        const response = await fetch('/api/generate-docx', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ markdown: md, filename: 'document.docx' }),
        })

        if (!response.ok) {
          toastRef.current('Export failed', 'fail')
          return
        }

        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'document.docx'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        toastRef.current('Document exported', 'success')
      },

      update: (markdown: string) => {
        const crepe = crepeRef.current
        if (!crepe) return

        // If we booted from stored content (not default),
        // ignore accidental external overwrite with DEFAULT_TEMPLATE.
        if (initialValueRef.current !== DEFAULT_TEMPLATE && markdown === DEFAULT_TEMPLATE) return

        if (crepe.getMarkdown() === markdown) return
        replaceEditorContent(markdown)
      },
    })

    return () => {
      mounted.current = false
      setReady(false)

      if (!crepeRef.current) return
      crepeRef.current.destroy()
      crepeRef.current = null
      loading.current = false

      setCrepeAPI({
        loaded: false,
        onExportDocx: async () => {},
        update: () => {},
      })
    }
  }, [darkMode, setCrepeAPI])

  return (
    <div className="flex h-full flex-col">
      <div
        className={clsx(
          'flex items-center justify-between px-4 py-2 font-light border-b dark:border-gray-600',
          expandedSide === 'milkdown'
            ? 'h-12 bg-gray-200 dark:bg-gray-700 border-gray-200'
            : 'h-10 bg-gray-200 dark:bg-gray-700 border-gray-200'
        )}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (expandedSide === 'milkdown') setExpandedSide?.(null)
              else onExpandMilkdown?.()
            }}
            className={clsx(
              linkClass(false),
              'flex items-center justify-center rounded-full hover:bg-[#eceef4]/70 dark:hover:bg-[#32353a]/70',
              expandedSide === 'milkdown' ? 'h-10 w-10' : 'h-8 w-8'
            )}
          >
            <span className="material-symbols-outlined text-base!">
              {expandedSide === 'milkdown' ? 'fullscreen_exit' : 'fullscreen'}
            </span>
          </button>
          <div>
            <span>Milkdown Editor</span>
          </div>
        </div>

        {expandedSide === 'milkdown' && (
          <div className="flex gap-1">
            <button
              onClick={() => onExportDocx()}
              className={clsx(
                linkClass(false),
                'flex items-center justify-center rounded-full hover:bg-[#eceef4]/70 dark:hover:bg-[#32353a]/70',
                expandedSide === 'milkdown' ? 'h-10 w-10' : 'h-8 w-8'
              )}
            >
              <span className="material-symbols-outlined text-base!">file_download</span>
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto touch-manipulation">
        <div
          className={clsx(
            'crepe flex h-full flex-1 flex-col',
            ready ? 'visible' : 'invisible pointer-events-none'
          )}
          ref={divRef}
        />
      </div>
    </div>
  )
}

export default CrepeEditor