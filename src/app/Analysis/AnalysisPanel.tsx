import { Show, createSignal } from 'solid-js';
import { FaSolidMagnifyingGlass } from 'solid-icons/fa';
import { Fab } from '../ui/Fab';
import { Modal } from '../ui/Modal';
import { FilterLayer, type FilterLayerProps } from './FilterLayer';
import { AggregationLayer, type AggregationLayerProps } from './AggregationLayer';

interface AnalysisPanelProps {
  filter: FilterLayerProps; 
  aggregation: AggregationLayerProps;
}

export function AnalysisPanel(props: AnalysisPanelProps) {
  const [visible, setVisible] = createSignal(false);
  
  return (
    <Show when={visible()} fallback={<Fab onClick={() => setVisible(true)} icon={<FaSolidMagnifyingGlass />} />}>
      <Modal close={() => setVisible(false)}>
        <FilterLayer {...props.filter} />
        <AggregationLayer {...props.aggregation} />
      </Modal>
    </Show>
  )
}
