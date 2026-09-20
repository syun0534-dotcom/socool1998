import assert from "node:assert/strict";
import { test } from "node:test";
import { filterMemos } from "./search.ts";
import type { Memo } from "./types.ts";

function memo(partial: Partial<Memo> & Pick<Memo, "id" | "title" | "body">): Memo {
  return {
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...partial,
  };
}

test("빈 검색어는 전체 목록을 반환한다", () => {
  const memos = [
    memo({ id: "1", title: "장보기", body: "우유" }),
    memo({ id: "2", title: "회의", body: "일정" }),
  ];
  assert.deepEqual(filterMemos(memos, "   "), memos);
});

test("제목과 본문을 공백 무시·대소문자 무시로 검색한다", () => {
  const memos = [
    memo({ id: "1", title: "Hello World", body: "내용" }),
    memo({ id: "2", title: "장 보기", body: "우유 사기" }),
    memo({ id: "3", title: "회의", body: "없음" }),
  ];

  assert.deepEqual(
    filterMemos(memos, "helloworld").map((item) => item.id),
    ["1"],
  );
  assert.deepEqual(
    filterMemos(memos, "우유사").map((item) => item.id),
    ["2"],
  );
  assert.deepEqual(
    filterMemos(memos, "HELLO").map((item) => item.id),
    ["1"],
  );
});
