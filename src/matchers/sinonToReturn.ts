import { ensureNoExpected, matcherHint, MatcherHintOptions, printExpected, printReceived } from 'jest-matcher-utils';
import { ensureSinonSpy, PRINT_LIMIT } from '../utils/jest-utils';
import { convertSinonCallToJestResult, getSpyName } from '../utils/sinon-utils';

const matcherName = 'sinonToReturn';

export function sinonToReturn(this: any, received: sinon.SinonSpy, expected: unknown) {
  const expectedArgument = '';
  const options: MatcherHintOptions = {
    isNot: this.isNot,
    promise: this.promise,
  };
  ensureNoExpected(expected, matcherName, options);
  ensureSinonSpy(received, matcherName, expectedArgument, options);

  const receivedName = getSpyName(received);

  const results = received.getCalls().map((callInfo) => convertSinonCallToJestResult(callInfo));

  // Count return values that correspond only to calls that returned
  const count = results.reduce((n: number, result: any) => (result.type === 'return' ? n + 1 : n), 0);

  const pass = count > 0;

  const message = pass
    ? () =>
        matcherHint(matcherName, receivedName, expectedArgument, options) +
        '\n\n' +
        `Expected number of returns: ${printExpected(0)}\n` +
        `Received number of returns: ${printReceived(count)}\n\n` +
        results
          .reduce((lines: Array<string>, result: any, i: number) => {
            if (result.type === 'return' && lines.length < PRINT_LIMIT) {
              lines.push(`${i + 1}: ${printReceived(result.value)}`);
            }

            return lines;
          }, [])
          .join('\n') +
        (results.length !== count ? `\n\nReceived number of calls:   ${printReceived(results.length)}` : '')
    : () =>
        matcherHint(matcherName, receivedName, expectedArgument, options) +
        '\n\n' +
        `Expected number of returns: >= ${printExpected(1)}\n` +
        `Received number of returns:    ${printReceived(count)}` +
        (results.length !== count ? `\nReceived number of calls:      ${printReceived(results.length)}` : '');

  return { message, pass };
}
