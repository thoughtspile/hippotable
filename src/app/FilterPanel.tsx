import { For, Index, Show, createEffect, createMemo, createSignal } from 'solid-js';
import styles from './FilterPanel.module.css';
import sortBy from 'just-sort-by';
import { type Condition, type Filter, type ColumnDescriptor, conditionSymbol, isFilterComplete } from './filter';

interface FilterPanelProps {
  filter: Filter[];
  columns: ColumnDescriptor[];
  update: (f: Filter[]) => void;
}

export function FilterPanel(props: FilterPanelProps) {
  const [visible, setVisible] = createSignal(false);
  const [staging, setStaging] = createSignal<Partial<Filter>[]>(props.filter);
  function onSubmit(e: Event) {
    e.preventDefault();
    props.update(staging().filter(isFilterComplete));
  }
  const columns = createMemo(() => sortBy(props.columns, c => c.name));
  return (
    <Show when={visible()} fallback={<button onClick={() => setVisible(true)} class={styles.FloatingButton}>f</button>}>
      <form onSubmit={onSubmit} class={styles.FilterPanel}>
        <button type="button" onClick={() => setVisible(false)} class={styles.FilterPanel__close}>x</button>
        <Index each={staging()}>{(filter, i) => 
          <FilterControl 
            columns={columns()}
            filter={filter()} 
            update={f => setStaging(s => s.map((base, ib) => i === ib ? f : base))} 
          />
        }</Index>
        <FilterControl 
          columns={columns()}
          filter={{}}
          update={f => setStaging(s => s.concat([f]))} 
        />
        <button>Filter</button>
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
  const activeColumn = props.columns.find(c => c.name === props.filter.name);
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
        disabled={!activeColumn} 
        value={props.filter.condition}
        onChange={e => props.update({ ...props.filter, condition: e.target.value as Condition })}
      >
        <For each={activeColumn?.availableConditions}>{cond => 
          <option value={cond}>{conditionSymbol[cond]}</option>
        }</For>
      </select>
      <input 
        disabled={!activeColumn}
        value={props.filter.value == null ? '' : String(props.filter.value)}
        onChange={e => props.update({ ...props.filter, value: activeColumn.castValue(e.target.value) })}
      />
    </label>
  );
}
