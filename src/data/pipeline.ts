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

export const flowActions = {
  addStep: (flow: Flow, mode: FlowStep['mode']) => {
    if (mode === 'order') return flow;
    const step: FlowStep = mode === 'aggregate' ? { mode, key: [] } : { mode, filters: [] };
    return [...flow, step];
  },
  removeStep: (flow: Flow, id: number) => {
    return flow.filter((_, i) => i !== id)
  },
  changeStep: (flow: Flow, id: number, step: FlowStep) => {
    return flow.map((s, i) => i === id ? step : s)
  },
};

export interface Pipeline {
  input: ColumnTable;
  output: ColumnTable;
  orderBy: (col: string) => Pipeline;
  setFlow: (flow: Flow) => Pipeline;
  order: Order;
  flow: FlowComputed;
}

const emptyOrder = () => ({ col: null, dir: 'asc' } as const);
export function createPipeline(
  table: ColumnTable, 
  flow: Flow = [], 
  order: Order = emptyOrder()
): Pipeline {
  const cache = computeFlow(table, [...flow, { mode: 'order', ...order }]);
  return {
    input: table,
    output: cache.output,
    flow: cache.flow,
    order,
    orderBy: (col) => createPipeline(table, flow, { 
      col, 
      dir: col === order.col && order.dir === 'asc' ? 'desc' : 'asc'
    }),
    setFlow: (flow) => createPipeline(table, flow, order),
  };
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
