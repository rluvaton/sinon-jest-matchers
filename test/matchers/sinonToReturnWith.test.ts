import sinon from 'sinon';
import * as matchers from '../../src';
import * as Immutable from 'immutable';

expect.extend(matchers);

describe('sinonToReturnWith', () => {
  test('works only on stubs or sinon.spies', () => {
    const fn = function fn() {};

    expect(() => expect(fn).sinonToReturnWith(expect.anything())).toThrowErrorMatchingSnapshot();
  });

  test('works when not called', () => {
    const fn = sinon.spy();
    expect(fn).not.sinonToReturnWith('foo');

    expect(() => expect(fn).sinonToReturnWith('foo')).toThrowErrorMatchingSnapshot();
  });

  test('works with no arguments', () => {
    const fn = sinon.spy();
    fn();
    expect(fn).sinonToReturnWith();
  });

  test('works with argument that does not match', () => {
    const fn = sinon.spy(() => 'foo');
    fn();

    expect(fn).not.sinonToReturnWith('bar');

    expect(() => expect(fn).sinonToReturnWith('bar')).toThrowErrorMatchingSnapshot();
  });

  test('works with argument that does match', () => {
    const fn = sinon.spy(() => 'foo');
    fn();

    expect(fn).sinonToReturnWith('foo');

    expect(() => expect(fn).not.sinonToReturnWith('foo')).toThrowErrorMatchingSnapshot();
  });

  test('works with undefined', () => {
    const fn = sinon.spy(() => undefined);
    fn();

    expect(fn).sinonToReturnWith(undefined);

    expect(() => expect(fn).not.sinonToReturnWith(undefined)).toThrowErrorMatchingSnapshot();
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

    expect(fn).sinonToReturnWith(m2);
    expect(fn).not.sinonToReturnWith(m3);

    expect(() => expect(fn).not.sinonToReturnWith(m2)).toThrowErrorMatchingSnapshot();
    expect(() => expect(fn).sinonToReturnWith(m3)).toThrowErrorMatchingSnapshot();
  });

  test('works with Set', () => {
    const s1 = new Set([1, 2]);
    const s2 = new Set([1, 2]);
    const s3 = new Set([3, 4]);

    const fn = sinon.spy(() => s1);
    fn();

    expect(fn).sinonToReturnWith(s2);
    expect(fn).not.sinonToReturnWith(s3);

    expect(() => expect(fn).not.sinonToReturnWith(s2)).toThrowErrorMatchingSnapshot();
    expect(() => expect(fn).sinonToReturnWith(s3)).toThrowErrorMatchingSnapshot();
  });

  test('works with Immutable.js objects directly created', () => {
    const directlyCreated = Immutable.Map([['a', { b: 'c' }]]);
    const fn = sinon.spy(() => directlyCreated);
    fn();

    expect(fn).sinonToReturnWith(directlyCreated);

    expect(() => expect(fn).not.sinonToReturnWith(directlyCreated)).toThrowErrorMatchingSnapshot();
  });

  test('works with Immutable.js objects indirectly created', () => {
    const indirectlyCreated = Immutable.Map().set('a', { b: 'c' });
    const fn = sinon.spy(() => indirectlyCreated);
    fn();

    expect(fn).sinonToReturnWith(indirectlyCreated);

    expect(() => expect(fn).not.sinonToReturnWith(indirectlyCreated)).toThrowErrorMatchingSnapshot();
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
    expect(fn).not.sinonToReturnWith('foo');
    expect(fn).not.sinonToReturnWith(null);
    expect(fn).not.sinonToReturnWith(undefined);

    expect(() => expect(fn).sinonToReturnWith(undefined)).toThrowErrorMatchingSnapshot();
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
    expect(fn).not.sinonToReturnWith('foo');
    expect(fn).not.sinonToReturnWith(null);
    expect(fn).not.sinonToReturnWith(undefined);

    expect(() => expect(fn).sinonToReturnWith(undefined)).toThrowErrorMatchingSnapshot();
  });

  test('works with more calls than the limit', () => {
    let i = 0;
    const fn = sinon.spy(() => `foo${++i}`);

    fn();
    fn();
    fn();
    fn();
    fn();
    fn();

    expect(fn).not.sinonToReturnWith('bar');

    expect(() => {
      expect(fn).sinonToReturnWith('bar');
    }).toThrowErrorMatchingSnapshot();
  });

  test('includes the custom mock name in the error message', () => {
    const fn = sinon.spy();
    fn.named('named-mock');
    expect(fn).not.sinonToReturnWith('foo');

    expect(() => expect(fn).sinonToReturnWith('foo')).toThrowErrorMatchingSnapshot();
  });
});
