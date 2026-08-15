import React from 'react'
import MediaLibrary from './MediaLibrary'

async function getMedia() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/uploads`, { cache: 'no-store' })
  return res.json()
}

export default async function AdminMediaPage() {
  const media = await getMedia()
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Media Library</h2>
      </div>
      <MediaLibrary initialItems={media} />
    </div>
  )
}
