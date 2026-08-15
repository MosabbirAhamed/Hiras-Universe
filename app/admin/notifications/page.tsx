import React from 'react'
import { getNotificationLogs } from '../../../src/lib/repositories/fileRepo'
import NotificationLogViewer from './NotificationLogViewer'

export const metadata = {
  title: 'Notification Logs - Admin | Hira\'s Universe'
}

export default async function AdminNotificationsPage() {
  const logs = await getNotificationLogs()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream pb-4">
        <div>
          <h1 className="text-xl font-serif font-bold text-charcoal">Notification Logs</h1>
          <p className="text-xs text-taupe mt-0.5">
            Audit trailing delivery history across Email and SMS channels with real-time status tracking.
          </p>
        </div>
      </div>

      <NotificationLogViewer initialLogs={logs} />
    </div>
  )
}
