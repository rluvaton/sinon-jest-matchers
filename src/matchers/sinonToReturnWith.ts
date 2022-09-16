import { matcherHint, MatcherHintOptions, printExpected, stringify } from 'jest-matcher-utils';
import {
  countReturns,
  ensureSinonStubOrSpy,
  IndexedResult,
  isEqualReturn,
  PRINT_LIMIT,
  printNumberOfReturns,
  printReceivedResults,
} from '../utils/jest-utils';
import { convertSinonCallToJestResult, getSpyName } from '../utils/sinon-utils';
import sinon from 'sinon';

const matcherName = 'sinonToReturnWith';

export function sinonToReturnWith(this: any, received: sinon.SinonSpy, expected: unknown) {
  const expectedArgument = 'expected';
  const options: MatcherHintOptions = {
    isNot: this.isNot,
    promise: this.promise,
  };
  ensureSinonStubOrSpy(received, matcherName, expectedArgument, options);

  const receivedName = getSpyName(received);
  const calls = received.callCount;
  const results = received.getCalls().map((callInfo) => convertSinonCallToJestResult(callInfo));

  const pass = results.some((result: any) => isEqualReturn(expected, result));

  const message = pass
    ? () => {
        // Some examples of results that are equal to expected value.
        const indexedResults: Array<IndexedResult> = [];
        let i = 0;
        while (i < results.length && indexedResults.length < PRINT_LIMIT) {
          if (isEqualReturn(expected, results[i])) {
            indexedResults.push([i, results[i]]);
          }
          i += 1;
        }

        return (
          matcherHint(matcherName, receivedName, expectedArgument, options) +
          '\n\n' +
          `Expected: not ${printExpected(expected)}\n` +
          (results.length === 1 && results[0].type === 'return' && stringify(results[0].value) === stringify(expected)
            ? ''
            : printReceivedResults('Received:     ', expected, indexedResults, results.length === 1)) +
          printNumberOfReturns(countReturns(results), calls)
        );
      }
    : () => {
        // Some examples of results that are not equal to expected value.
        const indexedResults: Array<IndexedResult> = [];
        let i = 0;
        while (i < results.length && indexedResults.length < PRINT_LIMIT) {
          indexedResults.push([i, results[i]]);
          i += 1;
        }

        return (
          matcherHint(matcherName, receivedName, expectedArgument, options) +
          '\n\n' +
          `Expected: ${printExpected(expected)}\n` +
          printReceivedResults('Received: ', expected, indexedResults, results.length === 1) +
          printNumberOfReturns(countReturns(results), calls)
        );
      };

  return { message, pass };
}
