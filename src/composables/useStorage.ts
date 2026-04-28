import type { Task } from '../types/task'

const DB_NAME = 'TaskflowDB'
const DB_VER  = 1
const STORE   = 'tasks'
const LS_KEY  = 'taskflow_tasks_v1'

let _db: IDBDatabase | null = null
let _useLS = false

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER)

    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      }
    }

    req.onsuccess = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      db.onclose = () => { _db = null }
      db.onerror = () => { _db = null }
      resolve(db)
    }

    req.onerror = () => reject(req.error)
  })
}

async function getDB(): Promise<IDBDatabase> {
  if (!_db) _db = await openDB()
  return _db
}

export function useStorage() {

  async function loadTasks(): Promise<Task[]> {
    
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Task[]
        if (parsed.length > 0) return parsed
      }
    } catch {
     
    }

    
    if (!_useLS) {
      try {
        const db = await getDB()
        const idbTasks = await new Promise<Task[]>((resolve, reject) => {
          const tx    = db.transaction(STORE, 'readonly')
          const store = tx.objectStore(STORE)
          const req   = store.getAll()
          req.onsuccess = () => resolve(req.result as Task[])
          req.onerror   = () => reject(req.error)
        })
        if (idbTasks.length > 0) return idbTasks
      } catch (err) {
        console.warn('[Storage] IDB read failed:', err)
        _useLS = true
        _db    = null
      }
    }

    return []
  }

  async function saveTasks(tasks: Task[]): Promise<void> {
    
    const plain = JSON.parse(JSON.stringify(tasks)) as Task[]

    try {
      localStorage.setItem(LS_KEY, JSON.stringify(plain))
    } catch (e) {
      console.warn('[Storage] localStorage write failed:', e)
    }

  
    if (!_useLS) {
      try {
        const db = await getDB()
        await new Promise<void>((resolve, reject) => {
          const tx    = db.transaction(STORE, 'readwrite')
          const store = tx.objectStore(STORE)
          store.clear()
          for (const t of plain) store.put(t)
          tx.oncomplete = () => resolve()
          tx.onerror    = () => reject(tx.error)
        })
      } catch (err) {
        console.warn('[Storage] IDB write failed, using localStorage only:', err)
        _useLS = true
        _db    = null
      }
    }
  }

  return { loadTasks, saveTasks }
}