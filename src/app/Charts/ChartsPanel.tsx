import { For, Show, createEffect, createSignal } from "solid-js";
import { FaSolidChartSimple, FaSolidPlus } from "solid-icons/fa";
import type ColumnTable from "arquero/dist/types/table/column-table";
import { Fab } from "../ui/Fab";
import { Modal } from "../ui/Modal";
import { FormButton, SegmentedControl, Select } from "../ui/Form";
import Chart from "chart.js/auto";
import { nanoid } from "nanoid";

interface ChartsPanelProps {
  table: ColumnTable;
}

interface ChartConfig {
  id: string;
  x?: string;
  y?: string;
}

export function ChartsPanel(props: ChartsPanelProps) {
  const [visible, setVisible] = createSignal(false);
  const [charts, setCharts] = createSignal<ChartConfig[]>([{ id: nanoid() }]);
  function addChart() {
    setCharts([...charts(), { id: nanoid() }]);
  }
  function updateChart(config: ChartConfig) {
    setCharts(charts().map((c) => (c.id === config.id ? config : c)));
  }

  return (
    <>
      <Show when={visible()}>
        <Modal close={() => setVisible(false)}>
          <For each={charts()}>
            {(config) => (
              <ChartLayer
                config={config}
                table={props.table}
                onChange={updateChart}
              />
            )}
          </For>
          <FormButton onClick={addChart}>
            <FaSolidPlus />
          </FormButton>
        </Modal>
      </Show>
      <Fab onClick={() => setVisible(true)} icon={<FaSolidChartSimple />} />
    </>
  );
}

interface ChartProps {
  table: ColumnTable;
  config: ChartConfig;
  onChange: (c: ChartConfig) => void;
}

function ChartLayer(props: ChartProps) {
  const columnNames = () =>
    props.table.columnNames().map((c) => ({ value: c, label: c }));
  let canvas: HTMLCanvasElement;
  createEffect(() => {
    const { x, y } = props.config;
    if (!x || !y) return;
    const xData = Array.from(props.table.values(x) as any);
    const yData = Array.from(props.table.values(y) as any);
    new Chart(canvas, {
      type: "scatter",
      data: {
        labels: xData,
        datasets: [
          {
            data: yData,
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });
  });

  return (
    <div>
      <Select
        value={props.config.x}
        onChange={(e) => props.onChange({ ...props.config, x: e.target.value })}
        options={columnNames()}
      />
      <Select
        value={props.config.y}
        onChange={(e) => props.onChange({ ...props.config, y: e.target.value })}
        options={columnNames()}
      />
      <Show when={props.config.x && props.config.y}>
        <canvas ref={canvas} />
      </Show>
    </div>
  );
}
