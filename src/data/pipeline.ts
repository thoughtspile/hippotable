import type ColumnTable from "arquero/dist/types/table/column-table";
import { applyAggregation, type Aggregation } from "./aggregation"
import { applyFilters, type Filter } from "./filter"
import { applyOrder, type Order } from "./order";
import { applyComputation, type Computed } from "./computed";

export type FlowStep = 
  | { mode: 'aggregate' } & Aggregation
  | { mode: 'filter', filters: Filter[] }
  | { mode: 'order' } & Order
  | { mode: 'compute' } & Computed;
export type FlowStepComputed = FlowStep & { input: ColumnTable };
export type Flow = FlowStep[];
export type FlowComputed = FlowStepComputed[];

function getStep(mode: FlowStep['mode']): FlowStep {
  switch (mode) {
    case 'order': return { mode, col: null, dir: 'asc' };
    case 'aggregate': return { mode, key: [], columns: [] };
    case 'filter': return { mode, filters: [] };
    case 'compute': return { mode, columns: [] };
  }
}

export const flowActions = {
  addStep: (flow: Flow, mode: FlowStep['mode']) => {
    if (mode === 'order') return flow;
    return [...flow, getStep(mode)];
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
    if (step.mode === 'compute') current = applyComputation(current, step);
  }
  return { flow: result, output: current };
}
