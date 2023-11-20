import { For, Index, Show, createMemo, createSignal } from 'solid-js';
import styles from './FilterPanel.module.css';
import sortBy from 'just-sort-by';
import { FaSolidFilter, FaSolidXmark } from 'solid-icons/fa';
import { type Condition, type Filter, type ColumnDescriptor, conditionSymbol, isFilterComplete } from './filter';
import { Fab } from './Fab';

interface FilterPanelProps {
  filter: Filter[];
  columns: ColumnDescriptor[];
  update: (f: Filter[]) => void;
}

export function FilterPanel(props: FilterPanelProps) {
  const columns = createMemo(() => sortBy(props.columns, c => c.name));
  const [visible, setVisible] = createSignal(false);
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
    <Show when={visible()} fallback={<Fab onClick={() => setVisible(true)} icon={<FaSolidFilter />} />}>
      <form onSubmit={onSubmit} class={styles.FilterPanel}>
        <button type="button" onClick={() => setVisible(false)} class={styles.FilterPanel__close}>
          <FaSolidXmark />
        </button>
        <Index each={filterList()}>{(filter, i) => 
          <FilterControl columns={columns()} filter={filter()} update={f => setFilter(i, f)} />
        }</Index>
        <button class={styles.FilterPanel__submit}>Filter</button>
      </form>
    </Show>
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
    <label class={styles.FilterControl}>
      <select 
        value={props.filter.name}
        onChange={e => props.update({ ...props.filter, name: e.target.value })}
      >
        <For each={props.columns}>{col => 
          <option value={col.name}>{col.name}</option>
        }</For>
      </select>
      <select 
        disabled={!activeColumn()} 
        value={props.filter.condition}
        onChange={e => props.update({ ...props.filter, condition: e.target.value as Condition })}
      >
        <For each={activeColumn()?.availableConditions}>{cond => 
          <option value={cond}>{conditionSymbol[cond]}</option>
        }</For>
      </select>
      <input 
        disabled={!activeColumn()}
        value={props.filter.value == null ? '' : String(props.filter.value)}
        onChange={e => props.update({ ...props.filter, value: activeColumn().castValue(e.target.value) })}
      />
    </label>
  );
}
