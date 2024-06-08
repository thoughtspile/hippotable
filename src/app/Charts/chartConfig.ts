import type { ChartType } from "chart.js";
import { nanoid } from "nanoid";
import { getColumnType, type BaseType } from "../../data/columnConfig";
import type ColumnTable from "arquero/dist/types/table/column-table";
import { array, enums, object, string } from "banditypes";

export interface ChartConfig {
  id: string;
  type: ChartType | null;
  axes: string[];
}

const anyType = new Set(["string", "boolean", "number"] as const);
const numericType = new Set(["number"] as const);
export const parseChartConfig = object<ChartConfig>({
  id: string().or(nanoid),
  type: enums([
    "bar",
    "line",
    "scatter",
    "bubble",
    "pie",
    "doughnut",
    "polarArea",
    "radar",
  ] as const),
  axes: array(string()),
});

export const chartTypeAxes: Record<ChartType, Set<BaseType>[]> = {
  bar: [anyType, numericType],
  line: [numericType, numericType],
  scatter: [numericType, numericType],
  bubble: [numericType, numericType, numericType],
  pie: [numericType],
  doughnut: [anyType, numericType],
  polarArea: [anyType, numericType],
  radar: [anyType, numericType],
};

export const chartTypes = Object.keys(chartTypeAxes) as ChartType[];

export const chartConfig = (): ChartConfig => ({
  id: nanoid(),
  axes: [],
  type: null,
});

export function getAxisOptions(
  chartType: ChartType | null,
  table: ColumnTable,
) {
  if (!chartType) return [];
  const colTypes: { name: string; type: BaseType }[] = table
    .columnNames()
    .map((col) => ({
      name: col,
      type: getColumnType(table, col),
    }));
  return chartTypeAxes[chartType].map((allowedTypes) => {
    return colTypes.filter((c) => allowedTypes.has(c.type)).map((c) => c.name);
  });
}

export const isChartReady = (c: ChartConfig) =>
  c.type && c.axes.every((a) => !!a);
