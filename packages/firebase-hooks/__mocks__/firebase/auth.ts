// Manual mock for "firebase/auth" — every test file activates it with a bare
// vi.mock("firebase/auth"). What's under test is each hook's orchestration
// (ordering, callbacks, error paths), never Firebase itself.
import { vi } from "vitest";

export const applyActionCode = vi.fn(async () => {});
export const confirmPasswordReset = vi.fn(async () => {});
export const createUserWithEmailAndPassword = vi.fn();
export const deleteUser = vi.fn(async () => {});
export const EmailAuthProvider = {
  credential: vi.fn((email: string, password: string) => ({ email, password })),
};
export const getRedirectResult = vi.fn(async () => null);
export const isSignInWithEmailLink = vi.fn(() => true);
export const linkWithCredential = vi.fn();
export const linkWithPopup = vi.fn();
export const onIdTokenChanged = vi.fn(() => () => {});
export const reauthenticateWithCredential = vi.fn(async () => {});
export const reauthenticateWithPopup = vi.fn(async () => {});
export const RecaptchaVerifier = vi.fn(function RecaptchaVerifier(this: { clear: () => void }) {
  this.clear = vi.fn();
});
export const sendEmailVerification = vi.fn(async () => {});
export const sendPasswordResetEmail = vi.fn(async () => {});
export const sendSignInLinkToEmail = vi.fn(async () => {});
export const signInAnonymously = vi.fn();
export const signInWithCustomToken = vi.fn();
export const signInWithEmailAndPassword = vi.fn();
export const signInWithEmailLink = vi.fn();
export const signInWithPhoneNumber = vi.fn();
export const signInWithPopup = vi.fn();
export const signInWithRedirect = vi.fn(async () => {});
export const signOut = vi.fn(async () => {});
export const unlink = vi.fn();
export const updatePassword = vi.fn(async () => {});
export const updateProfile = vi.fn(async () => {});
export const verifyBeforeUpdateEmail = vi.fn(async () => {});
export const verifyPasswordResetCode = vi.fn(async () => "user@example.com");
