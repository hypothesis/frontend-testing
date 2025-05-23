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
- [Vitest](http://vitest.dev/)
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
    const wrapper = mount(<MyWidget />);

    // Query component content etc.
  });

  it('should do something that requires component to be connected', () => {
    const wrapper = mount(<MyWidget />, { connected: true });

    // Test behavior that relies on rendered component being part of the
    // DOM tree under `document.body`.
  });
});
```

## Vitest

All projects depending on this package are expected to use Vitest to run tests.

However, we don't follow all practices recommended by Vitest. You should take
these points into consideration when reading Vitest's documentation:

1. By default, Vitest uses [Vite](https://vite.dev/) to bundle the tests and
   source code as test files are run.
   Instead, we manually pre-bundle our tests and source code in a single file
   with Rollup, and that's the only test file we run.
   That file is still processed by Vite, but since it has nothing to transform,
   the time it takes is negligible.
2. Due to the point above, Vitest tries to capture and calculate code coverage while
   tests and sources are bundled with Vite.
   In our case, we use `babel-plugin-istanbul` to instrument the code coverage
   while we do our own pre-bundling.
   This requires two configuration options to be set in `babel-plugin-istanbul`,
   so that `istanbul-lib-instrument` checks the file is already instrumented.
   [See the discussion](https://github.com/vitest-dev/vitest/discussions/7841#discussioncomment-12855608).

   ```js
   [
     'babel-plugin-istanbul',
     {
       coverageGlobalScope: 'globalThis',
       coverageVariable: '__VITEST_COVERAGE__',

       // Other options...
     },
   ];
   ```

### Istanbul coverage options

As mentioned above, for the code coverage to be calculated properly, we need to
use `babel-plugin-istanbul` and set these configuration options:

```js
{
  coverageGlobalScope: 'globalThis',
  coverageVariable: '__VITEST_COVERAGE__'
}
```

This library provides these options for convenience, so that you don't need to
define them everywhere.

```js
import { vitestCoverageOptions } from '@hypothesis/frontend-testing/vitest';
import { babel } from '@rollup/plugin-babel';

const babelRollupPlugin = babel({
  // ...

  presets: [
    // ...
  ],
  plugins: [
    [
      'babel-plugin-istanbul',
      {
        ...vitestCoverageOptions,

        // Other options...
      },
    ],
  ],
});
```

### Summary reporter

Vitest's default reporter prints a real-time summary indicating the test
execution progress, but also a per-file list of tests at the end of every test
file.

This package provides a `SummaryReporter` that skips the per-file output, but
still prints the real-time summary and details for any failed test.

```js
// vitest.config.js
import { SummaryReporter } from '@hypothesis/frontend-testing/vitest';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    browser: {
      provider: 'playwright',
      // ...
    },

    // Set the summary reporter here. You can define more reporters if desired
    reporters: [new SummaryReporter()],

    // Other config...
  },
});
```
