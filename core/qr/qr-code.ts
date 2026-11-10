/**
 * QR Code Model 2 encoder (ISO/IEC 18004), byte mode, error correction level M, versions 1–40.
 * Pure TypeScript with no dependencies, so notice QR codes are generated at build time with no
 * runtime service and no network access (research §8). The structure follows Project Nayuki's
 * reference implementation (MIT); the mask is chosen with the standard penalty rules.
 */

/** Error correction level M: about 15 % of codewords can be restored (smudged print, folds). */
const ECC_FORMAT_BITS_M = 0;

// Indexed by version (index 0 unused). Level M only.
const ECC_CODEWORDS_PER_BLOCK_M = [
  -1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28,
  28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28,
];
const NUM_ERROR_CORRECTION_BLOCKS_M = [
  -1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28,
  29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49,
];

const PENALTY_N1 = 3;
const PENALTY_N2 = 3;
const PENALTY_N3 = 40;
const PENALTY_N4 = 10;

export interface QrMatrix {
  version: number;
  size: number;
  /** modules[y][x]: true = dark. */
  modules: boolean[][];
}

function getBit(value: number, index: number): boolean {
  return ((value >>> index) & 1) !== 0;
}

function numRawDataModules(version: number): number {
  let result = (16 * version + 128) * version + 64;
  if (version >= 2) {
    const numAlign = Math.floor(version / 7) + 2;
    result -= (25 * numAlign - 10) * numAlign - 55;
    if (version >= 7) {
      result -= 36;
    }
  }
  return result;
}

function numDataCodewords(version: number): number {
  const eccPerBlock = ECC_CODEWORDS_PER_BLOCK_M[version] as number;
  const blocks = NUM_ERROR_CORRECTION_BLOCKS_M[version] as number;
  return Math.floor(numRawDataModules(version) / 8) - eccPerBlock * blocks;
}

function charCountBits(version: number): number {
  if (version <= 9) {
    return 8;
  }
  return 16;
}

// ---------------------------------------------------------------------------
// Reed–Solomon over GF(2^8) with the polynomial 0x11D
// ---------------------------------------------------------------------------

function gfMultiply(x: number, y: number): number {
  let z = 0;
  for (let i = 7; i >= 0; i -= 1) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z & 0xff;
}

function reedSolomonDivisor(degree: number): number[] {
  const result: number[] = new Array<number>(degree).fill(0);
  result[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i += 1) {
    for (let j = 0; j < result.length; j += 1) {
      result[j] = gfMultiply(result[j] as number, root);
      if (j + 1 < result.length) {
        result[j] = (result[j] as number) ^ (result[j + 1] as number);
      }
    }
    root = gfMultiply(root, 0x02);
  }
  return result;
}

function reedSolomonRemainder(data: readonly number[], divisor: readonly number[]): number[] {
  const result: number[] = divisor.map(() => 0);
  for (const byte of data) {
    const factor = byte ^ (result.shift() as number);
    result.push(0);
    divisor.forEach((coefficient, index) => {
      result[index] = (result[index] as number) ^ gfMultiply(coefficient, factor);
    });
  }
  return result;
}

// ---------------------------------------------------------------------------
// Data codewords
// ---------------------------------------------------------------------------

function chooseVersion(byteLength: number): number {
  for (let version = 1; version <= 40; version += 1) {
    const capacityBits = numDataCodewords(version) * 8;
    const neededBits = 4 + charCountBits(version) + byteLength * 8;
    if (neededBits <= capacityBits) {
      return version;
    }
  }
  throw new Error(`Text is too long for a QR code (${byteLength} bytes).`);
}

function dataCodewords(bytes: Uint8Array, version: number): number[] {
  const bits: number[] = [];
  const append = (value: number, length: number): void => {
    for (let i = length - 1; i >= 0; i -= 1) {
      bits.push((value >>> i) & 1);
    }
  };
  append(0b0100, 4); // byte mode
  append(bytes.length, charCountBits(version));
  for (const byte of bytes) {
    append(byte, 8);
  }
  const capacityBits = numDataCodewords(version) * 8;
  append(0, Math.min(4, capacityBits - bits.length));
  append(0, (8 - (bits.length % 8)) % 8);
  for (let pad = 0xec; bits.length < capacityBits; pad ^= 0xec ^ 0x11) {
    append(pad, 8);
  }
  const codewords: number[] = new Array<number>(bits.length / 8).fill(0);
  bits.forEach((bit, index) => {
    codewords[index >>> 3] = (codewords[index >>> 3] as number) | (bit << (7 - (index & 7)));
  });
  return codewords;
}

function addEccAndInterleave(data: readonly number[], version: number): number[] {
  const numBlocks = NUM_ERROR_CORRECTION_BLOCKS_M[version] as number;
  const blockEccLen = ECC_CODEWORDS_PER_BLOCK_M[version] as number;
  const rawCodewords = Math.floor(numRawDataModules(version) / 8);
  const numShortBlocks = numBlocks - (rawCodewords % numBlocks);
  const shortBlockLen = Math.floor(rawCodewords / numBlocks);

  const blocks: number[][] = [];
  const divisor = reedSolomonDivisor(blockEccLen);
  let offset = 0;
  for (let i = 0; i < numBlocks; i += 1) {
    let dataLength = shortBlockLen - blockEccLen;
    if (i >= numShortBlocks) {
      dataLength += 1;
    }
    const block = data.slice(offset, offset + dataLength);
    offset += dataLength;
    const ecc = reedSolomonRemainder(block, divisor);
    if (i < numShortBlocks) {
      block.push(0); // padding cell, skipped when interleaving
    }
    blocks.push([...block, ...ecc]);
  }

  const result: number[] = [];
  const blockLength = (blocks[0] as number[]).length;
  for (let i = 0; i < blockLength; i += 1) {
    blocks.forEach((block, j) => {
      const isPadding = i === shortBlockLen - blockEccLen && j < numShortBlocks;
      if (!isPadding) {
        result.push(block[i] as number);
      }
    });
  }
  return result;
}

// ---------------------------------------------------------------------------
// Matrix
// ---------------------------------------------------------------------------

class Grid {
  readonly version: number;
  readonly size: number;
  readonly modules: boolean[][];
  readonly isFunction: boolean[][];

  constructor(version: number) {
    this.version = version;
    this.size = version * 4 + 17;
    this.modules = Array.from({ length: this.size }, () => new Array<boolean>(this.size).fill(false));
    this.isFunction = Array.from({ length: this.size }, () => new Array<boolean>(this.size).fill(false));
  }

  setFunction(x: number, y: number, dark: boolean): void {
    (this.modules[y] as boolean[])[x] = dark;
    (this.isFunction[y] as boolean[])[x] = true;
  }

  get(x: number, y: number): boolean {
    return (this.modules[y] as boolean[])[x] as boolean;
  }
}

function alignmentPositions(version: number): number[] {
  if (version === 1) {
    return [];
  }
  const size = version * 4 + 17;
  const numAlign = Math.floor(version / 7) + 2;
  const step = Math.floor((version * 8 + numAlign * 3 + 5) / (numAlign * 4 - 4)) * 2;
  const result = [6];
  for (let position = size - 7; result.length < numAlign; position -= step) {
    result.splice(1, 0, position);
  }
  return result;
}

function drawFinder(grid: Grid, cx: number, cy: number): void {
  for (let dy = -4; dy <= 4; dy += 1) {
    for (let dx = -4; dx <= 4; dx += 1) {
      const x = cx + dx;
      const y = cy + dy;
      if (x < 0 || x >= grid.size || y < 0 || y >= grid.size) {
        continue;
      }
      const distance = Math.max(Math.abs(dx), Math.abs(dy));
      grid.setFunction(x, y, distance !== 2 && distance !== 4);
    }
  }
}

function drawAlignment(grid: Grid, cx: number, cy: number): void {
  for (let dy = -2; dy <= 2; dy += 1) {
    for (let dx = -2; dx <= 2; dx += 1) {
      grid.setFunction(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }
  }
}

function drawFormatBits(grid: Grid, mask: number): void {
  const data = (ECC_FORMAT_BITS_M << 3) | mask;
  let remainder = data;
  for (let i = 0; i < 10; i += 1) {
    remainder = (remainder << 1) ^ ((remainder >>> 9) * 0x537);
  }
  const bits = ((data << 10) | remainder) ^ 0x5412;
  const size = grid.size;
  for (let i = 0; i <= 5; i += 1) {
    grid.setFunction(8, i, getBit(bits, i));
  }
  grid.setFunction(8, 7, getBit(bits, 6));
  grid.setFunction(8, 8, getBit(bits, 7));
  grid.setFunction(7, 8, getBit(bits, 8));
  for (let i = 9; i < 15; i += 1) {
    grid.setFunction(14 - i, 8, getBit(bits, i));
  }
  for (let i = 0; i < 8; i += 1) {
    grid.setFunction(size - 1 - i, 8, getBit(bits, i));
  }
  for (let i = 8; i < 15; i += 1) {
    grid.setFunction(8, size - 15 + i, getBit(bits, i));
  }
  grid.setFunction(8, size - 8, true); // the dark module
}

function drawVersionBits(grid: Grid): void {
  if (grid.version < 7) {
    return;
  }
  let remainder = grid.version;
  for (let i = 0; i < 12; i += 1) {
    remainder = (remainder << 1) ^ ((remainder >>> 11) * 0x1f25);
  }
  const bits = (grid.version << 12) | remainder;
  for (let i = 0; i < 18; i += 1) {
    const bit = getBit(bits, i);
    const a = grid.size - 11 + (i % 3);
    const b = Math.floor(i / 3);
    grid.setFunction(a, b, bit);
    grid.setFunction(b, a, bit);
  }
}

function drawFunctionPatterns(grid: Grid): void {
  for (let i = 0; i < grid.size; i += 1) {
    grid.setFunction(6, i, i % 2 === 0);
    grid.setFunction(i, 6, i % 2 === 0);
  }
  drawFinder(grid, 3, 3);
  drawFinder(grid, grid.size - 4, 3);
  drawFinder(grid, 3, grid.size - 4);
  const positions = alignmentPositions(grid.version);
  const last = positions.length - 1;
  positions.forEach((x, i) => {
    positions.forEach((y, j) => {
      const isFinderCorner = (i === 0 && j === 0) || (i === 0 && j === last) || (i === last && j === 0);
      if (!isFinderCorner) {
        drawAlignment(grid, x, y);
      }
    });
  });
  drawFormatBits(grid, 0); // placeholder bits, redrawn once the mask is chosen
  drawVersionBits(grid);
}

function drawCodewords(grid: Grid, codewords: readonly number[]): void {
  let bitIndex = 0;
  const totalBits = codewords.length * 8;
  for (let right = grid.size - 1; right >= 1; right -= 2) {
    if (right === 6) {
      right = 5;
    }
    for (let vertical = 0; vertical < grid.size; vertical += 1) {
      for (let j = 0; j < 2; j += 1) {
        const x = right - j;
        const upward = ((right + 1) & 2) === 0;
        let y = vertical;
        if (upward) {
          y = grid.size - 1 - vertical;
        }
        const isFunctionModule = (grid.isFunction[y] as boolean[])[x] as boolean;
        if (!isFunctionModule && bitIndex < totalBits) {
          const byte = codewords[bitIndex >>> 3] as number;
          (grid.modules[y] as boolean[])[x] = getBit(byte, 7 - (bitIndex & 7));
          bitIndex += 1;
        }
      }
    }
  }
}

function maskApplies(mask: number, x: number, y: number): boolean {
  switch (mask) {
    case 0:
      return (x + y) % 2 === 0;
    case 1:
      return y % 2 === 0;
    case 2:
      return x % 3 === 0;
    case 3:
      return (x + y) % 3 === 0;
    case 4:
      return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
    case 5:
      return ((x * y) % 2) + ((x * y) % 3) === 0;
    case 6:
      return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
    default:
      return (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
  }
}

/** XOR the mask over every data module; applying it twice restores the grid. */
function applyMask(grid: Grid, mask: number): void {
  for (let y = 0; y < grid.size; y += 1) {
    for (let x = 0; x < grid.size; x += 1) {
      const isFunctionModule = (grid.isFunction[y] as boolean[])[x] as boolean;
      if (!isFunctionModule && maskApplies(mask, x, y)) {
        (grid.modules[y] as boolean[])[x] = !grid.get(x, y);
      }
    }
  }
}

/** Penalty for runs of five or more same-coloured modules and finder-like 1:1:3:1:1 patterns. */
function linePenalty(line: readonly boolean[]): number {
  let penalty = 0;
  let runColor = line[0] as boolean;
  let runLength = 0;
  for (const module of line) {
    if (module === runColor) {
      runLength += 1;
      continue;
    }
    if (runLength >= 5) {
      penalty += PENALTY_N1 + (runLength - 5);
    }
    runColor = module;
    runLength = 1;
  }
  if (runLength >= 5) {
    penalty += PENALTY_N1 + (runLength - 5);
  }
  const text = line.map((module) => (module ? "1" : "0")).join("");
  const finderLike = [/(?=10111010000)/g, /(?=00001011101)/g];
  for (const pattern of finderLike) {
    penalty += PENALTY_N3 * [...text.matchAll(pattern)].length;
  }
  return penalty;
}

function penaltyScore(grid: Grid): number {
  let penalty = 0;
  const size = grid.size;
  for (let y = 0; y < size; y += 1) {
    penalty += linePenalty(grid.modules[y] as boolean[]);
  }
  for (let x = 0; x < size; x += 1) {
    const column: boolean[] = [];
    for (let y = 0; y < size; y += 1) {
      column.push(grid.get(x, y));
    }
    penalty += linePenalty(column);
  }
  let dark = 0;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const color = grid.get(x, y);
      if (color) {
        dark += 1;
      }
      const inBlock = x < size - 1 && y < size - 1;
      if (inBlock) {
        const sameBlock =
          color === grid.get(x + 1, y) && color === grid.get(x, y + 1) && color === grid.get(x + 1, y + 1);
        if (sameBlock) {
          penalty += PENALTY_N2;
        }
      }
    }
  }
  const total = size * size;
  const deviation = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
  penalty += Math.max(0, deviation) * PENALTY_N4;
  return penalty;
}

/** Encode UTF-8 text (a URL) as a QR matrix, version chosen automatically, level M. */
export function encodeQr(text: string): QrMatrix {
  const bytes = new TextEncoder().encode(text);
  const version = chooseVersion(bytes.length);
  const codewords = addEccAndInterleave(dataCodewords(bytes, version), version);
  const grid = new Grid(version);
  drawFunctionPatterns(grid);
  drawCodewords(grid, codewords);

  let bestMask = 0;
  let bestPenalty = Number.POSITIVE_INFINITY;
  for (let mask = 0; mask < 8; mask += 1) {
    applyMask(grid, mask);
    drawFormatBits(grid, mask);
    const penalty = penaltyScore(grid);
    if (penalty < bestPenalty) {
      bestMask = mask;
      bestPenalty = penalty;
    }
    applyMask(grid, mask);
  }
  applyMask(grid, bestMask);
  drawFormatBits(grid, bestMask);
  return { version, size: grid.size, modules: grid.modules };
}

export interface QrSvgOptions {
  /** Light modules around the code; the standard asks for 4. */
  quietZone?: number;
  /** Accessible name; when set the SVG gets role="img" and a <title>. */
  title?: string;
}

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/**
 * A standalone, printable SVG: black modules on a white square, one path, no classes or styles,
 * so it scales to any print size. Dimensions come from the viewBox; templates size it in CSS.
 */
export function qrSvg(text: string, options: QrSvgOptions = {}): string {
  const matrix = encodeQr(text);
  const quiet = options.quietZone ?? 4;
  const full = matrix.size + quiet * 2;
  // One rectangle per horizontal run of dark modules keeps the inline SVG small.
  const segments: string[] = [];
  matrix.modules.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      if (!row[x]) {
        x += 1;
        continue;
      }
      const start = x;
      while (x < row.length && row[x]) {
        x += 1;
      }
      const run = x - start;
      segments.push(`M${start + quiet} ${y + quiet}h${run}v1h-${run}z`);
    }
  });
  const attributes = [
    'xmlns="http://www.w3.org/2000/svg"',
    `viewBox="0 0 ${full} ${full}"`,
    'shape-rendering="crispEdges"',
  ];
  let title = "";
  if (options.title !== undefined) {
    attributes.push('role="img"');
    title = `<title>${escapeXml(options.title)}</title>`;
  }
  return `<svg ${attributes.join(" ")}>${title}<rect width="${full}" height="${full}" fill="#fff"/><path fill="#000" d="${segments.join("")}"/></svg>`;
}
