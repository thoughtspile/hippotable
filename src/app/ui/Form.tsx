import { For, createEffect } from 'solid-js';
import styles from './Form.module.css';
import type { JSX } from "solid-js/jsx-runtime";

type SelectOption = { label: string; value: string };
export function Select(props: JSX.SelectHTMLAttributes<HTMLSelectElement> & { options: SelectOption[] }) {
  return (
    <select {...props} class={`${styles.FormControl} ${props.class || ''}`}>
      <option value=""></option>
      <For each={props.options}>{op =>
        <option value={op.value} selected={op.value === props.value}>{op.label}</option>
      }</For>
    </select>
  );
}

export function Input(props: JSX.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} class={`${styles.FormControl} ${props.class}`} />;
}

export function SegmentedControl(props: JSX.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} class={`${styles.SegmentedControl} ${props.class}`} />;
}

export function FormButton(props: JSX.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} class={`${styles.FormControl} ${styles.FormButton} ${props.class}`} />;
}
