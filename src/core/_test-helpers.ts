// Test-only fake — core must not depend on the auth helpers.
export class FakeFirebaseError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}
