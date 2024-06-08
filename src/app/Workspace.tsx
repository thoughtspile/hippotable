import { createEffect, createSignal, onCleanup, onMount } from "solid-js";
import "./Table.css";
import type ColumnTable from "arquero/dist/types/table/column-table";
import { AnalysisPanel } from "./Analysis";
import { Fab, FabContainer } from "./ui/Fab";
import { createPipeline } from "../data/pipeline";
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
  const [pipeline, setPipeline] = createSignal(createPipeline(props.table));

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
        table={pipeline().output}
        orderBy={(col) => setPipeline(pipeline().orderBy(col))}
        order={pipeline().order}
      />
      <FabContainer>
        <Fab
          icon={<GitHubLogo />}
          onClick={() => window.open(GH_REPO, "_blank")}
        />
        <ImportFab />
        <Export table={pipeline().output} />
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
        pipeline={pipeline()}
        update={setPipeline}
        onClose={() => closeModal("analysis")}
        visible={hasModal("analysis")}
      />
      <ChartsPanel
        table={pipeline().output}
        visible={hasModal("charts")}
        onClose={() => closeModal("charts")}
      />
    </div>
  );
}
