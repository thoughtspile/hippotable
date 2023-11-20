import styles from './Welcome.module.css';

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
    <section class={`${styles.Welcome} container grid-lg text-center`}>
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