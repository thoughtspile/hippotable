import { For, Index, createMemo, createSignal } from 'solid-js';
import styles from './AggregationLayer.module.css';
import sortBy from 'just-sort-by';
import type { Aggregation } from '../../data/aggregation';
import { FormButton, SegmentedControl, Select } from '../ui/Form';

export interface AggregationLayerProps {
  aggregation: Aggregation;
  update: (a: Aggregation) => void;
  columns: string[];
}

export function AggregationLayer(props: AggregationLayerProps) {
  const columns = createMemo(() => sortBy(props.columns));
  const [staging, setStaging] = createSignal<Aggregation>(props.aggregation);
  function onSubmit(e: Event) {
    e.preventDefault();
    props.update(staging());
  }
  function setValue(old: string | null, next: string) {
    setStaging(s => ({ key: old ? s.key.map(e => e === old ? next : e) : s.key.concat(next) }));
  }
  
  return (
    <form onSubmit={onSubmit} class={styles.AggregationLayer}>
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
  )
}
