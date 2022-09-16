import { matcherHint, MatcherHintOptions, printReceived, stringify } from 'jest-matcher-utils';
import {
  ensureSinonStubOrSpy,
  IndexedCall,
  isEqualCall,
  isExpand,
  PRINT_LIMIT,
  printExpectedArgs,
  printExpectedReceivedCallsPositive,
  printReceivedCallsNegative,
} from '../utils/jest-utils';
import { getSpyName } from '../utils/sinon-utils';

const matcherName = 'sinonToBeCalledWith';

export function sinonToBeCalledWith(
  this: any,
  received: sinon.SinonSpy | sinon.SinonStub,
  ...expected: Array<unknown>
) {
  const expectedArgument = '...expected';
  const options: MatcherHintOptions = {
    isNot: this.isNot,
    promise: this.promise,
  };

  ensureSinonStubOrSpy(received, matcherName, expectedArgument, options);

  const receivedName = getSpyName(received);

  const calls = received.getCalls().map((call) => call.args);

  const pass = calls.some((call: any) => isEqualCall(expected, call));

  const message = pass
    ? () => {
        // Some examples of calls that are equal to expected value.
        const indexedCalls: Array<IndexedCall> = [];
        let i = 0;
        while (i < calls.length && indexedCalls.length < PRINT_LIMIT) {
          if (isEqualCall(expected, calls[i])) {
            indexedCalls.push([i, calls[i]]);
          }
          i += 1;
        }

        return (
          matcherHint(matcherName, receivedName, expectedArgument, options) +
          '\n\n' +
          `Expected: not ${printExpectedArgs(expected)}\n` +
          (calls.length === 1 && stringify(calls[0]) === stringify(expected)
            ? ''
            : printReceivedCallsNegative(expected, indexedCalls, calls.length === 1)) +
          `\nNumber of calls: ${printReceived(calls.length)}`
        );
      }
    : () => {
        // Some examples of calls that are not equal to expected value.
        const indexedCalls: Array<IndexedCall> = [];
        let i = 0;
        while (i < calls.length && indexedCalls.length < PRINT_LIMIT) {
          indexedCalls.push([i, calls[i]]);
          i += 1;
        }

        return (
          matcherHint(matcherName, receivedName, expectedArgument, options) +
          '\n\n' +
          printExpectedReceivedCallsPositive(expected, indexedCalls, isExpand(this.expand), calls.length === 1) +
          `\nNumber of calls: ${printReceived(calls.length)}`
        );
      };

  return { message, pass };
}
