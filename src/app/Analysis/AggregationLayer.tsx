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
  function setValue(oldValue: string | null, nextValue: string) {
    const { key } = staging();
    if (oldValue == null) {
      setStaging({ key: [...key, nextValue] });
    } else {
      const nextKey = key
        .filter(e => e !== nextValue)
        .map(e => e === oldValue ? nextValue : e);
      setStaging(({ key: nextKey }));
    }
  }
  function keyLevels() {
    let options = columns().map(c => ({ label: c, value: c }));
    const result: ({ value: string; options: typeof options })[] = [];
    for (const level of staging().key) {
      result.push({ value: level, options });
      options = options.filter(o => o.value !== level);
    }
    result.push({ value: null, options });
    return result;
  }
  
  return (
    <form onSubmit={onSubmit} class={styles.AggregationLayer}>
      <SegmentedControl>
        <Index each={keyLevels()}>{(level) => (
          <Select 
            value={level().value}
            onChange={e => setValue(level().value, e.target.value)}
            options={level().options}
          />
        )}</Index>
      </SegmentedControl>
      <FormButton>Aggregate</FormButton>
    </form>
  )
}
