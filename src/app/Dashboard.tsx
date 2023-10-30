import { Show, createEffect, createMemo, createResource, createSignal } from 'solid-js';
import { parseCsv } from '../data/data';
import { desc } from 'arquero';
import { FiUpload } from 'solid-icons/fi';
import './Dashboard.css';
import type ColumnTable from 'arquero/dist/types/table/column-table';
import { FaSolidSort, FaSolidSortDown, FaSolidSortUp } from 'solid-icons/fa';
import { createVirtualizer } from '@tanstack/solid-virtual';

type WelcomeProps = {
  loading: boolean;
  onSubmit: (f: File | string) => void; 
};
function Welcome(props: WelcomeProps) {
  function onUrlSubmit(e: Event & { currentTarget: HTMLFormElement }) {
    e.preventDefault();
    props.onSubmit(new FormData(e.currentTarget).get('href') as string);
  }
  return (
    <section class="grid-hero container grid-lg text-center">
      <form class="input-group" onSubmit={onUrlSubmit}>
        <input class="form-input input-lg" name="href" />
        <button class="btn btn-lg input-group-btn">Go</button>
      </form>
      <label class="btn btn-primary btn-lg" classList={{ loading: props.loading }}>
        Upload CSV <FiUpload />
        <input type="file" onInput={e => props.onSubmit(e.currentTarget.files[0])} />
      </label>
    </section>
  )
}

const Sort = (props: { dir: 'asc' | 'desc' | null }) => (
  <>
    {!props.dir && <FaSolidSort />}
    {props.dir === 'desc' && <FaSolidSortUp />}
    {props.dir === 'asc' && <FaSolidSortDown />}
  </>
);

function Table({ table }: { table: ColumnTable }) {
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
  
  createEffect(() => {
    // trigger
    virtualizer.getVirtualItems()[0];
    const res = new Map()
    const headers = tableRef.querySelectorAll('th');
    tableRef.querySelectorAll('tr:nth-child(2) td').forEach((td, i) => {
      res.set(cols[i], `${Math.ceil(Math.min(Math.max(td.clientWidth, headers[i].clientWidth), 1000))}px`);
    });
    setColWidths(res);
  });

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
        <tr style={{ height: `${virtualizer.getVirtualItems()[0].start}px` }} />
        {virtualizer.getVirtualItems().map((item) => (
          <tr>{cols.map(col => {
            const style = { 'min-width': colWidths().get(col), "max-width": '1000px' };
            const val = view().get(col, item.index)
            return <td style={style}>{val == null ? null : String(val)}</td>
          })}</tr>
        ))}
        <tr style={{ height: `${remainingSize()}px` }}/>
      </tbody>
    </table>
  )
}

export function Dashboard() {
  const [file, setFile] = createSignal<string>(import.meta.env.SSR ? null : new URLSearchParams(location.search).get('source'));
  const [table] = createResource(file, file => file ? parseCsv(file) : null);
  function onPickSource(src: File | string) {
    if (src instanceof File) {
      return setFile(URL.createObjectURL(src));
    }
    const selfUrl = new URL(location.href);
    selfUrl.searchParams.set('source', src);
    history.pushState({}, '', selfUrl);
    setFile(src);
  }

  return (
    <Show when={table()} fallback={<Welcome onSubmit={onPickSource} loading={!!file()} />}>
      <Table table={table()} />
    </Show>
  );
}
