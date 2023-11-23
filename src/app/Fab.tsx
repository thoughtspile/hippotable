import type { JSX } from 'solid-js/jsx-runtime';
import styles from './Fab.module.css';
import { Portal } from 'solid-js/web';

const containerId = 'fab-container';

export function Fab(props: { onClick: () => void; icon: JSX.Element }) {
  return (
    <Portal mount={document.getElementById(containerId)}>
      <button onClick={props.onClick} class={styles.Fab}>{props.icon}</button>
    </Portal>
  );
}

export function FabContainer() {
  return <div class={styles.FabContainer} id={containerId} />;
}
