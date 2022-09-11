import sinon from 'sinon';
import * as matchers from '../../src';

expect.extend(matchers);

describe('sinonToBeCalled', () => {
  test('works only on spies or jest.fn', () => {
    const fn = function fn() {
      // noop
    };

    expect(() => expect(fn).sinonToBeCalled()).toThrowErrorMatchingSnapshot();
  });

  test('passes when called', () => {
    const fn = sinon.spy();
    fn('arg0', 'arg1', 'arg2');
    expect(fn).sinonToBeCalled();
    expect(() => expect(fn).not.sinonToBeCalled()).toThrowErrorMatchingSnapshot();
  });

  test('.not passes when called', () => {
    const fn = sinon.spy();

    expect(fn).not.sinonToBeCalled();
    expect(() => expect(fn).sinonToBeCalled()).toThrowErrorMatchingSnapshot();
  });

  test('fails with any argument passed', () => {
    const fn = sinon.spy();

    fn();

    // @ts-expect-error should not get arguments
    expect(() => expect(fn).sinonToBeCalled(555)).toThrowErrorMatchingSnapshot();
  });

  test('.not fails with any argument passed', () => {
    const fn = sinon.spy();

    // @ts-expect-error should not get arguments
    expect(() => expect(fn).not.sinonToBeCalled(555)).toThrowErrorMatchingSnapshot();
  });

  test('includes the custom mock name in the error message', () => {
    const fn = sinon.spy();

    fn.named('named-mock');

    fn();
    expect(fn).sinonToBeCalled();
    expect(() => expect(fn).not.sinonToBeCalled()).toThrowErrorMatchingSnapshot();
  });
});
