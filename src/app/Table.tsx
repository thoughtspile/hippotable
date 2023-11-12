import { For, createMemo, createSignal, onCleanup, onMount } from 'solid-js';
import { desc } from 'arquero';
import './Table.css';
import type ColumnTable from 'arquero/dist/types/table/column-table';
import { FaSolidSort, FaSolidSortDown, FaSolidSortUp } from 'solid-icons/fa';
import { createVirtualizer } from '@tanstack/solid-virtual';

const Sort = (props: { dir: 'asc' | 'desc' | null }) => (
  <>
    {!props.dir && <FaSolidSort />}
    {props.dir === 'desc' && <FaSolidSortUp />}
    {props.dir === 'asc' && <FaSolidSortDown />}
  </>
);

export function Table({ table }: { table: ColumnTable }) {
  const [order, setOrder] = createSignal<{ col: string; dir: 'asc' | 'desc' }>({
    col: null,
    dir: 'asc',
  });

  const [colWidths, setColWidths] = createSignal(new Map<string, string>());
  
  const orderBy = (col: string) => {
    setOrder(o => ({ col, dir: col === o.col && o.dir === 'asc' ? 'desc' : 'asc' }));
  };
  
  const view = createMemo(() => {
    const { col, dir } = order();
    return col ? table.orderby(dir === 'desc' ? desc(col) : col) : table;
  });

  const cols = table.columnNames();

  let tableRef: HTMLTableElement;
  const virtualizer = createVirtualizer({
    count: table.numRows() + 1,
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
          <th onClick={() => orderBy(col)} style={{ width: colWidths().get(col) }}>
            {col}
            <Sort dir={order().col === col ? order().dir : null} />
          </th>
        )}
      </thead>
      <tbody>
        <tr style={{ height: `${virtualizer.getVirtualItems()[0].start}px` }}>
          <For each={cols}>{col => <td style={{ 'min-width': colWidths().get(col), "max-width": '1000px' }} />}</For>
        </tr>
        <For each={virtualizer.getVirtualItems().map((el) => el.index)}>{(index) => {
          // subscribe to view updates (order / filter)
          return <Row table={view} colWidths={colWidths()} cols={cols} index={index} />;
        }}</For>
        <tr style={{ height: `${remainingSize()}px` }}/>
      </tbody>
    </table>
  )
}

type RowProps = { cols: string[], table: any, colWidths: any, index: number };
function Row(props: RowProps) {
  return (
    <tr>
      <For each={props.cols}>{col => {
        const style = { 'min-width': props.colWidths.get(col), "max-width": '1000px' };
        return <td style={style}>{stringify(props.table().get(col, props.index))}</td>
      }}</For>
    </tr>
  );
}

const stringify = (val: unknown) => val == null ? null : String(val);
