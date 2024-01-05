import { Index, createMemo } from "solid-js";
import styles from "./AggregationLayer.module.css";
import sortBy from "just-sort-by";
import {
  NO_GROUPBY,
  type Aggregation,
  type AggregateCol,
  aggregateFunctions,
} from "../../data/aggregation";
import { Input, SegmentedControl, Select } from "../ui/Form";
import type ColumnTable from "arquero/dist/types/table/column-table";

export interface AggregationLayerProps {
  aggregation: Aggregation & { input: ColumnTable };
  update: (a: Aggregation) => void;
}

export function AggregationLayer(props: AggregationLayerProps) {
  const columns = createMemo(() =>
    sortBy(props.aggregation.input.columnNames()),
  );
  function setKey(oldKey: string | null, nextKey: string) {
    const { key, columns } = props.aggregation;
    if (!nextKey) {
      props.update({ key: key.filter((l) => l !== oldKey), columns });
    } else if (nextKey === NO_GROUPBY) {
      props.update({ key: [nextKey], columns });
    } else if (oldKey == null) {
      props.update({ key: [...key, nextKey], columns });
    } else {
      props.update({
        key: key
          .filter((e) => e !== nextKey)
          .map((e) => (e === oldKey ? nextKey : e)),
        columns,
      });
    }
  }

  function keyLevels() {
    let options = columns().map((c) => ({ label: c, value: c }));
    const result: { value: string; options: typeof options }[] = [];
    for (const level of props.aggregation.key) {
      result.push({ value: level, options });
      options =
        level === NO_GROUPBY ? [] : options.filter((o) => o.value !== level);
      if (options.length === 0) {
        break;
      }
    }
    options.length && result.push({ value: null, options });
    result[0].options.unshift({ label: "—", value: NO_GROUPBY });
    return result;
  }

  function columnList(): AggregateCol[] {
    const items = props.aggregation.columns;
    const isFilled = !items.length || items.every((e) => e.name);
    return isFilled ? [...items, { name: "", sourceCol: "" }] : items;
  }

  function setColumn(col: AggregateCol, i: number) {
    const nextColumns = [...props.aggregation.columns];
    nextColumns[i] = col;
    props.update({ ...props.aggregation, columns: nextColumns });
  }

  return (
    <div class={styles.AggregationLayer}>
      <label>
        Group by
        <SegmentedControl>
          <Index each={keyLevels()}>
            {(level, i) => (
              <Select
                value={level().value}
                onChange={(e) => setKey(level().value, e.target.value)}
                options={level().options}
              />
            )}
          </Index>
        </SegmentedControl>
      </label>
      <label>
        Aggregate columns
        <Index each={columnList()}>
          {(col, i) => (
            <AggregationColumnRow
              value={col()}
              update={(c) => setColumn(c, i)}
              inputCols={props.aggregation.input.columnNames()}
            />
          )}
        </Index>
      </label>
    </div>
  );
}

function AggregationColumnRow(props: {
  value: AggregateCol;
  update: (next: AggregateCol) => void;
  inputCols: string[];
}) {
  const patch = (p: Partial<AggregateCol>) =>
    props.update({ ...props.value, ...p });
  return (
    <SegmentedControl>
      <Input
        placeholder="Output col"
        value={props.value.name}
        onChange={(e) => patch({ name: e.target.value })}
      />
      <Select
        value={props.value.fn}
        options={aggregateFunctions.map((fn) => ({ label: fn, value: fn }))}
        onChange={(e) => patch({ fn: e.target.value as any })}
      />
      <Select
        value={props.value.sourceCol}
        options={props.inputCols.map((c) => ({ label: c, value: c }))}
        onChange={(e) => patch({ sourceCol: e.target.value })}
      />
    </SegmentedControl>
  );
}
