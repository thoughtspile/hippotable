import { Index, Show, createEffect } from "solid-js";
import type ColumnTable from "arquero/dist/types/table/column-table";
import { SegmentedControl, Select } from "../ui/Form";
import Chart, { type ChartType, type ScaleChartOptions } from "chart.js/auto";
import {
  getAxisOptions,
  type ChartConfig,
  chartTypes,
  chartTypeAxes,
  isChartReady,
} from "./chartConfig";
import { getColumnType } from "../../data/columnConfig";

interface ChartProps {
  table: ColumnTable;
  config: ChartConfig;
  onChange: (c: ChartConfig) => void;
}

export function ChartItem(props: ChartProps) {
  function setType(t: ChartType) {
    const axes = Array.from({ length: chartTypeAxes[t]?.length ?? 0 }).map(
      (_, i) => props.config.axes[i] ?? null,
    );
    props.onChange({ ...props.config, type: t, axes });
  }
  function setAxis(i: number, col: string) {
    const axes = [...props.config.axes];
    axes[i] = col;
    props.onChange({ ...props.config, axes });
  }

  let canvas: HTMLCanvasElement;
  let chart: Chart<any> | undefined;

  createEffect(() => {
    chart && chart.destroy();

    if (!isChartReady(props.config)) return;
    const colNames = props.table.columnNames();
    for (const axis of props.config.axes) {
      if (!colNames.includes(axis)) return;
    }

    const numericLabel =
      getColumnType(props.table, props.config.axes[0]) === "number";
    const table = numericLabel
      ? props.table.orderby(props.config.axes[0])
      : props.table;
    const [labels, ...datasets] = props.config.axes.map((a) =>
      Array.from(table.columnArray(a)),
    );
    const scales: ScaleChartOptions<any>["scales"] = numericLabel
      ? {
          x: { type: "linear", min: labels[0], max: labels[labels.length - 1] },
        }
      : {};

    chart = new Chart(canvas, {
      type: props.config.type,
      data: {
        labels,
        datasets: datasets.map((data) => ({
          data,
          pointStyle: props.config.type === "line" ? false : "circle",
        })),
      },
      options: {
        animation: false,
        scales,
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
      <Show when={isChartReady(props.config)}>
        <canvas ref={canvas} />
      </Show>
    </div>
  );
}
