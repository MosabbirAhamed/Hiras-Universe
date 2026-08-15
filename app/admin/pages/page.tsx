import React from 'react'
import Link from 'next/link'
import { getPages } from '../../../src/lib/repositories/fileRepo'
import PageList from './PageList'

export default async function AdminPages() {
  const pages = await getPages()

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium text-charcoal">Pages</h1>
          <p className="mt-1 text-sm text-taupe">Manage informational and editorial storefront pages.</p>
        </div>
        <Link
          href="/admin/pages/new"
          className="inline-flex min-h-10 items-center justify-center rounded bg-mocha px-4 py-2 text-sm font-medium text-ivory transition hover:opacity-90"
        >
          Add page
        </Link>
      </div>
      <PageList initialPages={pages} />
    </div>
  )
}
