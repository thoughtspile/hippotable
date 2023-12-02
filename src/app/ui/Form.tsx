import styles from './Form.module.css';
import type { JSX } from "solid-js/jsx-runtime";

export function Select(props: JSX.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} class={`${styles.FormControl} ${props.class || ''}`} />;
}

export function Input(props: JSX.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} class={`${styles.FormControl} ${props.class}`} />;
}

export function SegmentedControl(props: JSX.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} class={`${styles.SegmentedControl} ${props.class}`} />;
}

export function FormButton(props: JSX.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} class={`${styles.FormButton} ${props.class}`} />;
}
