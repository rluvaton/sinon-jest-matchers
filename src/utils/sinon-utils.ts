import sinon, { SinonSpyCall } from 'sinon';

// export const isStub = (received: any): received is sinon.SinonStub =>
//   received != null && received._isMockFunction === true;

export const isSpy = (received: any): received is sinon.SinonSpy => received?.isSinonProxy;

export function convertSinonCallToJestResult<T = any>(spyCall: SinonSpyCall<any, any>): jest.MockResult<T> {
  // Currently sinon has bug about throwing an undefined
  // See more https://github.com/sinonjs/sinon/issues/2471
  if (spyCall.exception !== undefined) {
    return {
      type: 'throw',
      value: spyCall.exception,
    };
  }

  // We won't support type: 'incomplete'
  return {
    type: 'return',
    value: spyCall.returnValue,
  };
}
