import {
  ensureExpectedIsNonNegativeInteger,
  matcherHint,
  MatcherHintOptions,
  printExpected,
  printReceived,
} from 'jest-matcher-utils';
import { ensureSinonStubOrSpy } from '../utils/jest-utils';
import { convertSinonCallToJestResult } from '../utils/sinon-utils';
import sinon from 'sinon';

const matcherName = 'sinonToReturnTimes';

export function sinonToReturnTimes(this: any, received: sinon.SinonSpy, expected: number) {
  const expectedArgument = 'expected';
  const options: MatcherHintOptions = {
    isNot: this.isNot,
    promise: this.promise,
  };
  ensureExpectedIsNonNegativeInteger(expected, matcherName, options);
  ensureSinonStubOrSpy(received, matcherName, expectedArgument, options);

  const receivedName = received.name;

  const results = received.getCalls().map((callInfo) => convertSinonCallToJestResult(callInfo));

  // Count return values that correspond only to calls that returned
  const count = results.reduce((n: number, result: any) => (result.type === 'return' ? n + 1 : n), 0);

  const pass = count === expected;

  const message = pass
    ? () =>
        matcherHint(matcherName, receivedName, expectedArgument, options) +
        `\n\n` +
        `Expected number of returns: not ${printExpected(expected)}` +
        (results.length !== count ? `\n\nReceived number of calls:       ${printReceived(results.length)}` : '')
    : () =>
        matcherHint(matcherName, receivedName, expectedArgument, options) +
        '\n\n' +
        `Expected number of returns: ${printExpected(expected)}\n` +
        `Received number of returns: ${printReceived(count)}` +
        (results.length !== count ? `\nReceived number of calls:   ${printReceived(results.length)}` : '');

  return { message, pass };
}
