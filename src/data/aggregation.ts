import type ColumnTable from "arquero/dist/types/table/column-table";

export type Aggregation = {
  key: string[];
}

export function applyAggregation(table: ColumnTable, aggregation: Aggregation) {
  if (aggregation.key.length === 0) return table;
  return table.groupby(...aggregation.key).count();
}
