<template>
  <div class="flex-1 flex justify-center px-3 sm:px-6 pb-6 min-h-0">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 w-full max-w-5xl">
      <Column
        v-for="col in COLUMNS"
        :key="col.id"
        :col="col"
        :tasks="store.byStatus(col.id)"
        class="min-w-0"
        @add="(status) => emit('open-modal', status, null)"
        @edit="(task) => emit('open-modal', task.status, task)"
        @delete="store.deleteTask($event)"
        @dropped="handleDrop"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task, TaskStatus, ColumnDef } from '../types/task'
import Column from './Column.vue'
import { useBoardStore } from '../store/boardStore'

const store = useBoardStore()

const emit = defineEmits<{
  (e: 'open-modal', status: TaskStatus, task: Task | null): void
}>()

const COLUMNS: ColumnDef[] = [
  { id: 'todo',        label: 'To Do',       emoji: '📋', dotColor: 'bg-gray-400',    bgHover: 'hover:bg-gray-50'   },
  { id: 'in-progress', label: 'In Progress', emoji: '⚡', dotColor: 'bg-blue-400',    bgHover: 'hover:bg-blue-50'   },
  { id: 'done',        label: 'Done',        emoji: '✅', dotColor: 'bg-emerald-400', bgHover: 'hover:bg-emerald-50' },
]

function handleDrop(taskId: string, _from: TaskStatus, to: TaskStatus) {
  store.moveTask(taskId, to)
}
</script>