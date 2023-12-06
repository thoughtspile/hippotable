import { Show, createResource, createSignal, onMount } from 'solid-js';
import { parseCsv } from '../data/data';
import { Table } from './Table';
import { Welcome } from './Welcome';
import { accessSource, persistSource } from './fs';

export function Dashboard() {
  const [initializing, setInitializing] = createSignal(true);
  const [file, setFile] = createSignal<string>(null);
  onMount(async () => {
    setInitializing(false);
    const source = await accessSource();
    source && setFile(source);
  });
  const [table] = createResource(file, file => file ? parseCsv(file) : null);
  const loading = () => initializing() || (file() && !table());

  return (
    <Show when={table()} fallback={<Welcome onSubmit={persistSource} loading={loading()} />}>
      <Table table={table()} />
    </Show>
  );
}
