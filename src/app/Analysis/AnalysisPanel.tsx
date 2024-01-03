import { Index, Show, createSignal } from "solid-js";
import { FaSolidMagnifyingGlass, FaSolidXmark } from "solid-icons/fa";
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

interface AnalysisPanelProps {
  pipeline: Pipeline;
  update: (f: Pipeline) => void;
}

export function AnalysisPanel(props: AnalysisPanelProps) {
  const [visible, setVisible] = createSignal(false);
  const staging = () => props.pipeline.flow.filter((s) => s.mode !== "order");
  function addStep(mode: FlowStep["mode"]) {
    setStaging(flowActions.addStep(staging(), mode));
  }
  function setStaging(value: Flow) {
    props.update(props.pipeline.setFlow(value));
  }

  return (
    <Show
      when={visible()}
      fallback={
        <Fab
          primary
          onClick={() => setVisible(true)}
          icon={<FaSolidMagnifyingGlass />}
        />
      }
    >
      <Modal close={() => setVisible(false)}>
        <div class={styles.Form}>
          <Index each={staging().filter((s) => s.mode !== "order")}>
            {(s, i) => (
              <Layer
                step={s()}
                update={(s) =>
                  setStaging(flowActions.changeStep(staging(), i, s))
                }
                remove={() => setStaging(flowActions.removeStep(staging(), i))}
              />
            )}
          </Index>
          <AddLayer
            exclude={staging().at(-1)?.mode === "filter" ? "filter" : null}
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
