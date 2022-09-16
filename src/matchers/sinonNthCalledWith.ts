import {
  matcherErrorMessage,
  matcherHint,
  MatcherHintOptions,
  printReceived,
  printWithType,
  stringify,
} from 'jest-matcher-utils';
import {
  ensureSinonStubOrSpy,
  IndexedCall,
  isEqualCall,
  isExpand,
  printExpectedArgs,
  printExpectedReceivedCallsPositive,
  printReceivedCallsNegative,
} from '../utils/jest-utils';
import { getSpyName } from '../utils/sinon-utils';

const matcherName = 'sinonNthCalledWith';

export function sinonNthCalledWith(this: any, received: sinon.SinonSpy, nth: number, ...expected: Array<unknown>) {
  const expectedArgument = 'n';
  const options: MatcherHintOptions = {
    expectedColor: (arg: string) => arg,
    isNot: this.isNot,
    promise: this.promise,
    secondArgument: '...expected',
  };
  ensureSinonStubOrSpy(received, matcherName, expectedArgument, options);

  if (!Number.isSafeInteger(nth) || nth < 1) {
    throw new Error(
      matcherErrorMessage(
        matcherHint(matcherName, undefined, expectedArgument, options),
        `${expectedArgument} must be a positive integer`,
        printWithType(expectedArgument, nth, stringify),
      ),
    );
  }

  const receivedName = getSpyName(received);

  const calls = received.args;
  const length = calls.length;
  const iNth = nth - 1;

  const pass = iNth < length && isEqualCall(expected, calls[iNth]);

  const message = pass
    ? () => {
        // Display preceding and following calls,
        // in case assertions fails because index is off by one.
        const indexedCalls: Array<IndexedCall> = [];
        if (iNth - 1 >= 0) {
          indexedCalls.push([iNth - 1, calls[iNth - 1]]);
        }
        indexedCalls.push([iNth, calls[iNth]]);
        if (iNth + 1 < length) {
          indexedCalls.push([iNth + 1, calls[iNth + 1]]);
        }

        return (
          matcherHint(matcherName, receivedName, expectedArgument, options) +
          '\n\n' +
          `n: ${nth}\n` +
          `Expected: not ${printExpectedArgs(expected)}\n` +
          (calls.length === 1 && stringify(calls[0]) === stringify(expected)
            ? ''
            : printReceivedCallsNegative(expected, indexedCalls, calls.length === 1, iNth)) +
          `\nNumber of calls: ${printReceived(calls.length)}`
        );
      }
    : () => {
        // Display preceding and following calls:
        // * nearest call that is equal to expected args
        // * otherwise, adjacent call
        // in case assertions fails because of index, especially off by one.
        const indexedCalls: Array<IndexedCall> = [];
        if (iNth < length) {
          if (iNth - 1 >= 0) {
            let i = iNth - 1;
            // Is there a preceding call that is equal to expected args?
            while (i >= 0 && !isEqualCall(expected, calls[i])) {
              i -= 1;
            }
            if (i < 0) {
              i = iNth - 1; // otherwise, adjacent call
            }

            indexedCalls.push([i, calls[i]]);
          }
          indexedCalls.push([iNth, calls[iNth]]);
          if (iNth + 1 < length) {
            let i = iNth + 1;
            // Is there a following call that is equal to expected args?
            while (i < length && !isEqualCall(expected, calls[i])) {
              i += 1;
            }
            if (i >= length) {
              i = iNth + 1; // otherwise, adjacent call
            }

            indexedCalls.push([i, calls[i]]);
          }
        } else if (length > 0) {
          // The number of received calls is fewer than the expected number.
          let i = length - 1;
          // Is there a call that is equal to expected args?
          while (i >= 0 && !isEqualCall(expected, calls[i])) {
            i -= 1;
          }
          if (i < 0) {
            i = length - 1; // otherwise, last call
          }

          indexedCalls.push([i, calls[i]]);
        }

        return (
          matcherHint(matcherName, receivedName, expectedArgument, options) +
          '\n\n' +
          `n: ${nth}\n` +
          printExpectedReceivedCallsPositive(expected, indexedCalls, isExpand(this.expand), calls.length === 1, iNth) +
          `\nNumber of calls: ${printReceived(calls.length)}`
        );
      };

  return { message, pass };
}
