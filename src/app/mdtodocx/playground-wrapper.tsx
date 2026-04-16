'use client'

import { useHydrateAtoms } from 'jotai/utils'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

import { Dual } from '../../components/milkdown/playground'
import { markdown } from '../../components/milkdown/playground/atom'
import { decode } from '../../utils/share'

const PlaygroundContent = ({ template }: { template: string }) => {
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const text = mounted && searchParams ? searchParams.get('text') : null
  const value = text ? decode(text) : template

  useHydrateAtoms([[markdown, value]])

  return (
    <div className="m-0 grid grid-rows-1 border-b border-gray-300 md:mt-0 md:grid-cols-2 dark:border-gray-600">
      <Dual />
    </div>
  )
}

const PlaygroundWithSuspense = ({ template }: { template: string }) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PlaygroundContent template={template} />
    </Suspense>
  )
}

export default function PlaygroundWrapper({ template }: { template: string }) {
  return <PlaygroundWithSuspense template={template} />
}