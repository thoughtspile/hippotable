import {
  For,
  Show,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";
import "./Table.css";
import type ColumnTable from "arquero/dist/types/table/column-table";
import { FaSolidSortDown, FaSolidSortUp } from "solid-icons/fa";
import { createVirtualizer } from "@tanstack/solid-virtual";
import { AnalysisPanel } from "./Analysis";
import { Fab, FabContainer } from "./ui/Fab";
import type { Order } from "../data/order";
import { createPipeline } from "../data/pipeline";
import { Export } from "./Export";
import { ChartsPanel } from "./Charts";
import { ImportFab } from "./ImportFab";
import { GitHubLogo } from "./GitHubLogo";
import { GH_REPO } from "../constants";

export function Table(props: { table: ColumnTable }) {
  const [pipeline, setPipeline] = createSignal(createPipeline(props.table));

  return (
    <>
      <TableView
        table={pipeline().output}
        orderBy={(col) => setPipeline(pipeline().orderBy(col))}
        order={pipeline().order}
      />
      <Fab
        icon={<GitHubLogo />}
        onClick={() => window.open(GH_REPO, "_blank")}
      />
      <ImportFab />
      <Export table={pipeline().output} />
      <ChartsPanel table={pipeline().output} />
      <AnalysisPanel pipeline={pipeline()} update={setPipeline} />
      <FabContainer />
    </>
  );
}

const rowHeight = 19;

type TableViewProps = {
  table: ColumnTable;
  order: Order;
  orderBy: (c: string) => void;
};
function TableView(props: TableViewProps) {
  const [colWidths, setColWidths] = createSignal(new Map<string, number>());
  const cols = () => props.table.columnNames();

  let tableRef: HTMLTableElement;
  const numRows = createMemo(() => props.table.numRows());
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
            height: `${virtualizer.getVirtualItems()[0].start}px`,
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
        <For each={virtualizer.getVirtualItems().map((el) => el.index)}>
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
  order: Order;
  name: string;
  orderBy: (c: string) => void;
  width: number;
  ref: (e: HTMLElement) => void;
}
function HeaderCell(props: HeaderCellProps) {
  const dir = () => (props.order.col === props.name ? props.order.dir : null);
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
