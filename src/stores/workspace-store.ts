import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ToolInstance,
  WorkspaceLayout,
  ToolSettings,
} from '@/tools/types';
import { getTool } from '@/tools/registry';

// ========================================
// Workspace Store - 워크스페이스 상태 관리
// ========================================

interface WorkspaceState {
  // Current workspace
  currentLayout: WorkspaceLayout | null;
  savedLayouts: WorkspaceLayout[];

  // Active tool
  activeInstanceId: string | null;

  // Actions
  createLayout: (name: string) => WorkspaceLayout;
  loadLayout: (id: string) => void;
  saveLayout: () => void;
  deleteLayout: (id: string) => void;
  renameLayout: (id: string, name: string) => void;

  // Tool management
  addTool: (toolId: string, position?: { x: number; y: number }) => string;
  removeTool: (instanceId: string) => void;
  updateToolPosition: (
    instanceId: string,
    position: { x: number; y: number }
  ) => void;
  updateToolSize: (
    instanceId: string,
    size: { width: number; height: number }
  ) => void;
  updateToolSettings: (
    instanceId: string,
    settings: Partial<ToolSettings>
  ) => void;
  toggleToolMinimized: (instanceId: string) => void;
  bringToFront: (instanceId: string) => void;
  setActiveInstance: (instanceId: string | null) => void;
  resetLayout: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      currentLayout: null,
      savedLayouts: [],
      activeInstanceId: null,

      createLayout: (name) => {
        const layout: WorkspaceLayout = {
          id: generateId(),
          name,
          tools: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set({ currentLayout: layout });
        return layout;
      },

      loadLayout: (id) => {
        const { savedLayouts } = get();
        const layout = savedLayouts.find((l) => l.id === id);
        if (layout) {
          set({ currentLayout: { ...layout } });
        }
      },

      saveLayout: () => {
        const { currentLayout, savedLayouts } = get();
        if (!currentLayout) return;

        const updatedLayout = {
          ...currentLayout,
          updatedAt: Date.now(),
        };

        const existingIndex = savedLayouts.findIndex(
          (l) => l.id === currentLayout.id
        );

        let newLayouts: WorkspaceLayout[];
        if (existingIndex >= 0) {
          newLayouts = [...savedLayouts];
          newLayouts[existingIndex] = updatedLayout;
        } else {
          newLayouts = [...savedLayouts, updatedLayout];
        }

        set({
          currentLayout: updatedLayout,
          savedLayouts: newLayouts,
        });
      },

      deleteLayout: (id) => {
        const { savedLayouts, currentLayout } = get();
        set({
          savedLayouts: savedLayouts.filter((l) => l.id !== id),
          currentLayout: currentLayout?.id === id ? null : currentLayout,
        });
      },

      renameLayout: (id, name) => {
        const { savedLayouts, currentLayout } = get();
        const newLayouts = savedLayouts.map((l) =>
          l.id === id ? { ...l, name, updatedAt: Date.now() } : l
        );
        set({
          savedLayouts: newLayouts,
          currentLayout:
            currentLayout?.id === id
              ? { ...currentLayout, name, updatedAt: Date.now() }
              : currentLayout,
        });
      },

      addTool: (toolId, position = { x: 50, y: 50 }) => {
        const { currentLayout } = get();
        if (!currentLayout) {
          get().createLayout('새 워크스페이스');
        }

        const tool = getTool(toolId);
        if (!tool) return '';

        const instanceId = generateId();
        const defaultSize = { width: 320, height: 240 };

        const instance: ToolInstance = {
          instanceId,
          toolId,
          position,
          size: tool.meta.minSize || defaultSize,
          settings: { ...tool.defaultSettings },
          isMinimized: false,
          zIndex: (get().currentLayout?.tools.length || 0) + 1,
        };

        set((state) => ({
          currentLayout: state.currentLayout
            ? {
                ...state.currentLayout,
                tools: [...state.currentLayout.tools, instance],
                updatedAt: Date.now(),
              }
            : null,
          activeInstanceId: instanceId,
        }));

        return instanceId;
      },

      removeTool: (instanceId) => {
        set((state) => ({
          currentLayout: state.currentLayout
            ? {
                ...state.currentLayout,
                tools: state.currentLayout.tools.filter(
                  (t) => t.instanceId !== instanceId
                ),
                updatedAt: Date.now(),
              }
            : null,
          activeInstanceId:
            state.activeInstanceId === instanceId
              ? null
              : state.activeInstanceId,
        }));
      },

      updateToolPosition: (instanceId, position) => {
        set((state) => ({
          currentLayout: state.currentLayout
            ? {
                ...state.currentLayout,
                tools: state.currentLayout.tools.map((t) =>
                  t.instanceId === instanceId ? { ...t, position } : t
                ),
                updatedAt: Date.now(),
              }
            : null,
        }));
      },

      updateToolSize: (instanceId, size) => {
        set((state) => ({
          currentLayout: state.currentLayout
            ? {
                ...state.currentLayout,
                tools: state.currentLayout.tools.map((t) =>
                  t.instanceId === instanceId ? { ...t, size } : t
                ),
                updatedAt: Date.now(),
              }
            : null,
        }));
      },

      updateToolSettings: (instanceId, settings) => {
        set((state) => ({
          currentLayout: state.currentLayout
            ? {
                ...state.currentLayout,
                tools: state.currentLayout.tools.map((t) =>
                  t.instanceId === instanceId
                    ? { ...t, settings: { ...t.settings, ...settings } }
                    : t
                ),
                updatedAt: Date.now(),
              }
            : null,
        }));
      },

      toggleToolMinimized: (instanceId) => {
        set((state) => ({
          currentLayout: state.currentLayout
            ? {
                ...state.currentLayout,
                tools: state.currentLayout.tools.map((t) =>
                  t.instanceId === instanceId
                    ? { ...t, isMinimized: !t.isMinimized }
                    : t
                ),
                updatedAt: Date.now(),
              }
            : null,
        }));
      },

      bringToFront: (instanceId) => {
        set((state) => {
          if (!state.currentLayout) return state;

          const maxZ = Math.max(
            ...state.currentLayout.tools.map((t) => t.zIndex)
          );

          return {
            currentLayout: {
              ...state.currentLayout,
              tools: state.currentLayout.tools.map((t) =>
                t.instanceId === instanceId ? { ...t, zIndex: maxZ + 1 } : t
              ),
              updatedAt: Date.now(),
            },
          };
        });
      },

      setActiveInstance: (instanceId) => {
        set({ activeInstanceId: instanceId });
        if (instanceId) {
          get().bringToFront(instanceId);
        }
      },

      resetLayout: () => {
        set({
          currentLayout: null,
          activeInstanceId: null,
        });
      },
    }),
    {
      name: 'tools-workspace',
      partialize: (state) => ({
        savedLayouts: state.savedLayouts,
      }),
    }
  )
);
