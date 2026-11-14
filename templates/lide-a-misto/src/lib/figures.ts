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

/**
 * Column spans on a 12-track grid for `count` cells laid out `perRow` to a row, so no row is left
 * with an empty column: a short last row is spread across the width, and a last row of one (when
 * rows hold three or more) is avoided by making the two last rows shorter (4 → 2 + 2, 5 → 3 + 2).
 * A row with a single cell spans `single` tracks (half the width by default).
 */
export function rowSpans(count: number, perRow: number, single = 6): number[] {
  const spans: number[] = [];
  let remaining = count;
  while (remaining > 0) {
    let row = perRow;
    if (remaining <= perRow) {
      row = remaining;
    } else if (remaining === perRow + 1 && perRow > 2) {
      row = perRow - 1;
    }
    let span = 12 / row;
    if (row === 1) {
      span = single;
    }
    for (let index = 0; index < row; index++) {
      spans.push(span);
    }
    remaining -= row;
  }
  return spans;
}
