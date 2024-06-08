import { createSignal } from "solid-js";

export function createUrlPersistedSignal<T>(ops: {
  parse: (p: string | null) => T;
  serialize: (state: T) => string | null;
  param: string;
}) {
  const initialValue = ops.parse(
    new URL(location.href).searchParams.get(ops.param),
  );
  const [state, setState] = createSignal<T>(initialValue);
  function setStateWithPersist(value: T) {
    try {
      const url = new URL(location.href);
      const nextSearchParam = ops.serialize(value);
      if (nextSearchParam == null) url.searchParams.delete(ops.param);
      else url.searchParams.set(ops.param, nextSearchParam);
      history.replaceState({}, "", url);
    } catch {}
    setState(() => value);
  }
  return [state, setStateWithPersist] as const;
}
