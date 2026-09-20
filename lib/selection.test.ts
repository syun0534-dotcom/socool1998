import assert from "node:assert/strict";
import { test } from "node:test";
import { selectAfterDelete } from "./selection.ts";

test("삭제한 위치의 다음 항목을 선택한다", () => {
  const items = [{ id: "a" }, { id: "b" }, { id: "c" }];
  assert.equal(selectAfterDelete(items, "a")?.id, "b");
  assert.equal(selectAfterDelete(items, "b")?.id, "c");
});

test("마지막 항목을 지우면 이전 항목을 선택한다", () => {
  const items = [{ id: "a" }, { id: "b" }, { id: "c" }];
  assert.equal(selectAfterDelete(items, "c")?.id, "b");
});

test("하나뿐인 항목을 지우면 null을 반환한다", () => {
  assert.equal(selectAfterDelete([{ id: "a" }], "a"), null);
});
