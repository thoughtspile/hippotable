import type ColumnTable from "arquero/dist/types/table/column-table";

export const NO_GROUPBY = '(none)';
export type Aggregation = {
  key: string[];
}

export function applyAggregation(table: ColumnTable, aggregation: Aggregation) {
  if (aggregation.key.includes(NO_GROUPBY)) return table.count();
  if (aggregation.key.length === 0) return table;
  return table.groupby(...aggregation.key).count();
}
