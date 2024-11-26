# @hypothesis/frontend-testing

This package contains common utilities for testing UI components across
Hypothesis frontend projects. It includes tools for:

 - Rendering UI components and unmounting them once the test ends
 - Waiting for conditions to be met
 - Mocking UI components
 - Testing accessibility using [axe-core](https://github.com/dequelabs/axe-core)

This package is designed to work with downstream projects that use Hypothesis's
standard UI and UI testing stack, built on:

 - [Preact](https://preactjs.com)
 - [Enzyme](https://github.com/enzymejs/enzyme)
 - [babel-plugin-mockable-imports](https://github.com/robertknight/babel-plugin-mockable-imports)

## API guide

### Rendering components

This package exports a wrapper around Enzyme's `mount` function to render
a component, query its output and interact with it. The function in this
package adds the wrapper to a global list of active wrappers which can then
be conveniently unmounted using `unmountAll` at the end of a test.

```js
import { mount, unmountAll } from '@hypothesis/frontend-testing';

describe('MyWidget', () => {
  afterEach(() => {
    // Clean up by unmounting any wrappers mounted in the current test and
    // removing associated DOM containers.
    unmountAll();
  });

  it('should render', () => {
    const wrapper = mount(<MyWidget/>);

    // Query component content etc.
  });

  it('should do something that requires component to be connected', () => {
    const wrapper = mount(<MyWidget/>, { connected: true });

    // Test behavior that relies on rendered component being part of the
    // DOM tree under `document.body`.
  });
});
```
