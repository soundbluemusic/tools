'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { ToolWindow } from './tool-window';
import { ToolPicker } from './tool-picker';
import { cn } from '@/lib/utils';

// ========================================
// Workspace Container - 도구 작업 공간
// ========================================

interface WorkspaceContainerProps {
  className?: string;
}

export function WorkspaceContainer({ className }: WorkspaceContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerPosition, setPickerPosition] = useState<
    { x: number; y: number } | undefined
  >();

  const { currentLayout, setActiveInstance } = useWorkspaceStore();

  const toolInstances = currentLayout?.tools ?? [];

  // Handle background click to deselect
  const handleBackgroundClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === containerRef.current) {
        setActiveInstance(null);
      }
    },
    [setActiveInstance]
  );

  // Handle double-click to add tool
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (e.target === containerRef.current) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setPickerPosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
        setIsPickerOpen(true);
      }
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + N to add new tool
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        setIsPickerOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative h-full w-full overflow-hidden bg-muted/30',
        'bg-[radial-gradient(circle,_var(--tw-gradient-stops))]',
        'from-transparent via-transparent to-muted/50',
        className
      )}
      style={{
        backgroundImage: `
          radial-gradient(circle at 1px 1px, var(--border) 1px, transparent 0)
        `,
        backgroundSize: '24px 24px',
      }}
      onClick={handleBackgroundClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* Empty State */}
      {toolInstances.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
          <div className="mb-4 text-6xl opacity-20">🧰</div>
          <p className="text-lg">작업 공간이 비어있습니다</p>
          <p className="mt-1 text-sm">
            더블 클릭하거나{' '}
            <button
              onClick={() => setIsPickerOpen(true)}
              className="text-primary underline-offset-4 hover:underline"
            >
              도구 추가
            </button>
            를 눌러 시작하세요
          </p>
          <p className="mt-4 text-xs opacity-60">Cmd/Ctrl + N</p>
        </div>
      )}

      {/* Tool Windows */}
      {toolInstances.map((instance) => (
        <ToolWindow key={instance.instanceId} instance={instance} />
      ))}

      {/* Tool Picker Modal */}
      <ToolPicker
        isOpen={isPickerOpen}
        onClose={() => {
          setIsPickerOpen(false);
          setPickerPosition(undefined);
        }}
        position={pickerPosition}
      />
    </div>
  );
}
