export type TaskStatus = 'todo' | 'in-progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  createdAt: number
}

export interface ColumnDef {
  id: TaskStatus
  label: string
  emoji: string
  dotColor: string
  bgHover: string
}

export interface HistoryEntry {
  type: 'create' | 'update' | 'delete' | 'move'
  snapshot: Task        
  wasPresent: boolean   
}
