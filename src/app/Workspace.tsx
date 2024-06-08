import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
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
import { FaSolidChartSimple, FaSolidMagnifyingGlass } from "solid-icons/fa";
import styles from "./Workspace.module.css";
import { createUrlPersistedSignal } from "./helpers/createUrlPersistedSignal";

type Modals = "analysis" | "charts";

export function Workspace(props: { table: ColumnTable }) {
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
  const hasModal = (m: Modals) => modalStack().includes(m);
  const closeModal = (m: Modals) =>
    setModalStack(modalStack().filter((t) => t !== m));
  const toggleModal = (m: Modals) =>
    hasModal(m) ? closeModal(m) : setModalStack([...modalStack(), m]);
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
  const computedFlow = createMemo(() => computeFlow(props.table, flow()));
  const order = () => getOrder(flow());

  function onKey(e: KeyboardEvent) {
    const modalCount = modalStack().length;
    e.code === "Escape" &&
      modalCount &&
      closeModal(modalStack()[modalCount - 1]);
  }

  onMount(() => {
    window.addEventListener("keydown", onKey);
  });
  onCleanup(() => {
    window.removeEventListener("keydown", onKey);
  });

  return (
    <div class={styles.Workspace}>
      <Table
        table={computedFlow().output}
        orderBy={(col) => setFlow(flowActions.orderBy(flow(), col))}
        order={order()}
      />
      <FabContainer>
        <Fab
          icon={<GitHubLogo />}
          onClick={() => window.open(GH_REPO, "_blank")}
        />
        <ImportFab />
        <Export table={computedFlow().output} />
        <Fab
          onClick={() => toggleModal("charts")}
          icon={<FaSolidChartSimple />}
        />
        <Fab
          primary
          onClick={() => toggleModal("analysis")}
          icon={<FaSolidMagnifyingGlass />}
        />
      </FabContainer>
      <AnalysisPanel
        flow={computedFlow().flow}
        update={setFlow}
        onClose={() => closeModal("analysis")}
        visible={hasModal("analysis")}
      />
      <ChartsPanel
        table={computedFlow().output}
        visible={hasModal("charts")}
        onClose={() => closeModal("charts")}
      />
    </div>
  );
}
