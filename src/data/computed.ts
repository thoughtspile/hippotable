import type ColumnTable from "arquero/dist/types/table/column-table";

export type ComputedColumn = { name: string; expr: string };
export type Computed = { columns: ComputedColumn[] };

export function applyComputation(table: ColumnTable, computation: Computed) {
  if (computation.columns.length === 0) return table;
  const derivation = computation.columns
    .filter((c) => c.name && c.expr)
    .map((c) => [c.name, c.expr]);
  return table.derive(Object.fromEntries(derivation));
}
