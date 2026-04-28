<template>
  <div
    class="flex flex-col "
    @dragover="handleDragOver"
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <!-- Column header -->
    <div class="flex items-center justify-between mb-3 px-1">
      <div class="flex items-center gap-2">
        <span :class="['w-2 h-2 rounded-full', col.dotColor]" />
        <span class="font-display font-semibold text-[13px] text-gray-700 tracking-wide uppercase">
          {{ col.label }}
        </span>
        <span class="text-[11px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
          {{ tasks.length }}
        </span>
      </div>
      <button
        class="p-1.5 rounded-lg text-gray-300 hover:text-brand-500 hover:bg-brand-50 transition-colors"
        title="Add task to this column"
        @click="$emit('add', col.id)"
      >
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>

    <!-- Drop zone -->
    <div
      :class="[
        'flex-1 rounded-2xl p-2 min-h-[200px] transition-all duration-200',
        isOver
          ? 'bg-brand-50 ring-2 ring-brand-300 ring-dashed'
          : 'bg-gray-50/70',
      ]"
    >
      <!-- Empty placeholder -->
      <div
        v-if="tasks.length === 0"
        :class="[
          'flex flex-col items-center justify-center h-28 rounded-xl border-2 border-dashed transition-colors duration-200',
          isOver ? 'border-brand-300 text-brand-400' : 'border-gray-200 text-gray-300',
        ]"
      >
        <svg class="w-5 h-5 mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        <p class="text-[11px] font-medium">Drop here</p>
      </div>

      <!-- Task list -->
      <TransitionGroup name="card-list" tag="div" class="space-y-2">
        <TaskCard
          v-for="task in tasks"
          :key="task.id"
          :task="task"
          @edit="$emit('edit', $event)"
          @delete="$emit('delete', $event)"
        />
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Task, TaskStatus, ColumnDef } from '../types/task'
import TaskCard from './TaskCard.vue'
import { useDragDrop } from '../composables/useDragDrop'

const props = defineProps<{ col: ColumnDef; tasks: Task[] }>()
const emit = defineEmits<{
  (e: 'add', status: TaskStatus): void
  (e: 'edit', task: Task): void
  (e: 'delete', id: string): void
  (e: 'dropped', taskId: string, from: TaskStatus, to: TaskStatus): void
}>()

const { dragState, onDragEnter, onDragOver, onDragLeave, onDrop } = useDragDrop()

const isOver = computed(
  () => dragState.isDragging && dragState.overColumn === props.col.id,
)

function handleDragEnter(e: DragEvent) { onDragEnter(props.col.id, e) }
function handleDragOver(e: DragEvent) { onDragOver(props.col.id, e) }
function handleDragLeave(e: DragEvent) { onDragLeave(props.col.id, e) }

function handleDrop(e: DragEvent) {
  const result = onDrop(props.col.id, e)
  if (result) emit('dropped', result.taskId, result.from, result.to)
}
</script>

<style scoped>
.card-list-enter-active { transition: all 0.22s cubic-bezier(.4,0,.2,1); }
.card-list-leave-active { transition: all 0.18s cubic-bezier(.4,0,.2,1); position: absolute; width: calc(100% - 16px); }
.card-list-enter-from { opacity: 0; transform: translateY(-10px) scale(0.97); }
.card-list-leave-to   { opacity: 0; transform: translateX(16px) scale(0.96); }
.card-list-move       { transition: transform 0.22s cubic-bezier(.4,0,.2,1); }
</style>
