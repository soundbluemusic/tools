/**
 * IndexedDB Storage with Dexie.js
 * Provides local database storage for projects, audio files, and settings
 *
 * Architecture:
 * - Projects: Store drum patterns, metronome presets, synth configurations
 * - AudioFiles: Store user-uploaded audio samples
 * - Settings: Store app-wide settings and preferences
 */
import Dexie, { type EntityTable } from 'dexie';

// ============================================
// Types
// ============================================

/**
 * Base entity with timestamps
 */
interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Project types
 */
export type ProjectType = 'drum' | 'metronome' | 'drum-synth' | 'qr';

/**
 * Project entity for storing user-created projects
 */
export interface Project extends BaseEntity {
  name: string;
  type: ProjectType;
  data: Record<string, unknown>;
  thumbnail?: Blob;
}

/**
 * Audio file entity for storing user samples
 */
export interface AudioFile extends BaseEntity {
  name: string;
  type: string; // MIME type
  size: number;
  duration: number;
  sampleRate: number;
  channels: number;
  data: ArrayBuffer;
  waveform?: Float32Array; // Cached waveform data
  projectId?: string; // Optional link to project
}

/**
 * User settings entity
 */
export interface UserSetting extends BaseEntity {
  key: string;
  value: unknown;
  category: 'audio' | 'ui' | 'storage' | 'general';
}

/**
 * Export history for tracking exported files
 */
export interface ExportHistory extends BaseEntity {
  projectId: string;
  format: string;
  fileName: string;
  fileSize: number;
}

// ============================================
// Database Class
// ============================================

/**
 * Tools Database
 * Central database for all app data
 */
class ToolsDatabase extends Dexie {
  projects!: EntityTable<Project, 'id'>;
  audioFiles!: EntityTable<AudioFile, 'id'>;
  settings!: EntityTable<UserSetting, 'id'>;
  exportHistory!: EntityTable<ExportHistory, 'id'>;

  constructor() {
    super('ToolsDB');

    // Database schema version 1
    this.version(1).stores({
      projects: 'id, name, type, createdAt, updatedAt',
      audioFiles: 'id, name, type, projectId, createdAt, updatedAt',
      settings: 'id, key, category',
      exportHistory: 'id, projectId, createdAt',
    });
  }
}

// ============================================
// Database Instance
// ============================================

export const db = new ToolsDatabase();

// ============================================
// Helper Functions
// ============================================

/**
 * Generate unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create timestamps for new entities
 */
export function createTimestamps(): Pick<BaseEntity, 'createdAt' | 'updatedAt'> {
  const now = new Date();
  return { createdAt: now, updatedAt: now };
}

/**
 * Update timestamp
 */
export function updateTimestamp(): Pick<BaseEntity, 'updatedAt'> {
  return { updatedAt: new Date() };
}

// ============================================
// Project Operations
// ============================================

/**
 * Create a new project
 */
export async function createProject(
  name: string,
  type: ProjectType,
  data: Record<string, unknown>,
  thumbnail?: Blob
): Promise<Project> {
  const project: Project = {
    id: generateId(),
    name,
    type,
    data,
    thumbnail,
    ...createTimestamps(),
  };
  await db.projects.add(project);
  return project;
}

/**
 * Get project by ID
 */
export async function getProject(id: string): Promise<Project | undefined> {
  return db.projects.get(id);
}

/**
 * Get all projects by type
 */
export async function getProjectsByType(type: ProjectType): Promise<Project[]> {
  return db.projects.where('type').equals(type).toArray();
}

/**
 * Get all projects
 */
export async function getAllProjects(): Promise<Project[]> {
  return db.projects.orderBy('updatedAt').reverse().toArray();
}

/**
 * Update project
 */
export async function updateProject(
  id: string,
  updates: Partial<Omit<Project, 'id' | 'createdAt'>>
): Promise<void> {
  await db.projects.update(id, {
    ...updates,
    ...updateTimestamp(),
  });
}

/**
 * Delete project and associated audio files
 */
export async function deleteProject(id: string): Promise<void> {
  await db.transaction('rw', [db.projects, db.audioFiles], async () => {
    await db.audioFiles.where('projectId').equals(id).delete();
    await db.projects.delete(id);
  });
}

// ============================================
// Audio File Operations
// ============================================

/**
 * Store audio file
 */
export async function storeAudioFile(
  name: string,
  data: ArrayBuffer,
  metadata: {
    type: string;
    duration: number;
    sampleRate: number;
    channels: number;
    waveform?: Float32Array;
    projectId?: string;
  }
): Promise<AudioFile> {
  const audioFile: AudioFile = {
    id: generateId(),
    name,
    type: metadata.type,
    size: data.byteLength,
    duration: metadata.duration,
    sampleRate: metadata.sampleRate,
    channels: metadata.channels,
    data,
    waveform: metadata.waveform,
    projectId: metadata.projectId,
    ...createTimestamps(),
  };
  await db.audioFiles.add(audioFile);
  return audioFile;
}

/**
 * Get audio file by ID
 */
export async function getAudioFile(id: string): Promise<AudioFile | undefined> {
  return db.audioFiles.get(id);
}

/**
 * Get audio files by project
 */
export async function getAudioFilesByProject(
  projectId: string
): Promise<AudioFile[]> {
  return db.audioFiles.where('projectId').equals(projectId).toArray();
}

/**
 * Get all audio files
 */
export async function getAllAudioFiles(): Promise<AudioFile[]> {
  return db.audioFiles.orderBy('updatedAt').reverse().toArray();
}

/**
 * Delete audio file
 */
export async function deleteAudioFile(id: string): Promise<void> {
  await db.audioFiles.delete(id);
}

/**
 * Get total storage used by audio files
 */
export async function getAudioStorageUsed(): Promise<number> {
  const files = await db.audioFiles.toArray();
  return files.reduce((total, file) => total + file.size, 0);
}

// ============================================
// Settings Operations
// ============================================

/**
 * Get setting by key
 */
export async function getSetting<T>(key: string): Promise<T | undefined> {
  const setting = await db.settings.where('key').equals(key).first();
  return setting?.value as T | undefined;
}

/**
 * Set setting value
 */
export async function setSetting<T>(
  key: string,
  value: T,
  category: UserSetting['category'] = 'general'
): Promise<void> {
  const existing = await db.settings.where('key').equals(key).first();

  if (existing) {
    await db.settings.update(existing.id, {
      value,
      ...updateTimestamp(),
    });
  } else {
    await db.settings.add({
      id: generateId(),
      key,
      value,
      category,
      ...createTimestamps(),
    });
  }
}

/**
 * Delete setting
 */
export async function deleteSetting(key: string): Promise<void> {
  await db.settings.where('key').equals(key).delete();
}

/**
 * Get all settings by category
 */
export async function getSettingsByCategory(
  category: UserSetting['category']
): Promise<UserSetting[]> {
  return db.settings.where('category').equals(category).toArray();
}

// ============================================
// Export History Operations
// ============================================

/**
 * Add export to history
 */
export async function addExportHistory(
  projectId: string,
  format: string,
  fileName: string,
  fileSize: number
): Promise<ExportHistory> {
  const history: ExportHistory = {
    id: generateId(),
    projectId,
    format,
    fileName,
    fileSize,
    ...createTimestamps(),
  };
  await db.exportHistory.add(history);
  return history;
}

/**
 * Get export history for project
 */
export async function getExportHistory(
  projectId: string
): Promise<ExportHistory[]> {
  return db.exportHistory
    .where('projectId')
    .equals(projectId)
    .reverse()
    .toArray();
}

// ============================================
// Database Utilities
// ============================================

/**
 * Clear all data (for debugging/reset)
 */
export async function clearAllData(): Promise<void> {
  await db.transaction(
    'rw',
    [db.projects, db.audioFiles, db.settings, db.exportHistory],
    async () => {
      await db.projects.clear();
      await db.audioFiles.clear();
      await db.settings.clear();
      await db.exportHistory.clear();
    }
  );
}

/**
 * Get database size estimate
 */
export async function getDatabaseSize(): Promise<{
  projects: number;
  audioFiles: number;
  totalBytes: number;
}> {
  const [projectCount, audioFiles] = await Promise.all([
    db.projects.count(),
    db.audioFiles.toArray(),
  ]);

  const audioBytes = audioFiles.reduce((total, file) => total + file.size, 0);

  return {
    projects: projectCount,
    audioFiles: audioFiles.length,
    totalBytes: audioBytes,
  };
}

/**
 * Check if database is available
 */
export async function isDatabaseAvailable(): Promise<boolean> {
  try {
    await db.open();
    return true;
  } catch {
    return false;
  }
}

// ============================================
// Export
// ============================================

export type { BaseEntity };
