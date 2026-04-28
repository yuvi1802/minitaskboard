<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        aria-modal="true"
        role="dialog"
        @mousedown.self="close"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/25 backdrop-blur-[2px]" @click="close" />

        <!-- Panel -->
        <div
          class="relative bg-white w-full sm:max-w-[440px] sm:rounded-2xl shadow-modal
                 rounded-t-2xl overflow-hidden animate-scale-in"
          @click.stop
        >
          <!-- Drag handle (mobile) -->
          <div class="flex justify-center pt-3 pb-1 sm:hidden">
            <div class="w-10 h-1 bg-gray-200 rounded-full" />
          </div>

          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 class="font-display text-[15px] font-semibold text-gray-900">
              {{ isEdit ? 'Edit task' : 'New task' }}
            </h2>
            <button
              class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              @click="close"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Form body -->
          <div class="px-6 py-5 space-y-5">
            <!-- Title -->
            <div>
              <label class="block text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-2">
                Title <span class="text-rose-400">*</span>
              </label>
              <input
                ref="titleRef"
                v-model="form.title"
                type="text"
                placeholder="What needs to be done?"
                maxlength="120"
                :class="[
                  'w-full rounded-xl border px-4 py-2.5 text-[14px] text-gray-800 placeholder-gray-300',
                  'focus:outline-none focus:ring-2 transition-all',
                  titleError
                    ? 'border-rose-300 ring-rose-100 focus:ring-rose-200'
                    : 'border-gray-200 focus:border-brand-400 focus:ring-brand-100',
                ]"
                @keydown.enter.prevent="submit"
                @input="titleError = ''"
              />
              <p v-if="titleError" class="mt-1.5 text-[12px] text-rose-500 flex items-center gap-1">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                {{ titleError }}
              </p>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-2">
                Description
              </label>
              <textarea
                v-model="form.description"
                placeholder="Add more context…"
                rows="3"
                maxlength="500"
                class="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-[14px] text-gray-800 placeholder-gray-300
                       focus:outline-none focus:ring-2 focus:border-brand-400 focus:ring-brand-100 resize-none transition-all"
              />
            </div>

            <!-- Priority + Column row -->
            <div class="grid grid-cols-2 gap-4">
              <!-- Priority -->
              <div>
                <label class="block text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Priority</label>
                <div class="flex gap-1.5">
                  <button
                    v-for="p in PRIORITIES"
                    :key="p.value"
                    type="button"
                    :class="[
                      'flex-1 py-2 rounded-xl text-[11px] font-semibold border transition-all',
                      form.priority === p.value ? p.active : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600',
                    ]"
                    @click="form.priority = p.value"
                  >
                    {{ p.label }}
                  </button>
                </div>
              </div>

              <!-- Column -->
              <div v-if="!isEdit">
                <label class="block text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Column</label>
                <select
                  v-model="form.status"
                  class="w-full rounded-xl border border-gray-200 px-3 py-2 text-[13px] text-gray-700
                         focus:outline-none focus:ring-2 focus:border-brand-400 focus:ring-brand-100 transition-all"
                >
                  <option value="todo">Todo</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Footer actions -->
          <div class="px-6 pb-5 flex gap-3">
            <button
              class="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              @click="close"
            >
              Cancel
            </button>
            <button
              class="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-[13px] font-semibold transition-colors shadow-sm"
              @click="submit"
            >
              {{ isEdit ? 'Save changes' : 'Create task' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import type { Task, TaskStatus, TaskPriority } from '../types/task'

interface FormState {
  title: string
  description: string
  priority: TaskPriority
  status: TaskStatus
}

const PRIORITIES: { value: TaskPriority; label: string; active: string }[] = [
  { value: 'low',    label: 'Low',  active: 'border-emerald-400 bg-emerald-50 text-emerald-700' },
  { value: 'medium', label: 'Med',  active: 'border-amber-400 bg-amber-50 text-amber-700' },
  { value: 'high',   label: 'High', active: 'border-rose-400 bg-rose-50 text-rose-700' },
]

const props = defineProps<{
  modelValue: boolean
  editTask?: Task | null
  defaultStatus?: TaskStatus
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'create', title: string, desc: string, priority: TaskPriority, status: TaskStatus): void
  (e: 'update', id: string, patch: Partial<Omit<Task, 'id' | 'createdAt'>>): void
}>()

const titleRef  = ref<HTMLInputElement>()
const titleError = ref('')

const isEdit = computed(() => !!props.editTask)

function blankForm(): FormState {
  return { title: '', description: '', priority: 'medium', status: props.defaultStatus ?? 'todo' }
}

const form = ref<FormState>(blankForm())

watch(() => props.modelValue, async (open) => {
  if (!open) return
  titleError.value = ''
  form.value = props.editTask
    ? { title: props.editTask.title, description: props.editTask.description, priority: props.editTask.priority, status: props.editTask.status }
    : blankForm()
  await nextTick()
  titleRef.value?.focus()
})

function close() {
  emit('update:modelValue', false)
}

function submit() {
  titleError.value = ''

  if (!form.value.title.trim()) {
    titleError.value = 'Title cannot be empty.'
    titleRef.value?.focus()
    return
  }

  if (isEdit.value && props.editTask) {
    emit('update', props.editTask.id, {
      title: form.value.title,
      description: form.value.description,
      priority: form.value.priority,
    })
  } else {
    emit('create', form.value.title, form.value.description, form.value.priority, form.value.status)
  }

  
  setTimeout(() => {
    emit('update:modelValue', false)
  }, 0)
}
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
