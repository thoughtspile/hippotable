import Papa from 'papaparse';

interface DataTable {
  length: number;
  cols: {
    name: string;
  }[]
  data: unknown[][];
}

export async function parseCsv(csv: File): Promise<DataTable> {
  const res = await new Promise<Papa.ParseResult<unknown>>((ok) => {
    Papa.parse(csv, { 
      header: false,
      complete: res => ok(res)
    });
  });
  const [names, ...table] = res.data as [string[], ...unknown[][]];
  return {
    length: table.length,
    cols: names.map(name => ({ name })),
    data: table,
  };
}
