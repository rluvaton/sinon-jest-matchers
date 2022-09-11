# Sinon Jest Matchers

## Installation

With npm:

```sh
npm install --save-dev sinon-jest-matchers
```

With yarn:

```sh
yarn add -D sinon-jest-matchers
```

## Setup

```javascript
// ./testSetup.js

// add all jest-extended matchers
import * as matchers from 'sinon-jest-matchers';
expect.extend(matchers);

// or just add specific matchers
import { sinonToBeCalled, sinonToBeCalledTimes } from 'sinon-jest-matchers';
expect.extend({ sinonToBeCalled, sinonToBeCalledTimes });
```

Add your setup script to your Jest `setupFilesAfterEnv` configuration. [See for help](https://jestjs.io/docs/en/configuration.html#setupfilesafterenv-array)

```json
"jest": {
  "setupFilesAfterEnv": ["./testSetup.js"]
}
```

To automatically extend `expect` with all matchers, you can use

```json
"jest": {
  "setupFilesAfterEnv": ["sinon-jest-matchers/all"]
}
```

### Typescript

If your editor does not recognise the custom `sinon-jest-matchers` matchers, add a `global.d.ts` file to your project with:

```ts
import 'jest-extended';
```

_Note: When using `ts-jest >= 25.5.0`_

Since the breaking changes in `25.5.0` you may also need to update your `tsconfig.json` to include the new `global.d.ts` file in the `files` property like so:

```json
{
  "compilerOptions": {
    ...
  },
  ...
  "files": ["global.d.ts"]
}
```

Also note that when adding this for the first time this affects which files are compiled by the TypeScript compiler and you might need to add the `include` property as well. See the [TypeScript docs](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) for more details.

If the above import syntax does not work, replace it with the following:

```ts
/// <reference types="sinon-jest-matchers" />
```

## Matchers

### `.sinonToBeCalled()`

Equivalent to `.toBeCalled()` and `.toHaveBeenCalled()` in jest

```js
function drinkAll(callback, flavour) {
  if (flavour !== 'octopus') {
    callback(flavour);
  }
}

describe('drinkAll', () => {
  test('drinks something lemon-flavoured', () => {
    const drink = sinon.spy();
    drinkAll(drink, 'lemon');
    expect(drink).sinonToBeCalled();
  });

  test('does not drink something octopus-flavoured', () => {
    const drink = sinon.spy();
    drinkAll(drink, 'octopus');
    expect(drink).not.sinonToBeCalled();
  });
});
```

### `.sinonToBeCalledTimes(number)`

Equivalent to `.toHaveBeenCalledTimes(number)` and `.toBeCalledTimes(number)` in jest

```js
test('drinkEach drinks each drink', () => {
  const drink = sinon.spy();
  drinkEach(drink, ['lemon', 'octopus']);
  expect(drink).sinonToBeCalledTimes(2);
});
```

### `.sinonToBeCalledWith(arg1, arg2, ...)`

Equivalent to `.toHaveBeenCalledWith(arg1, arg2, ...)` and `.toBeCalledWith()` in jest

```js
test('registration applies correctly to orange La Croix', () => {
  const beverage = new LaCroix('orange');
  register(beverage);
  const f = sinon.spy();
  applyToAll(f);
  expect(f).sinonToBeCalledWith(beverage);
});
```

### `.sinonLastCalledWith(arg1, arg2, ...)`

Equivalent to `.toHaveBeenLastCalledWith(arg1, arg2, ...)` and `.lastCalledWith(arg1, arg2, ...)` in jest

```js
test('applying to all flavors does mango last', () => {
  const drink = sinon.spy();
  applyToAllFlavors(drink);
  expect(drink).sinonLastCalledWith('mango');
});
```

### `.sinonNthCalledWith(nthCall, arg1, arg2, ....)`

Equivalent to `.toHaveBeenNthCalledWith(nthCall, arg1, arg2, ...)` and `.nthCalledWith(nthCall, arg1, arg2, ...)` in jest

```js
test('drinkEach drinks each drink', () => {
  const drink = sinon.spy();
  drinkEach(drink, ['lemon', 'octopus']);
  expect(drink).sinonNthCalledWith(1, 'lemon');
  expect(drink).sinonNthCalledWith(2, 'octopus');
});
```

> Note:
> The nth argument must be positive integer starting from 1.

### `.sinonToReturn()`

Equivalent to `.toHaveReturned()` and `.toReturn()` in jest

```js
test('drinks returns', () => {
  const drink = sinon.spy(() => true);

  drink();

  expect(drink).sinonToReturn();
});
```

### `.sinonToReturnTimes(number)`

Equivalent to `.toHaveReturnedTimes(number)` and `.toReturnTimes(number)` in jest

```js
test('drink returns twice', () => {
  const drink = sinon.spy(() => true);

  drink();
  drink();

  expect(drink).sinonToReturnTimes(2);
});
```

### `.sinonToReturnWith(value)`

Equivalent to `.toHaveReturnedWith(value)` and `.toReturnWith(value)` in jest

```js
test('drink returns La Croix', () => {
  const beverage = {name: 'La Croix'};
  const drink = sinon.spy(beverage => beverage.name);

  drink(beverage);

  expect(drink).sinonToReturnWith('La Croix');
});
```

### `.sinonLastReturnedWith(value)`

Equivalent to `.toHaveLastReturnedWith(value)` and `.lastReturnedWith(value)` in jest

```js
test('drink returns La Croix (Orange) last', () => {
  const beverage1 = {name: 'La Croix (Lemon)'};
  const beverage2 = {name: 'La Croix (Orange)'};
  const drink = sinon.spy(beverage => beverage.name);

  drink(beverage1);
  drink(beverage2);

  expect(drink).sinonLastReturnedWith('La Croix (Orange)');
});
```



## Inspirations and credits
1. The matchers and their tests taken from jest code and updated to use sinon
2. `jest-extended` for the loading, setup and the file directory structure
3. The expect API docs are taken from jest website and updated to sinon
