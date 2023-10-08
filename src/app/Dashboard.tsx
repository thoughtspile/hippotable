import { Show, createResource, createSignal } from 'solid-js';
import { parseCsv } from '../data/data';
import { FiUpload } from 'solid-icons/fi';
import './Dashboard.css';
import type ColumnTable from 'arquero/dist/types/table/column-table';

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

function Table({ table }: { table: ColumnTable }) {
  const cols = table.columnNames();
  const indices = [...table.indices()];
  return (
    <table class="table">
      <thead>
        {cols.map(col => <th>{col}</th>)}
      </thead>
      <tbody>
        {indices.map(i => (
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
