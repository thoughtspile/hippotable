import { desc } from "arquero";
import type ColumnTable from "arquero/dist/types/table/column-table";

export type Order = { col: string; dir: "asc" | "desc" };

export function applyOrder(table: ColumnTable, { col, dir }: Order) {
  if (col && table.columnNames().includes(col)) {
    return table.orderby(dir === "desc" ? desc(col) : col);
  }
  return table;
}
