'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { registerTool } from '../registry';
import type { ToolDefinition, ToolProps } from '../types';
import { cn } from '@/lib/utils';

// ========================================
// Tuner Tool - 튜너
// ========================================

export interface TunerSettings {
  a4Frequency: number;
  transposition: number;
  sensitivity: number;
  [key: string]: unknown;
}

const defaultSettings: TunerSettings = {
  a4Frequency: 440,
  transposition: 0,
  sensitivity: 0.8,
};

// Note frequencies for standard tuning
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function frequencyToNote(
  frequency: number,
  a4: number
): { note: string; octave: number; cents: number } {
  const semitones = 12 * Math.log2(frequency / a4);
  const roundedSemitones = Math.round(semitones);
  const cents = Math.round((semitones - roundedSemitones) * 100);

  const noteIndex = ((roundedSemitones % 12) + 12 + 9) % 12; // A is at index 9
  const octave = Math.floor((roundedSemitones + 9) / 12) + 4;

  return {
    note: NOTES[noteIndex],
    octave,
    cents,
  };
}

function TunerComponent({
  settings,
  onSettingsChange,
  size,
}: ToolProps<TunerSettings>) {
  const [isListening, setIsListening] = useState(false);
  const [frequency, setFrequency] = useState<number | null>(null);
  const [note, setNote] = useState<{
    note: string;
    octave: number;
    cents: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  const { a4Frequency, sensitivity } = settings;

  // Autocorrelation-based pitch detection
  const detectPitch = useCallback(
    (analyser: AnalyserNode, sampleRate: number): number | null => {
      const bufferLength = analyser.fftSize;
      const buffer = new Float32Array(bufferLength);
      analyser.getFloatTimeDomainData(buffer);

      // Check if signal is strong enough
      let rms = 0;
      for (let i = 0; i < bufferLength; i++) {
        rms += buffer[i] * buffer[i];
      }
      rms = Math.sqrt(rms / bufferLength);

      if (rms < 0.01 * sensitivity) return null;

      // Autocorrelation
      const correlations = new Float32Array(bufferLength);
      for (let lag = 0; lag < bufferLength; lag++) {
        let sum = 0;
        for (let i = 0; i < bufferLength - lag; i++) {
          sum += buffer[i] * buffer[i + lag];
        }
        correlations[lag] = sum;
      }

      // Find the first peak after the initial drop
      let foundPeak = false;
      let peakLag = 0;
      const minLag = Math.floor(sampleRate / 1000); // 1000 Hz max
      const maxLag = Math.floor(sampleRate / 50); // 50 Hz min

      for (let lag = minLag; lag < maxLag; lag++) {
        if (
          correlations[lag] > correlations[lag - 1] &&
          correlations[lag] > correlations[lag + 1]
        ) {
          if (!foundPeak || correlations[lag] > correlations[peakLag]) {
            peakLag = lag;
            foundPeak = true;
          }
        }
      }

      if (!foundPeak) return null;

      return sampleRate / peakLag;
    },
    [sensitivity]
  );

  const startListening = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 4096;
      source.connect(analyser);
      analyserRef.current = analyser;

      const analyze = () => {
        const freq = detectPitch(analyser, audioContext.sampleRate);
        if (freq) {
          setFrequency(freq);
          setNote(frequencyToNote(freq, a4Frequency));
        } else {
          setFrequency(null);
          setNote(null);
        }
        animationRef.current = requestAnimationFrame(analyze);
      };

      analyze();
      setIsListening(true);
    } catch (err) {
      setError('마이크 접근 권한이 필요합니다');
      console.error('Microphone access error:', err);
    }
  };

  const stopListening = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsListening(false);
    setFrequency(null);
    setNote(null);
  };

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  const isCompact = size.width < 280;
  const cents = note?.cents ?? 0;
  const isInTune = Math.abs(cents) < 5;

  return (
    <div
      className={cn(
        'flex h-full flex-col items-center justify-center gap-4 p-4',
        isCompact && 'gap-2 p-2'
      )}
    >
      {error && <div className="text-sm text-destructive">{error}</div>}

      {/* Note Display */}
      <div className="text-center">
        <div
          className={cn(
            'font-bold transition-colors',
            isCompact ? 'text-5xl' : 'text-7xl',
            note
              ? isInTune
                ? 'text-green-500'
                : 'text-foreground'
              : 'text-muted-foreground'
          )}
        >
          {note ? `${note.note}${note.octave}` : '--'}
        </div>
        <div className="text-sm text-muted-foreground">
          {frequency ? `${frequency.toFixed(1)} Hz` : 'No signal'}
        </div>
      </div>

      {/* Cents Indicator */}
      <div
        className={cn(
          'relative w-full max-w-[200px]',
          isCompact && 'max-w-[150px]'
        )}
      >
        {/* Scale */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>-50</span>
          <span>0</span>
          <span>+50</span>
        </div>
        {/* Bar */}
        <div className="relative mt-1 h-3 rounded-full bg-muted">
          {/* Center marker */}
          <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-primary" />
          {/* Needle */}
          {note && (
            <div
              className={cn(
                'absolute top-0 h-full w-2 rounded-full transition-all',
                isInTune ? 'bg-green-500' : 'bg-yellow-500'
              )}
              style={{
                left: `calc(50% + ${(cents / 50) * 50}% - 4px)`,
              }}
            />
          )}
        </div>
        {/* Cents display */}
        <div className="mt-1 text-center text-sm">
          {note && (
            <span
              className={isInTune ? 'text-green-500' : 'text-muted-foreground'}
            >
              {cents > 0 ? '+' : ''}
              {cents} cents
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      <Button
        variant={isListening ? 'destructive' : 'default'}
        size={isCompact ? 'sm' : 'lg'}
        onClick={isListening ? stopListening : startListening}
        className="gap-2"
      >
        {isListening ? (
          <>
            <MicOff className="h-4 w-4" />
            정지
          </>
        ) : (
          <>
            <Mic className="h-4 w-4" />
            시작
          </>
        )}
      </Button>

      {/* A4 Reference */}
      {!isCompact && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>A4 =</span>
          <input
            type="number"
            value={a4Frequency}
            onChange={(e) =>
              onSettingsChange({ a4Frequency: Number(e.target.value) })
            }
            className="w-16 rounded border bg-background px-2 py-1 text-center"
            min={400}
            max={480}
          />
          <span>Hz</span>
        </div>
      )}
    </div>
  );
}

// Tool Definition
export const tunerTool: ToolDefinition<TunerSettings> = {
  meta: {
    id: 'tuner',
    name: {
      ko: '튜너',
      en: 'Tuner',
    },
    description: {
      ko: '악기 음정을 정확하게 맞추는 튜너',
      en: 'Chromatic tuner for instruments',
    },
    icon: '🎸',
    category: 'music',
    defaultSize: 'md',
    minSize: { width: 180, height: 280 },
    tags: ['pitch', 'instrument', 'tuning', 'music'],
  },
  defaultSettings,
  component: TunerComponent,
};

// Auto-register
registerTool(tunerTool);
