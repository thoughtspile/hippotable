import { createSignal } from "solid-js";
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

type Modals = "analysis" | "charts";

export function Workspace(props: { table: ColumnTable }) {
  const [modalStack, setModalStack] = createSignal<Modals[]>([]);
  const openModal = (m: Modals) =>
    setModalStack(
      modalStack().includes(m) ? modalStack() : [...modalStack(), m],
    );
  const closeModal = (m: Modals) =>
    setModalStack(modalStack().filter((t) => t !== m));
  const [pipeline, setPipeline] = createSignal(createPipeline(props.table));

  return (
    <>
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
          onClick={() => openModal("charts")}
          icon={<FaSolidChartSimple />}
        />
        <Fab
          primary
          onClick={() => openModal("analysis")}
          icon={<FaSolidMagnifyingGlass />}
        />
      </FabContainer>
      <AnalysisPanel
        pipeline={pipeline()}
        update={setPipeline}
        onClose={() => closeModal("analysis")}
        visible={modalStack().includes("analysis")}
      />
      <ChartsPanel
        table={pipeline().output}
        visible={modalStack().includes("charts")}
        onClose={() => closeModal("charts")}
      />
    </>
  );
}
