import { For, Index, Show, createMemo, createSignal } from 'solid-js';
import styles from './AggregationPanel.module.css';
import sortBy from 'just-sort-by';
import { FaSolidMinimize } from 'solid-icons/fa';
import { Fab } from './Fab';
import { Modal } from './Modal';
import type { Aggregation } from './aggregation';
import { FormButton, SegmentedControl, Select } from './Form';

interface AggregationPanelProps {
  aggregation: Aggregation;
  update: (a: Aggregation) => void;
  columns: string[];
}

export function AggregationPanel(props: AggregationPanelProps) {
  const columns = createMemo(() => sortBy(props.columns));
  const [visible, setVisible] = createSignal(false);
  const [staging, setStaging] = createSignal<Aggregation>(props.aggregation);
  function onSubmit(e: Event) {
    e.preventDefault();
    props.update(staging());
  }
  function setValue(old: string | null, next: string) {
    setStaging(s => ({ key: old ? s.key.map(e => e === old ? next : e) : s.key.concat(next) }));
  }
  
  return (
    <Show when={visible()} fallback={<Fab onClick={() => setVisible(true)} icon={<FaSolidMinimize />} />}>
      <Modal close={() => setVisible(false)}>
        <form onSubmit={onSubmit} class={styles.AggregationPanel}>
          <SegmentedControl>
            <Index each={staging().key.concat(null)}>{(value) => (
              <Select 
                value={value()}
                onChange={e => setValue(value(), e.target.value)}
              >
                <For each={columns()}>{col => <option value={col}>{col}</option>}</For>
              </Select>
            )}</Index>
          </SegmentedControl>
          <FormButton>Aggregate</FormButton>
        </form>
      </Modal>
    </Show>
  )
}
