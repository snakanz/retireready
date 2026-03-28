'use client'

import { useRef, useState } from 'react'
import { Mail, Phone, GripVertical, ChevronRight } from 'lucide-react'
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
  onViewLead: (lead: Lead) => void
}

export default function KanbanBoard({ leads, leadStatuses, onStatusChange, onViewLead }: Props) {
  const [dragging, setDragging]   = useState<string | null>(null)
  const [dragOver, setDragOver]   = useState<LeadStatus['status'] | null>(null)
  const dragId    = useRef<string | null>(null)
  const didDrag   = useRef(false)

  function onDragStart(leadId: string) {
    didDrag.current = true
    dragId.current  = leadId
    setDragging(leadId)
  }

  function onDrop(colKey: LeadStatus['status']) {
    if (dragId.current) onStatusChange(dragId.current, colKey)
    setDragging(null)
    setDragOver(null)
    dragId.current = null
    setTimeout(() => { didDrag.current = false }, 50)
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
                  onClick={() => { if (!didDrag.current) onViewLead(lead) }}
                  className={`bg-white rounded-xl border border-gray-100 p-3 shadow-sm select-none transition-all group ${
                    dragging === lead.id
                      ? 'opacity-40 scale-95 rotate-1 shadow-none'
                      : 'cursor-pointer hover:shadow-md hover:border-indigo-200'
                  }`}
                >
                  {/* Name + drag handle row */}
                  <div className="flex items-center gap-2 mb-2.5">
                    <GripVertical className="w-3.5 h-3.5 text-gray-300 shrink-0 cursor-grab" />
                    <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0">
                      {lead.first_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-xs leading-tight truncate">{lead.first_name}</p>
                      <p className="text-gray-400 text-[10px]">Age {lead.age} · {lead.asset_range}</p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-indigo-400 transition-colors shrink-0" />
                  </div>

                  {/* Contact info — prominent */}
                  <div className="space-y-1 border-t border-gray-50 pt-2">
                    {lead.phone && (
                      <a
                        href={`tel:${lead.phone}`}
                        onClick={e => e.stopPropagation()}
                        className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-lg px-2.5 py-1.5 transition-colors"
                      >
                        <Phone className="w-3 h-3 text-indigo-500 shrink-0" />
                        <span className="text-xs text-indigo-700 font-medium">{lead.phone}</span>
                      </a>
                    )}
                    {lead.email && (
                      <a
                        href={`mailto:${lead.email}`}
                        onClick={e => e.stopPropagation()}
                        className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg px-2.5 py-1.5 transition-colors"
                      >
                        <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="text-xs text-gray-600 truncate">{lead.email}</span>
                      </a>
                    )}
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
