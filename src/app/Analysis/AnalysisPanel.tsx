import { For, Show, createMemo, createSignal } from 'solid-js';
import { FaSolidMagnifyingGlass, FaSolidPlus } from 'solid-icons/fa';
import { Fab } from '../ui/Fab';
import { Modal } from '../ui/Modal';
import { FilterLayer } from './FilterLayer';
import { AggregationLayer } from './AggregationLayer';
import type { Flow, FlowStep } from '../../data/flow';
import type ColumnTable from 'arquero/dist/types/table/column-table';
import { toColumnDescriptor } from '../../data/filter';
import { FormButton, SegmentedControl } from '../ui/Form';
import styles from './AnalysisPanel.module.css';

interface AnalysisPanelProps {
  flow: Flow;
  update: (f: Flow) => void;
  table: ColumnTable;
}

export function AnalysisPanel(props: AnalysisPanelProps) {
  const [visible, setVisible] = createSignal(false);
  const columnNames = createMemo(() => props.table.columnNames());
  const columnDescriptor = createMemo(() => toColumnDescriptor(props.table));
  function updateStep(id: number, nextStep: FlowStep) {
    props.update(props.flow.map((s, i) => i === id ? nextStep : s));
  }
  function insertLayerBefore(mode: FlowStep['mode'], id: number | null) {
    const nextFlow = [...props.flow];
    if (mode === 'order') return;
    const step: FlowStep = mode === 'aggregate' ? { mode, key: [] } : { mode, filters: [] };
    nextFlow.splice(id ?? nextFlow.length, 0, step);
    props.update(nextFlow);
  }
  
  return (
    <Show when={visible()} fallback={<Fab onClick={() => setVisible(true)} icon={<FaSolidMagnifyingGlass />} />}>
      <Modal close={() => setVisible(false)}>
        <div class={styles.Form}>
          <For each={props.flow}>{(s, i) =>
            <>
              {s.mode === 'aggregate' && (
                <AggregationLayer 
                  aggregation={s} 
                  update={a => updateStep(i(), { mode: 'aggregate', ...a })}
                  columns={columnNames()}
                />
              )}
              {s.mode === 'filter' && (
                <FilterLayer 
                  filter={s.filters} 
                  update={filters => updateStep(i(), { mode: 'filter', filters })}
                  columns={columnDescriptor()}
                />
              )}
            </>
          }</For>
          <AddLayer open={!props.flow.length} insert={s => insertLayerBefore(s, null)} />
        </div>
      </Modal>
    </Show>
  )
}

function AddLayer(props: { open?: boolean; insert: (mode: FlowStep['mode']) => void }) {
  const [isOpen, setOpen] = createSignal(props.open ?? false);
  function selectType(mode: FlowStep['mode']) {
    props.insert(mode);
    setOpen(false);
  }
  return (
    <div class={styles.Splitter}>
      <Show when={isOpen()} fallback={<button class={styles.AddLayerButton} onClick={() => setOpen(true)}><FaSolidPlus /></button>}>
        <SegmentedControl>
          <FormButton onClick={() => selectType('aggregate')}>Aggregation</FormButton>
          <FormButton onClick={() => selectType('filter')}>Filter</FormButton>
        </SegmentedControl>
      </Show>
    </div>
  );
}