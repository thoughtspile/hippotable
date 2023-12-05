import { Index, createMemo } from 'solid-js';
import styles from './AggregationLayer.module.css';
import sortBy from 'just-sort-by';
import type { Aggregation } from '../../data/aggregation';
import { SegmentedControl, Select } from '../ui/Form';
import type ColumnTable from 'arquero/dist/types/table/column-table';

export interface AggregationLayerProps {
  aggregation: Aggregation & { input: ColumnTable };
  update: (a: Aggregation) => void;
}

export function AggregationLayer(props: AggregationLayerProps) {
  const columns = createMemo(() => sortBy(props.aggregation.input.columnNames()));
  function setValue(oldValue: string | null, nextValue: string) {
    const { key } = props.aggregation;
    if (oldValue == null) {
      props.update({ key: [...key, nextValue] });
    } else {
      const nextKey = key
        .filter(e => e !== nextValue)
        .map(e => e === oldValue ? nextValue : e);
      props.update(({ key: nextKey }));
    }
  }
  function keyLevels() {
    let options = columns().map(c => ({ label: c, value: c }));
    const result: ({ value: string; options: typeof options })[] = [];
    for (const level of props.aggregation.key) {
      result.push({ value: level, options });
      options = options.filter(o => o.value !== level);
    }
    result.push({ value: null, options });
    return result;
  }
  
  return (
    <div class={styles.AggregationLayer}>
      <SegmentedControl>
        <Index each={keyLevels()}>{(level) => (
          <Select 
            value={level().value}
            onChange={e => setValue(level().value, e.target.value)}
            options={level().options}
          />
        )}</Index>
      </SegmentedControl>
    </div>
  )
}
