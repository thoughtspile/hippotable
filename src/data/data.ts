import Papa from 'papaparse';
import csv from './data.csv?raw';

interface DataTable {
  length: number;
  cols: {
    name: string;
  }[]
  data: unknown[][];
}

export async function parseCsv(csv: string): Promise<DataTable> {
  const res = Papa.parse(csv, { header: false });
  const [names, ...table] = res.data as [string[], ...unknown[][]];
  return {
    length: table.length,
    cols: names.map(name => ({ name })),
    data: table,
  };
}

export const data = parseCsv(csv);
