import type { JSX } from 'solid-js/jsx-runtime';
import styles from './Fab.module.css';

export function Fab(props: { onClick: () => void; icon: JSX.Element }) {
  return <button onClick={props.onClick} class={styles.Fab}>{props.icon}</button>;
}
