import { renderHook } from "@testing-library/react";
import { applyActionCode } from "firebase/auth";
import { beforeEach, expect, it, vi } from "vitest";
import { makeAuth, withAuthProvider } from "../src/auth/_test-helpers.js";
import { useVerifyEmail } from "../src/auth/index.js";

vi.mock("firebase/auth");
beforeEach(() => vi.clearAllMocks());

it("debug", () => {
  const wrapper = withAuthProvider({ auth: makeAuth() });
  const { result } = renderHook(() => useVerifyEmail("oob-1"), { wrapper });
  console.log("status:", result.current.status, "error:", result.current.error);
  console.log("applyActionCode calls:", vi.mocked(applyActionCode).mock.calls);
  expect(true).toBe(true);
});
