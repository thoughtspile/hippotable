import type { JSX } from 'solid-js/jsx-runtime';
import styles from './Fab.module.css';
import { Portal } from 'solid-js/web';

const containerId = 'fab-container';

export function Fab(props: { onClick: () => void; icon: JSX.Element; primary?: boolean }) {
  return (
    <Portal mount={document.getElementById(containerId)}>
      <button 
        onClick={props.onClick} 
        classList={{ [styles.Fab]: true, [styles.primary]: props.primary }}
      >{props.icon}</button>
    </Portal>
  );
}

export function FabUpload(props: { onUpload: (f: File) => void; icon: JSX.Element; accept: string }) {
  return (
    <Portal mount={document.getElementById(containerId)}>
      <label class={styles.Fab}>
        {props.icon}
        <input type="file" accept={props.accept} onInput={e => props.onUpload(e.currentTarget.files[0])} />
      </label>
    </Portal>
  );
}

export function FabContainer() {
  return <div class={styles.FabContainer} id={containerId} />;
}
