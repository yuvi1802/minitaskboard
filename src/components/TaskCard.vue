<template>
  <div
    draggable="true"
    :class="[
      'task-card relative bg-white rounded-2xl border select-none cursor-grab active:cursor-grabbing',
      'transition-all duration-150 group',
      isDragging
        ? 'opacity-30 scale-95 shadow-none border-gray-200'
        : 'shadow-card hover:shadow-card-hover hover:-translate-y-px border-gray-100/80',
    ]"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
  >
    <!-- Priority accent bar -->
    <div :class="['absolute top-0 left-4 right-4 h-0.5 rounded-b-full', priorityBar]" />

    <div class="p-4 pt-5">
      <!-- Top row: priority badge + action buttons -->
      <div class="flex items-start justify-between mb-2.5">
        <span :class="['inline-flex items-center gap-1 text-[10px] font-semibold tracking-widest uppercase px-2 py-0.5 rounded-full', priorityBadge]">
          <span :class="['w-1.5 h-1.5 rounded-full', priorityDot]" />
          {{ task.priority }}
        </span>

        <!-- Hover action buttons -->
        <div class="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 -mt-0.5 -mr-1">
          <button
            class="p-1.5 rounded-lg text-gray-300 hover:text-brand-500 hover:bg-brand-50 transition-colors"
            title="Edit task"
            @click.stop="$emit('edit', task)"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            class="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Delete task"
            @click.stop="$emit('delete', task.id)"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Title -->
      <h3 class="font-semibold text-gray-800 text-[14px] leading-snug mb-1.5 pr-1">
        {{ task.title }}
      </h3>

      <!-- Description -->
      <p
        v-if="task.description"
        class="text-[12px] text-gray-400 leading-relaxed line-clamp-2 mb-3"
      >
        {{ task.description }}
      </p>

      <!-- Footer -->
      <div class="flex items-center justify-between pt-3 border-t border-gray-50">
        <time class="text-[11px] text-gray-300 font-mono">{{ formattedDate }}</time>

        <!-- Avatar / initials -->
        <div :class="['w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white', avatarBg]">
          {{ task.title.charAt(0).toUpperCase() }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Task, TaskStatus } from '../types/task'
import { useDragDrop } from '../composables/useDragDrop'

const props = defineProps<{ task: Task }>()
defineEmits<{
  (e: 'edit', task: Task): void
  (e: 'delete', id: string): void
}>()

const { dragState, onDragStart, onDragEnd } = useDragDrop()

const isDragging = computed(() => dragState.taskId === props.task.id && dragState.isDragging)

function handleDragStart(event: DragEvent) {
  onDragStart(props.task.id, props.task.status as TaskStatus, event)
}
function handleDragEnd() {
  onDragEnd()
}

const priorityBar = computed(() => ({
  low:    'bg-emerald-300',
  medium: 'bg-amber-300',
  high:   'bg-rose-400',
}[props.task.priority]))

const priorityBadge = computed(() => ({
  low:    'bg-emerald-50 text-emerald-600',
  medium: 'bg-amber-50 text-amber-600',
  high:   'bg-rose-50 text-rose-600',
}[props.task.priority]))

const priorityDot = computed(() => ({
  low:    'bg-emerald-400',
  medium: 'bg-amber-400',
  high:   'bg-rose-500',
}[props.task.priority]))

const avatarBg = computed(() => {
  const palette = ['bg-violet-400', 'bg-blue-400', 'bg-teal-400', 'bg-pink-400', 'bg-orange-400']
  const code = props.task.id.charCodeAt(0) + props.task.id.charCodeAt(1)
  return palette[code % palette.length]
})

const formattedDate = computed(() => {
  const d = new Date(props.task.createdAt)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
})
</script>
