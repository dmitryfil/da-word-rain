// Dictionary management system

export class Dictionary {
  private words: Set<string> = new Set();
  
  constructor() {
    this.words = new Set();
  }

  has(word: string): boolean {
    return this.words.has(word.toUpperCase());
  }

  add(word: string): void {
    const normalized = word.trim().toUpperCase();
    if (normalized && /^[A-Z]{2,}$/.test(normalized)) {
      this.words.add(normalized);
    }
  }

  clear(): void {
    this.words.clear();
  }

  get size(): number {
    return this.words.size;
  }

  toArray(): string[] {
    return Array.from(this.words).sort();
  }

  async loadFromFile(file: File): Promise<void> {
    this.clear();
    
    const isJSON = /\.json$/i.test(file.name);
    
    if (isJSON) {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (Array.isArray(data)) {
        for (const word of data) {
          this.add(String(word || ''));
        }
      }
      return;
    }

    // Text file processing
    const text = await file.text();
    const lines = text.split(/\r?\n/);
    
    for (const line of lines) {
      this.add(line);
    }
  }

  async loadFromUrl(url: string): Promise<void> {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const text = await response.text();
    const words = text.split(/\r?\n/).map(w => w.trim()).filter(Boolean);
    
    this.clear();
    for (const word of words) {
      this.add(word);
    }
  }
}

// Default dictionary instance
export const dictionary = new Dictionary();