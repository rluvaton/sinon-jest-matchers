import {
  ensureExpectedIsNonNegativeInteger,
  matcherHint,
  MatcherHintOptions,
  printExpected,
  printReceived,
} from 'jest-matcher-utils';
import { ensureSinonStubOrSpy } from '../utils/jest-utils';
import { getSpyName } from '../utils/sinon-utils';

const matcherName = 'sinonToBeCalledTimes';

export function sinonToBeCalledTimes(this: any, received: sinon.SinonSpy | sinon.SinonStub, expected: number) {
  const expectedArgument = 'expected';
  const options: MatcherHintOptions = {
    isNot: this.isNot,
    promise: this.promise,
  };
  ensureExpectedIsNonNegativeInteger(expected, matcherName, options);
  ensureSinonStubOrSpy(received, matcherName, expectedArgument, options);

  const receivedName = getSpyName(received);
  const count = received.callCount;

  const pass = count === expected;

  const message = pass
    ? () =>
        matcherHint(matcherName, receivedName, expectedArgument, options) +
        `\n\n` +
        `Expected number of calls: not ${printExpected(expected)}`
    : () =>
        matcherHint(matcherName, receivedName, expectedArgument, options) +
        '\n\n' +
        `Expected number of calls: ${printExpected(expected)}\n` +
        `Received number of calls: ${printReceived(count)}`;

  return { message, pass };
}
