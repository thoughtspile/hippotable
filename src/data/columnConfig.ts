import type ColumnTable from "arquero/dist/types/table/column-table";

export type BaseType = "string" | "number" | "boolean";

export function getColumnType(table: ColumnTable, colName: string): BaseType {
  const sample = table
    .params({ colName })
    .filter((v, $) => v[$.colName] != null)
    .get(colName, 0);
  return typeof sample as BaseType;
}
