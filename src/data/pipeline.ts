import type ColumnTable from "arquero/dist/types/table/column-table";
import {
  applyAggregation,
  type Aggregation,
  parseAggregation,
} from "./aggregation";
import { applyFilters, parseFilter, type Filter } from "./filter";
import { applyOrder, type Order } from "./order";
import { applyComputation, type Computed } from "./computed";
import { array, enums, object, objectLoose, string } from "banditypes";

export type FlowStep =
  | ({ mode: "aggregate" } & Aggregation)
  | { mode: "filter"; filters: Filter[] }
  | ({ mode: "order" } & Order)
  | ({ mode: "compute" } & Computed);
export type FlowStepComputed = FlowStep & { input: ColumnTable };
export type Flow = FlowStep[];
export type FlowComputed = FlowStepComputed[];

function getStep(mode: FlowStep["mode"]): FlowStep {
  switch (mode) {
    case "order":
      return { mode, col: null, dir: "asc" };
    case "aggregate":
      return { mode, key: [], columns: [] };
    case "filter":
      return { mode, filters: [] };
    case "compute":
      return { mode, columns: [] };
  }
}

const parseStep = object({
  mode: enums(["order"]),
  col: string(),
  dir: enums(["asc", "desc"]),
})
  .or(
    object({
      mode: enums(["filter"]),
      filters: array(parseFilter),
    }),
  )
  .or(
    objectLoose({
      mode: enums(["aggregate"]),
    }).map((s) => ({ mode: s.mode, ...parseAggregation(s) })),
  );
export const parseFlow = array<FlowStep>(parseStep);

export function getOrder(flow: Flow): Order | undefined {
  return flow.find(
    (s): s is FlowStep & { mode: "order" } => s.mode === "order",
  );
}

export const flowActions = {
  addStep: (flow: Flow, mode: FlowStep["mode"]) => {
    if (mode === "order") return flow;
    return [...flow, getStep(mode)];
  },
  removeStep: (flow: Flow, id: number) => {
    return flow.filter((_, i) => i !== id);
  },
  changeStep: (flow: Flow, id: number, step: FlowStep) => {
    return flow.map((s, i) => (i === id ? step : s));
  },
  orderBy: (flow: Flow, col: string) => {
    const currentOrder = getOrder(flow);
    return flow
      .filter((s) => s.mode !== "order")
      .concat({
        mode: "order",
        col,
        dir:
          col === currentOrder?.col && currentOrder?.dir === "asc"
            ? "desc"
            : "asc",
      });
  },
};

export function computeFlow(table: ColumnTable, flow: Flow) {
  let current = table;
  const result: FlowComputed = [];
  for (const step of flow) {
    result.push({ ...step, input: current });
    if (step.mode === "aggregate") current = applyAggregation(current, step);
    if (step.mode === "filter") current = applyFilters(current, step);
    if (step.mode === "order") current = applyOrder(current, step);
    if (step.mode === "compute") current = applyComputation(current, step);
  }
  return { flow: result, output: current };
}
