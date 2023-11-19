import { For, createMemo, createSignal, onCleanup, onMount } from 'solid-js';
import { desc } from 'arquero';
import './Table.css';
import type ColumnTable from 'arquero/dist/types/table/column-table';
import { FaSolidSort, FaSolidSortDown, FaSolidSortUp } from 'solid-icons/fa';
import { createVirtualizer } from '@tanstack/solid-virtual';
import { FilterPanel } from './FilterPanel';
import { conditionSymbol, type ColumnDescriptor, type Condition, type Filter, isFilterComplete } from './filter';

type Order = { col: string; dir: 'asc' | 'desc' };
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

export function Table(props: { table: ColumnTable }) {
  const [order, setOrder] = createSignal<Order>({ col: null, dir: 'asc' });
  function orderBy(col: string) {
    setOrder(o => ({ col, dir: col === o.col && o.dir === 'asc' ? 'desc' : 'asc' }));
  }

  const [filter, setFilter] = createSignal<Filter[]>([]);

  const view = createMemo(() => {
    const { col, dir } = order();
    let { table } = props;
    for (const f of filter()) {
      if (!isFilterComplete(f)) continue;
      table = table.filter(`d.${f.name} ${conditionSymbol[f.condition]} ${JSON.stringify(f.value)}`);
    }
    return col ? table.orderby(dir === 'desc' ? desc(col) : col) : table;
  });

  const columnDescriptor = createMemo(() => {
    return props.table.columnNames().map((col): ColumnDescriptor => {
      const sample = props.table.params({ col }).filter((v, $) => v[$.col] != null).get(col, 0);
      const colType = typeof sample as BaseType;
      return {
        name: col,
        availableConditions: getConditions(colType),
        castValue: (v) => castValue(v, colType),
      }
    });
  });

  return (
    <>
      <TableView table={view()} orderBy={orderBy} order={order()} />
      <FilterPanel
        filter={filter()}
        update={setFilter}
        columns={columnDescriptor()}
      />
    </>
  );
}

type TableViewProps = {
  table: ColumnTable;
  order: Order;
  orderBy: (c: string) => void;
}
function TableView(props: TableViewProps) {
  const [colWidths, setColWidths] = createSignal(new Map<string, string>());
  const cols = props.table.columnNames();

  let tableRef: HTMLTableElement;
  const virtualizer = createVirtualizer({
    count: props.table.numRows() + 1,
    getScrollElement: () => tableRef,
    estimateSize: () => 19,
    overscan: 5,
  });
  const remainingSize = () => virtualizer.getTotalSize() - virtualizer.getVirtualItems().at(-1).end;
  
  const resizeObserver = new ResizeObserver(() => {
    const res = new Map()
    const headers = tableRef.querySelectorAll('th');
    tableRef.querySelectorAll('tr:nth-child(2) td').forEach((td, i) => {
      res.set(cols[i], `${Math.ceil(Math.min(Math.max(td.clientWidth, headers[i].clientWidth), 1000))}px`);
    });
    setColWidths(res);
  });
  onMount(() => {
    for (const td of tableRef.querySelectorAll('tr:first-child td')) {
      resizeObserver.observe(td);
    }
  });
  onCleanup(() => resizeObserver.disconnect());

  return (
    <table ref={tableRef}>
      <thead>
        {cols.map(col => 
          <th onClick={() => props.orderBy(col)} style={{ width: colWidths().get(col) }}>
            {col}
            <Sort dir={props.order.col === col ? props.order.dir : null} />
          </th>
        )}
      </thead>
      <tbody>
        <tr style={{ height: `${virtualizer.getVirtualItems()[0].start}px` }}>
          <For each={cols}>{col => <td style={{ 'min-width': colWidths().get(col), "max-width": '1000px' }} />}</For>
        </tr>
        <For each={virtualizer.getVirtualItems().map((el) => el.index)}>{(index) => {
          return <Row table={props.table} colWidths={colWidths()} cols={cols} index={index} />;
        }}</For>
        <tr style={{ height: `${remainingSize()}px` }}/>
      </tbody>
    </table>
  )
}

type RowProps = { 
  cols: string[];
  table: ColumnTable;
  colWidths: Map<string, string>;
  index: number;
};
function Row(props: RowProps) {
  return (
    <tr>
      <For each={props.cols}>{col => {
        const style = { 'min-width': props.colWidths.get(col), "max-width": '1000px' };
        return <td style={style}>{stringify(props.table.get(col, props.index))}</td>
      }}</For>
    </tr>
  );
}

function Sort(props: { dir: 'asc' | 'desc' | null }) {
  return (
    <>
      {!props.dir && <FaSolidSort />}
      {props.dir === 'desc' && <FaSolidSortUp />}
      {props.dir === 'asc' && <FaSolidSortDown />}
    </>
  );
}

const stringify = (val: unknown) => val == null ? null : String(val);
