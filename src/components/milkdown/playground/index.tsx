'use client'

import clsx from 'clsx'
import { useSetAtom } from 'jotai'
import { useAtomCallback } from 'jotai/utils'
import dynamic from 'next/dynamic'
import { useRouter, useSearchParams } from 'next/navigation'
import { FC, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

import Loading from '@/components/milkdown/loading'

import { cmAPI, crepeAPI, focus, ExpandedSide, markdown } from './atom'

const STORAGE_KEY = 'milkdown_content'

const PlaygroundMilkdown = dynamic(() => import('./Crepe'), {
  ssr: false,
  loading: () => <Loading />,
})

const ControlPanel = dynamic(() => import('./ControlPanel'), {
  ssr: false,
  loading: () => <Loading />,
})

export const Dual: FC = () => {
  const queryString = useSearchParams()
  const [isFullscreen, setIsFullscreen] = useState(() => queryString?.get('fullscreen') === 'true')
  const [expandedSide, setExpandedSide] = useState<ExpandedSide>(null)

  const router = useRouter()

  // ---- NEW: Hydrate markdown atom from localStorage BEFORE editors paint ----
  const setMarkdown = useSetAtom(markdown)
  const [hydrated, setHydrated] = useState(false)
  const didHydrateRef = useRef(false)

  useLayoutEffect(() => {
    // Prevent double-run issues (React StrictMode dev)
    if (didHydrateRef.current) return
    didHydrateRef.current = true

    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      // Important: stored can be empty string; only null means "not set yet"
      if (stored !== null) {
        setMarkdown(stored)
      }
    }

    setHydrated(true)
  }, [setMarkdown])
  // ------------------------------------------------------------------------

  useEffect(() => {
    if (isFullscreen) {
      router.replace('/mdtodocx?fullscreen=true', { scroll: false })
    } else {
      router.replace('/mdtodocx', { scroll: false })
    }
  }, [isFullscreen, router])

  const onMilkdownChange = useAtomCallback(
    useCallback((get, _set, markdown: string) => {
      const cmAPIValue = get(cmAPI)
      const lock = get(focus) === 'cm'
      if (lock) return

      cmAPIValue.update(markdown)
    }, [])
  )

  const onCodemirrorChange = useAtomCallback(
    useCallback((get, _set, getCode: () => string) => {
      const value = getCode()
      const crepeAPIValue = get(crepeAPI)
      crepeAPIValue.update(value)
    }, [])
  )

  const onExpandMilkdown = useCallback(() => {
    setExpandedSide('milkdown')
  }, [])

  const onExpandCm = useCallback(() => {
    setExpandedSide('cm')
  }, [])

  useEffect(() => {
    if (isFullscreen || expandedSide) {
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [isFullscreen, expandedSide])

  // IMPORTANT: don't render panels until localStorage hydration is done
  // This prevents the "default template flash" on reload.
  if (!hydrated) {
    return <Loading />
  }

  return (
    <>
      <div
        className={clsx(
          expandedSide === 'milkdown' && 'hidden',
          expandedSide === 'cm' && 'fixed left-0 top-10 w-full h-[calc(100dvh-2.5rem)] z-[1004]',
          isFullscreen
            ? 'fixed left-0 top-0 w-full h-[30vh] z-[1005] bg-white/95 backdrop-blur-sm border-b border-gray-200 dark:bg-gray-900/95 dark:border-gray-600'
            : !expandedSide &&
                'fixed left-0 top-10 bottom-[50%] w-full h-auto md:right-0 md:left-auto md:bottom-0 md:w-1/2 md:top-auto md:h-[calc(100dvh-2.5rem)]'
        )}
        style={{ zIndex: 1003 }}
      >
        <ControlPanel
          isFullscreen={isFullscreen || expandedSide === 'cm'}
          setIsFullscreen={setIsFullscreen}
          onChange={onCodemirrorChange}
          onExpandCm={onExpandCm}
          expandedSide={expandedSide}
          setExpandedSide={setExpandedSide}
        />
      </div>

      <div
        className={clsx(
          expandedSide === 'cm' && 'hidden',
          expandedSide === 'milkdown' && 'fixed left-0 top-10 w-full h-[calc(100dvh-2.5rem)] z-[1004]',
          isFullscreen
            ? clsx('fullscreen expanded flex flex-col border-none fixed left-0 top-[30vh] w-full h-[70vh] z-[1004]')
            : !expandedSide &&
                'fixed left-0 top-[50%] bottom-0 w-full h-auto md:left-0 md:top-auto md:bottom-0 md:w-1/2 md:h-[calc(100dvh-2.5rem)]'
        )}
      >
        <PlaygroundMilkdown
          onChange={onMilkdownChange}
          onExpandMilkdown={onExpandMilkdown}
          expandedSide={expandedSide}
          setExpandedSide={setExpandedSide}
        />
      </div>
    </>
  )
}