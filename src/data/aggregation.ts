import { op } from "arquero";
import type ColumnTable from "arquero/dist/types/table/column-table";

export const NO_GROUPBY = "(none)";
export type AggregateCol = {
  name?: string;
  fn?: (typeof aggregateFunctions)[number];
  sourceCol?: string;
};
export type Aggregation = {
  key: string[];
  columns: AggregateCol[];
};

export const aggregateFunctions = (
  [
    "any",
    "count",
    "distinct",
    "max",
    "min",
    "sum",
    "product",
    "mean",
    "mode",
    "median",
    "stdev",
    "variance",
    // extra param
    // 'quantile',
    // multi-column
    // 'corr',
    // 'covariance'
  ] as const
)
  .slice()
  .sort();

export function applyAggregation(table: ColumnTable, aggregation: Aggregation) {
  if (aggregation.key.length === 0) return table;
  const rollup = aggregation.columns
    .filter((c) => c.name && c.fn && c.sourceCol)
    .map((col) => [col.name, op[col.fn](col.sourceCol)]);
  const key = aggregation.key.includes(NO_GROUPBY) ? [] : aggregation.key;
  return table.groupby(...key).rollup(Object.fromEntries(rollup));
}
