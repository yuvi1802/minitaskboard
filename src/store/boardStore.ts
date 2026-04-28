import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Task, TaskStatus, TaskPriority, HistoryEntry } from '../types/task'
import { useStorage } from '../composables/useStorage'

function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

const MAX_UNDO = 50

export const useBoardStore = defineStore('board', () => {
  const { loadTasks, saveTasks } = useStorage()

  /*  state  */
  const tasks   = ref<Task[]>([])
  const filter  = ref<TaskStatus | 'all'>('all')
  const history = ref<HistoryEntry[]>([])
  const ready   = ref(false)

  /*init */
  async function init(): Promise<void> {
    const stored = await loadTasks()
    tasks.value  = stored
    ready.value  = true
  }

  /* persistence helper */
  
  async function persist(snapshot: Task[]): Promise<void> {
    await saveTasks(snapshot)
  }

  /*  derived */
  const visibleTasks = computed(() =>
    filter.value === 'all'
      ? tasks.value
      : tasks.value.filter((t) => t.status === filter.value)
  )

  function byStatus(status: TaskStatus): Task[] {
    return visibleTasks.value
      .filter((t) => t.status === status)
      .sort((a, b) => b.createdAt - a.createdAt)
  }

  /* helpers */
  function isDuplicate(title: string, status: TaskStatus, excludeId?: string): boolean {
    return tasks.value.some(
      (t) =>
        t.title.trim().toLowerCase() === title.trim().toLowerCase() &&
        t.status === status &&
        t.id !== excludeId
    )
  }

  function pushHistory(entry: HistoryEntry): void {
    history.value = [entry, ...history.value].slice(0, MAX_UNDO)
  }

  
  function createTask(
    title: string,
    description: string,
    priority: TaskPriority,
    status: TaskStatus = 'todo'
  ): true | string {
    const trimmed = title.trim()
    if (!trimmed) return 'Title cannot be empty.'
    if (isDuplicate(trimmed, status)) return 'Duplicate task in same column.'

    const task: Task = {
      id: uuid(),
      title: trimmed,
      description: description.trim(),
      status,
      priority,
      createdAt: Date.now(),
    }
    tasks.value = [task, ...tasks.value]
    pushHistory({ type: 'create', snapshot: { ...task }, wasPresent: false })

    
    persist([...tasks.value])
    return true
  }

 function updateTask(
  id: string,
  patch: Partial<Omit<Task, 'id' | 'createdAt'>>
): true | string {
  const before = tasks.value.find((t) => t.id === id)
  if (!before) return 'Task not found.'

  const newTitle = patch.title?.trim() ?? before.title

  if (!newTitle) return 'Title cannot be empty.'
  if (isDuplicate(newTitle, patch.status ?? before.status, id))
    return 'Duplicate task in same column.'

  const updated: Task = { ...before, ...patch, title: newTitle }

  tasks.value = tasks.value.map((t) =>
    t.id === id ? updated : t
  )

  pushHistory({ type: 'update', snapshot: before, wasPresent: true })

  persist([...tasks.value])
  return true
}

  function deleteTask(id: string): void {
    const task = tasks.value.find((t) => t.id === id)
    if (!task) return

    pushHistory({ type: 'delete', snapshot: { ...task }, wasPresent: true })
    tasks.value = tasks.value.filter((t) => t.id !== id)

    persist([...tasks.value])
  }

  function moveTask(taskId: string, to: TaskStatus): void {
    const idx = tasks.value.findIndex((t) => t.id === taskId)
    if (idx === -1) return

    const before = tasks.value[idx]
    if (before.status === to) return

    pushHistory({ type: 'move', snapshot: { ...before }, wasPresent: true })

    const copy = [...tasks.value]
    copy[idx]  = { ...before, status: to }
    tasks.value = copy

    persist([...tasks.value])
  }

  function undo(): string | null {
    if (history.value.length === 0) return null

    const [entry, ...rest] = history.value
    history.value = rest

    switch (entry.type) {
      case 'create':
        tasks.value = tasks.value.filter((t) => t.id !== entry.snapshot.id)
        break

      case 'delete':
        tasks.value = [entry.snapshot, ...tasks.value]
        break

      case 'update':
      case 'move': {
        const idx = tasks.value.findIndex((t) => t.id === entry.snapshot.id)
        if (idx !== -1) {
          const copy = [...tasks.value]
          copy[idx]  = entry.snapshot
          tasks.value = copy
        } else {
          tasks.value = [entry.snapshot, ...tasks.value]
        }
        break
      }
    }

    persist([...tasks.value])
    return `${entry.type} undone`
  }


  function setFilter(val: TaskStatus | 'all') {
    filter.value = val
  }

 
  const counts = computed(() => ({
    all:           tasks.value.length,
    todo:          tasks.value.filter((t) => t.status === 'todo').length,
    'in-progress': tasks.value.filter((t) => t.status === 'in-progress').length,
    done:          tasks.value.filter((t) => t.status === 'done').length,
  }))

  return {
    tasks,
    filter,
    history,
    ready,
    visibleTasks,
    counts,
    init,
    byStatus,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    undo,
    setFilter,
  }
})