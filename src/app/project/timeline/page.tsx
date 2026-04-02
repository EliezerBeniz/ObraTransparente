'use client'

import React, { useEffect, useState } from 'react'
import Timeline from '@/components/project/Timeline'
import { Calendar } from 'lucide-react'

export default function TimelinePage() {
  const [phases, setPhases] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/phases')
      .then(res => res.json())
      .then(data => {
        setPhases(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching phases:', err)
        setLoading(false)
      })
  }, [])

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <div className="mb-12 text-center md:text-left">
        <div className="flex items-center gap-3 justify-center md:justify-start mb-4">
          <div className="w-12 h-12 rounded-architectural bg-primary/10 text-primary flex items-center justify-center">
            <Calendar size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-black text-foreground tracking-tight">Cronograma de Obra</h1>
            <p className="text-tertiary font-body">Acompanhe as fases planejadas e o progresso real da construção.</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-8 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-surface-low rounded-architectural w-full" />
          ))}
        </div>
      ) : (
        <Timeline phases={phases} />
      )}
      
      {!loading && phases.length === 0 && (
        <div className="py-20 text-center border-2 border-dashed border-ghost-border rounded-architectural">
          <p className="text-tertiary font-body">Nenhuma fase cadastrada no cronograma ainda.</p>
        </div>
      )}
    </div>
  )
}
