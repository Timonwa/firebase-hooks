import { describe, expect, it } from "vitest";
import { FakeFirebaseError } from "./_test-helpers.js";
import { formatFirebaseError } from "./index.js";

describe("formatFirebaseError", () => {
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

  it("a catalogue mapping wins over Firebase's own words", () => {
    const err = new FakeFirebaseError(
      "auth/user-not-found",
      "Firebase: There is no user record corresponding to this identifier. (auth/user-not-found).",
    );
    expect(
      formatFirebaseError(err, {
        messages: { "auth/user-not-found": "No account found for that email." },
      }),
    ).toBe("No account found for that email.");
  });

  it("a fallback option beats the bare code when the message has no words", () => {
    const err = new FakeFirebaseError("auth/mystery", "Firebase: Error (auth/mystery).");
    expect(formatFirebaseError(err, { fallback: "Please try again." })).toBe(
      "Please try again.",
    );
  });

  it("nothing usable at all lands on the default fallback copy", () => {
    expect(formatFirebaseError(null)).toBe("Something went wrong");
    expect(formatFirebaseError(undefined)).toBe("Something went wrong");
    expect(formatFirebaseError("")).toBe("Something went wrong");
  });
});
