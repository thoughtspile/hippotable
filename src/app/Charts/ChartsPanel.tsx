import { For, Index, Show, createEffect, createSignal } from "solid-js";
import { FaSolidChartSimple, FaSolidPlus } from "solid-icons/fa";
import type ColumnTable from "arquero/dist/types/table/column-table";
import { Fab } from "../ui/Fab";
import { Modal } from "../ui/Modal";
import { FormButton, Select } from "../ui/Form";
import Chart, { type ChartType } from "chart.js/auto";
import {
  chartConfig,
  getAxisOptions,
  type ChartConfig,
  chartTypes,
  chartTypeAxes,
} from "./chartConfig";

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
  const ready = () => props.config.type && props.config.axes.every((a) => !!a);
  let canvas: HTMLCanvasElement;
  createEffect(() => {
    if (!ready()) return;
    const [labels, ...datasets] = props.config.axes.map((a) =>
      Array.from(props.table.values(a) as any),
    );
    new Chart(canvas, {
      type: props.config.type,
      data: {
        labels,
        datasets: datasets.map((data) => ({ data })),
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
  function setType(t: ChartType) {
    const axes = Array.from({ length: chartTypeAxes[t].length }).map(
      () => null,
    );
    props.onChange({ ...props.config, type: t, axes });
  }
  function setAxis(i: number, col: string) {
    const axes = [...props.config.axes];
    axes[i] = col;
    props.onChange({ ...props.config, axes });
  }

  return (
    <div>
      <Select
        value={props.config.type}
        onChange={(e) => setType(e.target.value as ChartType)}
        options={chartTypes.map((t) => ({ value: t, label: t }))}
      />
      <Index each={getAxisOptions(props.config.type, props.table)}>
        {(colNames, i) => (
          <Select
            value={props.config.axes[i]}
            onChange={(e) => setAxis(i, e.target.value)}
            options={colNames().map((c) => ({ value: c, label: c }))}
          />
        )}
      </Index>
      <Show when={ready()}>
        <canvas ref={canvas} />
      </Show>
    </div>
  );
}
