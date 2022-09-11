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

describe('sinonLastReturnedWith', () => {
  test('works only on stubs or sinon spies', () => {
    const fn = function fn() {};

    expect(() => expect(fn).sinonLastReturnedWith()).toThrowErrorMatchingSnapshot();
  });

  test('works when not called', () => {
    const fn = sinon.spy();
    expect(fn).not.sinonLastReturnedWith('foo');

    expect(() => expect(fn).sinonLastReturnedWith('foo')).toThrowErrorMatchingSnapshot();
  });

  test('works with no arguments', () => {
    const fn = sinon.spy();
    fn();
    expect(fn).sinonLastReturnedWith();
  });

  test('works with argument that does not match', () => {
    const fn = sinon.spy(() => 'foo');
    fn();

    expect(fn).not.sinonLastReturnedWith('bar');

    expect(() => expect(fn).sinonLastReturnedWith('bar')).toThrowErrorMatchingSnapshot();
  });

  test('works with argument that does match', () => {
    const fn = sinon.spy(() => 'foo');
    fn();

    expect(fn).sinonLastReturnedWith('foo');

    expect(() => expect(fn).not.sinonLastReturnedWith('foo')).toThrowErrorMatchingSnapshot();
  });

  test('works with undefined', () => {
    const fn = sinon.spy(() => undefined);
    fn();

    expect(fn).sinonLastReturnedWith(undefined);

    expect(() => expect(fn).not.sinonLastReturnedWith(undefined)).toThrowErrorMatchingSnapshot();
  });

  test('works with Map', () => {
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

    const fn = sinon.spy(() => m1);
    fn();

    expect(fn).sinonLastReturnedWith(m2);
    expect(fn).not.sinonLastReturnedWith(m3);

    expect(() => expect(fn).not.sinonLastReturnedWith(m2)).toThrowErrorMatchingSnapshot();
    expect(() => expect(fn).sinonLastReturnedWith(m3)).toThrowErrorMatchingSnapshot();
  });

  test('works with Set', () => {
    const s1 = new Set([1, 2]);
    const s2 = new Set([1, 2]);
    const s3 = new Set([3, 4]);

    const fn = sinon.spy(() => s1);
    fn();

    expect(fn).sinonLastReturnedWith(s2);
    expect(fn).not.sinonLastReturnedWith(s3);

    expect(() => expect(fn).not.sinonLastReturnedWith(s2)).toThrowErrorMatchingSnapshot();
    expect(() => expect(fn).sinonLastReturnedWith(s3)).toThrowErrorMatchingSnapshot();
  });

  test('works with Immutable.js objects directly created', () => {
    const directlyCreated = Immutable.Map([['a', { b: 'c' }]]);
    const fn = sinon.spy(() => directlyCreated);
    fn();

    expect(fn).sinonLastReturnedWith(directlyCreated);

    expect(() => expect(fn).not.sinonLastReturnedWith(directlyCreated)).toThrowErrorMatchingSnapshot();
  });

  test('works with Immutable.js objects indirectly created', () => {
    const indirectlyCreated = Immutable.Map().set('a', { b: 'c' });
    const fn = sinon.spy(() => indirectlyCreated);
    fn();

    expect(fn).sinonLastReturnedWith(indirectlyCreated);

    expect(() => expect(fn).not.sinonLastReturnedWith(indirectlyCreated)).toThrowErrorMatchingSnapshot();
  });

  test('a call that throws is not considered to have returned', () => {
    const fn = sinon.spy(() => {
      throw new Error('Error!');
    });

    try {
      fn();
    } catch {
      // ignore error
    }

    // It doesn't matter what return value is tested if the call threw
    expect(fn).not.sinonLastReturnedWith('foo');
    expect(fn).not.sinonLastReturnedWith(null);
    expect(fn).not.sinonLastReturnedWith(undefined);

    expect(() => expect(fn).sinonLastReturnedWith(undefined)).toThrowErrorMatchingSnapshot();
  });

  // Bug in sinon - https://github.com/sinonjs/sinon/issues/2471
  test.skip('a call that throws undefined is not considered to have returned', () => {
    const fn = sinon.spy(() => {
      // eslint-disable-next-line no-throw-literal
      throw undefined;
    });

    try {
      fn();
    } catch {
      // ignore error
    }

    // It doesn't matter what return value is tested if the call threw
    expect(fn).not.sinonLastReturnedWith('foo');
    expect(fn).not.sinonLastReturnedWith(null);
    expect(fn).not.sinonLastReturnedWith(undefined);

    expect(() => expect(fn).sinonLastReturnedWith(undefined)).toThrowErrorMatchingSnapshot();
  });

  describe('lastReturnedWith', () => {
    test('works with three calls', () => {
      let i = 0;
      const fn = sinon.fake(() => {
        return `foo${++i}`;
      });
      fn();
      fn();
      fn();

      expect(fn).sinonLastReturnedWith('foo3');

      expect(() => {
        expect(fn).not.sinonLastReturnedWith('foo3');
      }).toThrowErrorMatchingSnapshot();
    });

    test('incomplete recursive calls are handled properly', () => {
      // sums up all integers from 0 -> value, using recursion
      const fn = sinon.spy(value => {
        if (value === 0) {
          // Before returning from the base case of recursion, none of the
          // calls have returned yet.
          expect(fn).not.sinonLastReturnedWith(0);
          expect(() => expect(fn).sinonLastReturnedWith(0)).toThrowErrorMatchingSnapshot();
          return 0;
        } else {
          return value + fn(value - 1);
        }
      });

      fn(3);
    });
  });

  test('includes the custom mock name in the error message', () => {
    const fn = sinon.spy();
    fn.named('named-mock');
    expect(fn).not.sinonLastReturnedWith('foo');

    expect(() => expect(fn).sinonLastReturnedWith('foo')).toThrowErrorMatchingSnapshot();
  });
});
