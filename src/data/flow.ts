import type ColumnTable from "arquero/dist/types/table/column-table";
import { applyAggregation, type Aggregation } from "./aggregation"
import { applyFilters, type Filter } from "./filter"
import { applyOrder, type Order } from "./order";

export type FlowStep = 
  | { mode: 'aggregate' } & Aggregation
  | { mode: 'filter', filters: Filter[] }
  | { mode: 'order' } & Order
export type Flow = FlowStep[];

export function applyFlow(table: ColumnTable, flow: Flow) {
  return flow.reduce((table, step): ColumnTable => {
    switch (step.mode) {
      case 'aggregate': return applyAggregation(table, step);
      case 'filter': return applyFilters(table, step);
      case 'order': return applyOrder(table, step);
    }
  }, table);
}
