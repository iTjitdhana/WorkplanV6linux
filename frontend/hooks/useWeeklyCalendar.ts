import { useState, useMemo } from 'react'
import { ProductionTask, WeekDate, DragDropState } from '@/lib/types/weekly-calendar'

export const useWeeklyCalendar = (currentWeek: Date, productionData: ProductionTask[]) => {
  // State for drag and drop
  const [dragDrop, setDragDrop] = useState<DragDropState>({
    draggedItem: null,
    dragOverCell: null
  })

  // Calculate week dates (Monday to Saturday)
  const weekDates = useMemo((): WeekDate[] => {
    const week: WeekDate[] = []
    const startOfWeek = new Date(currentWeek)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1) // Adjust for Monday start
    startOfWeek.setDate(diff)

    const dayNames = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']
    
    for (let i = 0; i < 6; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      
      const today = new Date()
      const isToday = day.toDateString() === today.toDateString()
      
      week.push({
        date: day,
        dateStr: day.toISOString().split('T')[0],
        dayName: dayNames[i],
        dayNumber: day.getDate().toString(),
        isToday
      })
    }
    
    return week
  }, [currentWeek])

  // Get week range string
  const weekRange = useMemo(() => {
    if (weekDates.length === 0) return ''
    const start = weekDates[0]
    const end = weekDates[5]
    return `${formatFullDate(start.date)} - ${formatFullDate(end.date)}`
  }, [weekDates])

  // Get production data for current week
  const weekProduction = useMemo(() => {
    if (weekDates.length === 0) return []
    const weekStart = weekDates[0].dateStr
    const weekEnd = weekDates[5].dateStr
    
    return productionData.filter((item) => {
      return item.date >= weekStart && item.date <= weekEnd
    })
  }, [productionData, weekDates])

  // Get tasks count for each day
  const getDayTaskCount = (dateStr: string) => {
    return weekProduction.filter(task => task.date === dateStr).length
  }

  // Get tasks for specific date
  const getTasksForDate = (dateStr: string) => {
    return weekProduction.filter(task => task.date === dateStr)
  }

  // Get total tasks for the week
  const totalWeekTasks = weekProduction.length

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, item: ProductionTask) => {
    // Only allow dragging for certain statuses
    if (item.recordStatus === "พิมพ์แล้ว") {
      e.preventDefault()
      return
    }
    setDragDrop(prev => ({ ...prev, draggedItem: item }))
  }

  const handleDragOver = (e: React.DragEvent, date: string, index: number) => {
    if (dragDrop.draggedItem) {
      // Check if it's the same item
      if (dragDrop.draggedItem.id === item.id) {
        e.dataTransfer.dropEffect = "none"
        return
      }
      setDragDrop(prev => ({ ...prev, dragOverCell: { date, index } }))
      e.dataTransfer.dropEffect = "move"
    }
  }

  const handleDragLeave = () => {
    setDragDrop(prev => ({ ...prev, dragOverCell: null }))
  }

  const handleDragEnd = () => {
    setDragDrop({ draggedItem: null, dragOverCell: null })
  }

  // Get background color for each day
  const getWeeklyTableBackgroundColor = (date: Date) => {
    // Richer header background colors per weekday
    const dayColors = {
      1: "bg-yellow-300",   // Monday
      2: "bg-rose-300",     // Tuesday
      3: "bg-emerald-300",  // Wednesday
      4: "bg-amber-300",    // Thursday
      5: "bg-sky-300",      // Friday
      6: "bg-violet-300"    // Saturday
    } as Record<number, string>
    return dayColors[date.getDay()] || "bg-gray-50"
  }

  return {
    weekDates,
    weekRange,
    weekProduction,
    totalWeekTasks,
    dragDrop,
    getDayTaskCount,
    getTasksForDate,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDragEnd,
    getWeeklyTableBackgroundColor
  }
}

// Helper function to format date
const formatFullDate = (date: Date) => {
  const months = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ]
  
  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear() + 543 // Convert to Buddhist year
  
  return `${day} ${month} ${year}`
}
