import { Index, createEffect, createMemo, createSignal } from 'solid-js';
import styles from './FilterLayer.module.css';
import sortBy from 'just-sort-by';
import { type Condition, type Filter, type ColumnDescriptor, conditionSymbol, isFilterComplete, toColumnDescriptor } from '../../data/filter';
import { FormButton, Input, SegmentedControl, Select } from '../ui/Form';
import type ColumnTable from 'arquero/dist/types/table/column-table';

export interface FilterLayerProps {
  filter: { filters: Filter[]; input: ColumnTable };
  update: (f: Filter[]) => void;
}

export function FilterLayer(props: FilterLayerProps) {
  const columns = createMemo(() => sortBy(toColumnDescriptor(props.filter.input), c => c.name));
  const [staging, setStaging] = createSignal<Partial<Filter>[]>(props.filter.filters);
  function filterList(): Partial<Filter>[] {
    const items = staging();
    return !items.length || items.every(isFilterComplete) ? [...items, { value: '' }] : items;
  }
  function setFilter(i: number, f: Partial<Filter>) {
    setStaging(s => s.length === i ? s.concat([f]) : s.map((base, ib) => i === ib ? f : base))
  }
  function onSubmit(e: Event) {
    e.preventDefault();
    props.update(staging().filter(isFilterComplete));
  }
  
  return (
    <form class={styles.FilterLayer} onSubmit={onSubmit}>
      <Index each={filterList()}>{(filter, i) => 
        <FilterControl columns={columns()} filter={filter()} update={f => setFilter(i, f)} />
      }</Index>
      <FormButton>Filter</FormButton>
    </form>
  )
}

interface FilterControlProps {
  filter: Partial<Filter>;
  update: (f: Partial<Filter>) => void;
  columns: ColumnDescriptor[];
}
function FilterControl(props: FilterControlProps) {
  const activeColumn = () => props.columns.find(c => c.name === props.filter.name);
  return (
    <SegmentedControl class={styles.FilterControl}>
      <Select 
        value={props.filter.name}
        onChange={e => props.update({ ...props.filter, name: e.target.value })}
        options={props.columns.map(col => ({ label: col.name, value: col.name }))}
      />
      <Select 
        disabled={!activeColumn()} 
        value={props.filter.condition}
        options={activeColumn()?.availableConditions?.map(c => ({ value: c, label: conditionSymbol[c] }))}
        onChange={e => props.update({ ...props.filter, condition: e.target.value as Condition })}
      />
      <Input 
        disabled={!activeColumn()}
        value={props.filter.value == null ? '' : String(props.filter.value)}
        onChange={e => props.update({ ...props.filter, value: activeColumn().castValue(e.target.value) })}
      />
    </SegmentedControl>
  );
}
