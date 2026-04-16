import { clsx } from 'clsx'
import { useCallback } from 'react'

export const useLinkClass = () => {
  return useCallback((isActive: boolean, bg = true) => {
    return clsx(
      bg &&
        (isActive
          ? 'bg-[#88c0d0] dark:bg-[#81a1c1]'
          : 'hover:bg-gray-300 dark:hover:bg-gray-700'),
      isActive
        ? 'fill-gray-900 text-gray-900 dark:fill-gray-50 dark:text-gray-50'
        : 'fill-gray-600 text-gray-600 hover:fill-gray-900 hover:text-gray-900 dark:fill-gray-200 dark:text-gray-200 dark:hover:fill-gray-50 dark:hover:text-gray-50'
    )
  }, [])
}