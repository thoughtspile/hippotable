import { For, Index, createMemo, createSignal } from 'solid-js';
import styles from './FilterLayer.module.css';
import sortBy from 'just-sort-by';
import { type Condition, type Filter, type ColumnDescriptor, conditionSymbol, isFilterComplete } from '../../data/filter';
import { FormButton, Input, SegmentedControl, Select } from '../ui/Form';

export interface FilterLayerProps {
  filter: Filter[];
  columns: ColumnDescriptor[];
  update: (f: Filter[]) => void;
}

export function FilterLayer(props: FilterLayerProps) {
  const columns = createMemo(() => sortBy(props.columns, c => c.name));
  const [staging, setStaging] = createSignal<Partial<Filter>[]>(props.filter);
  function filterList() {
    const items = staging();
    return !items.length || items.every(isFilterComplete) ? [...items, {}] : items;
  }
  function setFilter(i: number, f: Partial<Filter>) {
    setStaging(s => s.length === i ? s.concat([f]) : s.map((base, ib) => i === ib ? f : base))
  }
  function onSubmit(e: Event) {
    e.preventDefault();
    props.update(staging().filter(isFilterComplete));
  }
  
  return (
    <form onSubmit={onSubmit}>
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
      >
        <For each={props.columns}>{col => 
          <option value={col.name}>{col.name}</option>
        }</For>
      </Select>
      <Select 
        disabled={!activeColumn()} 
        value={props.filter.condition}
        onChange={e => props.update({ ...props.filter, condition: e.target.value as Condition })}
      >
        <For each={activeColumn()?.availableConditions}>{cond => 
          <option value={cond}>{conditionSymbol[cond]}</option>
        }</For>
      </Select>
      <Input 
        disabled={!activeColumn()}
        value={props.filter.value == null ? '' : String(props.filter.value)}
        onChange={e => props.update({ ...props.filter, value: activeColumn().castValue(e.target.value) })}
      />
    </SegmentedControl>
  );
}
