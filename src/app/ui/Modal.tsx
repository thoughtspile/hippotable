import styles from "./Modal.module.css";
import { FaSolidXmark } from "solid-icons/fa";
import { onCleanup, onMount } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";

export function Modal(props: { children: JSX.Element; close: () => void }) {
  let root: HTMLDivElement;
  const close = () => props.close();
  function onClickOutside(e: MouseEvent) {
    e.target instanceof Node && !root?.contains(e.target) && close();
  }
  function onKey(e: KeyboardEvent) {
    e.code === "Escape" && close();
  }

  onMount(() => {
    window.addEventListener("keydown", onKey);
    window.addEventListener("click", onClickOutside, { capture: true });
  });
  onCleanup(() => {
    window.removeEventListener("keydown", onKey);
    window.removeEventListener("click", onClickOutside, { capture: true });
  });

  return (
    <div ref={root} class={styles.Modal}>
      <button type="button" onClick={close} class={styles.Modal__close}>
        <FaSolidXmark />
      </button>
      {props.children}
    </div>
  );
}
