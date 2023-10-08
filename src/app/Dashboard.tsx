import { Show, createMemo, createResource, createSignal } from 'solid-js';
import { parseCsv } from '../data/data';
import { desc } from 'arquero';
import { FiUpload } from 'solid-icons/fi';
import './Dashboard.css';
import type ColumnTable from 'arquero/dist/types/table/column-table';
import { FaSolidSort, FaSolidSortDown, FaSolidSortUp } from 'solid-icons/fa';

type WelcomeProps = { onUpload: (f: File) => void; loading: boolean };
function Welcome(props: WelcomeProps) {
  return (
    <section class="grid-hero container grid-lg text-center">
      <label class="btn btn-primary btn-lg" classList={{ loading: props.loading }}>
        Upload CSV <FiUpload />
        <input type="file" onInput={e => props.onUpload(e.currentTarget.files[0])} />
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
  const indices = () => [...view().indices()];
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
      <tbody>
        {indices().map(i => (
          <tr>{cols.map(col => <td>{table.get(col, i)}</td>)}</tr>
        ))}
      </tbody>
    </table>
  )
}

export function Dashboard() {
  const [file, setFile] = createSignal<File>(null);
  const [table] = createResource(file, file => file ? parseCsv(file) : null);

  return (
    <Show when={table()} fallback={<Welcome onUpload={setFile} loading={!!file()} />}>
      <Table table={table()} />
    </Show>
  );
}
