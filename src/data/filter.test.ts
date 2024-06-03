import { expect, it } from "vitest";
import { table } from "arquero";
import { applyFilters } from "./filter";

const testData = {
  nums: [-1, 0, 1],
  labels: ["minus-one", "zero", "plus-one"],
};
const testTable = table(testData);
const items = {
  neg: { nums: -1, labels: "minus-one" },
  zero: { nums: 0, labels: "zero" },
  pos: { nums: 1, labels: "plus-one" },
};

it.each([
  [{ name: "nums", condition: "eq", value: 0 }, [items.zero]],
  [{ name: "nums", condition: "neq", value: 0 }, [items.neg, items.pos]],
  [{ name: "nums", condition: "lt", value: 0 }, [items.neg]],
  [{ name: "nums", condition: "lte", value: 0 }, [items.neg, items.zero]],
  [{ name: "nums", condition: "gt", value: 0 }, [items.pos]],
  [{ name: "nums", condition: "gte", value: 0 }, [items.zero, items.pos]],
] as const)("filters by %s", (filter, res) => {
  const zero = applyFilters(testTable, { filters: [filter] });
  expect(zero.objects()).toEqual(res);
});
