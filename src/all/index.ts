import * as matchers from '../matchers';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const jestExpect = global.expect;

if (jestExpect !== undefined) {
  jestExpect.extend(matchers);
} else {
  throw new Error(
    "Unable to find Jest's global expect. " +
      'Please check you have added sinon-jest-matchers correctly to your jest configuration. ' +
      'See https://github.com/rluvaton/sinon-jest-matchers#setup for help.',
  );
}
