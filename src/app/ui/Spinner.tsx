import type { JSX } from 'solid-js/jsx-runtime';
import styles from './Spinner.module.css';

export function Spinner(props: JSX.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} class={styles.Spinner}><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
  );
}