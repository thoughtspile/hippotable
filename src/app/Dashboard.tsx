import { Show, createResource, createSignal, onMount } from 'solid-js';
import { parseCsv } from '../data/data';
import './Dashboard.css';
import { Table } from './Table';

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
        Upload CSV
        <input type="file" onInput={e => props.onSubmit(e.currentTarget.files[0])} />
      </label>
    </section>
  )
}

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
