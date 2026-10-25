import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { recommend } from "./recommend.ts";
import { INVENTORY } from "./data.ts";

describe("recommend inventory invariant", () => {
  it("requires storeId", () => {
    assert.equal(recommend({ storeId: "" }).length, 0);
  });

  it("never returns qty 0 SKUs", () => {
    for (const storeId of ["S001", "S002", "S003"]) {
      const rows = recommend({ storeId });
      for (const row of rows) {
        assert.ok(row.inventory.qty > 0);
        assert.equal(row.inventory.storeId, storeId);
        const raw = INVENTORY.find(
          (i) => i.storeId === storeId && i.sku === row.wine.sku,
        );
        assert.ok(raw && raw.qty > 0);
      }
    }
  });

  it("excludes known OOS wine at S001 (W005)", () => {
    const rows = recommend({ storeId: "S001", themes: ["th_date"] });
    assert.ok(!rows.some((r) => r.wine.sku === "W005"));
  });

  it("filters promotion + gift_std at S001", () => {
    const rows = recommend({
      storeId: "S001",
      themes: ["th_promotion"],
      priceBands: ["price_gift_std"],
    });
    assert.ok(rows.length > 0);
    for (const row of rows) {
      assert.ok(row.wine.themes.includes("th_promotion"));
      assert.ok(row.inventory.price >= 60001 && row.inventory.price <= 100000);
      assert.ok(row.inventory.qty > 0);
    }
  });

  it("store stock differs: S002 has no in-stock W001", () => {
    const rows = recommend({ storeId: "S002" });
    assert.ok(!rows.some((r) => r.wine.sku === "W001"));
  });
});
