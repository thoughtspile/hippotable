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

  return (
    <Show when={table()} fallback={<Welcome onSubmit={persistSource} loading={initializing() || !table()} />}>
      <Table table={table()} />
    </Show>
  );
}
