import styles from './Uploader.module.css';
import { FaSolidEye, FaSolidUpload } from "solid-icons/fa";

export function Uploader(props: { onSubmit: (f: File | string) => void }) {
  return (
    <>
      <label class={`${styles.Button} ${styles.primary}`}>
        <FaSolidUpload />&nbsp;Upload CSV
        <input type="file" accept=".csv,.tsv,text/csv" onInput={e => props.onSubmit(e.currentTarget.files[0])} />
      </label>
      <button class={styles.Button} onClick={() => props.onSubmit('/hippostats/big.csv')}>
        <FaSolidEye />&nbsp;View demo
      </button>
    </>
  );
}