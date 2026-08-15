import React from 'react'

export default function Loading() {
  return (
    <div className="site-container py-16 flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <div className="w-8 h-8 rounded-full border-2 border-mocha/20 border-t-mocha animate-spin" />
      <p className="text-xs font-serif text-taupe uppercase tracking-widest animate-pulse">
        Hira&apos;s Universe
      </p>
    </div>
  )
}
