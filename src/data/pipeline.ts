import type ColumnTable from "arquero/dist/types/table/column-table";
import { applyAggregation, type Aggregation } from "./aggregation"
import { applyFilters, type Filter } from "./filter"
import { applyOrder, type Order } from "./order";

export type FlowStep = 
  | { mode: 'aggregate' } & Aggregation
  | { mode: 'filter', filters: Filter[] }
  | { mode: 'order' } & Order
export type FlowStepComputed = FlowStep & { input: ColumnTable };
export type Flow = FlowStep[];
export type FlowComputed = FlowStepComputed[];

export interface Pipeline {
  input: ColumnTable;
  output: ColumnTable;
  orderBy: (col: string) => Pipeline;
  addStep: (mode: FlowStep['mode']) => Pipeline;
  removeStep: (i: number) => Pipeline;
  changeStep: (i: number, s: FlowStep) => Pipeline;
  order: Order;
  flow: FlowComputed;
}

export function createPipeline(
  table: ColumnTable, 
  flow: Flow = [], 
  order: Order = { col: null, dir: 'asc' }
): Pipeline {
  const cache = computeFlow(table, [...flow, { mode: 'order', ...order }]);
  const pipeline: Pipeline = {
    input: table,
    output: cache.output,
    flow: cache.flow,
    order,
    orderBy: (col) => createPipeline(table, flow, { 
      col, 
      dir: col === order.col && order.dir === 'asc' ? 'desc' : 'asc'
    }),
    addStep: (mode) => {
      if (mode === 'order') return pipeline;
      const step: FlowStep = mode === 'aggregate' ? { mode, key: [] } : { mode, filters: [] };
      return createPipeline(table, [...flow, step], order);
    },
    removeStep: (id) => {
      return createPipeline(table, flow.filter((_, i) => i !== id), order);
    },
    changeStep: (id, step) => {
      return createPipeline(table, flow.map((s, i) => i === id ? step : s), order);
    }
  };
  return pipeline;
}

export function computeFlow(table: ColumnTable, flow: Flow) {
  let current = table;
  const result: FlowComputed = [];
  for (const step of flow) {
    result.push({ ...step, input: current });
    if (step.mode === 'aggregate') current = applyAggregation(current, step);
    if (step.mode === 'filter') current = applyFilters(current, step);
    if (step.mode === 'order') current = applyOrder(current, step);
  }
  return { flow: result, output: current };
}
