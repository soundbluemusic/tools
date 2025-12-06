// ========================================
// Storage Layer - FileSystem API + IndexedDB
// ========================================
// 프로젝트 파일 저장/로드 + 자동 백업

import Dexie, { type EntityTable } from 'dexie';

// ========================================
// IndexedDB (Dexie) - 자동 백업용
// ========================================

interface ProjectBackup {
  id: string;
  name: string;
  data: string; // JSON serialized
  createdAt: number;
  updatedAt: number;
}

interface AudioFile {
  id: string;
  projectId: string;
  name: string;
  data: ArrayBuffer;
  mimeType: string;
  duration: number;
  sampleRate: number;
  channels: number;
  createdAt: number;
}

interface UserPreference {
  key: string;
  value: string;
}

class ToolsDatabase extends Dexie {
  projects!: EntityTable<ProjectBackup, 'id'>;
  audioFiles!: EntityTable<AudioFile, 'id'>;
  preferences!: EntityTable<UserPreference, 'key'>;

  constructor() {
    super('tools-db');

    this.version(1).stores({
      projects: 'id, name, updatedAt',
      audioFiles: 'id, projectId, name',
      preferences: 'key',
    });
  }
}

export const db = new ToolsDatabase();

// ========================================
// IndexedDB Operations
// ========================================

export async function saveProjectBackup(
  id: string,
  name: string,
  data: object
): Promise<void> {
  await db.projects.put({
    id,
    name,
    data: JSON.stringify(data),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
}

export async function loadProjectBackup(id: string): Promise<object | null> {
  const backup = await db.projects.get(id);
  if (backup) {
    return JSON.parse(backup.data);
  }
  return null;
}

export async function getProjectList(): Promise<
  Array<{ id: string; name: string; updatedAt: number }>
> {
  return db.projects.orderBy('updatedAt').reverse().toArray();
}

export async function deleteProjectBackup(id: string): Promise<void> {
  await db.projects.delete(id);
  // Also delete associated audio files
  await db.audioFiles.where('projectId').equals(id).delete();
}

export async function saveAudioFile(file: AudioFile): Promise<void> {
  await db.audioFiles.put(file);
}

export async function loadAudioFile(
  id: string
): Promise<AudioFile | undefined> {
  return db.audioFiles.get(id);
}

export async function getPreference(key: string): Promise<string | null> {
  const pref = await db.preferences.get(key);
  return pref?.value ?? null;
}

export async function setPreference(key: string, value: string): Promise<void> {
  await db.preferences.put({ key, value });
}

// ========================================
// FileSystem Access API - 로컬 파일 저장
// ========================================

interface FileSystemOptions {
  suggestedName?: string;
  types?: Array<{
    description: string;
    accept: Record<string, string[]>;
  }>;
}

// Check if File System Access API is available
export function isFileSystemSupported(): boolean {
  return 'showSaveFilePicker' in window && 'showOpenFilePicker' in window;
}

// Save project to local file
export async function saveToFile(
  data: object,
  options: FileSystemOptions = {}
): Promise<FileSystemFileHandle | null> {
  if (!isFileSystemSupported()) {
    // Fallback: download as file
    downloadAsFile(data, options.suggestedName || 'project.sbm');
    return null;
  }

  try {
    const handle = await (
      window as unknown as {
        showSaveFilePicker: (opts: unknown) => Promise<FileSystemFileHandle>;
      }
    ).showSaveFilePicker({
      suggestedName: options.suggestedName || 'project.sbm',
      types: options.types || [
        {
          description: 'Sound Blue Music Project',
          accept: { 'application/json': ['.sbm'] },
        },
      ],
    });

    const writable = await handle.createWritable();
    await writable.write(JSON.stringify(data, null, 2));
    await writable.close();

    return handle;
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error('Failed to save file:', error);
    }
    return null;
  }
}

// Load project from local file
export async function loadFromFile<T = object>(
  options: FileSystemOptions = {}
): Promise<{ data: T; handle: FileSystemFileHandle | null } | null> {
  if (!isFileSystemSupported()) {
    // Fallback: use file input
    return loadFromFileInput<T>();
  }

  try {
    const [handle] = await (
      window as unknown as {
        showOpenFilePicker: (opts: unknown) => Promise<FileSystemFileHandle[]>;
      }
    ).showOpenFilePicker({
      types: options.types || [
        {
          description: 'Sound Blue Music Project',
          accept: { 'application/json': ['.sbm'] },
        },
      ],
    });

    const file = await handle.getFile();
    const text = await file.text();
    const data = JSON.parse(text) as T;

    return { data, handle };
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error('Failed to load file:', error);
    }
    return null;
  }
}

// Fallback: download as file
function downloadAsFile(data: object, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Fallback: load from file input
function loadFromFileInput<T>(): Promise<{ data: T; handle: null } | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.sbm,.json';

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }

      try {
        const text = await file.text();
        const data = JSON.parse(text) as T;
        resolve({ data, handle: null });
      } catch {
        resolve(null);
      }
    };

    input.oncancel = () => resolve(null);
    input.click();
  });
}

// ========================================
// Auto-save Manager
// ========================================

class AutoSaveManager {
  private intervalId?: ReturnType<typeof setInterval>;
  private projectId?: string;
  private getData?: () => object;
  private interval = 60000; // 1 minute default

  start(projectId: string, getData: () => object, intervalMs = 60000): void {
    this.stop();

    this.projectId = projectId;
    this.getData = getData;
    this.interval = intervalMs;

    this.intervalId = setInterval(() => {
      this.save();
    }, this.interval);

    console.log(`Auto-save started (every ${intervalMs / 1000}s)`);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  async save(): Promise<void> {
    if (!this.projectId || !this.getData) return;

    try {
      const data = this.getData();
      await saveProjectBackup(
        this.projectId,
        (data as { name?: string }).name || 'Untitled',
        data
      );
      console.log('Auto-saved project');
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }

  // Force save immediately
  async saveNow(): Promise<void> {
    await this.save();
  }
}

export const autoSaveManager = new AutoSaveManager();

// ========================================
// React Hooks
// ========================================

import { useState, useEffect, useCallback } from 'react';

export function useProjectStorage(projectId: string) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const save = useCallback(
    async (data: object) => {
      setIsSaving(true);
      try {
        await saveProjectBackup(
          projectId,
          (data as { name?: string }).name || 'Untitled',
          data
        );
        setLastSaved(new Date());
      } finally {
        setIsSaving(false);
      }
    },
    [projectId]
  );

  const load = useCallback(async () => {
    return loadProjectBackup(projectId);
  }, [projectId]);

  return {
    save,
    load,
    isSaving,
    lastSaved,
    saveToFile,
    loadFromFile,
    isFileSystemSupported: isFileSystemSupported(),
  };
}

export function useAutoSave(
  projectId: string,
  getData: () => object,
  enabled = true,
  intervalMs = 60000
) {
  useEffect(() => {
    if (enabled && projectId) {
      autoSaveManager.start(projectId, getData, intervalMs);
      return () => autoSaveManager.stop();
    }
  }, [projectId, getData, enabled, intervalMs]);

  return {
    saveNow: () => autoSaveManager.saveNow(),
  };
}
