import type { JSX } from "solid-js/jsx-runtime";
import styles from "./Fab.module.css";

export function Fab(props: {
  onClick: () => void;
  icon: JSX.Element;
  primary?: boolean;
}) {
  return (
    <button
      onClick={props.onClick}
      classList={{ [styles.Fab]: true, [styles.primary]: props.primary }}
    >
      {props.icon}
    </button>
  );
}

export function FabUpload(props: {
  onUpload: (f: File) => void;
  icon: JSX.Element;
  accept: string;
}) {
  return (
    <label class={styles.Fab}>
      {props.icon}
      <input
        type="file"
        accept={props.accept}
        onInput={(e) => props.onUpload(e.currentTarget.files[0])}
      />
    </label>
  );
}

export function FabContainer(props: { children: JSX.Element[] }) {
  return (
    <div class={styles.FabHolder}>
      <div class={styles.FabContainer} {...props} />
    </div>
  );
}
