'use client';

import { WorkspaceContainer } from '@/components/workspace';
import { ToolPickerButton } from '@/components/workspace/tool-picker';
import { Button } from '@/components/ui/button';
import { Save, FolderOpen, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';
import { useWorkspaceStore } from '@/stores/workspace-store';

// ========================================
// Tools Workspace Page - 도구 작업 공간 페이지
// ========================================

export default function ToolsWorkspacePage() {
  const { currentLayout, resetLayout } = useWorkspaceStore();

  const toolCount = currentLayout?.tools.length ?? 0;

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex h-12 items-center justify-between border-b bg-background px-4">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Home className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">도구 작업 공간</h1>
          {toolCount > 0 && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
              {toolCount}개 도구
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <FolderOpen className="h-4 w-4" />
            <span className="hidden sm:inline">불러오기</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-1.5">
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">저장</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={() => resetLayout()}
          >
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline">초기화</span>
          </Button>
        </div>
      </header>

      {/* Workspace */}
      <main className="flex-1 overflow-hidden">
        <WorkspaceContainer />
      </main>

      {/* Floating Add Button */}
      <ToolPickerButton />
    </div>
  );
}
