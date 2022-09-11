import sinon from 'sinon';
import * as matchers from '../../src';

expect.extend(matchers);

describe('sinonToReturn', () => {
  test('.not works only on sinon.spy', () => {
    const fn = function fn() {};

    expect(() => expect(fn).not.sinonToReturn()).toThrowErrorMatchingSnapshot();
  });

  test('passes when returned', () => {
    const fn = sinon.spy(() => 42);
    fn();
    expect(fn).sinonToReturn();
    expect(() => expect(fn).not.sinonToReturn()).toThrowErrorMatchingSnapshot();
  });

  test('passes when undefined is returned', () => {
    const fn = sinon.spy(() => undefined);
    fn();
    expect(fn).sinonToReturn();
    expect(() => expect(fn).not.sinonToReturn()).toThrowErrorMatchingSnapshot();
  });

  test('passes when at least one call does not throw', () => {
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

    expect(fn).sinonToReturn();
    expect(() => expect(fn).not.sinonToReturn()).toThrowErrorMatchingSnapshot();
  });

  test('.not passes when not returned', () => {
    const fn = sinon.spy();

    expect(fn).not.sinonToReturn();
    expect(() => expect(fn).sinonToReturn()).toThrowErrorMatchingSnapshot();
  });

  test('.not passes when all calls throw', () => {
    const fn = sinon.spy(() => {
      throw new Error('Error!');
    });

    try {
      fn();
    } catch {
      // ignore error
    }

    try {
      fn();
    } catch {
      // ignore error
    }

    expect(fn).not.sinonToReturn();
    expect(() => expect(fn).sinonToReturn()).toThrowErrorMatchingSnapshot();
  });

  // Bug in sinon - https://github.com/sinonjs/sinon/issues/2471
  test.skip('.not passes when a call throws undefined', () => {
    const fn = sinon.spy(() => {
      // eslint-disable-next-line no-throw-literal
      throw undefined;
    });

    try {
      fn();
    } catch {
      // ignore error
    }

    expect(fn).not.sinonToReturn();
    expect(() => expect(fn).sinonToReturn()).toThrowErrorMatchingSnapshot();
  });

  test('fails with any argument passed', () => {
    const fn = sinon.spy();

    fn();
    // @ts-expect-error we test that it throws on argument
    expect(() => expect(fn).sinonToReturn(555)).toThrowErrorMatchingSnapshot();
  });

  test('.not fails with any argument passed', () => {
    const fn = sinon.spy();

    // @ts-expect-error we test that it throws on argument
    expect(() => expect(fn).not.sinonToReturn(555)).toThrowErrorMatchingSnapshot();
  });

  test('includes the custom mock name in the error message', () => {
    const fn = sinon.spy(() => 42);
    fn.named('named-mock');
    fn();
    expect(fn).sinonToReturn();
    expect(() => expect(fn).not.sinonToReturn()).toThrowErrorMatchingSnapshot();
  });
});
