import { For, Index, createMemo, createSignal } from 'solid-js';
import styles from './AggregationLayer.module.css';
import sortBy from 'just-sort-by';
import type { Aggregation } from '../../data/aggregation';
import { FormButton, SegmentedControl, Select } from '../ui/Form';
import type ColumnTable from 'arquero/dist/types/table/column-table';

export interface AggregationLayerProps {
  aggregation: Aggregation & { input: ColumnTable };
  update: (a: Aggregation) => void;
}

export function AggregationLayer(props: AggregationLayerProps) {
  const columns = createMemo(() => sortBy(props.aggregation.input.columnNames()));
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
            options={columns().map(c => ({ label: c, value: c }))}
          />
        )}</Index>
      </SegmentedControl>
      <FormButton>Aggregate</FormButton>
    </form>
  )
}
