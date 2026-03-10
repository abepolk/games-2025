import { expect, test } from "vitest";
import { selectRandomElement } from "./utils";

test("Selects random element from [1, 2, 3]", () => {
  const testArray = [1, 2, 3];
  expect(selectRandomElement(testArray)).toBeOneOf(testArray);
});

test("Throws an error when given an empty array", () => {
  expect(() => selectRandomElement([])).toThrowError("empty array");
});
