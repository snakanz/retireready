'use client'

import { useRef, useState } from 'react'
import { Mail, Phone, GripVertical } from 'lucide-react'
import type { Lead, LeadStatus } from '@/types'

const COLUMNS: { key: LeadStatus['status']; label: string; accent: string; bg: string; border: string }[] = [
  { key: 'new',       label: 'New',            accent: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-200' },
  { key: 'contacted', label: 'Contacted',      accent: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-200' },
  { key: 'booked',    label: 'Meeting Booked', accent: 'text-purple-600',  bg: 'bg-purple-50',  border: 'border-purple-200' },
  { key: 'converted', label: 'Signed Up',      accent: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
]

interface Props {
  leads: Lead[]
  leadStatuses: Map<string, LeadStatus['status']>
  onStatusChange: (leadId: string, status: LeadStatus['status']) => void
}

export default function KanbanBoard({ leads, leadStatuses, onStatusChange }: Props) {
  const [dragging, setDragging]   = useState<string | null>(null)
  const [dragOver, setDragOver]   = useState<LeadStatus['status'] | null>(null)
  const dragId = useRef<string | null>(null)

  function onDragStart(leadId: string) {
    dragId.current = leadId
    setDragging(leadId)
  }

  function onDrop(colKey: LeadStatus['status']) {
    if (dragId.current) onStatusChange(dragId.current, colKey)
    setDragging(null)
    setDragOver(null)
    dragId.current = null
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {COLUMNS.map(col => {
        const colLeads = leads.filter(l => (leadStatuses.get(l.id) ?? 'new') === col.key)
        const isOver   = dragOver === col.key

        return (
          <div
            key={col.key}
            className={`rounded-2xl border-2 transition-all min-h-[180px] p-3 ${
              isOver ? `${col.bg} ${col.border}` : 'bg-gray-50 border-gray-200'
            }`}
            onDragOver={e => { e.preventDefault(); setDragOver(col.key) }}
            onDragLeave={e => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(null)
            }}
            onDrop={() => onDrop(col.key)}
          >
            {/* Column header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <span className={`text-xs font-bold uppercase tracking-wide ${col.accent}`}>
                {col.label}
              </span>
              <span className="text-xs text-gray-400 font-semibold bg-white border border-gray-200 rounded-full w-5 h-5 flex items-center justify-center">
                {colLeads.length}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-2">
              {colLeads.map(lead => (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={() => onDragStart(lead.id)}
                  onDragEnd={() => { setDragging(null); setDragOver(null) }}
                  className={`bg-white rounded-xl border border-gray-100 p-3 shadow-sm select-none transition-all ${
                    dragging === lead.id
                      ? 'opacity-40 scale-95 rotate-1 shadow-none'
                      : 'cursor-grab active:cursor-grabbing hover:shadow-md hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <GripVertical className="w-3.5 h-3.5 text-gray-300 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-[10px] shrink-0">
                          {lead.first_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-xs leading-tight">{lead.first_name}</p>
                          <p className="text-gray-400 text-[10px]">Age {lead.age} · {lead.asset_range}</p>
                        </div>
                      </div>
                      {lead.email && (
                        <a
                          href={`mailto:${lead.email}`}
                          onClick={e => e.stopPropagation()}
                          className="flex items-center gap-1 text-[10px] text-indigo-500 hover:text-indigo-700 truncate"
                        >
                          <Mail className="w-3 h-3 shrink-0" />
                          <span className="truncate">{lead.email}</span>
                        </a>
                      )}
                      {lead.phone && (
                        <a
                          href={`tel:${lead.phone}`}
                          onClick={e => e.stopPropagation()}
                          className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-600 mt-0.5"
                        >
                          <Phone className="w-3 h-3 shrink-0" />
                          <span>{lead.phone}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty drop zone */}
              {colLeads.length === 0 && (
                <div className={`rounded-xl border-2 border-dashed p-5 text-center text-xs transition-colors ${
                  isOver ? `${col.border} ${col.accent} opacity-60` : 'border-gray-200 text-gray-300'
                }`}>
                  Drop here
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
