import styles from "./Modal.module.css";
import { FaSolidXmark } from "solid-icons/fa";
import type { JSX } from "solid-js/jsx-runtime";

export function Modal(props: { children: JSX.Element; close: () => void }) {
  return (
    <div class={styles.Modal}>
      <button type="button" onClick={props.close} class={styles.Modal__close}>
        <FaSolidXmark />
      </button>
      {props.children}
    </div>
  );
}
