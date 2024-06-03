import { FaSolidPlus } from "solid-icons/fa";
import { FabUpload } from "./ui/Fab";
import { persistSource } from "./fs";

export function ImportFab() {
  return (
    <FabUpload
      onUpload={persistSource}
      icon={<FaSolidPlus />}
      accept={".csv,.tsv,text/csv"}
    />
  );
}
