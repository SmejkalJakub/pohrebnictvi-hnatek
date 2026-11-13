/**
 * The figure numbering of Template G (plan s11 §4.2): figures and places are numbered "01", "02" …
 * in reading order, starting at 01 on each page. The numbers survive without photos (numbered
 * place rows, numbered people table), so a page reads the same with and without images.
 */
export function figureNumber(index: number): string {
  return String(index).padStart(2, "0");
}

/** Hands out the next number on a page; create one per page render. */
export class FigureCounter {
  private next: number;

  constructor(start = 1) {
    this.next = start;
  }

  take(): string {
    const value = figureNumber(this.next);
    this.next += 1;
    return value;
  }

  /** The number the next figure would get, without taking it. */
  peek(): number {
    return this.next;
  }
}
