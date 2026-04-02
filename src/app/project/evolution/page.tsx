'use client'

import React, { useEffect, useState } from 'react'
import EvolutionGallery from '@/components/project/EvolutionGallery'
import { Camera } from 'lucide-react'

export default function EvolutionPage() {
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/evolution')
      .then(res => res.json())
      .then(data => {
        setUpdates(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching updates:', err)
        setLoading(false)
      })
  }, [])

  return (
    <div className="space-y-8 md:space-y-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-center md:text-left">
        <div className="space-y-2 w-full">
          <h1 className="text-2xl md:text-3xl font-heading font-black text-foreground tracking-tight">Diário de Obra</h1>
          <p className="text-xs md:text-sm text-tertiary font-body">Acompanhe a evolução visual passo-a-passo da construção.</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="aspect-[4/3] bg-surface-low rounded-architectural w-full" />
          ))}
        </div>
      ) : (
        <EvolutionGallery updates={updates} />
      )}
    </div>
  )
}
