import { getPlaygroundTemplate } from '@/lib/milkdown/playground'

import PlaygroundWrapper from './playground-wrapper'

export default async function Home() {
  const template = await getPlaygroundTemplate()

  return <PlaygroundWrapper template={template} />
}