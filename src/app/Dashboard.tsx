import { Show, createResource, createSignal, onMount } from 'solid-js';
import { parseCsv } from '../data/data';
import { Table } from './Table';
import { Welcome } from './Welcome';

export function Dashboard() {
  const [file, setFile] = createSignal<string>(null);
  onMount(() => {
    const source = new URLSearchParams(location.search).get('source');
    source && setFile(source);
  });
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
