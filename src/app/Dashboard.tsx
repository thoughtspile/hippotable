import { Show, createResource, createSignal } from 'solid-js';
import { parseCsv } from '../data/data';
import { FiUpload } from 'solid-icons/fi';
import './Dashboard.css';

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

export function Dashboard() {
  const [file, setFile] = createSignal<File>(null);
  const [data] = createResource(file, file => file ? parseCsv(file) : null);

  return (
    <Show when={data()} fallback={<Welcome onUpload={setFile} loading={!!file()} />}>
      <table class="table">
        <thead>
          {data().cols.map(col => <th>{col.name}</th>)}
        </thead>
        <tbody>
          {data().data.map(row => (
            <tr>{row.map(val => <td>{val}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </Show>
  );
}
