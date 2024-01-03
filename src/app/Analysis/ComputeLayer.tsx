import { Index } from "solid-js";
import styles from "./FilterLayer.module.css";
import { Input, SegmentedControl } from "../ui/Form";
import type { Computed, ComputedColumn } from "../../data/computed";

export interface ComputeLayerProps {
  compute: Computed;
  update: (v: Computed) => void;
}

export function ComputeLayer(props: ComputeLayerProps) {
  function columnList(): ComputedColumn[] {
    const items = props.compute.columns;
    return !items.length || items.every((e) => e.name)
      ? [...items, { name: "", expr: "" }]
      : items;
  }
  function setColumn(i: number, f: ComputedColumn) {
    const { columns } = props.compute;
    props.update({
      columns:
        columns.length === i
          ? [...columns, f]
          : columns.map((base, ib) => (i === ib ? f : base)),
    });
  }
  return (
    <div class={styles.FilterLayer}>
      <Index each={columnList()}>
        {(col, i) => (
          <ColumnControl value={col()} update={(c) => setColumn(i, c)} />
        )}
      </Index>
    </div>
  );
}

interface FilterControlProps {
  value: ComputedColumn;
  update: (f: ComputedColumn) => void;
}
function ColumnControl(props: FilterControlProps) {
  return (
    <SegmentedControl class={styles.FilterControl}>
      <Input
        value={props.value.name}
        onChange={(e) => props.update({ ...props.value, name: e.target.value })}
      />
      <Input
        value={props.value.expr}
        onChange={(e) => props.update({ ...props.value, expr: e.target.value })}
        disabled={!props.value.name}
      />
    </SegmentedControl>
  );
}
