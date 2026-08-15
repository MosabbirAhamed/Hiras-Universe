import React from 'react'
import { getAllMedia } from '../../../src/lib/repositories/mediaRepo'
import MediaLibrary from './MediaLibrary'

export const dynamic = 'force-dynamic'

export default async function AdminMediaPage() {
  const media = await getAllMedia()
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Media Library</h2>
      </div>
      <MediaLibrary initialItems={media} />
    </div>
  )
}
