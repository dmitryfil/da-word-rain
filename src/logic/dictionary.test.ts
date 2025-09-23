// Dictionary tests

import { Dictionary } from './dictionary.js';

describe('Dictionary', () => {
  let dict: Dictionary;

  beforeEach(() => {
    dict = new Dictionary();
  });

  describe('add and has', () => {
    it('should add and check words correctly', () => {
      dict.add('HELLO');
      dict.add('world');
      
      expect(dict.has('HELLO')).toBe(true);
      expect(dict.has('WORLD')).toBe(true);
      expect(dict.has('hello')).toBe(true);
      expect(dict.has('GOODBYE')).toBe(false);
    });

    it('should normalize words to uppercase', () => {
      dict.add('test');
      dict.add('TEST');
      dict.add('Test');
      
      expect(dict.size).toBe(1);
      expect(dict.has('TEST')).toBe(true);
    });

    it('should reject invalid words', () => {
      dict.add('');
      dict.add(' ');
      dict.add('A'); // Too short
      dict.add('HELLO123'); // Contains numbers
      dict.add('TEST-WORD'); // Contains hyphen
      
      expect(dict.size).toBe(0);
    });

    it('should accept valid words', () => {
      dict.add('AB'); // Minimum length
      dict.add('HELLO');
      dict.add('SUPERCALIFRAGILISTICEXPIALIDOCIOUS'); // Long word
      
      expect(dict.size).toBe(3);
    });
  });

  describe('clear', () => {
    it('should clear all words', () => {
      dict.add('HELLO');
      dict.add('WORLD');
      expect(dict.size).toBe(2);
      
      dict.clear();
      expect(dict.size).toBe(0);
      expect(dict.has('HELLO')).toBe(false);
    });
  });

  describe('toArray', () => {
    it('should return sorted array of words', () => {
      dict.add('ZEBRA');
      dict.add('APPLE');
      dict.add('BANANA');
      
      const words = dict.toArray();
      expect(words).toEqual(['APPLE', 'BANANA', 'ZEBRA']);
    });
  });

  describe('loadFromFile', () => {
    const createMockFile = (content: string, name: string, type: string) => {
      const blob = new Blob([content], { type });
      const file = blob as any;
      file.name = name;
      file.text = async () => content;
      return file;
    };

    it('should load from text file', async () => {
      const content = 'HELLO\nWORLD\nTEST\n';
      const file = createMockFile(content, 'words.txt', 'text/plain');
      
      await dict.loadFromFile(file);
      
      expect(dict.size).toBe(3);
      expect(dict.has('HELLO')).toBe(true);
      expect(dict.has('WORLD')).toBe(true);
      expect(dict.has('TEST')).toBe(true);
    });

    it('should load from JSON file', async () => {
      const content = JSON.stringify(['HELLO', 'WORLD', 'TEST']);
      const file = createMockFile(content, 'words.json', 'application/json');
      
      await dict.loadFromFile(file);
      
      expect(dict.size).toBe(3);
      expect(dict.has('HELLO')).toBe(true);
      expect(dict.has('WORLD')).toBe(true);
      expect(dict.has('TEST')).toBe(true);
    });

    it('should handle empty lines and whitespace', async () => {
      const content = '\nHELLO\n  \nWORLD  \n\nTEST\n';
      const file = createMockFile(content, 'words.txt', 'text/plain');
      
      await dict.loadFromFile(file);
      
      expect(dict.size).toBe(3);
    });
  });
});