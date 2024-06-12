import styles from "./Welcome.module.css";
import { Spinner } from "./ui/Spinner";
import { Show } from "solid-js";
import { Uploader } from "./Uploader";
import { Logo } from "./Logo";

type WelcomeProps = {
  loading: boolean;
  error?: string;
  onSubmit: (f: File | string) => void;
};
export function Welcome(props: WelcomeProps) {
  const resetPipeline = () => {
    const url = new URL(location.href);
    url.searchParams.delete("flow");
    url.searchParams.delete("charts");
    location.assign(url);
  };
  return (
    <section
      class={styles.Welcome}
      classList={{ [styles.loading]: props.loading }}
    >
      <Show
        when={!props.loading}
        fallback={
          <div class={styles.Spinner}>
            <Spinner />
          </div>
        }
      >
        <Logo />
        {props.error && (
          <p class={styles.Welcome__error}>Could not evaluate: {props.error}</p>
        )}
        <Uploader hideGithub onReset={resetPipeline} />
      </Show>
    </section>
  );
}
