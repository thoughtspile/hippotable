import styles from "./Uploader.module.css";
import { FaSolidEye, FaSolidUpload } from "solid-icons/fa";
import { persistSource } from "./fs";
import { GH_REPO, SAMPLE_URL } from "../constants";
import { GitHubLogo } from "./GitHubLogo";
import { Show, createSignal } from "solid-js";
import { Spinner } from "./ui/Spinner";

export function Uploader() {
  const [isPersisting, setPersisting] = createSignal(false);
  function onOpen(f: File) {
    setPersisting(true);
    persistSource(f);
  }
  return (
    <div class={styles.ButtonGroup}>
      <label class={`${styles.Button} ${styles.primary}`}>
        <Show
          when={!isPersisting()}
          fallback={<Spinner style={{ width: "1em", height: "1em" }} />}
        >
          <FaSolidUpload />
          &nbsp;Open CSV
          <input
            type="file"
            accept=".csv,.tsv,text/csv"
            onInput={(e) => onOpen(e.currentTarget.files[0])}
          />
        </Show>
      </label>
      <button class={styles.Button} onClick={() => persistSource(SAMPLE_URL)}>
        <FaSolidEye />
        &nbsp;View demo
      </button>
      <a href={GH_REPO} target="_blank" class={styles.Button}>
        <GitHubLogo />
        &nbsp;Star on GitHub
      </a>
    </div>
  );
}
