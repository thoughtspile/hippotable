import { Index, Show } from "solid-js";
import { FaSolidXmark } from "solid-icons/fa";
import { Modal } from "../ui/Modal";
import { FilterLayer } from "./FilterLayer";
import { AggregationLayer } from "./AggregationLayer";
import {
  flowActions,
  type Flow,
  type FlowStep,
  type FlowStepComputed,
  type FlowComputed,
} from "../../data/pipeline";
import { FormButton, SegmentedControl } from "../ui/Form";
import styles from "./AnalysisPanel.module.css";
import { ComputeLayer } from "./ComputeLayer";
import type ColumnTable from "arquero/dist/types/table/column-table";

interface AnalysisPanelProps {
  visible: boolean;
  onClose: () => void;
  flow: FlowComputed;
  update: (f: Flow) => void;
}

export function AnalysisPanel(props: AnalysisPanelProps) {
  function addStep(mode: FlowStep["mode"]) {
    props.update(flowActions.addStep(props.flow, mode));
  }

  return (
    <Show when={props.visible}>
      <Modal close={props.onClose} title="Data Analysis">
        <div class={styles.Form}>
          <Index each={props.flow.filter((s) => s.mode !== "order")}>
            {(s, i) => (
              <Layer
                step={s()}
                update={({ input, ...step }) =>
                  props.update(flowActions.changeStep(props.flow, i, step))
                }
                remove={() =>
                  props.update(flowActions.removeStep(props.flow, i))
                }
              />
            )}
          </Index>
          <AddLayer
            exclude={props.flow.at(-1)?.mode === "filter" ? "filter" : null}
            insert={addStep}
          />
        </div>
      </Modal>
    </Show>
  );
}

function Layer(props: {
  step: FlowStepComputed;
  update: (s: FlowStep) => void;
  remove: () => void;
}) {
  return (
    <div class={styles.Step}>
      {props.step.mode === "aggregate" && (
        <AggregationLayer
          aggregation={props.step}
          update={(a) => props.update({ mode: "aggregate", ...a })}
        />
      )}
      {props.step.mode === "filter" && (
        <FilterLayer
          filter={props.step}
          update={(filters) => props.update({ mode: "filter", filters })}
        />
      )}
      {props.step.mode === "compute" && (
        <ComputeLayer
          compute={props.step}
          update={(value) => props.update({ mode: "compute", ...value })}
        />
      )}
      {
        <button class={styles.RemoveLayer} onClick={props.remove}>
          <FaSolidXmark />
        </button>
      }
    </div>
  );
}

function AddLayer(props: {
  insert: (mode: FlowStep["mode"]) => void;
  exclude: FlowStep["mode"] | null;
}) {
  return (
    <div class={styles.Splitter}>
      <SegmentedControl class={styles.AddActions}>
        {props.exclude !== "aggregate" && (
          <FormButton onClick={() => props.insert("aggregate")}>
            Aggregation
          </FormButton>
        )}
        {props.exclude !== "filter" && (
          <FormButton onClick={() => props.insert("filter")}>Filter</FormButton>
        )}
        {/* TODO: restore with better UX */}
        {/* {props.exclude !== 'compute' && <FormButton onClick={() => props.insert('compute')}>Computed</FormButton>} */}
      </SegmentedControl>
    </div>
  );
}
