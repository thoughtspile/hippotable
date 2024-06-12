import { For, Show } from "solid-js";
import { FaSolidPlus } from "solid-icons/fa";
import type ColumnTable from "arquero/dist/types/table/column-table";
import { Modal } from "../ui/Modal";
import { FormButton } from "../ui/Form";
import {
  chartConfig,
  isChartReady,
  type ChartConfig,
  parseChartConfig,
} from "./chartConfig";
import { ChartItem } from "./ChartItem";
import styles from "./ChartsPanel.module.css";
import { createUrlPersistedSignal } from "../helpers/createUrlPersistedSignal";
import { array } from "banditypes";

interface ChartsPanelProps {
  table: ColumnTable;
  visible: boolean;
  onClose: () => void;
}

export function ChartsPanel(props: ChartsPanelProps) {
  const [charts, setCharts] = createUrlPersistedSignal<ChartConfig[]>({
    param: "charts",
    serialize: (c) => {
      const readyCharts = c.filter(isChartReady).map(({ id, ...c }) => c);
      return readyCharts.length ? btoa(JSON.stringify(readyCharts)) : null;
    },
    parse: (str) => {
      try {
        return array(parseChartConfig)(JSON.parse(atob(str)));
      } catch {
        return [chartConfig()];
      }
    },
  });
  function addChart() {
    setCharts([...charts(), chartConfig()]);
  }
  function updateChart(config: ChartConfig) {
    setCharts(charts().map((c) => (c.id === config.id ? config : c)));
  }

  return (
    <Show when={props.visible}>
      <Modal close={props.onClose} class={styles.ChartsPanel} title="Charts">
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
  );
}
