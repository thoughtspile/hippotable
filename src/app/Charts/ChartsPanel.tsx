import { Index, Show, createSignal } from "solid-js";
import { FaSolidChartSimple } from "solid-icons/fa";
import type ColumnTable from "arquero/dist/types/table/column-table";
import { Fab } from "../ui/Fab";
import { Modal } from "../ui/Modal";
import { FilterLayer } from "./FilterLayer";
import { AggregationLayer } from "./AggregationLayer";
import {
  flowActions,
  type Flow,
  type FlowStep,
  type FlowStepComputed,
} from "../../data/pipeline";
import { FormButton, SegmentedControl } from "../ui/Form";
import styles from "./AnalysisPanel.module.css";
import type { Pipeline } from "../../data/pipeline";
import { ComputeLayer } from "./ComputeLayer";
import { nanoid } from "nanoid";

interface AnalysisPanelProps {
  table: ColumnTable;
}
interface ChartConfig {
  id: string;
}

export function ChartsPanel(props: AnalysisPanelProps) {
  const [visible, setVisible] = createSignal(false);
  const [charts, setCharts] = createSignal<ChartConfig[]>([{ id: nanoid() }]);
  function addChart() {
    setCharts([...charts(), { id: nanoid() }]);
  }

  return (
    <>
      <Show when={visible()}>
        <Modal close={() => setVisible(false)}></Modal>
      </Show>
      <Fab onClick={() => setVisible(true)} icon={<FaSolidChartSimple />} />
    </>
  );
}
