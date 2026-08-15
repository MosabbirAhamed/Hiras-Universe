"use client"

import React, { useState } from 'react'
import Link from 'next/link'

type AdminPageItem = {
    id: string
    title?: string
    slug?: string
    status?: string
}

export default function PageList({ initialPages }: { initialPages: AdminPageItem[] }) {
    const [pages, setPages] = useState(initialPages)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [error, setError] = useState('')

    async function handleDelete(id: string) {
        if (!confirm('Delete this page? This action cannot be undone.')) return

        setDeletingId(id)
        setError('')
        try {
            const response = await fetch(`/api/pages/${id}`, { method: 'DELETE' })
            const data = await response.json().catch(() => null)
            if (!response.ok) throw new Error(data?.error || 'Could not delete page')
            setPages((current) => current.filter((page) => page.id !== id))
        } catch (deleteError) {
            setError(deleteError instanceof Error ? deleteError.message : 'Could not delete page')
        } finally {
            setDeletingId(null)
        }
    }

    if (!pages.length) {
        return (
            <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
                No content pages have been created yet.
            </div>
        )
    }

    return (
        <div className="grid gap-3">
            {error && (
                <div role="alert" className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {pages.map((page) => (
                <article
                    key={page.id}
                    className="flex flex-col gap-4 rounded-lg border border-cream bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                    <div className="min-w-0">
                        <div className="truncate font-medium text-charcoal">{page.title || 'Untitled page'}</div>
                        <div className="mt-1 truncate text-sm text-taupe">
                            /{page.slug || ''} <span aria-hidden="true">&middot;</span> {page.status || 'draft'}
                        </div>
                    </div>
                    <div className="flex gap-2 sm:shrink-0">
                        <Link
                            href={`/admin/pages/${page.id}`}
                            className="inline-flex min-h-10 flex-1 items-center justify-center rounded border border-gray-200 px-3 py-2 text-sm transition hover:bg-gray-50 sm:flex-none"
                        >
                            Edit
                        </Link>
                        <button
                            type="button"
                            onClick={() => handleDelete(page.id)}
                            disabled={deletingId !== null}
                            className="inline-flex min-h-10 flex-1 items-center justify-center rounded border border-red-200 px-3 py-2 text-sm text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
                        >
                            {deletingId === page.id ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </article>
            ))}
        </div>
    )
}
