import { describe, expect, it } from "vitest";
import { FakeFirebaseError } from "./_test-helpers.js";
import { getFirebaseErrorCode } from "./index.js";

describe("getFirebaseErrorCode", () => {
  it("extracts codes and returns null otherwise", () => {
    expect(
      getFirebaseErrorCode(new FakeFirebaseError("storage/object-not-found", "x")),
    ).toBe("storage/object-not-found");
    expect(getFirebaseErrorCode(new Error("no code"))).toBe(null);
  });

  it("ignores non-string codes and non-object values", () => {
    expect(getFirebaseErrorCode({ code: 42 })).toBe(null);
    expect(getFirebaseErrorCode("auth/invalid-credential")).toBe(null);
    expect(getFirebaseErrorCode(null)).toBe(null);
  });
});
