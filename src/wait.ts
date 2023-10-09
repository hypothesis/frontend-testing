export type TestTimeout = {
  /**
   * If a wait takes longer than `warnTimeout`, a warning will be logged about
   * a slow wait, contributing to longer test execution times, but the wait
   * will not fail.
   */
  warnTimeout: number;

  /**
   * If a wait takes longer than `failTimeout`, the wait will fail.
   */
  failTimeout: number;
};

/**
 * Specifies how long to wait for a condition before triggering a timeout.
 *
 * If this is a number, it specifies a timeout before the test fails in
 * milliseconds.
 */
export type TimeoutSpec = Partial<TestTimeout> | number;

function resolveTimeout(val: TimeoutSpec): TestTimeout {
  if (typeof val === 'number') {
    return { warnTimeout: val, failTimeout: val };
  }

  // The default timeouts are set to warn early for slow waits, as these lead
  // to slow test execution, but try to avoid failures if eg. waits are slow
  // because the system is under load.
  const { warnTimeout = 20, failTimeout = 1000 } = val;

  return {
    warnTimeout,
    failTimeout,
  };
}

/**
 * Wait for a condition to evaluate to a truthy value.
 *
 * @return The result of the first call to `condition` which returns non-null
 */
export async function waitFor<T>(
  condition: () => T,
  timeout: TimeoutSpec = {},
  what = condition.toString(),
): Promise<NonNullable<T>> {
  const result = condition();
  if (result) {
    return result;
  }

  const { failTimeout, warnTimeout } = resolveTimeout(timeout);

  const start = Date.now();

  return new Promise((resolve, reject) => {
    let warned = false;

    const timer = setInterval(() => {
      const result = condition();
      if (result) {
        clearTimeout(timer);
        resolve(result);
      }

      const now = Date.now();

      if (now - start > warnTimeout && !warned) {
        warned = true;
        console.warn(`Slow "waitFor(${what})" took > ${warnTimeout}ms`);
      }

      if (now - start > failTimeout) {
        clearTimeout(timer);
        reject(new Error(`waitFor(${what}) failed after ${failTimeout} ms`));
      }
    });
  });
}

// Minimal Enzyme types needed by `waitForElement`.

// eslint-disable-next-line no-use-before-define
type Predicate = (wrapper: EnzymeWrapper) => boolean;

type EnzymeWrapper = {
  length: number;
  update(): void;
  find(query: string | Predicate): EnzymeWrapper;
};

/**
 * Wait up to `timeout` ms for an element to be rendered.
 *
 * @param selector - Selector string or function to pass to `wrapper.find`
 */
export function waitForElement(
  wrapper: EnzymeWrapper,
  selector: string | Predicate,
  timeout?: TimeoutSpec,
): Promise<EnzymeWrapper> {
  return waitFor(
    () => {
      wrapper.update();
      const el = wrapper.find(selector);
      if (el.length === 0) {
        return null;
      }
      return el;
    },
    timeout,
    `"${selector}" to render`,
  );
}

export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
