import { Show, createResource } from 'solid-js';
import { data as sample } from '../data/data';

export function Dashboard() {
  const [data] = createResource(() => sample);

  return <Show when={data()} fallback={() => <div class="loading loading-lg" />}>
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
  </Show>;
}
