"use client"
import React from 'react'

export default function EmptyState({ title, message }: { title: string, message?: string }){
  return (
    <div className="text-center py-12">
      <div className="text-xl font-medium mb-2">{title}</div>
      {message && <div className="text-sm text-gray-500">{message}</div>}
    </div>
  )
}
