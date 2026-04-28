import { reactive } from 'vue'
import type { TaskStatus } from '../types/task'

interface DragState {
  taskId: string | null
  sourceStatus: TaskStatus | null
  isDragging: boolean
  overColumn: TaskStatus | null
}


const dragState = reactive<DragState>({
  taskId: null,
  sourceStatus: null,
  isDragging: false,
  overColumn: null,
})

export function useDragDrop() {

  function onDragStart(taskId: string, sourceStatus: TaskStatus, event: DragEvent): void {
    dragState.taskId       = taskId
    dragState.sourceStatus = sourceStatus
    dragState.isDragging   = true
    dragState.overColumn   = null

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', taskId)
      event.dataTransfer.setData('text/x-source-status', sourceStatus)
    }
  }

  function onDragEnter(column: TaskStatus, event: DragEvent): void {
    event.preventDefault()
    dragState.overColumn = column
  }

  function onDragOver(column: TaskStatus, event: DragEvent): void {
    event.preventDefault()
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
    dragState.overColumn = column
  }

  function onDragLeave(column: TaskStatus, event: DragEvent): void {
    const related = event.relatedTarget as HTMLElement | null
    const currentTarget = event.currentTarget as HTMLElement | null
    if (currentTarget && related && currentTarget.contains(related)) return
    if (dragState.overColumn === column) dragState.overColumn = null
  }

  function onDrop(
    targetColumn: TaskStatus,
    event: DragEvent,
  ): { taskId: string; from: TaskStatus; to: TaskStatus } | null {
    event.preventDefault()
    event.stopPropagation()

    const taskId =
      event.dataTransfer?.getData('text/plain') || dragState.taskId

    const sourceStatus = (
      event.dataTransfer?.getData('text/x-source-status') || dragState.sourceStatus
    ) as TaskStatus | null

    
    reset()

    if (!taskId || !sourceStatus) return null


    if (sourceStatus === targetColumn) return null

    return { taskId, from: sourceStatus, to: targetColumn }
  }

 
  function onDragEnd(): void {
    reset()
  }

  function reset(): void {
    dragState.taskId       = null
    dragState.sourceStatus = null
    dragState.isDragging   = false
    dragState.overColumn   = null
  }

  return {
    dragState,
    onDragStart,
    onDragEnter,
    onDragOver,
    onDragLeave,
    onDrop,
    onDragEnd,
    reset,
  }
}