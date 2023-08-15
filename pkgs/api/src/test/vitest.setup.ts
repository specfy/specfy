import { expect } from 'vitest';

const dateReg = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;

expect.extend({
  toBeIsoDate: (received: any) => {
    if (!dateReg.test(received)) {
      return {
        message: () => `expected ${received} to be an ISO Date`,
        pass: false,
      };
    }
    return { pass: true, message: () => '' };
  },
});
