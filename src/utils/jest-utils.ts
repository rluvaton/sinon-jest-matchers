import {
  diff,
  DIM_COLOR,
  EXPECTED_COLOR,
  matcherErrorMessage,
  matcherHint,
  MatcherHintOptions,
  printExpected,
  printReceived,
  printWithType,
  RECEIVED_COLOR,
  stringify,
} from 'jest-matcher-utils';
import { equals, iterableEquality } from '@jest/expect-utils';
import { isSpy } from './sinon-utils';
import { getType, isPrimitive } from 'jest-get-type';

// The optional property of matcher context is true if undefined.
export const isExpand = (expand?: boolean): boolean => expand !== false;

export const PRINT_LIMIT = 3;

export const NO_ARGUMENTS = 'called with 0 arguments';

export const printExpectedArgs = (expected: Array<unknown>): string =>
  expected.length === 0 ? NO_ARGUMENTS : expected.map((arg) => printExpected(arg)).join(', ');

export const printReceivedArgs = (received: Array<unknown>, expected?: Array<unknown>): string =>
  received.length === 0
    ? NO_ARGUMENTS
    : received
        .map((arg, i) =>
          Array.isArray(expected) && i < expected.length && isEqualValue(expected[i], arg)
            ? printCommon(arg)
            : printReceived(arg),
        )
        .join(', ');

export const printCommon = (val: unknown) => DIM_COLOR(stringify(val));

export const isEqualValue = (expected: unknown, received: unknown): boolean =>
  equals(expected, received, [iterableEquality]);

export const isEqualCall = (expected: Array<unknown>, received: Array<unknown>): boolean =>
  isEqualValue(expected, received);

export const isEqualReturn = (expected: unknown, result: any): boolean =>
  result.type === 'return' && isEqualValue(expected, result.value);

export const countReturns = (results: Array<any>): number =>
  results.reduce((n: number, result: any) => (result.type === 'return' ? n + 1 : n), 0);

export const printNumberOfReturns = (countReturns: number, countCalls: number): string =>
  `\nNumber of returns: ${printReceived(countReturns)}` +
  (countCalls !== countReturns ? `\nNumber of calls:   ${printReceived(countCalls)}` : '');

type PrintLabel = (string: string, isExpectedCall: boolean) => string;

// Given a label, return a function which given a string,
// right-aligns it preceding the colon in the label.
export const getRightAlignedPrinter = (label: string): PrintLabel => {
  // Assume that the label contains a colon.
  const index = label.indexOf(':');
  const suffix = label.slice(index);

  return (string: string, isExpectedCall: boolean) =>
    (isExpectedCall
      ? '->' + ' '.repeat(Math.max(0, index - 2 - string.length))
      : ' '.repeat(Math.max(index - string.length))) +
    string +
    suffix;
};

export type IndexedCall = [number, Array<unknown>];

export const printReceivedCallsNegative = (
  expected: Array<unknown>,
  indexedCalls: Array<IndexedCall>,
  isOnlyCall: boolean,
  iExpectedCall?: number,
) => {
  if (indexedCalls.length === 0) {
    return '';
  }

  const label = 'Received:     ';
  if (isOnlyCall) {
    return label + printReceivedArgs(indexedCalls[0], expected) + '\n';
  }

  const printAligned = getRightAlignedPrinter(label);

  return (
    'Received\n' +
    indexedCalls.reduce(
      (printed: string, [i, args]: IndexedCall) =>
        printed + printAligned(String(i + 1), i === iExpectedCall) + printReceivedArgs(args, expected) + '\n',
      '',
    )
  );
};

export const printExpectedReceivedCallsPositive = (
  expected: Array<unknown>,
  indexedCalls: Array<IndexedCall>,
  expand: boolean,
  isOnlyCall: boolean,
  iExpectedCall?: number,
) => {
  const expectedLine = `Expected: ${printExpectedArgs(expected)}\n`;
  if (indexedCalls.length === 0) {
    return expectedLine;
  }

  const label = 'Received: ';
  if (isOnlyCall && (iExpectedCall === 0 || iExpectedCall === undefined)) {
    const received = indexedCalls[0][1];

    if (isLineDiffableCall(expected, received)) {
      // Display diff without indentation.
      const lines = [EXPECTED_COLOR('- Expected'), RECEIVED_COLOR('+ Received'), ''];

      const length = Math.max(expected.length, received.length);
      for (let i = 0; i < length; i += 1) {
        if (i < expected.length && i < received.length) {
          if (isEqualValue(expected[i], received[i])) {
            lines.push(`  ${printCommon(received[i])},`);
            continue;
          }

          if (isLineDiffableArg(expected[i], received[i])) {
            const difference = diff(expected[i], received[i], { expand });
            if (
              typeof difference === 'string' &&
              difference.includes('- Expected') &&
              difference.includes('+ Received')
            ) {
              // Omit annotation in case multiple args have diff.
              lines.push(difference.split('\n').slice(3).join('\n') + ',');
              continue;
            }
          }
        }

        if (i < expected.length) {
          lines.push(EXPECTED_COLOR('- ' + stringify(expected[i])) + ',');
        }
        if (i < received.length) {
          lines.push(RECEIVED_COLOR('+ ' + stringify(received[i])) + ',');
        }
      }

      return lines.join('\n') + '\n';
    }

    return expectedLine + label + printReceivedArgs(received, expected) + '\n';
  }

  const printAligned = getRightAlignedPrinter(label);

  return (
    expectedLine +
    'Received\n' +
    indexedCalls.reduce((printed: string, [i, received]: IndexedCall) => {
      const aligned = printAligned(String(i + 1), i === iExpectedCall);
      return (
        printed +
        ((i === iExpectedCall || iExpectedCall === undefined) && isLineDiffableCall(expected, received)
          ? aligned.replace(': ', '\n') + printDiffCall(expected, received, expand)
          : aligned + printReceivedArgs(received, expected)) +
        '\n'
      );
    }, '')
  );
};

const indentation = 'Received'.replace(/\w/g, ' ');

export const printDiffCall = (expected: Array<unknown>, received: Array<unknown>, expand: boolean) =>
  received
    .map((arg, i) => {
      if (i < expected.length) {
        if (isEqualValue(expected[i], arg)) {
          return indentation + '  ' + printCommon(arg) + ',';
        }

        if (isLineDiffableArg(expected[i], arg)) {
          const difference = diff(expected[i], arg, { expand });

          if (
            typeof difference === 'string' &&
            difference.includes('- Expected') &&
            difference.includes('+ Received')
          ) {
            // Display diff with indentation.
            // Omit annotation in case multiple args have diff.
            return (
              difference
                .split('\n')
                .slice(3)
                .map((line) => indentation + line)
                .join('\n') + ','
            );
          }
        }
      }

      // Display + only if received arg has no corresponding expected arg.
      return (
        indentation + (i < expected.length ? '  ' + printReceived(arg) : RECEIVED_COLOR('+ ' + stringify(arg))) + ','
      );
    })
    .join('\n');

export const isLineDiffableCall = (expected: Array<unknown>, received: Array<unknown>): boolean =>
  expected.some((arg, i) => i < received.length && isLineDiffableArg(arg, received[i]));

// Almost redundant with function in jest-matcher-utils,
// except no line diff for any strings.
export const isLineDiffableArg = (expected: unknown, received: unknown): boolean => {
  const expectedType = getType(expected);
  const receivedType = getType(received);

  if (expectedType !== receivedType) {
    return false;
  }

  if (isPrimitive(expected)) {
    return false;
  }

  if (expectedType === 'date' || expectedType === 'function' || expectedType === 'regexp') {
    return false;
  }

  if (expected instanceof Error && received instanceof Error) {
    return false;
  }

  if (expectedType === 'object' && typeof (expected as any).asymmetricMatch === 'function') {
    return false;
  }

  if (receivedType === 'object' && typeof (received as any).asymmetricMatch === 'function') {
    return false;
  }

  return true;
};

export const printResult = (result: any, expected: unknown) =>
  result.type === 'throw'
    ? 'function call threw an error'
    : result.type === 'incomplete'
    ? 'function call has not returned yet'
    : isEqualValue(expected, result.value)
    ? printCommon(result.value)
    : printReceived(result.value);

export type IndexedResult = [number, any];

// Return either empty string or one line per indexed result,
// so additional empty line can separate from `Number of returns` which follows.
export const printReceivedResults = (
  label: string,
  expected: unknown,
  indexedResults: Array<IndexedResult>,
  isOnlyCall: boolean,
  iExpectedCall?: number,
) => {
  if (indexedResults.length === 0) {
    return '';
  }

  if (isOnlyCall && (iExpectedCall === 0 || iExpectedCall === undefined)) {
    return label + printResult(indexedResults[0][1], expected) + '\n';
  }

  const printAligned = getRightAlignedPrinter(label);

  return (
    label.replace(':', '').trim() +
    '\n' +
    indexedResults.reduce(
      (printed: string, [i, result]: IndexedResult) =>
        printed + printAligned(String(i + 1), i === iExpectedCall) + printResult(result, expected) + '\n',
      '',
    )
  );
};

export const ensureSinonSpy = (
  received: any,
  matcherName: string,
  expectedArgument: string,
  options: MatcherHintOptions,
) => {
  if (!isSpy(received)) {
    throw new Error(
      matcherErrorMessage(
        matcherHint(matcherName, undefined, expectedArgument, options),
        `${RECEIVED_COLOR('received')} value must be a stub or spy function`,
        printWithType('Received', received, printReceived),
      ),
    );
  }
};
