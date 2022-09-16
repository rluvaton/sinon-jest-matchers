import { matcherHint, MatcherHintOptions, printReceived, stringify } from 'jest-matcher-utils';
import {
  ensureSinonStubOrSpy,
  IndexedCall,
  isEqualCall,
  isExpand,
  printExpectedArgs,
  printExpectedReceivedCallsPositive,
  printReceivedCallsNegative,
} from '../utils/jest-utils';
import sinon from 'sinon';
import {getSpyName} from "../utils/sinon-utils";

const matcherName = 'sinonLastCalledWith';

export function sinonLastCalledWith(this: any, received: sinon.SinonSpy, ...expected: Array<unknown>) {
  const expectedArgument = '...expected';
  const options: MatcherHintOptions = {
    isNot: this.isNot,
    promise: this.promise,
  };
  ensureSinonStubOrSpy(received, matcherName, expectedArgument, options);

  const receivedName = getSpyName(received);

  const calls = received.getCalls().map((call) => call.args);
  const iLast = calls.length - 1;

  const pass = iLast >= 0 && isEqualCall(expected, calls[iLast]);

  const message = pass
    ? () => {
        const indexedCalls: Array<IndexedCall> = [];
        if (iLast > 0) {
          // Display preceding call as context.
          indexedCalls.push([iLast - 1, calls[iLast - 1]]);
        }
        indexedCalls.push([iLast, calls[iLast]]);

        return (
          matcherHint(matcherName, receivedName, expectedArgument, options) +
          '\n\n' +
          `Expected: not ${printExpectedArgs(expected)}\n` +
          (calls.length === 1 && stringify(calls[0]) === stringify(expected)
            ? ''
            : printReceivedCallsNegative(expected, indexedCalls, calls.length === 1, iLast)) +
          `\nNumber of calls: ${printReceived(calls.length)}`
        );
      }
    : () => {
        const indexedCalls: Array<IndexedCall> = [];
        if (iLast >= 0) {
          if (iLast > 0) {
            let i = iLast - 1;
            // Is there a preceding call that is equal to expected args?
            while (i >= 0 && !isEqualCall(expected, calls[i])) {
              i -= 1;
            }
            if (i < 0) {
              i = iLast - 1; // otherwise, preceding call
            }

            indexedCalls.push([i, calls[i]]);
          }

          indexedCalls.push([iLast, calls[iLast]]);
        }

        return (
          matcherHint(matcherName, receivedName, expectedArgument, options) +
          '\n\n' +
          printExpectedReceivedCallsPositive(expected, indexedCalls, isExpand(this.expand), calls.length === 1, iLast) +
          `\nNumber of calls: ${printReceived(calls.length)}`
        );
      };

  return { message, pass };
}
