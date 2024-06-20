import { createMemo, onCleanup, onMount } from "solid-js";
import "./Table.css";
import type ColumnTable from "arquero/dist/types/table/column-table";
import { AnalysisPanel } from "./Analysis";
import { Fab, FabContainer } from "./ui/Fab";
import {
  computeFlow,
  getOrder,
  type Flow,
  flowActions,
  parseFlow,
} from "../data/pipeline";
import { Export } from "./Export";
import { ChartsPanel } from "./Charts";
import { ImportFab } from "./ImportFab";
import { GitHubLogo } from "./GitHubLogo";
import { GH_REPO } from "../constants";
import { Table } from "./Table";
import { FaSolidChartSimple, FaSolidFlask } from "solid-icons/fa";
import styles from "./Workspace.module.css";
import { createUrlPersistedSignal } from "./helpers/createUrlPersistedSignal";

type WorkspaceProps = { table: ColumnTable };

export function Workspace(props: WorkspaceProps) {
  const modals = createModalsStore();
  const flow = createFlowStore();
  const computedFlow = createMemo(() => computeFlow(props.table, flow.value()));

  return (
    <div class={styles.Workspace}>
      <Table
        table={computedFlow().output}
        orderBy={flow.orderBy}
        order={flow.order()}
      />
      <FabContainer>
        <Fab
          icon={<GitHubLogo />}
          onClick={() => window.open(GH_REPO, "_blank")}
        />
        <ImportFab />
        <Export table={computedFlow().output} />
        <Fab
          onClick={() => modals.toggle("charts")}
          icon={<FaSolidChartSimple />}
        />
        <Fab
          primary
          onClick={() => modals.toggle("analysis")}
          icon={<FaSolidFlask />}
        />
      </FabContainer>
      <AnalysisPanel
        flow={computedFlow().flow}
        update={flow.set}
        onClose={() => modals.close("analysis")}
        visible={modals.has("analysis")}
      />
      <ChartsPanel
        table={computedFlow().output}
        visible={modals.has("charts")}
        onClose={() => modals.close("charts")}
      />
    </div>
  );
}

type Modals = "analysis" | "charts";
function createModalsStore() {
  const [modalStack, setModalStack] = createUrlPersistedSignal<Modals[]>({
    param: "modals",
    parse: (sp) =>
      sp
        ? sp
            .split(",")
            .filter((m): m is Modals => m === "analysis" || m === "charts")
        : [],
    serialize: (modals) => (modals.length ? modals.join(",") : null),
  });
  const has = (m: Modals) => modalStack().includes(m);
  const close = (m: Modals) =>
    setModalStack(modalStack().filter((t) => t !== m));
  const toggle = (m: Modals) =>
    has(m) ? close(m) : setModalStack([...modalStack(), m]);
  const pop = () => {
    const modalCount = modalStack().length;
    modalCount && close(modalStack()[modalCount - 1]);
  };

  function onKey(e: KeyboardEvent) {
    e.code === "Escape" && pop();
  }
  onMount(() => {
    window.addEventListener("keydown", onKey);
  });
  onCleanup(() => {
    window.removeEventListener("keydown", onKey);
  });

  return { has, close, toggle };
}

function createFlowStore() {
  const [flow, setFlow] = createUrlPersistedSignal<Flow>({
    param: "flow",
    serialize: (flow) => {
      const safeFlow = parseFlow(flow);
      return flow.length ? btoa(JSON.stringify(safeFlow)) : null;
    },
    parse: (raw) => {
      try {
        return parseFlow(JSON.parse(atob(raw)));
      } catch {
        return [];
      }
    },
  });
  const order = () => getOrder(flow());
  const orderBy = (col: string) => setFlow(flowActions.orderBy(flow(), col));
  return { value: flow, set: setFlow, order, orderBy };
}
