import { describe, expect, it } from "vitest";
import { calculateInput, materialInput, recipeItemInput } from "./validation";

describe("materialInput", () => {
  it("accepts comma decimals and empty optional fields", () => {
    const r = materialInput.parse({ name: " Мука ", unit: "кг", packSize: "25,5", packPrice: "", stock: "" });
    expect(r).toEqual({ name: "Мука", unit: "кг", packSize: 25.5, packPrice: undefined, stock: 0 });
  });
  it("rejects zero pack size and garbage", () => {
    expect(materialInput.safeParse({ name: "a", unit: "кг", packSize: "0", packPrice: "", stock: "" }).success).toBe(false);
    expect(materialInput.safeParse({ name: "a", unit: "кг", packSize: "abc", packPrice: "", stock: "" }).success).toBe(false);
  });
  it("rejects control characters in names", () => {
    expect(materialInput.safeParse({ name: "a\u0000b", unit: "кг", packSize: "1", packPrice: "", stock: "" }).success).toBe(false);
  });
});

describe("recipeItemInput", () => {
  it("defaults waste to 0", () => {
    expect(recipeItemInput.parse({ materialId: "3", qtyPerUnit: "0.5", wastePct: "" })).toEqual({
      materialId: 3,
      qtyPerUnit: 0.5,
      wastePct: 0,
    });
  });
});

describe("calculateInput", () => {
  it("requires positive quantities", () => {
    expect(calculateInput.safeParse({ lines: [{ productId: 1, quantity: -1 }] }).success).toBe(false);
    expect(calculateInput.safeParse({ lines: [] }).success).toBe(false);
    expect(calculateInput.safeParse({ lines: [{ productId: 1, quantity: 10 }] }).success).toBe(true);
  });
});
