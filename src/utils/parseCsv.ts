export function parseCsv(csvLine: string): string[] {
  const cells: string[] = [];
  let currentCell = "";
  let insideQuotes = false;

  for (let i = 0; i < csvLine.length; i++) {
    const char = csvLine[i];
    const nextChar = csvLine[i + 1];

    if (insideQuotes) {
      if (char === '"' && nextChar === '"') {
        currentCell += '"';
        i++;
      } else if (char === '"') {
        insideQuotes = false;
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        insideQuotes = true;
      } else if (char === ",") {
        cells.push(currentCell);
        currentCell = "";
      } else {
        currentCell += char;
      }
    }
  }

  cells.push(currentCell); // 最後のセルを追加
  return cells;
}

export function getCsvColumnIndex(csvLine: string, character: number): number {
  let columnIndex = 0;
  let insideQuotes = false;

  for (let i = 0; i < csvLine.length; i++) {
    const char = csvLine[i];
    const nextChar = csvLine[i + 1];

    if (insideQuotes) {
      if (char === '"' && nextChar === '"') {
        i++; // エスケープされた `""` をスキップ
      } else if (char === '"') {
        insideQuotes = false;
      }
    } else {
      if (char === '"') {
        insideQuotes = true;
      } else if (char === ",") {
        columnIndex++; // **ダブルクォーテーション外のカンマでカラムを更新**
      }
    }

    if (i >= character) {
      return columnIndex;
    }
  }

  return columnIndex;
}
