'use client'

import dynamic from 'next/dynamic'

const BuscarClient = dynamic(() => import('./BuscarPage'), { ssr: false })

export default function BuscarPage() {
  return <BuscarClient />
}
