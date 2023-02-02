/* eslint-disable @typescript-eslint/no-explicit-any */

interface CustomMatchers<R> {
  /**
   * Ensures that a mock function is called.
   */
  sinonToBeCalled(): R;

  /**
   * Ensures that a mock function is called an exact number of times.
   */
  sinonToBeCalledTimes(expected: number): R;

  /**
   * Ensure that a mock function is called with specific arguments.
   *
   * Optionally, you can provide a type for the expected arguments via a generic.
   * Note that the type must be either an array or a tuple.
   */
  sinonToBeCalledWith<E extends any[]>(...args: E): R;

  /**
   * Ensure that a mock function is called with specific arguments a specific number of times.
   *
   * Optionally, you can provide a type for the expected arguments via a generic.
   * Note that the type must be either an array or a tuple.
   */
  sinonToBeCalledTimesWith<E extends any[]>(expectedTimes: number, ...args: E): R;

  /**
   * Ensures the last call to a mock function was provided specific args.
   *
   * Optionally, you can provide a type for the expected arguments via a generic.
   * Note that the type must be either an array or a tuple.
   */
  sinonLastCalledWith<E extends any[]>(...args: E): R;

  /**
   * Ensure that the last call to a mock function has returned a specified value.
   *
   * Optionally, you can provide a type for the expected value via a generic.
   * This is particularly useful for ensuring expected objects have the right structure.
   */
  sinonLastReturnedWith<E = any>(value: E): R;

  /**
   * Ensure that a mock function is called with specific arguments on an Nth call.
   *
   * Optionally, you can provide a type for the expected arguments via a generic.
   * Note that the type must be either an array or a tuple.
   */
  sinonNthCalledWith<E extends any[]>(nthCall: number, ...params: E): R;

  /**
   * Ensure that the nth call to a mock function has returned a specified value.
   *
   * Optionally, you can provide a type for the expected value via a generic.
   * This is particularly useful for ensuring expected objects have the right structure.
   */
  sinonNthReturnedWith<E = any>(n: number, value: E): R;

  /**
   * Ensure that a mock function has returned (as opposed to thrown) at least once.
   */
  sinonToReturn(): R;

  /**
   * Ensure that a mock function has returned a specified value at least once.
   *
   * Optionally, you can provide a type for the expected value via a generic.
   * This is particularly useful for ensuring expected objects have the right structure.
   */
  sinonToReturnWith<E = any>(value?: E): R;
}

declare namespace jest {
  // noinspection JSUnusedGlobalSymbols
  interface Matchers<R> {
    /**
     * Ensures the last call to a mock function was provided specific args.
     *
     * Optionally, you can provide a type for the expected arguments via a generic.
     * Note that the type must be either an array or a tuple.
     */
    sinonLastCalledWith<E extends any[]>(...args: E): R;

    /**
     * Ensure that the last call to a mock function has returned a specified value.
     *
     * Optionally, you can provide a type for the expected value via a generic.
     * This is particularly useful for ensuring expected objects have the right structure.
     */
    sinonLastReturnedWith<E = any>(value?: E): R;

    /**
     * Ensure that a mock function is called with specific arguments on an Nth call.
     *
     * Optionally, you can provide a type for the expected arguments via a generic.
     * Note that the type must be either an array or a tuple.
     */
    sinonNthCalledWith<E extends any[]>(nthCall: number, ...params: E): R;

    /**
     * Ensure that the nth call to a mock function has returned a specified value.
     *
     * Optionally, you can provide a type for the expected value via a generic.
     * This is particularly useful for ensuring expected objects have the right structure.
     */
    sinonNthReturnedWith<E = any>(n: number, value: E): R;

    /**
     * Ensures that a mock function is called.
     */
    sinonToBeCalled(): R;

    /**
     * Ensures that a mock function is called an exact number of times.
     */
    sinonToBeCalledTimes(expected: number): R;

    /**
     * Ensure that a mock function is called with specific arguments.
     *
     * Optionally, you can provide a type for the expected arguments via a generic.
     * Note that the type must be either an array or a tuple.
     */
    sinonToBeCalledWith<E extends any[]>(...args: E): R;

    /**
     * Ensure that a mock function is called with specific arguments a specific number of time.
     *
     * Optionally, you can provide a type for the expected arguments via a generic.
     * Note that the type must be either an array or a tuple.
     */
    sinonToBeCalledTimesWith<E extends any[]>(expectedTimes: number, ...args: E): R;

    /**
     * Ensure that a mock function has returned (as opposed to thrown) at least once.
     */
    sinonToReturn(): R;

    /**
     * Ensure that a mock function has returned (as opposed to thrown) a specified number of times.
     */
    sinonToReturnTimes(count: number): R;

    /**
     * Ensure that a mock function has returned a specified value at least once.
     *
     * Optionally, you can provide a type for the expected value via a generic.
     * This is particularly useful for ensuring expected objects have the right structure.
     */
    sinonToReturnWith<E = any>(value?: E): R;
  }

  // noinspection JSUnusedGlobalSymbols
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Expect extends CustomMatchers<any> {}

  // noinspection JSUnusedGlobalSymbols
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface InverseAsymmetricMatchers extends Expect {}
}

declare namespace Vi {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface AsymmetricMatchersContaining extends CustomMatchers<any> {}
}
