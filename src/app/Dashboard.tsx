import { Show, createMemo, createResource, createSignal } from 'solid-js';
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

const Sort = (props: { dir: 'asc' | 'desc', active: boolean }) => (
  <>
    {!props.active && <FaSolidSort />}
    {props.active && props.dir === 'desc' && <FaSolidSortUp />}
    {props.active && props.dir === 'asc' && <FaSolidSortDown />}
  </>
);

function Table({ table }: { table: ColumnTable }) {
  const [order, setOrder] = createSignal<{ col: string; dir: 'asc' | 'desc' }>({
    col: null,
    dir: 'asc',
  });
  
  const orderBy = (col: string) => {
    setOrder(o => ({ col, dir: col === o.col && o.dir === 'asc' ? 'desc' : 'asc' }));
  };
  
  const view = createMemo(() => {
    const { col, dir } = order();
    return col ? table.orderby(dir === 'desc' ? desc(col) : col) : table;
  });

  const cols = table.columnNames();

  let tbodyRef: HTMLTableSectionElement;
  const virtualizer = createVirtualizer({
    count: table.numRows() + 1,
    getScrollElement: () => tbodyRef,
    estimateSize: () => 49,
    overscan: 5,
  });
  const remainingSize = () => virtualizer.getTotalSize() - virtualizer.getVirtualItems().at(-1).end;

  return (
    <table class="table">
      <thead>
        {cols.map(col => 
          <th onClick={() => orderBy(col)}>
            {col}
            <Sort dir={order().dir} active={order().col === col} />
          </th>
        )}
      </thead>
      <tbody ref={tbodyRef}>
        <tr style={{ height: `${virtualizer.getVirtualItems()[0].start}px` }} />
        {virtualizer.getVirtualItems().map((item) => (
          <tr>{cols.map(col => <td>{view().get(col, item.index)}</td>)}</tr>
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
