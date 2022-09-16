import { ensureNoExpected, matcherHint, MatcherHintOptions, printExpected, printReceived } from 'jest-matcher-utils';
import { ensureSinonStubOrSpy, PRINT_LIMIT, printReceivedArgs } from '../utils/jest-utils';
import sinon from 'sinon';
import { getSpyName } from '../utils/sinon-utils';

const matcherName = 'sinonToBeCalled';

export function sinonToBeCalled(this: any, received: sinon.SinonSpy | sinon.SinonStub, expected: unknown) {
  const expectedArgument = '';
  const options: MatcherHintOptions = {
    isNot: this.isNot,
    promise: this.promise,
  };
  ensureNoExpected(expected, matcherName, options);
  ensureSinonStubOrSpy(received, matcherName, expectedArgument, options);

  const receivedName = getSpyName(received);
  const count = received.callCount;

  const calls = received.getCalls().map((call) => call.args);
  const pass = count > 0;
  const message = pass
    ? () =>
        matcherHint(matcherName, receivedName, expectedArgument, options) +
        '\n\n' +
        `Expected number of calls: ${printExpected(0)}\n` +
        `Received number of calls: ${printReceived(count)}\n\n` +
        calls
          .reduce((lines: string[], args: any, i: number) => {
            if (lines.length < PRINT_LIMIT) {
              lines.push(`${i + 1}: ${printReceivedArgs(args)}`);
            }

            return lines;
          }, [])
          .join('\n')
    : () =>
        matcherHint(matcherName, receivedName, expectedArgument, options) +
        '\n\n' +
        `Expected number of calls: >= ${printExpected(1)}\n` +
        `Received number of calls:    ${printReceived(count)}`;

  return { message, pass };
}
