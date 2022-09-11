import sinon from 'sinon';
import * as matchers from '../../src';

expect.extend(matchers);

describe('sinonToBeCalledTimes', () => {
  test('.not works only on spies or jest.fn', () => {
    const fn = function fn() {};

    expect(() => expect(fn).not.sinonToBeCalledTimes(2)).toThrowErrorMatchingSnapshot();
  });

  test('only accepts a number argument', () => {
    const fn = sinon.spy();
    fn();
    expect(fn).sinonToBeCalledTimes(1);

    [{}, [], true, 'a', new Map(), () => {}].forEach(value => {
      // @ts-expect-error we expect arg different from a number
      expect(() => expect(fn).sinonToBeCalledTimes(value)).toThrowErrorMatchingSnapshot();
    });
  });

  test('.not only accepts a number argument', () => {
    const fn = sinon.spy();
    expect(fn).not.sinonToBeCalledTimes(1);

    [{}, [], true, 'a', new Map(), () => {}].forEach(value => {
      // @ts-expect-error we expect arg different from a number
      expect(() => expect(fn).not.sinonToBeCalledTimes(value)).toThrowErrorMatchingSnapshot();
    });
  });

  test('passes if function called equal to expected times', () => {
    const fn = sinon.spy();
    fn();
    fn();

    expect(fn).sinonToBeCalledTimes(2);

    expect(() => expect(fn).not.sinonToBeCalledTimes(2)).toThrowErrorMatchingSnapshot();
  });

  test('.not passes if function called more than expected times', () => {
    const fn = sinon.spy();
    fn();
    fn();
    fn();

    expect(fn).sinonToBeCalledTimes(3);
    expect(fn).not.sinonToBeCalledTimes(2);

    expect(() => expect(fn).sinonToBeCalledTimes(2)).toThrowErrorMatchingSnapshot();
  });

  test('.not passes if function called less than expected times', () => {
    const fn = sinon.spy();
    fn();

    expect(fn).sinonToBeCalledTimes(1);
    expect(fn).not.sinonToBeCalledTimes(2);

    expect(() => expect(fn).sinonToBeCalledTimes(2)).toThrowErrorMatchingSnapshot();
  });

  test('includes the custom mock name in the error message', () => {
    const fn = jest.fn().mockName('named-mock');
    fn();

    expect(() => expect(fn).sinonToBeCalledTimes(2)).toThrowErrorMatchingSnapshot();
  });
});
