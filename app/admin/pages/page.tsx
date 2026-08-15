import React from 'react'
import Link from 'next/link'
import { getPages } from '../../../src/lib/repositories/fileRepo'

export default async function AdminPages() {
  const pages = await getPages()
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Pages</h2>
        <Link href="/admin/pages/new" className="px-3 py-2 bg-mocha text-ivory rounded">Add page</Link>
      </div>
      <div className="grid gap-2">
        {pages.map((p:any) => (
          <div key={p.id} className="p-3 bg-ivory border border-cream rounded flex items-center justify-between">
            <div>
              <div className="font-medium">{p.title}</div>
              <div className="text-sm text-taupe">/{p.slug} — {p.status}</div>
            </div>
            <div className="space-x-2">
              <Link href={`/admin/pages/${p.id}`} className="px-3 py-1 border rounded">Edit</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
