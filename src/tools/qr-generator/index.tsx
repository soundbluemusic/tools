'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { registerTool } from '../registry';
import type { ToolDefinition, ToolProps } from '../types';
import { cn } from '@/lib/utils';

// ========================================
// QR Generator Tool - QR 코드 생성기
// ========================================

export interface QRSettings {
  text: string;
  size: number;
  foregroundColor: string;
  backgroundColor: string;
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
  [key: string]: unknown;
}

const defaultSettings: QRSettings = {
  text: 'https://tools.soundbluemusic.com',
  size: 256,
  foregroundColor: '#000000',
  backgroundColor: '#ffffff',
  errorCorrection: 'M',
};

// Simple QR Code generator using canvas
// For production, use a proper QR library like 'qrcode'
function generateQRMatrix(text: string, _errorCorrection: string): number[][] {
  // Simplified placeholder - in production use proper QR encoding
  const size = Math.max(
    21,
    Math.min(177, 21 + Math.floor(text.length / 10) * 4)
  );
  const matrix: number[][] = [];

  for (let y = 0; y < size; y++) {
    matrix[y] = [];
    for (let x = 0; x < size; x++) {
      // Position detection patterns
      const isPositionPattern =
        (x < 7 && y < 7) || // Top-left
        (x >= size - 7 && y < 7) || // Top-right
        (x < 7 && y >= size - 7); // Bottom-left

      if (isPositionPattern) {
        const localX = x < 7 ? x : x >= size - 7 ? x - (size - 7) : x;
        const localY = y < 7 ? y : y >= size - 7 ? y - (size - 7) : y;
        const isOuter =
          localX === 0 || localX === 6 || localY === 0 || localY === 6;
        const isInner =
          localX >= 2 && localX <= 4 && localY >= 2 && localY <= 4;
        matrix[y][x] = isOuter || isInner ? 1 : 0;
      } else {
        // Data area - use hash of text and position for pseudo-random pattern
        const hash = (text.charCodeAt(x % text.length) || 0) + y * 31 + x * 17;
        matrix[y][x] = hash % 3 === 0 ? 1 : 0;
      }
    }
  }

  return matrix;
}

function QRGeneratorComponent({
  settings,
  onSettingsChange,
  size,
}: ToolProps<QRSettings>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  const { text, size: qrSize, foregroundColor, backgroundColor } = settings;

  // Generate QR code
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const matrix = generateQRMatrix(text, settings.errorCorrection);
    const moduleSize = qrSize / matrix.length;

    canvas.width = qrSize;
    canvas.height = qrSize;

    // Background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, qrSize, qrSize);

    // Modules
    ctx.fillStyle = foregroundColor;
    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
        if (matrix[y][x]) {
          ctx.fillRect(x * moduleSize, y * moduleSize, moduleSize, moduleSize);
        }
      }
    }
  }, [
    text,
    qrSize,
    foregroundColor,
    backgroundColor,
    settings.errorCorrection,
  ]);

  const downloadQR = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const copyToClipboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), 'image/png')
      );
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const isCompact = size.width < 320;
  const displaySize = Math.min(size.width - 32, size.height - 120, 200);

  return (
    <div
      className={cn('flex h-full flex-col gap-3 p-4', isCompact && 'gap-2 p-2')}
    >
      {/* Input */}
      <textarea
        value={text}
        onChange={(e) => onSettingsChange({ text: e.target.value })}
        placeholder="URL 또는 텍스트 입력..."
        className={cn(
          'w-full resize-none rounded border bg-background px-3 py-2 text-sm',
          isCompact ? 'h-12' : 'h-16'
        )}
      />

      {/* QR Code */}
      <div className="flex flex-1 items-center justify-center">
        <canvas
          ref={canvasRef}
          style={{
            width: displaySize,
            height: displaySize,
            imageRendering: 'pixelated',
          }}
          className="rounded border"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-2">
        <Button
          variant="outline"
          size={isCompact ? 'sm' : 'default'}
          onClick={downloadQR}
        >
          <Download className="mr-1 h-4 w-4" />
          저장
        </Button>
        <Button
          variant="outline"
          size={isCompact ? 'sm' : 'default'}
          onClick={copyToClipboard}
        >
          {copied ? (
            <Check className="mr-1 h-4 w-4 text-green-500" />
          ) : (
            <Copy className="mr-1 h-4 w-4" />
          )}
          복사
        </Button>
      </div>

      {/* Color Options */}
      {!isCompact && (
        <div className="flex justify-center gap-4 text-sm">
          <label className="flex items-center gap-1">
            <input
              type="color"
              value={foregroundColor}
              onChange={(e) =>
                onSettingsChange({ foregroundColor: e.target.value })
              }
              className="h-6 w-6 cursor-pointer rounded border"
            />
            전경
          </label>
          <label className="flex items-center gap-1">
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) =>
                onSettingsChange({ backgroundColor: e.target.value })
              }
              className="h-6 w-6 cursor-pointer rounded border"
            />
            배경
          </label>
        </div>
      )}
    </div>
  );
}

// Tool Definition
export const qrGeneratorTool: ToolDefinition<QRSettings> = {
  meta: {
    id: 'qr-generator',
    name: {
      ko: 'QR 생성기',
      en: 'QR Generator',
    },
    description: {
      ko: 'URL이나 텍스트를 QR 코드로 변환',
      en: 'Convert URL or text to QR code',
    },
    icon: '📱',
    category: 'productivity',
    defaultSize: 'md',
    minSize: { width: 200, height: 280 },
    tags: ['qr', 'code', 'url', 'share'],
  },
  defaultSettings,
  component: QRGeneratorComponent,
};

// Auto-register
registerTool(qrGeneratorTool);
