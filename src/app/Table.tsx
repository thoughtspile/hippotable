import { For, Show, createEffect, createMemo, createSignal, onCleanup, onMount } from 'solid-js';
import './Table.css';
import type ColumnTable from 'arquero/dist/types/table/column-table';
import { FaSolidSortDown, FaSolidSortUp } from 'solid-icons/fa';
import { createVirtualizer } from '@tanstack/solid-virtual';
import { AnalysisPanel } from './Analysis';
import { FabContainer } from './ui/Fab';
import { applyFlow, type Flow } from '../data/flow';
import type { Order } from '../data/order';

export function Table(props: { table: ColumnTable }) {
  const [flow, setFlow] = createSignal<Flow>([]);
  const [order, setOrder] = createSignal<Order>({ col: null, dir: 'asc' });
  function orderBy(col: string) {
    setOrder(o => ({ col, dir: col === o.col && o.dir === 'asc' ? 'desc' : 'asc' }));
  }

  const view = createMemo(() => applyFlow(props.table, [...flow(), { mode: 'order', ...order() }]));

  return (
    <>
      <TableView table={view()} orderBy={orderBy} order={order()} />
      <AnalysisPanel flow={flow()} update={setFlow} table={props.table} />
      <FabContainer />
    </>
  );
}

const rowHeight = 19;
const totalPaddingX = 12;

type TableViewProps = {
  table: ColumnTable;
  order: Order;
  orderBy: (c: string) => void;
}
function TableView(props: TableViewProps) {
  const [colWidths, setColWidths] = createSignal(new Map<string, number>());
  const cols = () => props.table.columnNames();

  let tableRef: HTMLTableElement;
  const numRows = createMemo(() => props.table.numRows());
  createEffect(() => console.log(numRows()));
  const virtualizer = createVirtualizer({
    count: numRows(),
    getScrollElement: () => tableRef,
    estimateSize: () => rowHeight,
    overscan: 5,
  });
  function remainingSize() {
    const total = numRows();
    const lastItem = virtualizer.getVirtualItems().at(-1);
    const lastIndex = Math.min(lastItem.index, total);
    return (total - lastIndex) * rowHeight;
  }
  
  const resizeObserver = new ResizeObserver((entries) => {
    setColWidths(res => {
      const next = new Map(res.entries());
      for (const e of entries) {
        const { col } = (e.target as HTMLElement).dataset;
        next.set(col, Math.min(Math.max(next.get(col) ?? 0, Math.ceil(e.contentRect.width) + 12), 1000));
      }
      return next;
    });
  });
  onMount(() => {
    for (const td of tableRef.querySelectorAll('tr:first-child td, th')) {
      resizeObserver.observe(td);
    }
  });
  onCleanup(() => resizeObserver.disconnect());

  return (
    <table ref={tableRef}>
      <thead>
        <For each={cols()}>{col => 
          <HeaderCell orderBy={props.orderBy} order={props.order} width={colWidths().get(col)} name={col} />
        }</For>
      </thead>
      <tbody>
        <tr style={{ height: `${virtualizer.getVirtualItems()[0].start}px` }}>
          <For each={cols()}>{col => <td data-col={col} style={{ 'min-width': `${colWidths().get(col)}px` }} />}</For>
        </tr>
        <For each={virtualizer.getVirtualItems().map((el) => el.index)}>{(index) => (
          <Show when={index < numRows()}><Row table={props.table} cols={cols()} index={index} /></Show>
        )}</For>
        <tr style={{ height: `${remainingSize()}px` }}/>
      </tbody>
    </table>
  )
}

type RowProps = { 
  cols: string[];
  table: ColumnTable;
  index: number;
};
function Row(props: RowProps) {
  return (
    <tr>
      <For each={props.cols}>{col => <td>{stringify(props.table.get(col, props.index))}</td>}</For>
    </tr>
  );
}

function HeaderCell(props: { order: Order, name: string; orderBy: (c: string) => void; width: number }) {
  const dir = () => props.order.col === props.name ? props.order.dir : null;
  return (
    <th data-col={props.name} onClick={() => props.orderBy(props.name)} style={{ 'min-width': `${props.width}px` }}>
      {props.name}
      {dir() === 'desc' && <FaSolidSortUp />}
      {dir() === 'asc' && <FaSolidSortDown />}
    </th>
  );
}

const stringify = (val: unknown) => val == null ? null : String(val);
