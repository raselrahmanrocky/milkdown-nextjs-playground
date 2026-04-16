'use client'

import type { FC } from 'react'

import clsx from 'clsx'
import { useAtomValue } from 'jotai'

import { crepeAPI } from '@/components/milkdown/playground/atom'
import { useLinkClass } from '@/hooks/milkdown/useLinkClass'

import type { CodemirrorProps } from './codemirror'

import { Codemirror } from './codemirror'

interface ControlPanelProps extends CodemirrorProps {
  isFullscreen?: boolean
  setIsFullscreen?: (fullscreen: boolean) => void
  onExpandCm?: () => void
  expandedSide?: 'cm' | 'milkdown' | null
  setExpandedSide?: (side: 'cm' | 'milkdown' | null) => void
}

const ControlPanel: FC<ControlPanelProps> = ({ isFullscreen = false, onChange, setIsFullscreen, onExpandCm, expandedSide, setExpandedSide }) => {
  const linkClass = useLinkClass()
  const { onExportDocx } = useAtomValue(crepeAPI)

  return (
    <div className="flex h-full flex-col">
      <div className={clsx(
        'flex items-center justify-between px-4 py-2 font-light border-b dark:border-gray-600',
        isFullscreen ? 'h-12 bg-gray-200 dark:bg-gray-700 border-gray-200' : 'h-10 bg-gray-200 dark:bg-gray-700 border-gray-200'
      )}>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (isFullscreen || expandedSide === 'cm') {
                setIsFullscreen?.(false)
                setExpandedSide?.(null)
              } else {
                onExpandCm?.()
              }
            }}
            className={clsx(
              linkClass(false),
              'flex items-center justify-center rounded-full hover:bg-[#eceef4]/70 dark:hover:bg-[#32353a]/70',
              isFullscreen ? 'h-10 w-10' : 'h-8 w-8'
            )}
          >
            <span className="material-symbols-outlined text-base!">
              {isFullscreen || expandedSide === 'cm' ? 'fullscreen_exit' : 'fullscreen'}
            </span>
          </button>
          <div>
            <span>Milkdown Playground</span>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onExportDocx()}
            className={clsx(
              linkClass(false),
              'flex items-center justify-center rounded-full hover:bg-[#eceef4]/70 dark:hover:bg-[#32353a]/70',
              isFullscreen ? 'h-10 w-10' : 'h-8 w-8'
            )}
          >
            <span className="material-symbols-outlined text-base!">file_download</span>
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <Codemirror onChange={onChange} />
      </div>
    </div>
  )
}

export default ControlPanel