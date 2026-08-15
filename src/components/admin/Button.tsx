import React from 'react'

export default function Button({ children, onClick, variant='primary' }: { children: React.ReactNode, onClick?: ()=>void, variant?: 'primary'|'ghost' }){
  const base = 'px-3 py-2 rounded text-sm'
  const cls = variant === 'primary' ? `${base} bg-mocha text-ivory` : `${base} bg-white border border-cream`
  return <button className={cls} onClick={onClick}>{children}</button>
}
