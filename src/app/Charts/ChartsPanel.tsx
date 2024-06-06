import { For, Show, createSignal } from "solid-js";
import { FaSolidChartSimple, FaSolidPlus } from "solid-icons/fa";
import type ColumnTable from "arquero/dist/types/table/column-table";
import { Fab } from "../ui/Fab";
import { Modal } from "../ui/Modal";
import { FormButton } from "../ui/Form";
import { chartConfig, type ChartConfig } from "./chartConfig";
import { ChartItem } from "./ChartItem";
import styles from "./ChartsPanel.module.css";

interface ChartsPanelProps {
  table: ColumnTable;
}

export function ChartsPanel(props: ChartsPanelProps) {
  const [visible, setVisible] = createSignal(false);
  const [charts, setCharts] = createSignal<ChartConfig[]>([chartConfig()]);
  function addChart() {
    setCharts([...charts(), chartConfig()]);
  }
  function updateChart(config: ChartConfig) {
    setCharts(charts().map((c) => (c.id === config.id ? config : c)));
  }

  return (
    <>
      <Show when={visible()}>
        <Modal close={() => setVisible(false)} class={styles.ChartsPanel}>
          <For each={charts()}>
            {(config) => (
              <ChartItem
                config={config}
                table={props.table}
                onChange={updateChart}
              />
            )}
          </For>
          <FormButton onClick={addChart}>
            <FaSolidPlus /> Add chart
          </FormButton>
        </Modal>
      </Show>
      <Fab onClick={() => setVisible(true)} icon={<FaSolidChartSimple />} />
    </>
  );
}
