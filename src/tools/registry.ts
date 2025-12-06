// ========================================
// Tool Registry - 도구 등록 및 관리
// ========================================

import type { ToolDefinition, ToolMeta, ToolSettings } from './types';

// 등록된 도구들을 저장하는 Map
const toolRegistry = new Map<string, ToolDefinition>();

/**
 * 도구 등록
 */
export function registerTool<T extends ToolSettings>(
  definition: ToolDefinition<T>
): void {
  if (toolRegistry.has(definition.meta.id)) {
    console.warn(
      `Tool "${definition.meta.id}" is already registered. Overwriting.`
    );
  }
  toolRegistry.set(definition.meta.id, definition as ToolDefinition);
}

/**
 * 도구 가져오기
 */
export function getTool(id: string): ToolDefinition | undefined {
  return toolRegistry.get(id);
}

/**
 * 모든 도구 목록 가져오기
 */
export function getAllTools(): ToolDefinition[] {
  return Array.from(toolRegistry.values());
}

/**
 * 카테고리별 도구 목록 가져오기
 */
export function getToolsByCategory(
  category: ToolMeta['category']
): ToolDefinition[] {
  return getAllTools().filter((tool) => tool.meta.category === category);
}

/**
 * 도구 메타데이터만 가져오기
 */
export function getAllToolMetas(): ToolMeta[] {
  return getAllTools().map((tool) => tool.meta);
}

/**
 * 도구 검색
 */
export function searchTools(query: string): ToolDefinition[] {
  const lowerQuery = query.toLowerCase();
  return getAllTools().filter((tool) => {
    const { name, description, tags } = tool.meta;
    return (
      name.ko.toLowerCase().includes(lowerQuery) ||
      name.en.toLowerCase().includes(lowerQuery) ||
      description.ko.toLowerCase().includes(lowerQuery) ||
      description.en.toLowerCase().includes(lowerQuery) ||
      tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  });
}
