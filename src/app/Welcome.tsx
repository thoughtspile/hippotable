import styles from './Welcome.module.css';
import { Spinner } from './ui/Spinner';
import { Show } from 'solid-js';
import { Uploader } from './Uploader';

type WelcomeProps = {
  loading: boolean;
  onSubmit: (f: File | string) => void; 
};
export function Welcome(props: WelcomeProps) {
  return (
    <section class={styles.Welcome} classList={{ [styles.loading]: props.loading }}>
      <Show when={!props.loading} fallback={<div class={styles.Spinner}><Spinner /></div>}>
        <Uploader />
      </Show>
    </section>
  )
}
