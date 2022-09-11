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

describe('sinonNthCalledWith', () => {
  test('works only on stubs or sinon.spy', () => {
    const fn = function fn() {};

    expect(() => expect(fn).sinonNthCalledWith(1)).toThrowErrorMatchingSnapshot();
  });

  test('works when not called', () => {
    const fn = sinon.spy();
    expect(fn).not.sinonNthCalledWith(1, 'foo', 'bar');

    expect(() => expect(fn).sinonNthCalledWith(1, 'foo', 'bar')).toThrowErrorMatchingSnapshot();
  });

  test('works with no arguments', () => {
    const fn = sinon.spy();
    fn();
    expect(fn).sinonNthCalledWith(1);
  });

  test("works with arguments that don't match", () => {
    const fn = sinon.spy();
    fn('foo', 'bar1');

    expect(fn).not.sinonNthCalledWith(1, 'foo', 'bar');

    expect(() => expect(fn).sinonNthCalledWith(1, 'foo', 'bar')).toThrowErrorMatchingSnapshot();
  });

  test("works with arguments that don't match in number of arguments", () => {
    const fn = sinon.spy();
    fn('foo', 'bar', 'plop');

    expect(fn).not.sinonNthCalledWith(1, 'foo', 'bar');

    expect(() => expect(fn).sinonNthCalledWith(1, 'foo', 'bar')).toThrowErrorMatchingSnapshot();
  });

  test("works with arguments that don't match with matchers", () => {
    const fn = sinon.spy();
    fn('foo', 'bar');

    expect(fn).not.sinonNthCalledWith(1, expect.any(String), expect.any(Number));

    expect(() =>
      expect(fn).sinonNthCalledWith(1, expect.any(String), expect.any(Number)),
    ).toThrowErrorMatchingSnapshot();
  });

  test("works with arguments that don't match with matchers even when argument is undefined", () => {
    const fn = sinon.spy();
    fn('foo', undefined);

    expect(fn).not.sinonNthCalledWith(1, 'foo', expect.any(String));

    expect(() => expect(fn).sinonNthCalledWith(1, 'foo', expect.any(String))).toThrowErrorMatchingSnapshot();
  });

  test('works with arguments that match', () => {
    const fn = sinon.spy();
    fn('foo', 'bar');

    expect(fn).sinonNthCalledWith(1, 'foo', 'bar');

    expect(() => expect(fn).not.sinonNthCalledWith(1, 'foo', 'bar')).toThrowErrorMatchingSnapshot();
  });

  test('works with arguments that match with matchers', () => {
    const fn = sinon.spy();
    fn('foo', 'bar');

    expect(fn).sinonNthCalledWith(1, expect.any(String), expect.any(String));

    expect(() =>
      expect(fn).not.sinonNthCalledWith(1, expect.any(String), expect.any(String)),
    ).toThrowErrorMatchingSnapshot();
  });

  test('works with trailing undefined arguments if requested by the match query', () => {
    const fn = sinon.spy();
    fn('foo', undefined);

    expect(fn).sinonNthCalledWith(1, 'foo', undefined);
    expect(() => expect(fn).not.sinonNthCalledWith(1, 'foo', undefined)).toThrowErrorMatchingSnapshot();
  });

  test('works with trailing undefined arguments when explicitly requested as optional by matcher', () => {
    // issue 12463
    const fn = sinon.spy();
    fn('foo', undefined);

    expect(fn).sinonNthCalledWith(1, 'foo', (expect as any).optionalFn());
    expect(() =>
      expect(fn).not.sinonNthCalledWith(1, 'foo', (expect as any).optionalFn()),
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

    expect(fn).sinonNthCalledWith(1, m2);
    expect(fn).not.sinonNthCalledWith(1, m3);

    expect(() => expect(fn).not.sinonNthCalledWith(1, m2)).toThrowErrorMatchingSnapshot();
    expect(() => expect(fn).sinonNthCalledWith(1, m3)).toThrowErrorMatchingSnapshot();
  });

  test('works with Set', () => {
    const fn = sinon.spy();

    const s1 = new Set([1, 2]);
    const s2 = new Set([1, 2]);
    const s3 = new Set([3, 4]);

    fn(s1);

    expect(fn).sinonNthCalledWith(1, s2);
    expect(fn).not.sinonNthCalledWith(1, s3);

    expect(() => expect(fn).not.sinonNthCalledWith(1, s2)).toThrowErrorMatchingSnapshot();
    expect(() => expect(fn).sinonNthCalledWith(1, s3)).toThrowErrorMatchingSnapshot();
  });

  test('works with Immutable.js objects', () => {
    const fn = sinon.spy();
    const directlyCreated = Immutable.Map([['a', { b: 'c' }]]);
    const indirectlyCreated = Immutable.Map().set('a', { b: 'c' });
    fn(directlyCreated, indirectlyCreated);

    expect(fn).sinonNthCalledWith(1, indirectlyCreated, directlyCreated);

    expect(() =>
      expect(fn).not.sinonNthCalledWith(1, indirectlyCreated, directlyCreated),
    ).toThrowErrorMatchingSnapshot();
  });

  test('works with three calls', () => {
    const fn = sinon.spy();
    fn('foo1', 'bar');
    fn('foo', 'bar1');
    fn('foo', 'bar');

    expect(fn).sinonNthCalledWith(1, 'foo1', 'bar');
    expect(fn).sinonNthCalledWith(2, 'foo', 'bar1');
    expect(fn).sinonNthCalledWith(3, 'foo', 'bar');

    expect(() => {
      expect(fn).not.sinonNthCalledWith(1, 'foo1', 'bar');
    }).toThrowErrorMatchingSnapshot();
  });

  test('positive throw matcher error for n that is not positive integer', async () => {
    const fn = sinon.spy();
    fn('foo1', 'bar');

    expect(() => {
      expect(fn).sinonNthCalledWith(0, 'foo1', 'bar');
    }).toThrowErrorMatchingSnapshot();
  });

  test('positive throw matcher error for n that is not integer', async () => {
    const fn = sinon.spy();
    fn('foo1', 'bar');

    expect(() => {
      expect(fn).sinonNthCalledWith(0.1, 'foo1', 'bar');
    }).toThrowErrorMatchingSnapshot();
  });

  test('negative throw matcher error for n that is not integer', async () => {
    const fn = sinon.spy();
    fn('foo1', 'bar');

    expect(() => {
      expect(fn).not.sinonNthCalledWith(Infinity, 'foo1', 'bar');
    }).toThrowErrorMatchingSnapshot();
  });

  test('includes the custom mock name in the error message', () => {
    const fn = sinon.spy();
    fn.named('named-mock');
    fn('foo', 'bar');

    expect(fn).sinonNthCalledWith(1, 'foo', 'bar');

    expect(() => expect(fn).not.sinonNthCalledWith(1, 'foo', 'bar')).toThrowErrorMatchingSnapshot();
  });
});
