import { FaSolidDownload } from "solid-icons/fa";
import type ColumnTable from 'arquero/dist/types/table/column-table';
import { Fab } from './ui/Fab';

export function Export(props: { table: ColumnTable }) {
  function onExport() {
    const csv = props.table.toCSV();
    const dataUrl = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    var pom = document.createElement('a');
    pom.setAttribute('href', dataUrl);
    pom.setAttribute('download', 'hippotable-export.csv');

    pom.click();
  }
  return <Fab onClick={onExport} icon={<FaSolidDownload />} />;
}
