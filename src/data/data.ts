import { loadCSV } from 'arquero';

export const parseCsv = (csv: File) => loadCSV(URL.createObjectURL(csv), {});
