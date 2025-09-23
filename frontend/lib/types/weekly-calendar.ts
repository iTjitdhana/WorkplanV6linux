// Types for Weekly Calendar Component
export interface ProductionTask {
  id: number
  date: string
  title: string
  room: string
  staff: string
  time: string
  status: string
  recordStatus: "บันทึกแบบร่าง" | "บันทึกเสร็จสิ้น" | "พิมพ์แล้ว"
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export interface WeekDate {
  date: Date
  dateStr: string
  dayName: string
  dayNumber: string
  isToday: boolean
}

export interface DragDropState {
  draggedItem: ProductionTask | null
  dragOverCell: { date: string; index: number } | null
}

export interface WeeklyCalendarProps {
  // Data
  productionData: ProductionTask[]
  currentWeek: Date
  onWeekChange: (newWeek: Date) => void
  
  // Drag & Drop
  onTaskMove: (taskId: number, fromDate: string, toDate: string, fromIndex: number, toIndex: number) => void
  onTaskReorder: (taskId: number, date: string, fromIndex: number, toIndex: number) => void
  
  // Styling
  className?: string
  showWeekNavigation?: boolean
  showTaskCount?: boolean
  
  // Callbacks
  onTaskClick?: (task: ProductionTask) => void
  onDateClick?: (date: string) => void
  onAddTask?: (date: string, index: number) => void
}

export interface WeeklyCalendarState {
  viewMode: "daily" | "weekly"
  selectedWeekDay: string | null
  dragDrop: DragDropState
}

