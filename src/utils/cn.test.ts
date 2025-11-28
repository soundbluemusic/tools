import { describe, it, expect } from 'vitest';
import { cn, cx } from './cn';

describe('cn', () => {
  it('should join class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should filter falsy values', () => {
    expect(cn('foo', null, undefined, false, '', 'bar')).toBe('foo bar');
  });

  it('should handle nested arrays', () => {
    expect(cn('foo', ['bar', 'baz'])).toBe('foo bar baz');
  });

  it('should handle numbers', () => {
    expect(cn('foo', 123)).toBe('foo 123');
  });

  it('should return empty string for no valid inputs', () => {
    expect(cn(null, undefined, false)).toBe('');
  });
});

describe('cx', () => {
  it('should join class names based on conditions', () => {
    expect(cx({ active: true, disabled: false })).toBe('active');
  });

  it('should handle multiple true conditions', () => {
    expect(cx({ foo: true, bar: true })).toBe('foo bar');
  });

  it('should return empty string when all conditions are false', () => {
    expect(cx({ foo: false, bar: false })).toBe('');
  });

  it('should handle null and undefined conditions', () => {
    expect(cx({ foo: null, bar: undefined, baz: true })).toBe('baz');
  });
});
