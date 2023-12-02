import type ColumnTable from "arquero/dist/types/table/column-table";

export type Condition = 'eq' | 'neq' | 'lt' | 'lte' | 'gt' | 'gte';

export interface Filter {
  name: string;
  condition: Condition;
  value: unknown;
}

export interface ColumnDescriptor {
  name: string;
  availableConditions: Condition[];
  castValue: (v: string) => unknown;
}

export const conditionSymbol: Record<Condition, string> = {
  eq: '==',
  neq: '!=',
  lt: '<',
  lte: '<=',
  gt: '>',
  gte: '>=',
};

export function isFilterComplete(f: Partial<Filter>): f is Filter {
  return f.name && f.condition && f.value != null;
}

type BaseType = "string" | "number" | "boolean";

function getConditions(t: BaseType): Condition[] {
  const base: Condition[] = ['eq', 'neq'];
  const ordinal: Condition[] = ['gt', 'gte', 'lt', 'lte'];
  return [...base, ...(t === 'number' ? ordinal : [])];
}

function castValue(v: string, target: BaseType) {
  if (target === 'boolean') return v === 'true';
  if (target === 'number') return Number(v);
  return v;
}

export function toColumnDescriptor(table: ColumnTable) {
  return table.columnNames().map((col): ColumnDescriptor => {
    const sample = table.params({ col }).filter((v, $) => v[$.col] != null).get(col, 0);
    const colType = typeof sample as BaseType;
    return {
      name: col,
      availableConditions: getConditions(colType),
      castValue: (v) => castValue(v, colType),
    }
  });
}

export function applyFilters(table: ColumnTable, options: { filters: Filter[] }) {
  for (const f of options.filters) {
    table = table.filter(`d.${f.name} ${conditionSymbol[f.condition]} ${JSON.stringify(f.value)}`);
  }
  return table;
}
