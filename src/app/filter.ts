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
