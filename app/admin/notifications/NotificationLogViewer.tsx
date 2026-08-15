"use client"

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import type { NotificationLogEntry } from '../../../src/types/models'
import { filterNotificationLogs } from '../../../src/lib/analytics'

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch {
    return dateStr
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'sent':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    case 'mocked':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'queued':
      return 'bg-amber-100 text-amber-800 border-amber-200'
    case 'failed':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

function getChannelBadge(channel: string) {
  return channel === 'email'
    ? 'bg-purple-50 text-purple-700 border-purple-200'
    : 'bg-teal-50 text-teal-700 border-teal-200'
}

export default function NotificationLogViewer({ initialLogs }: { initialLogs: NotificationLogEntry[] }) {
  const [eventFilter, setEventFilter] = useState('all')
  const [channelFilter, setChannelFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [orderQuery, setOrderQuery] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 25

  const filtered = useMemo(() => {
    return filterNotificationLogs(initialLogs, {
      event: eventFilter,
      channel: channelFilter,
      status: statusFilter,
      orderNumber: orderQuery
    })
  }, [initialLogs, eventFilter, channelFilter, statusFilter, orderQuery])

  const totalPages = Math.ceil(filtered.length / pageSize) || 1
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page])

  return (
    <div className="space-y-4">
      {/* Filter Panel */}
      <div className="rounded-lg border border-cream bg-ivory p-4 shadow-2xs">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">
            Search Order Number
            <input
              type="text"
              value={orderQuery}
              onChange={(e) => {
                setOrderQuery(e.target.value)
                setPage(1)
              }}
              placeholder="e.g. HN-1001"
              className="mt-1 w-full rounded border border-cream bg-white px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-mocha"
            />
          </label>

          <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">
            Event Type
            <select
              value={eventFilter}
              onChange={(e) => {
                setEventFilter(e.target.value)
                setPage(1)
              }}
              className="mt-1 w-full rounded border border-cream bg-white px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-mocha"
            >
              <option value="all">All Events</option>
              <option value="ORDER_CREATED">ORDER_CREATED</option>
              <option value="ORDER_PROCESSING">ORDER_PROCESSING</option>
              <option value="ORDER_SHIPPED">ORDER_SHIPPED</option>
              <option value="ORDER_DELIVERED">ORDER_DELIVERED</option>
              <option value="ORDER_CANCELLED">ORDER_CANCELLED</option>
              <option value="PAYMENT_CONFIRMED">PAYMENT_CONFIRMED</option>
            </select>
          </label>

          <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">
            Channel
            <select
              value={channelFilter}
              onChange={(e) => {
                setChannelFilter(e.target.value)
                setPage(1)
              }}
              className="mt-1 w-full rounded border border-cream bg-white px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-mocha"
            >
              <option value="all">All Channels</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
            </select>
          </label>

          <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">
            Delivery Status
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="mt-1 w-full rounded border border-cream bg-white px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-mocha"
            >
              <option value="all">All Statuses</option>
              <option value="sent">Sent</option>
              <option value="mocked">Mocked (Dev/Test)</option>
              <option value="failed">Failed</option>
              <option value="queued">Queued</option>
            </select>
          </label>
        </div>
      </div>

      {/* Summary count */}
      <div className="flex items-center justify-between text-xs text-taupe px-1">
        <span>
          Showing {paginated.length} of {filtered.length} logs ({initialLogs.length} total recorded)
        </span>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 border border-cream rounded bg-white text-xs disabled:opacity-40"
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 border border-cream rounded bg-white text-xs disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-cream bg-ivory p-8 text-center text-sm text-taupe">
          No notification logs match your filter criteria.
        </div>
      ) : (
        <div className="rounded-lg border border-cream bg-ivory overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-charcoal">
              <thead className="bg-cream/60 text-xs uppercase font-semibold text-taupe tracking-wider border-b border-cream">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Channel</th>
                  <th className="px-4 py-3">Recipient</th>
                  <th className="px-4 py-3">Provider</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Details / Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream">
                {paginated.map((log) => (
                  <tr key={log.id} className="hover:bg-cream/20 transition text-xs">
                    <td className="px-4 py-3 text-taupe whitespace-nowrap">{formatDate(log.createdAt)}</td>
                    <td className="px-4 py-3 font-semibold text-mocha whitespace-nowrap">
                      <Link href={`/admin/orders/${log.orderId}`} className="hover:underline">
                        {log.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-mono text-2xs font-semibold whitespace-nowrap">{log.event}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded border uppercase text-2xs font-semibold ${getChannelBadge(log.channel)}`}>
                        {log.channel}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-2xs">{log.recipient}</td>
                    <td className="px-4 py-3 text-taupe">{log.provider}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full border uppercase text-2xs font-semibold ${getStatusBadge(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-taupe max-w-xs truncate">
                      {log.error ? (
                        <span className="text-red-700 font-mono text-2xs bg-red-50 p-1 rounded border border-red-200">
                          {log.error}
                        </span>
                      ) : log.sentAt ? (
                        <span className="text-emerald-700 text-2xs">Delivered: {formatDate(log.sentAt)}</span>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
