'use client';

import * as React from 'react';
import { Save, FolderOpen, Download, Settings, Undo, Redo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProjectStore } from '@/stores/project-store';

// ========================================
// DAW Toolbar Component
// ========================================

interface ToolbarProps {
  className?: string;
}

export function Toolbar({ className }: ToolbarProps) {
  const projectName = useProjectStore((s) => s.name);
  const newProject = useProjectStore((s) => s.newProject);

  const handleNew = () => {
    if (
      confirm(
        '새 프로젝트를 시작하시겠습니까? 저장하지 않은 변경사항은 사라집니다.'
      )
    ) {
      newProject();
    }
  };

  const handleSave = () => {
    // TODO: Implement save with FileSystem API
    alert('저장 기능은 곧 추가됩니다!');
  };

  const handleExport = () => {
    // TODO: Implement audio export
    alert('내보내기 기능은 곧 추가됩니다!');
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        {/* Project Name */}
        <span className="text-sm text-muted-foreground">{projectName}</span>

        <div className="mx-2 h-4 w-px bg-border" />

        {/* Undo/Redo */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          title="실행 취소 (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          title="다시 실행 (Ctrl+Y)"
        >
          <Redo className="h-4 w-4" />
        </Button>

        <div className="mx-2 h-4 w-px bg-border" />

        {/* File Operations */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleNew}
          title="새 프로젝트"
        >
          <FolderOpen className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleSave}
          title="저장 (Ctrl+S)"
        >
          <Save className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleExport}
          title="내보내기"
        >
          <Download className="h-4 w-4" />
        </Button>

        <div className="mx-2 h-4 w-px bg-border" />

        {/* Settings */}
        <Button variant="ghost" size="icon" className="h-8 w-8" title="설정">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
