import { Index, Show, createEffect } from "solid-js";
import type ColumnTable from "arquero/dist/types/table/column-table";
import { SegmentedControl, Select } from "../ui/Form";
import Chart, { type ChartType } from "chart.js/auto";
import {
  getAxisOptions,
  type ChartConfig,
  chartTypes,
  chartTypeAxes,
} from "./chartConfig";

interface ChartProps {
  table: ColumnTable;
  config: ChartConfig;
  onChange: (c: ChartConfig) => void;
}

export function ChartItem(props: ChartProps) {
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
      <SegmentedControl>
        <Select
          placeholder="Chart type"
          value={props.config.type}
          onChange={(e) => setType(e.target.value as ChartType)}
          options={chartTypes.map((t) => ({ value: t, label: t }))}
        />
        <Index each={getAxisOptions(props.config.type, props.table)}>
          {(colNames, i) => (
            <Select
              placeholder={`Axis ${i}`}
              value={props.config.axes[i]}
              onChange={(e) => setAxis(i, e.target.value)}
              options={colNames().map((c) => ({ value: c, label: c }))}
            />
          )}
        </Index>
      </SegmentedControl>
      <Show when={ready()}>
        <canvas ref={canvas} />
      </Show>
    </div>
  );
}
