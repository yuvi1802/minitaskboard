<template>
  <div class="min-h-screen flex flex-col bg-[#f8f8fb]">

    <header class="sticky top-0 z-40 bg-[#0f0f0f] border-b border-white/10">
      <div class="flex items-center justify-between px-4 sm:px-6 py-3 max-w-screen-2xl mx-auto w-full">

        <div class="flex items-center gap-3">
          <img src="/logo.png" alt="Yello Logo" class="w-8 h-8 sm:w-10 sm:h-10 object-contain rounded-lg shadow-sm" />
          <div class="leading-none">
            <p class="font-display font-bold text-[15px] sm:text-[16px] text-white tracking-tight">Yello</p>
            <p class="text-[10px] text-white/40 font-medium mt-0.5 hidden xs:block">Think. Plan. Execute.</p>
          </div>
        </div>

        <div class="flex items-center gap-2">

          <div class="hidden sm:flex items-center bg-white/10 rounded-xl p-1 gap-0.5">
            <button
              v-for="f in FILTERS"
              :key="f.value"
              :class="[
                'px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all',
                store.filter === f.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-white/60 hover:text-white',
              ]"
              @click="store.setFilter(f.value)"
            >
              {{ f.label }}
              <span
                v-if="f.value !== 'all'"
                :class="['ml-1 text-[10px] font-bold px-1 rounded-full', store.filter === f.value ? 'text-gray-500' : 'text-white/40']"
              >
                {{ store.counts[f.value] }}
              </span>
            </button>
          </div>

          <button
            :disabled="store.history.length === 0"
            :class="[
              'flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all',
              store.history.length > 0
                ? 'bg-white/15 text-white hover:bg-white/25'
                : 'bg-white/5 text-white/20 cursor-not-allowed',
            ]"
            @click="handleUndo"
          >
            Undo
          </button>

          <button
            class="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white text-[#0f0f0f] text-[12px] font-bold hover:bg-white/90 transition-colors shadow-sm"
            @click="openModal()"
          >
            <span class="hidden sm:inline">+ New task</span>
            <span class="sm:hidden">+</span>
          </button>

        </div>
      </div>

      <div class="border-t border-white/10 px-4 sm:px-6 py-2 flex items-center gap-3 sm:gap-5 max-w-screen-2xl mx-auto w-full">
        <div class="text-[12px] text-white/40">
          <span class="font-semibold text-white/80">{{ store.counts.all }}</span> total
        </div>
        <span class="w-px h-3 bg-white/10" />
        <div class="text-[12px] text-white/40">
          <span class="text-blue-400 font-semibold">{{ store.counts['in-progress'] }}</span> in progress
        </div>
        <span class="w-px h-3 bg-white/10" />
        <div class="text-[12px] text-white/40">
          <span class="text-emerald-400 font-semibold">{{ store.counts.done }}</span> done
        </div>
        <div v-if="store.counts.all > 0" class="ml-auto flex items-center gap-2">
          <span class="text-[11px] text-white/40">
            {{ Math.round((store.counts.done / store.counts.all) * 100) }}%
          </span>
          <div class="w-16 sm:w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              class="h-full bg-emerald-400"
              :style="{ width: `${Math.round((store.counts.done / store.counts.all) * 100)}%` }"
            />
          </div>
        </div>
      </div>

      <div class="sm:hidden border-t border-white/10 px-4 py-2 flex gap-1 overflow-x-auto max-w-screen-2xl mx-auto w-full scrollbar-none">
        <button
          v-for="f in FILTERS"
          :key="f.value"
          :class="[
            'shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all',
            store.filter === f.value
              ? 'bg-white text-gray-900'
              : 'text-white/60 hover:text-white',
          ]"
          @click="store.setFilter(f.value)"
        >
          {{ f.label }}
          <span v-if="f.value !== 'all'" class="ml-1 text-[10px] opacity-60">
            {{ store.counts[f.value] }}
          </span>
        </button>
      </div>
    </header>

    <div class="w-full bg-white border-b border-gray-100 py-4 sm:py-5 px-4 sm:px-6">
      <div class="max-w-screen-2xl mx-auto">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Project</span>
        </div>
        <h1 class="text-[20px] sm:text-[26px] font-extrabold text-gray-900 tracking-tight leading-tight">
          Mini Kanban Board
        </h1>
        <p class="text-[12px] sm:text-[13px] text-gray-400 mt-1">Track your tasks across stages — from idea to done.</p>
      </div>
    </div>

    <main class="flex-1 flex flex-col pt-4 sm:pt-6 min-h-0">
      <div v-if="!store.ready" class="flex-1 flex items-center justify-center">
        Loading...
      </div>
      <Board v-else @open-modal="openModal" />
    </main>

    <TaskModal
      v-model="showModal"
      :edit-task="editingTask"
      :default-status="modalStatus"
      @create="handleCreate"
      @update="handleUpdate"
    />

    <div
      v-if="toast.visible"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#0f0f0f] text-white px-4 py-2 rounded-xl text-sm shadow-lg z-50"
    >
      {{ toast.message }}
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import Board from './components/Board.vue'
import TaskModal from './components/TaskModal.vue'
import { useBoardStore } from './store/boardStore'
import type { Task, TaskStatus, TaskPriority } from './types/task'

const store = useBoardStore()

const showModal   = ref(false)
const editingTask = ref<Task | null>(null)
const modalStatus = ref<TaskStatus>('todo')

function openModal(status: TaskStatus = 'todo', task: Task | null = null) {
  editingTask.value = task
  modalStatus.value = status
  showModal.value   = true
}

const FILTERS = [
  { value: 'all' as TaskStatus | 'all', label: 'All',         countActive: '' },
  { value: 'todo' as TaskStatus,        label: 'Todo',        countActive: '' },
  { value: 'in-progress' as TaskStatus, label: 'In Progress', countActive: '' },
  { value: 'done' as TaskStatus,        label: 'Done',        countActive: '' },
]

const toast = reactive({ visible: false, message: '' })
let timer: ReturnType<typeof setTimeout> | null = null

function showToast(msg: string) {
  if (timer) clearTimeout(timer)
  toast.message = msg
  toast.visible = true
  timer = setTimeout(() => (toast.visible = false), 2500)
}

onMounted(async () => { await store.init() })
onUnmounted(() => { if (timer) clearTimeout(timer) })

function handleCreate(title: string, desc: string, priority: TaskPriority, status: TaskStatus) {
  const result = store.createTask(title, desc, priority, status)
  if (result !== true) showToast(result)
  else showToast('Task created')
}

function handleUpdate(id: string, patch: Partial<Omit<Task, 'id' | 'createdAt'>>) {
  const result = store.updateTask(id, patch)
  if (result !== true) showToast(result)
}

function handleUndo() {
  const msg = store.undo?.()
  if (msg) showToast(msg)
}
</script>