import { matcherHint, MatcherHintOptions, printExpected, stringify } from 'jest-matcher-utils';
import {
  countReturns,
  ensureSinonStubOrSpy,
  IndexedResult,
  isEqualReturn,
  printNumberOfReturns,
  printReceivedResults,
} from '../utils/jest-utils';
import sinon from 'sinon';
import { convertSinonCallToJestResult } from '../utils/sinon-utils';

const matcherName = 'sinonLastReturnedWith';

export function sinonLastReturnedWith(this: any, received: sinon.SinonSpy, expected: unknown) {
  const expectedArgument = 'expected';
  const options: MatcherHintOptions = {
    isNot: this.isNot,
    promise: this.promise,
  };
  ensureSinonStubOrSpy(received, matcherName, expectedArgument, options);

  const receivedName = received.name;

  const callCount = received.callCount;
  const results = received.getCalls().map((callInfo) => convertSinonCallToJestResult(callInfo));
  const iLast = results.length - 1;

  const pass = iLast >= 0 && isEqualReturn(expected, results[iLast]);

  const message = pass
    ? () => {
        const indexedResults: Array<IndexedResult> = [];
        if (iLast > 0) {
          // Display preceding result as context.
          indexedResults.push([iLast - 1, results[iLast - 1]]);
        }
        indexedResults.push([iLast, results[iLast]]);

        return (
          matcherHint(matcherName, receivedName, expectedArgument, options) +
          '\n\n' +
          `Expected: not ${printExpected(expected)}\n` +
          (results.length === 1 && results[0].type === 'return' && stringify(results[0].value) === stringify(expected)
            ? ''
            : printReceivedResults('Received:     ', expected, indexedResults, results.length === 1, iLast)) +
          printNumberOfReturns(countReturns(results), callCount)
        );
      }
    : () => {
        const indexedResults: Array<IndexedResult> = [];
        if (iLast >= 0) {
          if (iLast > 0) {
            let i = iLast - 1;
            // Is there a preceding result that is equal to expected value?
            while (i >= 0 && !isEqualReturn(expected, results[i])) {
              i -= 1;
            }
            if (i < 0) {
              i = iLast - 1; // otherwise, preceding result
            }

            indexedResults.push([i, results[i]]);
          }

          indexedResults.push([iLast, results[iLast]]);
        }

        return (
          matcherHint(matcherName, receivedName, expectedArgument, options) +
          '\n\n' +
          `Expected: ${printExpected(expected)}\n` +
          printReceivedResults('Received: ', expected, indexedResults, results.length === 1, iLast) +
          printNumberOfReturns(countReturns(results), callCount)
        );
      };

  return { message, pass };
}
