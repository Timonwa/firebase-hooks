import { describe, expect, it } from "vitest";
import { formatFirebaseError, getFirebaseErrorCode } from "./index.js";

class FakeFirebaseError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

describe("formatFirebaseError / getFirebaseErrorCode", () => {
  it("an unmapped Firebase error gets Firebase's own words, cleaned", () => {
    const err = new FakeFirebaseError(
      "auth/some-new-code",
      "Firebase: The thing went sideways. (auth/some-new-code).",
    );
    expect(formatFirebaseError(err)).toBe("The thing went sideways.");
  });

  it("a message with no usable words falls back to the code itself", () => {
    const err = new FakeFirebaseError("auth/mystery", "Firebase: Error (auth/mystery).");
    expect(formatFirebaseError(err)).toBe("auth/mystery");
  });

  it("non-Firebase errors pass through raw — no envelope unwrapping", () => {
    expect(formatFirebaseError(new Error("my server said no"))).toBe("my server said no");
    expect(formatFirebaseError("plain string")).toBe("plain string");
    expect(formatFirebaseError({ weird: true }, { fallback: "Fallback." })).toBe(
      "Fallback.",
    );
  });

  it("getFirebaseErrorCode extracts codes and returns null otherwise", () => {
    expect(
      getFirebaseErrorCode(new FakeFirebaseError("storage/object-not-found", "x")),
    ).toBe("storage/object-not-found");
    expect(getFirebaseErrorCode(new Error("no code"))).toBe(null);
  });
});
