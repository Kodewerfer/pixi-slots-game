export type TLineResult = { [value: string]: number } & { points?: number }; // { hv3: 9999, points:9999 }, because the first key is dynamic, it will needs Object.keys(xxx)[0] to acquire

export type TWinLinesResults = TLineResult[] //7 win lines