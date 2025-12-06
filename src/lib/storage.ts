// ========================================
// Storage - 로컬 저장소 유틸리티
// ========================================

const STORAGE_PREFIX = 'tools:';

/**
 * Get item from localStorage with type safety
 */
export function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;

  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    if (item === null) return defaultValue;
    return JSON.parse(item) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Set item in localStorage
 */
export function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
}

/**
 * Remove item from localStorage
 */
export function removeItem(key: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch (error) {
    console.warn('Failed to remove from localStorage:', error);
  }
}

/**
 * Clear all items with our prefix
 */
export function clearAll(): void {
  if (typeof window === 'undefined') return;

  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    console.warn('Failed to clear localStorage:', error);
  }
}

// ========================================
// IndexedDB for larger data (audio files, etc.)
// ========================================

const DB_NAME = 'tools-db';
const DB_VERSION = 1;

let db: IDBDatabase | null = null;

async function openDB(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Create object stores
      if (!database.objectStoreNames.contains('files')) {
        database.createObjectStore('files', { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains('projects')) {
        database.createObjectStore('projects', { keyPath: 'id' });
      }
    };
  });
}

/**
 * Save file to IndexedDB
 */
export async function saveFile(
  id: string,
  data: ArrayBuffer | Blob,
  metadata?: Record<string, unknown>
): Promise<void> {
  const database = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['files'], 'readwrite');
    const store = transaction.objectStore('files');

    const request = store.put({
      id,
      data,
      metadata,
      updatedAt: Date.now(),
    });

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Load file from IndexedDB
 */
export async function loadFile(
  id: string
): Promise<{
  data: ArrayBuffer | Blob;
  metadata?: Record<string, unknown>;
} | null> {
  const database = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['files'], 'readonly');
    const store = transaction.objectStore('files');

    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const result = request.result;
      if (result) {
        resolve({ data: result.data, metadata: result.metadata });
      } else {
        resolve(null);
      }
    };
  });
}

/**
 * Delete file from IndexedDB
 */
export async function deleteFile(id: string): Promise<void> {
  const database = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['files'], 'readwrite');
    const store = transaction.objectStore('files');

    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * List all files in IndexedDB
 */
export async function listFiles(): Promise<
  Array<{ id: string; metadata?: Record<string, unknown>; updatedAt: number }>
> {
  const database = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['files'], 'readonly');
    const store = transaction.objectStore('files');

    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const results = request.result.map(
        (item: {
          id: string;
          metadata?: Record<string, unknown>;
          updatedAt: number;
        }) => ({
          id: item.id,
          metadata: item.metadata,
          updatedAt: item.updatedAt,
        })
      );
      resolve(results);
    };
  });
}
