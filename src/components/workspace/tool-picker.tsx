'use client';

import { useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getAllTools } from '@/tools';
import { useWorkspaceStore } from '@/stores/workspace-store';
import type { ToolCategory } from '@/tools/types';
import { cn } from '@/lib/utils';

// ========================================
// Tool Picker - 도구 선택 UI
// ========================================

const categoryLabels: Record<ToolCategory, { ko: string; en: string }> = {
  music: { ko: '음악', en: 'Music' },
  utility: { ko: '유틸리티', en: 'Utility' },
  visual: { ko: '비주얼', en: 'Visual' },
  productivity: { ko: '생산성', en: 'Productivity' },
};

const categoryOrder: ToolCategory[] = [
  'music',
  'utility',
  'visual',
  'productivity',
];

interface ToolPickerProps {
  isOpen: boolean;
  onClose: () => void;
  position?: { x: number; y: number };
}

export function ToolPicker({ isOpen, onClose, position }: ToolPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    ToolCategory | 'all'
  >('all');
  const { addTool } = useWorkspaceStore();

  if (!isOpen) return null;

  const allTools = getAllTools();

  // Filter tools by search and category
  const filteredTools = allTools.filter((tool) => {
    const matchesSearch =
      searchQuery === '' ||
      tool.meta.name.ko.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.meta.name.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.meta.tags?.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === 'all' || tool.meta.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Group tools by category
  const toolsByCategory = categoryOrder.reduce(
    (acc, category) => {
      const tools = filteredTools.filter((t) => t.meta.category === category);
      if (tools.length > 0) {
        acc[category] = tools;
      }
      return acc;
    },
    {} as Record<ToolCategory, typeof filteredTools>
  );

  const handleAddTool = (toolId: string) => {
    addTool(toolId, position);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg border bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">도구 추가</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="border-b p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="도구 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1 border-b p-2">
          <Button
            variant={selectedCategory === 'all' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            전체
          </Button>
          {categoryOrder.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {categoryLabels[category].ko}
            </Button>
          ))}
        </div>

        {/* Tool List */}
        <div className="max-h-80 overflow-y-auto p-4">
          {Object.entries(toolsByCategory).length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              검색 결과가 없습니다
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(toolsByCategory).map(([category, tools]) => (
                <div key={category}>
                  <h3 className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                    {categoryLabels[category as ToolCategory].ko}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {tools.map((tool) => (
                      <button
                        key={tool.meta.id}
                        onClick={() => handleAddTool(tool.meta.id)}
                        className={cn(
                          'flex items-center gap-3 rounded-lg border p-3 text-left transition-colors',
                          'hover:bg-accent hover:border-accent-foreground/20'
                        )}
                      >
                        <span className="text-2xl">{tool.meta.icon}</span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">
                            {tool.meta.name.ko}
                          </div>
                          <div className="truncate text-xs text-muted-foreground">
                            {tool.meta.description.ko}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Floating Add Button
export function ToolPickerButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>
      <ToolPicker isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
