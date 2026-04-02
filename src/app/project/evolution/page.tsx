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
    <div className="max-w-7xl mx-auto py-12 px-6">
      <div className="mb-12 text-center md:text-left">
        <div className="flex items-center gap-3 justify-center md:justify-start mb-4">
          <div className="w-12 h-12 rounded-architectural bg-primary/10 text-primary flex items-center justify-center">
            <Camera size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-black text-foreground tracking-tight">Diário de Obra</h1>
            <p className="text-tertiary font-body">Acompanhe a evolução visual passo-a-passo da construção.</p>
          </div>
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
