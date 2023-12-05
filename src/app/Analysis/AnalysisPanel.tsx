import { Index, Show, createSignal } from 'solid-js';
import { FaSolidMagnifyingGlass, FaSolidPlus, FaSolidXmark } from 'solid-icons/fa';
import { Fab } from '../ui/Fab';
import { Modal } from '../ui/Modal';
import { FilterLayer } from './FilterLayer';
import { AggregationLayer } from './AggregationLayer';
import type { FlowStep, FlowStepComputed } from '../../data/pipeline';
import { FormButton, SegmentedControl } from '../ui/Form';
import styles from './AnalysisPanel.module.css';
import type { Pipeline } from '../../data/pipeline';

interface AnalysisPanelProps {
  pipeline: Pipeline;
  update: (f: Pipeline) => void;
}

export function AnalysisPanel(props: AnalysisPanelProps) {
  const [visible, setVisible] = createSignal(false);
  function insertLayerBefore(mode: FlowStep['mode']) {
    props.update(props.pipeline.addStep(mode));
  }
  
  return (
    <Show when={visible()} fallback={<Fab onClick={() => setVisible(true)} icon={<FaSolidMagnifyingGlass />} />}>
      <Modal close={() => setVisible(false)}>
        <div class={styles.Form}>
          <Index each={props.pipeline.flow.filter(s => s.mode !== 'order')}>{(s, i) =>
            <Layer 
              step={s()} 
              update={s => props.update(props.pipeline.changeStep(i, s))} 
              remove={() => props.update(props.pipeline.removeStep(i))}
            />
          }</Index>
          <AddLayer open={!props.pipeline.flow.length} insert={s => insertLayerBefore(s)} />
        </div>
      </Modal>
    </Show>
  )
}

function Layer(props: { step: FlowStepComputed, update: (s: FlowStep) => void; remove: () => void }) {
  return (
    <div class={styles.Step}>
      {props.step.mode === 'aggregate' && (
        <AggregationLayer 
          aggregation={props.step}
          update={a => props.update({ mode: 'aggregate', ...a })}
        />
      )}
      {props.step.mode === 'filter' && (
        <FilterLayer 
          filter={props.step}
          update={filters => props.update({ mode: 'filter', filters })}
        />
      )}
      {<button class={styles.RemoveLayer} onClick={props.remove}><FaSolidXmark /></button>}
    </div>
  );
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