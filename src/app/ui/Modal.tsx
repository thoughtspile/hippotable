import styles from "./Modal.module.css";
import { FaSolidXmark } from "solid-icons/fa";
import type { JSX } from "solid-js/jsx-runtime";

export function Modal(props: {
  children: JSX.Element;
  close: () => void;
  class?: string;
}) {
  let root: HTMLDivElement;
  const close = () => props.close();

  return (
    <div ref={root} class={styles.Modal}>
      <button type="button" onClick={close} class={styles.Modal__close}>
        <FaSolidXmark />
      </button>
      <div class={`${styles.ModalContent} ${props.class || ""}`}>
        {props.children}
      </div>
    </div>
  );
}
