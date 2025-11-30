/**
 * Storage utility tests
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  clearStorage,
  createEnumValidator,
  createObjectValidator,
  isString,
  isNumber,
  isBoolean,
} from './storage';

describe('Storage Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('getStorageItem', () => {
    it('returns default value when key does not exist', () => {
      const result = getStorageItem('nonexistent', 'default');
      expect(result).toBe('default');
    });

    it('returns stored value when key exists', () => {
      localStorage.setItem('testKey', JSON.stringify('storedValue'));
      const result = getStorageItem('testKey', 'default');
      expect(result).toBe('storedValue');
    });

    it('works with session storage', () => {
      sessionStorage.setItem('sessionKey', JSON.stringify('sessionValue'));
      const result = getStorageItem('sessionKey', 'default', 'session');
      expect(result).toBe('sessionValue');
    });

    it('returns default on JSON parse error', () => {
      localStorage.setItem('invalid', 'not-json');
      const result = getStorageItem('invalid', 'default');
      expect(result).toBe('default');
    });
  });

  describe('getStorageItem with validator', () => {
    it('returns value when validator passes', () => {
      localStorage.setItem('lang', JSON.stringify('ko'));
      const isLanguage = createEnumValidator(['ko', 'en'] as const);
      const result = getStorageItem('lang', 'en', { validator: isLanguage });
      expect(result).toBe('ko');
    });

    it('returns default when validator fails', () => {
      localStorage.setItem('lang', JSON.stringify('invalid'));
      const isLanguage = createEnumValidator(['ko', 'en'] as const);
      const result = getStorageItem('lang', 'en', { validator: isLanguage });
      expect(result).toBe('en');
    });

    it('returns default when stored type differs from expected', () => {
      localStorage.setItem('count', JSON.stringify('not-a-number'));
      const result = getStorageItem('count', 0, { validator: isNumber });
      expect(result).toBe(0);
    });
  });

  describe('setStorageItem', () => {
    it('stores value in localStorage', () => {
      const result = setStorageItem('key', 'value');
      expect(result).toBe(true);
      expect(JSON.parse(localStorage.getItem('key')!)).toBe('value');
    });

    it('stores complex objects', () => {
      const obj = { name: 'test', count: 42 };
      setStorageItem('obj', obj);
      expect(JSON.parse(localStorage.getItem('obj')!)).toEqual(obj);
    });

    it('works with session storage', () => {
      setStorageItem('sessionKey', 'value', 'session');
      expect(JSON.parse(sessionStorage.getItem('sessionKey')!)).toBe('value');
    });
  });

  describe('removeStorageItem', () => {
    it('removes item from storage', () => {
      localStorage.setItem('key', 'value');
      const result = removeStorageItem('key');
      expect(result).toBe(true);
      expect(localStorage.getItem('key')).toBeNull();
    });
  });

  describe('clearStorage', () => {
    it('clears all items from storage', () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');
      clearStorage();
      expect(localStorage.length).toBe(0);
    });
  });
});

describe('Validators', () => {
  describe('createEnumValidator', () => {
    it('returns true for valid enum values', () => {
      const isColor = createEnumValidator(['red', 'green', 'blue'] as const);
      expect(isColor('red')).toBe(true);
      expect(isColor('green')).toBe(true);
    });

    it('returns false for invalid enum values', () => {
      const isColor = createEnumValidator(['red', 'green', 'blue'] as const);
      expect(isColor('yellow')).toBe(false);
      expect(isColor(123)).toBe(false);
    });
  });

  describe('isString', () => {
    it('validates strings correctly', () => {
      expect(isString('hello')).toBe(true);
      expect(isString('')).toBe(true);
      expect(isString(123)).toBe(false);
      expect(isString(null)).toBe(false);
    });
  });

  describe('isNumber', () => {
    it('validates numbers correctly', () => {
      expect(isNumber(42)).toBe(true);
      expect(isNumber(3.14)).toBe(true);
      expect(isNumber(0)).toBe(true);
      expect(isNumber(NaN)).toBe(false);
      expect(isNumber('42')).toBe(false);
    });
  });

  describe('isBoolean', () => {
    it('validates booleans correctly', () => {
      expect(isBoolean(true)).toBe(true);
      expect(isBoolean(false)).toBe(true);
      expect(isBoolean(0)).toBe(false);
      expect(isBoolean('true')).toBe(false);
    });
  });

  describe('createObjectValidator', () => {
    it('validates object shape correctly', () => {
      const isSettings = createObjectValidator({
        theme: isString,
        volume: isNumber,
      });

      expect(isSettings({ theme: 'dark', volume: 80 })).toBe(true);
      expect(isSettings({ theme: 'dark', volume: '80' })).toBe(false);
      expect(isSettings({ theme: 'dark' })).toBe(false);
      expect(isSettings(null)).toBe(false);
      expect(isSettings('string')).toBe(false);
    });

    it('handles nested validation', () => {
      const isUser = createObjectValidator({
        name: isString,
        active: isBoolean,
      });

      expect(isUser({ name: 'John', active: true })).toBe(true);
      expect(isUser({ name: 123, active: true })).toBe(false);
    });
  });
});
