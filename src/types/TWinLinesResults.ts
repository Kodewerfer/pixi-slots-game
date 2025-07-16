export type TLineResult = { [value: string]: number } & { points?: number }; // { hv3: 9999, points:9999 }

export type TWinLinesResults = { [line: string]: TLineResult }