# Yello — Mini Kanban Board

This project is a lightweight Kanban board (similar to Trello) built using Vue 3 and TypeScript.  
It allows users to manage tasks across three stages — **Todo, In Progress, and Done** — with smooth drag-and-drop interaction and persistent storage.

---

## Quick Start

```bash
npm install
npm run dev
```

Then open `http://localhost:5173`.

---

## Tech Stack

1.Vue 3 (Composition API + script setup)
2.TypeScript
3.Tailwind CSS
4.Pinia (State Management)
5.Vite
6.Native HTML5 Drag & Drop (no external libraries)

---

## Features
   Add, edit, and delete tasks
   Drag and drop tasks between columns
   Task priority (Low / Medium / High with color indicators)
   Filter tasks by status
   Undo last action
   Progress tracking (completion percentage)
   Persistent storage using IndexedDB (with localStorage fallback)
   Responsive UI

## Project Structure

```
src/
├── components/
│   ├── Board.vue       # Renders all three columns, owns modal state
│   ├── Column.vue      # Single Kanban column, drop-zone logic
│   ├── TaskCard.vue    # Draggable task card
│   └── TaskModal.vue   # Create / edit task modal (Teleport)
├── composables/
│   ├── useDragDrop.ts  # Singleton drag state + native HTML5 handlers
│   └── useStorage.ts   # IndexedDB read/write with localStorage fallback
├── store/
│   └── boardStore.ts   # Pinia store — all mutations + undo stack
├── types/
│   └── task.ts         # Task, TaskStatus, TaskPriority, HistoryEntry
├── App.vue             # Header, filter bar, stats, toast notifications
├── main.ts             # App bootstrap
└── style.css           # Tailwind directives + global overrides
```

---

## Drag & Drop Implementation

Drag-and-drop is implemented using the **HTML5 Drag Events API** with zero external libraries.

### How it works
1.State Management

All task data is handled using Pinia.
The store manages:

Creating, updating, deleting tasks
Moving tasks across columns
Maintaining an undo history

Any change to the state automatically updates the UI.

2.Drag & Drop

Drag and drop is implemented using the native HTML5 Drag Events API (no libraries).

Each task card is draggable
Columns act as drop zones
On drop, the task’s status is updated in the store
UI updates instantly through Vue reactivity

Edge cases like dropping outside the board or rapid dragging are handled safely.

3.Persistence

Task data is stored using:

IndexedDB (preferred)
Falls back to localStorage if IndexedDB is unavailable

This ensures tasks remain after page refresh.


## Notes
Drag-and-drop is implemented manually without external libraries as required
Focus was given to state consistency, reliability, and clean architecture
UI is kept simple and functional, prioritizing usability over heavy design
