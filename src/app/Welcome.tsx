import { FaSolidEye, FaSolidUpload } from 'solid-icons/fa';
import styles from './Welcome.module.css';
import { Spinner } from './ui/Spinner';
import { Show } from 'solid-js';

type WelcomeProps = {
  loading: boolean;
  onSubmit: (f: File | string) => void; 
};
export function Welcome(props: WelcomeProps) {
  function onUrlSubmit(e: Event & { currentTarget: HTMLFormElement }) {
    e.preventDefault();
    props.onSubmit(new FormData(e.currentTarget).get('href') as string);
  }
  return (
    <section class={styles.Welcome} classList={{ [styles.loading]: props.loading }}>
      <Show when={!props.loading} fallback={<div class={styles.Spinner}><Spinner /></div>}>
        <label class={`${styles.Button} ${styles.primary}`}>
          <FaSolidUpload />&nbsp;Upload CSV
          <input type="file" accept=".csv,.tsv,text/csv" onInput={e => props.onSubmit(e.currentTarget.files[0])} />
        </label>
        <button class={styles.Button} onClick={() => props.onSubmit('/hippostats/big.csv')}>
          <FaSolidEye />&nbsp;View demo
        </button>
      </Show>
    </section>
  )
}