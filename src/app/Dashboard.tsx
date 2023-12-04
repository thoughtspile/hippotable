import { Show, createResource, createSignal, onMount } from 'solid-js';
import { parseCsv } from '../data/data';
import { Table } from './Table';
import { Welcome } from './Welcome';
import { readFile, writeFile } from './fs';

export function Dashboard() {
  const [initializing, setInitializing] = createSignal(true);
  const [file, setFile] = createSignal<string>(null);
  onMount(async () => {
    console.log('mount');
    const source = new URLSearchParams(location.search).get('source');
    setInitializing(false);
    if (source?.startsWith('fs:')) {
      setFile(await readFile(source.replace('fs:', '')))
    } else if (source) {
      setFile(source);
    }
  });
  const [table] = createResource(file, file => file ? parseCsv(file) : null);
  function setSourceHref(src: string, href: string) {
    const selfUrl = new URL(location.href);
    selfUrl.searchParams.set('source', src);
    history.pushState({}, '', selfUrl);
    setFile(href);
  }
  async function onPickSource(file: File | string) {
    if (typeof file === 'string') return setSourceHref(file, file);
    const name = await writeFile(file);
    setSourceHref(`fs:${name}`, URL.createObjectURL(file));
  }

  return (
    <Show when={table()} fallback={<Welcome onSubmit={onPickSource} loading={initializing() || !!file()} />}>
      <Table table={table()} />
    </Show>
  );
}
