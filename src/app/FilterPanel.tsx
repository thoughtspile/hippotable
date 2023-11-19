import { For } from 'solid-js';
import styles from './FilterPanel.module.css';
import { type Condition, type Filter, type ColumnDescriptor, conditionSymbol } from './filter';

interface FilterPanelProps {
  filter: Filter[];
  columns: ColumnDescriptor[];
  update: (f: Filter[]) => void;
}

export function FilterPanel(props: FilterPanelProps) {
  return (
    <form onSubmit={e => e.preventDefault()} class={styles.FilterPanel}>
      <For each={props.filter}>{(filter, i) => 
        <FilterControl 
          columns={props.columns}
          filter={filter} 
          update={f => props.update(props.filter.map((base, ib) => i() === ib ? f : base))} 
        />
      }</For>
      <FilterControl 
        columns={props.columns}
        filter={{}}
        update={f => props.update(props.filter.concat([f]))} 
      />
      <button>Filter</button>
    </form>
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
    <label>
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
