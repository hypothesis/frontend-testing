import { run } from 'axe-core';
import type { Result } from 'axe-core';
import { ReactWrapper, mount } from 'enzyme';
import { isValidElement } from 'preact';
import type { VNode } from 'preact';

export type Scenario = {
  /** A descriptive name for the scenario. Defaults to "default". */
  name?: string;

  /**
   * A function that returns the rendered output to test, or an Enzyme wrapper
   * created using Enzyme's `mount` function.
   *
   * Returning a VNode is preferred. An Enzyme wrapper for a component with a
   * top-level Fragment will result in the test being run for the first DOM
   * child node only.
   * Use the Enzyme wrapper only if really needed, and consider wrapping your
   * component with a `<div />` in that case.
   */
  content: () => VNode | ReactWrapper;

  /**
   * This callback will be applied to all found accessibility violations,
   * allowing you to ignore those that are not relevant for your test.
   * A use case for this is any combination that axe-core considers invalid
   * because certain screen readers won't play well, but their use is marginal.
   */
  shouldIgnoreViolation?: (violation: Result) => boolean;
};

async function testScenario(
  elementOrWrapper: VNode | ReactWrapper,
  { shouldIgnoreViolation }: Pick<Scenario, 'shouldIgnoreViolation'>,
) {
  const container = document.createElement('div');
  document.body.appendChild(container);

  let wrapper;
  if (elementOrWrapper instanceof ReactWrapper) {
    wrapper = elementOrWrapper;
    container.appendChild(elementOrWrapper.getDOMNode());
  } else {
    wrapper = mount(elementOrWrapper, { attachTo: container });
  }

  const results = await run(container, {
    // Run checks that correspond to the WCAG AA and Section 508 compliance
    // criteria. These are the standards that we have committed to customers to
    // meet.
    runOnly: { type: 'tag', values: ['section508', 'wcag2a', 'wcag2aa'] },

    // Only check for definite failures. The other possible non-pass outcomes for a
    // given check are "incomplete" (couldn't determine status automatically)
    // or "inapplicable" (no relevant HTML elements found).
    resultTypes: ['violations'],
  });

  let violations = results.violations;
  if (shouldIgnoreViolation) {
    violations = violations.filter(v => !shouldIgnoreViolation(v));
  }

  wrapper.unmount();
  container.remove();

  return violations;
}

function asArray<T>(itemOrList: T | T[]): T[] {
  return Array.isArray(itemOrList) ? itemOrList : [itemOrList];
}

/**
 * Generate an accessibility test function for a component.
 *
 * The returned function should be passed as the callback argument to an `it`
 * call in a Mocha test (eg. `it("should pass a11y checks", checkAccessibility(...))`).
 *
 * An accessibility test consists of an array of scenarios describing typical
 * states of the component.
 */
export function checkAccessibility(
  scenarios: Scenario | Scenario[],
): () => Promise<void> {
  return async () => {
    for (const { name = 'default', content, shouldIgnoreViolation } of asArray(
      scenarios,
    )) {
      if (typeof content !== 'function') {
        throw new Error(
          `"content" key for accessibility scenario "${name}" should be a function but is a ${typeof content}`,
        );
      }

      const elementOrWrapper = content();

      if (
        !(elementOrWrapper instanceof ReactWrapper) &&
        !isValidElement(elementOrWrapper)
      ) {
        throw new Error(
          `Expected "content" function for scenario "${name}" to return a Preact element or an Enzyme wrapper`,
        );
      }

      const violations = await testScenario(elementOrWrapper, {
        shouldIgnoreViolation,
      });
      for (const violation of violations) {
        console.error('axe-core violation', JSON.stringify(violation, null, 2));
      }
      if (violations.length > 0) {
        throw new Error(`Scenario "${name}" has accessibility violations`);
      }
    }
  };
}
