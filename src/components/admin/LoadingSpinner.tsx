"use client"
import React from 'react'

export default function LoadingSpinner({ size = 24 }: { size?: number }){
  return (
    <div style={{width:size, height:size}} className="animate-spin border-2 border-gray-300 border-t-gray-600 rounded-full" />
  )
}
