import {matcherHint, MatcherHintOptions, printExpected, printReceived, stringify} from 'jest-matcher-utils';
import {
    ensureSinonSpy,
    IndexedCall,
    isEqualCall,
    isExpand,
    PRINT_LIMIT,
    printExpectedArgs,
    printExpectedReceivedCallsPositive,
    printReceivedCallsNegative,
} from '../utils/jest-utils';
import {getSpyName} from '../utils/sinon-utils';

const matcherName = 'sinonToBeCalledTimesWith';

export function sinonToBeCalledTimesWith(
    this: any,
    received: sinon.SinonSpy | sinon.SinonStub,
    timesExpected: number,
    ...expected: Array<unknown>
) {
    const expectedArgument = '...expected';
    const options: MatcherHintOptions = {
        isNot: this.isNot,
        promise: this.promise,
    };

    ensureSinonSpy(received, matcherName, expectedArgument, options);

    const receivedName = getSpyName(received);

    const calls = received.args;

    const matchingCalls = calls.filter((call: any) => isEqualCall(expected, call));
    const pass = matchingCalls.length === timesExpected;

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
                `Expected not to be called ${timesExpected} times with: ${printExpectedArgs(expected)}\n` +
                (calls.length === 1 && stringify(calls[0]) === stringify(expected)
                    ? ''
                    : printReceivedCallsNegative(expected, indexedCalls, received.calledOnce)) +
                `\nNumber of calls: ${printReceived(matchingCalls.length)}`
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
                printExpectedReceivedCallsPositive(expected, indexedCalls, isExpand(this.expand), received.calledOnce) +
                `\nExpected number of matching calls: ${printExpected(timesExpected)}\n` +
                `Received number of matching calls: ${printReceived(matchingCalls.length)}`
            );
        };

    return {message, pass};
}
