import {
  For,
  Show,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
} from "solid-js";
import "./Table.css";
import type ColumnTable from "arquero/dist/types/table/column-table";
import { FaSolidSortDown, FaSolidSortUp } from "solid-icons/fa";
import { createVirtualizer } from "@tanstack/solid-virtual";
import type { Order } from "../data/order";

const rowHeight = 19;

type TableProps = {
  table: ColumnTable;
  order?: Order | null;
  orderBy: (c: string) => void;
};
export function Table(props: TableProps) {
  const [colWidths, setColWidths] = createSignal(new Map<string, number>());
  const cols = () => props.table.columnNames();

  let tableRef: HTMLTableElement;
  const numRows = createMemo(() => props.table.numRows());
  const virtualizer = createMemo(() => {
    return createVirtualizer({
      count: numRows(),
      getScrollElement: () => tableRef,
      estimateSize: () => rowHeight,
      overscan: 5,
    });
  });
  function remainingSize() {
    const total = numRows();
    if (!total) return 0;
    const lastItem = virtualizer().getVirtualItems().at(-1);
    const lastIndex = Math.min(lastItem?.index ?? 0, total);
    return (total - lastIndex) * rowHeight;
  }

  const resizeObserver = new ResizeObserver((entries) => {
    setColWidths((res) => {
      const next = new Map(res.entries());
      for (const e of entries) {
        const { col } = (e.target as HTMLElement).dataset;
        next.set(
          col,
          Math.min(
            Math.max(next.get(col) ?? 0, Math.ceil(e.contentRect.width) + 12),
            1000,
          ),
        );
      }
      return next;
    });
  });
  const observeSize = (el: HTMLElement) => resizeObserver.observe(el);
  onCleanup(() => resizeObserver.disconnect());

  return (
    <table ref={tableRef}>
      <thead>
        <tr>
          <For each={cols()}>
            {(col) => (
              <HeaderCell
                ref={observeSize}
                orderBy={props.orderBy}
                order={props.order}
                width={colWidths().get(col)}
                name={col}
              />
            )}
          </For>
        </tr>
      </thead>
      <tbody>
        <tr
          style={{
            height: `${virtualizer().getVirtualItems()[0]?.start ?? 0}px`,
            border: "none",
          }}
        >
          <For each={cols()}>
            {(col) => (
              <td
                ref={observeSize}
                data-col={col}
                style={{ "min-width": `${colWidths().get(col)}px` }}
              />
            )}
          </For>
        </tr>
        <For
          each={virtualizer()
            .getVirtualItems()
            .map((el) => el.index)}
        >
          {(index) => (
            <Show when={index < numRows()}>
              <Row table={props.table} cols={cols()} index={index} />
            </Show>
          )}
        </For>
        <tr style={{ height: `${remainingSize()}px` }} />
      </tbody>
    </table>
  );
}

type RowProps = {
  cols: string[];
  table: ColumnTable;
  index: number;
};
function Row(props: RowProps) {
  return (
    <tr>
      <For each={props.cols}>
        {(col) => <td>{stringify(props.table.get(col, props.index))}</td>}
      </For>
    </tr>
  );
}

interface HeaderCellProps {
  order?: Order | null;
  name: string;
  orderBy: (c: string) => void;
  width: number;
  ref: (e: HTMLElement) => void;
}
function HeaderCell(props: HeaderCellProps) {
  const dir = () => (props.order?.col === props.name ? props.order?.dir : null);
  return (
    <th
      ref={props.ref}
      data-col={props.name}
      onClick={() => props.orderBy(props.name)}
      style={{ "min-width": `${props.width}px` }}
    >
      {props.name}
      {dir() === "desc" && <FaSolidSortUp />}
      {dir() === "asc" && <FaSolidSortDown />}
    </th>
  );
}

const stringify = (val: unknown) => {
  if (val == null) return null;
  if (val instanceof Date) return val.toLocaleString();
  return String(val);
};
