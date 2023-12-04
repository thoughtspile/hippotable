import styles from './Uploader.module.css';
import { FaSolidEye, FaSolidUpload } from "solid-icons/fa";
import { persistSource } from './fs';

export function Uploader() {
  return (
    <>
      <label class={`${styles.Button} ${styles.primary}`}>
        <FaSolidUpload />&nbsp;Upload CSV
        <input type="file" accept=".csv,.tsv,text/csv" onInput={e => persistSource(e.currentTarget.files[0])} />
      </label>
      <button class={styles.Button} onClick={() => persistSource('/hippostats/big.csv')}>
        <FaSolidEye />&nbsp;View demo
      </button>
    </>
  );
}