import { Show, createResource, createSignal } from 'solid-js';
import { parseCsv } from '../data/data';

export function Dashboard() {
  const [file, setFile] = createSignal<File>(null);
  const [data] = createResource(file, file => file ? parseCsv(file) : null);

  return (
    <>
      {!file() && 
        <input type="file" onInput={e => setFile(e.currentTarget.files[0])} />}
      {file() && (
        <Show when={data()} fallback={<div class="loading loading-lg" />}>
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
      )}
    </>
  );
}
