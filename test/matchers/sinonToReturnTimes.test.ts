import sinon from 'sinon';
import * as matchers from '../../src';

expect.extend(matchers);

describe('sinonToReturnTimes', () => {
  test('only accepts a number argument', () => {
    const fn = sinon.spy(() => 42);
    fn();
    expect(fn).sinonToReturnTimes(1);

    [{}, [], true, 'a', new Map(), () => {}].forEach(value => {
      // @ts-expect-error we test here invalid arguments
      expect(() => expect(fn).sinonToReturnTimes(value)).toThrowErrorMatchingSnapshot();
    });
  });

  test('.not only accepts a number argument', () => {
    const fn = sinon.spy(() => 42);
    expect(fn).not.sinonToReturnTimes(2);

    [{}, [], true, 'a', new Map(), () => {}].forEach(value => {
      // @ts-expect-error we test here invalid arguments
      expect(() => expect(fn).not.sinonToReturnTimes(value)).toThrowErrorMatchingSnapshot();
    });
  });

  test('passes if function returned equal to expected times', () => {
    const fn = sinon.spy(() => 42);
    fn();
    fn();

    expect(fn).sinonToReturnTimes(2);

    expect(() => expect(fn).not.sinonToReturnTimes(2)).toThrowErrorMatchingSnapshot();
  });

  test('calls that return undefined are counted as returns', () => {
    const fn = sinon.spy(() => undefined);
    fn();
    fn();

    expect(fn).sinonToReturnTimes(2);

    expect(() => expect(fn).not.sinonToReturnTimes(2)).toThrowErrorMatchingSnapshot();
  });

  test('.not passes if function returned more than expected times', () => {
    const fn = sinon.spy(() => 42);
    fn();
    fn();
    fn();

    expect(fn).sinonToReturnTimes(3);
    expect(fn).not.sinonToReturnTimes(2);

    expect(() => expect(fn).sinonToReturnTimes(2)).toThrowErrorMatchingSnapshot();
  });

  test('.not passes if function called less than expected times', () => {
    const fn = sinon.spy(() => 42);
    fn();

    expect(fn).sinonToReturnTimes(1);
    expect(fn).not.sinonToReturnTimes(2);

    expect(() => expect(fn).sinonToReturnTimes(2)).toThrowErrorMatchingSnapshot();
  });

  test('calls that throw are not counted', () => {
    const fn = sinon.spy(causeError => {
      if (causeError) {
        throw new Error('Error!');
      }

      return 42;
    });

    fn(false);

    try {
      fn(true);
    } catch {
      // ignore error
    }

    fn(false);

    expect(fn).not.sinonToReturnTimes(3);

    expect(() => expect(fn).sinonToReturnTimes(3)).toThrowErrorMatchingSnapshot();
  });

  // Bug in sinon - https://github.com/sinonjs/sinon/issues/2471
  test.skip('calls that throw undefined are not counted', () => {
    const fn = sinon.spy(causeError => {
      if (causeError) {
        // eslint-disable-next-line no-throw-literal
        throw undefined;
      }

      return 42;
    });

    fn(false);

    try {
      fn(true);
    } catch {
      // ignore error
    }

    fn(false);

    expect(fn).sinonToReturnTimes(2);

    expect(() => expect(fn).not.sinonToReturnTimes(2)).toThrowErrorMatchingSnapshot();
  });

  test('includes the custom mock name in the error message', () => {
    const fn = sinon.spy(() => 42);
    fn.named('named-mock');
    fn();
    fn();

    expect(fn).sinonToReturnTimes(2);

    expect(() => expect(fn).sinonToReturnTimes(1)).toThrowErrorMatchingSnapshot();
  });
});
