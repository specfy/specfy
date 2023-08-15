/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-namespace */
interface CustomMatchers<TR = unknown> {
  toBeIsoDate: () => TR;
}

declare namespace Vi {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
  interface ExpectStatic<T = any> extends CustomMatchers<T> {}
}
