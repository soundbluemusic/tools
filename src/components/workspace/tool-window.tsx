'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { X, Minus } from 'lucide-react';
import { getTool } from '@/tools';
import { useWorkspaceStore } from '@/stores/workspace-store';
import type { ToolInstance } from '@/tools/types';
import { cn } from '@/lib/utils';

// ========================================
// Tool Window - 드래그 가능한 도구 창
// ========================================

interface ToolWindowProps {
  instance: ToolInstance;
}

export function ToolWindow({ instance }: ToolWindowProps) {
  const windowRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const {
    activeInstanceId,
    setActiveInstance,
    updateToolPosition,
    updateToolSettings,
    removeTool,
    toggleToolMinimized,
  } = useWorkspaceStore();

  const tool = getTool(instance.toolId);
  const isActive = activeInstanceId === instance.instanceId;

  // Drag handling
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('button')) return;

      setActiveInstance(instance.instanceId);
      setIsDragging(true);

      const rect = windowRef.current?.getBoundingClientRect();
      if (rect) {
        dragOffset.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
      }
    },
    [instance.instanceId, setActiveInstance]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        const x = e.clientX - dragOffset.current.x;
        const y = e.clientY - dragOffset.current.y;
        updateToolPosition(instance.instanceId, {
          x: Math.max(0, x),
          y: Math.max(0, y),
        });
      }
    },
    [isDragging, instance.instanceId, updateToolPosition]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  // Resize handling
  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsResizing(true);
      setActiveInstance(instance.instanceId);
    },
    [instance.instanceId, setActiveInstance]
  );

  const handleSettingsChange = useCallback(
    (settings: Record<string, unknown>) => {
      updateToolSettings(instance.instanceId, settings);
    },
    [instance.instanceId, updateToolSettings]
  );

  // Return null after all hooks have been called
  if (!tool) return null;

  const ToolComponent = tool.component;

  return (
    <div
      ref={windowRef}
      className={cn(
        'absolute flex flex-col overflow-hidden rounded-lg border bg-card shadow-lg',
        isActive && 'ring-2 ring-primary',
        isDragging && 'cursor-grabbing opacity-90'
      )}
      style={{
        left: instance.position.x,
        top: instance.position.y,
        width: instance.size.width,
        height: instance.isMinimized ? 'auto' : instance.size.height,
        zIndex: instance.zIndex,
      }}
      onClick={() => setActiveInstance(instance.instanceId)}
    >
      {/* Title Bar */}
      <div
        className={cn(
          'flex h-8 cursor-grab items-center justify-between border-b px-2',
          isActive ? 'bg-primary/10' : 'bg-muted/50'
        )}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span className="text-sm">{tool.meta.icon}</span>
          <span className="truncate text-xs font-medium">
            {tool.meta.name.ko}
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => toggleToolMinimized(instance.instanceId)}
            className="rounded p-0.5 hover:bg-muted"
          >
            <Minus className="h-3 w-3" />
          </button>
          <button
            onClick={() => removeTool(instance.instanceId)}
            className="rounded p-0.5 hover:bg-destructive hover:text-destructive-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Content */}
      {!instance.isMinimized && (
        <div className="relative flex-1 overflow-hidden">
          <ToolComponent
            instanceId={instance.instanceId}
            settings={instance.settings}
            onSettingsChange={handleSettingsChange}
            size={instance.size}
            isActive={isActive}
          />

          {/* Resize Handle */}
          <div
            className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize"
            onMouseDown={handleResizeMouseDown}
          >
            <div className="absolute bottom-1 right-1 h-2 w-2 border-b-2 border-r-2 border-muted-foreground/50" />
          </div>
        </div>
      )}
    </div>
  );
}
