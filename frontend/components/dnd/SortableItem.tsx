"use client"

import React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

export const SortableItem: React.FC<{
  id: string
  container: [string, number]
  disabled?: boolean
  children: React.ReactNode
}> = ({ id, container, disabled, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled, data: { container } })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: disabled ? "not-allowed" : "move",
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  )
}

export default SortableItem


