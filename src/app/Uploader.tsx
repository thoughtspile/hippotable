import styles from './Uploader.module.css';
import { FaSolidEye, FaSolidUpload } from "solid-icons/fa";
import { persistSource } from './fs';
import { GH_REPO, SAMPLE_URL } from '../constants';
import { GitHubLogo } from './GitHubLogo';

export function Uploader() {
  return (
    <>
      <label class={`${styles.Button} ${styles.primary}`}>
        <FaSolidUpload />&nbsp;Open CSV
        <input type="file" accept=".csv,.tsv,text/csv" onInput={e => persistSource(e.currentTarget.files[0])} />
      </label>
      <button class={styles.Button} onClick={() => persistSource(SAMPLE_URL)}>
        <FaSolidEye />&nbsp;View demo
      </button>
      <a href={GH_REPO} target="_blank" class={styles.Button}>
        <GitHubLogo />&nbsp;Star on GitHub
      </a>
    </>
  );
}