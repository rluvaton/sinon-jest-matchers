import sinon from 'sinon';
import * as matchers from '../../src';
import * as Immutable from 'immutable';

expect.extend(matchers);

expect.extend({
  optionalFn(fn?: unknown) {
    const pass = fn === undefined || typeof fn === 'function';
    return { message: () => 'expect either a function or undefined', pass };
  },
});

describe('sinonToBeCalledWith', () => {
  test('works only on spies or sinon.spy', () => {
    const fn = function fn() {};

    expect(() => expect(fn).sinonToBeCalledWith()).toThrowErrorMatchingSnapshot();
  });

  test('works when not called', () => {
    const fn = sinon.spy();
    expect(fn).not.sinonToBeCalledWith('foo', 'bar');

    expect(() => expect(fn).sinonToBeCalledWith('foo', 'bar')).toThrowErrorMatchingSnapshot();
  });

  test('works with no arguments', () => {
    const fn = sinon.spy();
    fn();
    expect(fn).sinonToBeCalledWith();
  });

  test("works with arguments that don't match", () => {
    const fn = sinon.spy();
    fn('foo', 'bar1');

    expect(fn).not.sinonToBeCalledWith('foo', 'bar');

    expect(() => expect(fn).sinonToBeCalledWith('foo', 'bar')).toThrowErrorMatchingSnapshot();
  });

  test("works with arguments that don't match in number of arguments", () => {
    const fn = sinon.spy();
    fn('foo', 'bar', 'plop');

    expect(fn).not.sinonToBeCalledWith('foo', 'bar');

    expect(() => expect(fn).sinonToBeCalledWith('foo', 'bar')).toThrowErrorMatchingSnapshot();
  });

  test("works with arguments that don't match with matchers", () => {
    const fn = sinon.spy();
    fn('foo', 'bar');

    expect(fn).not.sinonToBeCalledWith(expect.any(String), expect.any(Number));

    expect(() => expect(fn).sinonToBeCalledWith(expect.any(String), expect.any(Number))).toThrowErrorMatchingSnapshot();
  });

  test("works with arguments that don't match with matchers even when argument is undefined", () => {
    const fn = sinon.spy();
    fn('foo', undefined);

    expect(fn).not.sinonToBeCalledWith('foo', expect.any(String));

    expect(() => expect(fn).sinonToBeCalledWith('foo', expect.any(String))).toThrowErrorMatchingSnapshot();
  });

  // jest issue 12463
  test.skip("works with arguments that don't match in size even if one is an optional matcher", () => {
    const fn = sinon.spy();
    fn('foo');

    expect(fn).not.sinonToBeCalledWith('foo', (expect as any).optionalFn());
    expect(() => expect(fn).sinonToBeCalledWith('foo', (expect as any).optionalFn())).toThrowErrorMatchingSnapshot();
  });

  test('works with arguments that match', () => {
    const fn = sinon.spy();
    fn('foo', 'bar');

    expect(fn).sinonToBeCalledWith('foo', 'bar');

    expect(() => expect(fn).not.sinonToBeCalledWith('foo', 'bar')).toThrowErrorMatchingSnapshot();
  });

  test('works with arguments that match with matchers', () => {
    const fn = sinon.spy();
    fn('foo', 'bar');

    expect(fn).sinonToBeCalledWith(expect.any(String), expect.any(String));

    expect(() =>
      expect(fn).not.sinonToBeCalledWith(expect.any(String), expect.any(String)),
    ).toThrowErrorMatchingSnapshot();
  });

  // Test fails, will ignore for now until it will because an actual problem
  test.skip('works with trailing undefined arguments', () => {
    const fn = sinon.spy();
    fn('foo', undefined);

    expect(() => expect(fn).sinonToBeCalledWith('foo')).toThrowErrorMatchingSnapshot();
  });

  test('works with trailing undefined arguments if requested by the match query', () => {
    const fn = sinon.spy();
    fn('foo', undefined);

    expect(fn).sinonToBeCalledWith('foo', undefined);
    expect(() => expect(fn).not.sinonToBeCalledWith('foo', undefined)).toThrowErrorMatchingSnapshot();
  });

  test('works with trailing undefined arguments when explicitly requested as optional by matcher', () => {
    const fn = sinon.spy();
    fn('foo', undefined);

    expect(fn).sinonToBeCalledWith('foo', (expect as any).optionalFn());
    expect(() =>
      expect(fn).not.sinonToBeCalledWith('foo', (expect as any).optionalFn()),
    ).toThrowErrorMatchingSnapshot();
  });

  test('works with Map', () => {
    const fn = sinon.spy();

    const m1 = new Map([
      [1, 2],
      [2, 1],
    ]);
    const m2 = new Map([
      [1, 2],
      [2, 1],
    ]);
    const m3 = new Map([
      ['a', 'b'],
      ['b', 'a'],
    ]);

    fn(m1);

    expect(fn).sinonToBeCalledWith(m2);
    expect(fn).not.sinonToBeCalledWith(m3);

    expect(() => expect(fn).not.sinonToBeCalledWith(m2)).toThrowErrorMatchingSnapshot();
    expect(() => expect(fn).sinonToBeCalledWith(m3)).toThrowErrorMatchingSnapshot();
  });

  test('works with Set', () => {
    const fn = sinon.spy();

    const s1 = new Set([1, 2]);
    const s2 = new Set([1, 2]);
    const s3 = new Set([3, 4]);

    fn(s1);

    expect(fn).sinonToBeCalledWith(s2);
    expect(fn).not.sinonToBeCalledWith(s3);

    expect(() => expect(fn).not.sinonToBeCalledWith(s2)).toThrowErrorMatchingSnapshot();
    expect(() => expect(fn).sinonToBeCalledWith(s3)).toThrowErrorMatchingSnapshot();
  });

  test('works with Immutable.js objects', () => {
    const fn = sinon.spy();
    const directlyCreated = Immutable.Map([['a', { b: 'c' }]]);
    const indirectlyCreated = Immutable.Map().set('a', { b: 'c' });
    fn(directlyCreated, indirectlyCreated);

    expect(fn).sinonToBeCalledWith(indirectlyCreated, directlyCreated);

    expect(() => expect(fn).not.sinonToBeCalledWith(indirectlyCreated, directlyCreated)).toThrowErrorMatchingSnapshot();
  });

  test('works with many arguments', () => {
    const fn = sinon.spy();
    fn('foo1', 'bar');
    fn('foo', 'bar1');
    fn('foo', 'bar');

    expect(fn).sinonToBeCalledWith('foo', 'bar');

    expect(() => expect(fn).not.sinonToBeCalledWith('foo', 'bar')).toThrowErrorMatchingSnapshot();
  });

  test("works with many arguments that don't match", () => {
    const fn = sinon.spy();
    fn('foo', 'bar1');
    fn('foo', 'bar2');
    fn('foo', 'bar3');

    expect(fn).not.sinonToBeCalledWith('foo', 'bar');

    expect(() => expect(fn).sinonToBeCalledWith('foo', 'bar')).toThrowErrorMatchingSnapshot();
  });

  test('includes the custom mock name in the error message', () => {
    const fn = sinon.spy();
    fn.named('named-mock');
    fn('foo', 'bar');

    expect(fn).sinonToBeCalledWith('foo', 'bar');

    expect(() => expect(fn).not.sinonToBeCalledWith('foo', 'bar')).toThrowErrorMatchingSnapshot();
  });
});
